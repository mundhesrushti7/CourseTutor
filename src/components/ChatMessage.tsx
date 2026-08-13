import React from 'react';
import { User, Bot, AlertTriangle, RefreshCw, HelpCircle } from 'lucide-react';
import { Message, Citation, UnderstandingSelection, ConceptState } from '../types';
import { stateToUnderstanding } from '../lib/concepts';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CitationCard } from './CitationCard';
import { UnderstandingCheckRow } from './UnderstandingCheckRow';

interface ChatMessageProps {
  message: Message;
  onCitationClick: (citation: Citation) => void;
  onRetry?: () => void;
  conceptIds?: string[];
  onUnderstandingSelect?: (selection: UnderstandingSelection, conceptIds: string[]) => void;
  getState?: (id: string) => ConceptState;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onCitationClick,
  onRetry,
  conceptIds,
  onUnderstandingSelect,
  getState,
}) => {
  const isUser = message.role === 'user';
  const isThinking = message.isStreaming && !message.content;
  const isRefusal = message.isRefusal || message.content.toLowerCase().includes('could not find that in the course materials') || message.content.toLowerCase().includes("don't have access");

  const primaryConceptId = conceptIds && conceptIds.length > 0 ? conceptIds[0] : undefined;
  const selectedUnderstanding = getState && primaryConceptId ? stateToUnderstanding(getState(primaryConceptId)) : null;

  if (isUser) {
    return (
      <div className="flex gap-3 justify-end my-4 animate-fade-in">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-app-user-bg text-app-user-text px-4 py-3 shadow-sm border border-app-user-border">
          <p className="text-sm font-sans leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <span className="block mt-1 text-[10px] text-app-user-text/70 text-right">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-app-surface-subtle border border-app-border flex items-center justify-center text-app-text-secondary shrink-0 shadow-sm text-xs font-semibold">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-start my-5 animate-fade-in">
      {/* Tutor Avatar */}
      <div className="w-8 h-8 rounded-full bg-app-accent flex items-center justify-center text-white shrink-0 shadow-sm text-xs font-bold">
        <Bot className="w-4.5 h-4.5" />
      </div>

      <div className="max-w-[90%] sm:max-w-[82%] space-y-3">
        {/* Tutor Bubble */}
        <div
          className={`rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm border transition-all ${
            message.isError
              ? 'bg-amber-500/10 border-amber-500/30 text-app-text'
              : isRefusal
              ? 'bg-app-surface-subtle border-app-border text-app-text'
              : 'bg-app-tutor-bg border-app-tutor-border text-app-tutor-text'
          }`}
        >
          {/* Refusal / Scope Limitation Badge */}
          {isRefusal && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-app-text-muted mb-2 pb-1.5 border-b border-app-border">
              <HelpCircle className="w-3.5 h-3.5 text-app-text-muted" />
              <span>Out of Course Scope</span>
            </div>
          )}

          {/* Thinking State */}
          {isThinking ? (
            <div className="flex items-center gap-3 py-1 text-app-text-secondary text-sm animate-calm-pulse">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-app-accent animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-app-accent animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-app-accent animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="text-xs font-medium text-app-text-muted">Reviewing lecture materials...</span>
            </div>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}

          {/* Streaming Cursor Indicator */}
          {message.isStreaming && message.content && (
            <span className="inline-block w-2 h-4 ml-1 bg-app-accent animate-pulse align-middle" />
          )}

          {/* Error Banner with Try Again */}
          {message.isError && (
            <div className="mt-3 pt-3 border-t border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{message.errorMessage || 'The connection to the tutor was lost.'}</span>
              </div>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try again</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Citations section */}
        {message.citations && message.citations.length > 0 && !isThinking && (
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-[11px] font-semibold text-app-text-muted uppercase tracking-wider">Sources:</span>
            {message.citations.map((citation, index) => (
              <CitationCard
                key={`${citation.lecture}-${citation.slide}-${index}`}
                citation={citation}
                onClick={onCitationClick}
              />
            ))}
          </div>
        )}

        {!isUser &&
          !message.isStreaming &&
          message.citations &&
          message.citations.length > 0 &&
          conceptIds &&
          conceptIds.length > 0 &&
          onUnderstandingSelect && (
            <UnderstandingCheckRow
              messageId={message.id}
              conceptCount={conceptIds.length}
              selected={selectedUnderstanding}
              onSelect={(sel) => onUnderstandingSelect(sel, conceptIds)}
            />
          )}
      </div>
    </div>
  );
};
