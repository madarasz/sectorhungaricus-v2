import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  const breakpoints = {
    mobile: { width: 375, height: 667 }, // iPhone SE size
    tablet: { width: 768, height: 1024 }, // iPad size
    desktop: { width: 1280, height: 800 } // Desktop - above xl breakpoint (1280px)
  };

  test.describe('Mobile Layout (375px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(breakpoints.mobile);
    });

    test('Navigation renders correctly on mobile', async ({ page }) => {
      await page.goto('/hu/');

      // Check navigation height is 6rem (96px)
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();

      // Mobile language switcher should show single active language
      const mobileLanguageButton = page.locator('[data-testid="mobile-language-switch"]');
      await expect(mobileLanguageButton).toBeVisible();
      await expect(mobileLanguageButton).toHaveText('HU');
    });

    test('No layout overflow on mobile', async ({ page }) => {
      await page.goto('/hu/');

      // Check that no horizontal scrollbar appears
      const horizontalScrollWidth = await page.evaluate(() => {
        return document.documentElement.scrollWidth;
      });
      
      const viewportWidth = await page.evaluate(() => {
        return document.documentElement.clientWidth;
      });

      expect(horizontalScrollWidth).toBeLessThanOrEqual(viewportWidth + 1); // Allow 1px tolerance
    });
  });

  test.describe('Tablet Layout (768px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(breakpoints.tablet);
    });

    test('Navigation renders correctly on tablet', async ({ page }) => {
      await page.goto('/hu/');
 
      // Calendar should show as icon + text on tablet (md+)
      const navCalendarIcon = page.locator('nav [data-icon="calendar-days"]').first();
      await expect(navCalendarIcon).toBeVisible();
      const navCalendarText = page.locator('nav').locator('text=Naptár').first();
      await expect(navCalendarText).toBeVisible();

      // About Us should be hidden on tablet
      const aboutUs = page.locator('nav').locator('text=Rólunk').or(page.locator('nav').locator('text=About Us'));
      await expect(aboutUs).toBeHidden();

      // Full language switcher should be visible (desktop buttons in the hidden div)
      const desktopLanguageSwitch = page.locator('[data-testid="desktop-language-switch"]');
      await expect(desktopLanguageSwitch).toBeVisible();
    });

    test('No layout overflow on tablet', async ({ page }) => {
      await page.goto('/hu/');

      const horizontalScrollWidth = await page.evaluate(() => {
        return document.documentElement.scrollWidth;
      });
      
      const viewportWidth = await page.evaluate(() => {
        return document.documentElement.clientWidth;
      });

      expect(horizontalScrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });
  });

  test.describe('Desktop Layout (1200px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(breakpoints.desktop);
    });

    test('Navigation renders correctly on desktop', async ({ page }) => {
      await page.goto('/hu/');

      // Calendar should show as text (link) in navigation
      const navCalendarLink = page.locator('nav a[href*="/calendar"]').filter({ hasText: 'Naptár' }).first();
      await expect(navCalendarLink).toBeVisible();

      // About Us should be visible in navigation
      const navAboutUs = page.locator('nav').locator('text=Rólunk').or(page.locator('nav').locator('text=About Us')).first();
      await expect(navAboutUs).toBeVisible();

      // Full language switcher should be visible (desktop buttons in the hidden div)
      const desktopLanguageSwitch = page.locator('[data-testid="desktop-language-switch"]');
      await expect(desktopLanguageSwitch).toBeVisible();
      
      // Check individual buttons within desktop switcher
      const huButton = desktopLanguageSwitch.locator('button').filter({ hasText: 'HU' });
      const enButton = desktopLanguageSwitch.locator('button').filter({ hasText: 'EN' });
      await expect(huButton).toBeVisible();
      await expect(enButton).toBeVisible();
    });

    test('No layout overflow on desktop', async ({ page }) => {
      await page.goto('/hu/');

      const horizontalScrollWidth = await page.evaluate(() => {
        return document.documentElement.scrollWidth;
      });
      
      const viewportWidth = await page.evaluate(() => {
        return document.documentElement.clientWidth;
      });

      expect(horizontalScrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });
  });
});