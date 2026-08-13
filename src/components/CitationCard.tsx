import React from 'react';
import { BookOpen } from 'lucide-react';
import { Citation } from '../types';
import { formatCitationLabel } from '../lib/lectureData';

interface CitationCardProps {
  citation: Citation;
  onClick: (citation: Citation) => void;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, onClick }) => {
  const label = formatCitationLabel(citation);

  return (
    <button
      type="button"
      onClick={() => onClick(citation)}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-app-accent-bg hover:bg-app-accent-bg/80 text-app-accent-text border border-app-accent-border text-xs font-medium transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-app-accent/40 cursor-pointer text-left"
      aria-label={`View source preview for ${citation.lecture}, slide ${citation.slide}`}
    >
      <BookOpen className="w-3.5 h-3.5 text-app-accent shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
};
