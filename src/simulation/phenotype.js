import { GENE_IDS, getAlleleDefinition, GENE_BY_ID } from '../data/genes.js';

function expressedValue(genome, geneId) {
  const pair = genome[geneId] ?? [];
  const dominant = pair.find((allele) => getAlleleDefinition(geneId, allele)?.dominance === 'dominant') ?? pair[0];
  return getAlleleDefinition(geneId, dominant)?.value ?? 0;
}

export function calculatePhenotype(genome) {
  const speed = expressedValue(genome, 'speed');
  const size = expressedValue(genome, 'size');
  const pigmentation = expressedValue(genome, 'pigment');
  const metabolism = expressedValue(genome, 'metabolism');
  const coldTolerance = expressedValue(genome, 'coldTolerance');
  const energyCapacity = Math.round(30 + size * 0.32 + metabolism * 0.18);
  const lifespan = Math.round(34 + size * 0.12 + metabolism * 0.18 - speed * 0.08 + coldTolerance * 0.08);
  const reproductiveRate = Number((0.18 + metabolism * 0.003 + (100 - speed) * 0.001).toFixed(3));
  const predationEscape = Math.round(Math.max(0, Math.min(100, speed * 0.72 + size * 0.18 + (100 - pigmentation) * 0.1)));

  return {
    speed,
    size,
    pigmentation,
    metabolism,
    coldTolerance,
    energyCapacity,
    lifespan,
    reproductiveRate,
    predationEscape,
  };
}

export function getPhenotypeKeyLabel(key) {
  return {
    speed: 'Speed',
    size: 'Size',
    pigmentation: 'Pigmentation',
    metabolism: 'Metabolism',
    coldTolerance: 'Cold tolerance',
    energyCapacity: 'Energy capacity',
    lifespan: 'Lifespan',
    reproductiveRate: 'Reproductive rate',
    predationEscape: 'Predator escape',
  }[key] ?? key;
}

export function explainPhenotype(genome) {
  const phenotype = calculatePhenotype(genome);
  return GENE_IDS.map((geneId) => {
    const pair = genome[geneId];
    const gene = GENE_BY_ID[geneId];
    const dominant = pair.find((allele) => getAlleleDefinition(geneId, allele)?.dominance === 'dominant') ?? pair[0];
    const allele = getAlleleDefinition(geneId, dominant);
    return `${gene.label}: ${pair.join('/')} expresses ${allele?.label ?? dominant}, giving ${allele?.effect?.toLowerCase() ?? 'a model effect'}.`;
  }).concat([
    `Predator escape combines movement, size, and visibility into ${phenotype.predationEscape}/100 in this model.`,
  ]);
}

export function phenotypeDelta(before, after) {
  const keys = ['speed', 'size', 'pigmentation', 'metabolism', 'coldTolerance', 'energyCapacity', 'lifespan', 'reproductiveRate', 'predationEscape'];
  return keys.map((key) => ({
    key,
    label: getPhenotypeKeyLabel(key),
    before: before[key],
    after: after[key],
    delta: Number((after[key] - before[key]).toFixed(2)),
  }));
}
