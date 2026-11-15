import { test, expect, Page } from './fixtures';
import { pageData } from './helpers/content';

// No horizontal scrollbar on the page
async function expectNoOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
}

test.describe('Responsive Design Tests', () => {
  const breakpoints = {
    mobile: { width: 375, height: 667 }, // iPhone SE size
    tablet: { width: 768, height: 1024 }, // iPad size
    desktop: { width: 1280, height: 800 } // Desktop - above xl breakpoint (1280px)
  };

  test('Mobile layout (375px): navigation and no overflow', async ({ page }) => {
    await page.setViewportSize(breakpoints.mobile);
    await page.goto('/hu/');

    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    // Mobile language switcher should show single active language
    const mobileLanguageButton = page.locator('[data-testid="mobile-language-switch"]');
    await expect(mobileLanguageButton).toBeVisible();
    await expect(mobileLanguageButton).toHaveText('HU');

    await expectNoOverflow(page);
  });

  test('Tablet layout (768px): navigation and no overflow', async ({ page }) => {
    await page.setViewportSize(breakpoints.tablet);
    await page.goto('/hu/');

    // Calendar should show as icon + text on tablet (md+)
    const navCalendarIcon = page.locator('nav [data-icon="calendar-days"]').first();
    await expect(navCalendarIcon).toBeVisible();
    const navCalendarText = page.locator('nav').getByText(pageData('calendar', 'hu').title).first();
    await expect(navCalendarText).toBeVisible();

    // Support Us should be hidden on tablet
    const supportUs = page.locator('nav').getByText(pageData('support-us', 'hu').title);
    await expect(supportUs).toBeHidden();

    // Full language switcher should be visible
    await expect(page.locator('[data-testid="desktop-language-switch"]')).toBeVisible();

    await expectNoOverflow(page);
  });

  test('Desktop layout (1280px): navigation and no overflow', async ({ page }) => {
    await page.setViewportSize(breakpoints.desktop);
    await page.goto('/hu/');

    // Calendar should show as text (link) in navigation
    const navCalendarLink = page.locator('nav a[href*="/calendar"]').filter({ hasText: pageData('calendar', 'hu').title }).first();
    await expect(navCalendarLink).toBeVisible();

    // Support Us should be visible in navigation
    const navSupportUs = page.locator('nav').getByText(pageData('support-us', 'hu').title).first();
    await expect(navSupportUs).toBeVisible();

    // Full language switcher with both languages
    const desktopLanguageSwitch = page.locator('[data-testid="desktop-language-switch"]');
    await expect(desktopLanguageSwitch).toBeVisible();
    await expect(desktopLanguageSwitch.locator('button').filter({ hasText: 'HU' })).toBeVisible();
    await expect(desktopLanguageSwitch.locator('button').filter({ hasText: 'EN' })).toBeVisible();

    await expectNoOverflow(page);
  });
});
