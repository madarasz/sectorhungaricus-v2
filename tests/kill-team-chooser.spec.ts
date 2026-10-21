import { test, expect } from '@playwright/test';

const PAGE_URL = '/en/kill-team/choose-a-team/';

test.describe('Kill Team chooser', () => {
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

  test('shows empty state and reset clears answers', async ({ page }) => {
    await page.goto(`${PAGE_URL}?exp=new&fight=ranged&faction=orks`);

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
    await expect(page).toHaveURL(/team=blades-of-khaine/);

    await page.getByTestId('kt-detail-close').click();
    await expect(detail).toHaveCount(0);
    await expect(page).not.toHaveURL(/team=/);
  });

  test('selected team opens from the URL and Escape closes it', async ({ page }) => {
    await page.goto(`${PAGE_URL}?team=legionaries`);

    const detail = page.getByTestId('kt-detail');
    await expect(detail.getByTestId('kt-detail-name')).toHaveText('Legionaries');

    await page.keyboard.press('Escape');
    await expect(detail).toHaveCount(0);
  });

  test('mobile shows details as a bottom sheet', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(PAGE_URL);

    await page.getByTestId('kt-card-kasrkin').click();
    const detail = page.getByTestId('kt-detail');
    await expect(detail).toBeVisible();
    await expect(page.getByTestId('kt-detail-backdrop')).toBeVisible();

    const box = await detail.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.round(box!.y + box!.height)).toBeGreaterThanOrEqual(811);

    await page.getByTestId('kt-detail-backdrop').click({ position: { x: 20, y: 20 } });
    await expect(detail).toHaveCount(0);
  });

  test('team with operatives range shows min–max', async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page.getByTestId('kt-card-blades-of-khaine')).toContainText('8–10');
    await expect(page.getByTestId('kt-card-kasrkin')).toContainText('10');
  });

  test('faction question shows only filter factions', async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page.getByTestId('kt-answer-faction-imperium')).toBeVisible();
    await expect(page.getByTestId('kt-answer-faction-necrons')).toHaveCount(0);
  });

  test('horde answer shows only teams with 11 or more operatives', async ({ page }) => {
    await page.goto(`${PAGE_URL}?size=horde`);
    await expect(page.getByTestId('kt-answer-size-horde')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('kt-card-pathfinders')).toBeVisible();
    await expect(page.getByTestId('kt-card-kasrkin')).toHaveCount(0);
  });

  test('reviewed checkbox hides unreviewed teams and updates the URL', async ({ page }) => {
    await page.goto(PAGE_URL);
    const cards = page.locator('[data-testid^="kt-card-"]').filter({ has: page.getByTestId('kt-card-name') });
    const total = await cards.count();

    await page.getByTestId('kt-reviewed-filter').check();
    await expect(page).toHaveURL(/reviewed=yes/);
    expect(await cards.count()).toBeLessThanOrEqual(total);

    await page.getByTestId('kt-reviewed-filter').uncheck();
    await expect(page).not.toHaveURL(/reviewed=/);
    await expect(cards).toHaveCount(total);
  });

  test('Hungarian page shows combat icons from the shared data', async ({ page }) => {
    await page.goto('/hu/kill-team/choose-a-team/');
    await expect(page.getByTestId('kt-card-kasrkin').getByTestId('kt-combat-icons').locator('svg')).toHaveCount(3);
  });

  test.describe('tournament legality', () => {
    // Kasrkin is tournament legal until 30 November 2027, Angels of Death until 30 November 2028

    test('shows the legal until date in English and Hungarian', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-03-01T12:00:00'));
      await page.goto(`${PAGE_URL}?team=kasrkin`);
      const legal = page.getByTestId('kt-detail-legal');
      await expect(legal).toContainText('November 30, 2027');
      await expect(legal).toHaveAttribute('data-legality', 'classified');

      await page.goto('/hu/kill-team/choose-a-team/?team=kasrkin');
      await expect(page.getByTestId('kt-detail-legal')).toContainText('2027. november 30.');
    });

    test('is still classified on 30 November a year before', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-11-30T12:00:00'));
      await page.goto(`${PAGE_URL}?team=kasrkin`);
      await expect(page.getByTestId('kt-detail-legal')).toHaveAttribute('data-legality', 'classified');
    });

    test('rotates out soon less than a year before the legal until date', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-12-01T12:00:00'));
      await page.goto(`${PAGE_URL}?team=kasrkin`);
      await expect(page.getByTestId('kt-detail-legal')).toHaveAttribute('data-legality', 'rotates_soon');
    });

    test('is non-classified after the legal until date', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2027-12-01T12:00:00'));
      await page.goto(`${PAGE_URL}?team=kasrkin`);
      const legal = page.getByTestId('kt-detail-legal');
      await expect(legal).toHaveAttribute('data-legality', 'declassified');
      await expect(legal).toContainText('Not tournament legal');
    });

    test('classified checkbox hides non-classified teams', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2027-12-01T12:00:00'));
      await page.goto(PAGE_URL);
      await expect(page.getByTestId('kt-question-legal')).toContainText('Legal on all tournaments');
      await expect(page.getByTestId('kt-card-kasrkin')).toBeVisible();

      const checkbox = page.getByTestId('kt-answer-legal-classified');
      await checkbox.check();
      await expect(page).toHaveURL(/legal=classified/);
      await expect(page.getByTestId('kt-card-kasrkin')).toHaveCount(0);
      await expect(page.getByTestId('kt-card-angels-of-death')).toBeVisible();

      await checkbox.uncheck();
      await expect(page).not.toHaveURL(/legal=/);
      await expect(page.getByTestId('kt-card-kasrkin')).toBeVisible();
    });
  });

  test('Hungarian page uses Hungarian labels', async ({ page }) => {
    await page.goto('/hu/kill-team/choose-a-team/');
    await expect(page.getByTestId('kt-beginner-tag').first()).toHaveText('Kezdőbarát');
    await expect(page.getByTestId('kt-question-exp')).toContainText('Játszottál már Kill Teamet?');
  });
});
