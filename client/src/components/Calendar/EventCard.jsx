export default function EventCard({ event }) {
  const start = event.start?.dateTime
    ? new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'All day';
  const end = event.end?.dateTime
    ? new Date(event.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 hover:bg-white/[0.08] transition-colors">
      <p className="text-white font-medium text-sm">{event.summary || 'Untitled'}</p>
      <p className="text-gray-400 text-xs mt-1">{start}{end ? ` — ${end}` : ''}</p>
      {event.attendees && (
        <p className="text-gray-500 text-xs mt-1">{event.attendees.length} attendees</p>
      )}
    </div>
  );
}
