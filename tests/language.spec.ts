import { test, expect } from './fixtures';
import { Locale, firstParagraphText, pageData, readCollection, readContent } from './helpers/content';

test.describe('Language Tests', () => {
  for (const locale of ['hu', 'en'] as Locale[]) {
    test(`${locale} page displays texts from the content files`, async ({ page }) => {
      // Set desktop viewport to ensure navigation texts are visible
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`/${locale}/`);

      // Navigation and footer texts are page titles - use first() to avoid strict mode violations
      await expect(page.getByText(pageData('calendar', locale).title, { exact: true }).first()).toBeVisible();
      await expect(page.getByText(pageData('about-us', locale).title, { exact: true }).first()).toBeVisible();

      // Homepage content
      const home = readContent('pages', 'welcome-to-sector-hungaricus', locale);
      await expect(page.getByText(home.data.title as string, { exact: true }).first()).toBeVisible();
      await expect(page.locator('body')).toContainText(firstParagraphText(home.body));

      // Game titles as headings
      const games = readCollection('games', locale);
      expect(games.length).toBeGreaterThan(0);
      for (const game of games) {
        await expect(page.locator('h3').filter({ hasText: game.data.title as string }).first()).toBeVisible();
      }
    });
  }
});
