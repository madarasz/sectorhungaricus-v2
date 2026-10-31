import { test, expect } from '@playwright/test';
import { concludedTournamentPlayerCounts } from './helpers/content';

test.describe('Tournament Results Player Limit', () => {
  for (const locale of ['en', 'hu']) {
    test(`Player limit dropdown switches between top 16 and all players (${locale})`, async ({ page }) => {
      await page.goto(`/${locale}/kill-team/tournament-results/`);

      const select = page.locator('#player-limit-select');
      const rows = page.locator('#tournament-results-table tbody tr');
      const count = page.locator('#tournament-results-count');

      // Default shows top 16
      await expect(select).toBeVisible();
      await expect(select).toHaveValue('top');
      await expect(rows).toHaveCount(16);
      await expect(count).toContainText('16');

      // Switch to all players
      await select.selectOption('all');
      await expect(select).toHaveValue('all');
      const allCount = await rows.count();
      expect(allCount).toBeGreaterThan(16);
      await expect(count).toContainText(String(allCount));

      // Switch back to top 16
      await select.selectOption('top');
      await expect(rows).toHaveCount(16);
    });
  }
});

test.describe('Concluded Tournaments player counts', () => {
  for (const locale of ['en', 'hu']) {
    test(`Each concluded tournament shows its player count (${locale})`, async ({ page }) => {
      await page.goto(`/${locale}/kill-team/tournament-results/`);

      const expected = concludedTournamentPlayerCounts();
      const counts = page.getByTestId('tournament-players');
      await expect(counts).toHaveCount(expected.length);

      for (const [index, { name, players }] of expected.entries()) {
        const item = counts.nth(index).locator('..');
        await expect(item.getByRole('link')).toHaveText(name);
        await expect(counts.nth(index)).toContainText(String(players));
      }
    });
  }
});
