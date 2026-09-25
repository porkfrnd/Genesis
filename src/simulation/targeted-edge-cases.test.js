import { describe, expect, it } from 'vitest';
import { GenesisEngine, createDefaultEngine } from './engine.js';
import { validateGenome } from './validation.js';

describe('targeted edge cases', () => {
  it('restores deterministic continuation from serialized state', () => {
    const first = createDefaultEngine();
    first.step(5);
    const second = GenesisEngine.fromSerialized(JSON.parse(JSON.stringify(first.serialize())));
    first.step(3);
    second.step(3);
    expect(second.getSnapshot().generation).toBe(first.getSnapshot().generation);
    expect(second.getSnapshot().population.map((organism) => organism.genome)).toEqual(first.getSnapshot().population.map((organism) => organism.genome));
    expect(second.getSnapshot().history).toEqual(first.getSnapshot().history);
    expect(second.getSnapshot().events).toEqual(first.getSnapshot().events);
  });

  it('keeps a validated baseline genome usable after an extreme mutation rate', () => {
    const engine = createDefaultEngine();
    engine.setEnvironment({ mutationRate: 1 });
    engine.mutateOrganism(1);
    expect(validateGenome(engine.getOrganism(1).genome).valid).toBe(true);
  });
});
