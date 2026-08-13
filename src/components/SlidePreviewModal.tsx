import React, { useEffect } from 'react';
import { X, BookOpen, MessageSquareText, Image as ImageIcon } from 'lucide-react';
import { Citation } from '../types';
import { findSlideByCitation } from '../lib/lectureData';
import { MarkdownRenderer } from './MarkdownRenderer';

interface SlidePreviewModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const SlidePreviewModal: React.FC<SlidePreviewModalProps> = ({ citation, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!citation) return null;

  const result = findSlideByCitation(citation);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="slide-preview-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl bg-app-surface p-6 shadow-2xl border border-app-border transition-colors duration-200 text-app-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-app-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-app-accent-bg text-app-accent">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-app-accent">
                {result ? `Week ${result.deck.week} · Slide ${result.slide.slide_number}` : `Slide ${citation.slide}`}
              </span>
              <h2 id="slide-preview-title" className="text-base font-semibold text-app-text leading-snug">
                {result ? result.deck.title : citation.lecture}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-app-text-muted hover:text-app-text hover:bg-app-surface-subtle transition-colors"
            aria-label="Close slide preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Content */}
        {result ? (
          <div className="space-y-5 text-sm">
            {/* Slide Title */}
            <div>
              <h3 className="text-lg font-bold text-app-text border-l-4 border-app-accent pl-3 py-0.5">
                {result.slide.title}
              </h3>
            </div>

            {/* Bullets */}
            {result.slide.bullets && result.slide.bullets.length > 0 && (
              <div className="bg-app-surface-subtle p-4 rounded-lg border border-app-border">
                <h4 className="text-xs font-semibold uppercase text-app-text-muted tracking-wider mb-2.5">Slide Content</h4>
                <ul className="space-y-2 list-disc list-inside text-app-text-secondary leading-relaxed">
                  {result.slide.bullets.map((bullet, idx) => (
                    <li key={idx} className="pl-1">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formulas */}
            {result.slide.formulas && result.slide.formulas.length > 0 && (
              <div className="bg-app-code-bg text-app-code-text p-4 rounded-lg border border-app-code-border shadow-inner">
                <h4 className="text-xs font-semibold uppercase text-app-code-text opacity-70 tracking-wider mb-2">Formulas</h4>
                <div className="space-y-2">
                  {result.slide.formulas.map((form, idx) => (
                    <div key={idx} className="bg-black/25 p-2.5 rounded text-center text-sm overflow-x-auto border border-app-code-border/60 text-app-code-text">
                      <MarkdownRenderer content={`$$${form}$$`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Figure */}
            {result.slide.figure && (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                <div className="flex items-center gap-2 mb-1.5 font-medium text-xs uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Slide Diagram / Figure</span>
                </div>
                <p className="text-xs leading-relaxed italic">
                  {result.slide.figure.description}
                </p>
              </div>
            )}

            {/* Professor Speaker Notes */}
            {result.slide.notes && (
              <div className="p-4 rounded-lg bg-app-accent-bg/70 border border-app-accent-border">
                <div className="flex items-center gap-2 mb-1.5 text-app-accent-text font-semibold text-xs uppercase tracking-wider">
                  <MessageSquareText className="w-4 h-4 text-app-accent" />
                  <span>Professor's Speaker Notes</span>
                </div>
                <p className="text-xs text-app-text-secondary leading-relaxed italic">
                  "{result.slide.notes}"
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-app-text-muted">
            <p>Slide content not found for {citation.lecture}, slide {citation.slide}.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-app-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-app-text-secondary bg-app-surface-subtle hover:bg-app-border rounded-lg transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
