import { test, expect, Page } from '@playwright/test';
import { ANALYTICS_PROVIDERS, SIMPLE_ANALYTICS_SCRIPT_URL, UMAMI_BEFORE_SEND, UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID } from '@/lib/analytics/config';
import { removeLocalePrefix } from '@/lib/locale-utils';
import { LINK_TYPES } from '@/lib/analytics/events';
import { NAME_LINK_STORE, STORES, storeLinkUrl } from '@/lib/storeBoxes';
import { getLegality } from '@/components/content-blocks/kill-team-chooser/legality';
import { findKillTeam, galleryImageCount, killTeams, subpageData, subpageExternalLinks, subpageStoreBoxes } from './helpers/content';

interface TrackedEvent {
  name: string;
  data: Record<string, unknown>;
}

const CHOOSER_URL = '/en/kill-team/choose-a-team/';
const CHOOSER_PAGE = removeLocalePrefix(CHOOSER_URL);

const resourcesSlug = subpageData('kill-team-resources', 'en').slug as string;
const resourcesLink = subpageExternalLinks('kill-team-resources', 'en')[0];

const galleryBlocks = subpageData('kill-team-what-is-kill-team', 'hu').content_blocks as Array<{ type: string; gallery?: string }>;
const gallerySlug = galleryBlocks.find((block) => block.type === 'gallery_block' && block.gallery && galleryImageCount(block.gallery) > 0)!.gallery!;

// Team that the chooser shows without the declassified answer today
const cardTeam = findKillTeam('legal', (t) => getLegality(t.legal_until, new Date()) !== 'declassified');

// The Umami script is replaced with a stub that records the events, so tests send no real data
async function stubAnalytics(page: Page) {
  await page.route(UMAMI_SCRIPT_URL, (route) => route.fulfill({
    contentType: 'application/javascript',
    // Like the real tracker, the stub sends the page view through the data-before-send function
    body: 'window.__events = []; window.__pageviews = []; window.__identities = []; window.umami = { track: (name, data) => window.__events.push({ name, data }), identify: (data) => window.__identities.push(data) }; var beforeSend = window[document.currentScript.getAttribute("data-before-send")]; window.__pageviews.push(beforeSend ? beforeSend("event", { url: window.location.href, referrer: "" }) : { url: window.location.href });',
  }));
  await page.route(SIMPLE_ANALYTICS_SCRIPT_URL, (route) => route.abort());
}

const trackedEvents = (page: Page) => page.evaluate(() => (window as unknown as { __events?: TrackedEvent[] }).__events ?? []);

async function waitForTracker(page: Page) {
  await expect.poll(() => page.evaluate(() => 'umami' in window)).toBe(true);
}

// Links must not open, but the analytics listener must still see the click
async function blockLinkNavigation(page: Page) {
  await page.evaluate(() => document.addEventListener('click', (e) => e.preventDefault()));
}

test.describe('Analytics', () => {
  test.skip(!ANALYTICS_PROVIDERS.umami, 'Umami is switched off');

  test.beforeEach(async ({ page }) => {
    await stubAnalytics(page);
  });

  test('loads the script of each enabled provider', async ({ page }) => {
    await page.goto('/en/');

    await expect(page.locator(`script[src="${UMAMI_SCRIPT_URL}"]`)).toHaveAttribute('data-website-id', UMAMI_WEBSITE_ID);
    await expect(page.locator(`script[src="${SIMPLE_ANALYTICS_SCRIPT_URL}"]`)).toHaveCount(ANALYTICS_PROVIDERS.simpleAnalytics ? 1 : 0);
  });

  test('Umami gets the URL and the in-site referrer without the locale prefix, and the locale as session data', async ({ page }) => {
    await page.goto(CHOOSER_URL);
    await waitForTracker(page);
    const origin = new URL(page.url()).origin;

    await expect(page.locator(`script[src="${UMAMI_SCRIPT_URL}"]`)).toHaveAttribute('data-before-send', UMAMI_BEFORE_SEND);
    expect(await page.evaluate(() => (window as unknown as { __pageviews: { url: string }[] }).__pageviews)).toEqual([
      { url: `${origin}${CHOOSER_PAGE}`, referrer: '' },
    ]);

    const payloads = await page.evaluate(({ name, chooserUrl }) => {
      const beforeSend = (window as unknown as Record<string, (type: string, payload: { url: string; referrer?: string }) => { url: string; referrer?: string }>)[name];
      return [
        beforeSend('event', { url: chooserUrl }),
        beforeSend('event', { url: `${window.location.origin}/hu/kill-team/?a=1`, referrer: `${window.location.origin}/hu/` }),
        beforeSend('event', { url: '/en', referrer: 'https://example.com/en/page' }),
        beforeSend('event', { url: '/english/' }),
      ];
    }, { name: UMAMI_BEFORE_SEND, chooserUrl: CHOOSER_URL });
    expect(payloads).toEqual([
      { url: CHOOSER_PAGE },
      { url: `${origin}/kill-team/?a=1`, referrer: `${origin}/` },
      { url: '/', referrer: 'https://example.com/en/page' },
      { url: '/english/' },
    ]);

    // One identify for the locale of the page, the next events on the same locale do not send it again
    await expect.poll(() => page.evaluate(() => (window as unknown as { __identities?: unknown[] }).__identities)).toEqual([{ locale: 'en' }]);
  });

  test('outgoing link in CMS content sends an outbound link event', async ({ page }) => {
    await page.goto(`/en/kill-team/${resourcesSlug}/`);
    await waitForTracker(page);
    await blockLinkNavigation(page);

    const url = new URL(resourcesLink).href;
    await page.locator(`a[href="${resourcesLink}"]`).first().click();

    await expect.poll(() => trackedEvents(page)).toContainEqual({
      name: 'outbound_link_click',
      data: { url, page: `/kill-team/${resourcesSlug}/`, locale: 'en' },
    });
  });

  test('internal link sends no outbound link event', async ({ page }) => {
    await page.goto(`/en/kill-team/${resourcesSlug}/`);
    await waitForTracker(page);
    await blockLinkNavigation(page);

    await page.locator('nav a[href^="/"]').first().click();

    expect((await trackedEvents(page)).filter((e) => e.name === 'outbound_link_click')).toHaveLength(0);
  });

  test('opening a gallery image sends a gallery event', async ({ page }) => {
    await page.goto('/hu/kill-team/what-is-kill-team/');
    await waitForTracker(page);

    await page.getByTestId('gallery-thumbnail-1').click();

    await expect.poll(() => trackedEvents(page)).toContainEqual({
      name: 'gallery_open',
      data: { page: '/kill-team/what-is-kill-team/', gallery: gallerySlug, image_index: 1, locale: 'hu' },
    });
  });

  test('Team Chooser filters, reset and team clicks send events', async ({ page }) => {
    await page.goto(CHOOSER_URL);
    await waitForTracker(page);

    await page.getByTestId('kt-answer-exp-new').click();
    await page.getByTestId('kt-answer-exp-new').click();
    await page.getByTestId('kt-answer-style-melee').click();
    await page.getByTestId('kt-reset').click();

    await expect.poll(() => trackedEvents(page)).toEqual([
      { name: 'kt_filter_change', data: { filter: 'exp', value: 'new', selected: true, locale: 'en' } },
      { name: 'kt_filter_change', data: { filter: 'exp', value: 'new', selected: false, locale: 'en' } },
      { name: 'kt_filter_change', data: { filter: 'style', value: 'melee', selected: true, locale: 'en' } },
      { name: 'kt_filter_reset', data: { locale: 'en' } },
    ]);

    // Closing the selected team sends nothing
    await page.getByTestId(`kt-card-${cardTeam.slug}`).click();
    await page.getByTestId(`kt-card-${cardTeam.slug}`).click();

    await expect.poll(async () => (await trackedEvents(page)).filter((e) => e.name === 'kt_team_select')).toEqual([
      { name: 'kt_team_select', data: { team: cardTeam.slug, locale: 'en' } },
    ]);
  });

  // Store link of each webstore, by the store box field that holds its URL
  for (const store of [
    { testId: 'store-box-name-link', store: NAME_LINK_STORE, field: NAME_LINK_STORE.field, linkType: NAME_LINK_STORE.linkType },
    ...STORES.map((s) => ({ testId: `store-box-icon-${s.id}`, store: s, field: s.field, linkType: s.linkType })),
  ]) {
    test(`${store.testId} link sends the ${store.linkType} link type`, async ({ page }) => {
      const team = killTeams().find((t) => t.store_boxes?.some((box) => box[store.field]));
      test.skip(!team, `No reviewed kill team with ${store.field}`);
      const box = team!.store_boxes!.find((b) => b[store.field])!;

      await page.goto(`${CHOOSER_URL}?legal=declassified&team=${team!.slug}`);
      await waitForTracker(page);
      await blockLinkNavigation(page);

      await page.getByTestId('kt-detail-store-boxes').getByTestId(store.testId).first().click();

      await expect.poll(() => trackedEvents(page)).toContainEqual({
        name: 'outbound_link_click',
        data: {
          url: new URL(storeLinkUrl(store.store, box[store.field]!)).href,
          page: CHOOSER_PAGE,
          link_type: store.linkType,
          team: team!.slug,
          box: box.slug,
          locale: 'en',
        },
      });
    });
  }

  test('store box link in subpage text sends the store link type and the box without a team', async ({ page }) => {
    const ref = subpageStoreBoxes('en').find(({ box }) => box.contrastphase_url);
    test.skip(!ref, 'No en subpage refers to a store box with contrastphase_url');

    await page.goto(ref!.url);
    await waitForTracker(page);
    await blockLinkNavigation(page);

    await page.getByTestId('text-block').getByTestId('store-box').filter({ hasText: ref!.box.name }).first().getByTestId('store-box-icon-contrastphase').click();

    await expect.poll(() => trackedEvents(page)).toContainEqual({
      name: 'outbound_link_click',
      data: {
        url: new URL(storeLinkUrl(STORES.find((s) => s.id === 'contrastphase')!, ref!.box.contrastphase_url!)).href,
        page: removeLocalePrefix(ref!.url),
        link_type: LINK_TYPES.contrastPhase,
        box: ref!.box.slug,
        locale: 'en',
      },
    });
  });
});
