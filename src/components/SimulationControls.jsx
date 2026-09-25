export default function SimulationControls({ running, onToggle, onStep, speed, onSpeedChange, seed, onSeedChange, onReset, generation, population }) {
  return (
    <section className="control-module" aria-labelledby="simulation-controls-title">
      <div className="module-heading compact-heading">
        <div><p className="eyebrow">NEXT ACTION</p><h2 id="simulation-controls-title">Run the experiment</h2></div>
        <span className={`run-indicator ${running ? 'is-running' : ''}`}><i />{running ? 'Running' : 'Paused'}</span>
      </div>
      <p className="module-intro">Start with a small batch. You can always run more later.</p>
      <div className="control-grid">
        <button className="primary-control" type="button" onClick={() => onStep(10)} disabled={population === 0}>Run 10 generations</button>
        <button className="secondary-control" type="button" onClick={onToggle} disabled={population === 0}>{running ? 'Pause continuous run' : 'Run continuously'}</button>
        <button className="secondary-control" type="button" onClick={() => onStep(1)} disabled={population === 0}>Run 1 generation</button>
      </div>
      <details className="advanced-controls">
        <summary>More run controls</summary>
        <div className="control-grid advanced-control-grid">
          <button className="secondary-control" type="button" onClick={() => onStep(50)} disabled={population === 0}>+50 generations</button>
          <button className="secondary-control" type="button" onClick={() => onStep(100)} disabled={population === 0}>+100 generations</button>
          <button className="secondary-control" type="button" onClick={() => onStep(1000)} disabled={population === 0}>+1000 generations</button>
        </div>
        <div className="speed-row">
          <label htmlFor="simulation-speed">Continuous speed</label>
          <select id="simulation-speed" value={speed} onChange={(event) => onSpeedChange(Number(event.target.value))}>
            <option value={1}>1× · observe each generation</option>
            <option value={10}>10× · study the run</option>
            <option value={100}>100× · move quickly</option>
            <option value={1000}>1000× · batch mode</option>
          </select>
        </div>
      </details>
      <details className="advanced-controls">
        <summary>Seed and repeatability</summary>
        <div className="seed-row">
          <label htmlFor="experiment-seed">Experiment seed</label>
          <div className="seed-input-wrap">
            <input id="experiment-seed" type="number" min="0" max="4294967295" inputMode="numeric" value={seed} onChange={(event) => onSeedChange(event.target.value)} aria-describedby="seed-help" />
            <button type="button" className="text-control" onClick={onReset}>Reset run</button>
          </div>
          <p id="seed-help" className="field-help">The same seed and starting conditions repeat the same run.</p>
        </div>
      </details>
      <div className="generation-strip"><span>GEN</span><strong>{generation.toLocaleString()}</strong><span>POP</span><strong>{population.toLocaleString()}</strong></div>
    </section>
  );
}
