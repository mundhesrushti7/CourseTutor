import React from 'react';
import { UnderstandingSelection } from '../types';

interface UnderstandingCheckRowProps {
  messageId: string;
  conceptCount: number;
  selected?: UnderstandingSelection | null;
  onSelect: (selection: UnderstandingSelection) => void;
}

type OptionDef = {
  key: UnderstandingSelection;
  label: string;
  dot: string;
  ring: string;
  activeBg: string;
  activeText: string;
  activeBorder: string;
};

const OPTIONS: OptionDef[] = [
  {
    key: 'got_it',
    label: 'Got it',
    dot: '🟢',
    ring: 'focus:ring-concept-confident/40',
    activeBg: 'bg-concept-confident-bg',
    activeText: 'text-concept-confident',
    activeBorder: 'border-concept-confident',
  },
  {
    key: 'sort_of',
    label: 'Sort of',
    dot: '🔵',
    ring: 'focus:ring-concept-learning/40',
    activeBg: 'bg-concept-learning-bg',
    activeText: 'text-concept-learning',
    activeBorder: 'border-concept-learning',
  },
  {
    key: 'still_fuzzy',
    label: 'Still fuzzy',
    dot: '🔴',
    ring: 'focus:ring-concept-needs-revision/40',
    activeBg: 'bg-concept-needs-revision-bg',
    activeText: 'text-concept-needs-revision',
    activeBorder: 'border-concept-needs-revision',
  },
];

export const UnderstandingCheckRow: React.FC<UnderstandingCheckRowProps> = ({
  messageId,
  conceptCount,
  selected = null,
  onSelect,
}) => {
  const keyPrefix = `uc-${messageId}`;

  const handle = (sel: UnderstandingSelection) => {
    onSelect(sel);
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-2.5 pt-3 mt-1 border-t border-app-border/60">
      <div className="flex items-center gap-1.5 text-[11px] text-app-text-muted">
        <span className="font-medium">How well did that land?</span>
        <span className="font-mono text-[10px] text-app-text-muted/80 bg-app-surface-subtle border border-app-border rounded px-1.5 py-px">
          {conceptCount} concept{conceptCount === 1 ? '' : 's'}
        </span>
      </div>
      <div
        role="radiogroup"
        aria-label="Rate your understanding"
        className="inline-flex rounded-xl p-1 bg-app-surface-subtle border border-app-border shadow-sm"
      >
        {OPTIONS.map((opt) => {
          const active = selected === opt.key;
          return (
            <button
              key={keyPrefix + opt.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => handle(opt.key)}
              className={[
                'group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
                'focus:outline-none focus:ring-2',
                opt.ring,
                active
                  ? `${opt.activeBg} ${opt.activeText} ${opt.activeBorder} border shadow-sm scale-[1.02]`
                  : 'text-app-text-secondary border border-transparent hover:text-app-text hover:bg-app-surface',
              ].join(' ')}
            >
              <span
                className={[
                  'inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold border transition-colors',
                  active ? `${opt.activeBg} ${opt.activeBorder}` : 'border-app-border bg-app-surface',
                ].join(' ')}
              >
                {active ? '✓' : opt.dot}
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
