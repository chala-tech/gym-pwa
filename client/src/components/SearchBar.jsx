import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative group">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none"
      />
      <input
        id="member-search"
        type="text"
        inputMode="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name or 09… / 07…"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className="w-full bg-[#1e293b] border border-white/10 rounded-2xl pl-11 pr-11 py-3.5 text-white placeholder-slate-500 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
        aria-label="Search members"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          id="clear-search"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
