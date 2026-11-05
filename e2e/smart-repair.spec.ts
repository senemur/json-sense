import { test, expect } from '@playwright/test';

test.describe('Smart JSON Repair E2E User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Format & Validate' }).click();
  });

  test('detects syntax errors, runs Smart Repair, inspects fixes, applies to editor and reverts', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });

    // Enter realistic malformed JSON (unquoted keys + trailing commas + single quotes + comments + Python literal)
    const malformed = `{\n  name: "Senem",\n  'role': 'Engineer',\n  // list of skills\n  "skills": ["C#", "React",],\n  active: True,\n}`;
    await editor.fill(malformed);

    // Verify error diagnostics appear
    await expect(page.getByText('⚠️ Invalid Syntax')).toBeVisible();
    await expect(page.getByRole('alert')).toBeVisible();

    // The Smart Repair suggestion card should be visible
    await expect(page.getByText('Detected syntax issues. Smart Repair can automatically fix')).toBeVisible();

    // Click "Repair JSON Now"
    await page.getByRole('button', { name: 'Repair JSON Now' }).click();

    // Review panel should appear
    await expect(page.getByRole('region', { name: 'Smart JSON Repair Review' })).toBeVisible();
    await expect(page.getByText('Smart Repair Results')).toBeVisible();

    // Verify listed fix badges
    await expect(page.getByText('Unquoted Key').first()).toBeVisible();
    await expect(page.getByText('Single Quote').first()).toBeVisible();
    await expect(page.getByText('Comment').first()).toBeVisible();
    await expect(page.getByText('Trailing Comma').first()).toBeVisible();

    // Apply Repaired JSON to the editor
    await page.getByRole('button', { name: 'Apply to Editor' }).click();

    // Verify syntax is now completely valid in editor
    await expect(page.getByText('✓ Valid JSON Syntax')).toBeVisible();
    await expect(page.getByText('Valid JSON', { exact: true })).toBeVisible();

    // Verify editor value has double quotes and valid formatting
    await expect(editor).toContainText('"name": "Senem"');
    await expect(editor).toContainText('"role": "Engineer"');
    await expect(editor).toContainText('"active": true');

    // Verify Revert option is available
    const revertBtn = page.getByRole('button', { name: 'Revert to original input' });
    await expect(revertBtn).toBeVisible();

    // Click Revert and verify original malformed JSON is restored
    await revertBtn.click();
    await expect(editor).toHaveValue(malformed);
    await expect(page.getByText('⚠️ Invalid Syntax')).toBeVisible();
  });

  test('informs user when JSON is already valid', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });
    await editor.fill('{"alreadyValid": true}');

    // Click toolbar Smart Repair button
    await page.getByRole('button', { name: 'Smart Repair' }).click();

    // Since already valid, no broken review panel is shown and valid status remains
    await expect(page.getByText('✓ Valid JSON Syntax')).toBeVisible();
  });

  test('safely auto-closes unclosed containers at EOF ({"users": [{"id": 1)', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });
    await editor.fill('{"users": [{"id": 1');

    await page.getByRole('button', { name: 'Smart Repair' }).click();
    await expect(page.getByRole('region', { name: 'Smart JSON Repair Review' })).toBeVisible();

    await page.getByRole('button', { name: 'Apply to Editor' }).click();
    await expect(page.getByText('✓ Valid JSON Syntax')).toBeVisible();
    await expect(editor).toContainText('"users"');
    await expect(editor).toContainText('"id": 1');
  });

  test('safely rejects mismatched brackets ({"users": [{"id": 1]) with failure diagnostic', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });
    await editor.fill('{"users": [{"id": 1]');

    await page.getByRole('button', { name: 'Smart Repair' }).click();
    await expect(page.getByText('Unable to Safely Auto-Repair JSON')).toBeVisible();
    await expect(page.getByText(/Mismatched closing bracket '\]'/)).toBeVisible();

    // Should NOT allow applying invalid JSON
    await expect(page.getByRole('button', { name: 'Apply to Editor' })).not.toBeVisible();
  });

  test('displays review-advised alert and confidence badge for undefined -> null conversion', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });
    await editor.fill('{ "status": undefined }');

    await page.getByRole('button', { name: 'Smart Repair' }).click();
    await expect(page.getByRole('region', { name: 'Smart JSON Repair Review' })).toBeVisible();
    await expect(page.getByText(/Review Advised: Semantic Adjustments Detected/i)).toBeVisible();
    await expect(page.getByText('Review', { exact: true })).toBeVisible();
  });
});
