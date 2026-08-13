import React from 'react';
import { GraduationCap, RotateCcw, FileText, User, Sun, Moon, Brain, MessageSquare } from 'lucide-react';
import { Course, Student } from '../types';
import { Theme } from '../hooks/useTheme';
import { EXAM_DATE } from '../lib/concepts';

export type AppView = 'chat' | 'knowledge';

function getDaysUntilExam(examDate: Date): number {
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = examDate.getTime() - now.getTime();
  return Math.ceil(diff / msPerDay);
}

export function ExamCountdownBadge() {
  const days = getDaysUntilExam(EXAM_DATE);
  const isClose = days >= 0 && days <= 5;

  let label: string;
  if (days <= 0) {
    label = 'Exam today';
  } else if (days === 1) {
    label = 'Exam tomorrow';
  } else {
    label = `Exam in ${days} days`;
  }

  const gradientClass = isClose
    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-500 dark:via-indigo-500 dark:to-violet-500'
    : 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 dark:from-sky-400 dark:via-blue-500 dark:to-indigo-500';

  return (
    <span
      className={[
        'shrink-0 inline-flex items-center justify-center h-fit w-fit whitespace-nowrap overflow-visible',
        'px-3 py-1.5 rounded-full font-mono text-[11px] font-bold tracking-wide',
        'text-white',
        'border border-white/20 shadow-sm',
        gradientClass,
      ].join(' ')}
      title={`Exam date: ${EXAM_DATE.toLocaleDateString()}`}
    >
      {label}
    </span>
  );
}

interface HeaderProps {
  course: Course;
  student: Student;
  onResetSample: () => void;
  onResetEmpty: () => void;
  messageCount: number;
  theme: Theme;
  onToggleTheme: () => void;
  view: AppView;
  onChangeView: (view: AppView) => void;
}

export const Header: React.FC<HeaderProps> = ({
  course,
  student,
  onResetSample,
  onResetEmpty,
  messageCount,
  theme,
  onToggleTheme,
  view,
  onChangeView,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-app-header text-app-text border-b border-app-header-border shadow-sm transition-colors duration-200 overflow-x-hidden">
      <div className="w-full max-w-4xl mx-auto px-4 py-3 space-y-3">
        {/* ── Top row: wraps on mobile so nothing overflows ── */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">

          {/* LEFT: Logo + course info — shrinks via min-w-0 + truncate */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-app-accent text-white flex items-center justify-center shadow-inner font-bold text-sm shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>

            {/* Desktop: full course title + instructor line */}
            <div className="hidden sm:block min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="bg-app-accent-bg text-app-accent-text font-mono text-[11px] font-semibold px-2 py-0.5 rounded border border-app-accent-border shrink-0">
                  {course.code}
                </span>
                <h1 className="text-sm font-bold tracking-tight text-app-text truncate">
                  {course.title}
                </h1>
              </div>
              <p className="text-[11px] text-app-text-muted mt-0.5 truncate">
                Instructor: <span className="text-app-text-secondary font-medium">{course.instructor}</span>
              </p>
            </div>

            {/* Mobile: code badge + truncated title in one line */}
            <div className="sm:hidden flex items-center gap-1.5 min-w-0">
              <span className="bg-app-accent-bg text-app-accent-text font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border border-app-accent-border shrink-0">
                {course.code}
              </span>
              <h1 className="text-xs font-bold tracking-tight text-app-text truncate min-w-0">
                {course.title}
              </h1>
            </div>
          </div>

          {/* RIGHT: Exam countdown + theme toggle — always stay on the first line, never cropped */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Student name badge — desktop only */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-app-surface-subtle text-app-text-secondary text-xs border border-app-border">
              <User className="w-3.5 h-3.5 text-app-accent" />
              <span>{student.name}</span>
            </div>

            <ExamCountdownBadge />

            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-app-surface-subtle hover:bg-app-border text-app-text-secondary hover:text-app-text border border-app-border transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-app-text-secondary" />
              )}
            </button>
          </div>

          {/* SECOND LINE (mobile only): Reset/Sample buttons — wrap below the main row */}
          <div className="flex items-center gap-1 bg-app-surface-subtle p-1 rounded-lg border border-app-border sm:hidden w-full">
            <button
              type="button"
              onClick={onResetSample}
              className="flex-1 px-2.5 py-1.5 rounded text-[11px] font-medium text-app-text-secondary hover:text-app-text hover:bg-app-surface transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Load full sample conversation (conversation.json)"
              aria-label="Load sample conversation"
            >
              <FileText className="w-3.5 h-3.5 text-app-accent shrink-0" />
              <span>Sample</span>
            </button>
            <span className="text-app-border text-xs">|</span>
            <button
              type="button"
              onClick={onResetEmpty}
              className="flex-1 px-2.5 py-1.5 rounded text-[11px] font-medium text-app-text-secondary hover:text-app-text hover:bg-app-surface transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Start with empty conversation (conversation-empty.json)"
              aria-label="Clear chat to empty state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Clear</span>
            </button>
          </div>

          {/* DESKTOP: Reset buttons inline in the row (hidden on mobile, shown above instead) */}
          <div className="hidden sm:flex items-center gap-1 bg-app-surface-subtle p-1 rounded-lg border border-app-border">
            <button
              type="button"
              onClick={onResetSample}
              className="px-2.5 py-1 rounded text-[11px] font-medium text-app-text-secondary hover:text-app-text hover:bg-app-surface transition-colors flex items-center gap-1 cursor-pointer"
              title="Load full sample conversation (conversation.json)"
              aria-label="Load sample conversation"
            >
              <FileText className="w-3 h-3 text-app-accent" />
              <span className="hidden md:inline">Sample Data</span>
            </button>
            <span className="text-app-border text-xs">|</span>
            <button
              type="button"
              onClick={onResetEmpty}
              className="px-2.5 py-1 rounded text-[11px] font-medium text-app-text-secondary hover:text-app-text hover:bg-app-surface transition-colors flex items-center gap-1 cursor-pointer"
              title="Start with empty conversation (conversation-empty.json)"
              aria-label="Clear chat to empty state"
            >
              <RotateCcw className="w-3 h-3 text-amber-500" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div
          role="tablist"
          aria-label="Main view switcher"
          className="flex items-center gap-1 p-1 rounded-xl bg-app-surface-subtle border border-app-border shadow-inner"
        >
          {[
            {
              key: 'chat' as const,
              label: 'Chat',
              icon: MessageSquare,
              hint: `${messageCount} message${messageCount === 1 ? '' : 's'}`,
            },
            {
              key: 'knowledge' as const,
              label: 'Knowledge',
              icon: Brain,
              hint: 'Concept map',
            },
          ].map((tab) => {
            const active = view === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => onChangeView(tab.key)}
                className={[
                  'flex-1 min-w-0 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  active
                    ? 'bg-app-accent text-white shadow-sm scale-[1.01]'
                    : 'text-app-text-secondary hover:text-app-text hover:bg-app-surface',
                ].join(' ')}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
                <span
                  className={[
                    'hidden sm:inline text-[10px] font-mono px-1.5 py-px rounded border shrink-0',
                    active
                      ? 'bg-white/15 border-white/25 text-white/90'
                      : 'bg-app-surface border-app-border text-app-text-muted',
                  ].join(' ')}
                >
                  {tab.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
