export interface Citation {
  lecture: string;
  slide: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  created_at: string;
  content: string;
  citations?: Citation[];
  isStreaming?: boolean;
  isError?: boolean;
  errorMessage?: string;
  isRefusal?: boolean;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  instructor: string;
}

export interface Student {
  id: string;
  name: string;
}

export interface Conversation {
  id: string;
  course: Course;
  student: Student;
  started_at: string | null;
  messages: Message[];
}

export interface SlideFigure {
  description: string;
}

export interface Slide {
  slide_number: number;
  title: string;
  bullets: string[];
  formulas?: string[];
  figure?: SlideFigure;
  notes: string;
}

export interface LectureDeck {
  lecture_id: string;
  course_code: string;
  course_title: string;
  week: number;
  title: string;
  slides: Slide[];
}

export interface Scenario {
  id: string;
  prompt: string;
  first_token_delay_ms: number;
  chunk_delay_ms: number;
  text: string;
  citations: Citation[];
  error?: string;
  fails_before_first_token?: boolean;
}


// ========== Knowledge / Concept map
export type ConceptState = 'unexplored' | 'learning' | 'confident' | 'needs_revision';

export interface Concept {
  id: string;             // stable id, eg "w1-s4-squared-error-loss"
  name: string;           // human name, eg "Squared error loss"
  lectureWeek: number;         // 1..3
  lectureTitle: string;    // "Linear Models and Loss Functions"
  slideNumber: number;     // slide in the deck
  promptQuestion: string; // a natural question the user can ask the tutor about this concept
}

// What a 3-option check ? ConceptState mapping:
//   "Got it ??"     -> 'confident'
//   "Sort of ??"    -> 'learning'
//   "Still fuzzy ??"  -> 'needs_revision'
// (unexplored is the default when nothing has been touched yet.)
export type UnderstandingSelection = 'got_it' | 'sort_of' | 'still_fuzzy';

export type ConceptKnowledgeMap = Record<string, ConceptState>;