import { test, expect, Page } from '@playwright/test';
import { tournamentSeasons } from './helpers/content';
import { getTournamentResultsTranslations } from '@/lib/translations';

const TOP_PLAYERS_COUNT = 16;

async function expectConcludedTournaments(page: Page, tournaments: Array<{ name: string; players: number }>) {
  const counts = page.getByTestId('tournament-players');
  await expect(counts).toHaveCount(tournaments.length);

  for (const [index, { name, players }] of tournaments.entries()) {
    const item = counts.nth(index).locator('..');
    await expect(item.getByRole('link')).toHaveText(name);
    await expect(counts.nth(index)).toContainText(String(players));
  }
}

test.describe('Tournament Results Player Limit', () => {
  for (const locale of ['en', 'hu']) {
    test(`Player limit dropdown switches between top 16 and all players (${locale})`, async ({ page }) => {
      await page.goto(`/${locale}/kill-team/tournament-results/`);

      const [season] = tournamentSeasons();
      const topCount = Math.min(TOP_PLAYERS_COUNT, season.eligiblePlayers);
      const select = page.locator('#player-limit-select');
      const rows = page.locator('#tournament-results-table tbody tr');
      const count = page.locator('#tournament-results-count');

      // Default shows top 16
      await expect(select).toBeVisible();
      await expect(select).toHaveValue('top');
      await expect(rows).toHaveCount(topCount);
      await expect(count).toContainText(String(topCount));

      // Switch to all players
      await select.selectOption('all');
      await expect(select).toHaveValue('all');
      await expect(rows).toHaveCount(season.eligiblePlayers);
      await expect(count).toContainText(String(season.eligiblePlayers));

      // Switch back to top 16
      await select.selectOption('top');
      await expect(rows).toHaveCount(topCount);
    });
  }
});

test.describe('Tournament Results Season filter', () => {
  for (const locale of ['en', 'hu']) {
    test(`Season dropdown changes players and concluded tournaments (${locale})`, async ({ page }) => {
      await page.goto(`/${locale}/kill-team/tournament-results/`);

      const seasons = tournamentSeasons();
      const select = page.locator('#season-select');
      const rows = page.locator('#tournament-results-table tbody tr');
      const title = page.locator('#tournament-results-title');

      // Newest season is selected by default
      await expect(select).toHaveValue(seasons[0].id);
      await expect(select.locator('option')).toHaveCount(seasons.length);

      await page.locator('#player-limit-select').selectOption('all');
      const titles = new Set<string>();

      for (const season of seasons) {
        await select.selectOption(season.id);
        await expect(select).toHaveValue(season.id);
        await expect(rows).toHaveCount(season.eligiblePlayers);
        await expectConcludedTournaments(page, season.tournaments);
        titles.add((await title.textContent()) ?? '');
      }

      // Each season has its own table title
      expect(titles.size).toBe(seasons.length);
    });
  }
});

test.describe('Concluded Tournaments player counts', () => {
  for (const locale of ['en', 'hu']) {
    test(`Each concluded tournament shows its player count (${locale})`, async ({ page }) => {
      await page.goto(`/${locale}/kill-team/tournament-results/`);
      await expectConcludedTournaments(page, tournamentSeasons()[0].tournaments);
    });
  }
});

test.describe('Tournament Results Show all players filter', () => {
  for (const locale of ['en', 'hu'] as const) {
    test(`Checkbox removes the minimum tournaments rule (${locale})`, async ({ page }) => {
      await page.goto(`/${locale}/kill-team/tournament-results/`);

      const t = getTournamentResultsTranslations(locale);
      const seasons = tournamentSeasons();
      const seasonSelect = page.locator('#season-select');
      const checkbox = page.locator('#show-all-players');
      const rows = page.locator('#tournament-results-table tbody tr');
      const title = page.locator('#tournament-results-title');
      const minScope = (season: { minTournaments: number }) =>
        `(${t.playerScope.minTournaments(season.minTournaments)})`;
      const allScope = `(${t.playerScope.allPlayers})`;

      await page.locator('#player-limit-select').selectOption('all');

      for (const season of seasons) {
        await seasonSelect.selectOption(season.id);

        if (season.minTournaments <= 1) {
          // Minimum of 1 tournament: always checked and disabled
          await expect(checkbox).toBeChecked();
          await expect(checkbox).toBeDisabled();
          await expect(title).toContainText(allScope);
          await expect(rows).toHaveCount(season.allPlayers);
          continue;
        }

        // Unchecked by default
        await expect(checkbox).toBeEnabled();
        await expect(checkbox).not.toBeChecked();
        await expect(title).toContainText(minScope(season));
        await expect(rows).toHaveCount(season.eligiblePlayers);

        await checkbox.check();
        await expect(title).toContainText(allScope);
        await expect(title).not.toContainText(minScope(season));
        await expect(rows).toHaveCount(season.allPlayers);

        await checkbox.uncheck();
        await expect(rows).toHaveCount(season.eligiblePlayers);
      }
    });
  }
});
