import { describe, expect, it } from 'vitest';
import { CHALLENGES } from './challenges.js';

describe('challenge evaluation', () => {
  it('compares current speed with the initial snapshot directly', () => {
    const challenge = CHALLENGES.find((item) => item.id === 'escape-predators');
    const initial = { averages: { speed: 40 } };
    const snapshot = { generation: 100, population: new Array(20).fill({}), stats: { averages: { speed: 52 } } };
    expect(challenge.evaluate(snapshot, initial)).toBe(true);
    expect(challenge.status(snapshot, initial)).toContain('40');
  });
});
