# GENESIS

**Interactive Genetics & Evolution Laboratory**

GENESIS is a local-first educational laboratory for experimenting with a simplified organism genome. Change a locus, observe the resulting phenotype, release the population into a virtual petri dish, apply environmental pressure, and inspect what changes across generations.

The central loop is:

> Change DNA → observe the organism → release it → apply environmental pressure → evolve → inspect what changed → understand why.

GENESIS is an educational simulation, not a molecularly accurate genetic engineering tool or a prediction system for real organisms.

## Quick start

Requirements:

- Node.js 24+
- npm 11+

Install and run the lab:

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal. The Lab opens with a guided first experiment: it starts with a seeded population of 120 organisms at generation 0 and specimen `#001` selected. The guide gives one next action at a time; advanced controls remain available when you need them.

The default seed is `482193`. Use the same seed and starting conditions to reproduce a run.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run lint` | Run the project ESLint flat configuration |
| `npm test` | Run the configured Vitest suite |
| `npm run test:watch` | Run Vitest in watch mode |

The project uses React JavaScript rather than TypeScript. The simulation core is framework-independent and can be tested without a browser.

## The judge demo

A complete demonstration takes less than a minute:

1. Start in **Lab** with the experiment guide and specimen `#001` selected.
2. Follow the guide to open **Genome** and change the movement-speed locus from its current pair to `S/S`.
3. Preview the phenotype change, then choose **Apply this change**.
4. Return to **Lab** and follow the guide to try a cold environment or adjust a pressure yourself.
5. Choose **Run 10 generations** first; open **More run controls** when you want a faster batch.
6. Pause and open **Evolution**.
7. Compare the actual initial and evolved measurements.
8. Read the generated explanation and research log.
9. Open **Courses** to connect the observation to natural selection, mutation, trade-offs, or genetic drift.

The interface never uses invented statistics. Population, phenotype, allele, fitness, survival, mutation, and event values come from the simulation snapshots.

## Application areas

### Lab

The primary experiment workspace contains:

- Canvas petri dish with moving organisms
- Population, generation, fitness, and survival readouts
- Pause, resume, 1×, 10×, 100×, and 1000× speed controls
- Single-generation and fast-forward controls
- Temperature, food, predation, and mutation-rate controls
- Selected organism inspector
- Chromosome rail
- Chronological research log
- Extinction and restart states

### Genome

The genome workspace provides:

- Five simplified loci: speed, size, pigmentation, metabolism, and cold tolerance
- Valid allele pair editing with a staged preview
- Apply or cancel before changing the live organism
- Dominant/recessive expression readout
- Before/after phenotype values
- Predicted model effects and trade-offs
- Causal explanation from allele to phenotype
- Manual mutation and organism cloning under advanced actions

### Evolution

The evolution workspace provides:

- Initial → evolved comparison
- Population history
- Average trait history for speed and cold tolerance
- Generation navigation
- Actual data-driven explanations
- Local saved experiment archive
- Restore and delete controls

### Courses

Courses use the same concepts as the simulator rather than presenting isolated reading material. Each lesson contains:

- Concept
- Experiment
- Observation
- Explanation
- Knowledge check

Lesson completion is stored locally. Sandbox experimentation is not locked behind course completion.

### Challenges

Challenges evaluate the actual current simulation state. They define:

- Objective
- Constraints
- Starting conditions
- Success criteria
- Current measured readout

The included challenges cover cold survival, predator escape, visible diversity, and evolutionary trade-offs.

### Sandbox

Sandbox mode keeps the complete experiment surface unrestricted. It is the place to edit genes, change pressure, clone organisms, introduce mutations, run fast, destroy populations through extreme conditions, and inspect the resulting history.

## Scientific model

GENESIS uses an intentionally simplified educational model. It is designed to communicate relationships, not to reproduce real genotype–phenotype complexity.

Each organism contains:

```text
Organism
├── Genome
│   ├── speed
│   ├── size
│   ├── pigment
│   ├── metabolism
│   └── coldTolerance
├── Phenotype
│   ├── speed
│   ├── size
│   ├── pigmentation
│   ├── metabolism
│   ├── coldTolerance
│   ├── lifespan
│   └── energy capacity
├── State
│   ├── age
│   ├── energy
│   ├── health
│   └── reproductive readiness
└── ancestry
    ├── parent IDs
    └── generation
```

### Alleles and phenotype

Each modeled gene has two alleles. An uppercase allele is treated as dominant over its lowercase alternative in this model. The effect is deterministic for a given allele pair.

The phenotype is calculated from the expressed allele at each locus. Trade-offs are part of the model:

- Higher speed can increase energy consumption.
- Larger bodies can require more food.
- Darker pigmentation can increase predator visibility in this model.
- Cold-adapted alleles help under low temperature but are not universally advantageous.
- Active metabolism increases energy demand while supporting faster turnover.

### Selection and fitness

Fitness is contextual. It is not a measure of strength or worth. The current model combines survival probability with reproductive success under the active environment.

Environmental pressure includes:

- Temperature
- Food availability
- Predation pressure

The inspector shows the components used in the current fitness calculation rather than presenting fitness as a mysterious score.

### Mutation and reproduction

Mutation is random variation, not an intentional response to a need. The model supports:

- Substitution
- Insertion
- Deletion
- Configurable random mutation rate

Reproduction selects compatible parents, creates simplified gametes, recombines alleles, and can mutate the inherited genome. The implementation favors clarity and bounded educational behavior over biological completeness.

### Evolution

Each generation:

1. Ages organisms and updates energy and health.
2. Evaluates environmental fitness.
3. Applies deterministic seeded survival decisions.
4. Selects reproductive survivors.
5. Produces bounded offspring when conditions permit.
6. Records mutation and selection events.
7. Stores a generation snapshot.

The environment selects among variation that already exists; organisms do not intentionally develop a trait because they need it.

## Architecture

```text
src/
├── App.jsx                       # React application orchestration
├── components/
│   ├── LabShell.jsx              # Navigation and application frame
│   ├── ExperimentGuide.jsx        # First-run student experiment path
│   ├── PetriDish.jsx             # Canvas renderer and selection surface
│   ├── GenomeRail.jsx            # Locus map and allele controls
│   ├── GenomeEditor.jsx          # Causal phenotype editor/readout
│   ├── OrganismInspector.jsx     # Specimen state and fitness readout
│   ├── EvolutionView.jsx         # History and before/after analysis
│   ├── CoursesView.jsx            # Simulator-linked lessons
│   ├── ChallengesView.jsx         # State-evaluated experiments
│   ├── ResearchLog.jsx            # Chronological simulation events
│   └── ...                        # Controls, statistics, sandbox
├── data/
│   ├── genes.js                   # Gene and allele catalog
│   ├── lessons.js                 # Course content
│   └── challenges.js              # Challenge criteria/evaluators
├── simulation/
│   ├── engine.js                  # Stateful generation engine
│   ├── phenotype.js               # Deterministic phenotype mapping
│   ├── validation.js              # Genome validation
│   ├── organism.js                # Organism construction and state
│   ├── reproduction.js            # Inheritance and recombination
│   ├── mutation.js                # Mutation operations
│   ├── selection.js               # Contextual fitness
│   ├── evolution.js               # Survivor/reproduction loop
│   ├── history.js                 # Generation snapshots/statistics
│   └── random.js                  # Seeded RNG entry point
├── storage/
│   └── storage.js                 # Versioned local persistence
├── utils/
│   └── random.js                  # Framework-independent PRNG
└── test/
    ├── setup.js
    ├── browser_qa.py              # Real-browser judge-flow check
    ├── ux_smoke.py                # Guided first-action smoke check
    ├── save_smoke.py              # Save/restore browser check
    └── extinction_smoke.py        # Empty-population regression check
```

The UI consumes engine snapshots. Biological rules stay in `src/simulation`; the React components do not make evolutionary decisions.

## Determinism and persistence

All stochastic simulation behavior comes from a seeded PRNG. The engine serializes:

- Seed
- Environment
- Generation
- Population and ancestry
- History snapshots
- Research events
- Organism ID counter
- Current RNG state

Saved experiments are stored in browser `localStorage` under versioned keys. Malformed or incompatible data is rejected without crashing the current application state.

No account, authentication, backend, or remote experiment service is required.

## Accessibility and responsive behavior

GENESIS includes:

- Keyboard-focusable controls
- Visible focus outlines
- Keyboard organism selection with arrow keys, Home, and End
- Screen-reader labels for the Canvas surface
- Text specimen list alternative to Canvas color/shape cues
- Non-color organism shapes for pigmentation tiers
- Live status announcements for UI feedback
- Reduced-motion support
- Responsive desktop, tablet, and mobile layouts
- Light and dark instrument themes

On smaller screens, the workstation becomes a vertical experiment flow so the petri dish remains the primary focus.

## Verification

The project includes targeted tests for:

- Seeded RNG replay
- Genome validation
- Deterministic phenotype calculation
- Mutation rate zero and extreme rates
- Inheritance and parent tracking
- Environmental fitness
- Generation stepping
- Population bounds
- Explicit extinction
- Serialized deterministic continuation
- Storage round-trips and malformed payloads
- Challenge evaluation
- Genome editor feedback
- Organism inspector readouts
- Evolution explanation rendering

Run the browser QA flow with a local server and a Playwright-capable Python environment:

```bash
npm run dev -- --host 127.0.0.1 --port 4173
python3 src/test/browser_qa.py
```

The checked-in browser scripts cover the guided first action, desktop, reduced motion, keyboard selection, staged genome editing, environmental pressure, evolution analysis, save/restore, extinction/restart, course feedback, light theme, and mobile layout.

## Educational limitations

The model intentionally omits or simplifies:

- Nucleotide-level DNA sequences
- Gene-gene interaction networks
- Developmental pathways
- Real-world genotype–phenotype mappings
- Complex mating systems
- Ecological interactions beyond the selected pressures
- Medical or veterinary genetic interpretation

GENESIS should be used to understand relationships and experimental reasoning, not to make claims about real organisms.

## Repository

- GitHub: [porkfrnd/Genesis](https://github.com/porkfrnd/Genesis)
- Runtime: React 19 + Vite 8 + JavaScript
- Persistence: local-first `localStorage`
