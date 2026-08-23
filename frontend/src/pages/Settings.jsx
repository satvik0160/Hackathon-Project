import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { Moon, Sun, Monitor, Bell, Shield, Key, Download, Info } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme, isDark } = useTheme();
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-2 gap-6 mt-6">
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="card-header flex items-center gap-2 mb-4">
            <Monitor className="text-primary w-5 h-5" />
            <h2 className="card-title">Appearance</h2>
          </div>
          <div className="flex gap-4">
            <button 
              className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center gap-2 ${!isDark ? 'border-primary bg-primary/5' : 'border-neutral-200 dark:border-neutral-800'}`}
              onClick={() => isDark && toggleTheme()}
            >
              <Sun className="w-6 h-6" />
              <span>Light Mode</span>
            </button>
            <button 
              className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center gap-2 ${isDark ? 'border-primary bg-primary/5' : 'border-neutral-200 dark:border-neutral-800'}`}
              onClick={() => !isDark && toggleTheme()}
            >
              <Moon className="w-6 h-6" />
              <span>Dark Mode</span>
            </button>
          </div>
        </motion.div>

        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="card-header flex items-center gap-2 mb-4">
            <Bell className="text-primary w-5 h-5" />
            <h2 className="card-title">Notifications</h2>
          </div>
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span>Email Notifications</span>
              <input type="checkbox" checked={notifications.email} onChange={() => handleNotificationChange('email')} className="form-input w-5 h-5" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Streak Reminders</span>
              <input type="checkbox" checked={notifications.streak} onChange={() => handleNotificationChange('streak')} className="form-input w-5 h-5" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Job Alerts</span>
              <input type="checkbox" checked={notifications.jobAlerts} onChange={() => handleNotificationChange('jobAlerts')} className="form-input w-5 h-5" />
            </label>
          </div>
        </motion.div>

        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="card-header flex items-center gap-2 mb-4">
            <Key className="text-primary w-5 h-5" />
            <h2 className="card-title">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input 
                type="password" 
                className="form-input w-full"
                value={passwords.current}
                onChange={e => setPasswords({...passwords, current: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input 
                type="password" 
                className="form-input w-full"
                value={passwords.new}
                onChange={e => setPasswords({...passwords, new: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password" 
                className="form-input w-full"
                value={passwords.confirm}
                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-primary mt-2">Update Password</button>
          </form>
        </motion.div>

        <motion.div 
          className="card flex flex-col gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div>
            <div className="card-header flex items-center gap-2 mb-4">
              <Shield className="text-primary w-5 h-5" />
              <h2 className="card-title">Privacy</h2>
            </div>
            <div className="flex flex-col gap-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Public Profile Visibility</span>
                <input type="checkbox" defaultChecked className="form-input w-5 h-5" onChange={() => toast.success('Privacy settings updated')} />
              </label>
              <button className="btn btn-outline flex items-center gap-2 mt-2" onClick={() => toast.success('Data export started')}>
                <Download className="w-4 h-4" /> Export My Data
              </button>
            </div>
          </div>
          
          <div>
            <div className="card-header flex items-center gap-2 mb-4">
              <Info className="text-primary w-5 h-5" />
              <h2 className="card-title">About</h2>
            </div>
            <div className="text-sm text-muted">
              <p>SkillMaster Pro Version 2.0</p>
              <p>Built with React, Vite, Framer Motion</p>
              <p>© 2026 SkillMaster Inc.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
