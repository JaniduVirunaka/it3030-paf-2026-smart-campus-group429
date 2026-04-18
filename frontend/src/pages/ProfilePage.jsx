import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/profileApi';

export default function ProfilePage() {
  const [profile, setProfile] = useState({ displayName: '', registrationNumber: '', phone: '', email: '' });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  useEffect(() => {
    getProfile()
      .then(p => setProfile({
        email:              p.email ?? '',
        displayName:        p.displayName ?? '',
        registrationNumber: p.registrationNumber ?? '',
        phone:              p.phone ?? '',
      }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleChange = e =>
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (profile.phone && !/^\d{10}$/.test(profile.phone)) {
      setToast({ type: 'error', message: 'Phone must be exactly 10 digits.' });
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        displayName:        profile.displayName,
        registrationNumber: profile.registrationNumber,
        phone:              profile.phone,
      });
      setToast({ type: 'success', message: 'Profile saved successfully.' });
    } catch {
      setToast({ type: 'error', message: 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
          ${toast.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">👤 My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Your details are used to pre-fill booking forms.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-200 dark:border-slate-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={profile.email} readOnly
                className={`${inputClass} opacity-60 cursor-not-allowed`} />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed here.</p>
            </div>
            <div>
              <label className={labelClass}>Display Name</label>
              <input type="text" name="displayName" value={profile.displayName}
                onChange={handleChange} placeholder="e.g. John Silva"
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Registration No.</label>
              <input type="text" name="registrationNumber" value={profile.registrationNumber}
                onChange={handleChange} placeholder="e.g. IT12345678 or EMP1234"
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input type="tel" name="phone" value={profile.phone}
                onChange={handleChange} placeholder="e.g. 0712345678"
                pattern="\d{10}" title="10 digit phone number"
                className={inputClass} />
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors">
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
