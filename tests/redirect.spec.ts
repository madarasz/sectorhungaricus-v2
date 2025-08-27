import { test, expect } from '@playwright/test';

test.describe('Redirect Tests', () => {
  test('root URL redirects to /hu/', async ({ page }) => {
    // In development, root may return 404 (handled by not-found.tsx)
    // In production, it should redirect via _redirects file
    const response = await page.goto('/');
    
    // Check if we ended up at /hu/ either via redirect or client-side navigation
    await page.waitForURL('**/hu/**', { timeout: 5000 });
    expect(page.url()).toMatch(/\/hu\/$/);
  });

  test('root URL without trailing slash redirects to /hu/', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'networkidle' });
    
    // Wait for any redirects or client-side navigation to complete
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/hu\/$/);
  });
});