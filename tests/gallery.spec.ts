import { test, expect } from '@playwright/test';

test.describe('Gallery Block Tests', () => {
  test('Gallery functionality on Kill Team what-is-kill-team page', async ({ page }) => {
    // Navigate to the Kill Team "What is Kill Team?" page
    await page.goto('/hu/kill-team/what-is-kill-team/');

    // Wait for the page to fully load
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();

    // Check that there are at least 3 gallery images on the page
    const galleryContainer = page.getByTestId('gallery-container');
    await expect(galleryContainer).toBeVisible();

    const thumbnails = page.locator('[data-testid^="gallery-thumbnail-"]');
    
    // Verify at least 3 images are present (the requirement)
    await expect(thumbnails.nth(0)).toBeVisible();
    await expect(thumbnails.nth(1)).toBeVisible();
    await expect(thumbnails.nth(2)).toBeVisible();

    // Click the first image to open the overlay
    await page.getByTestId('gallery-thumbnail-0').click();

    // Verify that overlay appeared
    const overlayBackground = page.getByTestId('gallery-overlay-background');
    await expect(overlayBackground).toBeVisible();

    // Verify that the overlay image appeared
    const overlayImage = page.getByTestId('gallery-overlay-image');
    await expect(overlayImage).toBeVisible();

    // Verify image counter shows "1 / 6"
    const imageCounter = page.getByTestId('gallery-image-counter');
    await expect(imageCounter).toBeVisible();
    await expect(imageCounter).toHaveText('1 / 6');

    // Test forward navigation
    const nextButton = page.getByTestId('gallery-next-button');
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    // Verify counter shows "2 / 6"
    await expect(imageCounter).toHaveText('2 / 6');

    // Test backward navigation
    const prevButton = page.getByTestId('gallery-prev-button');
    await expect(prevButton).toBeVisible();
    await prevButton.click();

    // Verify counter shows "1 / 6" again
    await expect(imageCounter).toHaveText('1 / 6');

    // Test navigation with arrow keys
    await page.keyboard.press('ArrowRight');
    await expect(imageCounter).toHaveText('2 / 6');

    await page.keyboard.press('ArrowLeft');
    await expect(imageCounter).toHaveText('1 / 6');

    // Close the overlay using the close button
    const closeButton = page.getByTestId('gallery-close-button');
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    // Check overlay disappeared
    await expect(overlayBackground).not.toBeVisible();
    await expect(overlayImage).not.toBeVisible();

    // Test closing overlay with Escape key
    await page.getByTestId('gallery-thumbnail-1').click();
    await expect(overlayBackground).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(overlayBackground).not.toBeVisible();

    // Test closing overlay by clicking background
    await page.getByTestId('gallery-thumbnail-2').click();
    await expect(overlayBackground).toBeVisible();
    
    await overlayBackground.click();
    await expect(overlayBackground).not.toBeVisible();
  });
});