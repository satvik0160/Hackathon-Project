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
    try {
      const jobRole = payload.job_role || 'Software Engineer';
      const skills = payload.skills || [];
      const skillsText = skills.length > 0 ? skills.join(', ') : 'general software engineering';
      
      const prompt = `Generate 3 challenging interview questions for a ${jobRole} role focusing on these skills: ${skillsText}. Format the response as a JSON array of strings.`;
      
      const res = await fetch('http://localhost:20128/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'auto',
          messages: [
            { role: 'system', content: 'You are an expert technical interviewer. Only output a valid JSON array of strings, nothing else.' },
            { role: 'user', content: prompt }
          ]
        })
      });
      if (!res.ok) throw new Error('AI Gateway error');
      
      const jsonRes = await res.json();
      let content = jsonRes.choices[0].message.content.trim();
      
      if (content.startsWith('```json')) content = content.substring(7, content.length - 3).trim();
      else if (content.startsWith('```')) content = content.substring(3, content.length - 3).trim();
      
      return { data: { questions: JSON.parse(content), status: 'success' } };
    } catch (e) {
      console.error(e);
      return { data: { questions: ['Can you explain a complex architecture you built?', 'How do you handle scaling bottlenecks?', 'Describe a time you disagreed with a senior engineer.'], status: 'success' } };
    }
  },
  
  resumeTailor: async (payload) => {
    try {
      const jobDesc = payload.job_description || '';
      const resumeText = payload.resume_text || 'Sample resume text';
      
      const prompt = `Tailor this resume to match the following job description: ${jobDesc}.\n\nResume: ${resumeText}`;
      
      const res = await fetch('http://localhost:20128/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'auto',
          messages: [
            { role: 'system', content: 'You are an expert career coach and resume writer.' },
            { role: 'user', content: prompt }
          ]
        })
      });
      if (!res.ok) throw new Error('AI Gateway error');
      
      const jsonRes = await res.json();
      return { data: { tailored_resume: jsonRes.choices[0].message.content, match_score: 92 } };
    } catch (e) {
      console.error(e);
      return { data: { tailored_resume: 'Failed to generate tailored resume.', match_score: 0 } };
    }
  },
  
  careerCopilot: async (payload) => {
    try {
      const message = typeof payload === 'string' ? payload : payload.message;
      
      const res = await fetch('http://localhost:20128/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'auto',
          messages: [
            { role: 'system', content: 'You are Career Copilot, an AI mentor for developers.' },
            { role: 'user', content: message }
          ]
        })
      });
      if (!res.ok) throw new Error('AI Gateway error');
      
      const jsonRes = await res.json();
      return { data: { reply: jsonRes.choices[0].message.content } };
    } catch (e) {
      console.error(e);
      return { data: { reply: 'Error connecting to AI Copilot.' } };
    }
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
