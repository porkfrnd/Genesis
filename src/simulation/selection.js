const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export function evaluateOrganism(organism, environment) {
  const phenotype = organism.phenotype;
  const coldPressure = clamp((18 - environment.temperature) / 28);
  const heatPressure = clamp((environment.temperature - 28) / 22);
  const coldSurvival = clamp(1 - coldPressure * (1 - phenotype.coldTolerance / 100) * 0.94);
  const heatSurvival = clamp(1 - heatPressure * (0.18 + (100 - phenotype.coldTolerance) / 500));
  const foodNeed = 0.08 + phenotype.metabolism * 0.0012 + phenotype.size * 0.0008;
  const foodBalance = clamp((environment.food - foodNeed) / 0.72);
  const foodSurvival = clamp(0.12 + foodBalance * 0.88);
  const escapeChance = clamp(phenotype.predationEscape / 100);
  const predationSurvival = clamp(1 - environment.predation * (1 - escapeChance * 0.92));
  const healthFactor = clamp(organism.state.health * 0.65 + organism.state.energy * 0.35);
  const survivalProbability = clamp(coldSurvival * heatSurvival * foodSurvival * predationSurvival * (0.72 + healthFactor * 0.28));
  const reproductiveSuccess = clamp(survivalProbability * (0.56 + phenotype.reproductiveRate * 0.74) * (0.62 + organism.state.reproductiveReadiness * 0.38));
  const fitness = clamp(reproductiveSuccess * (0.72 + healthFactor * 0.28));

  return {
    fitness,
    survivalProbability,
    reproductiveSuccess,
    coldSurvival,
    foodSurvival,
    predationSurvival,
    heatSurvival,
    foodNeed,
    pressures: {
      cold: coldPressure,
      heat: heatPressure,
      food: foodBalance,
      predation: 1 - predationSurvival,
    },
    explanation: `Fitness ${(fitness * 100).toFixed(0)}% combines survival (${(survivalProbability * 100).toFixed(0)}%) with reproductive success under the current environment.`,
  };
}

export function fitnessLabel(fitness) {
  if (fitness >= 0.72) return 'High';
  if (fitness >= 0.42) return 'Moderate';
  return 'Low';
}
