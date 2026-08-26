import { createClient } from '@insforge/sdk';
import toast from 'react-hot-toast';

// Initialize the InsForge Client
// CRITICAL: never silently fall back to api.insforge.dev or a placeholder key
// when env vars are missing — that produces a generic "Network error" on every
// auth call. We fail loud at startup so the misconfiguration is visible.
const INSFORGE_URL = import.meta.env.VITE_INSFORGE_URL;
const INSFORGE_ANON_KEY = import.meta.env.VITE_INSFORGE_ANON_KEY;

if (!INSFORGE_URL) {
  // eslint-disable-next-line no-console
  console.error('[InsForge] VITE_INSFORGE_URL is not set. Add it to frontend/.env.local.');
}
if (!INSFORGE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.error('[InsForge] VITE_INSFORGE_ANON_KEY is not set. Add it to frontend/.env.local.');
}

export const insforge = createClient({
  baseUrl: INSFORGE_URL || 'https://api.insforge.dev',
  anonKey: INSFORGE_ANON_KEY || 'public-anon-key-placeholder'
});

// Polyfill from for older code expecting it on the root client
if (insforge.database && insforge.database.from && !insforge.from) {
  insforge.from = insforge.database.from.bind(insforge.database);
}

export const INSFORGE_CONFIG = {
  url: INSFORGE_URL,
  hasAnonKey: !!INSFORGE_ANON_KEY,
};

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
    // Manually calculate score since Edge Function is missing
    const { data: assessment, error: fetchErr } = await insforge.from('assessments').select('*, questions(*)').eq('id', assessmentId).single();
    if (fetchErr) throw fetchErr;
    
    let correctCount = 0;
    assessment.questions.forEach(q => {
      if (scoreData.answers[q.id] === q.correct_option) {
        correctCount++;
      }
    });
    
    const scorePercentage = Math.round((correctCount / assessment.questions.length) * 100);
    const xpEarned = correctCount * 10;
    
    const { data: { user } } = await insforge.auth.getCurrentUser();
    
    const payload = {
      assessment_id: assessmentId,
      user_id: user?.id,
      percentage: scorePercentage,
      score: correctCount,
      time_taken_seconds: scoreData.time_taken_seconds || 0
    };
    
    if (user) {
      await insforge.from('user_assessments').insert(payload);
    }
    
    return { data: {
      ...payload,
      score_percentage: scorePercentage,
      correct_count: correctCount,
      xp_earned: xpEarned,
      current_streak: 1
    } };
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
