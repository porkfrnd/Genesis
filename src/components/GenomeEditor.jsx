import { useMemo, useState } from 'react';
import { calculatePhenotype, explainPhenotype, phenotypeDelta } from '../simulation/phenotype.js';

function DeltaRow({ item }) {
  const sign = item.delta > 0 ? '+' : '';
  return <div className="delta-row"><span>{item.label}</span><span>{item.before}</span><b className={item.delta > 0 ? 'delta-up' : item.delta < 0 ? 'delta-down' : ''}>{sign}{item.delta}</b><span>{item.after}</span></div>;
}

export default function GenomeEditor({ organism, draftGenome: providedGenome, onApply, onMutate, onClone, onCancel }) {
  const [message, setMessage] = useState('');
  const draftGenome = providedGenome ?? organism?.genome ?? null;
  const draftPhenotype = useMemo(() => draftGenome ? calculatePhenotype(draftGenome) : null, [draftGenome]);
  const basePhenotype = organism?.phenotype;
  const deltas = draftPhenotype && basePhenotype ? phenotypeDelta(basePhenotype, draftPhenotype) : [];
  const hasChanges = Boolean(organism && draftGenome && JSON.stringify(organism.genome) !== JSON.stringify(draftGenome));
  if (!organism || !draftGenome) return <section className="editor-module empty-inspector"><span className="empty-mark">⌬</span><strong>No specimen selected</strong><span>The genome editor follows the selected organism.</span></section>;

  const apply = () => {
    const result = onApply(draftGenome);
    setMessage(result?.ok ? 'Genome change applied. The dish is updated.' : result?.error ?? 'Genome change could not be applied.');
  };
  const mutate = () => {
    const result = onMutate();
    setMessage(result?.ok ? 'Mutation introduced. It is random variation, not a directed need.' : result?.error ?? 'Mutation could not be introduced.');
  };
  const clone = () => {
    const result = onClone();
    setMessage(result?.ok ? 'Specimen cloned from the selected organism.' : result?.error ?? 'Specimen could not be cloned.');
  };

  return (
    <section className="editor-module" aria-labelledby="editor-title">
      <div className="module-heading compact-heading"><div><p className="eyebrow">GENOME EDITOR / STAGED CHANGE</p><h2 id="editor-title">Preview one change</h2></div><span className="mono-label">{hasChanges ? 'UNAPPLIED' : 'CURRENT'}</span></div>
      <div className="editor-specimen"><span className="specimen-id">#{String(organism.id).padStart(3, '0')}</span><span>Generation {organism.generation}</span><span>{organism.genome.speed.join('/')} speed pair</span></div>
      <div className="phenotype-compare" aria-label="Phenotype comparison">
        <div className="phenotype-head"><span>Trait</span><span>Before</span><span>Change</span><span>After</span></div>
        {deltas.map((item) => <DeltaRow item={item} key={item.key} />)}
      </div>
      <p className="editor-staged-note">{hasChanges ? 'This is a preview. The organism changes when you apply it.' : 'Choose an allele in the rail to preview a new trait.'}</p>
      <div className="editor-actions"><button className="primary-control" type="button" onClick={apply} disabled={!hasChanges}>Apply this change</button>{hasChanges && <button className="secondary-control" type="button" onClick={() => { onCancel(); setMessage('Preview cancelled.'); }}>Cancel</button>}</div>
      <details className="advanced-controls editor-more-actions"><summary>More specimen actions</summary><div className="editor-actions"><button className="secondary-control" type="button" onClick={mutate}>Introduce mutation</button><button className="secondary-control" type="button" onClick={clone}>Clone specimen</button></div></details>
      {message && <p className="editor-message" role="status">{message}</p>}
      <div className="causal-chain"><p className="eyebrow">WHY THIS PHENOTYPE</p><ol>{explainPhenotype(draftGenome).map((line) => <li key={line}>{line}</li>)}</ol></div>
      <div className="editor-footnote"><span>MODEL NOTE</span><p>Predicted effects describe this educational model only. They do not predict a real organism’s outcome.</p></div>
    </section>
  );
}
