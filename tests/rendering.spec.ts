import { test, expect } from '@playwright/test';

test.describe('Rendering Tests', () => {
  test('Hungarian page renders with HTTP 200 status', async ({ page }) => {
    const response = await page.goto('/hu/');
    expect(response?.status()).toBe(200);
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Verify the page title contains expected content
    await expect(page).toHaveTitle(/Sector Hungaricus/);
  });

  test('English page renders with HTTP 200 status', async ({ page }) => {
    const response = await page.goto('/en/');
    expect(response?.status()).toBe(200);
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Verify the page title contains expected content
    await expect(page).toHaveTitle(/Sector Hungaricus/);
  });

  test('Hungarian page renders without React errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/hu/');
    await page.waitForLoadState('networkidle');

    // Check that no React errors occurred
    const reactErrors = consoleErrors.filter(error => 
      error.includes('React') || 
      error.includes('Warning:') ||
      error.includes('Error:')
    );
    
    expect(reactErrors).toHaveLength(0);
  });

  test('English page renders without React errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/en/');
    await page.waitForLoadState('networkidle');

    // Check that no React errors occurred
    const reactErrors = consoleErrors.filter(error => 
      error.includes('React') || 
      error.includes('Warning:') ||
      error.includes('Error:')
    );
    
    expect(reactErrors).toHaveLength(0);
  });
});