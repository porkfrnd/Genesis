export const GENE_DEFINITIONS = [
  {
    id: 'speed',
    label: 'Movement speed',
    shortLabel: 'SPD',
    chromosome: 'CHR 01',
    description: 'Controls how quickly a specimen can move and evade pressure.',
    alleles: {
      S: { label: 'Swift', value: 78, dominance: 'dominant', effect: 'Higher movement speed' },
      s: { label: 'Measured', value: 34, dominance: 'recessive', effect: 'Lower movement speed and lower energy cost' },
    },
    tradeoff: 'Swift alleles increase energy consumption.',
  },
  {
    id: 'size',
    label: 'Body size',
    shortLabel: 'SIZ',
    chromosome: 'CHR 02',
    description: 'Controls body mass, visual footprint, and energy reserves.',
    alleles: {
      L: { label: 'Large', value: 72, dominance: 'dominant', effect: 'Larger body and greater stored energy' },
      l: { label: 'Small', value: 30, dominance: 'recessive', effect: 'Smaller body with a lower energy requirement' },
    },
    tradeoff: 'Large alleles increase food demand and can reduce agility.',
  },
  {
    id: 'pigment',
    label: 'Pigmentation',
    shortLabel: 'PIG',
    chromosome: 'CHR 03',
    description: 'Controls visible pigmentation in the dish and predator visibility.',
    alleles: {
      P: { label: 'Dark', value: 84, dominance: 'dominant', effect: 'Darker pigmentation' },
      p: { label: 'Pale', value: 24, dominance: 'recessive', effect: 'Paler pigmentation' },
    },
    tradeoff: 'Darker pigment is easier for visual predators to detect in this model.',
  },
  {
    id: 'metabolism',
    label: 'Metabolic rate',
    shortLabel: 'MET',
    chromosome: 'CHR 04',
    description: 'Controls how quickly stored energy is spent and replenished.',
    alleles: {
      M: { label: 'Active', value: 78, dominance: 'dominant', effect: 'Faster energy turnover' },
      m: { label: 'Conserving', value: 36, dominance: 'recessive', effect: 'Slower energy turnover' },
    },
    tradeoff: 'Active metabolism supports recovery but increases food demand.',
  },
  {
    id: 'coldTolerance',
    label: 'Cold tolerance',
    shortLabel: 'CLD',
    chromosome: 'CHR 05',
    description: 'Controls survival under low-temperature pressure.',
    alleles: {
      C: { label: 'Cold adapted', value: 86, dominance: 'dominant', effect: 'Higher cold tolerance' },
      c: { label: 'Heat suited', value: 18, dominance: 'recessive', effect: 'Lower cold tolerance' },
    },
    tradeoff: 'Cold-adapted alleles do not provide a universal advantage in warm environments.',
  },
];

export const GENE_BY_ID = Object.fromEntries(GENE_DEFINITIONS.map((gene) => [gene.id, gene]));
export const GENE_IDS = GENE_DEFINITIONS.map((gene) => gene.id);
export const BASELINE_GENOME = Object.fromEntries(GENE_IDS.map((id) => {
  const baselineAllele = Object.keys(GENE_BY_ID[id].alleles)[1];
  return [id, [baselineAllele, baselineAllele]];
}));

export function getAlleleDefinition(geneId, allele) {
  return GENE_BY_ID[geneId]?.alleles?.[allele] ?? null;
}

export function getGenomeSummary(genome) {
  return GENE_IDS.map((geneId) => {
    const pair = genome[geneId] ?? [];
    const dominant = pair.find((allele) => getAlleleDefinition(geneId, allele)?.dominance === 'dominant') ?? pair[0];
    return {
      geneId,
      label: GENE_BY_ID[geneId].label,
      pair: pair.join('/'),
      expressed: dominant,
      value: getAlleleDefinition(geneId, dominant)?.value ?? 0,
    };
  });
}
