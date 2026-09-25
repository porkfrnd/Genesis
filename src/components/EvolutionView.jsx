import { useState } from 'react';
import AccessibleChart from './AccessibleChart.jsx';

function formatMetric(value) {
  return Number(value ?? 0).toFixed(1).replace(/\.0$/, '');
}

function savedPopulation(experiment) {
  if (Array.isArray(experiment.population)) return experiment.population.length;
  return experiment.stats?.population ?? 0;
}

function makePoints(values, width, height, maxValue = 100) {
  if (values.length < 2) return '';
  return values.map((value, index) => `${(index / (values.length - 1)) * width},${height - (Math.max(0, Math.min(maxValue, value)) / maxValue) * height}`).join(' ');
}

export default function EvolutionView({ snapshot, onSave, experiments, onLoad, onDelete }) {
  const [selectedGeneration, setSelectedGeneration] = useState(snapshot.generation);
  const [saveName, setSaveName] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const history = snapshot.history ?? [];
  const initial = history[0] ?? snapshot.stats;
  const current = history.at(-1) ?? snapshot.stats;
  const selected = history.find((item) => item.generation === selectedGeneration) ?? current;
  const traits = ['speed', 'size', 'pigmentation', 'coldTolerance', 'metabolism'];
  const deltas = traits.map((key) => ({ key, delta: Number(((current.averages?.[key] ?? 0) - (initial.averages?.[key] ?? 0)).toFixed(1)), before: initial.averages?.[key] ?? 0, after: current.averages?.[key] ?? 0 }));
  const largestShift = deltas.sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))[0];
  const populationValues = history.map((item) => item.population);
  const speedValues = history.map((item) => item.averages.speed);
  const coldValues = history.map((item) => item.averages.coldTolerance);
  const explanation = current.extinct ? `The population reached extinction at generation ${current.generation}.` : `${largestShift.key === 'coldTolerance' ? 'Cold tolerance' : largestShift.key} changed most in the measured comparison (${formatMetric(largestShift.before)} → ${formatMetric(largestShift.after)}). Individuals with higher fitness under the recorded environment left more offspring; the environment did not direct the change.`;

  return (
    <div className="view-stack evolution-view">
      <div className="view-intro"><div><p className="eyebrow">ANALYSIS / HISTORY OF A RUN</p><h1>What changed, and why?</h1><p>Read the run as a population history. Every number below comes from the engine’s recorded snapshots.</p></div><div className="generation-navigator"><label htmlFor="generation-select">Inspect generation</label><select id="generation-select" value={selectedGeneration} onChange={(event) => setSelectedGeneration(Number(event.target.value))}>{history.map((item) => <option key={item.generation} value={item.generation}>Generation {item.generation}</option>)}</select></div></div>
      <div className="comparison-panel"><div className="comparison-heading"><div><p className="eyebrow">BEFORE → AFTER</p><h2>{initial.generation === 0 ? 'Initial population' : `Generation ${initial.generation}`} to generation {current.generation}</h2></div><span className="comparison-arrow" aria-hidden="true">→</span><span className="seed-stamp">SEED {snapshot.seed}</span></div><div className="comparison-table"><div className="comparison-head"><span>Trait</span><span>Initial</span><span>Evolved</span><span>Shift</span></div>{deltas.map((item) => <div className="comparison-row" key={item.key}><span>{item.key === 'coldTolerance' ? 'Cold tolerance' : item.key}</span><strong>{formatMetric(item.before)}</strong><strong>{formatMetric(item.after)}</strong><b className={item.delta > 0 ? 'delta-up' : item.delta < 0 ? 'delta-down' : ''}>{item.delta > 0 ? '+' : ''}{item.delta}</b></div>)}</div><p className="data-explanation"><span className="explanation-mark">↳</span>{explanation}</p></div>
      <div className="chart-grid"><AccessibleChart title="Population over time" description="Actual population count at each recorded generation."><svg className="trace-chart" viewBox="0 0 640 180" role="img" aria-label="Population count over generations"><line x1="0" y1="165" x2="640" y2="165" className="chart-axis" /><polyline points={makePoints(populationValues, 640, 150, Math.max(1, ...populationValues))} className="trace-line trace-line-teal" /><text x="0" y="179">GEN 0</text><text x="580" y="179">GEN {current.generation}</text></svg></AccessibleChart><AccessibleChart title="Trait pressure" description="Average speed and cold tolerance across the same run."><svg className="trace-chart" viewBox="0 0 640 180" role="img" aria-label="Average speed and cold tolerance over generations"><line x1="0" y1="165" x2="640" y2="165" className="chart-axis" /><polyline points={makePoints(speedValues, 640, 150)} className="trace-line trace-line-amber" /><polyline points={makePoints(coldValues, 640, 150)} className="trace-line trace-line-coral" /><text x="0" y="179">0</text><text x="614" y="179">100</text></svg><div className="chart-legend"><span><i className="legend-line legend-line-amber" /> Speed</span><span><i className="legend-line legend-line-coral" /> Cold tolerance</span></div></AccessibleChart></div>
      <div className="selected-snapshot"><span>Viewing generation <strong>{selected.generation}</strong></span><span>Population <strong>{selected.population}</strong></span><span>Avg fitness <strong>{Math.round(selected.averageFitness * 100)}%</strong></span><span>Survival <strong>{Math.round(selected.survivalRate * 100)}%</strong></span></div>
      <div className="experiment-library"><div className="module-heading compact-heading"><div><p className="eyebrow">LOCAL ARCHIVE / REPRODUCIBLE RUNS</p><h2>Saved experiments</h2></div></div><div className="save-row"><label htmlFor="experiment-name">Name this run</label><input id="experiment-name" value={saveName} onChange={(event) => setSaveName(event.target.value)} placeholder="Cold world" /><button className="primary-control" type="button" onClick={() => { const saved = onSave(saveName); if (saved) { setSaveName(''); setSaveStatus(`Saved ${saved.name}.`); } }}>Save current state</button></div>{saveStatus && <p className="save-feedback" role="status">{saveStatus}</p>}{experiments.length ? <div className="experiment-list">{experiments.map((experiment) => <div className="experiment-row" key={experiment.id}><div><strong>{experiment.name}</strong><span>Seed {experiment.seed} · gen {experiment.generation} · pop {savedPopulation(experiment)}</span></div><div><button className="secondary-control" type="button" onClick={() => onLoad(experiment)}>Restore</button><button className="text-control danger-text" type="button" onClick={() => onDelete(experiment.id)}>Delete</button></div></div>)}</div> : <p className="empty-library">No saved experiments yet. Run the dish, then save the state to return to it later.</p>}</div>
    </div>
  );
}
