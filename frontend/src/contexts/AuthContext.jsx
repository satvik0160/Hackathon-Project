import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, insforge } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize: check for stored session and fetch profile
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { user } } = await insforge.auth.getCurrentUser();
        if (user) {
          const res = await authService.getProfile();
          setUser(res.data);
        }
      } catch (err) {
        // Ignored
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for Auth changes
    const unsubscribe = insforge.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (session && !user) {
        const res = await authService.getProfile();
        setUser(res.data);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    // some components pass username, map it to email
    await authService.login({ email, password });
    const profileRes = await authService.getProfile();
    setUser(profileRes.data);
    return profileRes.data;
  }, []);

  const register = useCallback(async (userData) => {
    // Support username -> email mapping
    const email = userData.email || userData.username;
    await authService.register({ email, password: userData.password, role: userData.role });
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await authService.updateProfile(data);
    setUser(res.data[0] || res.data);
    return res.data;
  }, []);

  const completeOnboarding = useCallback(async (data) => {
    const res = await authService.updateProfile({ onboarding_completed: true, ...data });
    setUser(res.data[0] || res.data);
    return res.data;
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await authService.getProfile();
      setUser(res.data);
      return res.data;
    } catch {
      return null;
    }
  }, []);

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
