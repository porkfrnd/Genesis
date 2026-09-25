import { describe, expect, it } from 'vitest';
import { createDefaultEngine } from './engine.js';
import { evaluateOrganism } from './selection.js';

describe('environmental selection', () => {
  it('changes contextual fitness between warm and cold environments', () => {
    const engine = createDefaultEngine();
    const organism = engine.getOrganism(1);
    const warm = evaluateOrganism(organism, { temperature: 32, food: 0.7, predation: 0.15, mutationRate: 0.08 });
    const cold = evaluateOrganism(organism, { temperature: -12, food: 0.7, predation: 0.15, mutationRate: 0.08 });
    expect(cold.explanation).toContain('Fitness');
    expect(warm.fitness).not.toBe(cold.fitness);
  });
});
