import { Plus } from 'lucide-react';

export default function FAB({ onClick }) {
  return (
    <button
      id="open-add-member-fab"
      onClick={onClick}
      aria-label="Register new member"
      className="fixed bottom-6 right-5 z-40 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-900/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-xl hover:shadow-indigo-900/60 group"
    >
      <Plus
        size={26}
        strokeWidth={2.5}
        className="transition-transform duration-200 group-hover:rotate-90"
      />

      {/* Ripple ring on hover */}
      <span className="absolute inset-0 rounded-2xl border-2 border-indigo-400/50 scale-0 group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300" />
    </button>
  );
}
