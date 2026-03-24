const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeMeetingLoad } = require('./meetingAnalysis');

test('analyzeMeetingLoad counts only events with multiple attendees', () => {
  const events = [
    {
      start: { dateTime: '2026-03-24T14:00:00.000Z' },
      end: { dateTime: '2026-03-24T15:00:00.000Z' },
      attendees: [{ email: 'a@example.com' }, { email: 'b@example.com' }],
    },
    {
      start: { dateTime: '2026-03-25T14:00:00.000Z' },
      end: { dateTime: '2026-03-25T15:30:00.000Z' },
      attendees: [{ email: 'solo@example.com' }],
    },
  ];

  const result = analyzeMeetingLoad(events, 2);

  assert.deepEqual(result, {
    totalMeetings: 1,
    totalHours: '1.0',
    hoursPerWeek: '0.5',
    percentOfWorkday: '1.3',
  });
});

test('analyzeMeetingLoad aggregates meeting duration across multiple weeks', () => {
  const events = [
    {
      start: { dateTime: '2026-03-24T14:00:00.000Z' },
      end: { dateTime: '2026-03-24T15:30:00.000Z' },
      attendees: [{}, {}],
    },
    {
      start: { dateTime: '2026-03-26T16:00:00.000Z' },
      end: { dateTime: '2026-03-26T17:00:00.000Z' },
      attendees: [{}, {}, {}],
    },
  ];

  const result = analyzeMeetingLoad(events, 2);

  assert.deepEqual(result, {
    totalMeetings: 2,
    totalHours: '2.5',
    hoursPerWeek: '1.3',
    percentOfWorkday: '3.1',
  });
});
