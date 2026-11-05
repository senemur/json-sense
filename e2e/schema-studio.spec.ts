import { test, expect } from '@playwright/test';

test.describe('Schema Studio E2E User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigates to Schema Studio tab and displays multi-sample inference UI', async ({ page }) => {
    // Switch to Schema Studio tab
    await page.getByRole('button', { name: /Schema Studio/i }).click();

    // Verify header and Draft-07 badge
    await expect(page.getByRole('heading', { name: 'Schema Studio' })).toBeVisible();
    await expect(page.getByText('Draft-07').first()).toBeVisible();

    // Verify sample tabs and controls
    await expect(page.getByRole('button', { name: /Sample 1/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sample 2/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '+ Add Sample' })).toBeVisible();
    await expect(page.getByText('Inferred JSON Schema (Draft-07)')).toBeVisible();
  });

  test('manages multiple samples and generates inferred schema', async ({ page }) => {
    await page.getByRole('button', { name: /Schema Studio/i }).click();

    // Add a third sample
    await page.getByRole('button', { name: '+ Add Sample' }).click();
    await expect(page.getByRole('button', { name: /Sample 3/ })).toBeVisible();

    // Remove the third sample
    const removeBtns = page.getByTitle('Remove this sample');
    await removeBtns.last().click();
    await expect(page.getByRole('button', { name: /Sample 3/ })).not.toBeVisible();

    // Click "Infer Schema ➔"
    await page.getByRole('button', { name: 'Infer Schema ➔' }).click();
    await expect(page.getByText('Ready')).toBeVisible();

    // Test Copy Schema button
    const copySchemaBtn = page.getByRole('button', { name: 'Copy Schema' });
    await copySchemaBtn.click();
    await expect(page.getByText('✓ Copied')).toBeVisible();
  });

  test('switches to Validation Workbench and validates valid target data', async ({ page }) => {
    await page.getByRole('button', { name: /Schema Studio/i }).click();

    // Switch to validation tab
    await page.getByRole('button', { name: 'Validation Workbench Tab' }).click();

    // Verify workbench panels
    await expect(page.getByText('JSON Schema Specification', { exact: true })).toBeVisible();
    await expect(page.getByText('Target JSON Data to Validate')).toBeVisible();

    // Load valid payload
    await page.getByRole('button', { name: 'Load Valid Data' }).click();

    // Click validate
    await page.getByRole('button', { name: 'Validate Against Schema' }).click();

    // Verify success alert
    await expect(page.getByText('Schema Validation Passed')).toBeVisible();
  });

  test('validates invalid target data and displays error table with paths and keywords', async ({ page }) => {
    await page.getByRole('button', { name: /Schema Studio/i }).click();

    // Switch to validation tab
    await page.getByRole('button', { name: 'Validation Workbench Tab' }).click();

    // Load invalid payload
    await page.getByRole('button', { name: 'Load Invalid Data' }).click();

    // Click validate
    await page.getByRole('button', { name: 'Validate Against Schema' }).click();

    // Verify error banner
    await expect(page.getByText(/Schema Validation Failed/i)).toBeVisible();

    // Verify specific error paths and keywords in table
    await expect(page.getByText('$.id')).toBeVisible();
    await expect(page.getByText('$.name')).toBeVisible();
    await expect(page.getByText('required').first()).toBeVisible();

    // Test copy path button
    const copyPathBtns = page.getByRole('button', { name: 'Copy Path' });
    await copyPathBtns.first().click();
    await expect(page.getByText('✓ Copied').first()).toBeVisible();
  });

  test('switches presets and verifies catalog schema inference', async ({ page }) => {
    await page.getByRole('button', { name: /Schema Studio/i }).click();

    // Load E-Commerce Catalog preset
    await page.getByRole('button', { name: /E-Commerce Catalog/i }).click();

    // Verify sample tab labels updated
    await expect(page.getByRole('button', { name: /Product 1/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Product 2/ })).toBeVisible();

    // Switch to validation workbench and run validation
    await page.getByRole('button', { name: 'Validation Workbench Tab' }).click();
    await page.getByRole('button', { name: 'Validate Against Schema' }).click();

    // Target data in preset is valid
    await expect(page.getByText('Schema Validation Passed')).toBeVisible();
  });
});
