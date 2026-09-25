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
  return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
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

  refreshCurrentSnapshot(event) {
    const previous = this.history.at(-1);
    const nextEvents = [...(previous?.events ?? []), event].slice(-20);
    this.history[this.history.length - 1] = createSnapshot({
      generation: this.generation,
      population: this.population,
      environment: this.environment,
      events: nextEvents,
      previousPopulation: previous?.population ?? this.population.length,
    });
  }

  getOrganism(id) {
    const organism = this.population.find((candidate) => candidate.id === Number(id));
    return organism ? copy(organism) : null;
  }

  step(generations = 1) {
    const requested = Math.max(1, Math.min(1000, Math.floor(generations) || 1));
    for (let index = 0; index < requested; index += 1) {
      if (this.population.length === 0) break;
      const result = advanceGeneration({
        population: this.population,
        environment: this.environment,
        generation: this.generation,
        nextOrganismId: this.nextOrganismId,
        rng: this.rng,
        history: this.history,
        maxPopulation: this.maxPopulation,
      });
      this.population = result.population;
      this.generation = result.generation;
      this.nextOrganismId = result.nextOrganismId;
      this.events.push(...result.events);
    }
    return this.getSnapshot();
  }

  setEnvironment(changes) {
    this.environment = normalizeEnvironment({ ...this.environment, ...changes });
    const event = { type: 'environment', generation: this.generation, message: `Environment changed: ${this.environment.temperature}°C, food ${Math.round(this.environment.food * 100)}%, predation ${Math.round(this.environment.predation * 100)}%.` };
    this.events.push(event);
    this.refreshCurrentSnapshot(event);
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
    const event = { type: 'edit', generation: this.generation, organismId: organism.id, message: `Genome changed for specimen #${organism.id}.`, before, after: organism.genome };
    this.events.push(event);
    this.refreshCurrentSnapshot(event);
    return { ok: true, snapshot: this.getSnapshot() };
  }

  mutateOrganism(id, mutationRate = this.environment.mutationRate ?? DEFAULT_ENVIRONMENT.mutationRate) {
    const organism = this.population.find((candidate) => candidate.id === Number(id));
    if (!organism) return { ok: false, error: 'Specimen not found.' };
    const result = mutateGenome(organism.genome, mutationRate, this.rng);
    organism.genome = result.genome;
    refreshOrganism(organism);
    const event = { type: 'mutation', generation: this.generation, organismId: organism.id, count: result.count, message: `${result.count} manual mutation event${result.count === 1 ? '' : 's'} introduced into specimen #${organism.id}.` };
    this.events.push(event);
    this.refreshCurrentSnapshot(event);
    return { ok: true, events: result.events, snapshot: this.getSnapshot() };
  }

  cloneOrganism(id) {
    const source = this.population.find((candidate) => candidate.id === Number(id));
    if (!source) return { ok: false, error: 'Specimen not found.' };
    if (this.population.length >= this.maxPopulation) return { ok: false, error: 'The dish is at its population capacity.' };
    const clone = createOrganism({ id: this.nextOrganismId, genome: source.genome, generation: this.generation, parents: [source.id], position: { x: this.rng.range(0.12, 0.88), y: this.rng.range(0.12, 0.88) }, rng: this.rng });
    this.population.push(clone);
    this.nextOrganismId += 1;
    const event = { type: 'clone', generation: this.generation, organismId: clone.id, message: `Specimen #${clone.id} cloned from #${source.id}.` };
    this.events.push(event);
    this.refreshCurrentSnapshot(event);
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
    if (!data || !Array.isArray(data.population)) throw new Error('Saved experiment is missing population state.');
    if (!Number.isInteger(data.rngState) || data.rngState < 0) throw new Error('Saved experiment is missing its reproducible random state.');
    if (!Number.isInteger(data.generation) || data.generation < 0) throw new Error('Saved experiment has an invalid generation.');
    if (!Number.isInteger(data.nextOrganismId) || data.nextOrganismId < 1) throw new Error('Saved experiment has an invalid organism counter.');
    if (!Array.isArray(data.history) || !Array.isArray(data.events)) throw new Error('Saved experiment is missing its history.');
    const invalidOrganism = data.population.find((organism) => !validateGenome(organism?.genome).valid);
    if (invalidOrganism) throw new Error('Saved experiment contains an invalid genome.');
    const invalidSnapshot = data.history.find((item) => !Number.isInteger(item?.generation) || !Number.isInteger(item?.population) || !item?.averages);
    if (invalidSnapshot) throw new Error('Saved experiment contains an invalid history snapshot.');
    const engine = new GenesisEngine({ seed: data.seed, populationSize: 1, maxPopulation: data.maxPopulation, environment: data.environment });
    engine.seed = normalizeSeed(data.seed);
    engine.environment = normalizeEnvironment(data.environment);
    engine.generation = data.generation;
    engine.nextOrganismId = data.nextOrganismId;
    engine.population = copy(data.population);
    engine.history = data.history.length ? copy(data.history) : [createSnapshot({ generation: engine.generation, population: engine.population, environment: engine.environment, events: [] })];
    engine.events = copy(data.events);
    engine.rng.setState(data.rngState);
    return engine;
  }
}

export function createDefaultEngine() {
  return new GenesisEngine();
}
