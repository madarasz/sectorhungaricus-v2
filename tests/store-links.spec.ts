import { test, expect, Locator } from '@playwright/test';
import { NAME_LINK_STORE, STORES, STORE_LINK_UTM_PARAMS, Store, storeLinkUrl } from '@/lib/storeBoxes';
import type { KillTeamStoreBox } from '@/types/content';
import { killTeams, subpageStoreBoxes } from './helpers/content';

const CHOOSER_URL = '/en/kill-team/choose-a-team/';
const UTM_KEYS = Object.keys(STORE_LINK_UTM_PARAMS);
const UTM_STORE = STORES.find((store) => store.utm);
const NO_UTM_STORE = STORES.find((store) => !store.utm);

// Store URL without the UTM parameters of this site
function withoutUtmParams(href: string): string {
  const url = new URL(href);
  for (const key of UTM_KEYS) {
    url.searchParams.delete(key);
  }
  return url.href;
}

// Store links of a box with the store and the content URL, in the order of the links
function boxLinks(box: KillTeamStoreBox): Array<{ testId: string; store: Store; url: string }> {
  return [
    { testId: 'store-box-name-link', store: NAME_LINK_STORE, url: box[NAME_LINK_STORE.field] },
    ...STORES.map((store) => ({ testId: `store-box-icon-${store.id}`, store, url: box[store.field] })),
  ].filter((link): link is { testId: string; store: Store; url: string } => Boolean(link.url));
}

async function expectPartnerLinks(container: Locator, box: KillTeamStoreBox) {
  for (const { testId, store, url: contentUrl } of boxLinks(box)) {
    const link = container.getByTestId(testId);
    const href = (await link.getAttribute('href'))!;
    const url = new URL(href);
    for (const [key, value] of Object.entries(STORE_LINK_UTM_PARAMS)) {
      expect(url.searchParams.get(key), `${key} of ${href}`).toBe(store.utm ? value : null);
    }
    expect(withoutUtmParams(href)).toBe(new URL(contentUrl).href);
    // noreferrer would hide this site from the analytics of the store
    const rel = (await link.getAttribute('rel'))!.split(' ');
    expect(rel).toContain('noopener');
    expect(rel).not.toContain('noreferrer');
  }
}

test.describe('Store link URL', () => {
  test('adds the UTM parameters for a store with UTM', () => {
    test.skip(!UTM_STORE, 'No store with UTM');
    const url = new URL(storeLinkUrl(UTM_STORE!, 'https://store.example/product'));
    expect(Object.fromEntries(url.searchParams)).toEqual(STORE_LINK_UTM_PARAMS);
    expect(url.origin + url.pathname).toBe('https://store.example/product');
  });

  test('keeps the query and the hash of the URL', () => {
    test.skip(!UTM_STORE, 'No store with UTM');
    const url = new URL(storeLinkUrl(UTM_STORE!, 'https://store.example/product?variant=2&lang=en#details'));
    expect(url.searchParams.get('variant')).toBe('2');
    expect(url.searchParams.get('lang')).toBe('en');
    expect(url.hash).toBe('#details');
    for (const [key, value] of Object.entries(STORE_LINK_UTM_PARAMS)) {
      expect(url.searchParams.get(key)).toBe(value);
    }
  });

  test('replaces UTM parameters that the URL already has', () => {
    test.skip(!UTM_STORE, 'No store with UTM');
    const url = new URL(storeLinkUrl(UTM_STORE!, UTM_KEYS.reduce((u, key, i) => `${u}${i ? '&' : '?'}${key}=other`, 'https://store.example/product')));
    for (const [key, value] of Object.entries(STORE_LINK_UTM_PARAMS)) {
      expect(url.searchParams.getAll(key)).toEqual([value]);
    }
  });

  test('keeps the URL unchanged for a store without UTM', () => {
    test.skip(!NO_UTM_STORE, 'No store without UTM');
    const contentUrl = 'https://store.example/product?variant=2#details';
    expect(storeLinkUrl(NO_UTM_STORE!, contentUrl)).toBe(contentUrl);
  });
});

test.describe('Store links to partners', () => {
  test('kill team details link to the stores with the UTM parameters of the store and the referrer', async ({ page }) => {
    const team = killTeams().find((t) => t.store_boxes?.length);
    test.skip(!team, 'No reviewed kill team with store boxes');

    await page.goto(`${CHOOSER_URL}?legal=declassified&team=${team!.slug}`);
    const boxes = page.getByTestId('kt-detail').getByTestId('kt-detail-store-boxes').getByTestId('store-box');
    await expect(boxes).toHaveCount(team!.store_boxes!.length);
    for (const [i, box] of team!.store_boxes!.entries()) {
      await expectPartnerLinks(boxes.nth(i), box);
    }
  });

  test('store box in subpage text links to the stores with the UTM parameters of the store and the referrer', async ({ page }) => {
    const [ref] = subpageStoreBoxes('en');
    test.skip(!ref, 'No en subpage refers to a store box');

    await page.goto(ref.url);
    const box = page.getByTestId('text-block').getByTestId('store-box').filter({ hasText: ref.box.name }).first();
    await expect(box).toBeVisible();
    await expectPartnerLinks(box, ref.box);
  });

  test('opening a store link sends this site as the referrer', async ({ page, context }) => {
    const team = UTM_STORE && killTeams().find((t) => t.store_boxes?.some((box) => box[UTM_STORE.field]));
    test.skip(!team, 'No reviewed kill team with a link to a store with UTM');
    const store = UTM_STORE!;
    const storeUrl = new URL(storeLinkUrl(store, team!.store_boxes!.find((box) => box[store.field])![store.field]!)).href;

    // The store page is not loaded, the request is answered here
    const referer = new Promise<string | null>((resolve) => {
      context.route((url) => url.href === storeUrl, async (route) => {
        resolve(await route.request().headerValue('referer'));
        await route.fulfill({ status: 200, body: '' });
      });
    });

    await page.goto(`${CHOOSER_URL}?legal=declassified&team=${team!.slug}`);
    const popup = page.waitForEvent('popup');
    await page.getByTestId('kt-detail-store-boxes').getByTestId(`store-box-icon-${store.id}`).first().click();
    await popup;

    expect(await referer).toBe(`${new URL(page.url()).origin}/`);
  });
});
