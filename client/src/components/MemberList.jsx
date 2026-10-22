import { Users, AlertCircle, RefreshCw } from 'lucide-react';
import MemberCard from './MemberCard';

function SkeletonCard() {
  return (
    <div className="bg-[#1e293b] rounded-2xl border border-white/5 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-white/5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/5 rounded-lg w-3/4" />
          <div className="h-3 bg-white/5 rounded-lg w-1/2" />
        </div>
        <div className="h-6 w-20 bg-white/5 rounded-full" />
      </div>
      <div className="mt-3 h-3 bg-white/5 rounded-lg w-2/3 mx-1" />
    </div>
  );
}

function EmptyState({ searchQuery }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-5">
        <Users size={34} className="text-indigo-400" />
      </div>
      {searchQuery ? (
        <>
          <h3 className="text-lg font-semibold text-white mb-2">No members found</h3>
          <p className="text-slate-400 text-sm max-w-xs">
            No results for <span className="text-white font-medium">"{searchQuery}"</span>.
            Try a different name or phone number.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-white mb-2">No members yet</h3>
          <p className="text-slate-400 text-sm max-w-xs">
            Tap the <span className="text-indigo-400 font-medium">+</span> button below to register your first gym member.
          </p>
        </>
      )}
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
        <AlertCircle size={34} className="text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
      <p className="text-slate-400 text-sm mb-6 max-w-xs">{error}</p>
      <button
        onClick={onRetry}
        id="retry-load-members"
        className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
      >
        <RefreshCw size={15} />
        Try Again
      </button>
    </div>
  );
}

export default function MemberList({ members, loading, error, searchQuery, onSelect, onRetry }) {
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!members.length) {
    return <EmptyState searchQuery={searchQuery} />;
  }

  // Summary stats
  const active  = members.filter(m => new Date(m.expirationDate) > new Date()).length;
  const expired = members.length - active;

  return (
    <div>
      {/* Stats strip */}
      <div className="flex items-center gap-3 mb-4 px-0.5">
        <span className="text-slate-400 text-xs font-medium">
          {members.length} member{members.length !== 1 ? 's' : ''}
        </span>
        <span className="text-slate-700">·</span>
        <span className="text-xs text-emerald-400 font-medium">{active} active</span>
        {expired > 0 && (
          <>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-red-400 font-medium">{expired} expired</span>
          </>
        )}
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
