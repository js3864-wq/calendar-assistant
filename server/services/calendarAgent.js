const Anthropic = require('@anthropic-ai/sdk');
const { getEventsForRange } = require('./googleCalendar');

const client = new Anthropic();

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

const TOOL_STATUS_MESSAGES = {
  get_calendar_events: 'Fetching calendar events\u2026',
  analyze_meeting_load: 'Analyzing your meeting load\u2026',
  draft_scheduling_email: 'Drafting scheduling email\u2026',
};

async function executeToolCall(block, tokens) {
  if (block.name === 'get_calendar_events') {
    const events = await getEventsForRange(tokens, block.input.startDate, block.input.endDate);
    return JSON.stringify(events.map(e => ({
      id: e.id,
      summary: e.summary,
      start: e.start,
      end: e.end,
      attendees: e.attendees?.map(a => a.email),
      description: e.description,
    })));
  }

  if (block.name === 'analyze_meeting_load') {
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
    return JSON.stringify({
      totalMeetings: meetings.length,
      totalHours: (totalMinutes / 60).toFixed(1),
      hoursPerWeek: (totalMinutes / 60 / weeks).toFixed(1),
      percentOfWorkday: ((totalMinutes / 60 / (weeks * 5 * 8)) * 100).toFixed(1),
    });
  }

  if (block.name === 'draft_scheduling_email') {
    return JSON.stringify({ status: 'ready', input: block.input });
  }

  throw new Error(`Unknown tool: ${block.name}`);
}

/**
 * Runs the agentic loop with streaming support.
 * onChunk is called with objects:
 *   { type: 'token', text: string }   — streamed text token
 *   { type: 'status', text: string }  — tool-execution status update
 * Returns { updatedMessages }.
 */
async function streamAgentTurn(messages, tokens, onChunk) {
  let currentMessages = messages;

  while (true) {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools,
      messages: currentMessages,
    });

    // Stream text tokens to the caller in real time
    stream.on('text', (text) => {
      onChunk({ type: 'token', text });
    });

    const response = await stream.finalMessage();

    if (response.stop_reason !== 'tool_use') {
      return {
        updatedMessages: [...currentMessages, { role: 'assistant', content: response.content }],
      };
    }

    // Process tool calls
    const assistantMessage = { role: 'assistant', content: response.content };
    const toolResults = [];

    for (const block of response.content) {
      if (block.type !== 'tool_use') continue;

      if (TOOL_STATUS_MESSAGES[block.name]) {
        onChunk({ type: 'status', text: TOOL_STATUS_MESSAGES[block.name] });
      }

      let result;
      try {
        result = await executeToolCall(block, tokens);
      } catch (err) {
        result = JSON.stringify({ error: err.message });
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: result,
      });
    }

    currentMessages = [...currentMessages, assistantMessage, { role: 'user', content: toolResults }];
  }
}

module.exports = { streamAgentTurn };
