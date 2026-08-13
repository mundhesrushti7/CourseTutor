import React, { useState, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string, scenarioId?: string) => void;
  isStreaming: boolean;
  onCancelStream: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onCancelStream,
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="shrink-0 bg-app-bg border-t border-app-border px-4 sm:px-6 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-4 z-10 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="relative flex-1 bg-app-input-bg rounded-xl border border-app-input-border focus-within:border-app-accent focus-within:ring-2 focus-within:ring-app-accent/20 shadow-sm transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about CS 4780 lectures..."
              rows={1}
              disabled={isStreaming}
              className="w-full resize-none bg-transparent px-4 py-3 text-sm text-app-text placeholder:text-app-text-muted focus:outline-none disabled:opacity-50 min-h-[44px] max-h-32"
              aria-label="Message input"
            />
          </div>

          {isStreaming ? (
            <button
              type="button"
              onClick={onCancelStream}
              className="inline-flex items-center justify-center gap-1.5 px-4 h-[44px] rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-medium text-xs transition-colors shadow-sm shrink-0 focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer"
              aria-label="Stop generating response"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="inline-flex items-center justify-center w-[44px] h-[44px] rounded-xl bg-app-accent hover:opacity-90 disabled:bg-app-border text-white transition-colors shadow-sm shrink-0 focus:outline-none focus:ring-2 focus:ring-app-accent/40 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
