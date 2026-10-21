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
    await page.goto(`${PAGE_URL}?exp=new&boxes=one&fight=melee&size=many`);

    await expect(page.getByTestId('kt-empty')).toBeVisible();
    await page.getByTestId('kt-reset').click();
    await expect(page.getByTestId('kt-empty')).toHaveCount(0);
    await expect(page.getByTestId('kt-reset')).toHaveCount(0);
  });

  test('card opens team details with tier and closes', async ({ page }) => {
    await page.goto(PAGE_URL);

    await page.getByTestId('kt-card-blades-of-khaine').click();
    const detail = page.getByTestId('kt-detail');
    await expect(detail).toBeVisible();
    await expect(detail.getByTestId('kt-detail-name')).toHaveText('Blades of Khaine');
    await expect(detail.getByTestId('kt-detail-tier')).toHaveText('S');
    await expect(detail.getByTestId('kt-detail-legal')).toContainText('October 2028');
    await expect(page).toHaveURL(/team=blades-of-khaine/);

    await page.getByTestId('kt-detail-close').click();
    await expect(detail).toHaveCount(0);
    await expect(page).not.toHaveURL(/team=/);
  });

  test('selected team opens from the URL and Escape closes it', async ({ page }) => {
    await page.goto(`${PAGE_URL}?team=legionaries`);

    const detail = page.getByTestId('kt-detail');
    await expect(detail.getByTestId('kt-detail-name')).toHaveText('Legionaries');
    await expect(detail.getByTestId('kt-detail-legal')).toContainText('rotates out');

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

  test('Hungarian page uses Hungarian labels', async ({ page }) => {
    await page.goto('/hu/kill-team/choose-a-team/');
    await expect(page.getByTestId('kt-beginner-tag').first()).toHaveText('Kezdőbarát');
    await expect(page.getByTestId('kt-question-exp')).toContainText('Játszottál már Kill Teamet?');
  });
});
