// @ts-check
import { test, expect } from '@playwright/test';

const BACKEND = '**/api';

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure /auth/status returns unauthenticated so the login page is shown
    await page.route(`${BACKEND}/auth/status`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: false }),
      })
    );
    await page.goto('/');
  });

  test('loads and shows the Calendar Assistant heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Calendar Assistant' })).toBeVisible();
  });

  test('shows the Connect Google Calendar button', async ({ page }) => {
    // The button text in the app is "Continue with Google"
    await expect(page.getByRole('link', { name: /continue with google/i })).toBeVisible();
  });

  test('clicking the button redirects to accounts.google.com', async ({ page }) => {
    // Intercept the backend OAuth redirect so the test does not depend on real credentials
    await page.route(`${BACKEND}/auth/google`, route =>
      route.fulfill({
        status: 302,
        headers: {
          location: 'https://accounts.google.com/o/oauth2/v2/auth?mock=1',
        },
      })
    );

    const navigationPromise = page.waitForURL(/accounts\.google\.com/);
    await page.getByRole('link', { name: /continue with google/i }).click();
    await navigationPromise;

    expect(page.url()).toContain('accounts.google.com');
  });
});
