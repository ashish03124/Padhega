import { test, expect } from '@playwright/test';

test.describe('Padhega Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Mock NextAuth session endpoint to simulate logged in state
        await page.route('**/api/auth/session', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    user: {
                        id: 'test-user-123',
                        name: 'Test student',
                        email: 'student@padhega.edu',
                        image: null,
                    },
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                }),
            });
        });

        // Mock Tasks endpoints to make E2E test run offline without hitting real database
        await page.route('**/api/tasks', async (route) => {
            const method = route.request().method();
            if (method === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([
                        {
                            _id: 'task-initial-1',
                            text: 'E2E Testing Task',
                            isCompleted: false,
                            priority: 'medium',
                            category: 'study',
                            createdAt: new Date().toISOString(),
                            subtasks: [],
                        }
                    ]),
                });
            } else if (method === 'POST') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        _id: 'task-created-2',
                        text: 'Learn Playwright Testing',
                        isCompleted: false,
                        priority: 'high',
                        category: 'practice',
                        createdAt: new Date().toISOString(),
                        subtasks: [],
                    }),
                });
            } else if (method === 'PATCH') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        _id: 'task-initial-1',
                        text: 'E2E Testing Task',
                        isCompleted: true,
                        priority: 'medium',
                        category: 'study',
                        createdAt: new Date().toISOString(),
                        completedAt: new Date().toISOString(),
                        subtasks: [],
                    }),
                });
            }
        });

        // Mock User XP endpoint
        await page.route('**/api/user/xp', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ xp: 150 }),
            });
        });

        // Navigate to dashboard
        await page.goto('/');
    });

    test('should display the main bento sections', async ({ page }) => {
        await expect(page.locator('h2', { hasText: 'Study Timer' })).toBeVisible();
        await expect(page.locator('h2', { hasText: 'Study Tasks' })).toBeVisible();
        await expect(page.locator('h2', { hasText: 'Smart Notes' })).toBeVisible();
    });

    test('should allow interacting with the timer', async ({ page }) => {
        const startBtn = page.locator('.btn-start');
        await expect(startBtn).toBeVisible();

        // Start the timer
        await startBtn.click();

        // Check if it switched to pause button
        await expect(page.locator('.btn-pause')).toBeVisible();

        // Pause the timer
        await page.locator('.btn-pause').click();
        await expect(page.locator('.btn-start')).toBeVisible();
    });

    test('should support creating and completing a task', async ({ page }) => {
        // Find input and type new task text
        const taskInput = page.locator('input.task-input');
        await expect(taskInput).toBeVisible();
        await taskInput.fill('Learn Playwright Testing');

        // Focus task input to trigger options
        await taskInput.focus();

        // Select Category & Priority if visible
        const priorityBtn = page.locator('.priority-btn').filter({ hasText: 'High' });
        if (await priorityBtn.isVisible()) {
            await priorityBtn.click();
        }

        // Add the task
        const addBtn = page.locator('.task-input-group button').filter({ hasText: 'Add' });
        await addBtn.click();

        // Assert that new task shows up in list
        const createdTaskText = page.locator('.task-list .task-item').filter({ hasText: 'Learn Playwright Testing' });
        await expect(createdTaskText).toBeVisible();

        // Toggle checkbox on the initial task to complete it
        const initialTaskCheckbox = page.locator('.task-list .task-item').filter({ hasText: 'E2E Testing Task' }).locator('input.task-checkbox');
        await expect(initialTaskCheckbox).toBeVisible();
        await initialTaskCheckbox.check();

        // Assert that the text shows line-through styling indicating completed status
        const completedTaskText = page.locator('.task-list .task-item').filter({ hasText: 'E2E Testing Task' }).locator('.task-text');
        await expect(completedTaskText).toHaveClass(/task-completed/);
    });

    test('should support typing in editor and exporting notes', async ({ page }) => {
        // Locate ContentEditable Notes editor
        const notesEditor = page.locator('div.notes-content');
        await expect(notesEditor).toBeVisible();

        // Type inside contenteditable
        await notesEditor.focus();
        await notesEditor.fill('This is a test note created by Playwright E2E suite.');

        // Trigger notes export dropdown
        const exportTrigger = page.locator('button[aria-label="Export Menu"]');
        await expect(exportTrigger).toBeVisible();
        await exportTrigger.click();

        // Find the download/export buttons inside the active dropdown
        const markdownExportBtn = page.locator('button[role="menuitem"]').filter({ hasText: 'Markdown' });
        await expect(markdownExportBtn).toBeVisible();

        // Handle download event triggers
        const downloadPromise = page.waitForEvent('download');
        await markdownExportBtn.click();
        const download = await downloadPromise;

        // Verify download was triggered successfully
        expect(download.suggestedFilename()).toContain('notes');
    });
});
