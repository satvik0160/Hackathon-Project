import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const { login, user } = useAuth();
  const navigate = useNavigate();
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
      const profile = await login(data.identifier, data.password);
      toast.success('Authentication successful');
      // Explicit navigate so the user is taken to their destination even if the
      // PublicRoute redirect races with the DevAstraPreloader fade-out.
      const target = profile && profile.onboarding_completed ? '/dashboard' : '/onboarding';
      navigate(target, { replace: true });
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
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Username or Email</label>
          <input
            {...register('identifier')}
            type="text"
            className={`w-full bg-slate-50 border ${errors.identifier ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-sky-600/50 focus:shadow-sm'} rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all`}
            placeholder="hacker@university.edu"
          />
          {errors.identifier && <p className="text-red-400 text-xs mt-1.5">{errors.identifier.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <button 
              type="button" 
              onClick={() => setShowForgotModal(true)}
              className="text-xs text-sky-600 hover:text-sky-700 transition-colors"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className={`w-full bg-slate-50 border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-sky-600/50 focus:shadow-sm'} rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
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
            className="w-4 h-4 rounded border-slate-300 bg-slate-50 text-sky-600 focus:ring-sky-600/50 focus:shadow-sm focus:ring-offset-0"
          />
          <label htmlFor="rememberMe" className="text-sm text-slate-500 cursor-pointer select-none">
            Remember this device
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-sky-600 to-amber-600 hover:from-sky-600 hover:to-sky-600 text-neutral-950 rounded-xl py-3.5 font-bold transition-all focus:outline-none focus:ring-2 focus:ring-sky-600/50 focus:shadow-sm focus:ring-offset-2 focus:ring-offset-[#0A0F1D] disabled:opacity-70 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-[0_0_15px_rgba(217,175,103,0.2)]"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider">or continue with</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl py-2.5 transition-all text-sm font-medium text-slate-700"
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
            className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl py-2.5 transition-all text-sm font-medium text-slate-700"
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
