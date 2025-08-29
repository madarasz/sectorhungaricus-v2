import { test, expect } from '@playwright/test';

test.describe('Game Loading Tests', () => {
  test('Hungarian page displays Kill Team and Spearhead game titles', async ({ page }) => {
    await page.goto('/hu/');

    // Check for game titles using specific heading selectors to avoid strict mode violations
    await expect(page.locator('h3:text("Kill Team")')).toBeVisible();
    await expect(page.locator('h3:text("Spearhead")')).toBeVisible();
  });

  test('Game cards are properly rendered on Hungarian page', async ({ page }) => {
    await page.goto('/hu/');
    
    // Verify game titles are visible as headings
    await expect(page.locator('h3:text("Kill Team")')).toBeVisible();
    await expect(page.locator('h3:text("Spearhead")')).toBeVisible();
  });
});