import { test, expect } from '@playwright/test';

test.describe('Theme Management & Persistence User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('toggles theme between light and dark modes and persists preference after reload', async ({ page }) => {
    const html = page.locator('html');
    const toggleButton = page.getByRole('button', { name: /Switch to (light|dark) mode/i });

    // Determine initial state
    const isInitiallyDark = await html.evaluate((el) => el.classList.contains('dark'));

    // Toggle theme
    await toggleButton.click();

    if (isInitiallyDark) {
      // Switched to light
      await expect(html).not.toHaveClass(/dark/);
      await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();

      // Check localStorage persistence
      const savedTheme = await page.evaluate(() => localStorage.getItem('json-buddy-theme'));
      expect(savedTheme).toBe('light');

      // Reload page and verify persistence
      await page.reload();
      await expect(html).not.toHaveClass(/dark/);
      await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();

      // Toggle back to dark
      await page.getByRole('button', { name: 'Switch to dark mode' }).click();
      await expect(html).toHaveClass(/dark/);
      await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
    } else {
      // Switched to dark
      await expect(html).toHaveClass(/dark/);
      await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();

      // Check localStorage persistence
      const savedTheme = await page.evaluate(() => localStorage.getItem('json-buddy-theme'));
      expect(savedTheme).toBe('dark');

      // Reload page and verify persistence
      await page.reload();
      await expect(html).toHaveClass(/dark/);
      await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();

      // Toggle back to light
      await page.getByRole('button', { name: 'Switch to light mode' }).click();
      await expect(html).not.toHaveClass(/dark/);
      await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();
    }
  });
});
