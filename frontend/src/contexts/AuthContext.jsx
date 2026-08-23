import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  // Initialize: check for stored tokens and fetch profile
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await api.get('/users/profile/');
          setUser(res.data);
        } catch (err) {
          // Token expired or invalid
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Auto-refresh token before expiry (every 50 minutes for 60-min lifetime)
  useEffect(() => {
    if (user) {
      refreshTimerRef.current = setInterval(async () => {
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const res = await api.post('/users/token/refresh/', { refresh: refreshToken });
            localStorage.setItem('access_token', res.data.access);
            if (res.data.refresh) {
              localStorage.setItem('refresh_token', res.data.refresh);
            }
          }
        } catch {
          logout();
        }
      }, 50 * 60 * 1000);
    }
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [user]);

  const login = useCallback(async (username, password) => {
    const res = await api.post('/users/login/', { username, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    // Fetch user profile
    const profileRes = await api.get('/users/profile/');
    setUser(profileRes.data);
    return profileRes.data;
  }, []);

  const register = useCallback(async (userData) => {
    const res = await api.post('/users/register/', userData);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/users/logout/', { refresh: refreshToken });
      }
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await api.patch('/users/profile/', data);
    setUser(res.data);
    return res.data;
  }, []);

  const completeOnboarding = useCallback(async (data) => {
    const res = await api.put('/users/onboard/', data);
    setUser(res.data);
    return res.data;
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.get('/users/profile/');
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
