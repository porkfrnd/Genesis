import { GENE_IDS } from '../data/genes.js';
import { evaluateOrganism } from './selection.js';

const phenotypeKeys = ['speed', 'size', 'pigmentation', 'metabolism', 'coldTolerance', 'energyCapacity', 'lifespan', 'reproductiveRate', 'predationEscape'];

function average(values) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

export function computeAlleleFrequencies(population) {
  return Object.fromEntries(GENE_IDS.map((geneId) => {
    const counts = {};
    for (const organism of population) {
      for (const allele of organism.genome[geneId]) counts[allele] = (counts[allele] ?? 0) + 1;
    }
    const total = Math.max(1, population.length * 2);
    return [geneId, Object.fromEntries(Object.entries(counts).map(([allele, count]) => [allele, Number((count / total).toFixed(3))]))];
  }));
}

export function createSnapshot({ generation, population, environment, events = [], extinct = false, previousPopulation = population.length }) {
  const averages = Object.fromEntries(phenotypeKeys.map((key) => [key, average(population.map((organism) => organism.phenotype[key]))]));
  const fitness = population.map((organism) => evaluateOrganism(organism, environment).fitness);
  const alleleFrequencies = computeAlleleFrequencies(population);
  const survivalRate = previousPopulation === 0 ? 0 : Number((population.length / previousPopulation).toFixed(3));
  return {
    generation,
    population: population.length,
    extinct,
    averages,
    alleleFrequencies,
    averageFitness: average(fitness),
    survivalRate,
    dominantAlleles: Object.fromEntries(GENE_IDS.map((geneId) => {
      const frequencies = alleleFrequencies[geneId];
      return [geneId, Object.entries(frequencies).sort((left, right) => right[1] - left[1])[0]?.[0] ?? '—'];
    })),
    events: events.slice(-20),
  };
}

export function appendHistory(history, snapshot) {
  history.push(snapshot);
  if (history.length > 1200) history.splice(0, history.length - 1200);
  return snapshot;
}

export function traitDistribution(population, key) {
  return population.map((organism) => organism.phenotype[key]);
}
