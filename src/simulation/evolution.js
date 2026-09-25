import { GENE_BY_ID } from '../data/genes.js';
import { ageOrganism } from './organism.js';
import { canReproduce, reproducePair } from './reproduction.js';
import { evaluateOrganism } from './selection.js';
import { appendHistory, createSnapshot } from './history.js';

function weightedParent(parents, rng) {
  return rng.weightedPick(parents.map((organism) => ({ value: organism, weight: Math.max(0.02, organism.assessment.fitness) })));
}

export function advanceGeneration({ population, environment, generation, nextOrganismId, rng, history, maxPopulation = 360 }) {
  const events = [];
  const assessed = [];
  let mutationCount = 0;
  const mutationGenes = new Set();
  const deathsByPressure = { temperature: 0, food: 0, predation: 0, age: 0, health: 0 };

  for (const organism of population) {
    ageOrganism(organism, environment);
    const assessment = evaluateOrganism(organism, environment);
    organism.assessment = assessment;
    const ageLimit = organism.phenotype.lifespan * 0.92;
    if (organism.state.age > ageLimit) {
      deathsByPressure.age += 1;
      continue;
    }
    if (organism.state.health <= 0.08) {
      deathsByPressure.health += 1;
      continue;
    }
    if (rng.chance(assessment.survivalProbability)) assessed.push(organism);
    else deathsByPressure.predation += 1;
  }

  const survivors = assessed.filter(canReproduce).slice(0, maxPopulation);
  if (survivors.length === 0) {
    const snapshot = createSnapshot({ generation: generation + 1, population: [], environment, events: [{ type: 'extinction', generation: generation + 1, message: 'No individuals survived the current pressures.' }], extinct: true, previousPopulation: population.length });
    appendHistory(history, snapshot);
    return { population: [], generation: generation + 1, events: snapshot.events, snapshot, extinct: true, mutationCount: 0, nextOrganismId };
  }

  const averageFitness = survivors.reduce((sum, organism) => sum + organism.assessment.fitness, 0) / survivors.length;
  const carryingCapacity = Math.round(30 + environment.food * 190);
  const desiredPopulation = Math.round(survivors.length * (0.72 + averageFitness * 0.58));
  const targetPopulation = Math.max(1, Math.min(maxPopulation, carryingCapacity, Math.max(4, desiredPopulation)));
  const nextPopulation = survivors.slice(0, targetPopulation);

  if (nextPopulation.length < targetPopulation && survivors.length > 1) {
    let id = nextOrganismId;
    while (nextPopulation.length < targetPopulation) {
      const parentA = weightedParent(survivors, rng);
      const parentB = weightedParent(survivors, rng);
      const result = reproducePair({ parentA, parentB, id, generation: generation + 1, mutationRate: environment.mutationRate, rng });
      nextPopulation.push(result.organism);
      mutationCount += result.mutationEvents.length;
      for (const event of result.mutationEvents) mutationGenes.add(event.geneId);
      id += 1;
    }
  }

  for (const organism of nextPopulation) {
    const assessment = evaluateOrganism(organism, environment);
    organism.assessment = assessment;
  }

  const pressureSummary = Object.entries(deathsByPressure).filter(([, count]) => count > 0).map(([key, count]) => `${key}: ${count}`).join(', ');
  if (pressureSummary) events.push({ type: 'selection', generation: generation + 1, message: `Survival filtering removed ${population.length - survivors.length} specimens (${pressureSummary}).` });
  if (mutationCount > 0) {
    const loci = [...mutationGenes].map((geneId) => GENE_BY_ID[geneId].label).join(', ');
    events.push({ type: 'mutation', generation: generation + 1, count: mutationCount, message: `${mutationCount} mutation event${mutationCount === 1 ? '' : 's'} occurred during reproduction${loci ? ` at ${loci}` : ''}.` });
  }

  const snapshot = createSnapshot({ generation: generation + 1, population: nextPopulation, environment, events, extinct: false, previousPopulation: population.length });
  history.push(snapshot);
  return { population: nextPopulation, generation: generation + 1, events, snapshot, extinct: false, mutationCount, nextOrganismId: nextOrganismId + Math.max(0, targetPopulation - survivors.length) };
}
