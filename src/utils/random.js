export function normalizeSeed(seed) {
  if (typeof seed === 'number' && Number.isFinite(seed)) return Math.floor(Math.abs(seed)) >>> 0;
  const parsed = Number.parseInt(String(seed ?? ''), 10);
  return Number.isFinite(parsed) ? Math.abs(parsed) >>> 0 : 482193;
}

export function createRng(seed = 482193) {
  let state = normalizeSeed(seed);

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min, max) => Math.floor(next() * (max - min + 1)) + min;
  const range = (min, max) => min + (max - min) * next();
  const chance = (probability) => next() < probability;
  const pick = (items) => items[Math.floor(next() * items.length)];

  const shuffle = (items) => {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(next() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  };

  const weightedPick = (entries) => {
    const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
    let cursor = next() * total;
    for (const entry of entries) {
      cursor -= entry.weight;
      if (cursor <= 0) return entry.value;
    }
    return entries.at(-1)?.value;
  };

  return {
    next,
    int,
    range,
    chance,
    pick,
    shuffle,
    weightedPick,
    getState: () => state,
    setState: (nextState) => {
      state = normalizeSeed(nextState);
    },
  };
}
