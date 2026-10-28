import { test, expect } from '@playwright/test';
import { FACTION_TREE, subFactionsOf } from '@/components/content-blocks/kill-team-chooser/filters';
import { formatLegalUntil, getLegality } from '@/components/content-blocks/kill-team-chooser/legality';
import type { KillTeamStyle } from '@/types/content';
import {
  TestKillTeam,
  chooserFactionLabel,
  chooserFactionLabels,
  chooserLabels,
  chooserStyleLabels,
  chooserStyleText,
  fillTemplate,
  findKillTeam,
  killTeam,
  killTeams,
} from './helpers/content';

const PAGE_URL = '/en/kill-team/choose-a-team/';
const HU_PAGE_URL = '/hu/kill-team/choose-a-team/';
const EN = chooserLabels('en');
const HU = chooserLabels('hu');

// Teams that the chooser shows without the declassified answer today
const isLegal = (team: TestKillTeam, now = new Date()) => getLegality(team.legal_until, now) !== 'declassified';
const largestSize = (team: TestKillTeam) => team.operatives ?? team.operatives_max ?? 0;
const smallestSize = (team: TestKillTeam) => team.operatives ?? team.operatives_min ?? 0;

const proTeam = findKillTeam('legal pro-only', (t) => isLegal(t) && t.skill === 'pro-only');
const nonProTeam = findKillTeam('legal not pro-only', (t) => isLegal(t) && t.skill !== 'pro-only');
const beginnerTeam = findKillTeam('legal beginner-friendly', (t) => isLegal(t) && t.skill === 'beginner-friendly');
const legalTeam = findKillTeam('legal with factions and styles', (t) => isLegal(t) && t.factions.length > 0 && t.style.length > 1);
const wh40kTeam = findKillTeam('sold in WH40k boxes', (t) => t.box_type === 'wh40k');
const killTeamBoxTeam = findKillTeam('legal sold in a Kill Team box', (t) => isLegal(t) && t.box_type === 'kill-team');
const rangeTeam = findKillTeam('legal with operatives range', (t) =>
  isLegal(t) && t.operatives === undefined && t.operatives_min !== undefined && t.operatives_max !== undefined && t.operatives_min !== t.operatives_max);
const fixedSizeTeam = findKillTeam('legal with fixed operatives', (t) => isLegal(t) && t.operatives !== undefined);
const oneBoxTeam = findKillTeam('legal needing one box', (t) => isLegal(t) && t.boxes <= 1);
const multiBoxTeam = findKillTeam('legal needing more boxes', (t) => isLegal(t) && t.boxes > 1);
const hordeTeam = findKillTeam('legal horde', (t) => isLegal(t) && largestSize(t) >= 11);
const smallTeam = findKillTeam('legal not horde', (t) => isLegal(t) && largestSize(t) < 11 && smallestSize(t) > 0);

// Faction teams
const has = (team: TestKillTeam, ...factions: string[]) => factions.every((f) => team.factions.includes(f));
const hasNone = (team: TestKillTeam, ...factions: string[]) => factions.every((f) => !team.factions.includes(f));
const imperiumTeam = findKillTeam('legal imperium, not xenos', (t) => isLegal(t) && has(t, 'imperium') && hasNone(t, 'xenos'));
const xenosTeam = findKillTeam('legal xenos', (t) => isLegal(t) && has(t, 'xenos'));
const chaosOnlyTeam = findKillTeam('legal chaos, not imperium or xenos', (t) => isLegal(t) && has(t, 'chaos') && hasNone(t, 'imperium', 'xenos'));

const xenosSub = FACTION_TREE.xenos.find((sub) => killTeams().some((t) => isLegal(t) && has(t, 'xenos', sub)))!;
const xenosSubTeam = findKillTeam(`legal xenos ${xenosSub}`, (t) => isLegal(t) && has(t, 'xenos', xenosSub));
const otherXenosTeam = findKillTeam(`legal xenos without ${xenosSub}`, (t) => isLegal(t) && has(t, 'xenos') && hasNone(t, xenosSub));
const imperiumSub = FACTION_TREE.imperium.find((sub) =>
  !FACTION_TREE.xenos.includes(sub) && killTeams().some((t) => isLegal(t) && has(t, 'imperium', sub) && hasNone(t, 'xenos', xenosSub)))!;
const imperiumSubTeam = findKillTeam(`legal imperium ${imperiumSub}`, (t) => isLegal(t) && has(t, 'imperium', imperiumSub) && hasNone(t, 'xenos', xenosSub));

// Sub faction of both chaos and imperium, with a team of each main faction only
const sharedSub = FACTION_TREE.chaos.find((sub) =>
  FACTION_TREE.imperium.includes(sub) &&
  killTeams().some((t) => isLegal(t) && has(t, 'chaos', sub) && hasNone(t, 'imperium')) &&
  killTeams().some((t) => isLegal(t) && has(t, 'imperium', sub) && hasNone(t, 'chaos')))!;
const sharedSubChaosTeam = findKillTeam(`legal chaos ${sharedSub}`, (t) => isLegal(t) && has(t, 'chaos', sharedSub) && hasNone(t, 'imperium'));
const sharedSubImperiumTeam = findKillTeam(`legal imperium ${sharedSub}`, (t) => isLegal(t) && has(t, 'imperium', sharedSub) && hasNone(t, 'chaos'));

// Chaos sub faction with a chaos team that does not have it
const chaosSub = FACTION_TREE.chaos.find((sub) =>
  killTeams().some((t) => isLegal(t) && has(t, 'chaos', sub)) && killTeams().some((t) => isLegal(t) && has(t, 'chaos') && hasNone(t, sub)))!;
const chaosSubTeam = findKillTeam(`legal chaos ${chaosSub}`, (t) => isLegal(t) && has(t, 'chaos', chaosSub));
const otherChaosTeam = findKillTeam(`legal chaos without ${chaosSub}`, (t) => isLegal(t) && has(t, 'chaos') && hasNone(t, chaosSub));

// Two styles that a legal team has together, in the CMS label order
const styleTeam = legalTeam;
const [firstStyle, secondStyle] = EN.styles.map((s) => s.value).filter((value) => styleTeam.style.includes(value)) as KillTeamStyle[];

// Two styles that no team has together
const ALL_STYLES = EN.styles.map((s) => s.value);
const noMatchStyles = ALL_STYLES.flatMap((a) => ALL_STYLES.map((b) => [a, b])).find(
  ([a, b]) => a !== b && !killTeams().some((t) => t.style.includes(a) && t.style.includes(b)))!;

test.describe('Kill Team chooser', () => {
  // Team photos come from the warhammer.com shop; slow responses from it make page loads time out
  test.beforeEach(async ({ page }) => {
    await page.route(/^https:\/\/www\.warhammer\.com\//, (route) => route.abort());
  });

  test('shows all teams as cards without power tier', async ({ page }) => {
    // Shows the non-classified teams too
    await page.goto(`${PAGE_URL}?legal=declassified`);

    const chooser = page.getByTestId('kt-chooser');
    await expect(chooser).toBeVisible();

    const cards = page.locator('[data-testid^="kt-card-"]').filter({ has: page.getByTestId('kt-card-name') });
    await expect(cards).toHaveCount(killTeams().length);
    const total = await cards.count();
    await expect(page.getByTestId('kt-result-count')).toHaveText(fillTemplate(EN.result_count, { shown: total, total }));

    // Power tier is only visible in the detail view
    await expect(page.getByTestId('kt-detail-tier')).toHaveCount(0);
    await expect(page.getByTestId('kt-beginner-tag').first()).toHaveText(EN.beginner_tag);
    await expect(page.getByTestId(`kt-card-${proTeam.slug}`).getByTestId('kt-pro-tag')).toHaveText(EN.pro_tag);
    await expect(page.getByTestId(`kt-card-${nonProTeam.slug}`).getByTestId('kt-pro-tag')).toHaveCount(0);
  });

  test('cards show the main faction as an icon and the sub factions as text', async ({ page }) => {
    // Shows the non-classified teams too
    await page.goto(`${PAGE_URL}?legal=declassified`);

    for (const team of killTeams()) {
      const card = page.getByTestId(`kt-card-${team.slug}`);
      const mains = team.factions.filter((f) => f in FACTION_TREE);
      const subs = team.factions.filter((f) => !(f in FACTION_TREE));

      const icons = card.getByTestId('kt-card-faction-icon');
      await expect(icons).toHaveCount(mains.length);
      for (let i = 0; i < mains.length; i++) {
        await expect(icons.nth(i)).toHaveAttribute('data-faction', mains[i]);
        await expect(icons.nth(i)).toContainText(chooserFactionLabel('en', mains[i]));
      }
      await expect(card.getByTestId('kt-card-factions')).toHaveText(chooserFactionLabels('en', subs).join(', '));
    }
  });

  test('answers filter the teams and update the URL', async ({ page }) => {
    // Shows the non-classified teams too
    await page.goto(`${PAGE_URL}?legal=declassified`);

    const cards = page.locator('[data-testid^="kt-card-"]').filter({ has: page.getByTestId('kt-card-name') });
    // Wait until the URL answers are applied, so all teams are visible
    await expect(cards).toHaveCount(killTeams().length);
    const total = await cards.count();

    const answer = page.getByTestId('kt-answer-exp-new');
    await answer.click();
    await expect(answer).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/exp=new/);

    const filtered = await cards.count();
    expect(filtered).toBe(killTeams().filter((t) => t.skill === 'beginner-friendly').length);
    await expect(page.getByTestId('kt-result-count')).toHaveText(fillTemplate(EN.result_count, { shown: filtered, total }));

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
    await expect(page.getByTestId(`kt-card-${nonProTeam.slug}`)).toBeVisible();
    await expect(page.getByTestId('kt-pro-tag')).toHaveCount(0);

    await page.getByTestId('kt-answer-exp-pro').click();
    await expect(page).toHaveURL(/exp=pro/);
    await expect(page.getByTestId(`kt-card-${proTeam.slug}`)).toBeVisible();
    const filtered = await cards.count();
    expect(filtered).toBeGreaterThan(0);
    for (let i = 0; i < filtered; i++) {
      await expect(cards.nth(i).getByTestId('kt-pro-tag')).toBeVisible();
    }
  });

  test('shows empty state and reset clears answers', async ({ page }) => {
    await page.goto(`${PAGE_URL}?style=${noMatchStyles[0]}&style=${noMatchStyles[1]}`);

    await expect(page.getByTestId('kt-empty')).toHaveText(EN.empty_state);
    await page.getByTestId('kt-reset').click();
    await expect(page.getByTestId('kt-empty')).toHaveCount(0);
    await expect(page.getByTestId('kt-reset')).toHaveCount(0);
  });

  test('card opens team details and closes', async ({ page }) => {
    await page.goto(PAGE_URL);

    await page.getByTestId(`kt-card-${legalTeam.slug}`).click();
    const detail = page.getByTestId('kt-detail');
    await expect(detail).toBeVisible();
    await expect(detail.getByTestId('kt-detail-name')).toHaveText(legalTeam.name);
    await expect(detail.getByTestId('kt-detail-legal')).toBeVisible();
    await expect(detail.getByTestId('kt-detail-factions').locator('li')).toHaveText(chooserFactionLabels('en', legalTeam.factions));
    await expect(page).toHaveURL(new RegExp(`team=${legalTeam.slug}`));

    await page.getByTestId('kt-detail-close').click();
    await expect(detail).toHaveCount(0);
    await expect(page).not.toHaveURL(/team=/);
  });

  test('team sold in WH40k boxes shows a badge on the card and a note in the details', async ({ page }) => {
    // Shows the non-classified teams too
    await page.goto(`${PAGE_URL}?legal=declassified`);

    const card = page.getByTestId(`kt-card-${wh40kTeam.slug}`);
    await expect(card.getByTestId('kt-box-type-badge')).toHaveText(EN.wh40k_badge);
    await expect(page.getByTestId(`kt-card-${killTeamBoxTeam.slug}`).getByTestId('kt-box-type-badge')).toHaveCount(0);

    await card.click();
    const boxType = page.getByTestId('kt-detail').getByTestId('kt-detail-box-type');
    await expect(boxType).toHaveAttribute('data-box-type', 'wh40k');
    await expect(boxType).toContainText(EN.wh40k_note);
  });

  test('details list the store boxes with links that open in a new tab', async ({ page }) => {
    const team = killTeams().find((t) => t.store_boxes?.some((box) => box.url));
    test.skip(!team, 'No reviewed kill team with Warhammer Store boxes');

    await page.goto(`${PAGE_URL}?legal=declassified&team=${team!.slug}`);
    const links = page.getByTestId('kt-detail').getByTestId('kt-detail-store-boxes').getByTestId('kt-detail-store-link-warhammer');
    const storeBoxes = team!.store_boxes!.filter((box) => box.url);
    await expect(links).toHaveText(storeBoxes.map((box) => box.name));
    for (const [i, box] of storeBoxes.entries()) {
      await expect(links.nth(i)).toHaveAttribute('href', box.url!);
      await expect(links.nth(i)).toHaveAttribute('target', '_blank');
    }
  });

  for (const store of [
    { id: 'contrastphase', field: 'contrastphase_url' },
    { id: 'epicarium', field: 'epicarium_url' },
    { id: 'warhammer', field: 'url' },
  ] as const) {
    test(`store boxes have a ${store.id} icon link only when the box has a ${store.field}`, async ({ page }) => {
      const team = killTeams().find((t) => t.store_boxes?.some((box) => box[store.field]));
      test.skip(!team, `No reviewed kill team with ${store.field}`);

      await page.goto(`${PAGE_URL}?legal=declassified&team=${team!.slug}`);
      const items = page.getByTestId('kt-detail').getByTestId('kt-detail-store-boxes').getByRole('listitem');
      await expect(items).toHaveCount(team!.store_boxes!.length);
      for (const [i, box] of team!.store_boxes!.entries()) {
        const link = items.nth(i).getByTestId(`kt-detail-store-icon-${store.id}`);
        if (box[store.field]) {
          await expect(link).toHaveAttribute('href', box[store.field]!);
          await expect(link).toHaveAttribute('target', '_blank');
          await expect(link.getByRole('img')).toBeVisible();
        } else {
          await expect(link).toHaveCount(0);
        }
      }
    });
  }

  test('card tooltip shows the store box names, or the boxes note without store boxes', async ({ page }) => {
    const storeTeam = findKillTeam('legal with store boxes', (t) => isLegal(t) && !!t.store_boxes?.length);
    await page.goto(PAGE_URL);
    const storeBoxes = page.getByTestId(`kt-card-${storeTeam.slug}`).getByTestId('kt-card-boxes');
    await storeBoxes.hover();
    await expect(storeBoxes.getByTestId('kt-card-boxes-info')).toHaveText(storeTeam.store_boxes!.map((box) => box.name).join(', '));

    const noteTeam = findKillTeam('legal with boxes note and without store boxes', (t) => isLegal(t) && !!t.boxes_note && !t.store_boxes?.length);
    const noteBoxes = page.getByTestId(`kt-card-${noteTeam.slug}`).getByTestId('kt-card-boxes');
    await noteBoxes.hover();
    await expect(noteBoxes.getByTestId('kt-card-boxes-info')).toHaveText(noteTeam.boxes_note!);
  });

  test('team without store boxes has no store box list in the details', async ({ page }) => {
    const team = findKillTeam('legal without store boxes', (t) => isLegal(t) && !t.store_boxes?.length);
    await page.goto(`${PAGE_URL}?team=${team.slug}`);

    await expect(page.getByTestId('kt-detail')).toBeVisible();
    await expect(page.getByTestId('kt-detail-store-boxes')).toHaveCount(0);
  });

  test('team sold in a Kill Team box has no box type note in the details', async ({ page }) => {
    await page.goto(`${PAGE_URL}?team=${killTeamBoxTeam.slug}`);

    await expect(page.getByTestId('kt-detail')).toBeVisible();
    await expect(page.getByTestId('kt-detail-box-type')).toHaveCount(0);
  });

  test('selected team opens from the URL and Escape closes it', async ({ page }) => {
    await page.goto(`${PAGE_URL}?team=${legalTeam.slug}`);

    const detail = page.getByTestId('kt-detail');
    await expect(detail.getByTestId('kt-detail-name')).toHaveText(legalTeam.name);

    await page.keyboard.press('Escape');
    await expect(detail).toHaveCount(0);
  });

  test('mobile shows details as a bottom sheet', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(PAGE_URL);

    await page.getByTestId(`kt-card-${legalTeam.slug}`).click();
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

    test('answers in the sheet filter the teams and show the result count', async ({ page }) => {
      await page.goto(PAGE_URL);
      const cards = page.locator('[data-testid^="kt-card-"]').filter({ has: page.getByTestId('kt-card-name') });
      const total = await cards.count();

      await page.getByTestId('kt-filters-open').click();
      const sheet = page.getByTestId('kt-filter-sheet');
      await expect(sheet).toBeVisible();
      await expect(sheet).toHaveAttribute('role', 'dialog');
      await expect(page.getByTestId('kt-filters-show')).toHaveText(fillTemplate(EN.show_results, { shown: total }));

      await page.getByTestId('kt-answer-exp-new').click();
      await page.getByTestId('kt-answer-faction-imperium').click();
      const filtered = await cards.count();
      expect(filtered).toBeLessThan(total);
      await expect(page.getByTestId('kt-filters-show')).toHaveText(fillTemplate(EN.show_results, { shown: filtered }));

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
      await page.goto(HU_PAGE_URL);
      const cards = page.locator('[data-testid^="kt-card-"]').filter({ has: page.getByTestId('kt-card-name') });
      await expect(page.getByTestId('kt-filters-open')).toHaveText(HU.filters_button);
      const total = await cards.count();
      await page.getByTestId('kt-filters-open').click();
      await expect(page.getByTestId('kt-filters-show')).toHaveText(fillTemplate(HU.show_results, { shown: total }));
    });
  });

  test('desktop shows the questions in place without the filters button', async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page.getByTestId('kt-filters-open')).toBeHidden();
    await expect(page.getByTestId('kt-questions')).toBeVisible();
    await expect(page.getByTestId('kt-filter-sheet')).not.toHaveAttribute('role', 'dialog');
  });

  test('team with operatives range shows min–max', async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page.getByTestId(`kt-card-${rangeTeam.slug}`)).toContainText(`${rangeTeam.operatives_min}–${rangeTeam.operatives_max}`);
    await expect(page.getByTestId(`kt-card-${fixedSizeTeam.slug}`)).toContainText(String(fixedSizeTeam.operatives));
  });

  test('filters are in two columns in the requested order', async ({ page }) => {
    await page.goto(PAGE_URL);
    const order = (column: number) =>
      page.getByTestId(`kt-question-column-${column}`).locator('> fieldset').evaluateAll((elements) => elements.map((e) => e.getAttribute('data-testid')));
    expect(await order(1)).toEqual(['kt-question-exp', 'kt-question-faction', 'kt-question-size']);
    expect(await order(2)).toEqual(['kt-question-style', 'kt-question-boxes', 'kt-question-legal']);
  });

  test('faction question shows main factions and sub factions of the selected ones in one place', async ({ page }) => {
    await page.goto(PAGE_URL);
    for (const main of Object.keys(FACTION_TREE)) {
      await expect(page.getByTestId(`kt-answer-faction-${main}`)).toHaveText(chooserFactionLabel('en', main));
    }
    await expect(page.getByTestId(`kt-answer-faction-${FACTION_TREE.xenos[0]}`)).toHaveCount(0);
    await expect(page.getByTestId('kt-subfactions')).toHaveCount(0);

    const subs = page.getByTestId('kt-subfactions').locator('[data-testid^="kt-answer-sub-"]');
    await page.getByTestId('kt-answer-faction-chaos').click();
    await expect(subs).toHaveCount(FACTION_TREE.chaos.length);

    // Shared sub factions show only once
    await page.getByTestId('kt-answer-faction-imperium').click();
    await expect(subs).toHaveCount(subFactionsOf(['chaos', 'imperium']).length);
    await expect(page.getByTestId(`kt-answer-sub-${sharedSub}`)).toHaveCount(1);
  });

  test('multiple main factions show teams of any selected faction', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.getByTestId('kt-answer-faction-imperium').click();
    await page.getByTestId('kt-answer-faction-xenos').click();
    await expect(page).toHaveURL(/faction=imperium&faction=xenos/);

    await expect(page.getByTestId(`kt-card-${imperiumTeam.slug}`)).toBeVisible();
    await expect(page.getByTestId(`kt-card-${xenosTeam.slug}`)).toBeVisible();
    await expect(page.getByTestId(`kt-card-${chaosOnlyTeam.slug}`)).toHaveCount(0);
  });

  test('selected sub factions list only their teams', async ({ page }) => {
    await page.goto(`${PAGE_URL}?faction=imperium&faction=xenos`);
    await page.getByTestId(`kt-answer-sub-${xenosSub}`).click();
    await expect(page).toHaveURL(new RegExp(`sub=${xenosSub}`));

    await expect(page.getByTestId(`kt-card-${xenosSubTeam.slug}`)).toBeVisible();
    await expect(page.getByTestId(`kt-card-${otherXenosTeam.slug}`)).toHaveCount(0);
    await expect(page.getByTestId(`kt-card-${imperiumSubTeam.slug}`)).toHaveCount(0);

    // Second sub faction adds its teams
    await page.getByTestId(`kt-answer-sub-${imperiumSub}`).click();
    await expect(page.getByTestId(`kt-card-${imperiumSubTeam.slug}`)).toBeVisible();
    await expect(page.getByTestId(`kt-card-${xenosSubTeam.slug}`)).toBeVisible();

    // Deselecting the main faction removes its sub factions
    await page.getByTestId('kt-answer-faction-xenos').click();
    await expect(page.getByTestId(`kt-answer-sub-${xenosSub}`)).toHaveCount(0);
    await expect(page).not.toHaveURL(new RegExp(`xenos|sub=${xenosSub}`));
    await expect(page.getByTestId(`kt-card-${xenosSubTeam.slug}`)).toHaveCount(0);
    await expect(page.getByTestId(`kt-card-${imperiumSubTeam.slug}`)).toBeVisible();
  });

  test('shared sub faction shows teams only of the selected main factions', async ({ page }) => {
    await page.goto(`${PAGE_URL}?faction=chaos&sub=${sharedSub}`);
    await expect(page.getByTestId(`kt-answer-sub-${sharedSub}`)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId(`kt-card-${sharedSubChaosTeam.slug}`)).toBeVisible();
    await expect(page.getByTestId(`kt-card-${sharedSubImperiumTeam.slug}`)).toHaveCount(0);

    // The sub faction stays selected while a main faction still has it
    await page.getByTestId('kt-answer-faction-imperium').click();
    await expect(page.getByTestId(`kt-card-${sharedSubImperiumTeam.slug}`)).toBeVisible();
    await page.getByTestId('kt-answer-faction-chaos').click();
    await expect(page.getByTestId(`kt-answer-sub-${sharedSub}`)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId(`kt-card-${sharedSubChaosTeam.slug}`)).toHaveCount(0);
    await expect(page.getByTestId(`kt-card-${sharedSubImperiumTeam.slug}`)).toBeVisible();
  });

  test('chaos sub faction shows only its teams', async ({ page }) => {
    await page.goto(`${PAGE_URL}?faction=chaos&sub=${chaosSub}`);
    await expect(page.getByTestId(`kt-card-${chaosSubTeam.slug}`)).toBeVisible();
    await expect(page.getByTestId(`kt-card-${otherChaosTeam.slug}`)).toHaveCount(0);
  });

  test('sub faction in the URL without its main faction is ignored', async ({ page }) => {
    await page.goto(`${PAGE_URL}?faction=imperium&sub=${xenosSub}`);
    await expect(page.getByTestId(`kt-card-${imperiumTeam.slug}`)).toBeVisible();
    await expect(page.getByTestId(`kt-card-${xenosSubTeam.slug}`)).toHaveCount(0);
    await expect(page).not.toHaveURL(/sub=/);
  });

  test('Hungarian page shows Hungarian sub faction labels', async ({ page }) => {
    await page.goto(`${HU_PAGE_URL}?faction=imperium`);
    for (const sub of FACTION_TREE.imperium) {
      await expect(page.getByTestId(`kt-answer-sub-${sub}`)).toHaveText(chooserFactionLabel('hu', sub));
    }
  });

  test('only one box checkbox hides teams that need more boxes', async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page.getByTestId('kt-question-boxes')).toContainText(EN.q_boxes);

    const cards = page.locator('[data-testid^="kt-card-"]').filter({ has: page.getByTestId('kt-card-name') });
    const total = await cards.count();
    const checkbox = page.getByTestId('kt-answer-boxes-one');
    await checkbox.check();
    await expect(page).toHaveURL(/boxes=one/);
    await expect(page.getByTestId(`kt-card-${multiBoxTeam.slug}`)).toHaveCount(0);
    await expect(page.getByTestId(`kt-card-${oneBoxTeam.slug}`)).toBeVisible();

    await checkbox.uncheck();
    await expect(page).not.toHaveURL(/boxes=/);
    await expect(cards).toHaveCount(total);
  });

  test('horde answer shows only teams with 11 or more operatives', async ({ page }) => {
    await page.goto(`${PAGE_URL}?size=horde`);
    await expect(page.getByTestId('kt-answer-size-horde')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId(`kt-card-${hordeTeam.slug}`)).toBeVisible();
    await expect(page.getByTestId(`kt-card-${smallTeam.slug}`)).toHaveCount(0);
  });

  test('non-classified teams are at the end of the list after a separator', async ({ page }) => {
    const now = new Date('2026-03-01T12:00:00');
    const classifiedTeam = findKillTeam('legal on the fixed date', (t) => isLegal(t, now));
    const declassifiedTeam = findKillTeam('not legal on the fixed date', (t) => !isLegal(t, now));
    await page.clock.setFixedTime(now);
    await page.goto(`${PAGE_URL}?legal=declassified`);

    const separator = page.getByTestId('kt-declassified-separator');
    await expect(separator).toContainText(EN.declassified_separator);
    const items = page.getByTestId('kt-grid').locator('> *');
    const testIds = await items.evaluateAll((elements) => elements.map((e) => e.getAttribute('data-testid')));
    const separatorIndex = testIds.indexOf('kt-declassified-separator');
    expect(separatorIndex).toBeGreaterThan(0);
    expect(testIds.indexOf(`kt-card-${classifiedTeam.slug}`)).toBeLessThan(separatorIndex);
    expect(testIds.indexOf(`kt-card-${declassifiedTeam.slug}`)).toBeGreaterThan(separatorIndex);

    // Unchecking the declassified checkbox hides the separator and the non-classified teams
    await page.getByTestId('kt-answer-legal-declassified').uncheck();
    await expect(separator).toHaveCount(0);
    await expect(page.getByTestId(`kt-card-${declassifiedTeam.slug}`)).toHaveCount(0);
  });

  test('selected play styles show only teams that have all of them', async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(page.getByTestId('kt-question-style')).toContainText(EN.q_style);

    const cards = page.locator('[data-testid^="kt-card-"]').filter({ has: page.getByTestId('kt-card-name') });
    const total = await cards.count();

    await page.getByTestId(`kt-answer-style-${firstStyle}`).click();
    const firstCount = await cards.count();
    expect(firstCount).toBeLessThanOrEqual(total);

    await page.getByTestId(`kt-answer-style-${secondStyle}`).click();
    await expect(page).toHaveURL(new RegExp(`style=${firstStyle}&style=${secondStyle}`));
    await expect(page.getByTestId(`kt-answer-style-${secondStyle}`)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('kt-style-descriptions').locator('li')).toHaveText([
      chooserStyleText('en', firstStyle),
      chooserStyleText('en', secondStyle),
    ]);
    const bothCount = await cards.count();
    expect(bothCount).toBeGreaterThan(0);
    expect(bothCount).toBeLessThanOrEqual(firstCount);
    for (let i = 0; i < bothCount; i++) {
      await expect(cards.nth(i).getByTestId('kt-style-icons').locator(`[data-style="${firstStyle}"]`)).toHaveCount(1);
      await expect(cards.nth(i).getByTestId('kt-style-icons').locator(`[data-style="${secondStyle}"]`)).toHaveCount(1);
    }

    // Deselecting a style shows the teams of the other style again
    await page.getByTestId(`kt-answer-style-${secondStyle}`).click();
    await expect(cards).toHaveCount(firstCount);
  });

  test('Hungarian page shows style icons from the shared data', async ({ page }) => {
    await page.goto(HU_PAGE_URL);
    const icons = page.getByTestId(`kt-card-${styleTeam.slug}`).getByTestId('kt-style-icons');
    await expect(icons.locator('svg')).toHaveCount(styleTeam.style.length);
    await expect(icons).toHaveAttribute('aria-label', chooserStyleLabels('hu', styleTeam.style).join(', '));
    const tooltip = icons.locator(`[data-style="${firstStyle}"]`).getByTestId('kt-style-tooltip');
    await expect(tooltip).toBeHidden();
    await icons.locator(`[data-style="${firstStyle}"]`).hover();
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText(chooserStyleText('hu', firstStyle));
    await expect(tooltip.locator('.font-semibold')).toHaveText(`${chooserStyleLabels('hu', [firstStyle])[0]}:`);
  });

  test('style pills in the details show the description on tap and hover', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${PAGE_URL}?team=${styleTeam.slug}`);
    const styles = page.getByTestId('kt-detail').getByTestId('kt-detail-styles');
    await expect(styles.getByRole('button')).toHaveText(chooserStyleLabels('en', styleTeam.style));
    const description = styles.getByTestId('kt-style-description');
    await expect(description).toBeHidden();

    const first = styles.getByTestId(`kt-style-${firstStyle}`);
    await first.click();
    await expect(first).toHaveAttribute('aria-pressed', 'true');
    await expect(description).toHaveText(chooserStyleText('en', firstStyle));

    // Hover previews another style, leaving restores the selected one
    await styles.getByTestId(`kt-style-${secondStyle}`).hover();
    await expect(description).toHaveText(chooserStyleText('en', secondStyle));
    await page.getByTestId('kt-detail-name').hover();
    await expect(description).toHaveText(chooserStyleText('en', firstStyle));

    await first.click();
    await expect(first).toHaveAttribute('aria-pressed', 'false');
    await page.getByTestId('kt-detail-name').hover();
    await expect(description).toBeHidden();
  });

  test('language switch keeps the answers and the selected team', async ({ page }) => {
    const style = nonProTeam.style[0];
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${PAGE_URL}?exp=played&team=${proTeam.slug}`);
    await expect(page.getByTestId('kt-detail')).toBeVisible();
    await page.getByTestId('kt-detail-close').click();
    await page.getByTestId(`kt-answer-style-${style}`).click();
    await page.getByTestId(`kt-card-${nonProTeam.slug}`).click();
    await expect(page.getByTestId('kt-detail-name')).toHaveText(nonProTeam.name);

    await page.getByTestId('desktop-language-switch').getByRole('button', { name: 'HU' }).click();
    await expect(page).toHaveURL(/\/hu\/kill-team\/choose-a-team\/\?/);
    await expect(page).toHaveURL(/exp=played/);
    await expect(page).toHaveURL(new RegExp(`style=${style}`));
    await expect(page).toHaveURL(new RegExp(`team=${nonProTeam.slug}`));
    await expect(page.getByTestId('kt-answer-exp-played')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId(`kt-answer-style-${style}`)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('kt-detail-name')).toHaveText(killTeam(nonProTeam.slug, 'hu').name);
  });

  test('Hungarian page shows skill tags from the shared data', async ({ page }) => {
    await page.goto(HU_PAGE_URL);
    await expect(page.getByTestId(`kt-card-${proTeam.slug}`).getByTestId('kt-pro-tag')).toHaveText(HU.pro_tag);
    await expect(page.getByTestId(`kt-card-${beginnerTeam.slug}`).getByTestId('kt-beginner-tag')).toHaveText(HU.beginner_tag);
  });

  test.describe('tournament legality', () => {
    // Teams are tournament legal until 30 November of their legal until year
    const legalUntil = Math.min(...killTeams().flatMap((t) => (t.legal_until === undefined ? [] : [t.legal_until])));
    const team = findKillTeam(`legal until ${legalUntil}`, (t) => t.legal_until === legalUntil);
    const laterTeam = findKillTeam(`legal after ${legalUntil}`, (t) => (t.legal_until ?? 0) > legalUntil);
    const teamUrl = `${PAGE_URL}?team=${team.slug}`;

    test('shows the legal until date in English and Hungarian', async ({ page }) => {
      await page.clock.setFixedTime(new Date(`${legalUntil - 1}-03-01T12:00:00`));
      await page.goto(teamUrl);
      const legal = page.getByTestId('kt-detail-legal');
      await expect(legal).toContainText(formatLegalUntil(EN.legal_until_label, legalUntil, 'en'));
      await expect(legal).toHaveAttribute('data-legality', 'classified');

      await page.goto(`${HU_PAGE_URL}?team=${team.slug}`);
      await expect(page.getByTestId('kt-detail-legal')).toContainText(formatLegalUntil(HU.legal_until_label, legalUntil, 'hu'));
    });

    test('is still classified on 30 November a year before', async ({ page }) => {
      await page.clock.setFixedTime(new Date(`${legalUntil - 1}-11-30T12:00:00`));
      await page.goto(teamUrl);
      await expect(page.getByTestId('kt-detail-legal')).toHaveAttribute('data-legality', 'classified');
    });

    test('rotates out soon less than a year before the legal until date', async ({ page }) => {
      await page.clock.setFixedTime(new Date(`${legalUntil - 1}-12-01T12:00:00`));
      await page.goto(teamUrl);
      const legal = page.getByTestId('kt-detail-legal');
      await expect(legal).toHaveAttribute('data-legality', 'rotates_soon');
      await expect(legal).toContainText(EN.rotates_soon_label);
    });

    test('is non-classified after the legal until date', async ({ page }) => {
      await page.clock.setFixedTime(new Date(`${legalUntil}-12-01T12:00:00`));
      await page.goto(teamUrl);
      const legal = page.getByTestId('kt-detail-legal');
      await expect(legal).toHaveAttribute('data-legality', 'declassified');
      await expect(legal).toContainText(EN.not_legal_label);
    });

    test('non-classified teams are hidden until the declassified checkbox is checked', async ({ page }) => {
      await page.clock.setFixedTime(new Date(`${legalUntil}-12-01T12:00:00`));
      await page.goto(PAGE_URL);
      await expect(page.getByTestId('kt-question-legal')).toContainText(EN.q_legal);
      const checkbox = page.getByTestId('kt-answer-legal-declassified');
      await expect(checkbox).not.toBeChecked();
      await expect(page.getByTestId(`kt-card-${team.slug}`)).toHaveCount(0);
      await expect(page.getByTestId(`kt-card-${laterTeam.slug}`)).toBeVisible();
      await expect(page.getByTestId('kt-declassified-separator')).toHaveCount(0);

      await checkbox.check();
      await expect(page).toHaveURL(/legal=declassified/);
      await expect(page.getByTestId(`kt-card-${team.slug}`)).toBeVisible();
      await expect(page.getByTestId('kt-declassified-separator')).toBeVisible();

      await checkbox.uncheck();
      await expect(page).not.toHaveURL(/legal=/);
      await expect(page.getByTestId(`kt-card-${team.slug}`)).toHaveCount(0);
    });
  });

  test('Hungarian page uses Hungarian labels', async ({ page }) => {
    await page.goto(HU_PAGE_URL);
    await expect(page.getByTestId('kt-beginner-tag').first()).toHaveText(HU.beginner_tag);
    await expect(page.getByTestId('kt-question-exp')).toContainText(HU.q_experience);
  });
});
