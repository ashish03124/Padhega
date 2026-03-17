import { test, expect } from '@playwright/test';

test.describe('Padhega Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the home page (assuming it's the dashboard for guest)
        await page.goto('/');
    });

    test('should display the main sections', async ({ page }) => {
        await expect(page.locator('h2', { hasText: 'Study Timer' })).toBeVisible();
        await expect(page.locator('h2', { hasText: 'Tasks' })).toBeVisible();
    });

    test('should allow interacting with the timer', async ({ page }) => {
        const startBtn = page.locator('.btn-start');
        await expect(startBtn).toBeVisible();

        // Start the timer
        await startBtn.click();

        // Check if it switched to pause button
        await expect(page.locator('.btn-pause')).toBeVisible();
    });

    test('should show auth modal on protected actions', async ({ page }) => {
        // Assuming clicking "Add Goal" requires login
        const addGoalBtn = page.locator('button', { hasText: 'Add Goal' });
        if (await addGoalBtn.isVisible()) {
            await addGoalBtn.click();
            await expect(page.locator('.auth-modal')).toBeVisible();
        }
    });
});
