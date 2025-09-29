import { test, expect, Page } from '@playwright/test';

async function mockDateTo2025September(page: Page) {
  await page.addInitScript(() => {
    const mockDate = new Date('2025-09-01T00:00:00.000Z');
    Date.now = () => mockDate.getTime();

    const OriginalDate = Date;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Date = class extends OriginalDate {
      constructor(...args: unknown[]) {
        if (args.length === 0) {
          super(mockDate.getTime());
        } else {
          super(...(args as [string | number | Date]));
        }
      }

      static now() {
        return mockDate.getTime();
      }
    };
  });
}

test.describe('Calendar Page Tests', () => {
  test('Calendar page displays upcoming tournaments in hero section', async ({ page }) => {
    await mockDateTo2025September(page);
    await page.goto('/hu/calendar');

    // Check that the hero section is visible
    await expect(page.locator('h1:text("Kiemelt események")')).toBeVisible();
    
    // Check for upcoming tournaments list
    await expect(page.locator('text=Contrast Clash')).toBeVisible();
  });

  test('Calendar page displays markdown content from CMS', async ({ page }) => {
    await mockDateTo2025September(page);
    await page.goto('/en/calendar');

    // Check for content sections from the calendar.en.md file using heading selectors
    await expect(page.locator('h3:text("Club Days")')).toBeVisible();
    await expect(page.locator('h3:text("Tournaments")')).toBeVisible();
    await expect(page.locator('h3:text("Leagues")')).toBeVisible();
    
    // Check for specific content that should be in the markdown
    await expect(page.locator('text=Meta Club Day')).toBeVisible();
    await expect(page.locator('text=Contrast Phase Club Day')).toBeVisible();
  });

  test('Hungarian calendar page shows correct localized content', async ({ page }) => {
    await mockDateTo2025September(page);
    await page.goto('/hu/calendar');

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