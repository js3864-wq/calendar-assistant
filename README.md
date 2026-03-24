# Calendar Assistant

An AI-powered calendar agent that connects to Google Calendar, shows your upcoming schedule, and lets you chat with an assistant that can analyze meeting load and draft scheduling emails.

## Overview

This project was built as a take-home assignment for Tenex's Forward Deployed AI Engineer role. It is a full-stack web app with:

- Google OAuth authentication
- Calendar event retrieval from a GSuite account
- A calendar view for upcoming events
- A chat interface backed by Claude with tool use
- Streaming responses over Server-Sent Events (SSE)

## Tech Stack

- React + Vite + Tailwind CSS
- Node.js + Express
- Google Calendar API v3
- Anthropic Claude Sonnet 4.6 with tool use
- Playwright for UI and interaction tests

## Project Structure

```text
calendar-assistant/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |   |-- Auth/
|   |   |   |-- Calendar/
|   |   |   |-- Chat/
|   |   |   `-- Layout/
|   |   |-- context/
|   |   `-- App.jsx
|   `-- vercel.json
|-- server/
|   |-- middleware/
|   |-- routes/
|   |-- services/
|   `-- index.js
|-- tests/
|-- .env.example
`-- README.md
```

## Local Setup

### Prerequisites

- Node.js 18+
- A Google Cloud project with Google Calendar API enabled
- An Anthropic API key

### 1. Install dependencies

```bash
npm install
cd client && npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and set:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
ANTHROPIC_API_KEY=
SESSION_SECRET=any_random_string
CLIENT_URL=http://localhost:5173
PORT=3001
```

### 3. Configure Google Cloud

Create OAuth 2.0 credentials and add these redirect URIs:

- Local development: `http://localhost:3001/auth/google/callback`
- Production with Vercel + Railway: `https://www.10xtakehome.com/api/auth/google/callback`

Authorized JavaScript origins:

- `http://localhost:5173`
- `https://10xtakehome.com`
- `https://www.10xtakehome.com`

### 4. Run locally

Backend:

```bash
node server/index.js
```

Frontend:

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Production Deployment Notes

This app uses a same-origin `/api` proxy in production so authentication works reliably on the deployed frontend domain.

Production environment values:

```env
CLIENT_URL=https://www.10xtakehome.com
GOOGLE_REDIRECT_URI=https://www.10xtakehome.com/api/auth/google/callback
```

Production flow:

- Vercel serves the frontend
- Vercel rewrites `/api/*` to the Railway backend
- Google OAuth redirects back to `https://www.10xtakehome.com/api/auth/google/callback`
- The browser keeps auth on the same site instead of relying on a third-party Railway cookie

## Features

### Calendar view

- Authenticates with Google
- Pulls upcoming events from the user's primary calendar
- Groups events by day
- Shows event times and attendee counts

### Chat assistant

- Supports natural language questions about schedule and meeting load
- Streams responses back to the UI
- Uses tool calls to fetch calendar data on demand
- Can draft scheduling emails while respecting preferences like blocking mornings

### Agent tools

The assistant can use:

1. `get_calendar_events`
2. `analyze_meeting_load`
3. `draft_scheduling_email`

## Running Tests

The Playwright suite mocks auth and backend responses at the network layer, so tests do not require real Google credentials.

Install Playwright browser support if needed:

```bash
npx playwright install chromium
```

Run all tests:

```bash
npx playwright test
```

Run specific files:

```bash
npx playwright test tests/login.spec.js
npx playwright test tests/ui.spec.js
npx playwright test tests/chat.spec.js
```

Open the HTML report:

```bash
npx playwright show-report
```

## Trade-Offs

- The app currently uses Express session MemoryStore, which is acceptable for a take-home but should be replaced in production with a shared store like Redis.
- Calendar access is read-only today. The assistant can reason and draft, but it does not directly create or modify events.
- Suggested prompts are optimized to quickly demonstrate the assistant's capabilities in a short product demo.

## Next Steps

- Replace MemoryStore with a production session store
- Add direct event creation and editing
- Improve automatic availability detection for scheduling emails
- Support multiple calendars and shared calendars
- Add richer observability and conversation analytics
