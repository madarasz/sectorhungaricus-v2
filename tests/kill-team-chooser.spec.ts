import { test, expect } from '@playwright/test';

const PAGE_URL = '/en/kill-team/choose-a-team/';

test.describe('Kill Team chooser', () => {
  // Team photos come from the warhammer.com shop; slow responses from it make page loads time out
  test.beforeEach(async ({ page }) => {
    await page.route(/^https:\/\/www\.warhammer\.com\//, (route) => route.abort());
  });

  test('shows all teams as cards without power tier', async ({ page }) => {
    await page.goto(PAGE_URL);

    const chooser = page.getByTestId('kt-chooser');
    await expect(chooser).toBeVisible();

    const cards = page.locator('[data-testid^="kt-card-"]').filter({ has: page.getByTestId('kt-card-name') });
    const total = await cards.count();
    expect(total).toBeGreaterThan(1);
    await expect(page.getByTestId('kt-result-count')).toContainText(`${total} of ${total}`);

    // Power tier is only visible in the detail view
    await expect(page.getByTestId('kt-detail-tier')).toHaveCount(0);
    await expect(page.getByTestId('kt-beginner-tag').first()).toHaveText('Beginner-friendly');
    await expect(page.getByTestId('kt-card-battleclade').getByTestId('kt-pro-tag')).toHaveText('For Pros');
    await expect(page.getByTestId('kt-card-angels-of-death').getByTestId('kt-pro-tag')).toHaveCount(0);
  });

  test('answers filter the teams and update the URL', async ({ page }) => {
    await page.goto(PAGE_URL);

    const cards = page.locator('[data-testid^="kt-card-"]').filter({ has: page.getByTestId('kt-card-name') });
    const total = await cards.count();

    const answer = page.getByTestId('kt-answer-exp-new');
    await answer.click();
    await expect(answer).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/exp=new/);

    const filtered = await cards.count();
    expect(filtered).toBeLessThan(total);
    await expect(page.getByTestId('kt-result-count')).toContainText(`${filtered} of ${total}`);

    // Every visible card is beginner-friendly
    for (let i = 0; i < filtered; i++) {
      await expect(cards.nth(i).getByTestId('kt-beginner-tag')).toBeVisible();
    }

    // Filters survive a reload
    await page.reload();
    await expect(page.getByTestId('kt-answer-exp-new')).toHaveAttribute('aria-pressed', 'true');
    await expect(cards).toHaveCount(filtered);

    // Clicking the same answer again clears it
    await page.getByTestId('kt-answer-exp-new').click();
    await expect(cards).toHaveCount(total);
    await expect(page).not.toHaveURL(/exp=/);
  });

  test('experience answers hide or show pro-only teams', async ({ page }) => {
    await page.goto(`${PAGE_URL}?exp=played`);
    const cards = page.locator('[data-testid^="kt-card-"]').filter({ has: page.getByTestId('kt-card-name') });
    await expect(page.getByTestId('kt-answer-exp-played')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('kt-card-angels-of-death')).toBeVisible();
    await expect(page.getByTestId('kt-pro-tag')).toHaveCount(0);

    await page.getByTestId('kt-answer-exp-pro').click();
    await expect(page).toHaveURL(/exp=pro/);
    await expect(page.getByTestId('kt-card-battleclade')).toBeVisible();
    const filtered = await cards.count();
    expect(filtered).toBeGreaterThan(0);
    for (let i = 0; i < filtered; i++) {
      await expect(cards.nth(i).getByTestId('kt-pro-tag')).toBeVisible();
    }
  });

  test('shows empty state and reset clears answers', async ({ page }) => {
    await page.goto(`${PAGE_URL}?exp=new&fight=ranged&faction=xenos`);

    await expect(page.getByTestId('kt-empty')).toBeVisible();
    await page.getByTestId('kt-reset').click();
    await expect(page.getByTestId('kt-empty')).toHaveCount(0);
    await expect(page.getByTestId('kt-reset')).toHaveCount(0);
  });

  test('card opens team details and closes', async ({ page }) => {
    await page.goto(PAGE_URL);

    await page.getByTestId('kt-card-blades-of-khaine').click();
    const detail = page.getByTestId('kt-detail');
    await expect(detail).toBeVisible();
    await expect(detail.getByTestId('kt-detail-name')).toHaveText('Blades of Khaine');
    await expect(detail.getByTestId('kt-detail-legal')).toBeVisible();
    await expect(detail.getByTestId('kt-detail-factions').locator('li')).toHaveText(['Xenos', 'Aeldari']);
    await expect(page).toHaveURL(/team=blades-of-khaine/);

    await page.getByTestId('kt-detail-close').click();
    await expect(detail).toHaveCount(0);
    await expect(page).not.toHaveURL(/team=/);
  });

  test('team sold in WH40k boxes shows a badge on the card and a note in the details', async ({ page }) => {
    await page.goto(PAGE_URL);

    const card = page.getByTestId('kt-card-warpcoven');
    await expect(card.getByTestId('kt-box-type-badge')).toHaveText('WH40k box');
    await expect(page.getByTestId('kt-card-nemesis-claw').getByTestId('kt-box-type-badge')).toHaveCount(0);

    await card.click();
    const boxType = page.getByTestId('kt-detail').getByTestId('kt-detail-box-type');
    await expect(boxType).toHaveAttribute('data-box-type', 'wh40k');
    await expect(boxType).toContainText('no longer sold as a Kill Team box');
  });

  test('team sold in a Kill Team box has no box type note in the details', async ({ page }) => {
    await page.goto(`${PAGE_URL}?team=nemesis-claw`);

    await expect(page.getByTestId('kt-detail')).toBeVisible();
    await expect(page.getByTestId('kt-detail-box-type')).toHaveCount(0);
  });

  test('selected team opens from the URL and Escape closes it', async ({ page }) => {
    await page.goto(`${PAGE_URL}?team=nemesis-claw`);

    const detail = page.getByTestId('kt-detail');
    await expect(detail.getByTestId('kt-detail-name')).toHaveText('Nemesis Claw');

    await page.keyboard.press('Escape');
    await expect(detail).toHaveCount(0);
  });

  test('mobile shows details as a bottom sheet', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(PAGE_URL);

    await page.getByTestId('kt-card-deathwatch').click();
    const detail = page.getByTestId('kt-detail');
    await expect(detail).toBeVisible();
    await expect(page.getByTestId('kt-detail-backdrop')).toBeVisible();

    const box = await detail.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.round(box!.y + box!.height)).toBeGreaterThanOrEqual(811);

    await page.getByTestId('kt-detail-backdrop').click({ position: { x: 20, y: 20 } });
    await expect(detail).toHaveCount(0);
  });

  test.describe('mobile filters', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
    });

    test('teams show first and the questions are in a closed sheet', async ({ page }) => {
      await page.goto(PAGE_URL);

      await expect(page.getByTestId('kt-filters-open')).toBeVisible();
      await expect(page.getByTestId('kt-filter-sheet')).toBeHidden();
      await expect(page.getByTestId('kt-filters-count')).toHaveCount(0);

      // First team card is above the fold
      const firstCard = page.getByTestId('kt-grid').locator('[data-testid^="kt-card-"]').first();
      const box = await firstCard.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y).toBeLessThan(740);
    });

    test('result count is above the teams', async ({ page }) => {
      await page.goto(PAGE_URL);

      const grid = await page.getByTestId('kt-grid').boundingBox();
      const count = await page.getByTestId('kt-result-count').boundingBox();
      expect(grid && count).toBeTruthy();
      expect(count!.y).toBeLessThan(grid!.y);
    });

    test('answers in the sheet filter the teams and show the result count', async ({ page }) => {
      await page.goto(PAGE_URL);
      const cards = page.locator('[data-testid^="kt-card-"]').filter({ has: page.getByTestId('kt-card-name') });
      const total = await cards.count();

      await page.getByTestId('kt-filters-open').click();
      const sheet = page.getByTestId('kt-filter-sheet');
      await expect(sheet).toBeVisible();
      await expect(sheet).toHaveAttribute('role', 'dialog');
      await expect(page.getByTestId('kt-filters-show')).toHaveText(`Show ${total} teams`);

      await page.getByTestId('kt-answer-exp-new').click();
      await page.getByTestId('kt-answer-faction-imperium').click();
      const filtered = await cards.count();
      expect(filtered).toBeLessThan(total);
      await expect(page.getByTestId('kt-filters-show')).toHaveText(`Show ${filtered} teams`);

      await page.getByTestId('kt-filters-show').click();
      await expect(sheet).toBeHidden();
      await expect(page.getByTestId('kt-filters-count')).toHaveText('2');
      await expect(page).toHaveURL(/exp=new/);
    });

    test('sheet reset clears answers and close button, Escape and backdrop close the sheet', async ({ page }) => {
      await page.goto(`${PAGE_URL}?exp=new`);
      const sheet = page.getByTestId('kt-filter-sheet');

      await page.getByTestId('kt-filters-open').click();
      await page.getByTestId('kt-filters-reset').click();
      await expect(page.getByTestId('kt-answer-exp-new')).toHaveAttribute('aria-pressed', 'false');
      await expect(page.getByTestId('kt-filters-reset')).toHaveCount(0);
      await page.getByTestId('kt-filters-close').click();
      await expect(sheet).toBeHidden();

      await page.getByTestId('kt-filters-open').click();
      await page.keyboard.press('Escape');
      await expect(sheet).toBeHidden();

      await page.getByTestId('kt-filters-open').click();
      await page.getByTestId('kt-filters-backdrop').click({ position: { x: 20, y: 20 } });
      await expect(sheet).toBeHidden();
    });

    test('Hungarian page uses Hungarian filter labels', async ({ page }) => {
      await page.goto('/hu/kill-team/choose-a-team/');
      await expect(page.getByTestId('kt-filters-open')).toHaveText('Szűrők');
      await page.getByTestId('kt-filters-open').click();
      await expect(page.getByTestId('kt-filters-show')).toContainText('csapat megjelenítése');
    });
  });

  test('desktop shows the questions in place without the filters button', async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page.getByTestId('kt-filters-open')).toBeHidden();
    await expect(page.getByTestId('kt-questions')).toBeVisible();
    await expect(page.getByTestId('kt-filter-sheet')).not.toHaveAttribute('role', 'dialog');

    // Result count stays above the teams
    const grid = await page.getByTestId('kt-grid').boundingBox();
    const count = await page.getByTestId('kt-result-count').boundingBox();
    expect(count!.y).toBeLessThan(grid!.y);
  });

  test('team with operatives range shows min–max', async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page.getByTestId('kt-card-brood-brothers')).toContainText('10–14');
    await expect(page.getByTestId('kt-card-deathwatch')).toContainText('5');
  });

  test('filters are in two columns in the requested order', async ({ page }) => {
    await page.goto(PAGE_URL);
    const order = (column: number) =>
      page.getByTestId(`kt-question-column-${column}`).locator('> fieldset').evaluateAll((elements) => elements.map((e) => e.getAttribute('data-testid')));
    expect(await order(1)).toEqual(['kt-question-exp', 'kt-question-faction', 'kt-question-fight']);
    expect((await order(2)).slice(0, 2)).toEqual(['kt-question-size', 'kt-question-boxes']);
  });

  test('faction question shows main factions and sub factions of the selected ones in one place', async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page.getByTestId('kt-answer-faction-imperium')).toBeVisible();
    await expect(page.getByTestId('kt-answer-faction-chaos')).toBeVisible();
    await expect(page.getByTestId('kt-answer-faction-xenos')).toBeVisible();
    await expect(page.getByTestId('kt-answer-faction-necron')).toHaveCount(0);
    await expect(page.getByTestId('kt-subfactions')).toHaveCount(0);

    const subs = page.getByTestId('kt-subfactions').locator('[data-testid^="kt-answer-sub-"]');
    await page.getByTestId('kt-answer-faction-chaos').click();
    await expect(subs).toHaveCount(4);

    // Shared sub factions show only once
    await page.getByTestId('kt-answer-faction-imperium').click();
    await expect(subs).toHaveCount(8);
    await expect(page.getByTestId('kt-answer-sub-space-marine')).toHaveCount(1);
  });

  test('multiple main factions show teams of any selected faction', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.getByTestId('kt-answer-faction-imperium').click();
    await page.getByTestId('kt-answer-faction-xenos').click();
    await expect(page).toHaveURL(/faction=imperium&faction=xenos/);

    await expect(page.getByTestId('kt-card-deathwatch')).toBeVisible();
    await expect(page.getByTestId('kt-card-canoptek-circle')).toBeVisible();
    await expect(page.getByTestId('kt-card-nemesis-claw')).toHaveCount(0);
  });

  test('selected sub factions list only their teams', async ({ page }) => {
    await page.goto(`${PAGE_URL}?faction=imperium&faction=xenos`);
    await page.getByTestId('kt-answer-sub-necron').click();
    await expect(page).toHaveURL(/sub=necron/);

    await expect(page.getByTestId('kt-card-canoptek-circle')).toBeVisible();
    await expect(page.getByTestId('kt-card-blades-of-khaine')).toHaveCount(0);
    await expect(page.getByTestId('kt-card-deathwatch')).toHaveCount(0);

    // Second sub faction adds its teams
    await page.getByTestId('kt-answer-sub-space-marine').click();
    await expect(page.getByTestId('kt-card-deathwatch')).toBeVisible();
    await expect(page.getByTestId('kt-card-canoptek-circle')).toBeVisible();

    // Deselecting the main faction removes its sub factions
    await page.getByTestId('kt-answer-faction-xenos').click();
    await expect(page.getByTestId('kt-answer-sub-necron')).toHaveCount(0);
    await expect(page).not.toHaveURL(/xenos|necron/);
    await expect(page.getByTestId('kt-card-canoptek-circle')).toHaveCount(0);
    await expect(page.getByTestId('kt-card-deathwatch')).toBeVisible();
  });

  test('shared sub faction shows teams only of the selected main factions', async ({ page }) => {
    await page.goto(`${PAGE_URL}?faction=chaos&sub=space-marine`);
    await expect(page.getByTestId('kt-answer-sub-space-marine')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('kt-card-nemesis-claw')).toBeVisible();
    await expect(page.getByTestId('kt-card-deathwatch')).toHaveCount(0);

    // The sub faction stays selected while a main faction still has it
    await page.getByTestId('kt-answer-faction-imperium').click();
    await expect(page.getByTestId('kt-card-deathwatch')).toBeVisible();
    await page.getByTestId('kt-answer-faction-chaos').click();
    await expect(page.getByTestId('kt-answer-sub-space-marine')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('kt-card-nemesis-claw')).toHaveCount(0);
    await expect(page.getByTestId('kt-card-deathwatch')).toBeVisible();
  });

  test('mutant sub faction shows mutant teams', async ({ page }) => {
    await page.goto(`${PAGE_URL}?faction=chaos&sub=mutant`);
    await expect(page.getByTestId('kt-card-chaos-cult')).toBeVisible();
    await expect(page.getByTestId('kt-card-blooded')).toHaveCount(0);
  });

  test('sub faction in the URL without its main faction is ignored', async ({ page }) => {
    await page.goto(`${PAGE_URL}?faction=imperium&sub=necron`);
    await expect(page.getByTestId('kt-card-deathwatch')).toBeVisible();
    await expect(page.getByTestId('kt-card-canoptek-circle')).toHaveCount(0);
    await expect(page).not.toHaveURL(/sub=/);
  });

  test('Hungarian page shows Hungarian sub faction labels', async ({ page }) => {
    await page.goto('/hu/kill-team/choose-a-team/?faction=imperium');
    await expect(page.getByTestId('kt-answer-sub-baseline-human')).toHaveText('Közönséges ember');
    await expect(page.getByTestId('kt-answer-sub-inquisition')).toHaveText('Inkvizíció');
  });

  test('only one box checkbox hides teams that need more boxes', async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page.getByTestId('kt-question-boxes')).toContainText('How many boxes are you willing to buy?');

    const cards = page.locator('[data-testid^="kt-card-"]').filter({ has: page.getByTestId('kt-card-name') });
    const total = await cards.count();
    const checkbox = page.getByTestId('kt-answer-boxes-one');
    await checkbox.check();
    await expect(page).toHaveURL(/boxes=one/);
    // Angels of Death needs more than one box
    await expect(page.getByTestId('kt-card-angels-of-death')).toHaveCount(0);
    await expect(page.getByTestId('kt-card-nemesis-claw')).toBeVisible();

    await checkbox.uncheck();
    await expect(page).not.toHaveURL(/boxes=/);
    await expect(cards).toHaveCount(total);
  });

  test('horde answer shows only teams with 11 or more operatives', async ({ page }) => {
    await page.goto(`${PAGE_URL}?size=horde`);
    await expect(page.getByTestId('kt-answer-size-horde')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('kt-card-chaos-cult')).toBeVisible();
    await expect(page.getByTestId('kt-card-deathwatch')).toHaveCount(0);
  });

  test('non-classified teams are at the end of the list after a separator', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-03-01T12:00:00'));
    await page.goto(PAGE_URL);

    // Blooded has no legal until year
    const separator = page.getByTestId('kt-declassified-separator');
    await expect(separator).toContainText('Non-classified teams');
    const items = page.getByTestId('kt-grid').locator('> *');
    const testIds = await items.evaluateAll((elements) => elements.map((e) => e.getAttribute('data-testid')));
    const separatorIndex = testIds.indexOf('kt-declassified-separator');
    expect(separatorIndex).toBeGreaterThan(0);
    expect(testIds.indexOf('kt-card-deathwatch')).toBeLessThan(separatorIndex);
    expect(testIds.indexOf('kt-card-blooded')).toBeGreaterThan(separatorIndex);

    // The classified filter removes the separator
    await page.getByTestId('kt-answer-legal-classified').check();
    await expect(separator).toHaveCount(0);
  });

  test('Hungarian page shows combat icons from the shared data', async ({ page }) => {
    await page.goto('/hu/kill-team/choose-a-team/');
    await expect(page.getByTestId('kt-card-deathwatch').getByTestId('kt-combat-icons').locator('svg')).toHaveCount(3);
  });

  test('language switch keeps the answers and the selected team', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${PAGE_URL}?exp=played&team=battleclade`);
    await expect(page.getByTestId('kt-detail')).toBeVisible();
    await page.getByTestId('kt-detail-close').click();
    await page.getByTestId('kt-answer-fight-melee').click();
    await page.getByTestId('kt-card-angels-of-death').click();
    await expect(page.getByTestId('kt-detail-name')).toHaveText('Angels of Death');

    await page.getByTestId('desktop-language-switch').getByRole('button', { name: 'HU' }).click();
    await expect(page).toHaveURL(/\/hu\/kill-team\/choose-a-team\/\?/);
    await expect(page).toHaveURL(/exp=played/);
    await expect(page).toHaveURL(/fight=melee/);
    await expect(page).toHaveURL(/team=angels-of-death/);
    await expect(page.getByTestId('kt-answer-exp-played')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('kt-answer-fight-melee')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('kt-detail-name')).toHaveText('Angels of Death');
  });

  test('Hungarian page shows skill tags from the shared data', async ({ page }) => {
    await page.goto('/hu/kill-team/choose-a-team/');
    await expect(page.getByTestId('kt-card-battleclade').getByTestId('kt-pro-tag')).toHaveText('Profiknak');
    await expect(page.getByTestId('kt-card-deathwatch').getByTestId('kt-beginner-tag')).toHaveText('Kezdőbarát');
  });

  test.describe('tournament legality', () => {
    // Battleclade is tournament legal until 30 November 2027, Angels of Death until 30 November 2028

    test('shows the legal until date in English and Hungarian', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-03-01T12:00:00'));
      await page.goto(`${PAGE_URL}?team=battleclade`);
      const legal = page.getByTestId('kt-detail-legal');
      await expect(legal).toContainText('Classified until November, 2027');
      await expect(legal).toHaveAttribute('data-legality', 'classified');

      await page.goto('/hu/kill-team/choose-a-team/?team=battleclade');
      await expect(page.getByTestId('kt-detail-legal')).toContainText('Classified 2027. november végéig');
    });

    test('is still classified on 30 November a year before', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-11-30T12:00:00'));
      await page.goto(`${PAGE_URL}?team=battleclade`);
      await expect(page.getByTestId('kt-detail-legal')).toHaveAttribute('data-legality', 'classified');
    });

    test('rotates out soon less than a year before the legal until date', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-12-01T12:00:00'));
      await page.goto(`${PAGE_URL}?team=battleclade`);
      await expect(page.getByTestId('kt-detail-legal')).toHaveAttribute('data-legality', 'rotates_soon');
    });

    test('is non-classified after the legal until date', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2027-12-01T12:00:00'));
      await page.goto(`${PAGE_URL}?team=battleclade`);
      const legal = page.getByTestId('kt-detail-legal');
      await expect(legal).toHaveAttribute('data-legality', 'declassified');
      await expect(legal).toContainText('Not legal on most tournaments');
    });

    test('classified checkbox hides non-classified teams', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2027-12-01T12:00:00'));
      await page.goto(PAGE_URL);
      await expect(page.getByTestId('kt-question-legal')).toContainText('Legal on all tournaments');
      await expect(page.getByTestId('kt-card-battleclade')).toBeVisible();

      const checkbox = page.getByTestId('kt-answer-legal-classified');
      await checkbox.check();
      await expect(page).toHaveURL(/legal=classified/);
      await expect(page.getByTestId('kt-card-battleclade')).toHaveCount(0);
      await expect(page.getByTestId('kt-card-angels-of-death')).toBeVisible();

      await checkbox.uncheck();
      await expect(page).not.toHaveURL(/legal=/);
      await expect(page.getByTestId('kt-card-battleclade')).toBeVisible();
    });
  });

  test('Hungarian page uses Hungarian labels', async ({ page }) => {
    await page.goto('/hu/kill-team/choose-a-team/');
    await expect(page.getByTestId('kt-beginner-tag').first()).toHaveText('Kezdőbarát');
    await expect(page.getByTestId('kt-question-exp')).toContainText('Játszottál már Kill Teamet?');
  });
});
