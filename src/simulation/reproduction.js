import { GENE_IDS } from '../data/genes.js';
import { createOrganism } from './organism.js';
import { mutateGenome } from './mutation.js';
import { cloneGenome, validateGenome } from './validation.js';

export function canReproduce(organism) {
  return organism.state.health > 0.18 && organism.state.reproductiveReadiness > 0.16 && organism.state.age < organism.phenotype.lifespan * 0.86;
}

export function makeGamete(genome, rng) {
  return Object.fromEntries(GENE_IDS.map((geneId) => [geneId, [rng.pick(genome[geneId])]]));
}

export function recombineGametes(gameteA, gameteB, rng) {
  return Object.fromEntries(GENE_IDS.map((geneId) => {
    const allele = gameteA[geneId][0] === gameteB[geneId][0] ? gameteA[geneId][0] : rng.pick([gameteA[geneId][0], gameteB[geneId][0]]);
    return [geneId, [allele, allele]];
  }));
}

export function reproducePair({ parentA, parentB, id, generation, mutationRate, rng }) {
  const genomeA = cloneGenome(parentA.genome);
  const genomeB = cloneGenome(parentB.genome);
  const validation = validateGenome(genomeA);
  const secondValidation = validateGenome(genomeB);
  if (!validation.valid || !secondValidation.valid) throw new Error('Parents must have valid genomes.');
  const inherited = recombineGametes(makeGamete(genomeA, rng), makeGamete(genomeB, rng), rng);
  const mutation = mutateGenome(inherited, mutationRate, rng);
  return {
    organism: createOrganism({ id, genome: mutation.genome, generation, parents: [parentA.id, parentB.id], rng }),
    mutationEvents: mutation.events,
  };
}
