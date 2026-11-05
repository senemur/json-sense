import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OverviewTab } from '../features/overview/OverviewTab';

describe('OverviewTab Landing Page UI', () => {
  it('renders landing page hero, feature cards, and 5-step walkthrough', () => {
    const navMock = vi.fn();
    render(<OverviewTab onNavigateToTab={navMock} />);

    // Hero title & value proposition
    expect(screen.getByText(/The privacy-first developer studio for/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero Server Requests/i)).toBeInTheDocument();

    // Developer capabilities cards
    expect(screen.getByText('Smart JSON Repair')).toBeInTheDocument();
    expect(screen.getByText('Structure & Quality Inspector')).toBeInTheDocument();
    expect(screen.getAllByText('Schema Studio').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('JSON to TypeScript')).toBeInTheDocument();
    expect(screen.getByText('JSON Comparison Diff')).toBeInTheDocument();
    expect(screen.getByText('Interactive Tree Explorer')).toBeInTheDocument();

    // 5-step walkthrough
    expect(screen.getByText('5-Step Live Demonstration Walkthrough')).toBeInTheDocument();
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
    expect(screen.getByText('Step 4')).toBeInTheDocument();
    expect(screen.getByText('Step 5')).toBeInTheDocument();
  });

  it('triggers interactive demo load and navigation on button click', () => {
    const navMock = vi.fn();
    render(<OverviewTab onNavigateToTab={navMock} />);

    const runDemoBtn = screen.getByRole('button', { name: /Run 5-Step Demo/i });
    fireEvent.click(runDemoBtn);

    expect(navMock).toHaveBeenCalledWith('formatter', expect.stringContaining('verified: True'));
  });

  it('navigates to specific tabs when feature cards are clicked', () => {
    const navMock = vi.fn();
    render(<OverviewTab onNavigateToTab={navMock} />);

    // Click Inspector card
    const inspectorLink = screen.getByText('Explore Inspector ➔');
    fireEvent.click(inspectorLink);
    expect(navMock).toHaveBeenCalledWith('inspector');

    // Click Schema Studio card
    const schemaLink = screen.getByText('Open Schema Studio ➔');
    fireEvent.click(schemaLink);
    expect(navMock).toHaveBeenCalledWith('schema');

    // Click TypeScript card
    const tsLink = screen.getByText('Generate TypeScript ➔');
    fireEvent.click(tsLink);
    expect(navMock).toHaveBeenCalledWith('typescript');
  });
});
