export function getEventDateKey(event) {
  return event.start?.dateTime
    ? new Date(event.start.dateTime).toDateString()
    : event.start?.date;
}

export function groupEventsByDate(events) {
  return events.reduce((acc, event) => {
    const date = getEventDateKey(event);
    if (!date) return acc;

    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});
}

export function formatDateLabel(dateStr, referenceDate = new Date()) {
  const date = new Date(dateStr);
  const today = new Date(referenceDate);
  const tomorrow = new Date(referenceDate);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}
