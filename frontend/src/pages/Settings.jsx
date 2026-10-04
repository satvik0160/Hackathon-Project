import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, Shield, Key, Download, Info, Loader } from 'lucide-react';
import { TiltCard } from '../components/common/TiltCard';
import { useAuth } from '../contexts/AuthContext';
import { authService, assessmentService, jobService } from '../services/api';

const Settings = () => {
  const { user, updateProfile } = useAuth();

  const meta = user || {};
  const [notifications, setNotifications] = useState({
    email: meta.notify_email ?? true,
    streak: meta.notify_streak ?? true,
    jobAlerts: meta.notify_job_alerts ?? false,
  });
  const [publicProfile, setPublicProfile] = useState(meta.public_profile ?? true);

  const [soundEffects, setSoundEffects] = useState(() => {
    return localStorage.getItem('devastra_sound_enabled') === 'true';
  });

  const [sendingReset, setSendingReset] = useState(false);
  const [exporting, setExporting] = useState(false);

  const persistPrefs = async (patch) => {
    try {
      await updateProfile(patch);
    } catch (err) {
      console.error('[Settings] failed to persist preference', err);
      toast.error('Could not save your preference');
    }
  };

  const handleNotificationChange = (key) => {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    persistPrefs({
      notify_email: next.email,
      notify_streak: next.streak,
      notify_job_alerts: next.jobAlerts,
    });
  };

  const handleSoundChange = () => {
    const newVal = !soundEffects;
    setSoundEffects(newVal);
    localStorage.setItem('devastra_sound_enabled', String(newVal));
  };

  const handlePublicProfileChange = () => {
    const next = !publicProfile;
    setPublicProfile(next);
    persistPrefs({ public_profile: next });
    toast.success(next ? 'Profile is now public' : 'Profile is now private');
  };

  // The SDK exposes no authenticated password-change endpoint; the supported
  // flow is to email a reset link/code via sendResetPasswordEmail(). SMTP must
  // be enabled on the project for the mail to actually be delivered.
  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast.error('No email on file for this account');
      return;
    }
    try {
      setSendingReset(true);
      await authService.resetPassword(user.email);
      toast.success('Password reset email sent. Check your inbox.');
    } catch (err) {
      console.error('[Settings] password reset failed', err);
      toast.error(err?.message || 'Could not send reset email');
    } finally {
      setSendingReset(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      const [historyRes, applicationsRes] = await Promise.all([
        assessmentService.getHistory().catch(() => ({ data: [] })),
        jobService.getApplications().catch(() => ({ data: { applications: [] } })),
      ]);

      const payload = {
        exported_at: new Date().toISOString(),
        profile: {
          id: user?.id,
          email: user?.email,
          full_name: user?.full_name,
          username: user?.username,
          role: user?.role,
          bio: user?.bio,
          skills: user?.skills,
          interests: user?.interests,
          total_points: user?.total_points,
          skill_level: user?.skill_level,
          streak_count: user?.streak_count,
        },
        assessments: historyRes.data || [],
        job_applications: applicationsRes.data?.applications || [],
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devastra-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Your data has been exported');
    } catch (err) {
      console.error('[Settings] export failed', err);
      toast.error('Failed to export your data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-container p-6">
      <div className="page-header mb-6">
        <h1 className="text-3xl font-extrabold shimmer-title">Preferences</h1>
        <p className="text-slate-500 font-medium">Manage your animated experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TiltCard tiltMax={3} className="card p-6 bg-white/70">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <Bell className="text-blue-600 w-6 h-6 animate-float" />
            <h2 className="text-xl font-bold">Preferences</h2>
          </div>
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-between cursor-pointer group bg-[#f8faff] p-3 rounded-xl border border-slate-100 hover:border-sky-200 transition-colors">
              <span className="font-semibold text-slate-700">UI Sound Effects</span>
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={handleSoundChange}
                className="w-5 h-5 accent-blue-600 transition-transform group-hover:scale-110"
              />
            </label>
            {['email', 'streak', 'jobAlerts'].map(key => (
              <label key={key} className="flex items-center justify-between cursor-pointer group bg-[#f8faff] p-3 rounded-xl border border-slate-100 hover:border-sky-200 transition-colors">
                <span className="font-semibold text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={() => handleNotificationChange(key)}
                  className="w-5 h-5 accent-blue-600 transition-transform group-hover:scale-110"
                />
              </label>
            ))}
          </div>
        </TiltCard>

        <TiltCard tiltMax={3} className="card p-6 bg-white/70">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <Key className="text-blue-600 w-6 h-6 animate-float" />
            <h2 className="text-xl font-bold">Security</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Account Email</label>
              <input
                type="email"
                readOnly
                value={user?.email || ''}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium text-slate-500"
              />
            </div>
            <p className="text-sm text-slate-500">
              We&apos;ll email you a secure link to set a new password.
            </p>
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={sendingReset}
              className="mt-2 w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-sky-600 hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {sendingReset && <Loader className="w-4 h-4 animate-spin" />}
              Send Password Reset Email
            </button>
          </div>
        </TiltCard>

        <TiltCard tiltMax={3} className="card p-6 bg-white/70 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4 text-slate-800">
              <Shield className="text-blue-600 w-6 h-6 animate-float" />
              <h2 className="text-xl font-bold">Privacy</h2>
            </div>
            <div className="flex flex-col gap-4">
              <label className="flex items-center justify-between cursor-pointer group bg-[#f8faff] p-3 rounded-xl border border-slate-100 hover:border-sky-200 transition-colors">
                <span className="font-semibold text-slate-700">Public Profile</span>
                <input
                  type="checkbox"
                  checked={publicProfile}
                  className="w-5 h-5 accent-emerald-500 transition-transform group-hover:scale-110"
                  onChange={handlePublicProfileChange}
                />
              </label>
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-300 disabled:opacity-50"
              >
                {exporting ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                Export My Data
              </button>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-blue-50">
            <div className="text-sm text-slate-500 font-semibold space-y-1">
              <p className="flex items-center gap-1"><Info className="w-4 h-4"/> DevAstra Version 2.0</p>
              <p>Hyper-Animated Aurora Build</p>
            </div>
          </div>
        </TiltCard>
      </div>
    </div>
  );
};
export default Settings;
