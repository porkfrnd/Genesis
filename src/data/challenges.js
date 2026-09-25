export const CHALLENGES = [
  {
    id: 'survive-the-cold',
    title: 'Survive the cold',
    objective: 'Maintain a viable population for 1,000 generations in a cold environment.',
    constraints: ['Temperature at or below -10°C', 'Mutation rate may be changed', 'No hidden starting population'],
    starting: 'Create a population, set the temperature, and run the experiment.',
    criteria: ['Generation is at least 1,000', 'Population is greater than 100'],
    evaluate(snapshot) {
      return snapshot.generation >= 1000 && snapshot.population.length > 100;
    },
    status(snapshot) {
      return `${snapshot.population.length} specimens at generation ${snapshot.generation}.`;
    },
  },
  {
    id: 'escape-predators',
    title: 'Outrun predation',
    objective: 'Increase average movement speed without collapsing the population.',
    constraints: ['Predation pressure at 0.60 or higher', 'Population must remain at least 20'],
    starting: 'Set predation, run 100 generations, and compare the initial and current speed.',
    criteria: ['Average speed rises by at least 8 model points', 'Current population is at least 20'],
    evaluate(snapshot, initialSnapshot) {
      return snapshot.generation >= 100 && snapshot.stats.averages.speed - initialSnapshot.stats.averages.speed >= 8 && snapshot.population.length >= 20;
    },
    status(snapshot, initialSnapshot) {
      return `Speed ${initialSnapshot.stats.averages.speed} → ${snapshot.stats.averages.speed}.`;
    },
  },
  {
    id: 'two-pops',
    title: 'Produce two visible populations',
    objective: 'Maintain genetic and visual diversity under a moderate environment.',
    constraints: ['Mutation rate at or above 0.05', 'Both pale and dark phenotypes remain represented'],
    starting: 'Raise mutation rate, run 80 generations, and inspect pigmentation.',
    criteria: ['Pale phenotype remains present', 'Dark phenotype remains present', 'Population is at least 40'],
    evaluate(snapshot) {
      const pale = snapshot.population.filter((organism) => organism.phenotype.pigmentation < 50).length;
      const dark = snapshot.population.filter((organism) => organism.phenotype.pigmentation >= 50).length;
      return snapshot.generation >= 80 && pale > 0 && dark > 0 && snapshot.population.length >= 40;
    },
    status(snapshot) {
      const pale = snapshot.population.filter((organism) => organism.phenotype.pigmentation < 50).length;
      return `${pale} pale / ${snapshot.population.length - pale} dark specimens.`;
    },
  },
  {
    id: 'tradeoff',
    title: 'Find the trade-off',
    objective: 'Keep a population alive while testing a high-cost trait.',
    constraints: ['Food below 0.40', 'Predation above 0.35'],
    starting: 'Set food and predation, edit a trait, and observe the measured costs.',
    criteria: ['Population remains non-empty for 20 generations', 'The research log records a selection event'],
    evaluate(snapshot) {
      return snapshot.generation >= 20 && snapshot.population.length > 0 && snapshot.events.some((event) => event.type === 'selection');
    },
    status(snapshot) {
      return `${snapshot.population.length} specimens after ${snapshot.generation} generations.`;
    },
  },
];
