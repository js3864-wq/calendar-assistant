const { google } = require('googleapis');

const CALENDAR_TIMEOUT_MS = 10000; // 10 seconds

function getCalendarClient(tokens) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials(tokens);
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

async function getEventsForRange(tokens, timeMin, timeMax) {
  const calendar = getCalendarClient(tokens);

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Google Calendar request timed out')), CALENDAR_TIMEOUT_MS)
  );

  const fetchPromise = calendar.events.list({
    calendarId: 'primary',
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 100,
  });

  const response = await Promise.race([fetchPromise, timeoutPromise]);
  return response.data.items;
}

async function getTwoWeekEvents(tokens) {
  const now = new Date();
  const twoWeeksOut = new Date();
  twoWeeksOut.setDate(now.getDate() + 14);
  return getEventsForRange(tokens, now.toISOString(), twoWeeksOut.toISOString());
}

module.exports = { getEventsForRange, getTwoWeekEvents };
