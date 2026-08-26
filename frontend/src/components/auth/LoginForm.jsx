import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, Github } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';
import ForgotPasswordModal from './ForgotPasswordModal';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or Email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export default function LoginForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // In a real implementation, we'd determine if identifier is email or username.
      // InsForge SDK usually expects email.
      await login(data.identifier, data.password);
      toast.success('Authentication successful');
    } catch (error) {
      const message =
        error?.message ||
        'Invalid credentials or network error. Please verify your email and password.';
      toast.error(message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      await authService.oauthRedirect(provider);
    } catch (error) {
      console.error('OAuth Error:', error);
      toast.error(`Failed to connect with ${provider}`);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col gap-5 ${shake ? 'animate-shake' : ''}`}>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Username or Email</label>
          <input
            {...register('identifier')}
            type="text"
            className={`w-full bg-black/20 border ${errors.identifier ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:ring-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.5)]'} rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
            placeholder="hacker@university.edu"
          />
          {errors.identifier && <p className="text-red-400 text-xs mt-1.5">{errors.identifier.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <button 
              type="button" 
              onClick={() => setShowForgotModal(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className={`w-full bg-black/20 border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:ring-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.5)]'} rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
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
          {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <input
            {...register('rememberMe')}
            type="checkbox"
            id="rememberMe"
            className="w-4 h-4 rounded border-white/20 bg-black/20 text-indigo-500 focus:ring-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.5)] focus:ring-offset-0"
          />
          <label htmlFor="rememberMe" className="text-sm text-slate-400 cursor-pointer select-none">
            Remember this device
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white rounded-xl py-3.5 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.5)] focus:ring-offset-2 focus:ring-offset-[#0A0F1D] disabled:opacity-70 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-indigo-500/20"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider">or continue with</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 transition-all text-sm font-medium text-slate-300"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuth('github')}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 transition-all text-sm font-medium text-slate-300"
          >
            <Github className="w-4 h-4" />
            GitHub
          </button>
        </div>
      </form>

      {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
    </>
  );
}
