import { GENE_BY_ID, GENE_IDS } from '../data/genes.js';
import { cloneGenome } from './validation.js';

export const MUTATION_TYPES = ['substitution', 'insertion', 'deletion'];

function otherAllele(geneId, current) {
  return Object.keys(GENE_BY_ID[geneId].alleles).find((allele) => allele !== current) ?? current;
}

export function mutateGenome(genome, mutationRate, rng) {
  const result = cloneGenome(genome);
  const events = [];
  const rate = Math.max(0, Math.min(1, Number(mutationRate) || 0));
  if (rate === 0) return { genome: result, events, count: 0 };

  for (const geneId of GENE_IDS) {
    if (!rng.chance(rate)) continue;
    const pair = result[geneId];
    const index = rng.chance(0.5) ? 0 : 1;
    const current = pair[index];
    const type = rng.weightedPick([
      { value: 'substitution', weight: 0.72 },
      { value: 'insertion', weight: 0.16 },
      { value: 'deletion', weight: 0.12 },
    ]);
    const replacement = otherAllele(geneId, current);
    pair[index] = replacement;
    events.push({ type, geneId, from: current, to: replacement });
  }

  return { genome: result, events, count: events.length };
}

export function applyGenomeChanges(genome, changes) {
  const result = cloneGenome(genome);
  for (const [geneId, pair] of Object.entries(changes)) {
    if (!GENE_BY_ID[geneId] || !Array.isArray(pair) || pair.length !== 2) continue;
    result[geneId] = [...pair];
  }
  return result;
}
