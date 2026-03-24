import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AppContext = createContext(null);

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function AppProvider({ children, API }) {
  const [authenticated, setAuthenticated] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);
  const cachedAtRef = useRef(null);

  // Auth check on mount
  useEffect(() => {
    axios.get(`${API}/auth/status`)
      .then(r => setAuthenticated(r.data.authenticated))
      .catch(() => setAuthenticated(false));
  }, [API]);

  const fetchEvents = useCallback(async (force = false) => {
    const isStale = !cachedAtRef.current || Date.now() - cachedAtRef.current > CACHE_TTL_MS;
    if (!force && !isStale) return;

    setEventsLoading(true);
    setEventsError(null);
    try {
      const { data } = await axios.get(`${API}/calendar/events`);
      setEvents(data);
      cachedAtRef.current = Date.now();
    } catch {
      setEventsError('Failed to load calendar events. Please refresh to try again.');
    } finally {
      setEventsLoading(false);
    }
  }, [API]);

  // Fetch events immediately once authenticated
  useEffect(() => {
    if (authenticated) fetchEvents();
  }, [authenticated, fetchEvents]);

  return (
    <AppContext.Provider value={{
      API,
      authenticated,
      setAuthenticated,
      events,
      eventsLoading,
      eventsError,
      fetchEvents,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
