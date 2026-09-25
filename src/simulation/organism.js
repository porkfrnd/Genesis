import { GENE_BY_ID, GENE_IDS } from '../data/genes.js';
import { calculatePhenotype } from './phenotype.js';
import { cloneGenome, validateGenome } from './validation.js';
import { createSeededRandom } from './random.js';

export function createRandomGenome(rng) {
  return Object.fromEntries(GENE_IDS.map((geneId) => {
    const alleles = Object.keys(GENE_BY_ID[geneId].alleles);
    const first = rng.pick(alleles);
    const second = rng.pick(alleles);
    return [geneId, [first, second]];
  }));
}

export function createOrganism({ id, genome, generation = 0, parents = null, position, rng = createSeededRandom(id) }) {
  const validation = validateGenome(genome);
  if (!validation.valid) throw new Error(validation.errors.join(' '));
  const phenotype = calculatePhenotype(genome);
  return {
    id,
    genome: cloneGenome(genome),
    phenotype,
    generation,
    parents,
    position: position ?? { x: rng.range(0.08, 0.92), y: rng.range(0.08, 0.92) },
    state: {
      age: rng.int(1, Math.max(2, Math.round(phenotype.lifespan * 0.35))),
      energy: rng.range(0.58, 0.98),
      health: rng.range(0.72, 1),
      reproductiveReadiness: rng.range(0.35, 1),
    },
    direction: rng.range(0, Math.PI * 2),
  };
}

export function createPopulation({ count = 120, seed = 482193, generation = 0 } = {}) {
  const rng = createSeededRandom(seed);
  return Array.from({ length: count }, (_, index) => createOrganism({
    id: index + 1,
    genome: createRandomGenome(rng),
    generation,
    position: { x: rng.range(0.08, 0.92), y: rng.range(0.08, 0.92) },
    rng,
  }));
}

export function refreshOrganism(organism) {
  organism.genome = cloneGenome(organism.genome);
  organism.phenotype = calculatePhenotype(organism.genome);
  return organism;
}

export function ageOrganism(organism, environment) {
  organism.state.age += 1;
  const metabolicCost = 0.06 + organism.phenotype.metabolism * 0.0007 + organism.phenotype.speed * 0.00035;
  const foodSupply = Math.max(0, environment.food - 0.2);
  organism.state.energy = Math.max(0, Math.min(1, organism.state.energy + foodSupply * 0.18 - metabolicCost));
  organism.state.health = Math.max(0, Math.min(1, organism.state.health + (organism.state.energy > 0.2 ? 0.025 : -0.08) - 0.012));
  organism.state.reproductiveReadiness = Math.max(0, Math.min(1, organism.state.reproductiveReadiness * 0.82 + organism.state.health * 0.18));
  return organism;
}
