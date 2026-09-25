import { describe, expect, it } from 'vitest';
import { BASELINE_GENOME } from '../data/genes.js';
import { createSeededRandom } from './random.js';
import { mutateGenome } from './mutation.js';
import { validateGenome } from './validation.js';

describe('mutation system', () => {
  it('produces no changes at zero mutation rate', () => {
    const result = mutateGenome(BASELINE_GENOME, 0, createSeededRandom(4));
    expect(result.count).toBe(0);
    expect(result.genome).toEqual(BASELINE_GENOME);
  });

  it('keeps every gene valid at an extreme mutation rate', () => {
    const result = mutateGenome(BASELINE_GENOME, 1, createSeededRandom(4));
    expect(validateGenome(result.genome).valid).toBe(true);
    expect(result.count).toBe(5);
  });

  it('records the type, locus, and allele change', () => {
    const result = mutateGenome(BASELINE_GENOME, 1, createSeededRandom(19));
    expect(result.events[0]).toMatchObject({ geneId: expect.any(String), from: expect.any(String), to: expect.any(String) });
  });
});
