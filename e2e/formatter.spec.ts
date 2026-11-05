import { test, expect } from '@playwright/test';

test.describe('JSON Formatter & Minifier User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('formats JSON with 2-space indentation', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });
    const rawJson = '{"app":"JsonSense","version":"1.0.0","active":true}';

    await editor.fill(rawJson);
    await page.getByRole('button', { name: 'Format (2 Spaces)' }).click();

    const expected = JSON.stringify(JSON.parse(rawJson), null, 2);
    await expect(editor).toHaveValue(expected);
  });

  test('formats JSON with 4-space indentation', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });
    const rawJson = '{"features":["format","validate"],"stars":100}';

    await editor.fill(rawJson);
    await page.getByRole('button', { name: 'Format (4 Spaces)' }).click();

    const expected = JSON.stringify(JSON.parse(rawJson), null, 4);
    await expect(editor).toHaveValue(expected);
  });

  test('minifies formatted JSON to a single line without unnecessary whitespace', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });
    const prettyJson = `{\n  "title": "Minify Test",\n  "count": 42\n}`;

    await editor.fill(prettyJson);
    await page.getByRole('button', { name: 'Minify' }).click();

    await expect(editor).toHaveValue('{"title":"Minify Test","count":42}');
  });

  test('clears input and loads sample JSON', async ({ page }) => {
    const editor = page.getByRole('textbox', { name: 'JSON Input' });

    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(editor).toHaveValue('');

    await page.getByRole('button', { name: 'Sample' }).click();
    await expect(editor).toContainText('JsonSense');
  });
});
