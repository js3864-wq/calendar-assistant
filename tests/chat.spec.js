// @ts-check
import { test, expect } from '@playwright/test';

const BACKEND = 'https://calendar-assistant-production-476d.up.railway.app';

const SUGGESTED_PROMPTS = [
  'How much time am I spending in meetings this week?',
  'What does my schedule look like tomorrow?',
  'Recommend ways I can reduce meeting load.',
];

/** Build a minimal SSE body from an array of event objects */
function buildSseBody(events) {
  return events.map(e => `data: ${JSON.stringify(e)}`).join('\n\n') + '\n\n';
}

test.describe('Chat panel (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${BACKEND}/auth/status`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: true }),
      })
    );

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
    await expect(page.getByText(/try asking/i)).toBeVisible();

    for (const prompt of SUGGESTED_PROMPTS) {
      await expect(page.getByRole('button', { name: prompt })).toBeVisible();
    }
  });

  test('clicking a suggested prompt sends it as a message (SSE response)', async ({ page }) => {
    const prompt = SUGGESTED_PROMPTS[0];
    const replyText = 'You have 5 hours of meetings this week.';

    await page.route(`${BACKEND}/chat/message`, route =>
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: buildSseBody([
          { type: 'token', text: replyText },
          {
            type: 'done',
            updatedMessages: [
              { role: 'user', content: prompt },
              { role: 'assistant', content: [{ type: 'text', text: replyText }] },
            ],
          },
        ]),
      })
    );

    await page.getByRole('button', { name: prompt }).click();

    await expect(page.getByText(prompt)).toBeVisible();
    await expect(page.getByText(replyText)).toBeVisible();
  });

  test('streaming response renders token by token', async ({ page }) => {
    const userMessage = 'What does my schedule look like tomorrow?';
    const part1 = 'You have a ';
    const part2 = 'free day tomorrow.';

    await page.route(`${BACKEND}/chat/message`, route =>
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: buildSseBody([
          { type: 'token', text: part1 },
          { type: 'token', text: part2 },
          {
            type: 'done',
            updatedMessages: [
              { role: 'user', content: userMessage },
              { role: 'assistant', content: [{ type: 'text', text: part1 + part2 }] },
            ],
          },
        ]),
      })
    );

    const input = page.getByPlaceholder('Ask about your schedule...');
    await input.fill(userMessage);
    await input.press('Enter');

    await expect(page.getByText(part1 + part2)).toBeVisible();
  });

  test('status event text is shown in the loading indicator', async ({ page }) => {
    const userMessage = 'How busy am I this week?';
    const statusMsg = 'Fetching calendar events\u2026';
    const replyText = 'You have 3 meetings.';

    await page.route(`${BACKEND}/chat/message`, async route => {
      // Delay so we can observe the status indicator before completion
      await new Promise(resolve => setTimeout(resolve, 800));
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: buildSseBody([
          { type: 'status', text: statusMsg },
          { type: 'token', text: replyText },
          {
            type: 'done',
            updatedMessages: [
              { role: 'user', content: userMessage },
              { role: 'assistant', content: [{ type: 'text', text: replyText }] },
            ],
          },
        ]),
      });
    });

    const input = page.getByPlaceholder('Ask about your schedule...');
    await input.fill(userMessage);
    await input.press('Enter');

    // Loading indicator with status text should appear
    await expect(page.getByText(statusMsg)).toBeVisible({ timeout: 3000 });
    // Final reply should eventually appear
    await expect(page.getByText(replyText)).toBeVisible({ timeout: 5000 });
  });

  test('sending a message shows a loading state', async ({ page }) => {
    const userMessage = 'What does my schedule look like tomorrow?';

    await page.route(`${BACKEND}/chat/message`, async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: buildSseBody([
          { type: 'token', text: 'You have a free day tomorrow.' },
          {
            type: 'done',
            updatedMessages: [
              { role: 'user', content: userMessage },
              { role: 'assistant', content: [{ type: 'text', text: 'You have a free day tomorrow.' }] },
            ],
          },
        ]),
      });
    });

    const input = page.getByPlaceholder('Ask about your schedule...');
    await input.fill(userMessage);
    await input.press('Enter');

    // Loading dots should appear while response is in-flight
    const loadingDots = page.locator('div.flex.justify-start span.animate-bounce').first();
    await expect(loadingDots).toBeVisible();
  });

  test('rate limit error shows a friendly message', async ({ page }) => {
    await page.route(`${BACKEND}/chat/message`, route =>
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Too many requests. Please wait a moment before trying again.' }),
      })
    );

    const input = page.getByPlaceholder('Ask about your schedule...');
    await input.fill('How busy am I?');
    await input.press('Enter');

    await expect(page.getByText(/too many requests/i)).toBeVisible();
  });

  test('server error shows a fallback error message', async ({ page }) => {
    await page.route(`${BACKEND}/chat/message`, route =>
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: buildSseBody([{ type: 'error', error: 'Internal server error' }]),
      })
    );

    const input = page.getByPlaceholder('Ask about your schedule...');
    await input.fill('Show me my calendar');
    await input.press('Enter');

    await expect(page.getByText(/something went wrong/i)).toBeVisible();
  });

  test('input is cleared after sending a message', async ({ page }) => {
    const userMessage = 'Test message';

    await page.route(`${BACKEND}/chat/message`, route =>
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: buildSseBody([
          { type: 'token', text: 'Reply.' },
          { type: 'done', updatedMessages: [] },
        ]),
      })
    );

    const input = page.getByPlaceholder('Ask about your schedule...');
    await input.fill(userMessage);
    await input.press('Enter');

    await expect(input).toHaveValue('');
  });
});
