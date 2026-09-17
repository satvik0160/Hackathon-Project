import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { Monitor, Bell, Shield, Key, Download, Info } from 'lucide-react';
import { TiltCard } from '../components/common/TiltCard';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    streak: true,
    jobAlerts: false
  });
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification preferences updated');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password updated successfully');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const themes = [
    { id: 'pastel-dream', name: 'Pastel Dream', bg: 'bg-pink-100' },
    { id: 'sunset-bliss', name: 'Sunset Bliss', bg: 'bg-orange-100' },
    { id: 'mint-spring', name: 'Mint Spring', bg: 'bg-green-100' }
  ];

  return (
    <div className="page-container p-6">
      <div className="page-header mb-6">
        <h1 className="text-3xl font-extrabold shimmer-title">Preferences</h1>
        <p className="text-slate-500 font-medium">Manage your animated experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TiltCard tiltMax={3} className="card p-6 bg-white/70">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <Monitor className="text-blue-600 w-6 h-6 animate-float" />
            <h2 className="text-xl font-bold">Theme Selector</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            {themes.map(t => (
              <button 
                key={t.id}
                className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 font-bold transition-all
                  ${theme === t.id ? `border-blue-600 ${t.bg} shadow-lg ring-4 ring-sky-100 scale-105` : 'border-blue-50 hover:border-sky-300 hover:scale-105'}
                `}
                onClick={() => toggleTheme(t.id)}
              >
                <div className={`w-8 h-8 rounded-full ${t.bg} border-2 border-white shadow-sm`}></div>
                <span className="text-sm text-slate-700">{t.name}</span>
              </button>
            ))}
          </div>
        </TiltCard>

        <TiltCard tiltMax={3} className="card p-6 bg-white/70">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <Bell className="text-blue-600 w-6 h-6 animate-float" />
            <h2 className="text-xl font-bold">Notifications</h2>
          </div>
          <div className="flex flex-col gap-4">
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
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            {['current', 'new', 'confirm'].map(field => (
              <div className="form-group" key={field}>
                <label className="text-sm font-semibold text-slate-600 mb-1 block capitalize">{field} Password</label>
                <input 
                  type="password" 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-medium text-slate-900"
                  value={passwords[field]}
                  onChange={e => setPasswords({...passwords, [field]: e.target.value})}
                />
              </div>
            ))}
            <button type="submit" className="mt-2 w-full bg-white text-slate-800 font-bold py-3 rounded-xl hover:bg-sky-600 hover:shadow-lg hover:-translate-y-1 transition-all">
              Update Password
            </button>
          </form>
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
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500 transition-transform group-hover:scale-110" onChange={() => toast.success('Privacy updated')} />
              </label>
              <button className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-300" onClick={() => toast.success('Data export started')}>
                <Download className="w-5 h-5" /> Export My Data
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
