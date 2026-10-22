import { useState } from 'react';
import { X, User, Phone, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createMember } from '../lib/api';

const DURATION_OPTIONS = [
  { label: '1 Month',  value: 1 },
  { label: '2 Months', value: 2 },
  { label: '3 Months', value: 3 },
  { label: '6 Months', value: 6 },
  { label: '1 Year',   value: 12 },
];

export default function AddMemberModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', durationMonths: 1 });
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.phoneNumber.trim()) {
      errs.phoneNumber = 'Phone number is required';
    } else if (!/^(09|07)\d{8}$/.test(form.phoneNumber.trim())) {
      errs.phoneNumber = 'Enter a valid Ethiopian number (09xxxxxxxx or 07xxxxxxxx)';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await createMember({
        fullName:       form.fullName.trim(),
        phoneNumber:    form.phoneNumber.trim(),
        durationMonths: form.durationMonths,
      });
      toast.success(`${form.fullName.trim()} registered! 🎉`);
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create member';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    const value = field === 'durationMonths' ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((errs) => ({ ...errs, [field]: '' }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Register new member"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md animate-slide-up">
        <div className="bg-[#1e293b] rounded-t-3xl sm:rounded-2xl border border-white/10 shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white">New Member</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Membership starts today
              </p>
            </div>
            <button
              onClick={onClose}
              id="close-add-member-modal"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="fullName">
                Full Name
              </label>
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="fullName"
                  type="text"
                  autoFocus
                  autoComplete="name"
                  placeholder="Tesfaye Alemu"
                  value={form.fullName}
                  onChange={handleChange('fullName')}
                  className={`w-full bg-[#0f172a] border rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-500 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${errors.fullName ? 'border-red-500' : 'border-white/10'}`}
                />
              </div>
              {errors.fullName && <p className="text-red-400 text-xs mt-1.5">{errors.fullName}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="phoneNumber">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  placeholder="09... or 07..."
                  value={form.phoneNumber}
                  onChange={handleChange('phoneNumber')}
                  maxLength={10}
                  className={`w-full bg-[#0f172a] border rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-slate-500 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${errors.phoneNumber ? 'border-red-500' : 'border-white/10'}`}
                />
              </div>
              {errors.phoneNumber && <p className="text-red-400 text-xs mt-1.5">{errors.phoneNumber}</p>}
            </div>

            {/* Membership Duration */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  Membership Duration
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, durationMonths: opt.value }))}
                    id={`reg-duration-${opt.value}`}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                      form.durationMonths === opt.value
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              id="submit-add-member"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] text-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Registering…
                </>
              ) : (
                `Register · ${DURATION_OPTIONS.find(o => o.value === form.durationMonths)?.label}`
              )}
            </button>
          </form>
        </div>

        {/* Safe area padding for mobile */}
        <div className="h-safe-area-bottom bg-[#1e293b] sm:hidden" />
      </div>
    </div>
  );
}
