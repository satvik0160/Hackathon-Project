import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService, insforge, sessionPersistence } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use a ref so the onAuthStateChange callback always sees the latest user
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  // Helper: hydrate user profile from auth session
  const hydrateProfile = useCallback(async () => {
    try {
      const res = await authService.getProfile();
      if (res?.data) {
        setUser(res.data);
        return res.data;
      }
    } catch (err) {
      // If profile fetch failed, the cached token may be invalid — clear it
      // so the next reload doesn't loop on a stale session.
      console.warn('[AuthContext] hydrateProfile failed, clearing cached session:', err?.message);
      sessionPersistence.clear();
    }
    return null;
  }, []);

  // Initialize: hydrate SDK from localStorage first, then check for an active
  // session, then fetch the profile. This makes the user "already signed in"
  // visible on the very first render of a reload, so PublicRoute can route
  // them straight to /dashboard.
  useEffect(() => {
    const initAuth = async () => {
      // 1. Re-hydrate the SDK from the localStorage cache we wrote on the last
      //    sign-in. This makes getCurrentUser() return the cached user without
      //    waiting for a network round-trip.
      try { sessionPersistence.hydrate(); } catch { /* noop */ }

      // 2. Ask the SDK who is signed in. If the cached token is still valid
      //    the SDK returns the user immediately; if not, the SDK tries to
      //    refresh via the httpOnly cookie and falls back to null.
      try {
        const { data: { user: authUser } } = await insforge.auth.getCurrentUser();
        if (authUser) {
          await hydrateProfile();
          // Persist any refreshed access token so the next reload is even faster
          try { sessionPersistence.persist(); } catch { /* noop */ }
        }
      } catch (err) {
        console.warn('[AuthContext] initAuth getCurrentUser failed:', err?.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for Auth changes (login, logout, OAuth callback, token refresh)
    const unsubscribe = insforge.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        sessionPersistence.clear();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Only hydrate if we don't already have a user loaded
        if (!userRef.current && session) {
          await hydrateProfile();
        }
        // Always re-persist so a refreshed token survives the next reload
        try { sessionPersistence.persist(); } catch { /* noop */ }
      } else if (event === 'USER_UPDATED') {
        // Profile metadata changed — re-fetch the merged profile so React
        // re-renders any consumers that read user fields directly
        await hydrateProfile();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [hydrateProfile]);

  const login = useCallback(async (identifier, password) => {
    // Pass as { identifier, password } — authService.login handles
    // detecting whether it's an email or username
    await authService.login({ identifier, password });
    const profileRes = await authService.getProfile();
    setUser(profileRes.data);
    return profileRes.data;
  }, []);

  const register = useCallback(async (userData) => {
    // Forward ALL user data (email, password, username, fullName)
    // so authService.register can store username/fullName in user_metadata
    await authService.register(userData);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    // Signal the global SIGNED_OUT handler in api.js that this is deliberate,
    // so it doesn't show a misleading "Session expired" toast.
    window.__devastra_intentional_logout = true;
    try { await authService.logout(); } catch (err) {
      console.warn('[AuthContext] logout API call failed, clearing local state anyway:', err?.message);
    }
    // Always clear the local cache so the next reload doesn't auto-sign-in
    sessionPersistence.clear();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await authService.updateProfile(data);
    const updated = res.data?.[0] || res.data;
    setUser(updated);
    return updated;
  }, []);

  const completeOnboarding = useCallback(async (data) => {
    const res = await authService.updateProfile({ onboarding_completed: true, ...data });
    console.log('completeOnboarding res.data:', JSON.stringify(res.data));
    const updated = res.data?.[0] || res.data;
    console.log('updated (passed to setUser):', JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, []);

  const refreshProfile = useCallback(async () => {
    return await hydrateProfile();
  }, [hydrateProfile]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    needsOnboarding: user && !user.onboarding_completed,
    isStudent: user?.role === 'STUDENT',
    isInstitution: user?.role === 'INSTITUTION_ADMIN',
    isIndustry: user?.role === 'INDUSTRY',
    isMentor: user?.role === 'MENTOR',
    login,
    register,
    logout,
    updateProfile,
    completeOnboarding,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
