export default function SimulationControls({ running, onToggle, onStep, speed, onSpeedChange, seed, onSeedChange, onReset, generation, population }) {
  return (
    <section className="control-module" aria-labelledby="simulation-controls-title">
      <div className="module-heading compact-heading">
        <div><p className="eyebrow">TIME CONTROL</p><h2 id="simulation-controls-title">Run sequence</h2></div>
        <span className={`run-indicator ${running ? 'is-running' : ''}`}><i />{running ? 'Running' : 'Paused'}</span>
      </div>
      <div className="control-grid">
        <button className="primary-control" type="button" onClick={onToggle} disabled={population === 0}>
          <span className="control-symbol" aria-hidden="true">{running ? 'Ⅱ' : '▶'}</span>
          {running ? 'Pause evolution' : 'Evolve population'}
        </button>
        <button className="secondary-control" type="button" onClick={() => onStep(1)} disabled={population === 0}>+1 gen</button>
        <button className="secondary-control" type="button" onClick={() => onStep(50)} disabled={population === 0}>+50 gen</button>
        <button className="secondary-control" type="button" onClick={() => onStep(100)} disabled={population === 0}>+100 gen</button>
        <button className="secondary-control" type="button" onClick={() => onStep(1000)} disabled={population === 0}>+1000 gen</button>
      </div>
      <div className="speed-row">
        <label htmlFor="simulation-speed">Simulation speed</label>
        <select id="simulation-speed" value={speed} onChange={(event) => onSpeedChange(Number(event.target.value))}>
          <option value={1}>1× / observe</option>
          <option value={10}>10× / study</option>
          <option value={100}>100× / fast</option>
          <option value={1000}>1000× / batch</option>
        </select>
      </div>
      <div className="seed-row">
        <label htmlFor="experiment-seed">Experiment seed</label>
        <div className="seed-input-wrap">
          <input id="experiment-seed" type="number" min="0" max="4294967295" inputMode="numeric" value={seed} onChange={(event) => onSeedChange(event.target.value)} aria-describedby="seed-help" />
          <button type="button" className="text-control" onClick={onReset}>Reset run</button>
        </div>
        <p id="seed-help" className="field-help">Same seed + same starting conditions = same run.</p>
      </div>
      <div className="generation-strip"><span>GEN</span><strong>{generation.toLocaleString()}</strong><span>POP</span><strong>{population.toLocaleString()}</strong></div>
    </section>
  );
}
