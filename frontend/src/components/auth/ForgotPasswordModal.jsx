import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';

export default function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otpRefs = useRef([]);

  // Step 1 Schema
  const emailSchema = z.object({
    email: z.string().email('Invalid email address')
  });
  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors } } = useForm({
    resolver: zodResolver(emailSchema)
  });

  // Step 3 Schema
  const passwordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, watch, formState: { errors: passwordErrors } } = useForm({
    resolver: zodResolver(passwordSchema),
    mode: "onChange"
  });
  const newPassword = watch('password') || '';

  // Handle Step 1 (Request Code)
  const onRequestCode = async (data) => {
    setIsSubmitting(true);
    try {
      await authService.resetPassword(data.email);
      setEmail(data.email);
      setStep(2);
      toast.success('A 6-digit verification code has been dispatched to your email.');
    } catch (e) {
      toast.error('Failed to send reset code');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP Input
  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
    
    // Auto-verify if complete
    if (newOtp.every(v => v !== '') && index === 5) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '');
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      otpRefs.current[focusIndex].focus();
      if (pastedData.length === 6) verifyOtp(pastedData);
    }
  };

  // Verify OTP
  const verifyOtp = async (code) => {
    setIsSubmitting(true);
    try {
      await authService.verifyOtp(email, code);
      toast.success('Code verified successfully');
      setStep(3);
    } catch (e) {
      toast.error('Invalid or expired code');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Step 3 (Reset)
  const onResetPassword = async (data) => {
    setIsSubmitting(true);
    try {
      await authService.confirmNewPassword(data.password);
      toast.success('Password updated. Please log in with your new credentials.');
      onClose();
    } catch (e) {
      toast.error('Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Email */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
                <p className="text-slate-400 text-sm mb-6">Enter your registered email address to receive a 6-digit verification code.</p>
                
                <form onSubmit={handleEmailSubmit(onRequestCode)} className="flex flex-col gap-4">
                  <div>
                    <input
                      {...registerEmail('email')}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Email address"
                    />
                    {emailErrors.email && <p className="text-red-400 text-xs mt-1.5">{emailErrors.email.message}</p>}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl py-3 font-medium transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Sending security code...</>
                    ) : (
                      <>Send Code <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h3 className="text-xl font-bold text-white mb-2">Enter Code</h3>
                <p className="text-slate-400 text-sm mb-6">We've sent a 6-digit code to <span className="text-white font-medium">{email}</span></p>
                
                <div className="flex gap-2 justify-between mb-6" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 bg-black/20 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  ))}
                </div>

                <div className="text-center text-sm">
                  {isSubmitting ? (
                    <span className="text-indigo-400 flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Verifying...</span>
                  ) : (
                    <button type="button" className="text-slate-400 hover:text-white transition-colors">
                      Resend code in <span className="font-mono">0:45</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3: New Password */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h3 className="text-xl font-bold text-white mb-2">Create New Password</h3>
                <p className="text-slate-400 text-sm mb-6">Your identity has been verified. Choose a strong new password.</p>
                
                <form onSubmit={handlePasswordSubmit(onResetPassword)} className="flex flex-col gap-4">
                  <div>
                    <input
                      {...registerPassword('password')}
                      type="password"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="New Password"
                    />
                    {passwordErrors.password && <p className="text-red-400 text-xs mt-1.5">{passwordErrors.password.message}</p>}
                  </div>
                  <div>
                    <input
                      {...registerPassword('confirmPassword')}
                      type="password"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Confirm New Password"
                    />
                    {passwordErrors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">{passwordErrors.confirmPassword.message}</p>}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl py-3 font-medium transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <><CheckCircle2 className="w-5 h-5" /> Update Password</>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
