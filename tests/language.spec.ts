import { test, expect } from '@playwright/test';

test.describe('Language Tests', () => {
  test('Hungarian page displays correct texts', async ({ page }) => {
    await page.goto('/hu/');
    await page.waitForLoadState('networkidle');

    // Check for Hungarian texts from content files and navigation - use first() to avoid strict mode violations
    await expect(page.locator('text=Naptár').first()).toBeVisible();
    await expect(page.locator('text=Rólunk').first()).toBeVisible();
    await expect(page.locator('text=Üdvözlünk').first()).toBeVisible();
    await expect(page.locator('text=Közösségünk').first()).toBeVisible();
    await expect(page.locator('text=Akciódús').first()).toBeVisible();
    await expect(page.locator('text=Gyors').first()).toBeVisible();
  });

  test('English page displays correct texts', async ({ page }) => {
    await page.goto('/en/');
    await page.waitForLoadState('networkidle');

    // Check for English texts from content files and navigation - use first() to avoid strict mode violations
    await expect(page.locator('text=Calendar').first()).toBeVisible();
    await expect(page.locator('text=About us').first()).toBeVisible();
    await expect(page.locator('text=Welcome').first()).toBeVisible();
    await expect(page.locator('text=group').first()).toBeVisible();
    await expect(page.locator('text=Action-packed').first()).toBeVisible();
    await expect(page.locator('text=fast').first()).toBeVisible();
  });
});