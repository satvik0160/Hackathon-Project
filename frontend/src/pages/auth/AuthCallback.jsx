import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { insforge } from '../../services/insforgeClient';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const { isAuthenticated, needsOnboarding, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorRedirected, setErrorRedirected] = useState(false);
  const handledRef = useRef(false);

  // On mount: handle errors, extract tokens from URL hash/query, and establish session
  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const params = new URLSearchParams(location.search);
    const err = params.get('error');
    const errDesc = params.get('error_description');

    // Handle OAuth errors in query params
    if (err) {
      setErrorRedirected(true);
      toast.error(errDesc || 'OAuth authentication failed. Please check backend configuration.');
      navigateOrClose('/login');
      return;
    }

    // The InsForge SDK (like Supabase) may put tokens in the URL hash fragment
    // after an OAuth code exchange: #access_token=...&refresh_token=...&type=...
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    async function establishSession() {
      try {
        // If tokens are in the URL hash, explicitly set the session
        if (accessToken) {
          try {
            await insforge.auth.setSession({
              accessToken,
              refreshToken: refreshToken || undefined,
            });
          } catch (sessionErr) {
            console.warn('[AuthCallback] setSession from hash failed:', sessionErr?.message);
          }
        }

        // Retry profile hydration — the SDK may need time to process the code exchange
        for (let attempt = 0; attempt < 5; attempt++) {
          const profile = await refreshProfile();
          if (profile) return; // Success — the auth state change will trigger navigation
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (err) {
        console.error('[AuthCallback] Session establishment failed:', err);
      }
    }

    // Delay slightly to let the SDK's own auth state listener fire first
    const timer = setTimeout(establishSession, 500);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // React to auth state changes — navigate when authenticated
  useEffect(() => {
    if (errorRedirected) return;
    if (loading) return;

    if (isAuthenticated) {
      const target = needsOnboarding ? '/onboarding' : '/dashboard';
      navigateOrClose(target);
    }
  }, [loading, isAuthenticated, needsOnboarding, errorRedirected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fallback: if nothing resolves within 12 seconds, redirect to login
  useEffect(() => {
    if (errorRedirected) return;
    const timeout = setTimeout(() => {
      if (!isAuthenticated) {
        toast.error('Sign in could not be completed. Please try again.');
        navigateOrClose('/login');
      }
    }, 12000);
    return () => clearTimeout(timeout);
  }, [isAuthenticated, errorRedirected]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * If this page is running inside a popup window (opened by oauthRedirect),
   * signal the parent/opener to navigate and close this popup. Otherwise,
   * navigate normally in the current tab.
   */
  function navigateOrClose(path) {
    if (window.opener && window.opener !== window) {
      try {
        // Tell the parent window to navigate
        window.opener.location.href = window.location.origin + path;
      } catch {
        // Cross-origin — can't access opener, just navigate here
      }
      try { window.close(); } catch { /* can't close, fall through */ }
    }
    // Navigate in this window (either as the main tab, or if popup close failed)
    navigate(path, { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#050811] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-[3px] border-amber-500/30 border-t-amber-500 rounded-full animate-spin shadow-[0_0_20px_rgba(217,175,103,0.5)]" />
      <p className="text-slate-400 text-sm font-mono">Completing sign-in...</p>
    </div>
  );
}
