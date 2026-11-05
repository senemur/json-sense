import { test, expect } from '@playwright/test';

test.describe('JSON Diff Comparison User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'JSON Diff' }).click();
  });

  test('compares two JSON objects and displays added, removed, and modified values', async ({ page }) => {
    const leftEditor = page.getByRole('textbox', { name: 'Original (Left)' });
    const rightEditor = page.getByRole('textbox', { name: 'Modified (Right)' });

    const originalJson = JSON.stringify({
      appName: 'JsonSense',
      version: 1,
      deprecatedField: 'old',
    });

    const modifiedJson = JSON.stringify({
      appName: 'JsonSense',
      version: 2,
      newField: 'fresh',
    });

    await leftEditor.fill(originalJson);
    await rightEditor.fill(modifiedJson);

    // Summary badges
    await expect(page.getByText('+1 added')).toBeVisible();
    await expect(page.getByText('-1 removed')).toBeVisible();
    await expect(page.getByText('~1 modified')).toBeVisible();

    // Table view with property paths
    await expect(page.getByRole('cell', { name: 'newField' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'deprecatedField' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'version' })).toBeVisible();
  });

  test('detects identical JSON structures correctly', async ({ page }) => {
    const leftEditor = page.getByRole('textbox', { name: 'Original (Left)' });
    const rightEditor = page.getByRole('textbox', { name: 'Modified (Right)' });

    const payload = JSON.stringify({ key: 'value', number: 123 });

    await leftEditor.fill(payload);
    await rightEditor.fill(payload);

    await expect(page.getByText('✓ Identical JSON')).toBeVisible();
    await expect(page.getByText('Both JSON inputs have identical keys and values.')).toBeVisible();
  });

  test('handles invalid JSON gracefully with informative error alerts', async ({ page }) => {
    const leftEditor = page.getByRole('textbox', { name: 'Original (Left)' });
    const rightEditor = page.getByRole('textbox', { name: 'Modified (Right)' });

    await leftEditor.fill('{"valid": true}');
    await rightEditor.fill('{"broken": [1, 2, }');

    // Right JSON Error alert
    await expect(page.getByText('Right JSON Error')).toBeVisible();
  });

  test('clears and loads comparison samples with action buttons', async ({ page }) => {
    const leftEditor = page.getByRole('textbox', { name: 'Original (Left)' });
    const rightEditor = page.getByRole('textbox', { name: 'Modified (Right)' });

    // Clear Both
    await page.getByRole('button', { name: 'Clear Both' }).click();
    await expect(leftEditor).toHaveValue('');
    await expect(rightEditor).toHaveValue('');

    // Load Comparison Sample
    await page.getByRole('button', { name: 'Load Comparison Sample' }).click();
    await expect(leftEditor).not.toHaveValue('');
    await expect(rightEditor).not.toHaveValue('');
    await expect(page.getByText('+3 added')).toBeVisible();
    await expect(page.getByText('-1 removed')).toBeVisible();
    await expect(page.getByText('~3 modified')).toBeVisible();
  });
});
