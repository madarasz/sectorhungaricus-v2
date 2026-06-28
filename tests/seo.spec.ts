import { test, expect } from '@playwright/test';

test.describe('SEO metadata', () => {
  test('homepage has keyword-rich title and canonical', async ({ page }) => {
    await page.goto('/en/');
    await expect(page).toHaveTitle(/Kill Team/);
    await expect(page).toHaveTitle(/Sector Hungaricus/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/$/);
    await expect(page.locator('link[rel="alternate"][hreflang="hu-HU"]')).toHaveCount(1);
  });

  test('Kill Team landing page targets the keywords', async ({ page }) => {
    await page.goto('/en/kill-team/what-is-kill-team/');
    await expect(page).toHaveTitle(/Kill Team/);
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(description).toMatch(/Budapest|Hungary/);
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
