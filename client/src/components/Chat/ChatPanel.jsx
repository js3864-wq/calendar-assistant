import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import SuggestedPrompts from './SuggestedPrompts';
import { useApp } from '../../context/AppContext';

const SUGGESTED = [
  "How much time am I spending in meetings this week?",
  "I need to schedule meetings with Joe, Dan, and Sally — I want to keep my mornings free. Can you draft emails for each?",
  "What does my schedule look like tomorrow?",
  "Recommend ways I can reduce meeting load.",
];

export default function ChatPanel() {
  const { API } = useApp();
  const [messages, setMessages] = useState([]);
  const [displayMessages, setDisplayMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, loading]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setDisplayMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    setStatusText('');

    let streamedText = '';
    let addedPlaceholder = false;

    const addOrUpdateAssistantBubble = (t) => {
      if (!addedPlaceholder) {
        addedPlaceholder = true;
        setDisplayMessages(prev => [...prev, { role: 'assistant', text: t }]);
      } else {
        setDisplayMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', text: t };
          return updated;
        });
      }
    };

    try {
      const response = await fetch(`${API}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          let data;
          try {
            data = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (data.type === 'token') {
            streamedText += data.text;
            addOrUpdateAssistantBubble(streamedText);
            setStatusText('');
          } else if (data.type === 'status') {
            setStatusText(data.text);
          } else if (data.type === 'done') {
            setMessages(data.updatedMessages);
          } else if (data.type === 'error') {
            throw new Error(data.error);
          }
        }
      }

      // If no text came through at all, show a fallback
      if (!addedPlaceholder) {
        addOrUpdateAssistantBubble('Done.');
      }
    } catch (err) {
      const errorText = err.message?.includes('429')
        ? 'Too many requests. Please wait a moment before sending another message.'
        : 'Something went wrong. Please try again.';

      if (addedPlaceholder) {
        setDisplayMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', text: errorText };
          return updated;
        });
      } else {
        setDisplayMessages(prev => [...prev, { role: 'assistant', text: errorText }]);
      }
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.08] bg-[#161b22]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm tracking-tight">AI Assistant</p>
            <p className="text-slate-500 text-xs">Ask about your schedule</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {displayMessages.length === 0 && (
          <SuggestedPrompts prompts={SUGGESTED} onSelect={sendMessage} />
        )}
        {displayMessages.map((m, i) => <MessageBubble key={i} role={m.role} text={m.text} />)}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#161b22] border border-white/[0.08] rounded-xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center min-h-[38px]">
              {statusText ? (
                <span className="text-slate-400 text-xs">{statusText}</span>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </>
              )}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-white/[0.08] flex gap-2 bg-[#0d1117]">
        <input
          className="flex-1 bg-[#161b22] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-600 outline-none focus:border-indigo-500/60 focus:bg-[#1c2128] transition-all"
          placeholder="Ask about your schedule..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40 transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
