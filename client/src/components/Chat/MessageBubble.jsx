import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MessageBubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
          isUser
            ? 'text-white rounded-br-sm'
            : 'bg-[#161b22] text-slate-200 border border-white/[0.08] rounded-bl-sm'
        }`}
        style={isUser ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{text}</span>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ node, ...props }) => (
                <table className="border-collapse w-full my-2" {...props} />
              ),
              thead: ({ node, ...props }) => (
                <thead className="bg-white/10" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th className="border border-white/20 px-3 py-1.5 text-left font-semibold" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-white/20 px-3 py-1.5" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-bold text-white" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-base font-bold text-white mt-3 mb-1" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-sm font-bold text-white mt-2 mb-1" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside space-y-1 my-1" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside space-y-1 my-1" {...props} />
              ),
              hr: ({ node, ...props }) => (
                <hr className="border-white/20 my-2" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="mb-1 last:mb-0" {...props} />
              ),
            }}
          >
            {text}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
