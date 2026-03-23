# Calendar Assistant

An AI-powered calendar agent. Authenticate with Google, view your schedule, and chat with an agent that can analyze your time, schedule meetings, and draft emails.

## Setup

### Prerequisites
- Node.js 18+
- A Google Cloud project with Calendar API enabled
- An Anthropic API key

### 1. Clone and install

```bash
git clone <your-repo>
cd calendar-assistant
npm install
cd client && npm install && cd ..
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
ANTHROPIC_API_KEY=
SESSION_SECRET=any_random_string
CLIENT_URL=http://localhost:5173
PORT=3001
```

### 3. Google Cloud Setup
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project, enable **Google Calendar API**
3. Create OAuth 2.0 credentials (Web Application)
4. Add `http://localhost:3001/auth/google/callback` as an authorized redirect URI
5. Add your Google account as a test user under OAuth consent screen

### 4. Run

```bash
# In one terminal — backend
node server/index.js

# In another terminal — frontend
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Running the Tests

The test suite uses [Playwright](https://playwright.dev/) and targets the deployed app at `https://calendar-assistant-phi.vercel.app`.

### Prerequisites

Install Playwright and its Chromium browser (only needed once):

```bash
npm install
npx playwright install chromium
```

### Run all tests

```bash
npx playwright test
```

### Run a specific test file

```bash
npx playwright test tests/login.spec.js
npx playwright test tests/ui.spec.js
npx playwright test tests/chat.spec.js
```

### View the HTML report after a run

```bash
npx playwright show-report
```

### Test structure

| File | What it tests |
|------|--------------|
| `tests/login.spec.js` | Login page loads, shows heading and Google button, button redirects to `accounts.google.com` |
| `tests/ui.spec.js` | App shell (auth mocked): calendar panel shows *Your Schedule*, chat panel shows *AI Assistant* |
| `tests/chat.spec.js` | Chat (auth mocked): suggested prompts render, clicking a prompt sends it, sending a message shows loading state |

Auth is mocked by intercepting the backend `/auth/status` route at the network level — no real Google credentials are required to run the tests.

---

## What it does

- Google OAuth authentication
- Displays upcoming calendar events grouped by day
- AI chat agent powered by Claude with tool use:
  - Fetches calendar events for any date range
  - Analyzes meeting load (hours/week, % of workday)
  - Drafts scheduling emails with available time slots
- Suggested prompts to demo agent capabilities immediately

## Tech Stack
- React + Vite + Tailwind CSS (frontend)
- Node.js + Express (backend)
- Google Calendar API v3
- Anthropic Claude claude-opus-4-6 with tool use

## Architecture

```
calendar-assistant/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── Auth/        # LoginPage
│       │   ├── Calendar/    # CalendarView, EventCard
│       │   ├── Chat/        # ChatPanel, MessageBubble, SuggestedPrompts
│       │   └── Layout/      # AppShell (split layout)
│       └── App.jsx
├── server/
│   ├── routes/
│   │   ├── auth.js          # Google OAuth routes
│   │   ├── calendar.js      # Calendar API proxy
│   │   └── chat.js          # Claude agent endpoint
│   ├── services/
│   │   ├── googleCalendar.js  # Google Calendar API wrapper
│   │   └── calendarAgent.js   # Claude agent + agentic loop
│   ├── middleware/
│   │   └── requireAuth.js
│   └── index.js
└── .env.example
```

## Agent Capabilities

The Claude agent uses tool use to:

1. **`get_calendar_events`** — Fetches events for any date range from Google Calendar
2. **`analyze_meeting_load`** — Calculates hours/week in meetings, % of workday
3. **`draft_scheduling_email`** — Composes professional scheduling emails with time slot proposals

The agent runs an agentic loop: it calls tools as needed, processes results, and continues until it has a complete answer.

## What's Next

- **Streaming responses** — Use Claude's streaming API for faster perceived response times
- **Write access** — Allow the agent to create/modify calendar events directly
- **Recurring event intelligence** — Detect scheduling patterns and surface them proactively
- **Multi-calendar support** — Handle shared or team calendars
- **Smart availability detection** — Auto-detect open slots before drafting scheduling emails
