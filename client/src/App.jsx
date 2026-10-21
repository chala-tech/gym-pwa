import { useState } from 'react';
import { Dumbbell, Wifi, WifiOff } from 'lucide-react';
import SearchBar from './components/SearchBar';
import MemberList from './components/MemberList';
import AddMemberModal from './components/AddMemberModal';
import FAB from './components/FAB';
import { useMembers } from './hooks/useMembers';

function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  window.addEventListener('online', () => setOnline(true));
  window.addEventListener('offline', () => setOnline(false));
  return online;
}

export default function App() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { members, loading, error, searchQuery, setSearchQuery, refresh } = useMembers();
  const online = useOnlineStatus();

  return (
    <div className="min-h-dvh bg-[#0f172a] flex flex-col max-w-lg mx-auto">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5">
        {/* Offline banner */}
        {!online && (
          <div className="flex items-center justify-center gap-2 bg-amber-500/20 border-b border-amber-500/30 text-amber-300 text-xs font-medium py-2 px-4">
            <WifiOff size={13} />
            You're offline — data may be outdated
          </div>
        )}

        <div className="px-4 pt-5 pb-4">
          {/* Brand */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
                <Dumbbell size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight tracking-tight">
                  IronCore
                </h1>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                  Gym Management
                </p>
              </div>
            </div>

            {/* Online dot */}
            <div className="flex items-center gap-1.5">
              {online ? (
                <Wifi size={14} className="text-emerald-400" />
              ) : (
                <WifiOff size={14} className="text-amber-400" />
              )}
              <span className={`text-xs font-medium ${online ? 'text-emerald-400' : 'text-amber-400'}`}>
                {online ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Search */}
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 px-4 pt-4 pb-28">
        <MemberList
          members={members}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
          onUpdate={refresh}
          onRetry={refresh}
        />
      </main>

      {/* ── FAB ── */}
      <FAB onClick={() => setShowAddModal(true)} />

      {/* ── Add Member Modal ── */}
      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
