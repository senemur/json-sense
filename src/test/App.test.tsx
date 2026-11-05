import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

describe('App component & UI interactions', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('renders application header, brand, and default formatter tab', () => {
    render(<App />);
    expect(screen.getByText('JSON Buddy')).toBeInTheDocument();
    expect(screen.getByText('100% In-Browser & Private')).toBeInTheDocument();
    expect(screen.getByText('Format (2 Spaces)')).toBeInTheDocument();
    expect(screen.getByText('Minify')).toBeInTheDocument();
  });

  it('toggles theme between light and dark', () => {
    render(<App />);
    const themeBtn = screen.getByRole('button', { name: /switch to/i });
    expect(themeBtn).toBeInTheDocument();

    // Initial click toggles theme
    fireEvent.click(themeBtn);
    expect(localStorage.getItem('json-buddy-theme')).toBeTruthy();
  });

  it('formats JSON with 2 spaces on button click', async () => {
    render(<App />);
    const editor = screen.getByLabelText(/JSON Input/i) as HTMLTextAreaElement;

    fireEvent.change(editor, { target: { value: '{"test":123}' } });
    const formatBtn = screen.getByRole('button', { name: 'Format (2 Spaces)' });
    fireEvent.click(formatBtn);

    await waitFor(() => {
      expect(editor.value).toBe('{\n  "test": 123\n}');
    });
  });

  it('minifies JSON on button click', async () => {
    render(<App />);
    const editor = screen.getByLabelText(/JSON Input/i) as HTMLTextAreaElement;

    fireEvent.change(editor, { target: { value: '{\n  "a": 1,\n  "b": 2\n}' } });
    const minifyBtn = screen.getByRole('button', { name: 'Minify' });
    fireEvent.click(minifyBtn);

    await waitFor(() => {
      expect(editor.value).toBe('{"a":1,"b":2}');
    });
  });

  it('displays syntax error alert for invalid JSON', async () => {
    render(<App />);
    const editor = screen.getByLabelText(/JSON Input/i) as HTMLTextAreaElement;

    fireEvent.change(editor, { target: { value: '{"bad": json}' } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getAllByText(/Invalid Syntax/i).length).toBeGreaterThan(0);
    });
  });

  it('switches to Tree Viewer tab and handles collapse and expand all', async () => {
    render(<App />);
    const treeTab = screen.getByRole('button', { name: /Tree Viewer/i });
    fireEvent.click(treeTab);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Filter keys or values/i)).toBeInTheDocument();
      expect(screen.getByText(/description:/i)).toBeInTheDocument();
    });

    // Test Collapse All
    const collapseBtn = screen.getByRole('button', { name: 'Collapse All' });
    fireEvent.click(collapseBtn);

    await waitFor(() => {
      // After collapsing, nested properties inside objects should be collapsed
      expect(screen.queryByText(/stars:/i)).toBeNull();
    });

    // Test Expand All
    const expandBtn = screen.getByRole('button', { name: 'Expand All' });
    fireEvent.click(expandBtn);

    await waitFor(() => {
      expect(screen.getByText(/stars:/i)).toBeInTheDocument();
    });
  });

  it('switches to JSON to TypeScript tab and renders interfaces', async () => {
    render(<App />);
    const tsTab = screen.getByRole('button', { name: /JSON to TypeScript/i });
    fireEvent.click(tsTab);

    await waitFor(() => {
      expect(screen.getByLabelText(/Root Name/i)).toBeInTheDocument();
      expect(screen.getByText('Generated Interfaces')).toBeInTheDocument();
      const codeArea = screen.getByLabelText(/Generated TypeScript interfaces/i) as HTMLTextAreaElement;
      expect(codeArea.value).toContain('interface Root {');
    });
  });

  it('switches to JSON Diff tab and compares two inputs', async () => {
    render(<App />);
    const diffTab = screen.getByRole('button', { name: /JSON Diff/i });
    fireEvent.click(diffTab);

    await waitFor(() => {
      expect(screen.getByText('Load Comparison Sample')).toBeInTheDocument();
      expect(screen.getByText(/Detailed Diff View/i)).toBeInTheDocument();
    });
  });
});
