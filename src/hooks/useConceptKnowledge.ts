import { useState, useEffect, useCallback } from 'react';
import { ConceptState, ConceptKnowledgeMap, UnderstandingSelection } from '../types';
import { understandingToState } from '../lib/concepts';

const STORAGE_KEY = 'tutor_concept_knowledge_v1';

const DEFAULT_STATE: ConceptState = 'unexplored';

function loadMap(): ConceptKnowledgeMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ConceptKnowledgeMap;
    if (typeof parsed === 'object' && parsed !== null) return parsed;
    return {};
  } catch (e) {
    console.error('Failed to read concept knowledge from localStorage', e);
    return {};
  }
}

function persistMap(map: ConceptKnowledgeMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save concept knowledge to localStorage', e);
  }
}

export function useConceptKnowledge() {
  const [knowledge, setKnowledge] = useState<ConceptKnowledgeMap>(() => loadMap());

  useEffect(() => {
    persistMap(knowledge);
  }, [knowledge]);

  const getState = useCallback(
    (conceptId: string): ConceptState => {
      return knowledge[conceptId] ?? DEFAULT_STATE;
    },
    [knowledge]
  );

  /**
   * Direct override: set a concept to a specific state. Used by the
   * Knowledge detail panel if manual overrides are needed, or by the
   * understanding check via the helper below.
   */
  const setState = useCallback((conceptId: string, state: ConceptState) => {
    setKnowledge((prev) => {
      if (prev[conceptId] === state) return prev;
      return { ...prev, [conceptId]: state };
    });
  }, []);

  /**
   * Apply a 3-option "Got it / Sort of / Still fuzzy" check to a batch of
   * concept ids — this is what the understanding-check row calls after a
   * tutor message finishes streaming.
   */
  const applyUnderstanding = useCallback(
    (conceptIds: string[], selection: UnderstandingSelection) => {
      const state = understandingToState(selection);
      setKnowledge((prev) => {
        let changed = false;
        const next: ConceptKnowledgeMap = { ...prev };
        for (const id of conceptIds) {
          if (next[id] !== state) {
            next[id] = state;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    },
    []
  );

  const reset = useCallback(() => {
    setKnowledge({});
  }, []);

  return {
    knowledge,
    getState,
    setState,
    applyUnderstanding,
    reset,
  };
}
