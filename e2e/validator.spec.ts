import { test, expect } from '@playwright/test';

test.describe('JSON Validator User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Format & Validate' }).click();
  });

  test('displays clear error diagnostic when invalid JSON is provided', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });

    // Enter malformed JSON (trailing comma inside array)
    await editor.fill('{"items": [1, 2, ]}');

    // Error status badge and alert should be visible
    await expect(page.getByText('⚠️ Invalid Syntax')).toBeVisible();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText('JSON Syntax Error')).toBeVisible();

    // Check validity button maintains error feedback
    await page.getByRole('button', { name: 'Check Validity' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('clears error feedback when invalid JSON is fixed', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });

    // Trigger an invalid syntax error first
    await editor.fill('{ unquoted_key: 123 }');
    await expect(page.getByRole('alert')).toBeVisible();

    // Fix the syntax to valid JSON
    await editor.fill('{"quoted_key": 123}');

    // Error should be removed and valid badge should appear
    await expect(page.getByRole('alert')).not.toBeVisible();
    await expect(page.getByText('✓ Valid JSON Syntax')).toBeVisible();
    await expect(page.getByText('Valid JSON', { exact: true })).toBeVisible();
  });

  test('handles empty input gracefully without errors', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });

    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(editor).toHaveValue('');

    // Empty input should not show syntax error alerts
    await expect(page.getByRole('alert')).not.toBeVisible();
    await expect(page.getByText('⚠️ Invalid Syntax')).not.toBeVisible();
  });
});
