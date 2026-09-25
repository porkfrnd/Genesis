import { GENE_DEFINITIONS, getAlleleDefinition } from '../data/genes.js';

function AlleleSelect({ gene, index, value, onChange }) {
  return (
    <select aria-label={`${gene.label} allele ${index + 1}`} value={value} onChange={(event) => onChange(index, event.target.value)}>
      {Object.entries(gene.alleles).map(([allele, definition]) => <option key={allele} value={allele}>{allele} · {definition.label}</option>)}
    </select>
  );
}

export default function GenomeRail({ organism, selectedGene, onSelectGene, onChangePair }) {
  if (!organism) return <div className="empty-inspector"><span className="empty-mark">⌁</span><strong>Select a specimen</strong><span>Choose an organism in the dish to inspect its modeled loci.</span></div>;
  return (
    <section className="genome-rail" aria-labelledby="genome-rail-title">
      <div className="module-heading compact-heading"><div><p className="eyebrow">LOCUS MAP / MODELLED GENOME</p><h2 id="genome-rail-title">Chromosome rail</h2></div><span className="mono-label">5 LOCI</span></div>
      <div className="locus-list">
        {GENE_DEFINITIONS.map((gene) => {
          const pair = organism.genome[gene.id];
          const dominant = pair.find((allele) => getAlleleDefinition(gene.id, allele)?.dominance === 'dominant') ?? pair[0];
          const value = getAlleleDefinition(gene.id, dominant)?.value ?? 0;
          return (
            <div className={`locus-row ${selectedGene === gene.id ? 'is-selected' : ''}`} key={gene.id}>
              <button className="locus-summary" type="button" onClick={() => onSelectGene(gene.id)} aria-expanded={selectedGene === gene.id}>
                <span className="locus-marker" aria-hidden="true">{gene.shortLabel}</span>
                <span className="locus-name"><strong>{gene.label}</strong><small>{gene.chromosome} · {gene.description}</small></span>
                <span className="locus-value"><strong>{pair[0]}/{pair[1]}</strong><small>{value}/100</small></span>
              </button>
              {selectedGene === gene.id && <div className="locus-editor"><p className="locus-effect">{gene.alleles[dominant]?.effect}. {gene.tradeoff}</p><div className="allele-controls"><AlleleSelect gene={gene} index={0} value={pair[0]} onChange={(index, allele) => onChangePair(gene.id, index, allele)} /><span aria-hidden="true">/</span><AlleleSelect gene={gene} index={1} value={pair[1]} onChange={(index, allele) => onChangePair(gene.id, index, allele)} /></div><span className="dominance-note"><b>Expressed:</b> {dominant} · {gene.alleles[dominant]?.label}</span></div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
