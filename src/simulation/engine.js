import { DEFAULT_ENVIRONMENT, normalizeEnvironment } from './environment.js';
import { advanceGeneration } from './evolution.js';
import { createSnapshot } from './history.js';
import { mutateGenome } from './mutation.js';
import { createOrganism, createPopulation, refreshOrganism } from './organism.js';
import { createSeededRandom, normalizeSeed } from './random.js';
import { validateGenome } from './validation.js';

const DEFAULT_CONFIG = Object.freeze({
  seed: 482193,
  populationSize: 120,
  maxPopulation: 360,
});

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

export class GenesisEngine {
  constructor(config = {}) {
    const seed = normalizeSeed(config.seed ?? DEFAULT_CONFIG.seed);
    this.seed = seed;
    this.maxPopulation = Math.max(20, Math.min(1000, config.maxPopulation ?? DEFAULT_CONFIG.maxPopulation));
    this.environment = normalizeEnvironment({ ...DEFAULT_ENVIRONMENT, ...config.environment });
    this.rng = createSeededRandom(seed);
    this.generation = 0;
    this.nextOrganismId = Math.max(1, config.populationSize ?? DEFAULT_CONFIG.populationSize) + 1;
    this.population = createPopulation({ count: config.populationSize ?? DEFAULT_CONFIG.populationSize, seed });
    this.history = [createSnapshot({ generation: 0, population: this.population, environment: this.environment, events: [{ type: 'created', generation: 0, message: 'Initial population created from the experiment seed.' }] })];
    this.events = [...this.history[0].events];
  }

  getSnapshot() {
    const current = this.history.at(-1);
    return copy({
      seed: this.seed,
      generation: this.generation,
      environment: this.environment,
      population: this.population,
      stats: current,
      history: this.history,
      events: this.events,
      extinct: this.population.length === 0,
    });
  }

  getOrganism(id) {
    const organism = this.population.find((candidate) => candidate.id === Number(id));
    return organism ? copy(organism) : null;
  }

  step(generations = 1) {
    const requested = Math.max(1, Math.min(1000, Math.floor(generations) || 1));
    let lastSnapshot = this.history.at(-1);
    for (let index = 0; index < requested; index += 1) {
      if (this.population.length === 0) break;
      const result = advanceGeneration({
        population: this.population,
        environment: this.environment,
        generation: this.generation,
        nextOrganismId: this.nextOrganismId,
        rng: this.rng,
        history: this.history,
        previousSnapshot: lastSnapshot,
        maxPopulation: this.maxPopulation,
      });
      this.population = result.population;
      this.generation = result.generation;
      this.nextOrganismId = result.nextOrganismId;
      this.events.push(...result.events);
      if (this.events.length > 240) this.events.splice(0, this.events.length - 240);
      lastSnapshot = result.snapshot;
    }
    return this.getSnapshot();
  }

  setEnvironment(changes) {
    this.environment = normalizeEnvironment({ ...this.environment, ...changes });
    return this.getSnapshot();
  }

  editGenome(id, genome) {
    const organism = this.population.find((candidate) => candidate.id === Number(id));
    if (!organism) return { ok: false, error: 'Specimen not found.' };
    const validation = validateGenome(genome);
    if (!validation.valid) return { ok: false, error: validation.errors.join(' ') };
    const before = copy(organism.genome);
    organism.genome = copy(genome);
    refreshOrganism(organism);
    this.events.push({ type: 'edit', generation: this.generation, organismId: organism.id, message: `Genome changed for specimen #${organism.id}.`, before, after: organism.genome });
    return { ok: true, snapshot: this.getSnapshot() };
  }

  mutateOrganism(id, mutationRate = this.environment.mutationRate) {
    const organism = this.population.find((candidate) => candidate.id === Number(id));
    if (!organism) return { ok: false, error: 'Specimen not found.' };
    const result = mutateGenome(organism.genome, mutationRate, this.rng);
    organism.genome = result.genome;
    refreshOrganism(organism);
    this.events.push({ type: 'mutation', generation: this.generation, organismId: organism.id, count: result.count, message: `${result.count} manual mutation event${result.count === 1 ? '' : 's'} introduced into specimen #${organism.id}.` });
    return { ok: true, events: result.events, snapshot: this.getSnapshot() };
  }

  cloneOrganism(id) {
    const source = this.population.find((candidate) => candidate.id === Number(id));
    if (!source) return { ok: false, error: 'Specimen not found.' };
    const clone = createOrganism({ id: this.nextOrganismId, genome: source.genome, generation: this.generation, parents: [source.id], position: { x: this.rng.range(0.12, 0.88), y: this.rng.range(0.12, 0.88) }, rng: this.rng });
    this.population.push(clone);
    this.nextOrganismId += 1;
    this.events.push({ type: 'clone', generation: this.generation, organismId: clone.id, message: `Specimen #${clone.id} cloned from #${source.id}.` });
    return { ok: true, snapshot: this.getSnapshot() };
  }

  reset(seed = this.seed) {
    const next = new GenesisEngine({ seed, populationSize: this.population.length || DEFAULT_CONFIG.populationSize, maxPopulation: this.maxPopulation, environment: this.environment });
    this.seed = next.seed;
    this.environment = next.environment;
    this.rng = next.rng;
    this.generation = next.generation;
    this.nextOrganismId = next.nextOrganismId;
    this.population = next.population;
    this.history = next.history;
    this.events = next.events;
    return this.getSnapshot();
  }

  serialize() {
    return {
      version: 1,
      seed: this.seed,
      environment: this.environment,
      generation: this.generation,
      nextOrganismId: this.nextOrganismId,
      maxPopulation: this.maxPopulation,
      rngState: this.rng.getState(),
      population: this.population,
      history: this.history,
      events: this.events,
    };
  }

  static fromSerialized(data) {
    const engine = new GenesisEngine({ seed: data?.seed, populationSize: 1, maxPopulation: data?.maxPopulation, environment: data?.environment });
    const validation = validateGenome(data?.population?.[0]?.genome);
    if (!validation.valid) throw new Error('Saved experiment contains an invalid genome.');
    engine.seed = normalizeSeed(data.seed);
    engine.environment = normalizeEnvironment(data.environment);
    engine.generation = Number.isInteger(data.generation) && data.generation >= 0 ? data.generation : 0;
    engine.nextOrganismId = Number.isInteger(data.nextOrganismId) ? data.nextOrganismId : engine.population.length + 1;
    engine.population = copy(data.population);
    engine.history = Array.isArray(data.history) && data.history.length ? copy(data.history) : engine.history;
    engine.events = Array.isArray(data.events) ? copy(data.events) : [];
    engine.rng.setState(data.rngState ?? engine.seed);
    return engine;
  }
}

export function createDefaultEngine() {
  return new GenesisEngine();
}
