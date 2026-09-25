const EXPERIMENTS_KEY = 'genesis.experiments.v1';
const PROGRESS_KEY = 'genesis.progress.v1';
const SETTINGS_KEY = 'genesis.settings.v1';
const VERSION = 1;

function storageAvailable() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function read(key, fallback, validate = () => true) {
  if (!storageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== VERSION || !validate(parsed.data)) return fallback;
    return parsed.data;
  } catch {
    return fallback;
  }
}

function write(key, data) {
  if (!storageAvailable()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify({ version: VERSION, data }));
    return true;
  } catch {
    return false;
  }
}

export function loadExperiments() {
  return read(EXPERIMENTS_KEY, [], (value) => Array.isArray(value) && value.every((item) => item && typeof item.id === 'string' && item.engineState));
}

export function saveExperiment({ name, state, stats }) {
  const experiments = loadExperiments();
  const experiment = {
    id: `exp-${state.seed}-${state.generation}-${Date.now()}`,
    name: name.trim() || 'Untitled experiment',
    savedAt: new Date().toISOString(),
    seed: state.seed,
    generation: state.generation,
    population: state.population,
    environment: state.environment,
    stats,
    engineState: state,
  };
  const next = [experiment, ...experiments.filter((item) => item.id !== experiment.id)].slice(0, 12);
  write(EXPERIMENTS_KEY, next);
  return experiment;
}

export function deleteExperiment(id) {
  write(EXPERIMENTS_KEY, loadExperiments().filter((experiment) => experiment.id !== id));
}

export function clearExperiments() {
  if (storageAvailable()) window.localStorage.removeItem(EXPERIMENTS_KEY);
}

export function loadProgress() {
  const progress = read(PROGRESS_KEY, { completedLessons: [], completedChallenges: [] }, (value) => value && Array.isArray(value.completedLessons) && Array.isArray(value.completedChallenges));
  return {
    completedLessons: Array.isArray(progress.completedLessons) ? progress.completedLessons : [],
    completedChallenges: Array.isArray(progress.completedChallenges) ? progress.completedChallenges : [],
  };
}

export function saveProgress(progress) {
  const next = {
    completedLessons: [...new Set(progress.completedLessons ?? [])],
    completedChallenges: [...new Set(progress.completedChallenges ?? [])],
  };
  write(PROGRESS_KEY, next);
  return next;
}

export function toggleLesson(id, progress) {
  const completedLessons = progress.completedLessons.includes(id)
    ? progress.completedLessons.filter((lessonId) => lessonId !== id)
    : [...progress.completedLessons, id];
  return saveProgress({ ...progress, completedLessons });
}

export function completeChallenge(id, progress) {
  return saveProgress({ ...progress, completedChallenges: [...new Set([...progress.completedChallenges, id])] });
}

export function loadSettings() {
  return read(SETTINGS_KEY, { theme: 'dark', motion: 'system' }, (value) => value && (value.theme === 'dark' || value.theme === 'light') && (value.motion === 'system' || value.motion === 'reduced'));
}

export function saveSettings(settings) {
  write(SETTINGS_KEY, settings);
  return settings;
}
