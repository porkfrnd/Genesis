import { describe, expect, it } from 'vitest';
import { BASELINE_GENOME } from '../data/genes.js';
import { createOrganism } from './organism.js';
import { createSeededRandom } from './random.js';
import { canReproduce, makeGamete, reproducePair } from './reproduction.js';
import { validateGenome } from './validation.js';

describe('reproduction and inheritance', () => {
  it('creates gametes with one valid allele per locus', () => {
    const rng = createSeededRandom(8);
    const gamete = makeGamete(BASELINE_GENOME, rng);
    expect(Object.keys(gamete).length).toBe(5);
    expect(gamete.speed[0]).toMatch(/^[Ss]$/);
  });

  it('inherits from two parents and can mutate safely', () => {
    const rng = createSeededRandom(10);
    const parentA = createOrganism({ id: 1, genome: BASELINE_GENOME, rng });
    const parentB = createOrganism({ id: 2, genome: { ...BASELINE_GENOME, speed: ['S', 'S'], coldTolerance: ['C', 'C'] }, rng });
    const result = reproducePair({ parentA, parentB, id: 3, generation: 1, mutationRate: 0.2, rng });
    expect(result.organism.parents).toEqual([1, 2]);
    expect(validateGenome(result.organism.genome).valid).toBe(true);
  });

  it('reports reproductive readiness as a state condition', () => {
    const organism = createOrganism({ id: 1, genome: BASELINE_GENOME, rng: createSeededRandom(3) });
    expect(canReproduce(organism)).toBe(true);
  });
});
