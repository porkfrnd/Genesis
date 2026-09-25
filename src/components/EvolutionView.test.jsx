import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import EvolutionView from './EvolutionView.jsx';

const history = [
  { generation: 0, population: 100, extinct: false, averages: { speed: 40, size: 50, pigmentation: 50, coldTolerance: 20, metabolism: 40 }, averageFitness: 0.4, survivalRate: 1, events: [] },
  { generation: 2, population: 80, extinct: false, averages: { speed: 52, size: 50, pigmentation: 50, coldTolerance: 70, metabolism: 40 }, averageFitness: 0.6, survivalRate: 0.8, events: [] },
];

describe('EvolutionView', () => {
  it('uses measured history in the comparison and explanation', () => {
    render(<EvolutionView snapshot={{ seed: 42, generation: 2, history, stats: history[1] }} onSave={() => {}} experiments={[]} onLoad={() => {}} onDelete={() => {}} />);
    expect(screen.getAllByText('40').length).toBeGreaterThan(0);
    expect(screen.getByText('52')).toBeVisible();
    expect(screen.getByText(/Cold tolerance changed most/)).toBeVisible();
    expect(screen.getByText(/environment did not direct the change/)).toBeVisible();
  });
});
