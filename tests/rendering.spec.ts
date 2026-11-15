import { test, expect } from './fixtures';
import { SITE_NAME } from '@/lib/seo';

test.describe('Rendering Tests', () => {
  test('pages render without React errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    for (const url of ['/hu/', '/en/', '/hu/calendar/', '/en/calendar/']) {
      const response = await page.goto(url);
      expect(response?.status(), url).toBe(200);
      await expect(page).toHaveTitle(new RegExp(SITE_NAME));
    }

    // Check that no React errors occurred
    const reactErrors = consoleErrors.filter(error =>
      error.includes('React') ||
      error.includes('Warning:') ||
      error.includes('Error:')
    );

    expect(reactErrors).toHaveLength(0);
  });
});
