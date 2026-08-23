import { createClient } from '@insforge/insforge-js';
import toast from 'react-hot-toast';

// Initialize the InsForge Client
const INSFORGE_URL = import.meta.env.VITE_INSFORGE_URL || 'https://api.insforge.dev';
const INSFORGE_ANON_KEY = import.meta.env.VITE_INSFORGE_ANON_KEY || 'public-anon-key-placeholder';

export const insforge = createClient(INSFORGE_URL, INSFORGE_ANON_KEY);

// ========== Auth Service (Native InsForge Auth) ==========
export const authService = {
  login: async ({ email, password }) => {
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { data };
  },
  register: async ({ email, password, role }) => {
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      options: { data: { role: role || 'STUDENT' } }
    });
    if (error) throw error;
    return { data };
  },
  logout: async () => {
    const { error } = await insforge.auth.signOut();
    if (error) throw error;
  },
  getProfile: async () => {
    const { data: { user } } = await insforge.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    // Fetch extended profile from public.users table
    const { data, error } = await insforge.from('users').select('*').eq('id', user.id).single();
    if (error) throw error;
    return { data: { ...user, ...data } };
  },
  updateProfile: async (updates) => {
    const { data: { user } } = await insforge.auth.getUser();
    const { data, error } = await insforge.from('users').update(updates).eq('id', user.id).select();
    if (error) throw error;
    return { data };
  },
  passwordReset: async (email) => {
    const { error } = await insforge.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },
  passwordResetConfirm: async ({ new_password }) => {
    const { error } = await insforge.auth.updateUser({ password: new_password });
    if (error) throw error;
  },
};

// ========== Assessment Service (InsForge Database) ==========
export const assessmentService = {
  getCategories: async () => {
    const { data, error } = await insforge.from('skill_categories').select('*');
    if (error) throw error;
    return { data };
  },
  getAssessments: async () => {
    const { data, error } = await insforge.from('assessments').select('*, skill_categories(name)');
    if (error) throw error;
    return { data };
  },
  submitAssessment: async (assessmentId, scoreData) => {
    // Triggers SkillEngine Edge Function
    const { data, error } = await insforge.functions.invoke('submit_assessment', {
      body: { assessment_id: assessmentId, ...scoreData }
    });
    if (error) throw error;
    return { data };
  },
};

// ========== Jobs Service (InsForge Database) ==========
export const jobService = {
  getListings: async () => {
    const { data, error } = await insforge.from('jobs').select('*');
    if (error) throw error;
    return { data };
  },
  getMatches: async () => {
    // Calls Edge Function for Deterministic Matching
    const { data, error } = await insforge.functions.invoke('job_matching_engine');
    if (error) throw error;
    return { data };
  },
};

// ========== AI Service (InsForge AI Gateway) ==========
export const aiService = {
  mockInterview: async (payload) => {
    const { data, error } = await insforge.functions.invoke('ai_copilot', {
      body: { action: 'generate_mock_interview', ...payload }
    });
    if (error) throw error;
    return { data };
  },
  resumeTailor: async (payload) => {
    const { data, error } = await insforge.functions.invoke('ai_copilot', {
      body: { action: 'tailor_resume', ...payload }
    });
    if (error) throw error;
    return { data };
  },
};

// ========== Global Error Handler Hook ==========
insforge.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    toast.error('Session expired. Please log in again.');
  }
});
