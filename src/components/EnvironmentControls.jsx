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
        <div><p className="eyebrow">ENVIRONMENT / CONTROLLED PRESSURE</p><h2 id="environment-title">Conditions</h2></div>
        <span className="environment-chip">{summary.name}</span>
      </div>
      <p className="module-intro">Change the pressure, then let selection act on existing variation.</p>
      <div className="range-stack">
        <RangeControl id="temperature" label="Temperature" value={environment.temperature} min={-20} max={48} step={1} display={`${environment.temperature}°C`} onChange={(value) => onChange({ temperature: value, name: value < 8 ? 'Cold field' : value > 30 ? 'Warm field' : 'Temperate field' })} help="Cold pressure rises below 18°C." />
        <RangeControl id="food" label="Food availability" value={environment.food} min={0} max={1} step={0.01} display={`${Math.round(environment.food * 100)}%`} onChange={(value) => onChange({ food: value })} help="Lower food increases energy stress." />
        <RangeControl id="predation" label="Predation pressure" value={environment.predation} min={0} max={1} step={0.01} display={`${Math.round(environment.predation * 100)}%`} onChange={(value) => onChange({ predation: value })} help="Swift, less visible specimens escape more often." />
        <RangeControl id="mutation-rate" label="Mutation rate" value={environment.mutationRate} min={0} max={1} step={0.01} display={`${Math.round(environment.mutationRate * 100)}%`} onChange={(value) => onChange({ mutationRate: value })} help="Mutation creates variation; it does not choose a useful trait." />
      </div>
      <div className="pressure-summary"><span>Cold load</span><strong>{Math.max(0, Math.round((18 - environment.temperature) / 28 * 100))}%</strong><span>Food stress</span><strong>{Math.max(0, Math.round((1 - environment.food) * 100))}%</strong></div>
    </section>
  );
}
