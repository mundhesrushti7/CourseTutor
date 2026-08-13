import React from 'react';
import { BookOpen, Sparkles, MessageSquareCode } from 'lucide-react';
import { SCENARIOS } from '../lib/mockStreamBridge';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  const starterPrompts = [
    {
      title: 'Supervised vs Unsupervised',
      prompt: 'What is the difference between supervised and unsupervised learning?',
      icon: BookOpen,
      tag: 'Basic Concept',
    },
    {
      title: 'Gradient Descent Code',
      prompt: 'Show me how gradient descent is implemented.',
      icon: MessageSquareCode,
      tag: 'Python Code',
    },
    {
      title: 'Sigmoid & Vanishing Gradient',
      prompt: 'Why is the sigmoid derivative at most 0.25?',
      icon: Sparkles,
      tag: 'Math & Derivations',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 text-center animate-fade-in">
      <div className="w-12 h-12 rounded-2xl bg-app-accent-bg border border-app-accent-border text-app-accent flex items-center justify-center mx-auto mb-4 shadow-sm">
        <BookOpen className="w-6 h-6" />
      </div>

      <h1 className="text-xl font-bold text-app-text tracking-tight">
        CS 4780 · Machine Learning Tutor
      </h1>
      <p className="mt-2 text-sm text-app-text-secondary max-w-lg mx-auto leading-relaxed">
        Ask questions about linear models, gradient descent, backpropagation, and regularization.
        Every answer is cited directly from Dr. Elena Márquez's lecture slides.
      </p>

      {/* Starter Prompts */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        {starterPrompts.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="group p-4 rounded-xl bg-app-surface border border-app-border hover:border-app-accent hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-app-accent-text bg-app-accent-bg px-2 py-0.5 rounded-full border border-app-accent-border">
                    {item.tag}
                  </span>
                  <IconComponent className="w-4 h-4 text-app-text-muted group-hover:text-app-accent transition-colors" />
                </div>
                <h3 className="text-xs font-bold text-app-text group-hover:text-app-accent mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-app-text-secondary line-clamp-2 leading-relaxed">
                  "{item.prompt}"
                </p>
              </div>
              <span className="mt-3 text-[11px] font-medium text-app-accent group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Ask tutor →
              </span>
            </button>
          );
        })}
      </div>

      {/* Scenario Tester Quick Shortcuts */}
      <div className="mt-8 pt-6 border-t border-app-border">
        <span className="text-xs font-semibold text-app-text-muted uppercase tracking-wider block mb-3">
          Test All 8 Canned Scenarios
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onSelectPrompt(sc.prompt)}
              className="px-2.5 py-1 rounded-lg bg-app-surface-subtle hover:bg-app-accent-bg hover:text-app-accent-text text-app-text-secondary text-xs border border-app-border transition-colors cursor-pointer"
              title={sc.prompt}
            >
              <span className="font-mono font-semibold text-[11px] mr-1 text-app-text-muted">[{sc.id}]</span>
              {sc.id === 'error-midstream' ? 'Error Midstream' : sc.id === 'slow' ? 'Slow (~4s)' : sc.id === 'refusal' ? 'Refusal' : sc.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
