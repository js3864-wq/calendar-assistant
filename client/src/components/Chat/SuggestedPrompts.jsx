export default function SuggestedPrompts({ prompts, onSelect }) {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex items-center gap-2 mb-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <p className="text-slate-500 text-xs uppercase tracking-widest font-medium">Try asking</p>
      </div>
      {prompts.map((p, i) => (
        <button
          key={i}
          onClick={() => onSelect(p)}
          className="text-left text-slate-300 text-sm px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-[#161b22] hover:bg-[#1c2128] hover:border-indigo-500/30 hover:text-white transition-all duration-150"
        >
          {p}
        </button>
      ))}
    </div>
  );
}
