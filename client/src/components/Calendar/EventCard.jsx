export default function EventCard({ event }) {
  const start = event.start?.dateTime
    ? new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'All day';
  const end = event.end?.dateTime
    ? new Date(event.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="group flex gap-3 bg-[#161b22] border border-white/[0.08] rounded-xl px-4 py-3 hover:bg-[#1c2128] hover:border-white/[0.14] transition-all duration-150">
      {/* Color stripe */}
      <div className="w-0.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500 shrink-0 self-stretch" />

      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{event.summary || 'Untitled'}</p>
        <div className="flex items-center gap-2 mt-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p className="text-slate-500 text-xs">{start}{end ? ` — ${end}` : ''}</p>
        </div>
        {event.attendees && (
          <div className="flex items-center gap-2 mt-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="text-slate-600 text-xs">{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
}
