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
        // Username was provided — resolve it to an email via a SECURITY DEFINER
        // Postgres function that safely reads auth.users.profile->>'username'.
        try {
          const { data: resolvedEmail, error: rpcErr } = await insforge.database
            .rpc('get_email_by_username', { lookup_username: identifier });
          if (!rpcErr && resolvedEmail) {
            email = resolvedEmail;
          }
        } catch {
          // RPC call failed — fall through to error
        }

        if (!email) {
          throw new Error('No account found for that username. Please check the spelling or sign in with your email.');
        }
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

    // InsForge SDK may return signup metadata under 'user_metadata' or 'profile'
    const meta = authData.user.user_metadata || authData.user.profile || {};

    let tableData = {};
    if (insforge.database && insforge.database.from) {
      try {
        const { data, error } = await insforge.database.from('users').select('*').eq('id', userId).single();
        if (data) {
          tableData = data;
        } else {
          // No row found (new user — e.g. first OAuth login). Auto-create.
          const { data: newData, error: insertErr } = await insforge.database.from('users').insert([{
            id: userId,
            role: meta.role || 'STUDENT'
          }]).select().single();
          if (!insertErr && newData) {
            tableData = newData;
          }
        }
      } catch (dbErr) {
        // RLS or other DB error — still return auth metadata so user isn't locked out
        console.warn('[getProfile] DB query failed, using auth metadata only:', dbErr?.message);
      }
    }
    
    return { data: { ...tableData, ...meta } };
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
    console.log('RAW setProfile response:', JSON.stringify(data));
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

    const existingMeta = authData?.user?.user_metadata || authData?.user?.profile || {};
    const meta = data?.user?.user_metadata || data?.user?.profile || { ...existingMeta, ...metadataFields };
    return { data: { ...tableData, ...meta } };
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
