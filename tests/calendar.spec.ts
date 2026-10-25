import { test, expect } from '@playwright/test';
import { Locale, markdownHeadings, markdownListTerms, pageData, readContent, upcomingTournaments } from './helpers/content';

// Date mocking is now handled via TEST_CURRENT_DATE environment variable
// set in playwright.config.ts, so no client-side mocking is needed
const NOW = new Date(process.env.TEST_CURRENT_DATE!);

test.describe('Calendar Page Tests', () => {
  test('Calendar page displays upcoming tournaments in hero section', async ({ page }) => {
    await page.goto('/hu/calendar');

    // Check that the hero section is visible
    await expect(page.locator('h1').filter({ hasText: pageData('calendar', 'hu').hero })).toBeVisible();

    // Check for upcoming tournaments list
    const [firstTournament] = upcomingTournaments(NOW);
    expect(firstTournament).toBeDefined();
    await expect(page.getByText(firstTournament.title, { exact: true }).first()).toBeVisible();
  });

  for (const locale of ['en', 'hu'] as Locale[]) {
    test(`Calendar page displays markdown content from CMS (${locale})`, async ({ page }) => {
      await page.goto(`/${locale}/calendar`);
      const { body } = readContent('pages', 'calendar', locale);

      // Check for content sections from the calendar markdown file using heading selectors
      const headings = markdownHeadings(body, 3);
      expect(headings.length).toBeGreaterThan(0);
      for (const heading of headings) {
        await expect(page.locator('h3').filter({ hasText: heading })).toBeVisible();
      }

      // Check for the list item terms of the markdown
      for (const term of markdownListTerms(body)) {
        await expect(page.locator('strong').filter({ hasText: term }).first()).toBeVisible();
      }
    });
  }
});
