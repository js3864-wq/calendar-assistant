// @ts-check
import { test, expect } from '@playwright/test';

const BACKEND = 'https://calendar-assistant-production-476d.up.railway.app';

test.describe('App shell (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth status to simulate a logged-in session
    await page.route(`${BACKEND}/auth/status`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: true }),
      })
    );

    // Mock calendar events so the calendar panel does not make real API calls
    await page.route(`${BACKEND}/calendar/events`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    );

    await page.goto('/');
  });

  test('calendar panel renders with Your Schedule heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Your Schedule' })).toBeVisible();
  });

  test('chat panel renders with AI Assistant heading', async ({ page }) => {
    await expect(page.getByText('AI Assistant')).toBeVisible();
  });

  test('renders both the calendar and chat panels side by side', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Your Schedule' })).toBeVisible();
    await expect(page.getByText('AI Assistant')).toBeVisible();
  });
});
