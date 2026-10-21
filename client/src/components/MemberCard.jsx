import { useState } from 'react';
import { Phone, Calendar, CheckCircle2, Clock, AlertCircle, Loader2, RotateCcw, Dumbbell } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMembershipStatus, formatExpiry, formatDate } from '../lib/dateUtils';
import { checkIn, renewMember } from '../lib/api';

const statusConfig = {
  active: {
    label: 'Active',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    dot: 'bg-emerald-400',
    icon: CheckCircle2,
    cardBorder: 'border-emerald-500/20',
  },
  expiring: {
    label: 'Expiring Soon',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    dot: 'bg-amber-400',
    icon: Clock,
    cardBorder: 'border-amber-500/20',
  },
  expired: {
    label: 'Expired',
    badge: 'bg-red-500/15 text-red-400 border-red-500/25',
    dot: 'bg-red-500',
    icon: AlertCircle,
    cardBorder: 'border-red-500/20',
  },
};

export default function MemberCard({ member, onUpdate }) {
  const [checkingIn, setCheckingIn] = useState(false);
  const [renewing, setRenewing] = useState(false);

  const status = getMembershipStatus(member.expirationDate);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const handleCheckIn = async () => {
    if (checkingIn) return;
    setCheckingIn(true);
    try {
      await checkIn(member.id);
      toast.success(`✅ ${member.fullName} checked in!`);
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleRenew = async () => {
    if (renewing) return;
    setRenewing(true);
    try {
      await renewMember(member.id);
      toast.success(`🔄 Membership renewed for ${member.fullName}!`);
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Renewal failed');
    } finally {
      setRenewing(false);
    }
  };

  return (
    <article
      className={`relative bg-[#1e293b] rounded-2xl border ${config.cardBorder} overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5`}
      aria-label={`Member: ${member.fullName}`}
    >
      {/* Top accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 ${
          status === 'active'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
            : status === 'expiring'
            ? 'bg-gradient-to-r from-amber-500 to-orange-400'
            : 'bg-gradient-to-r from-red-500 to-rose-400'
        }`}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-300 font-bold text-base leading-none">
                {member.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm leading-tight truncate">
                {member.fullName}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Phone size={11} className="text-slate-500 flex-shrink-0" />
                <span className="text-slate-400 text-xs truncate">{member.phoneNumber}</span>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium flex-shrink-0 ${config.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} flex-shrink-0`} />
            {config.label}
          </div>
        </div>

        {/* Expiry info */}
        <div className="flex items-center gap-1.5 mt-3 px-1">
          <Calendar size={12} className="text-slate-500 flex-shrink-0" />
          <span className="text-slate-400 text-xs">{formatExpiry(member.expirationDate)}</span>
          <span className="text-slate-600 text-xs mx-1">·</span>
          <span className="text-slate-500 text-xs">Joined {formatDate(member.joinDate)}</span>
        </div>

        {/* Check-in count */}
        {member._count?.checkIns !== undefined && (
          <div className="flex items-center gap-1.5 mt-1 px-1">
            <Dumbbell size={12} className="text-slate-500 flex-shrink-0" />
            <span className="text-slate-500 text-xs">{member._count.checkIns} check-in{member._count.checkIns !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2.5 mt-4">
          <button
            id={`checkin-btn-${member.id}`}
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 rounded-xl transition-all duration-150 active:scale-[0.97]"
            aria-label={`Check in ${member.fullName}`}
          >
            {checkingIn ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle2 size={14} />
            )}
            {checkingIn ? 'Logging...' : 'Check In'}
          </button>

          <button
            id={`renew-btn-${member.id}`}
            onClick={handleRenew}
            disabled={renewing}
            className="flex items-center justify-center gap-2 bg-white/8 hover:bg-white/14 disabled:opacity-60 disabled:cursor-not-allowed text-slate-300 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 border border-white/10 active:scale-[0.97]"
            aria-label={`Renew ${member.fullName}'s membership`}
          >
            {renewing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RotateCcw size={14} />
            )}
            {renewing ? '...' : 'Renew'}
          </button>
        </div>
      </div>
    </article>
  );
}
