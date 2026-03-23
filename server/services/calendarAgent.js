const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const { getEventsForRange } = require('./googleCalendar');

function getApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  // Fall back to Claude Code session token when running in a Claude Code environment
  const tokenFile = '/home/claude/.claude/remote/.session_ingress_token';
  try {
    return fs.readFileSync(tokenFile, 'utf-8').trim();
  } catch {
    return undefined;
  }
}

const client = new Anthropic({ apiKey: getApiKey() });

const tools = [
  {
    name: 'get_calendar_events',
    description: "Fetches calendar events for a given date range. Use this to answer questions about the user's schedule.",
    input_schema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'ISO 8601 start date, e.g. 2025-03-24T00:00:00Z' },
        endDate: { type: 'string', description: 'ISO 8601 end date, e.g. 2025-03-31T23:59:59Z' },
      },
      required: ['startDate', 'endDate'],
    },
  },
  {
    name: 'analyze_meeting_load',
    description: 'Analyzes how many hours per week the user spends in meetings and returns a breakdown.',
    input_schema: {
      type: 'object',
      properties: {
        weeks: { type: 'number', description: 'Number of past weeks to analyze (default: 2)' },
      },
      required: [],
    },
  },
  {
    name: 'draft_scheduling_email',
    description: 'Drafts a scheduling email for a given person, proposing available time slots.',
    input_schema: {
      type: 'object',
      properties: {
        recipientName: { type: 'string', description: 'Name of the person to schedule with' },
        meetingPurpose: { type: 'string', description: 'What the meeting is about' },
        availableSlots: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of available time slots as human-readable strings',
        },
        senderPreferences: { type: 'string', description: 'Any preferences like blocking mornings, meeting length, etc.' },
      },
      required: ['recipientName', 'meetingPurpose'],
    },
  },
];

const SYSTEM_PROMPT = `You are a smart calendar assistant. You have access to the user's Google Calendar.

Your capabilities:
- Fetch and reason about calendar events
- Analyze meeting load and time allocation
- Draft professional scheduling emails with specific available time slots
- Give actionable recommendations to improve time management

When drafting emails:
- Be warm but professional
- Always include 2-3 specific time options
- Respect user preferences (e.g. blocking mornings for workouts)
- Keep emails concise

When analyzing time:
- Be specific with numbers (hours per week, % of working hours)
- Give 2-3 concrete, actionable recommendations

Today's date is: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
`;

async function runAgentTurn(messages, tokens) {
  let response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools,
    messages,
  });

  // Agentic loop — keep going until stop_reason is 'end_turn'
  while (response.stop_reason === 'tool_use') {
    const assistantMessage = { role: 'assistant', content: response.content };
    const toolResults = [];

    for (const block of response.content) {
      if (block.type !== 'tool_use') continue;

      let result;
      try {
        if (block.name === 'get_calendar_events') {
          const events = await getEventsForRange(tokens, block.input.startDate, block.input.endDate);
          result = JSON.stringify(events.map(e => ({
            id: e.id,
            summary: e.summary,
            start: e.start,
            end: e.end,
            attendees: e.attendees?.map(a => a.email),
            description: e.description,
          })));
        } else if (block.name === 'analyze_meeting_load') {
          const weeks = block.input.weeks || 2;
          const end = new Date();
          const start = new Date();
          start.setDate(end.getDate() - weeks * 7);
          const events = await getEventsForRange(tokens, start.toISOString(), end.toISOString());
          const meetings = events.filter(e => e.attendees && e.attendees.length > 1);
          const totalMinutes = meetings.reduce((acc, e) => {
            const s = new Date(e.start.dateTime || e.start.date);
            const en = new Date(e.end.dateTime || e.end.date);
            return acc + (en - s) / 60000;
          }, 0);
          result = JSON.stringify({
            totalMeetings: meetings.length,
            totalHours: (totalMinutes / 60).toFixed(1),
            hoursPerWeek: (totalMinutes / 60 / weeks).toFixed(1),
            percentOfWorkday: ((totalMinutes / 60 / (weeks * 5 * 8)) * 100).toFixed(1),
          });
        } else if (block.name === 'draft_scheduling_email') {
          // Claude handles the actual email drafting — just pass back the input
          result = JSON.stringify({ status: 'ready', input: block.input });
        }
      } catch (err) {
        result = JSON.stringify({ error: err.message });
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: result,
      });
    }

    messages = [...messages, assistantMessage, { role: 'user', content: toolResults }];
    response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });
  }

  return {
    reply: response.content.find(b => b.type === 'text')?.text || '',
    updatedMessages: [...messages, { role: 'assistant', content: response.content }],
  };
}

module.exports = { runAgentTurn };
