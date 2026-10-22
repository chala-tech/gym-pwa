import { CheckCircle2, Clock, AlertCircle, Phone, Calendar } from 'lucide-react';
import { getMembershipStatus, formatExpiry, formatDate } from '../lib/dateUtils';

const statusConfig = {
  active: {
    label: 'Active',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    dot: 'bg-emerald-400',
    icon: CheckCircle2,
    cardBorder: 'border-emerald-500/20',
    bar: 'from-emerald-500 to-teal-400',
  },
  expiring: {
    label: 'Expiring Soon',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    dot: 'bg-amber-400',
    icon: Clock,
    cardBorder: 'border-amber-500/20',
    bar: 'from-amber-500 to-orange-400',
  },
  expired: {
    label: 'Expired',
    badge: 'bg-red-500/15 text-red-400 border-red-500/25',
    dot: 'bg-red-500',
    icon: AlertCircle,
    cardBorder: 'border-red-500/20',
    bar: 'from-red-500 to-rose-400',
  },
};

export default function MemberCard({ member, onSelect }) {
  const status = getMembershipStatus(member.expirationDate);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <article
      onClick={() => onSelect(member)}
      className={`relative bg-[#1e293b] rounded-2xl border ${config.cardBorder} overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5 cursor-pointer active:scale-[0.98]`}
      aria-label={`View details for ${member.fullName}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(member)}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${config.bar}`} />

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
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium flex-shrink-0 ${config.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} flex-shrink-0`} />
            {config.label}
          </div>
        </div>

        {/* Expiry + joined */}
        <div className="flex items-center gap-1.5 mt-3 px-1">
          <Calendar size={12} className="text-slate-500 flex-shrink-0" />
          <span className="text-slate-400 text-xs">{formatExpiry(member.expirationDate)}</span>
          <span className="text-slate-600 text-xs mx-1">·</span>
          <span className="text-slate-500 text-xs">Joined {formatDate(member.joinDate)}</span>
        </div>

        {/* Tap hint */}
        <p className="text-[10px] text-slate-600 mt-2.5 px-1 font-medium">Tap to view details & renew →</p>
      </div>
    </article>
  );
}
