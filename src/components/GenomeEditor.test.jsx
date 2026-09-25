import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BASELINE_GENOME } from '../data/genes.js';
import { createOrganism } from '../simulation/organism.js';
import { createSeededRandom } from '../simulation/random.js';
import GenomeEditor from './GenomeEditor.jsx';

describe('GenomeEditor', () => {
  it('shows a real before and after phenotype and applies the draft', () => {
    const organism = createOrganism({ id: 4, genome: BASELINE_GENOME, rng: createSeededRandom(4) });
    const onApply = vi.fn(() => ({ ok: true }));
    render(<GenomeEditor organism={organism} onApply={onApply} onMutate={() => {}} onClone={() => {}} />);
    expect(screen.getByText('Speed')).toBeVisible();
    expect(screen.getAllByText('34')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Apply genome change' }));
    expect(onApply).toHaveBeenCalledWith(BASELINE_GENOME);
    expect(screen.getByRole('status')).toHaveTextContent('Genome change applied');
  });
});
