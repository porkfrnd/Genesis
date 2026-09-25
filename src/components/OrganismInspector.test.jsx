import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BASELINE_GENOME } from '../data/genes.js';
import { createOrganism } from '../simulation/organism.js';
import { createSeededRandom } from '../simulation/random.js';
import OrganismInspector from './OrganismInspector.jsx';

describe('OrganismInspector', () => {
  it('renders actual genotype, phenotype, state, and contextual fitness', () => {
    const organism = createOrganism({ id: 12, genome: BASELINE_GENOME, generation: 3, rng: createSeededRandom(12) });
    render(<OrganismInspector organism={organism} environment={{ temperature: 18, food: 0.72, predation: 0.18, mutationRate: 0.08 }} />);
    expect(screen.getByRole('heading', { name: 'Organism #012' })).toBeVisible();
    expect(screen.getByText('Contextual fitness')).toBeVisible();
    expect(screen.getByText('GEN 3')).toBeVisible();
    expect(screen.getByText('s / s')).toBeVisible();
  });
});
