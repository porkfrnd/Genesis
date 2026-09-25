import { useMemo, useState } from 'react';
import { calculatePhenotype, explainPhenotype, phenotypeDelta } from '../simulation/phenotype.js';

function DeltaRow({ item }) {
  const sign = item.delta > 0 ? '+' : '';
  return <div className="delta-row"><span>{item.label}</span><span>{item.before}</span><b className={item.delta > 0 ? 'delta-up' : item.delta < 0 ? 'delta-down' : ''}>{sign}{item.delta}</b><span>{item.after}</span></div>;
}

export default function GenomeEditor({ organism, onApply, onMutate, onClone }) {
  const [message, setMessage] = useState('');
  const draftGenome = useMemo(() => organism?.genome ?? null, [organism?.genome]);
  const draftPhenotype = useMemo(() => draftGenome ? calculatePhenotype(draftGenome) : null, [draftGenome]);
  const basePhenotype = organism?.phenotype;
  const deltas = draftPhenotype && basePhenotype ? phenotypeDelta(basePhenotype, draftPhenotype) : [];
  if (!organism || !draftGenome) return <section className="editor-module empty-inspector"><span className="empty-mark">⌬</span><strong>No specimen selected</strong><span>The genome editor follows the selected organism.</span></section>;

  const apply = () => {
    const result = onApply(draftGenome);
    setMessage(result?.ok ? 'Genome change applied' : result?.error ?? 'Genome change applied');
  };

  return (
    <section className="editor-module" aria-labelledby="editor-title">
      <div className="module-heading compact-heading"><div><p className="eyebrow">GENOME EDITOR / CAUSAL READOUT</p><h2 id="editor-title">Change a locus</h2></div><span className="mono-label">DRAFT</span></div>
      <div className="editor-specimen"><span className="specimen-id">#{String(organism.id).padStart(3, '0')}</span><span>Generation {organism.generation}</span><span>{organism.genome.speed.join('/')} speed pair</span></div>
      <div className="phenotype-compare" aria-label="Phenotype comparison">
        <div className="phenotype-head"><span>Trait</span><span>Before</span><span>Change</span><span>After</span></div>
        {deltas.map((item) => <DeltaRow item={item} key={item.key} />)}
      </div>
      <div className="editor-actions"><button className="primary-control" type="button" onClick={apply}>Apply genome change</button><button className="secondary-control" type="button" onClick={() => { onMutate(); setMessage('Mutation applied to selected specimen'); }}>Introduce mutation</button><button className="secondary-control" type="button" onClick={() => { onClone(); setMessage('Specimen cloned'); }}>Clone specimen</button></div>
      {message && <p className="editor-message" role="status">{message}</p>}
      <div className="causal-chain"><p className="eyebrow">WHY THIS PHENOTYPE</p><ol>{explainPhenotype(draftGenome).map((line) => <li key={line}>{line}</li>)}</ol></div>
      <div className="editor-footnote"><span>MODEL NOTE</span><p>Predicted effects describe this educational model only. They do not predict a real organism’s outcome.</p></div>
    </section>
  );
}
