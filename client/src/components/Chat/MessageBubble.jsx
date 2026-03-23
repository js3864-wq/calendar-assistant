export default function MessageBubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-4 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white/[0.08] text-gray-100 border border-white/10 rounded-bl-sm'
        }`}
      >
        {text}
      </div>
    </div>
  );
}
