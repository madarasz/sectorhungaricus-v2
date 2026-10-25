import { test, expect } from '@playwright/test';
import { composeTitle } from '@/lib/seo';
import { pageData, subpageData } from './helpers/content';

test.describe('SEO metadata', () => {
  test('homepage has keyword-rich title and canonical', async ({ page }) => {
    const home = pageData('welcome-to-sector-hungaricus', 'en');
    await page.goto('/en/');
    await expect(page).toHaveTitle(composeTitle(home.metaTitle, home.title));
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/$/);
    await expect(page.locator('link[rel="alternate"][hreflang="hu-HU"]')).toHaveCount(1);
  });

  test('Kill Team landing page targets the keywords', async ({ page }) => {
    const subpage = subpageData('kill-team-what-is-kill-team', 'en') as Record<string, string>;
    await page.goto('/en/kill-team/what-is-kill-team/');
    await expect(page).toHaveTitle(subpage.metaTitle);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', subpage.metaDescription);
  });

  test('Organization JSON-LD is present', async ({ page }) => {
    await page.goto('/en/');
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(blocks.join(' ')).toContain('SportsOrganization');
  });

  test('sitemap and robots are served', async ({ page }) => {
    const sitemap = await page.request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain('kill-team');

    const robots = await page.request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain('Sitemap');
  });
});
