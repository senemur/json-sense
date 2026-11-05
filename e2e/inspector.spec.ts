import { test, expect } from '@playwright/test';

test.describe('JSON Inspector E2E User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigates to JSON Inspector tab and inspects structural statistics', async ({ page }) => {
    // Switch to JSON Inspector tab
    await page.getByRole('button', { name: /JSON Inspector/i }).click();

    // Verify Inspector header and overview
    await expect(page.getByText('JSON Structure & Quality Inspector')).toBeVisible();
    await expect(page.getByText(/Quality Score:/i)).toBeVisible();

    // Verify structural statistic cards
    await expect(page.getByText('Total Objects')).toBeVisible();
    await expect(page.getByText('Total Arrays')).toBeVisible();
    await expect(page.getByText('Total Properties')).toBeVisible();
    await expect(page.getByText('Max Depth')).toBeVisible();
  });

  test('analyzes prompt example with type inconsistency, empty string, and null value', async ({ page }) => {
    // First, fill the Formatter tab with the prompt example
    const editor = page.getByRole('textbox', { name: 'JSON Input' });
    const promptData = JSON.stringify(
      {
        users: [
          {
            id: 1,
            name: 'Senem',
            email: 'senem@example.com',
          },
          {
            id: '2',
            name: '',
            email: null,
          },
        ],
      },
      null,
      2
    );
    await editor.fill(promptData);

    // Switch to JSON Inspector tab
    await page.getByRole('button', { name: /JSON Inspector/i }).click();

    // Verify structural stats
    await expect(page.getByText('Total Objects')).toBeVisible();

    // Verify JSONPaths are displayed
    await expect(page.getByText('$.users[1].id')).toBeVisible();
    await expect(page.getByText('$.users[1].name')).toBeVisible();
    await expect(page.getByText('$.users[1].email')).toBeVisible();

    // Verify finding categories
    await expect(page.getByText('Type Inconsistency').first()).toBeVisible();
    await expect(page.getByText('Empty Value').first()).toBeVisible();
    await expect(page.getByText('Null Value').first()).toBeVisible();

    // Filter by "Type Inconsistency"
    await page.getByRole('button', { name: /Type Inconsistency/i }).click();
    await expect(page.getByText('$.users[1].id')).toBeVisible();
    await expect(page.getByText('$.users[1].name')).not.toBeVisible();
    await expect(page.getByText('$.users[1].email')).not.toBeVisible();

    // Filter by search query
    await page.getByRole('button', { name: /All Findings/i }).click();
    const searchInput = page.getByPlaceholder(/Search by path or message/i);
    await searchInput.fill('email');
    await expect(page.getByText('$.users[1].email')).toBeVisible();
    await expect(page.getByText('$.users[1].id')).not.toBeVisible();

    // Copy path
    const copyBtn = page.getByRole('button', { name: 'Copy Path' });
    await copyBtn.click();
    await expect(page.getByText('✓')).toBeVisible();
  });

  test('displays valid JSON required alert when input is invalid', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });
    await editor.fill('{ broken: invalid json');

    // Switch to JSON Inspector tab
    await page.getByRole('button', { name: /JSON Inspector/i }).click();

    await expect(page.getByText('Valid JSON Required for Inspection')).toBeVisible();
    const returnBtn = page.getByRole('button', { name: /Go to Formatter & Repair/i });
    await expect(returnBtn).toBeVisible();

    // Clicking return brings user back to Formatter
    await returnBtn.click();
    await expect(page.getByRole('textbox', { name: 'JSON Input' })).toBeVisible();
  });
});
