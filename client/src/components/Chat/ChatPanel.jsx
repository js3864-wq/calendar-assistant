import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import SuggestedPrompts from './SuggestedPrompts';
import axios from 'axios';

const SUGGESTED = [
  "How much time am I spending in meetings this week?",
  "I need to schedule meetings with Joe, Dan, and Sally — I want to keep my mornings free. Can you draft emails for each?",
  "What does my schedule look like tomorrow?",
  "Recommend ways I can reduce meeting load.",
];

export default function ChatPanel({ API }) {
  const [messages, setMessages] = useState([]); // { role, content } array for Claude
  const [displayMessages, setDisplayMessages] = useState([]); // { role, text } for UI
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setDisplayMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/chat/message`, { messages: newMessages });
      setMessages(data.updatedMessages);
      setDisplayMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch {
      setDisplayMessages(prev => [...prev, { role: 'assistant', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <p className="text-white font-semibold text-sm tracking-tight">AI Assistant</p>
        <p className="text-gray-500 text-xs">Ask about your schedule</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {displayMessages.length === 0 && (
          <SuggestedPrompts prompts={SUGGESTED} onSelect={sendMessage} />
        )}
        {displayMessages.map((m, i) => <MessageBubble key={i} role={m.role} text={m.text} />)}
        {loading && (
          <div className="text-gray-500 text-sm animate-pulse">Thinking...</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-white/10 flex gap-2">
        <input
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
          placeholder="Ask about your schedule..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-40 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
