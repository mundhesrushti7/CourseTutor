import { LectureDeck, Slide, Citation } from '../types';
import lec1 from '../../lecture-01-linear-models.json';
import lec2 from '../../lecture-02-gradient-descent.json';
import lec3 from '../../lecture-03-regularization.json';

export const LECTURE_DECKS: LectureDeck[] = [
  lec1 as LectureDeck,
  lec2 as LectureDeck,
  lec3 as LectureDeck,
];

/**
  * Find a specific slide given a Citation object
  * citation: { lecture: "Week 2 — Gradient Descent and Backpropagation", slide: 9 }
  */
export function findSlideByCitation(citation: Citation): { deck: LectureDeck; slide: Slide } | null {
  // Normalize title search: e.g. "Week 2 — Gradient Descent..." matches deck.week and deck.title
  const deck = LECTURE_DECKS.find((d) => {
    const fullTitle = `Week ${d.week} — ${d.title}`;
    return citation.lecture.trim().toLowerCase() === fullTitle.trim().toLowerCase() ||
           citation.lecture.toLowerCase().includes(d.title.toLowerCase());
  });

  if (!deck) return null;

  const slide = deck.slides.find((s) => s.slide_number === citation.slide);
  if (!slide) return null;

  return { deck, slide };
}

/**
  * Format citation card title succinctly
  */
export function formatCitationLabel(citation: Citation): string {
  // Extract "Week X" or use short title
  const match = citation.lecture.match(/Week\s*(\d+)/i);
  const weekNum = match ? match[1] : '';
  const weekLabel = weekNum ? `Lecture ${weekNum}` : citation.lecture;
  return `📚 ${weekLabel} · Slide ${citation.slide}`;
}
