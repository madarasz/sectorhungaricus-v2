import { test, expect } from '@playwright/test';

test.describe('Theme Switching Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies to start fresh
    await page.context().clearCookies();
  });

  test('should toggle theme when clicking theme button', async ({ page }) => {
    await page.goto('/hu/');

    // Get the theme toggle button
    const themeToggle = page.getByTestId('theme-toggle');
    await expect(themeToggle).toBeVisible();

    // Check initial state (should be light theme by default)
    const initialHtmlClass = await page.locator('html').getAttribute('class');
    expect(initialHtmlClass).toContain('light');

    // Check navigation background color is light theme
    const nav = page.locator('nav');
    const initialNavBgColor = await nav.evaluate((el) => 
      getComputedStyle(el).backgroundColor
    );

    // Click theme toggle to switch to dark theme
    await themeToggle.click();
    
    // Wait for theme change
    await page.waitForTimeout(500);

    // Verify HTML class changed to dark
    const updatedHtmlClass = await page.locator('html').getAttribute('class');
    expect(updatedHtmlClass).toContain('dark');

    // Check navigation background color changed
    const updatedNavBgColor = await nav.evaluate((el) => 
      getComputedStyle(el).backgroundColor
    );
    expect(updatedNavBgColor).not.toBe(initialNavBgColor);

    // Verify theme icon changed (should show sun when in dark mode)
    const themeIcon = themeToggle.locator('svg');
    const iconClass = await themeIcon.getAttribute('data-icon');
    expect(iconClass).toBe('sun');
  });

  test('should persist theme preference in localStorage', async ({ page }) => {
    await page.goto('/hu/');

    // Switch to dark theme
    const themeToggle = page.getByTestId('theme-toggle');
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Check localStorage
    const savedTheme = await page.evaluate(() => {
      try {
        return localStorage.getItem('preferred-theme');
      } catch {
        return null;
      }
    });
    expect(savedTheme).toBe('dark');

    // Reload page and verify theme is still dark
    await page.reload();
    
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');

    // Verify icon is still sun (dark mode)
    const themeIcon = themeToggle.locator('svg');
    const iconClass = await themeIcon.getAttribute('data-icon');
    expect(iconClass).toBe('sun');
  });

  test('should maintain theme across different pages', async ({ page }) => {
    await page.goto('/hu/');

    // Switch to dark theme
    const themeToggle = page.getByTestId('theme-toggle');
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Navigate to English page
    await page.goto('/en/');

    // Verify theme is still dark
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');

    // Verify theme toggle still shows sun icon (dark mode)
    const englishThemeToggle = page.getByTestId('theme-toggle');
    const themeIcon = englishThemeToggle.locator('svg');
    const iconClass = await themeIcon.getAttribute('data-icon');
    expect(iconClass).toBe('sun');
  });
});