import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * OAuth Callback Handler
 * 
 * After OAuth sign-in (Google/GitHub), InsForge redirects back to
 * /auth/callback#access_token=...&refresh_token=...
 * 
 * The InsForge SDK automatically picks up the tokens from the URL hash
 * and establishes the session. This component waits for the AuthContext
 * to detect the session and then routes the user appropriately:
 *   - New user (no onboarding) → /onboarding
 *   - Existing user → /dashboard
 */
export default function AuthCallback() {
  const { isAuthenticated, needsOnboarding, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Give the SDK a moment to process the hash tokens, then refresh
    const timer = setTimeout(async () => {
      await refreshProfile();
    }, 500);
    return () => clearTimeout(timer);
  }, [refreshProfile]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (needsOnboarding) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
    // If still loading or not authenticated yet, keep showing spinner
  }, [loading, isAuthenticated, needsOnboarding, navigate]);

  return (
    <div className="min-h-screen bg-[#050811] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-[3px] border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
      <p className="text-slate-400 text-sm font-mono">Completing sign-in...</p>
    </div>
  );
}
