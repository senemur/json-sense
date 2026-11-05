import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { InspectorTab } from '../features/inspector/InspectorTab';

describe('InspectorTab Component UI', () => {
  const sampleData = JSON.stringify({
    users: [
      { id: 1, name: 'Senem', email: 'senem@example.com' },
      { id: '2', name: '', email: null },
    ],
  });

  it('renders structural statistics correctly', () => {
    render(<InspectorTab json={sampleData} />);

    expect(screen.getByText('JSON Structure & Quality Inspector')).toBeInTheDocument();
    expect(screen.getByText('Total Objects')).toBeInTheDocument();
    expect(screen.getByText('Total Arrays')).toBeInTheDocument();
    expect(screen.getByText('Total Properties')).toBeInTheDocument();
    expect(screen.getByText('Max Depth')).toBeInTheDocument();

    // Check counts
    expect(screen.getByText('3')).toBeInTheDocument(); // 3 objects
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1); // 1 array
  });

  it('filters findings by category when filter button is clicked', async () => {
    const user = userEvent.setup();
    render(<InspectorTab json={sampleData} />);

    // Initially all findings shown
    expect(screen.getByText('$.users[1].id')).toBeInTheDocument();
    expect(screen.getByText('$.users[1].name')).toBeInTheDocument();
    expect(screen.getByText('$.users[1].email')).toBeInTheDocument();

    // Click "Type Inconsistency" filter
    const typeBtn = screen.getByRole('button', { name: /Type Inconsistency/i });
    await user.click(typeBtn);

    // Only type inconsistency should be shown
    expect(screen.getByText('$.users[1].id')).toBeInTheDocument();
    expect(screen.queryByText('$.users[1].name')).toBeNull();
    expect(screen.queryByText('$.users[1].email')).toBeNull();
  });

  it('filters findings using search input', async () => {
    const user = userEvent.setup();
    render(<InspectorTab json={sampleData} />);

    const searchInput = screen.getByPlaceholderText(/Search by path or message/i);
    await user.type(searchInput, 'email');

    // Only email finding should be visible
    expect(screen.getByText('$.users[1].email')).toBeInTheDocument();
    expect(screen.queryByText('$.users[1].name')).toBeNull();
  });

  it('copies JSONPath on button click', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });

    render(<InspectorTab json={sampleData} />);

    const copyBtn = screen.getByTitle('Copy $.users[1].id');
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith('$.users[1].id');
  });

  it('shows fallback card when JSON is invalid with navigation callback', async () => {
    const user = userEvent.setup();
    const handleNav = vi.fn();

    render(<InspectorTab json="{ bad json," onNavigateToFormatter={handleNav} />);

    expect(screen.getByText('Valid JSON Required for Inspection')).toBeInTheDocument();
    const navBtn = screen.getByRole('button', { name: /Go to Formatter & Repair/i });
    await user.click(navBtn);

    expect(handleNav).toHaveBeenCalledOnce();
  });
});
