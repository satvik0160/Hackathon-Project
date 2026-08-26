import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService, insforge } from '../services/api';

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
      setUser(res.data);
      return res.data;
    } catch {
      return null;
    }
  }, []);

  // Initialize: check for stored session and fetch profile
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { user: authUser } } = await insforge.auth.getCurrentUser();
        if (authUser) {
          await hydrateProfile();
        }
      } catch (err) {
        // Ignored — no active session
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for Auth changes (login, logout, OAuth callback, token refresh)
    const unsubscribe = insforge.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Only hydrate if we don't already have a user loaded
        if (!userRef.current && session) {
          await hydrateProfile();
        }
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
    await authService.logout();
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
    const updated = res.data?.[0] || res.data;
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
