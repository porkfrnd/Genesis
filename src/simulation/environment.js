export const DEFAULT_ENVIRONMENT = Object.freeze({
  temperature: 18,
  food: 0.72,
  predation: 0.18,
  mutationRate: 0.08,
  name: 'Temperate field',
});

const LIMITS = Object.freeze({
  temperature: [-20, 48],
  food: [0, 1],
  predation: [0, 1],
  mutationRate: [0, 1],
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function normalizeEnvironment(environment = {}) {
  return {
    temperature: clamp(Number(environment.temperature ?? DEFAULT_ENVIRONMENT.temperature), ...LIMITS.temperature),
    food: clamp(Number(environment.food ?? DEFAULT_ENVIRONMENT.food), ...LIMITS.food),
    predation: clamp(Number(environment.predation ?? DEFAULT_ENVIRONMENT.predation), ...LIMITS.predation),
    mutationRate: clamp(Number(environment.mutationRate ?? DEFAULT_ENVIRONMENT.mutationRate), ...LIMITS.mutationRate),
    name: environment.name ?? DEFAULT_ENVIRONMENT.name,
  };
}

export function getEnvironmentSummary(environment) {
  const normalized = normalizeEnvironment(environment);
  const temperatureLabel = normalized.temperature < 8 ? 'Cold' : normalized.temperature > 30 ? 'Warm' : 'Temperate';
  const foodLabel = normalized.food < 0.25 ? 'Scarce' : normalized.food < 0.55 ? 'Limited' : 'Abundant';
  const predationLabel = normalized.predation < 0.2 ? 'Low' : normalized.predation < 0.55 ? 'Moderate' : 'High';
  return { ...normalized, temperatureLabel, foodLabel, predationLabel };
}
