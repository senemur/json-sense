import { test, expect } from '@playwright/test';

test.describe('Overview Landing Page & 5-Step Demo Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigates to Overview via header button and checks landing page elements', async ({ page }) => {
    // Switch to Overview tab
    await page.getByRole('button', { name: 'Overview' }).click();

    // Verify hero and value proposition
    await expect(page.getByRole('heading', { name: /The privacy-first developer studio for/i })).toBeVisible();
    await expect(page.getByText('Zero Server Requests')).toBeVisible();

    // Verify capabilities
    await expect(page.getByText('Smart JSON Repair').first()).toBeVisible();
    await expect(page.getByText('Structure & Quality Inspector').first()).toBeVisible();
    await expect(page.getByText('Schema Studio').first()).toBeVisible();

    // Verify 5-step demo section
    await expect(page.getByText('5-Step Live Demonstration Walkthrough')).toBeVisible();
  });

  test('navigates to Overview by clicking the brand logo', async ({ page }) => {
    // Click brand logo in header
    await page.getByTitle('Go to JsonSense Overview').click();

    await expect(page.getByRole('heading', { name: /The privacy-first developer studio for/i })).toBeVisible();
  });

  test('executes end-to-end 5-step demo flow starting from Overview CTA', async ({ page }) => {
    // Go to Overview
    await page.getByRole('button', { name: 'Overview' }).click();

    // Click "Run 5-Step Demo"
    await page.getByRole('button', { name: /Run 5-Step Demo/i }).click();

    // Step 1: User arrives at Formatter with malformed JSON loaded and syntax error alert
    await expect(page.getByText('⚠️ Invalid Syntax')).toBeVisible();

    // Step 2: Trigger Smart Repair
    const repairBtn = page.getByRole('button', { name: 'Repair JSON Now' });
    await expect(repairBtn).toBeVisible();
    await repairBtn.click();

    // Review repair diagnoses and apply to editor
    await expect(page.getByText('Smart Repair Results')).toBeVisible();
    await page.getByRole('button', { name: 'Apply to Editor' }).click();
    await expect(page.getByText('✓ Valid JSON Syntax')).toBeVisible();

    // Step 3: Switch to JSON Inspector
    await page.getByRole('button', { name: /JSON Inspector/i }).click();
    await expect(page.getByText('JSON Structure & Quality Inspector')).toBeVisible();
    await expect(page.getByText('Total Objects')).toBeVisible();

    // Step 4: Switch to Schema Studio and infer schema
    await page.getByRole('button', { name: /Schema Studio/i }).click();
    await expect(page.getByRole('heading', { name: 'Schema Studio' })).toBeVisible();
    await page.getByRole('button', { name: 'Infer Schema ➔' }).click();
    await expect(page.getByText('Inferred JSON Schema')).toBeVisible();

    // Step 5: Switch to Validation Workbench and test incoming payload
    await page.getByRole('button', { name: 'Validation Workbench Tab' }).click();
    await page.getByRole('button', { name: 'Load Invalid Data' }).click();
    await page.getByRole('button', { name: 'Validate Against Schema' }).click();

    // Verify structured validation error table is rendered
    await expect(page.getByText(/Schema Validation Failed/i)).toBeVisible();
    await expect(page.getByText('$.id')).toBeVisible();
    await expect(page.getByText('required').first()).toBeVisible();
  });
});
