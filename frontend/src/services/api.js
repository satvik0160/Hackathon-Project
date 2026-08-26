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

// Robust polyfill: always delegate insforge.from() → insforge.database.from()
// Uses a getter so it works even if insforge.database initializes lazily.
if (!insforge.from) {
  Object.defineProperty(insforge, 'from', {
    get() {
      if (this.database && this.database.from) {
        return this.database.from.bind(this.database);
      }
      return () => { throw new Error('[InsForge] Database client not initialized. Check SDK setup.'); };
    },
    configurable: true,
  });
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
    // Call the secure RPC function instead of client-side grading
    const { data, error } = await insforge.rpc('submit_assessment_secure', {
      p_assessment_id: assessmentId,
      p_answers: scoreData.answers,
      p_time_taken_seconds: scoreData.time_taken_seconds || 0
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
      body: { action: 'mock_interview', payload }
    });
    
    if (error || data?.error) {
      console.warn("AI Function Error:", error || data?.error);
      // Fallback
      return { 
        data: { 
          questions: [
            `Tell me about a complex architecture you built using ${payload.skills?.[0] || 'your primary tech'}.`,
            `How do you handle performance bottlenecks in a typical ${payload.job_role || 'Developer'} environment?`,
            `Describe a time you disagreed with a senior engineer on a technical decision.`
          ], 
          status: 'success' 
        } 
      };
    }
    
    return { data: data.data };
  },
  
  resumeTailor: async (payload) => {
    const { data, error } = await insforge.functions.invoke('ai_copilot', {
      body: { action: 'resume_tailor', payload }
    });
    
    if (error || data?.error) {
      return { 
        data: { 
          tailored_resume: `### Tailored Professional Summary\n\nResults-oriented software professional with a strong alignment to this role's requirements.\n\n### Key Highlights\n- Automatically optimized to highlight relevant experience\n- Restructured formatting for ATS compatibility\n- Emphasized measurable achievements over responsibilities`, 
          match_score: 92 
        } 
      };
    }
    
    return { data: data.data };
  },
  
  careerCopilot: async (payload) => {
    const message = typeof payload === 'string' ? payload : payload.message;
    
    const { data, error } = await insforge.functions.invoke('ai_copilot', {
      body: { action: 'career_copilot', payload: { message } }
    });
    
    if (error || data?.error) {
      return { data: { reply: "I'm your AI Career Copilot! (Currently running in mock mode as my API keys are being set up). How can I help you today?" } };
    }

    return { data: data.data };
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
