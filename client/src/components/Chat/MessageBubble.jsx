export default function MessageBubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-4 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'text-white rounded-br-sm'
            : 'bg-[#161b22] text-slate-200 border border-white/[0.08] rounded-bl-sm'
        }`}
        style={isUser ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}
      >
        {text}
      </div>
    </div>
  );
}
