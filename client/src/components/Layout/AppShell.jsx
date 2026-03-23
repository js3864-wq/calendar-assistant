import { useState, useEffect } from 'react';
import CalendarView from '../Calendar/CalendarView';
import ChatPanel from '../Chat/ChatPanel';
import axios from 'axios';

export default function AppShell({ API }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/calendar/events`)
      .then(r => { setEvents(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="h-screen bg-[#0f0f0f] flex overflow-hidden">
      {/* Calendar Panel */}
      <div className="w-[60%] border-r border-white/10 overflow-y-auto p-6">
        <h2 className="text-white text-xl font-semibold mb-4 tracking-tight">Your Schedule</h2>
        {loading ? (
          <p className="text-gray-500">Loading events...</p>
        ) : (
          <CalendarView events={events} />
        )}
      </div>

      {/* Chat Panel */}
      <div className="w-[40%] flex flex-col">
        <ChatPanel API={API} />
      </div>
    </div>
  );
}
