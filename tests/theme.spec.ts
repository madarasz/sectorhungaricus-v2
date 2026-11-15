import { test, expect } from './fixtures';

test.describe('Theme Switching Tests', () => {
  test('theme button toggles the theme, and the theme stays after reload and on other pages', async ({ page }) => {
    await page.goto('/hu/');
    const html = page.locator('html');
    const themeToggle = page.getByTestId('theme-toggle');
    // Sun icon shows in dark mode
    const themeIcon = themeToggle.locator('svg');

    // Light theme by default
    await expect(themeToggle).toBeVisible();
    await expect(html).toHaveClass(/light/);
    const nav = page.locator('nav');
    const initialNavBgColor = await nav.evaluate((el) => getComputedStyle(el).backgroundColor);

    await themeToggle.click();
    await expect(html).toHaveClass(/dark/);
    await expect(themeIcon).toHaveAttribute('data-icon', 'sun');
    await expect.poll(() => nav.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(initialNavBgColor);

    // Preference is saved in localStorage
    expect(await page.evaluate(() => localStorage.getItem('preferred-theme'))).toBe('dark');

    // Theme stays after reload
    await page.reload();
    await expect(html).toHaveClass(/dark/);
    await expect(themeIcon).toHaveAttribute('data-icon', 'sun');

    // Theme stays on another page
    await page.goto('/en/');
    await expect(html).toHaveClass(/dark/);
    await expect(themeIcon).toHaveAttribute('data-icon', 'sun');
  });
});
