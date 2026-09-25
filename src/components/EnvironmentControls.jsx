import { getEnvironmentSummary } from '../simulation/environment.js';

function RangeControl({ id, label, value, min, max, step, display, onChange, help }) {
  return (
    <label className="range-control" htmlFor={id}>
      <span className="range-label"><span>{label}</span><strong>{display}</strong></span>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      {help && <span className="field-help">{help}</span>}
    </label>
  );
}

export default function EnvironmentControls({ environment, onChange }) {
  const summary = getEnvironmentSummary(environment);
  return (
    <section className="control-module environment-module" aria-labelledby="environment-title">
      <div className="module-heading compact-heading">
        <div><p className="eyebrow">ENVIRONMENT</p><h2 id="environment-title">Set the challenge</h2></div>
        <span className="environment-chip">{summary.name}</span>
      </div>
      <p className="module-intro">Choose one pressure to change first. The population responds to the conditions you set.</p>
      <div className="scenario-buttons" aria-label="Environment presets">
        <button className="text-control" type="button" onClick={() => onChange({ temperature: 18, food: 0.72, predation: 0.18, name: 'Temperate field' })}>Baseline</button>
        <button className="text-control" type="button" onClick={() => onChange({ temperature: -10, name: 'Cold field' })}>Cold field</button>
        <button className="text-control" type="button" onClick={() => onChange({ predation: 0.60, name: 'Predator field' })}>Predator field</button>
      </div>
      <div className="range-stack">
        <RangeControl id="temperature" label="Temperature" value={environment.temperature} min={-20} max={48} step={1} display={`${environment.temperature}°C`} onChange={(value) => onChange({ temperature: value, name: value < 8 ? 'Cold field' : value > 30 ? 'Warm field' : 'Temperate field' })} help="Cold pressure rises below 18°C." />
        <RangeControl id="food" label="Food availability" value={environment.food} min={0} max={1} step={0.01} display={`${Math.round(environment.food * 100)}%`} onChange={(value) => onChange({ food: value })} help="Lower food makes energy harder to replace." />
        <RangeControl id="predation" label="Predation pressure" value={environment.predation} min={0} max={1} step={0.01} display={`${Math.round(environment.predation * 100)}%`} onChange={(value) => onChange({ predation: value })} help="Swift and less visible specimens escape more often." />
      </div>
      <details className="advanced-controls">
        <summary>Advanced: mutation rate</summary>
        <div className="range-stack advanced-range"><RangeControl id="mutation-rate" label="Mutation rate" value={environment.mutationRate} min={0} max={1} step={0.01} display={`${Math.round(environment.mutationRate * 100)}%`} onChange={(value) => onChange({ mutationRate: value })} help="Mutation creates variation; it does not choose a useful trait." /></div>
      </details>
      <div className="pressure-summary"><span>Cold load</span><strong>{Math.max(0, Math.round((18 - environment.temperature) / 28 * 100))}%</strong><span>Food stress</span><strong>{Math.max(0, Math.round((1 - environment.food) * 100))}%</strong></div>
    </section>
  );
}
