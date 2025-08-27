import { test, expect } from '@playwright/test';

test.describe('Calendar Page Tests', () => {
  test('Calendar page displays upcoming tournaments in hero section', async ({ page }) => {
    await page.goto('/hu/calendar');
    await page.waitForLoadState('networkidle');

    // Check that the hero section is visible
    await expect(page.locator('h1:text("Kiemelt események")')).toBeVisible();
    
    // Check for upcoming tournaments list
    // TODO: mock upcoming tournaments for stability
    await expect(page.locator('text=Contrast Clash')).toBeVisible();
  });

  test('Calendar page displays markdown content from CMS', async ({ page }) => {
    await page.goto('/en/calendar');
    await page.waitForLoadState('networkidle');

    // Check for content sections from the calendar.en.md file using heading selectors
    await expect(page.locator('h3:text("Club Days")')).toBeVisible();
    await expect(page.locator('h3:text("Tournaments")')).toBeVisible();
    await expect(page.locator('h3:text("Leagues")')).toBeVisible();
    
    // Check for specific content that should be in the markdown
    await expect(page.locator('text=Meta Club Day')).toBeVisible();
    await expect(page.locator('text=Contrast Phase Club Day')).toBeVisible();
  });

  test('Hungarian calendar page shows correct localized content', async ({ page }) => {
    await page.goto('/hu/calendar');
    await page.waitForLoadState('networkidle');

    // Check Hungarian hero text
    await expect(page.locator('h1:text("Kiemelt események")')).toBeVisible();
    
    // Check Hungarian content sections using heading selectors
    await expect(page.locator('h3:text("Klubnapok")')).toBeVisible();
    await expect(page.locator('h3:text("Versenyek")')).toBeVisible();
    await expect(page.locator('h3:text("Ligák")')).toBeVisible();
    
    // Check for Hungarian tournament text pattern
    await expect(page.locator('text=verseny:')).toBeVisible();
  });
});