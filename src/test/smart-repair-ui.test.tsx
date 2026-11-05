import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FormatterTab } from '../features/formatter/FormatterTab';

describe('Smart JSON Repair UI Flow', () => {
  it('detects syntax error, triggers smart repair, shows applied fixes, and applies repaired JSON to editor', async () => {
    const user = userEvent.setup();
    let currentJson = `{\n  name: "Senem",\n  "skills": ["C#", "React",],\n  "active": true,\n}`;
    const handleChangeJson = vi.fn((newVal: string) => {
      currentJson = newVal;
    });

    const { rerender } = render(
      <FormatterTab json={currentJson} onChangeJson={handleChangeJson} />
    );

    // Should indicate invalid syntax
    expect(screen.getByText('⚠️ Invalid Syntax')).toBeInTheDocument();
    expect(screen.getByText('JSON Syntax Error')).toBeInTheDocument();

    // Trigger Smart Repair via "Repair JSON Now" button in the suggestion card
    const repairBtn = screen.getByRole('button', { name: /Repair JSON Now/i });
    await user.click(repairBtn);

    // Smart repair review panel should appear
    expect(screen.getByRole('region', { name: 'Smart JSON Repair Review' })).toBeInTheDocument();
    expect(screen.getByText(/fixes applied/i)).toBeInTheDocument();

    // Check that fixes list describes unquoted key and trailing comma
    expect(screen.getAllByText(/Unquoted Key/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Trailing Comma/i).length).toBeGreaterThan(0);

    // Click "Apply to Editor"
    const applyBtn = screen.getByRole('button', { name: /Apply to Editor/i });
    await user.click(applyBtn);

    // Should call onChangeJson with valid JSON
    expect(handleChangeJson).toHaveBeenCalled();
    const calledWith = handleChangeJson.mock.calls[0][0];
    const parsed = JSON.parse(calledWith);
    expect(parsed.name).toBe('Senem');
    expect(parsed.skills).toEqual(['C#', 'React']);
    expect(parsed.active).toBe(true);

    // Re-render with updated valid JSON to test the revert button
    rerender(
      <FormatterTab json={calledWith} onChangeJson={handleChangeJson} />
    );

    // "Revert to original input" button should be visible
    const revertBtn = screen.getByRole('button', { name: /Revert to original input/i });
    expect(revertBtn).toBeInTheDocument();

    // Clicking revert restores original malformed JSON
    await user.click(revertBtn);
    expect(handleChangeJson).toHaveBeenLastCalledWith(currentJson);
  });
});
