import { useApp } from '../../context/AppContext';
import CalendarView from '../Calendar/CalendarView';
import ChatPanel from '../Chat/ChatPanel';

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
});

export default function AppShell() {
  const { events, eventsLoading, eventsError, fetchEvents } = useApp();

  return (
    <div className="h-screen bg-[#0d1117] flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/[0.08] bg-[#161b22] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">Calendar Assistant</span>
        </div>
        <span className="text-slate-500 text-xs">{today}</span>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar Panel */}
        <div className="w-[55%] border-r border-white/[0.08] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-lg font-semibold tracking-tight">Your Schedule</h2>
            {eventsLoading && (
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          {eventsError && !eventsLoading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <p className="text-red-400 text-sm">{eventsError}</p>
              <button
                onClick={() => fetchEvents(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}

          {!eventsLoading && !eventsError && <CalendarView events={events} />}
        </div>

        {/* Chat Panel */}
        <div className="w-[45%] flex flex-col">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}
