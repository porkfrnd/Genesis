import { describe, expect, it } from 'vitest';
import { GenesisEngine, createDefaultEngine } from './engine.js';

describe('evolution engine', () => {
  it('replays identical state for identical seeds', () => {
    const first = createDefaultEngine();
    const second = createDefaultEngine();
    first.step(8);
    second.step(8);
    expect(first.getSnapshot().stats).toEqual(second.getSnapshot().stats);
    expect(first.getSnapshot().population.map((item) => item.genome)).toEqual(second.getSnapshot().population.map((item) => item.genome));
  });

  it('keeps population bounded and records generations', () => {
    const engine = createDefaultEngine();
    const snapshot = engine.step(12);
    expect(snapshot.generation).toBe(12);
    expect(snapshot.population.length).toBeGreaterThan(0);
    expect(snapshot.population.length).toBeLessThanOrEqual(engine.maxPopulation);
    expect(snapshot.history).toHaveLength(13);
  });

  it('restores the exact continuation from serialized state', () => {
    const uninterrupted = createDefaultEngine();
    uninterrupted.step(4);
    const restored = GenesisEngine.fromSerialized(JSON.parse(JSON.stringify(uninterrupted.serialize())));
    uninterrupted.step(2);
    restored.step(2);
    expect(restored.getSnapshot()).toEqual(uninterrupted.getSnapshot());
  });

  it('records explicit extinction under overwhelming pressure', () => {
    const engine = createDefaultEngine();
    engine.setEnvironment({ temperature: -20, food: 0, predation: 1, mutationRate: 1 });
    const snapshot = engine.step(20);
    expect(snapshot.extinct).toBe(true);
    expect(snapshot.population).toHaveLength(0);
    expect(snapshot.events.some((event) => event.type === 'extinction')).toBe(true);
  });

  it('handles a zero-food extreme without silent impossible state', () => {
    const engine = createDefaultEngine();
    engine.setEnvironment({ food: 0, temperature: 42, predation: 1, mutationRate: 0 });
    const snapshot = engine.step(5);
    expect(snapshot.population.every((organism) => organism.phenotype.speed >= 0)).toBe(true);
    expect(snapshot.stats.extinct || snapshot.population.length > 0).toBe(true);
  });
});
