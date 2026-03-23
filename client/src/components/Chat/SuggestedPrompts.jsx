export default function SuggestedPrompts({ prompts, onSelect }) {
  return (
    <div className="flex flex-col gap-2 mt-4">
      <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Try asking</p>
      {prompts.map((p, i) => (
        <button
          key={i}
          onClick={() => onSelect(p)}
          className="text-left text-gray-300 text-sm px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 hover:text-white transition-colors"
        >
          {p}
        </button>
      ))}
    </div>
  );
}
