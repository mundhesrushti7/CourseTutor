import React, { useState, useMemo } from 'react';
import { BookOpen, X, MessageCircle, GraduationCap, TrendingDown, Brain, HelpCircle } from 'lucide-react';
import { Concept, ConceptState, UnderstandingSelection } from '../types';
import { ALL_CONCEPTS, understandingToState } from '../lib/concepts';

type KnowledgeViewProps = {
  getState: (id: string) => ConceptState;
  setState: (id: string, state: ConceptState) => void;
  onAskTutor: (concept: Concept) => void;
};

const STATE_META: Record<ConceptState, { label: string; color: string; bg: string; border: string; dot: string }> = {
  needs_revision: {
    label: 'Needs Revision',
    color: 'text-concept-needs-revision',
    bg: 'bg-concept-needs-revision-bg',
    border: 'border-concept-needs-revision',
    dot: '🔴',
  },
  learning: {
    label: 'Learning',
    color: 'text-concept-learning',
    bg: 'bg-concept-learning-bg',
    border: 'border-concept-learning',
    dot: '🔵',
  },
  confident: {
    label: 'Confident',
    color: 'text-concept-confident',
    bg: 'bg-concept-confident-bg',
    border: 'border-concept-confident',
    dot: '🟢',
  },
  unexplored: {
    label: 'Not Explored',
    color: 'text-concept-unexplored',
    bg: 'bg-concept-unexplored-bg',
    border: 'border-concept-unexplored',
    dot: '⚪',
  },
};

/**
 * STATE ORDER:
 *  - Desktop grid is simple 2/3-col responsive grid, cards look like pills with
 *    the state color on the background.
 *  - Mobile list is grouped & SORTED: Needs Revision first, then Learning,
 *    then Confident, then Not Explored (so the user's problem areas are always
 *    at the very top on a phone).
 */
const SORT_ORDER: ConceptState[] = ['needs_revision', 'learning', 'confident', 'unexplored'];

function ConceptCard({
  concept,
  state,
  onOpen,
}: {
  concept: Concept;
  state: ConceptState;
  onOpen: () => void;
}) {
  const meta = STATE_META[state];
  return (
    <button
      type="button"
      onClick={onOpen}
      className={[
        'group w-full text-left rounded-xl border px-3.5 py-3 transition-all cursor-pointer',
        'hover:shadow-md hover:-translate-y-0.5 hover:border-app-accent',
        'flex flex-col justify-between min-h-[96px]',
        meta.bg,
        meta.border,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-xs font-bold text-app-text leading-snug line-clamp-2 group-hover:text-app-accent transition-colors">
          {concept.name}
        </h3>
        <span
          className={[
            'shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border',
            meta.border,
            'bg-white/70 dark:bg-slate-900/60',
          ].join(' ')}
          title={meta.label}
        >
          {meta.dot}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] font-mono text-app-text-muted/90 bg-app-surface/80 dark:bg-black/20 border border-app-border rounded px-1.5 py-px">
          W{concept.lectureWeek} · S{concept.slideNumber}
        </span>
        <span className={['text-[10px] font-semibold uppercase tracking-wider', meta.color].join(' ')}>
          {meta.label}
        </span>
      </div>
    </button>
  );
}

function StateLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-app-text-muted">
      <span className="font-medium">Legend:</span>
      {(['needs_revision', 'learning', 'confident', 'unexplored'] as ConceptState[]).map((st) => {
        const m = STATE_META[st];
        return (
          <div
            key={st}
            className={['inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border', m.bg, m.border].join(' ')}
          >
            <span className="text-[10px]">{m.dot}</span>
            <span className={['font-semibold text-[10px]', m.color].join(' ')}>{m.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatsHeader({ counts }: { counts: Record<ConceptState, number> }) {
  const total = counts.needs_revision + counts.learning + counts.confident + counts.unexplored;
  const touched = counts.needs_revision + counts.learning + counts.confident;
  const pct = total === 0 ? 0 : Math.round((touched / total) * 100);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-app-border">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-app-accent-bg text-app-accent border border-app-accent-border">
          <Brain className="w-4.5 h-4.5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-app-text tracking-tight">Concept Knowledge Map</h2>
          <p className="text-[11px] text-app-text-muted">
            {touched} of {total} concepts assessed · <span className="font-semibold text-app-accent">{pct}%</span> explored
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
        <span className="px-2 py-1 rounded-lg bg-concept-confident-bg text-concept-confident border border-concept-confident font-semibold">
          {counts.confident} 🟢
        </span>
        <span className="px-2 py-1 rounded-lg bg-concept-learning-bg text-concept-learning border border-concept-learning font-semibold">
          {counts.learning} 🔵
        </span>
        <span className="px-2 py-1 rounded-lg bg-concept-needs-revision-bg text-concept-needs-revision border border-concept-needs-revision font-semibold">
          {counts.needs_revision} 🔴
        </span>
        <span className="px-2 py-1 rounded-lg bg-concept-unexplored-bg text-concept-unexplored border border-concept-unexplored font-semibold">
          {counts.unexplored} ⚪
        </span>
      </div>
    </div>
  );
}

function WeekGroupHeader({ week, title }: { week: number; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-2 mt-4 first:mt-0">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-app-accent text-white text-xs font-bold shrink-0 shadow-sm">
        {week}
      </span>
      <div>
        <h3 className="text-sm font-bold text-app-text leading-none">Week {week}</h3>
        <p className="text-[11px] text-app-text-muted mt-0.5">{title}</p>
      </div>
    </div>
  );
}

function ConceptDetailPanel({
  concept,
  state,
  onClose,
  onSetState,
  onAsk,
}: {
  concept: Concept;
  state: ConceptState;
  onClose: () => void;
  onSetState: (next: ConceptState) => void;
  onAsk: () => void;
}) {
  const meta = STATE_META[state];

  const setFromCheck = (sel: UnderstandingSelection) => {
    onSetState(understandingToState(sel));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="concept-detail-title"
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-app-surface p-6 shadow-2xl border border-app-border transition-colors duration-200 text-app-text"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={['p-2 rounded-xl border', meta.bg, meta.border].join(' ')}>
              <GraduationCap className={['w-5 h-5', meta.color].join(' ')} />
            </div>
            <div>
              <span className={['inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border', meta.bg, meta.color, meta.border].join(' ')}>
                <span>{meta.dot}</span>
                {meta.label}
              </span>
              <h2 id="concept-detail-title" className="mt-1 text-base font-bold text-app-text leading-snug">
                {concept.name}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-app-text-muted hover:text-app-text hover:bg-app-surface-subtle transition-colors cursor-pointer"
            aria-label="Close concept detail"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px]">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-app-accent-bg text-app-accent-text border border-app-accent-border font-mono font-semibold">
            <BookOpen className="w-3 h-3" />
            Week {concept.lectureWeek} · {concept.lectureTitle}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-app-surface-subtle text-app-text-secondary border border-app-border font-mono">
            Slide {concept.slideNumber}
          </span>
        </div>

        <div className="rounded-xl border border-app-border bg-app-surface-subtle p-4 mb-4">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-app-text-muted mb-2.5">
            Update your understanding
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { sel: 'still_fuzzy' as UnderstandingSelection, label: 'Still fuzzy', dot: '🔴', target: 'needs_revision' as ConceptState },
              { sel: 'sort_of' as UnderstandingSelection, label: 'Sort of get it', dot: '🔵', target: 'learning' as ConceptState },
              { sel: 'got_it' as UnderstandingSelection, label: 'Got it cold', dot: '🟢', target: 'confident' as ConceptState },
            ].map((opt) => {
              const targetMeta = STATE_META[opt.target];
              const active = state === opt.target;
              return (
                <button
                  key={opt.sel}
                  type="button"
                  onClick={() => setFromCheck(opt.sel)}
                  className={[
                    'flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-[11px] font-semibold border transition-all cursor-pointer',
                    active
                      ? `${targetMeta.bg} ${targetMeta.border} ${targetMeta.color} shadow-sm scale-[1.02]`
                      : 'bg-app-surface border-app-border text-app-text-secondary hover:text-app-text hover:border-app-accent/60 hover:bg-app-surface hover:shadow-sm',
                  ].join(' ')}
                >
                  <span className="text-base leading-none">{opt.dot}</span>
                  <span className="leading-tight">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 mb-5">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-[11px] uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tutor question</span>
          </div>
          <p className="text-xs text-app-text-secondary leading-relaxed italic">
            "{concept.promptQuestion}"
          </p>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-app-text-secondary bg-app-surface-subtle hover:bg-app-border rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onAsk}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-app-accent hover:opacity-90 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Ask tutor again</span>
            <TrendingDown className="w-3 h-3 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({ getState, setState, onAskTutor }) => {
  const [openConceptId, setOpenConceptId] = useState<string | null>(null);

  const { counts, groupedByState } = useMemo(() => {
    const counts: Record<ConceptState, number> = {
      confident: 0, learning: 0, needs_revision: 0, unexplored: 0,
    };
    const byState = new Map<ConceptState, { c: Concept; s: ConceptState }[]>();
    for (const st of SORT_ORDER) byState.set(st, []);
    for (const c of ALL_CONCEPTS) {
      const s = getState(c.id);
      counts[s] += 1;
      byState.get(s)!.push({ c, s });
    }
    // Within each state group, sort by week then slide so concepts stay in a natural course order
    for (const bucket of byState.values()) {
      bucket.sort((a, b) => (a.c.lectureWeek - b.c.lectureWeek) || (a.c.slideNumber - b.c.slideNumber));
    }
    return { counts, groupedByState: byState };
  }, [getState]);

  const openConcept = openConceptId ? ALL_CONCEPTS.find((c) => c.id === openConceptId) ?? null : null;
  const openState: ConceptState = openConcept ? getState(openConcept.id) : 'unexplored';

  return (
    <div className="animate-fade-in">
      <StatsHeader counts={counts} />
      <div className="pb-3 mb-3">
        <StateLegend />
      </div>

      {/* Desktop: grouped by STATE PRIORITY (Needs Revision first, highest-priority on top),
          cards laid out in a responsive 2/3-col grid within each group. */}
      <div className="hidden md:block">
        {SORT_ORDER.map((st) => {
          const items = groupedByState.get(st) ?? [];
          if (items.length === 0) return null;
          const meta = STATE_META[st];
          return (
            <section key={st} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between gap-3 pt-1 pb-2 mb-3 border-b border-app-border">
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      'inline-flex items-center justify-center w-7 h-7 rounded-lg border shadow-sm',
                      meta.bg,
                      meta.border,
                    ].join(' ')}
                  >
                    <span>{meta.dot}</span>
                  </span>
                  <div>
                    <h3 className={['text-sm font-bold leading-none', meta.color].join(' ')}>
                      {meta.label}
                    </h3>
                    <p className="text-[11px] text-app-text-muted mt-0.5">
                      Focus on these first · {items.length} concept{items.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-app-text-muted bg-app-surface-subtle border border-app-border rounded-lg px-2 py-1">
                  {items.length}
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map(({ c, s }) => (
                  <ConceptCard key={c.id} concept={c} state={s} onOpen={() => setOpenConceptId(c.id)} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Mobile: single grouped sorted list, problem areas first */}
      <div className="md:hidden">
        {SORT_ORDER.map((st) => {
          const items = groupedByState.get(st) ?? [];
          if (items.length === 0) return null;
          const meta = STATE_META[st];
          return (
            <section key={st} className="mb-4">
              <div
                className={[
                  'sticky top-0 z-10 backdrop-blur-md bg-app-bg/90 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-2 flex items-center justify-between border-b border-app-border',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{meta.dot}</span>
                  <h3 className={['text-xs font-bold uppercase tracking-wider', meta.color].join(' ')}>
                    {meta.label}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-app-text-muted bg-app-surface-subtle border border-app-border rounded px-1.5 py-px">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.map(({ c, s }) => (
                  <ConceptCard key={c.id} concept={c} state={s} onOpen={() => setOpenConceptId(c.id)} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {openConcept && (
        <ConceptDetailPanel
          concept={openConcept}
          state={openState}
          onClose={() => setOpenConceptId(null)}
          onSetState={(next) => setState(openConcept.id, next)}
          onAsk={() => {
            setOpenConceptId(null);
            onAskTutor(openConcept);
          }}
        />
      )}
    </div>
  );
};
