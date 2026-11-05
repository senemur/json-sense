import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SchemaStudioTab } from '../features/schema-studio/SchemaStudioTab';

describe('SchemaStudioTab Component UI', () => {
  beforeEach(() => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });
  });

  it('renders Schema Studio with banner, sample tabs and inferred Draft-07 schema', () => {
    render(<SchemaStudioTab />);

    expect(screen.getByText('Schema Studio')).toBeInTheDocument();
    expect(screen.getByText('Draft-07')).toBeInTheDocument();
    expect(screen.getByText('Sample 1')).toBeInTheDocument();
    expect(screen.getByText('Sample 2')).toBeInTheDocument();
    expect(screen.getByText('+ Add Sample')).toBeInTheDocument();
    expect(screen.getByText('Inferred JSON Schema (Draft-07)')).toBeInTheDocument();
  });

  it('allows adding and removing sample tabs', async () => {
    const user = userEvent.setup();
    render(<SchemaStudioTab />);

    const addBtn = screen.getByText('+ Add Sample');
    await user.click(addBtn);

    expect(screen.getByText('Sample 3')).toBeInTheDocument();

    // Remove the newly added sample
    const removeBtns = screen.getAllByTitle('Remove this sample');
    await user.click(removeBtns[removeBtns.length - 1]);

    expect(screen.queryByText('Sample 3')).toBeNull();
  });

  it('copies inferred schema to clipboard when Copy Schema is clicked', async () => {
    render(<SchemaStudioTab />);

    const copyBtn = screen.getByText('Copy Schema');
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(screen.getByText('✓ Copied')).toBeInTheDocument();
  });

  it('switches between Schema Inference and Validation Workbench', async () => {
    const user = userEvent.setup();
    render(<SchemaStudioTab />);

    const validationTabBtn = screen.getByRole('button', { name: /Validation Workbench Tab/i });
    await user.click(validationTabBtn);

    expect(screen.getByText('JSON Schema Specification')).toBeInTheDocument();
    expect(screen.getByText('Target JSON Data to Validate')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Validate Against Schema/i })).toBeInTheDocument();
  });

  it('validates target payload and shows success status', async () => {
    const user = userEvent.setup();
    render(<SchemaStudioTab />);

    // Switch to validation
    await user.click(screen.getByRole('button', { name: /Validation Workbench Tab/i }));

    // Click "Load Valid Data"
    await user.click(screen.getByText('Load Valid Data'));

    // Click Validate
    await user.click(screen.getByRole('button', { name: /Validate Against Schema/i }));

    expect(screen.getByText('Schema Validation Passed')).toBeInTheDocument();
  });

  it('validates invalid payload and displays detailed errors with JSONPath and keywords', async () => {
    const user = userEvent.setup();
    render(<SchemaStudioTab />);

    // Switch to validation
    await user.click(screen.getByRole('button', { name: /Validation Workbench Tab/i }));

    // Click "Load Invalid Data"
    await user.click(screen.getByText('Load Invalid Data'));

    // Click Validate
    await user.click(screen.getByRole('button', { name: /Validate Against Schema/i }));

    expect(screen.getByText(/Schema Validation Failed/i)).toBeInTheDocument();
    expect(screen.getByText('$.id')).toBeInTheDocument();
    expect(screen.getByText('$.name')).toBeInTheDocument();
    expect(screen.getByText('required')).toBeInTheDocument();
  });

  it('copies error JSONPath when Copy Path is clicked in error table', async () => {
    const user = userEvent.setup();
    render(<SchemaStudioTab />);

    await user.click(screen.getByRole('button', { name: /Validation Workbench Tab/i }));
    await user.click(screen.getByText('Load Invalid Data'));
    await user.click(screen.getByRole('button', { name: /Validate Against Schema/i }));

    const copyPathBtns = screen.getAllByRole('button', { name: /Copy Path/i });
    expect(copyPathBtns.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(copyPathBtns[0]);
    });

    expect(screen.getAllByText('✓ Copied').length).toBeGreaterThanOrEqual(1);
  });
});
