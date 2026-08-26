import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters')
    .regex(/^[a-z0-9-_]+$/, 'Lowercase alphanumeric, hyphens, and underscores only'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Helper for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const { login } = useAuth(); // If we auto-login after register
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange"
  });

  const username = watch('username');
  const password = watch('password') || '';
  const debouncedUsername = useDebounce(username, 500);
  
  const [usernameStatus, setUsernameStatus] = useState('idle'); // 'idle' | 'loading' | 'available' | 'taken'

  // Password Security Meter
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Weak', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) score++;

    switch (score) {
      case 0:
      case 1: return { score, label: 'Weak', color: 'bg-red-500' };
      case 2: return { score, label: 'Fair', color: 'bg-yellow-500' };
      case 3: return { score, label: 'Good', color: 'bg-blue-500' };
      case 4: return { score, label: 'Strong', color: 'bg-emerald-500' };
      default: return { score: 0, label: 'Weak', color: 'bg-slate-700' };
    }
  };

  const strength = getPasswordStrength(password);

  useEffect(() => {
    if (debouncedUsername && debouncedUsername.length >= 3 && !errors.username) {
      const checkUsername = async () => {
        setUsernameStatus('loading');
        try {
          const isAvailable = await authService.checkUsernameAvailability(debouncedUsername);
          setUsernameStatus(isAvailable ? 'available' : 'taken');
        } catch (e) {
          setUsernameStatus('idle');
        }
      };
      checkUsername();
    } else {
      setUsernameStatus('idle');
    }
  }, [debouncedUsername, errors.username]);

  const onSubmit = async (data) => {
    if (usernameStatus === 'taken') {
      toast.error('Please choose an available username');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.register(data);
      // Auto-login (if supported/mocked)
      await login(data.email, data.password).catch(() => {});
      toast.success('Account created successfully');
      navigate('/onboarding');
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col gap-4 ${shake ? 'animate-shake' : ''}`}>
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
        <input
          {...register('fullName')}
          className={`w-full bg-black/20 border ${errors.fullName ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
          placeholder="Ada Lovelace"
        />
        {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
        <div className="relative">
          <input
            {...register('username')}
            className={`w-full bg-black/20 border ${errors.username || usernameStatus === 'taken' ? 'border-red-500' : usernameStatus === 'available' ? 'border-emerald-500' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
            placeholder="ada-lovelace"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {usernameStatus === 'loading' && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
            {usernameStatus === 'available' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {usernameStatus === 'taken' && <XCircle className="w-4 h-4 text-red-500" />}
          </div>
        </div>
        {errors.username ? (
          <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>
        ) : usernameStatus === 'taken' ? (
          <p className="text-red-400 text-xs mt-1">✗ Username taken</p>
        ) : usernameStatus === 'available' ? (
          <p className="text-emerald-400 text-xs mt-1">✓ Available</p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
        <input
          {...register('email')}
          type="email"
          className={`w-full bg-black/20 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
          placeholder="ada@example.com"
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            className={`w-full bg-black/20 border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
            placeholder="••••••••"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Password Meter */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 flex gap-1 h-1">
            {[1, 2, 3, 4].map((level) => (
              <div 
                key={level} 
                className={`flex-1 rounded-full transition-colors duration-300 ${strength.score >= level ? strength.color : 'bg-slate-700'}`} 
              />
            ))}
          </div>
          <span className={`text-[10px] uppercase tracking-wider font-semibold ${strength.score > 0 ? strength.color.replace('bg-', 'text-') : 'text-slate-500'}`}>
            {strength.label}
          </span>
        </div>
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
        <input
          {...register('confirmPassword')}
          type={showPassword ? 'text' : 'password'}
          className={`w-full bg-black/20 border ${errors.confirmPassword ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
          placeholder="••••••••"
        />
        {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || usernameStatus === 'loading'}
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl py-3 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0A0F1D] disabled:opacity-70 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-500/20"
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
      </button>

    </form>
  );
}
