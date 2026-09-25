import { evaluateOrganism, fitnessLabel } from '../simulation/selection.js';
import { explainPhenotype, getPhenotypeKeyLabel } from '../simulation/phenotype.js';
import { getAlleleDefinition, GENE_IDS } from '../data/genes.js';

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

export default function OrganismInspector({ organism, environment }) {
  if (!organism) return <section className="inspector-module empty-inspector"><span className="empty-mark">◎</span><strong>No specimen selected</strong><span>Click an organism in the petri dish to inspect its actual state.</span></section>;
  const assessment = evaluateOrganism(organism, environment);
  const phenotypeKeys = ['speed', 'size', 'pigmentation', 'coldTolerance', 'metabolism', 'predationEscape', 'lifespan', 'energyCapacity'];
  return (
    <section className="inspector-module" aria-labelledby="inspector-title">
      <div className="inspector-heading"><div><p className="eyebrow">SPECIMEN RECORD / ACTUAL STATE</p><h2 id="inspector-title">Organism #{String(organism.id).padStart(3, '0')}</h2></div><span className={`fitness-badge fitness-${fitnessLabel(assessment.fitness).toLowerCase()}`}>{fitnessLabel(assessment.fitness)} fitness</span></div>
      <div className="inspector-meta"><span>GEN {organism.generation}</span><span>AGE {organism.state.age}</span><span>ENERGY {formatPercent(organism.state.energy)}</span><span>HEALTH {formatPercent(organism.state.health)}</span></div>
      <div className="fitness-readout"><div><span>Contextual fitness</span><strong>{formatPercent(assessment.fitness)}</strong></div><p>{assessment.explanation}</p><div className="fitness-components"><span>Survival {formatPercent(assessment.survivalProbability)}</span><span>Reproductive success {formatPercent(assessment.reproductiveSuccess)}</span></div></div>
      <div className="inspector-section"><div className="section-label"><span>GENOME</span><span>ALLELE PAIR</span></div>{GENE_IDS.map((geneId) => <div className="inspector-row" key={geneId}><span>{geneId === 'coldTolerance' ? 'Cold tolerance' : geneId}</span><strong>{organism.genome[geneId].join(' / ')}</strong><small>{getAlleleDefinition(geneId, organism.genome[geneId][0])?.dominance === 'dominant' ? 'dominant present' : 'recessive pair'}</small></div>)}</div>
      <div className="inspector-section"><div className="section-label"><span>PHENOTYPE</span><span>MODEL SCORE</span></div><div className="trait-grid">{phenotypeKeys.map((key) => <div className="trait-cell" key={key}><span>{getPhenotypeKeyLabel(key)}</span><strong>{organism.phenotype[key]}</strong><i style={{ '--trait-level': `${organism.phenotype[key]}%` }} /></div>)}</div></div>
      <div className="inspector-section ancestry-section"><div className="section-label"><span>ANCESTRY</span><span>GENERATION {organism.generation}</span></div>{organism.parents?.length ? <p>Parents <strong>#{organism.parents.join(' / #')}</strong> · inherited material and mutation events are retained in the model.</p> : <p>Founding specimen · no parent record.</p>}</div>
      <div className="inspector-explanation"><span className="section-label">WHY THIS ORGANISM</span><ul>{explainPhenotype(organism.genome).slice(0, 4).map((line) => <li key={line}>{line}</li>)}</ul></div>
    </section>
  );
}
