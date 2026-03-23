// @ts-check
import { test, expect } from '@playwright/test';

const BACKEND = 'https://calendar-assistant-production-476d.up.railway.app';

const SUGGESTED_PROMPTS = [
  'How much time am I spending in meetings this week?',
  'What does my schedule look like tomorrow?',
  'Recommend ways I can reduce meeting load.',
];

test.describe('Chat panel (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth to bypass Google login
    await page.route(`${BACKEND}/auth/status`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: true }),
      })
    );

    // Mock calendar events
    await page.route(`${BACKEND}/calendar/events`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    );

    await page.goto('/');
  });

  test('suggested prompts are rendered in the chat panel', async ({ page }) => {
    // The "Try asking" label is displayed above the prompts
    await expect(page.getByText(/try asking/i)).toBeVisible();

    for (const prompt of SUGGESTED_PROMPTS) {
      await expect(page.getByRole('button', { name: prompt })).toBeVisible();
    }
  });

  test('clicking a suggested prompt sends it as a message', async ({ page }) => {
    const prompt = SUGGESTED_PROMPTS[0];

    // Prevent the real chat API call from hanging the test
    await page.route(`${BACKEND}/chat/message`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reply: 'You have 5 hours of meetings this week.',
          updatedMessages: [
            { role: 'user', content: prompt },
            { role: 'assistant', content: 'You have 5 hours of meetings this week.' },
          ],
        }),
      })
    );

    await page.getByRole('button', { name: prompt }).click();

    // The user message should appear in the chat
    await expect(page.getByText(prompt)).toBeVisible();
  });

  test('sending a message shows a loading state', async ({ page }) => {
    const userMessage = 'What does my schedule look like tomorrow?';

    // Delay the chat response so the loading indicator stays visible long enough to assert
    await page.route(`${BACKEND}/chat/message`, async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reply: 'You have a free day tomorrow.',
          updatedMessages: [
            { role: 'user', content: userMessage },
            { role: 'assistant', content: 'You have a free day tomorrow.' },
          ],
        }),
      });
    });

    // Type a message and submit via Enter
    const input = page.getByPlaceholder('Ask about your schedule...');
    await input.fill(userMessage);
    await input.press('Enter');

    // The three-dot loading animation should appear while the response is in-flight
    // It is rendered as three <span> elements with animate-bounce inside the chat area
    const loadingDots = page.locator('div.flex.justify-start span.animate-bounce').first();
    await expect(loadingDots).toBeVisible();
  });
});
