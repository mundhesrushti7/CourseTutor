import React, { useState, useEffect, useRef } from 'react';
import initialConvData from '../conversation.json';
import emptyConvData from '../conversation-empty.json';
import { Conversation, Message, Citation, UnderstandingSelection, Concept } from './types';
import { matchScenario, streamTutorResponse } from './lib/mockStreamBridge';
import { useTheme } from './hooks/useTheme';
import { useConceptKnowledge } from './hooks/useConceptKnowledge';
import { citationsToConceptIds } from './lib/concepts';
import { Header, AppView } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { SlidePreviewModal } from './components/SlidePreviewModal';
import { KnowledgeView } from './components/KnowledgeView';

const STORAGE_KEY = 'tutor_conversation_v1';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const { getState, setState, applyUnderstanding } = useConceptKnowledge();
  const [view, setView] = useState<AppView>('chat');
  const [conversation, setConversation] = useState<Conversation>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse localStorage conversation', e);
    }
    return initialConvData as Conversation;
  });

  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  // Persist conversation to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversation));
    } catch (e) {
      console.error('Failed to save conversation to localStorage', e);
    }
  }, [conversation]);

  // Auto-scroll to bottom on new messages or streaming updates (chat view only)
  const scrollToBottom = () => {
    if (view === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, isStreaming]);

  // When switching to Knowledge view, scroll to the top (so highest-priority states
  // like Needs Revision are immediately visible instead of being buried under scroll
  // inherited from the chat view).
  useEffect(() => {
    if (view === 'knowledge' && mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [view]);

  const handleResetSample = () => {
    if (isStreaming) handleCancelStream();
    setConversation(initialConvData as Conversation);
  };

  const handleResetEmpty = () => {
    if (isStreaming) handleCancelStream();
    setConversation(emptyConvData as Conversation);
  };

  const handleCancelStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    // Update the last message to mark streaming as complete
    setConversation((prev) => {
      const messages = [...prev.messages];
      if (messages.length > 0 && messages[messages.length - 1].isStreaming) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          isStreaming: false,
        };
      }
      return { ...prev, messages };
    });
  };

  const executeStream = async (userPrompt: string, targetAssistantMessageId?: string, forcedScenarioId?: string) => {
    const scenario = matchScenario(userPrompt, forcedScenarioId);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsStreaming(true);

    let assistantMsgId = targetAssistantMessageId;

    if (!assistantMsgId) {
      const userMsg: Message = {
        id: `m_${Date.now()}_u`,
        role: 'user',
        created_at: new Date().toISOString(),
        content: userPrompt,
      };

      assistantMsgId = `m_${Date.now()}_a`;
      const placeholderAssistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        created_at: new Date().toISOString(),
        content: '',
        isStreaming: true,
      };

      setConversation((prev) => ({
        ...prev,
        started_at: prev.started_at || new Date().toISOString(),
        messages: [...prev.messages, userMsg, placeholderAssistantMsg],
      }));
    } else {
      // Reset existing assistant message for retry
      setConversation((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: '', isStreaming: true, isError: false, errorMessage: undefined }
            : m
        ),
      }));
    }

    try {
      const generator = streamTutorResponse(scenario.id, {
        signal: controller.signal,
      });

      for await (const chunk of generator) {
        if (controller.signal.aborted) break;

        setConversation((prev) => ({
          ...prev,
          messages: prev.messages.map((m) =>
            m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m
          ),
        }));
      }

      // Streaming complete without thrown error
      setConversation((prev) => ({
        ...prev,
        messages: prev.messages.map((m) => {
          if (m.id === assistantMsgId) {
            const isRefusal = scenario.id === 'refusal';
            return {
              ...m,
              isStreaming: false,
              citations: scenario.citations || [],
              isRefusal,
            };
          }
          return m;
        }),
      }));
    } catch (err: any) {
      if (controller.signal.aborted) return;

      console.warn('Stream failed or was interrupted:', err);

      // Preserve partial content & set inline error
      setConversation((prev) => ({
        ...prev,
        messages: prev.messages.map((m) => {
          if (m.id === assistantMsgId) {
            return {
              ...m,
              isStreaming: false,
              isError: true,
              errorMessage: err?.message || 'The connection to the tutor was lost.',
              citations: scenario.citations || [],
            };
          }
          return m;
        }),
      }));
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleSendMessage = (text: string, scenarioId?: string) => {
    executeStream(text, undefined, scenarioId);
  };

  const handleRetry = (assistantMsgId: string) => {
    const msgIndex = conversation.messages.findIndex((m) => m.id === assistantMsgId);
    if (msgIndex > 0 && conversation.messages[msgIndex - 1].role === 'user') {
      const userPrompt = conversation.messages[msgIndex - 1].content;
      executeStream(userPrompt, assistantMsgId);
    }
  };

  const handleUnderstandingSelect = (selection: UnderstandingSelection, conceptIds: string[]) => {
    applyUnderstanding(conceptIds, selection);
  };

  const handleAskTutorAbout = (concept: Concept) => {
    setView('chat');
    setTimeout(() => {
      handleSendMessage(concept.promptQuestion);
    }, 50);
  };

  return (
    <div className="h-dvh flex flex-col bg-app-bg text-app-text font-sans transition-colors duration-200 overflow-x-hidden">
      {/* Navbar Header */}
      <Header
        course={conversation.course}
        student={conversation.student}
        onResetSample={handleResetSample}
        onResetEmpty={handleResetEmpty}
        messageCount={conversation.messages.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        view={view}
        onChangeView={setView}
      />

      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col">
        {view === 'chat' ? (
          conversation.messages.length === 0 ? (
            <EmptyState onSelectPrompt={handleSendMessage} />
          ) : (
            <div className="space-y-4 pb-4">
              {/* Message List */}
              {conversation.messages.map((msg) => {
                const conceptIds = citationsToConceptIds(msg.citations);
                return (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onCitationClick={(cit) => setActiveCitation(cit)}
                    onRetry={() => handleRetry(msg.id)}
                    conceptIds={conceptIds}
                    onUnderstandingSelect={handleUnderstandingSelect}
                    getState={getState}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )
        ) : (
          <KnowledgeView
            getState={getState}
            setState={setState}
            onAskTutor={handleAskTutorAbout}
          />
        )}
      </main>

      {/* Slide Preview Modal */}
      <SlidePreviewModal
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />

      {/* Input Dock — only visible in chat view */}
      {view === 'chat' && (
        <ChatInput
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          onCancelStream={handleCancelStream}
        />
      )}
    </div>
  );
}

export default App;
