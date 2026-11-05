import { test, expect } from '@playwright/test';

test.describe('JSON to TypeScript Generator User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Format & Validate' }).click();
  });

  test('converts JSON object into clean TypeScript interfaces', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });
    const payload = JSON.stringify({
      id: 101,
      title: 'Setup E2E Tests',
      completed: false,
      owner: {
        username: 'antigravity',
        score: 95.5,
      },
      tags: ['testing', 'playwright'],
    });

    await editor.fill(payload);
    await page.getByRole('button', { name: 'JSON to TypeScript' }).click();

    const outputTextarea = page.getByRole('textbox', { name: 'Generated TypeScript interfaces' });
    await expect(outputTextarea).toBeVisible();

    // Verify root interface and property types
    await expect(outputTextarea).toHaveValue(/export interface Root \{/);
    await expect(outputTextarea).toHaveValue(/id: number;/);
    await expect(outputTextarea).toHaveValue(/title: string;/);
    await expect(outputTextarea).toHaveValue(/completed: boolean;/);
    await expect(outputTextarea).toHaveValue(/owner: Owner;/);
    await expect(outputTextarea).toHaveValue(/tags: string\[\];/);
    await expect(outputTextarea).toHaveValue(/export interface Owner \{/);
    await expect(outputTextarea).toHaveValue(/username: string;/);
    await expect(outputTextarea).toHaveValue(/score: number;/);
  });

  test('updates root interface name and toggles export keywords', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });
    await editor.fill('{"userId": 1, "token": "xyz"}');

    await page.getByRole('button', { name: 'JSON to TypeScript' }).click();
    const outputTextarea = page.getByRole('textbox', { name: 'Generated TypeScript interfaces' });

    // Change Root Name
    const rootNameInput = page.getByLabel('Root Name:');
    await rootNameInput.fill('AuthResponse');

    await expect(outputTextarea).toHaveValue(/export interface AuthResponse \{/);

    // Toggle export keywords checkbox off
    const exportCheckbox = page.getByRole('checkbox', { name: /Include `export` keywords/i });
    await exportCheckbox.uncheck();

    await expect(outputTextarea).not.toHaveValue(/export interface AuthResponse/);
    await expect(outputTextarea).toHaveValue(/interface AuthResponse \{/);
  });

  test('copies generated TypeScript interfaces to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const editor = page.getByRole('textbox', { name: 'JSON Input' });
    await editor.fill('{"success": true}');

    await page.getByRole('button', { name: 'JSON to TypeScript' }).click();

    const copyButton = page.getByRole('button', { name: 'Copy TypeScript' });
    await copyButton.click();

    // Feedback button text change
    await expect(page.getByRole('button', { name: '✓ Copied Interfaces' })).toBeVisible();
  });
});
