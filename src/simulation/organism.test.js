import { describe, expect, it } from 'vitest';
import { BASELINE_GENOME } from '../data/genes.js';
import { calculatePhenotype, explainPhenotype, phenotypeDelta } from './phenotype.js';
import { createOrganism } from './organism.js';
import { createSeededRandom } from './random.js';
import { validateGenome } from './validation.js';

describe('organism genetics', () => {
  it('calculates a deterministic phenotype from genotype', () => {
    const first = calculatePhenotype(BASELINE_GENOME);
    const second = calculatePhenotype(BASELINE_GENOME);
    expect(first).toEqual(second);
    expect(first.coldTolerance).toBe(18);
    expect(first.speed).toBe(34);
  });

  it('rejects invalid genomes with actionable errors', () => {
    const result = validateGenome({ ...BASELINE_GENOME, speed: ['X', 's'] });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('unknown allele');
  });

  it('creates a valid organism and explains its causal phenotype', () => {
    const organism = createOrganism({ id: 7, genome: BASELINE_GENOME, rng: createSeededRandom(7) });
    expect(organism.id).toBe(7);
    expect(organism.genome).toEqual(BASELINE_GENOME);
    expect(explainPhenotype(organism.genome).length).toBeGreaterThan(3);
  });

  it('reports phenotype deltas without mutating the original genome', () => {
    const next = { ...BASELINE_GENOME, speed: ['S', 'S'] };
    const deltas = phenotypeDelta(calculatePhenotype(BASELINE_GENOME), calculatePhenotype(next));
    expect(deltas.find((item) => item.key === 'speed').delta).toBe(44);
    expect(BASELINE_GENOME.speed).toEqual(['s', 's']);
  });
});
