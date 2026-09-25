import { useCallback, useEffect, useMemo, useState } from 'react';
import LabShell from './components/LabShell.jsx';
import PetriDish from './components/PetriDish.jsx';
import SimulationControls from './components/SimulationControls.jsx';
import EnvironmentControls from './components/EnvironmentControls.jsx';
import StatsRail from './components/StatsRail.jsx';
import GenomeRail from './components/GenomeRail.jsx';
import GenomeEditor from './components/GenomeEditor.jsx';
import OrganismInspector from './components/OrganismInspector.jsx';
import EvolutionView from './components/EvolutionView.jsx';
import ResearchLog from './components/ResearchLog.jsx';
import CoursesView from './components/CoursesView.jsx';
import ChallengesView from './components/ChallengesView.jsx';
import SandboxView from './components/SandboxView.jsx';
import { GenesisEngine } from './simulation/engine.js';
import { loadExperiments, loadProgress, loadSettings, saveExperiment, saveSettings, deleteExperiment, completeChallenge, toggleLesson } from './storage/storage.js';

function makeToastMessage(message) {
  return message;
}

export default function App() {
  const [engine, setEngine] = useState(() => new GenesisEngine());
  const [snapshot, setSnapshot] = useState(() => engine.getSnapshot());
  const [selectedId, setSelectedId] = useState(1);
  const [activeView, setActiveView] = useState('lab');
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [seedInput, setSeedInput] = useState(snapshot.seed.toString());
  const [selectedGene, setSelectedGene] = useState('speed');
  const [theme, setTheme] = useState(() => loadSettings().theme ?? 'dark');
  const [progress, setProgress] = useState(() => loadProgress());
  const [experiments, setExperiments] = useState(() => loadExperiments());
  const [toast, setToast] = useState('');

  const selectedOrganism = useMemo(() => snapshot.population.find((organism) => organism.id === selectedId) ?? snapshot.population[0] ?? null, [snapshot.population, selectedId]);
  const initialSnapshot = snapshot.history[0] ?? snapshot.stats;

  const sync = useCallback((nextSnapshot) => {
    const next = nextSnapshot ?? engine.getSnapshot();
    setSnapshot(next);
    if (next.population.length && !next.population.some((organism) => organism.id === selectedId)) setSelectedId(next.population[0].id);
    if (!next.population.length) setRunning(false);
  }, [engine, selectedId]);

  const notify = useCallback((message) => {
    setToast(makeToastMessage(message));
    window.setTimeout(() => setToast(''), 2600);
  }, []);

  useEffect(() => {
    saveSettings({ theme, motion: 'system' });
  }, [theme]);

  useEffect(() => {
    if (!running || snapshot.extinct) return undefined;
    const interval = speed === 1 ? 900 : speed === 10 ? 220 : speed === 100 ? 70 : 24;
    const stepSize = speed === 1 ? 1 : speed === 10 ? 2 : speed === 100 ? 10 : 50;
    const timer = window.setInterval(() => {
      const next = engine.step(stepSize);
      setSnapshot(next);
      if (next.extinct) setRunning(false);
    }, interval);
    return () => window.clearInterval(timer);
  }, [engine, running, speed, snapshot.extinct]);

  const handleStep = (count) => {
    const next = engine.step(count);
    sync(next);
  };

  const handleReset = () => {
    const seed = Number.parseInt(seedInput, 10);
    const next = engine.reset(Number.isFinite(seed) ? seed : snapshot.seed);
    setSeedInput(next.seed.toString());
    setRunning(false);
    setSelectedId(next.population[0]?.id ?? 1);
    sync(next);
    notify('New dish initialized from the selected seed.');
  };

  const handleEnvironment = (changes) => {
    const next = engine.setEnvironment(changes);
    sync(next);
  };

  const handleApply = (genome) => {
    const result = engine.editGenome(selectedId, genome);
    if (result.ok) sync(result.snapshot);
    return result;
  };

  const handleMutate = () => {
    const result = engine.mutateOrganism(selectedId);
    if (result.ok) sync(result.snapshot);
    else notify(result.error);
  };

  const handleClone = () => {
    const result = engine.cloneOrganism(selectedId);
    if (result.ok) {
      setSelectedId(result.snapshot.population.at(-1)?.id ?? selectedId);
      sync(result.snapshot);
      notify('Specimen cloned. Its inherited genome is now visible in the inspector.');
    } else notify(result.error);
  };

  const handleSave = (name) => {
    const state = engine.serialize();
    const saved = saveExperiment({ name, state, stats: engine.getSnapshot().stats });
    setExperiments(loadExperiments());
    notify(`Saved ${saved.name}.`);
  };

  const handleLoad = (experiment) => {
    try {
      const restored = GenesisEngine.fromSerialized(experiment.engineState);
      setEngine(restored);
      setSeedInput(restored.seed.toString());
      setActiveView('lab');
      setRunning(false);
      setSelectedId(restored.getSnapshot().population[0]?.id ?? 1);
      sync(restored.getSnapshot());
      notify(`Restored ${experiment.name}.`);
    } catch {
      notify('This saved experiment could not be restored. Start a clean run instead.');
    }
  };

  const handleDelete = (id) => {
    deleteExperiment(id);
    setExperiments(loadExperiments());
  };

  const handleToggleLesson = (id) => {
    setProgress(toggleLesson(id, progress));
  };

  const handleCompleteChallenge = (id) => {
    setProgress(completeChallenge(id, progress));
    notify('Challenge recorded from the current simulation state.');
  };

  const renderLab = () => (
    <div className="view-stack">
      <div className="lab-brief"><div><p className="eyebrow">WELCOME TO THE LAB / FIRST EXPERIMENT</p><h1>Change DNA. Watch consequences unfold.</h1><p>Start with a living population, edit one visible trait, then give the environment something to select.</p></div><div className="causal-brief" aria-label="Experiment flow"><span>DNA</span><b>→</b><span>PHENOTYPE</span><b>→</b><span>EVOLUTION</span><b>→</b><span>EXPLANATION</span></div></div>
      <div className="lab-grid">
        <aside className="lab-left"><SimulationControls running={running} onToggle={() => setRunning((current) => !current)} onStep={handleStep} speed={speed} onSpeedChange={setSpeed} seed={seedInput} onSeedChange={setSeedInput} onReset={handleReset} generation={snapshot.generation} population={snapshot.population.length} /><EnvironmentControls environment={snapshot.environment} onChange={handleEnvironment} /><StatsRail stats={snapshot.stats} environment={snapshot.environment} /></aside>
        <section className="lab-center"><PetriDish snapshot={snapshot} selectedId={selectedOrganism?.id} onSelect={setSelectedId} /><ResearchLog events={snapshot.events} /></section>
        <aside className="lab-right"><GenomeRail organism={selectedOrganism} selectedGene={selectedGene} onSelectGene={setSelectedGene} onChangePair={(geneId, index, allele) => { const genome = { ...selectedOrganism.genome, [geneId]: selectedOrganism.genome[geneId].map((value, pairIndex) => pairIndex === index ? allele : value) }; handleApply(genome); }} /><OrganismInspector organism={selectedOrganism} environment={snapshot.environment} /></aside>
      </div>
    </div>
  );

  const renderGenome = () => (
    <div className="view-stack">
      <div className="view-intro"><div><p className="eyebrow">GENOME / EDIT AND INSPECT</p><h1>Every trait starts with a locus.</h1><p>Edit a valid allele pair and the model immediately recalculates phenotype. Apply the change only when the causal readout makes sense.</p></div><span className="seed-stamp">SEED {snapshot.seed}</span></div>
      <div className="genome-layout"><GenomeRail organism={selectedOrganism} selectedGene={selectedGene} onSelectGene={setSelectedGene} onChangePair={(geneId, index, allele) => { const genome = { ...selectedOrganism.genome, [geneId]: selectedOrganism.genome[geneId].map((value, pairIndex) => pairIndex === index ? allele : value) }; handleApply(genome); }} /><GenomeEditor key={selectedOrganism ? `${selectedOrganism.id}-${JSON.stringify(selectedOrganism.genome)}` : 'empty'} organism={selectedOrganism} onApply={handleApply} onMutate={handleMutate} onClone={handleClone} /></div>
      <OrganismInspector organism={selectedOrganism} environment={snapshot.environment} />
    </div>
  );

  let content = renderLab();
  if (activeView === 'genome') content = renderGenome();
  if (activeView === 'evolution') content = <EvolutionView snapshot={snapshot} onSave={handleSave} experiments={experiments} onLoad={handleLoad} onDelete={handleDelete} />;
  if (activeView === 'courses') content = <CoursesView progress={progress} onToggleLesson={handleToggleLesson} onNavigateLab={setActiveView} />;
  if (activeView === 'challenges') content = <ChallengesView snapshot={snapshot} initialSnapshot={initialSnapshot} progress={progress} onComplete={handleCompleteChallenge} onNavigateLab={setActiveView} />;
  if (activeView === 'sandbox') content = <SandboxView onNavigate={setActiveView} onReset={handleReset} />;

  return (
    <>
      <LabShell activeView={activeView} onNavigate={setActiveView} theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}>
        {content}
      </LabShell>
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
