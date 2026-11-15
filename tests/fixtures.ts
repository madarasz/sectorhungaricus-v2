import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';
export type { Locator, Page } from '@playwright/test';

// Team photos come from the warhammer.com shop; slow responses from it make page loads slow or time out
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/^https:\/\/www\.warhammer\.com\//, (route) => route.abort());
    await use(page);
  },
});
