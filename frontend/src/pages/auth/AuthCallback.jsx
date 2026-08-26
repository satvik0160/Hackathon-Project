import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const { isAuthenticated, needsOnboarding, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorRedirected, setErrorRedirected] = useState(false);

  useEffect(() => {
    // Check for errors in URL (InsForge sets ?error=... on failed code exchange)
    const params = new URLSearchParams(location.search);
    const err = params.get('error');
    const errDesc = params.get('error_description');
    
    if (err && !errorRedirected) {
      setErrorRedirected(true);
      toast.error(errDesc || 'OAuth authentication failed. Please check backend configuration.');
      navigate('/login', { replace: true });
      return;
    }

    // Give the SDK time to process the OAuth code exchange, then hydrate profile.
    // InsForge may need up to ~2s to fully establish the session from the code.
    const timer = setTimeout(async () => {
      // Retry profile hydration a few times in case the session isn't ready yet
      for (let i = 0; i < 3; i++) {
        const profile = await refreshProfile();
        if (profile) break;
        await new Promise(r => setTimeout(r, 800));
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [refreshProfile, location, errorRedirected, navigate]);

  useEffect(() => {
    if (errorRedirected) return;

    if (!loading) {
      if (isAuthenticated) {
        if (needsOnboarding) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        // If loading finished but not authenticated, the code exchange failed silently
        // or there was no session. Wait for retry logic to complete before giving up.
        const timeout = setTimeout(() => {
          toast.error('Sign in could not be completed. The OAuth provider might be misconfigured.');
          navigate('/login', { replace: true });
        }, 8000);
        return () => clearTimeout(timeout);
      }
    }
  }, [loading, isAuthenticated, needsOnboarding, navigate, errorRedirected]);

  return (
    <div className="min-h-screen bg-[#050811] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-[3px] border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
      <p className="text-slate-400 text-sm font-mono">Completing sign-in...</p>
    </div>
  );
}
