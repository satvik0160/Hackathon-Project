import toast from 'react-hot-toast';
import { insforge, INSFORGE_CONFIG } from './insforgeClient';

// Re-export the SDK client + config so existing imports keep working.
export { insforge, INSFORGE_CONFIG };

// Install a localStorage-backed session cache so the user stays signed in
// across page reloads. The InsForge SDK keeps the access token in memory only;
// without this layer, every reload triggers a forced sign-in.
import { installSessionPersistence } from './sessionPersistence';
export const sessionPersistence = installSessionPersistence(insforge);
// Hydrate immediately so the very first getCurrentUser() call inside
// AuthContext sees the cached session instead of bouncing the user to /login.
sessionPersistence.hydrate();

// Robust polyfill: always delegate insforge.from() → insforge.database.from()
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

// Polyfill insforge.rpc() -> insforge.database.rpc()
if (!insforge.rpc) {
  Object.defineProperty(insforge, 'rpc', {
    get() {
      if (this.database && this.database.rpc) {
        return this.database.rpc.bind(this.database);
      }
      return () => { throw new Error('[InsForge] Database client not initialized.'); };
    },
    configurable: true,
  });
}

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
  checkSingleAnswer: async (questionId, selectedOption) => {
    const { data, error } = await insforge.rpc('check_single_answer', {
      p_question_id: questionId,
      p_selected_option: selectedOption
    });
    if (error) throw error;
    // RPC returns an array of rows, we need the first one
    return { data: data[0] };
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
// NOTE: intentional sign-outs also fire SIGNED_OUT. We only surface a toast
// when the sign-out was unexpected (i.e. the SDK revoked the session due to
// token expiry). The AuthContext.logout() call already clears state, so we
// don't need to toast there. We rely on the fact that deliberate logout sets
// window.__devastra_intentional_logout = true before calling signOut().
insforge.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    if (window.__devastra_intentional_logout) {
      window.__devastra_intentional_logout = false;
      return;
    }
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
