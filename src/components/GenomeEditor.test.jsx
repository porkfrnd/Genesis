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
    const draftGenome = { ...BASELINE_GENOME, speed: ['S', 'S'] };
    render(<GenomeEditor organism={organism} draftGenome={draftGenome} onApply={onApply} onCancel={() => {}} onMutate={() => ({ ok: true })} onClone={() => ({ ok: true })} />);
    expect(screen.getByText('Speed')).toBeVisible();
    expect(screen.getByText('34')).toBeVisible();
    expect(screen.getByText('78')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Apply this change' }));
    expect(onApply).toHaveBeenCalledWith(draftGenome);
    expect(screen.getByRole('status')).toHaveTextContent('Genome change applied');
  });
});
