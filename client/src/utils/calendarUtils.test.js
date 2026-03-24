import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDateLabel, groupEventsByDate } from './calendarUtils.js';

test('groupEventsByDate groups timed and all-day events by date key', () => {
  const events = [
    {
      id: 'evt-1',
      start: { dateTime: '2026-03-24T14:00:00.000Z' },
    },
    {
      id: 'evt-2',
      start: { dateTime: '2026-03-24T16:00:00.000Z' },
    },
    {
      id: 'evt-3',
      start: { date: '2026-03-25' },
    },
  ];

  const grouped = groupEventsByDate(events);

  assert.equal(grouped[new Date('2026-03-24T14:00:00.000Z').toDateString()].length, 2);
  assert.equal(grouped['2026-03-25'].length, 1);
});

test('formatDateLabel returns Today and Tomorrow relative to a reference date', () => {
  const referenceDate = new Date('2026-03-24T09:00:00.000Z');

  assert.equal(formatDateLabel('2026-03-24T14:00:00.000Z', referenceDate), 'Today');
  assert.equal(formatDateLabel('2026-03-25T14:00:00.000Z', referenceDate), 'Tomorrow');
});

test('formatDateLabel returns a weekday label for later dates', () => {
  const referenceDate = new Date('2026-03-24T09:00:00.000Z');

  assert.equal(
    formatDateLabel('2026-03-27T14:00:00.000Z', referenceDate),
    'Friday, Mar 27'
  );
});
