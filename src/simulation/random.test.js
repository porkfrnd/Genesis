import { describe, expect, it } from 'vitest';
import { createSeededRandom } from './random.js';

describe('seeded random generator', () => {
  it('replays the same sequence for the same seed', () => {
    const first = createSeededRandom(482193);
    const second = createSeededRandom(482193);
    expect([first.next(), first.next(), first.next()]).toEqual([second.next(), second.next(), second.next()]);
  });

  it('restores a state for deterministic continuation', () => {
    const source = createSeededRandom(12);
    source.next();
    const state = source.getState();
    const expected = [source.next(), source.next()];
    const restored = createSeededRandom(12);
    restored.setState(state);
    expect([restored.next(), restored.next()]).toEqual(expected);
  });
});
