import { useState } from 'react';
import {
  X, User, Phone, Calendar, Clock, RotateCcw,
  CheckCircle2, AlertCircle, Loader2, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { renewMember, deleteMember } from '../lib/api';
import { formatDate, daysLeft, getMembershipStatus } from '../lib/dateUtils';

const DURATION_OPTIONS = [
  { label: '1 Month',  value: 1 },
  { label: '2 Months', value: 2 },
  { label: '3 Months', value: 3 },
  { label: '6 Months', value: 6 },
  { label: '1 Year',   value: 12 },
];

export default function MemberDetailModal({ member: initialMember, onClose, onUpdate }) {
  const [member, setMember]         = useState(initialMember);
  const [renewMonths, setRenewMonths] = useState(1);
  const [renewing, setRenewing]     = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const status  = getMembershipStatus(member.expirationDate);
  const days    = daysLeft(member.expirationDate);
  const expired = status === 'expired';

  const statusStyles = {
    active:   { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: CheckCircle2, bar: 'from-emerald-500 to-teal-400' },
    expiring: { badge: 'bg-amber-500/15  text-amber-400  border-amber-500/30',  icon: Clock,         bar: 'from-amber-500 to-orange-400' },
    expired:  { badge: 'bg-red-500/15    text-red-400    border-red-500/30',    icon: AlertCircle,   bar: 'from-red-500 to-rose-400' },
  };
  const { badge, icon: StatusIcon, bar } = statusStyles[status];

  const handleRenew = async () => {
    if (renewing) return;
    setRenewing(true);
    try {
      const { data } = await renewMember(member.id, renewMonths);
      setMember(data);
      toast.success(`✅ Renewed ${renewMonths} month${renewMonths > 1 ? 's' : ''} for ${member.fullName}!`);
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Renewal failed');
    } finally {
      setRenewing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await deleteMember(member.id);
      toast.success(`${member.fullName} removed.`);
      onUpdate?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Member details: ${member.fullName}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md animate-slide-up">
        <div className="bg-[#1e293b] rounded-t-3xl sm:rounded-2xl border border-white/10 shadow-2xl overflow-hidden">

          {/* Colour accent bar */}
          <div className={`h-1 w-full bg-gradient-to-r ${bar}`} />

          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-white/8">
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-300 font-black text-2xl leading-none">
                  {member.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-white leading-tight truncate">
                  {member.fullName}
                </h2>
                {/* Status badge */}
                <div className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${badge}`}>
                  <StatusIcon size={11} />
                  {status === 'active' ? 'Active' : status === 'expiring' ? 'Expiring Soon' : 'Expired'}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              id="close-member-detail"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 mt-1"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Info grid */}
          <div className="px-6 pt-5 pb-4 space-y-4">

            {/* Days left — hero number */}
            <div className={`rounded-2xl border p-4 text-center ${expired ? 'bg-red-500/8 border-red-500/20' : 'bg-indigo-500/8 border-indigo-500/20'}`}>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-1">
                {expired ? 'Expired' : 'Days Remaining'}
              </p>
              <p className={`text-5xl font-black leading-none ${expired ? 'text-red-400' : days <= 7 ? 'text-amber-400' : 'text-indigo-300'}`}>
                {expired ? Math.abs(days) : days}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {expired ? `days ago` : `days left`}
              </p>
            </div>

            {/* Detail rows */}
            <div className="space-y-3">
              <DetailRow icon={Phone} label="Phone Number" value={member.phoneNumber} />
              <DetailRow icon={Calendar} label="Date Registered" value={formatDate(member.joinDate)} />
              <DetailRow icon={Clock} label="Expiration Date" value={formatDate(member.expirationDate)} />
            </div>
          </div>

          {/* Renew section */}
          <div className="px-6 pb-4 border-t border-white/8 pt-4 space-y-3">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Renew Membership</p>

            {/* Duration pills */}
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRenewMonths(opt.value)}
                  id={`duration-${opt.value}`}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                    renewMonths === opt.value
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              id={`renew-member-${member.id}`}
              onClick={handleRenew}
              disabled={renewing}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] text-sm"
            >
              {renewing ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
              {renewing ? 'Renewing…' : `Renew · ${DURATION_OPTIONS.find(o => o.value === renewMonths)?.label}`}
            </button>
          </div>

          {/* Delete */}
          <div className="px-6 pb-6">
            <button
              id={`delete-member-${member.id}`}
              onClick={handleDelete}
              disabled={deleting}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                confirmDelete
                  ? 'bg-red-600 border-red-500 text-white hover:bg-red-500'
                  : 'bg-transparent border-white/10 text-red-400 hover:bg-red-500/10'
              }`}
            >
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              {deleting ? 'Removing…' : confirmDelete ? 'Tap again to confirm delete' : 'Remove Member'}
            </button>
          </div>
        </div>

        {/* Safe area padding for mobile */}
        <div className="h-safe-area-bottom bg-[#1e293b] sm:hidden" />
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-none mb-0.5">{label}</p>
        <p className="text-sm text-white font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
