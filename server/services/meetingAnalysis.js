function getEventDurationMinutes(event) {
  const start = new Date(event.start?.dateTime || event.start?.date);
  const end = new Date(event.end?.dateTime || event.end?.date);
  return (end - start) / 60000;
}

function isMeeting(event) {
  return Array.isArray(event.attendees) && event.attendees.length > 1;
}

function analyzeMeetingLoad(events, weeks = 2) {
  const normalizedWeeks = weeks > 0 ? weeks : 1;
  const meetings = events.filter(isMeeting);
  const totalMinutes = meetings.reduce((acc, event) => acc + getEventDurationMinutes(event), 0);
  const totalHours = totalMinutes / 60;

  return {
    totalMeetings: meetings.length,
    totalHours: totalHours.toFixed(1),
    hoursPerWeek: (totalHours / normalizedWeeks).toFixed(1),
    percentOfWorkday: ((totalHours / (normalizedWeeks * 5 * 8)) * 100).toFixed(1),
  };
}

module.exports = { analyzeMeetingLoad };
