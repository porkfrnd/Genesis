const STEP_COPY = [
  {
    eyebrow: 'STEP 1 / MEET THE SPECIMEN',
    title: 'Start with one organism',
    body: 'Specimen #001 is selected. Open its genome to see which versions of five genes give it its traits.',
    action: 'Open the genome editor',
  },
  {
    eyebrow: 'STEP 2 / CHANGE ONE TRAIT',
    title: 'Make one visible change',
    body: 'Choose a gene such as movement speed, preview the effect, then apply the allele change.',
    action: 'Choose a gene',
  },
  {
    eyebrow: 'STEP 3 / ADD PRESSURE',
    title: 'Give the population a challenge',
    body: 'Lower the temperature or change food and predation. The environment will favor different inherited traits.',
    action: 'Try a cold environment',
  },
  {
    eyebrow: 'STEP 4 / RUN THE EXPERIMENT',
    title: 'Let selection act',
    body: 'Run 10 generations first. Watch the generation counter and population change before going faster.',
    action: 'Run 10 generations',
  },
  {
    eyebrow: 'EXPERIMENT READY',
    title: 'Compare, then explain',
    body: 'Open Evolution to compare the initial and current measurements, then take the matching lesson in Courses.',
    action: 'Compare this experiment',
  },
];

export default function ExperimentGuide({ open, onToggle, step, selectedId, onNavigate, onRun, onQuickCold, onEnvironment }) {
  if (!open) {
    return <div className="guide-collapsed"><button className="guide-toggle" type="button" onClick={onToggle}><span className="guide-toggle-mark" aria-hidden="true">+</span>Show the experiment guide</button></div>;
  }

  const current = STEP_COPY[Math.min(step, STEP_COPY.length - 1)];
  const isFinal = step === STEP_COPY.length - 1;
  const action = () => {
    if (step === 0) onNavigate('genome');
    if (step === 1) onNavigate('genome');
    if (step === 2) onQuickCold();
    if (step === 3) onRun(10);
    if (isFinal) onNavigate('evolution');
  };

  return (
    <section className="experiment-guide" aria-labelledby="experiment-guide-title">
      <div className="guide-rail" aria-hidden="true">
        {STEP_COPY.slice(0, 4).map((item, index) => <span className={index <= step ? 'is-complete' : ''} key={item.eyebrow} />)}
      </div>
      <div className="guide-copy">
        <p className="eyebrow">{current.eyebrow}</p>
        <h2 id="experiment-guide-title">{current.title}</h2>
        <p>{current.body}</p>
        <div className="guide-actions">
          <button className="primary-control guide-primary" type="button" onClick={action}>{current.action}</button>
          {step === 2 && <button className="secondary-control" type="button" onClick={() => onEnvironment({ temperature: 18, food: 0.72, predation: 0.18, name: 'Temperate field' })}>Use baseline instead</button>}
          {step === 3 && <button className="secondary-control" type="button" onClick={() => onRun(50)}>Run 50 instead</button>}
          <button className="text-control guide-hide" type="button" onClick={onToggle}>Hide guide</button>
        </div>
      </div>
      <div className="guide-sidecar"><span className="guide-sidecar-label">YOUR RUN</span><strong>Specimen #{String(selectedId).padStart(3, '0')}</strong><span>Gene = instruction · allele = version · trait = visible feature</span><span>One change → one pressure → one comparison</span></div>
    </section>
  );
}
