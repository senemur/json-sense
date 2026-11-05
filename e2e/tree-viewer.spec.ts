import { test, expect } from '@playwright/test';

test.describe('JSON Tree Viewer User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays nested JSON structures with correct keys and values', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });
    const payload = JSON.stringify({
      service: 'jsonsense',
      version: '0.1.0',
      active: true,
      metadata: {
        author: 'Senem',
        stars: 100,
      },
      tags: ['developer', 'json'],
    });

    await editor.fill(payload);
    await page.getByRole('button', { name: 'Tree Viewer' }).click();

    // Verify presence of keys in the tree
    await expect(page.getByText('service:', { exact: false })).toBeVisible();
    await expect(page.getByText('"jsonsense"', { exact: false })).toBeVisible();
    await expect(page.getByText('version:', { exact: false })).toBeVisible();
    await expect(page.getByText('active:', { exact: false })).toBeVisible();
    await expect(page.getByText('metadata:', { exact: false })).toBeVisible();
    await expect(page.getByText('author:', { exact: false })).toBeVisible();
    await expect(page.getByText('tags:', { exact: false })).toBeVisible();
  });

  test('filters nodes by search query and clears filter', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });
    const payload = JSON.stringify({
      user: {
        name: 'Alice',
        email: 'alice@example.com',
      },
      company: {
        organization: 'Acme Corp',
        department: 'Engineering',
      },
    });

    await editor.fill(payload);
    await page.getByRole('button', { name: 'Tree Viewer' }).click();

    // Verify all keys are initially present
    await expect(page.getByText('user:', { exact: false })).toBeVisible();
    await expect(page.getByText('company:', { exact: false })).toBeVisible();

    // Filter by specific keyword
    const searchInput = page.getByPlaceholder('Filter keys or values...');
    await searchInput.fill('organization');

    // Matching key should be visible
    await expect(page.getByText('organization:', { exact: false })).toBeVisible();
    // Non-matching branch should be filtered out
    await expect(page.getByText('email:', { exact: false })).not.toBeVisible();

    // Clear search filter using clear button
    await page.getByRole('button', { name: '✕' }).click();
    await expect(searchInput).toHaveValue('');
    await expect(page.getByText('email:', { exact: false })).toBeVisible();
  });

  test('collapses and expands all tree nodes', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });
    const payload = JSON.stringify({
      database: {
        host: 'localhost',
        port: 5432,
      },
    });

    await editor.fill(payload);
    await page.getByRole('button', { name: 'Tree Viewer' }).click();

    // Initially child nodes are expanded
    await expect(page.getByText('host:', { exact: false })).toBeVisible();

    // Collapse All
    await page.getByRole('button', { name: 'Collapse All' }).click();
    await expect(page.getByText('host:', { exact: false })).not.toBeVisible();

    // Expand All
    await page.getByRole('button', { name: 'Expand All' }).click();
    await expect(page.getByText('host:', { exact: false })).toBeVisible();
  });

  test('shows empty state notice when JSON is empty', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(editor).toHaveValue('');

    await page.getByRole('button', { name: 'Tree Viewer' }).click();
    await expect(page.getByText('No JSON to Explore')).toBeVisible();
  });
});
