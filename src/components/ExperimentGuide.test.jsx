import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ExperimentGuide from './ExperimentGuide.jsx';

describe('ExperimentGuide', () => {
  afterEach(() => cleanup());
  it('gives a first-time learner one clear next action', () => {
    const onNavigate = vi.fn();
    render(<ExperimentGuide open step={0} selectedId={1} onNavigate={onNavigate} onRun={() => {}} onQuickCold={() => {}} onEnvironment={() => {}} onToggle={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Start with one organism' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Open the genome editor' }));
    expect(onNavigate).toHaveBeenCalledWith('genome');
  });

  it('can be collapsed without losing access to the guide', () => {
    const onToggle = vi.fn();
    render(<ExperimentGuide open={false} step={0} selectedId={1} onNavigate={() => {}} onRun={() => {}} onQuickCold={() => {}} onEnvironment={() => {}} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show the experiment guide' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
