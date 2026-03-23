import EventCard from './EventCard';

function groupByDate(events) {
  return events.reduce((acc, event) => {
    const date = event.start?.dateTime
      ? new Date(event.start.dateTime).toDateString()
      : event.start?.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});
}

export default function CalendarView({ events }) {
  const grouped = groupByDate(events);

  if (events.length === 0) {
    return <p className="text-gray-500">No upcoming events found.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(grouped).map(([date, dayEvents]) => (
        <div key={date}>
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-2">{date}</p>
          <div className="flex flex-col gap-2">
            {dayEvents.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
