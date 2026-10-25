import { test, expect } from '@playwright/test';
import { readCollection } from './helpers/content';

test.describe('Game Loading Tests', () => {
  test('Hungarian page displays the game titles as headings', async ({ page }) => {
    await page.goto('/hu/');

    const games = readCollection('games', 'hu');
    expect(games.length).toBeGreaterThan(0);
    for (const game of games) {
      await expect(page.locator('h3').filter({ hasText: game.data.title as string }).first()).toBeVisible();
    }
  });
});
