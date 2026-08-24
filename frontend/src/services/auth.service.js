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
    const { data, error } = await insforge.from('users').select('*').single();
    if (error) throw error;
    return { data };
  },
  
  updateProfile: async (userData) => {
    const { data: { session } } = await insforge.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) throw new Error('Not authenticated');
    const { data, error } = await insforge.from('users').update(userData).eq('id', userId);
    if (error) throw error;
    return { data };
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
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    });
    if (error) throw error;
    return data; // contains url for redirect
  }
};
