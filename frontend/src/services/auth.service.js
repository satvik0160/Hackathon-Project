import { insforge, INSFORGE_CONFIG } from './api';

// Helper: detect if an identifier looks like an email.
const isEmail = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// Re-shape low-level SDK errors into something the UI can surface verbatim.
const normalizeAuthError = (error, fallbackMessage) => {
  if (!error) return new Error(fallbackMessage);
  let msg = fallbackMessage;
  try {
    if (error.message) msg = error.message;
    else if (error.error && error.error.message) msg = error.error.message;
    else if (error.error_description) msg = error.error_description;
    else if (typeof error === 'string') msg = error;
  } catch (e) {
    // Ignore property access errors
  }
  const wrapped = new Error(msg || fallbackMessage);
  try {
    wrapped.code = error.code || error.error_code || error.errorCode;
    wrapped.status = error.status || error.statusCode;
    wrapped.original = error;
  } catch (e) {
    // Ignore
  }
  return wrapped;
};

export const authService = {
  // Original methods
  login: async (credentials) => {
    if (!INSFORGE_CONFIG.url || !INSFORGE_CONFIG.hasAnonKey) {
      throw new Error(
        'Backend not configured. Set VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY in frontend/.env.local.'
      );
    }

    // Accept either { email, password } or { identifier, password } where
    // identifier may be a username or an email.
    let { email, password } = credentials || {};
    if (!email && credentials?.identifier) {
      const identifier = String(credentials.identifier).trim();
      if (isEmail(identifier)) {
        email = identifier;
      } else {
        // InsForge auth sessions require email — refuse early with a clear
        // message instead of returning a confusing 401 from the backend.
        throw new Error('Please sign in with the email address associated with your account.');
      }
    }

    if (!email) throw new Error('Email is required to sign in.');
    if (!password) throw new Error('Password is required to sign in.');

    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) throw normalizeAuthError(error, 'Sign in failed. Please try again.');
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
  
  logout: async () => {
    const { error } = await insforge.auth.signOut();
    if (error) throw error;
  },
  
  getProfile: async () => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    const userId = authData?.user?.id;
    if (!userId) throw new Error('Not authenticated');

    let tableData = {};
    if (insforge.database && insforge.database.from) {
      const { data, error } = await insforge.database.from('users').select('*').eq('id', userId).single();
      if (!error && data) tableData = data;
    }
    
    return { data: { ...tableData, ...(authData?.user?.user_metadata || {}) } };
  },
  
  updateProfile: async (userData) => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    const userId = authData?.user?.id;
    if (!userId) throw new Error('Not authenticated');

    // Due to RLS preventing INSERT on public.users, we save everything to user_metadata
    // Use setProfile instead of updateUser for InsForge SDK
    const { data, error } = await insforge.auth.setProfile({ data: userData });
    if (error) throw error;

    // Fetch existing public.users data just in case it exists, to merge properly
    let tableData = {};
    if (insforge.database && insforge.database.from) {
      const { data: existingData, error: selectErr } = await insforge.database.from('users').select('*').eq('id', userId).single();
      if (!selectErr && existingData) {
        tableData = existingData;
      }
    }

    return { data: { ...tableData, ...(data?.user?.user_metadata || {}) } };
  },

  checkAvailability: async (field, value) => {
    if (insforge.database && insforge.database.from) {
      const { data, error } = await insforge.database.from('users').select('id').eq(field, value).single();
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" which means available
        console.error('Error checking availability:', error);
      }
      return { available: !data };
    }
    return { available: true };
  },

  resetPassword: async (email) => {
    const { error } = await insforge.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return { success: true };
  },

  verifyOtp: async (email, token) => {
    const { data, error } = await insforge.auth.verifyOtp({
      email,
      token,
      type: 'recovery'
    });
    if (error) throw error;
    return { data };
  },

  confirmNewPassword: async (newPassword) => {
    // When verifyOtp succeeds, user is logged in automatically. 
    // We update their password directly.
    const { data, error } = await insforge.auth.setProfile({
      password: newPassword
    });
    if (error) throw error;
    return { data };
  }
};
