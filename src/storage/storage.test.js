import { beforeEach, describe, expect, it } from 'vitest';
import { createDefaultEngine } from '../simulation/engine.js';
import { clearExperiments, loadExperiments, loadProgress, saveExperiment, saveProgress } from './storage.js';

describe('local persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('round-trips a saved experiment with actual engine state', () => {
    const engine = createDefaultEngine();
    engine.step(3);
    const snapshot = engine.getSnapshot();
    const saved = saveExperiment({ name: 'Cold run', state: { ...engine.serialize(), ...snapshot }, stats: snapshot.stats });
    expect(loadExperiments()).toHaveLength(1);
    expect(saved.name).toBe('Cold run');
    expect(loadExperiments()[0].engineState.population).toEqual(snapshot.population);
  });

  it('deduplicates progress and tolerates missing storage', () => {
    const progress = saveProgress({ completedLessons: ['dna-genes'], completedChallenges: [] });
    expect(progress.completedLessons).toEqual(['dna-genes']);
    expect(loadProgress().completedLessons).toEqual(['dna-genes']);
    clearExperiments();
    expect(loadExperiments()).toEqual([]);
  });
});
