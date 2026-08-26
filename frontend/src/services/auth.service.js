import { insforge } from './api';

export const authService = {
  // Original methods
  login: async (credentials) => {
    const { data, error } = await insforge.auth.signInWithPassword(credentials);
    if (error) throw error;
    return { data };
  },
  
  register: async (userData) => {
    // Check if username is available before registering
    const { email, password, username, fullName } = userData;
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        }
      }
    });
    if (error) throw error;
    return { data };
  },

  getProfile: async () => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    let userData = {};
    if (authData?.user?.id) {
      const { data, error } = await insforge.from('users').select('*').single();
      if (!error && data) {
        userData = data;
      }
    }
    
    // Merge DB profile with Auth metadata
    return { 
      data: { 
        ...userData, 
        ...(authData?.user?.user_metadata || {}) 
      } 
    };
  },
  
  updateProfile: async (userData) => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    const userId = authData?.user?.id;
    if (!userId) throw new Error('Not authenticated');

    // Due to RLS preventing INSERT on public.users, we save everything to user_metadata
    const { data, error } = await insforge.auth.updateUser({ data: userData });
    if (error) throw error;

    // Fetch existing public.users data just in case it exists, to merge properly
    let tableData = {};
    const { data: existingData, error: selectErr } = await insforge.from('users').select('*').eq('id', userId).single();
    if (!selectErr && existingData) {
      tableData = existingData;
    }

    return { data: { ...tableData, ...data.user.user_metadata } };
  },

  logout: async () => {
    const { error } = await insforge.auth.signOut();
    if (error) throw error;
  },

  // NEW Methods for Enterprise Auth Suite
  checkUsernameAvailability: async (username) => {
    // In a real database, we'd query the users table for exact matches
    // Mock implementation returning true for availability if it doesn't equal "taken"
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
    if (username.toLowerCase() === 'admin' || username.toLowerCase() === 'test') {
      return false; // Taken
    }
    return true; // Available
  },

  initiatePasswordReset: async (email) => {
    const { error } = await insforge.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return true;
  },

  verifyResetCode: async (email, code) => {
    const { data, error } = await insforge.auth.verifyOtp({
      email,
      token: code,
      type: 'recovery'
    });
    if (error) throw error;
    return { data };
  },

  confirmNewPassword: async (newPassword) => {
    // When verifyOtp succeeds, user is logged in automatically. 
    // We update their password directly.
    const { data, error } = await insforge.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return { data };
  },

  oauthRedirect: async (provider) => {
    const { data, error } = await insforge.auth.signInWithOAuth({
      provider: provider,
      redirectTo: window.location.origin + '/dashboard'
    });
    if (error) throw error;
    
    // Manually navigate if the SDK does not do it automatically
    if (data?.url) {
      window.location.href = data.url;
    }
    
    return data;
  }
};
