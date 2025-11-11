import { test, expect, Page } from '@playwright/test';

test.describe('Subpages Navigation Tests', () => {
  // Pages excluded from content length check
  const EXCLUDED_TITLES = [
    'Képek',
    'Gallery',
  ];

  // Helper function to check content has at least 100 characters
  async function checkContentLength(page: Page) {
    const subpageContent = page.locator('[data-testid="subpage-content"]');
    await expect(subpageContent).toBeVisible();
    
    const textContent = await subpageContent.textContent();
    expect(textContent?.length || 0).toBeGreaterThanOrEqual(100);
  }

  // Helper function to navigate through all subpages
  async function navigateSubpages(page: Page, locale: string, gameSlug: string, subpageSlug: string) {
    // Navigate to the initial subpage
    await page.goto(`/${locale}/${gameSlug}/${subpageSlug}/`);
    
    // Check initial content
    await checkContentLength(page);
    
    // Find the subpage navigation
    const subpageNav = page.locator('nav').filter({ has: page.locator('a[href*="/' + gameSlug + '/"]') });
    await expect(subpageNav).toBeVisible();
    
    // Get all subpage links
    const subpageLinks = subpageNav.locator('a[href*="/' + gameSlug + '/"]');
    const linkCount = await subpageLinks.count();
    
    // Navigate through each subpage
    for (let i = 0; i < linkCount; i++) {
      // Get the link again (page might have changed)
      const currentLinks = subpageNav.locator('a[href*="/' + gameSlug + '/"]');
      const link = currentLinks.nth(i);
      
      // Get the href and title before clicking
      const href = await link.getAttribute('href');
      const title = await link.textContent();
      
      console.log(`Navigating to subpage: ${title} (${href})`);
      
      // Click the link
      await link.click();
      
      // Wait for URL to change
      await page.waitForURL(`**${href}`, { timeout: 5000 });
      
      // Verify we're on the correct page
      expect(page.url()).toContain(href);
      
      // Check content length
      if (!EXCLUDED_TITLES.includes(title!)) {
        await checkContentLength(page);
      }
      
      // Verify the link is marked as active
      await expect(link).toHaveClass(/hero-colors/);
    }
    
    return linkCount;
  }

  test('Hungarian subpages navigation - Kill Team', async ({ page }) => {
    const linkCount = await navigateSubpages(page, 'hu', 'kill-team', 'what-is-kill-team');
    
    // Verify we navigated through multiple subpages
    expect(linkCount).toBeGreaterThan(1);
  });

  test('English subpages navigation - Kill Team', async ({ page }) => {
    const linkCount = await navigateSubpages(page, 'en', 'kill-team', 'what-is-kill-team');
    
    // Verify we navigated through multiple subpages
    expect(linkCount).toBeGreaterThan(1);
  });
});