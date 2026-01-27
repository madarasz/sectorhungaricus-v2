import { test, expect } from '@playwright/test';

test.describe('Redirect Tests', () => {
  test('root URL redirects to /hu/', async ({ page }) => {
    // In development, root may return 404 (handled by not-found.tsx)
    // In production, it should redirect via _redirects file
    await page.goto('/');
    
    // Check if we ended up at /hu either via redirect or client-side navigation
    await page.waitForURL('**/hu**', { timeout: 5000 });
    expect(page.url()).toMatch(/\/hu\/?$/);
  });
});