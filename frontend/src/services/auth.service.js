import { insforge, INSFORGE_CONFIG } from './api';

// Helper: detect if an identifier looks like an email.
const isEmail = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// Re-shape low-level SDK errors into something the UI can surface verbatim.
const normalizeAuthError = (error, fallbackMessage) => {
  if (!error) return new Error(fallbackMessage);
  let msg = fallbackMessage;
  try {
    if (error.message) msg = error.message;
    else if (error.error && typeof error.error === 'string') msg = error.error;
    else if (error.error && error.error.message) msg = error.error.message;
    else if (error.error_description) msg = error.error_description;
    else if (typeof error === 'string') msg = error;

    if (error.nextActions && typeof error.nextActions === 'string') {
      msg = msg !== fallbackMessage ? `${msg} - ${error.nextActions}` : error.nextActions;
    }
  } catch (e) {
    // Ignore property access errors
  }
  const wrapped = new Error(msg || fallbackMessage);
  try {
    wrapped.code = error.code || error.error_code || error.errorCode || error.error;
    wrapped.statusCode = error.statusCode || error.status;
    wrapped.status = wrapped.statusCode;
    wrapped.nextActions = error.nextActions;
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
      if (!data) {
        // Insert new user into database
        const { data: newData, error: insertErr } = await insforge.database.from('users').insert([{
          id: userId,
          role: authData.user.user_metadata?.role || 'STUDENT'
        }]).select().single();
        if (!insertErr && newData) {
          tableData = newData;
        }
      } else {
        tableData = data;
      }
    }
    
    return { data: { ...tableData, ...(authData?.user?.user_metadata || {}) } };
  },
  
  updateProfile: async (userData) => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    const userId = authData?.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const dbFields = {};
    const metadataFields = { ...userData };
    const userColumns = ['role', 'bio', 'profile_picture', 'experience_level', 'skills', 'interests'];
    
    for (const key of userColumns) {
      if (key in metadataFields) {
        dbFields[key] = metadataFields[key];
      }
    }

    const { data, error } = await insforge.auth.setProfile({ data: metadataFields });
    if (error) throw error;

    let tableData = {};
    if (insforge.database && insforge.database.from) {
      if (Object.keys(dbFields).length > 0) {
        const { data: updateData, error: updateErr } = await insforge.database.from('users')
          .update(dbFields)
          .eq('id', userId)
          .select()
          .single();
        if (!updateErr && updateData) tableData = updateData;
      } else {
        const { data: existingData, error: selectErr } = await insforge.database.from('users').select('*').eq('id', userId).single();
        if (!selectErr && existingData) tableData = existingData;
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
  },

  // ---------- OAuth ----------
  oauthRedirect: async (provider) => {
    const { data, error } = await insforge.auth.signInWithOAuth({
      provider,
      redirectTo: `${window.location.origin}/auth/callback`,
      skipBrowserRedirect: true
    });

    if (error) throw normalizeAuthError(error, `OAuth sign-in with ${provider} failed.`);
    
    if (data?.url) {
      setTimeout(() => {
        try {
          // Attempt popup first to avoid iframe sandbox top-navigation blocks
          const popup = window.open(data.url, 'oauth_popup', 'width=500,height=600,left=200,top=200');
          if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            // Fallback if popup blocked
            if (window.top !== window.self) {
              window.top.location.href = data.url;
            } else {
              window.location.href = data.url;
            }
          }
        } catch (e) {
          window.location.href = data.url;
        }
      }, 100);
    }
    return { data };
  },

  // ---------- Username availability ----------
  checkUsernameAvailability: async (username) => {
    try {
      if (insforge.database && insforge.database.from) {
        const { data, error } = await insforge.database
          .from('users')
          .select('id')
          .eq('username', username)
          .single();
        if (error && error.code === 'PGRST116') return true;
        if (error) return true;
        return !data;
      }
    } catch {
      // Swallow – username check is best-effort
    }
    return true;
  },
};
