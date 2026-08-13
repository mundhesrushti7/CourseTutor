import responsesData from '../../responses.json';
import { Scenario, Citation } from '../types';

export const SCENARIOS: Scenario[] = responsesData.scenarios as Scenario[];

/**
 * Match a prompt to one of the mock scenarios, or default to 'plain'
 */
let fallbackCounter = 0;

/**
 * Match a prompt to one of the mock scenarios, or rotate through scenarios
 */
export function matchScenario(promptText: string, forcedScenarioId?: string): Scenario {
  if (forcedScenarioId && forcedScenarioId !== 'auto') {
    const forced = SCENARIOS.find((s) => s.id === forcedScenarioId);
    if (forced) return forced;
  }

  const cleanPrompt = promptText.trim().toLowerCase();
  
  // 1. Exact matching with scenario prompts
  const exact = SCENARIOS.find((s) => s.prompt.toLowerCase() === cleanPrompt);
  if (exact) return exact;

  // 2. Comprehensive Keyword matching
  if (cleanPrompt.includes('midterm solution') || cleanPrompt.includes('midterm solutions') || cleanPrompt.includes('final solution') || cleanPrompt.includes('final solutions') || cleanPrompt.includes('practice solution') || (cleanPrompt.includes('walk') && cleanPrompt.includes('through') && (cleanPrompt.includes('midterm') || cleanPrompt.includes('final'))) || cleanPrompt.includes('walk me through the midterm') || cleanPrompt.includes('walk me through the final')) {
    return SCENARIOS.find((s) => s.id === 'error-midstream') || SCENARIOS[0];
  }
  if (cleanPrompt.includes('when is the final exam') || cleanPrompt.includes('when is the midterm exam') || cleanPrompt.includes('when is the exam') || cleanPrompt.includes('exam date') || cleanPrompt.includes('final date') || cleanPrompt.includes('midterm date') || cleanPrompt.includes('what day is the exam') || cleanPrompt.includes('what day is the final') || cleanPrompt.includes('syllabus') || cleanPrompt.includes('grading breakdown') || cleanPrompt.includes('grading scheme') || cleanPrompt.includes('how is the class graded') || cleanPrompt.includes('how much is the final worth') || cleanPrompt.includes('grade distribution')) {
    return SCENARIOS.find((s) => s.id === 'refusal') || SCENARIOS[0];
  }
  if (cleanPrompt.includes('summarise the whole course') || cleanPrompt.includes('summarize the whole course') || cleanPrompt.includes('summary of the whole course') || cleanPrompt.includes('summary of the course so far') || cleanPrompt.includes('summarise the course so far') || cleanPrompt.includes('summarize the course so far') || cleanPrompt.includes('course so far') || cleanPrompt.includes('three weeks in') || cleanPrompt.includes('first three weeks')) {
    return SCENARIOS.find((s) => s.id === 'slow') || SCENARIOS[0];
  }
  if (cleanPrompt.includes('backprop') || cleanPrompt.includes('chain rule') || cleanPrompt.includes('forward') || cleanPrompt.includes('backward') || cleanPrompt.includes('everything about') || cleanPrompt.includes('long')) {
    return SCENARIOS.find((s) => s.id === 'long') || SCENARIOS[0];
  }
  if (cleanPrompt.includes('compare') || cleanPrompt.includes('regularization') || cleanPrompt.includes('ridge') || cleanPrompt.includes('lasso') || cleanPrompt.includes('dropout') || cleanPrompt.includes('table')) {
    return SCENARIOS.find((s) => s.id === 'table') || SCENARIOS[0];
  }
  if (cleanPrompt.includes('sigmoid') || cleanPrompt.includes('derivative') || cleanPrompt.includes('0.25') || cleanPrompt.includes('math') || cleanPrompt.includes('formula')) {
    return SCENARIOS.find((s) => s.id === 'math') || SCENARIOS[0];
  }
  if (cleanPrompt.includes('code') || cleanPrompt.includes('python') || cleanPrompt.includes('implement') || cleanPrompt.includes('gradient') || cleanPrompt.includes('descent')) {
    return SCENARIOS.find((s) => s.id === 'code') || SCENARIOS[0];
  }
  if (cleanPrompt.includes('supervised') || cleanPrompt.includes('unsupervised') || cleanPrompt.includes('plain')) {
    return SCENARIOS.find((s) => s.id === 'plain') || SCENARIOS[0];
  }

  // 3. Fallback: Cycle through scenarios so consecutive unrecognized questions trigger different responses
  const scenario = SCENARIOS[fallbackCounter % SCENARIOS.length];
  fallbackCounter++;
  return scenario;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function chunkify(text: string): string[] {
  const chunks: string[] = [];
  let i = 0;
  let seed = 1337;
  const next = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

  while (i < text.length) {
    const size = 2 + Math.floor(next() * 6);
    chunks.push(text.slice(i, i + size));
    i += size;
  }
  return chunks;
}

export interface StreamOptions {
  signal?: AbortSignal;
  speed?: number;
  onFirstToken?: () => void;
}

/**
 * Async generator yielding string chunks, mimicking mock-stream.mjs
 */
export async function* streamTutorResponse(
  scenarioId: string,
  opts: StreamOptions = {}
): AsyncGenerator<string, { scenario: Scenario }, void> {
  const { signal, speed = 1, onFirstToken } = opts;
  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  if (!scenario) {
    throw new Error(`Unknown scenario "${scenarioId}"`);
  }

  const chunks = chunkify(scenario.text);

  // First token delay simulation
  await sleep(scenario.first_token_delay_ms * speed);
  if (signal?.aborted) return { scenario };

  if (scenario.error && scenario.fails_before_first_token) {
    throw new Error(scenario.error);
  }

  if (onFirstToken) onFirstToken();

  for (const chunk of chunks) {
    if (signal?.aborted) return { scenario };
    yield chunk;
    await sleep(scenario.chunk_delay_ms * speed);
  }

  if (scenario.error) {
    throw new Error(scenario.error);
  }

  return { scenario };
}
