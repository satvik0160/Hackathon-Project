import { createClient } from '@insforge/sdk';
import toast from 'react-hot-toast';

// Initialize the InsForge Client
const INSFORGE_URL = import.meta.env.VITE_INSFORGE_URL || 'https://api.insforge.dev';
const INSFORGE_ANON_KEY = import.meta.env.VITE_INSFORGE_ANON_KEY || 'public-anon-key-placeholder';

export const insforge = createClient(INSFORGE_URL, INSFORGE_ANON_KEY);

import { authService } from "./auth.service";
export { authService };
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
  getAssessmentById: async (id) => {
    const { data, error } = await insforge.from('assessments').select('*, questions(*)').eq('id', id).single();
    if (error) throw error;
    return { data };
  },
  getHistory: async () => {
    const { data, error } = await insforge.from('user_assessments').select('*, assessment:assessments(*)');
    if (error) return { data: [] };
    return { data: data || [] };
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
  getApplications: async () => {
    const { data, error } = await insforge.from('job_applications').select('*, job:jobs(*)');
    if (error) return { data: { applications: [] } };
    return { data: { applications: data || [] } };
  },
  apply: async (payload) => {
    const { data, error } = await insforge.from('job_applications').insert(payload);
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
  careerCopilot: async (payload) => {
    const body = typeof payload === 'string' ? { message: payload } : payload;
    const { data, error } = await insforge.functions.invoke('ai_copilot', {
      body: { action: 'chat', ...body }
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

export const notificationService = {
  getNotifications: async () => ({ data: [] }),
  markRead: async (id) => ({ data: true }),
};

export const learningService = {
  getResources: async () => ({ data: [] }),
  getPaths: async () => ({ data: [] }),
  createPath: async () => ({ data: true }),
  generatePath: async () => ({ data: true }),
  updateProgress: async () => ({ data: true }),
  getDailyPlanner: async () => ({ data: [] }),
};

export const analyticsService = {
  getInstitutionAnalytics: async () => ({ data: {} }),
};

export const statsService = {
  getProfile: async () => ({ data: {} }),
};
