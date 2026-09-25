import { GENE_BY_ID, GENE_IDS, getAlleleDefinition } from '../data/genes.js';

export function validateGenome(genome) {
  const errors = [];
  if (!genome || typeof genome !== 'object' || Array.isArray(genome)) {
    return { valid: false, errors: ['Genome must be an object.'] };
  }

  for (const geneId of GENE_IDS) {
    const pair = genome[geneId];
    if (!Array.isArray(pair) || pair.length !== 2) {
      errors.push(`${GENE_BY_ID[geneId].label} requires two alleles.`);
      continue;
    }
    for (const allele of pair) {
      if (!getAlleleDefinition(geneId, allele)) {
        errors.push(`${GENE_BY_ID[geneId].label} contains an unknown allele: ${allele}.`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function cloneGenome(genome) {
  return Object.fromEntries(GENE_IDS.map((geneId) => [geneId, [...genome[geneId]]]));
}

export function normalizeGenome(genome) {
  const source = genome ?? {};
  return Object.fromEntries(GENE_IDS.map((geneId) => {
    const pair = Array.isArray(source[geneId]) && source[geneId].length === 2 ? source[geneId] : [];
    return [geneId, pair];
  }));
}
