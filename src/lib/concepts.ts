import { LectureDeck, Citation, Concept, UnderstandingSelection, ConceptState } from '../types';
import { LECTURE_DECKS, findSlideByCitation } from './lectureData';

export const EXAM_DATE = new Date('2026-09-01T09:00:00');

/**
 * Derive the full concept list directly from the real lecture deck data —
 * one concept per substantive slide. We skip title slides (slide 1) and the
 * summary/summary-and-next slides (last slide of each deck) because those
 * don't represent teachable concepts on their own.
 *
 * Every card in the Knowledge view maps to something real that already lives
 * in the lecture JSONs — no concepts are invented here.
 */
const SKIP_TITLE = 1;
const SKIP_SUMMARY_SLIDE_NUMBERS: Record<number, number[]> = {
  1: [15],   // W1: slide 15 "Summary and what comes next"
  2: [15],   // W2: slide 15 "Summary and what comes next"
  3: [15],   // W3: slide 15 "Summary"
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join('-');
}

/**
 * For a given concept slide, craft a reasonable question the user can ask
 * the tutor to revisit it. This powers the "Ask tutor again" button on the
 * Knowledge card detail panel. These are matched against the keyword-based
 * scenario router in matchScenario, so they use vocabulary that router
 * already recognizes.
 */
function buildPromptQuestion(slideTitle: string, lectureTitle: string): string {
  const t = slideTitle.toLowerCase();
  if (t.includes('squared error')) return 'What is the squared error loss function and when is it used?';
  if (t.includes('absolute error')) return 'When should I use absolute error loss instead of squared error?';
  if (t.includes('linear model')) return 'Explain the linear model and its parameters w and b.';
  if (t.includes('supervised learning')) return 'What is the difference between supervised and unsupervised learning?';
  if (t.includes('classification') && t.includes('different loss')) return 'Why does classification need cross-entropy instead of squared error?';
  if (t.includes('logistic')) return 'Why is the sigmoid derivative at most 0.25?';
  if (t.includes('cross-entropy') || t.includes('log loss')) return 'Explain cross-entropy loss and why we use it for classification.';
  if (t.includes('outlier')) return 'Why is squared error loss sensitive to outliers?';
  if (t.includes('closed-form')) return 'Derive and explain the closed-form solution for linear regression.';
  if (t.includes('closed form fails')) return 'When does the closed-form solution for linear regression fail?';
  if (t.includes('feature scaling')) return 'Why is feature scaling important before training a model?';
  if (t.includes('comparing the two losses')) return 'Compare squared error and cross-entropy on a confident misprediction.';
  if (t.includes('update rule') || t.includes('gradient descent')) return 'Show me how gradient descent is implemented.';
  if (t.includes('learning rate')) return 'What happens if you pick a learning rate that is too large or too small?';
  if (t.includes('batch, stochastic')) return 'Compare batch, stochastic, and mini-batch gradient descent.';
  if (t.includes('chain rule')) return 'Explain everything about backpropagation.';
  if (t.includes('two-layer')) return 'Walk through a two-layer neural network forward pass.';
  if (t.includes('backward pass')) return 'Derive the backward pass for a simple two-layer network.';
  if (t.includes('vanishing gradient')) return 'Explain the vanishing gradient problem and its causes.';
  if (t.includes('gradient magnitude by depth')) return 'How quickly does the gradient shrink as you pass through more layers?';
  if (t.includes('relu')) return 'Why does ReLU help with the vanishing gradient problem?';
  if (t.includes('momentum')) return 'How does momentum accelerate gradient descent?';
  if (t.includes('adam')) return 'What does the Adam optimizer add on top of SGD?';
  if (t.includes('diagnosing')) return 'How do I diagnose why a training run has failed?';
  if (t.includes('overfitting')) return 'Explain overfitting and how regularization addresses it.';
  if (t.includes('training curve') || t.includes('characteristic training')) return 'Draw and explain the characteristic training vs validation loss curve.';
  if (t.includes('bias-variance')) return 'Explain the bias-variance decomposition with examples.';
  if (t.includes('l2') || t.includes('ridge')) return 'Compare L1 (lasso) and L2 (ridge) regularization techniques.';
  if (t.includes('l1') || t.includes('lasso')) return 'Compare the regularization techniques we covered.';
  if (t.includes('exact zeros')) return 'Why does L1 regularization produce sparse models with exact zero weights?';
  if (t.includes('dropout')) return 'How does dropout work and when should I use it?';
  if (t.includes('early stopping')) return 'What is early stopping and why is it always a good idea?';
  if (t.includes('train, validation, test') || t.includes('train / validation')) return 'Explain the train / validation / test split.';
  if (t.includes('cross-validation')) return 'When should I use cross-validation instead of a single validation split?';
  if (t.includes('augmentation')) return 'What is data augmentation and when can I apply it?';
  if (t.includes('choosing between these')) return 'Compare the regularization techniques we covered.';
  if (t.includes('problem we are actually trying to solve') || t.includes('generalization')) return 'Explain the difference between training loss and generalization error.';
  // Fallback: generic question that matchScenario can route by keywords
  return `Explain ${slideTitle.toLowerCase()} from ${lectureTitle.toLowerCase()}.`;
}

export function buildConceptsFromLectures(decks: LectureDeck[] = LECTURE_DECKS): Concept[] {
  const concepts: Concept[] = [];
  for (const deck of decks) {
    const skippedLast = SKIP_SUMMARY_SLIDE_NUMBERS[deck.week] || [];
    for (const slide of deck.slides) {
      if (slide.slide_number === SKIP_TITLE) continue;
      if (skippedLast.includes(slide.slide_number)) continue;
      const slug = slugify(slide.title);
      concepts.push({
        id: `w${deck.week}-s${slide.slide_number}-${slug}`,
        name: slide.title,
        lectureWeek: deck.week,
        lectureTitle: deck.title,
        slideNumber: slide.slide_number,
        promptQuestion: buildPromptQuestion(slide.title, deck.title),
      });
    }
  }
  return concepts;
}

export const ALL_CONCEPTS: Concept[] = buildConceptsFromLectures();

/**
 * Given a Citation from a tutor response, resolve it to 0..N concept ids.
 *
 * Most citations reference a specific substantive slide, so the mapping is
 * one-to-one. If the citation somehow points at a title/summary slide, we
 * resolve to the nearest substantive neighbor (slide 2, or the penultimate
 * slide) so that every real citation still produces at least one concept.
 */
export function citationToConceptIds(citation: Citation, concepts: Concept[] = ALL_CONCEPTS): string[] {
  const found = findSlideByCitation(citation);
  if (!found) return [];
  const week = found.deck.week;
  const slideNum = found.slide.slide_number;
  const match = concepts.find((c) => c.lectureWeek === week && c.slideNumber === slideNum);
  if (match) return [match.id];
  // Title/summary slide edge case: pick nearest substantive concept in same week
  const weekConcepts = concepts.filter((c) => c.lectureWeek === week).sort((a, b) => a.slideNumber - b.slideNumber);
  if (weekConcepts.length === 0) return [];
  let nearest = weekConcepts[0];
  let bestDist = Math.abs(nearest.slideNumber - slideNum);
  for (const c of weekConcepts) {
    const d = Math.abs(c.slideNumber - slideNum);
    if (d < bestDist) {
      bestDist = d;
      nearest = c;
    }
  }
  return [nearest.id];
}

/**
 * All unique concept ids touched by a tutor response's citations.
 * If the response has no citations, returns [].
 */
export function citationsToConceptIds(citations: Citation[] | undefined, concepts: Concept[] = ALL_CONCEPTS): string[] {
  if (!citations || citations.length === 0) return [];
  const set = new Set<string>();
  for (const cit of citations) {
    for (const id of citationToConceptIds(cit, concepts)) set.add(id);
  }
  return Array.from(set);
}

/**
 * Map the 3-option understanding check UI to a ConceptState per the spec:
 *   Got it 🟢     -> 'confident'
 *   Sort of 🟡    -> 'learning'
 *   Still fuzzy 🟠 -> 'needs_revision'
 */
export function understandingToState(sel: UnderstandingSelection): ConceptState {
  switch (sel) {
    case 'got_it':      return 'confident';
    case 'sort_of':     return 'learning';
    case 'still_fuzzy': return 'needs_revision';
  }
}

/**
 * Inverse mapping: map ConceptState to UnderstandingSelection:
 *   'confident'      -> 'got_it'
 *   'learning'       -> 'sort_of'
 *   'needs_revision' -> 'still_fuzzy'
 *   'unexplored'     -> null
 */
export function stateToUnderstanding(state: ConceptState): UnderstandingSelection | null {
  switch (state) {
    case 'confident':      return 'got_it';
    case 'learning':       return 'sort_of';
    case 'needs_revision': return 'still_fuzzy';
    case 'unexplored':     return null;
  }
}
