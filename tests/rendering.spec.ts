import { test, expect } from '@playwright/test';

test.describe('Rendering Tests', () => {
  test('Hungarian page renders without React errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto('/hu/');
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/Sector Hungaricus/);

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

    const response = await page.goto('/en/');
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/Sector Hungaricus/);

    // Check that no React errors occurred
    const reactErrors = consoleErrors.filter(error => 
      error.includes('React') || 
      error.includes('Warning:') ||
      error.includes('Error:')
    );
    
    expect(reactErrors).toHaveLength(0);
  });

  test('Hungarian calendar page renders without React errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto('/hu/calendar');
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/Sector Hungaricus/);

    // Check that no React errors occurred
    const reactErrors = consoleErrors.filter(error => 
      error.includes('React') || 
      error.includes('Warning:') ||
      error.includes('Error:')
    );
    
    expect(reactErrors).toHaveLength(0);
  });

  test('English calendar page renders without React errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto('/en/calendar');
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/Sector Hungaricus/);

    // Check that no React errors occurred
    const reactErrors = consoleErrors.filter(error => 
      error.includes('React') || 
      error.includes('Warning:') ||
      error.includes('Error:')
    );
    
    expect(reactErrors).toHaveLength(0);
  });
});