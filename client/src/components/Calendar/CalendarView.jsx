import EventCard from './EventCard';
import { formatDateLabel, groupEventsByDate } from '../../utils/calendarUtils';

export default function CalendarView({ events }) {
  const grouped = groupEventsByDate(events);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <p className="text-slate-500 text-sm">No upcoming events found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(grouped).map(([date, dayEvents]) => (
        <div key={date}>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              {formatDateLabel(date)}
            </span>
            <span className="text-slate-700 text-xs">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex flex-col gap-2">
            {dayEvents.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
