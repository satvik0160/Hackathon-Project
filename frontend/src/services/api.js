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
    // Returns the user's real assessment history. Shapes each row so every
    // consumer (SkillTests, Profile, Analytics) gets the fields it expects.
    const { data, error } = await insforge.from('user_assessments')
      .select('*, assessment:assessments(*, skill_categories(name))')
      .order('completed_at', { ascending: false });
    if (error) throw error;
    const rows = (data || []).map((r) => ({
      ...r,
      score_percentage: Number(r.percentage) || 0,
      passed: Number(r.percentage) >= 60,
      created_at: r.completed_at,
    }));
    return { data: rows };
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
    try {
      const { data, error } = await insforge.rpc('submit_assessment_secure', {
        p_assessment_id: assessmentId,
        p_answers: scoreData.answers,
        p_time_taken_seconds: scoreData.time_taken_seconds || 0
      });
      
      if (error) throw error;
      const result = Array.isArray(data) ? data[0] : data;
      return { data: result };
    } catch (rpcError) {
      console.warn('RPC submit failed, using client-side scoring:', rpcError);
      // Client-side fallback: compute score from local answers
      const { data: assessmentData } = await insforge.from('assessments').select('*, questions(*)').eq('id', assessmentId).single();
      if (!assessmentData?.questions) throw rpcError;
      
      let correctCount = 0;
      const totalQuestions = assessmentData.questions.length;
      for (const q of assessmentData.questions) {
        if (scoreData.answers[q.id] === q.correct_option) {
          correctCount++;
        }
      }
      const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      
      // Try to insert result into user_assessments
      try {
        const { data: { user } } = await insforge.auth.getCurrentUser();
        if (user?.id) {
          await insforge.from('user_assessments').insert([{
            user_id: user.id,
            assessment_id: assessmentId,
            score: correctCount,
            percentage: scorePercentage,
            time_taken_seconds: scoreData.time_taken_seconds || 0
          }]);
        }
      } catch (insertErr) {
        console.warn('Failed to persist score:', insertErr);
      }
      
      return {
        data: {
          score_percentage: scorePercentage,
          correct_count: correctCount,
          xp_earned: scorePercentage >= 80 ? 25 : 0,
          total_points: null,
          skill_level: null,
          skill_score_percent: null
        }
      };
    }
  },
};

// ========== Jobs Service (InsForge Database) ==========

// Columns we actually render. `description` is deliberately excluded: the feed
// stores full postings (up to 6 kB each), and shipping 200+ of them on every
// page load made the Jobs page take ~10s. Cards only need the summary fields.
const JOB_COLUMNS = 'id,title,company_name,job_type,location,is_remote,required_skills,salary_range,company_logo,apply_url,source,posted_at';

const normalizeSkill = (s) =>
  (s && typeof s === 'object' ? (s.name || '') : String(s || '')).toLowerCase().trim();

// Tokenise a skill string so "node.js" -> ["node","js"].
const skillTokens = (s) => String(s || '').toLowerCase().split(/[^a-z0-9+#]+/).filter(Boolean);

// Whole-token skill matching. Guards against substring false positives like
// the tag "c" matching "react" or "go" matching "django" — those made
// irrelevant jobs (HR, sales, insurance) show up as "relevant".
const isSkillMatch = (required, userSkill) => {
  const a = skillTokens(required);
  const b = skillTokens(userSkill);
  if (!a.length || !b.length) return false;
  return a.some((rt) => b.some((ut) => rt === ut ||
    (rt.length >= 3 && ut.length >= 3 && (rt.includes(ut) || ut.includes(rt)))));
};

// Pull active listings from the trusted-source feed (see job_feed_sync).
async function loadActiveJobs(limit = 250) {
  const { data, error } = await insforge
    .from('jobs')
    .select(JOB_COLUMNS)
    .eq('is_active', true)
    .order('posted_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// The user's real skills (public.users.skills) + career goal (auth profile).
async function loadUserSignals() {
  const { data: { user } } = await insforge.auth.getCurrentUser();
  if (!user?.id) return { skills: [], goal: '' };
  let skills = [];
  try {
    const { data: row } = await insforge.from('users').select('skills').eq('id', user.id).limit(1);
    skills = row?.[0]?.skills || [];
  } catch { /* best effort */ }
  const meta = user.profile || user.user_metadata || {};
  return {
    skills: (Array.isArray(skills) ? skills : []).map(normalizeSkill).filter(Boolean),
    goal: String(meta.career_goal || meta.target_role || '').toLowerCase(),
  };
}

const GOAL_STOPWORDS = new Set([
  'developer', 'engineer', 'senior', 'junior', 'intern', 'internship', 'lead', 'staff',
  'full', 'stack', 'the', 'and', 'for', 'remote', 'job', 'role', 'with',
]);
const goalTokens = (goal) =>
  String(goal || '')
    .split(/[^a-z0-9+#.]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !GOAL_STOPWORDS.has(t));

// Relevance = overlap between the user's real skills/goal and the listing's
// required skills + title. Purely a function of real data — no mock scores.
function scoreJob(job, userSkills, goalToks) {
  const required = (Array.isArray(job.required_skills) ? job.required_skills : [])
    .map(normalizeSkill).filter(Boolean);
  const strengths = required.filter((r) => userSkills.some((s) => isSkillMatch(r, s)));
  const gaps = required.filter((r) => !strengths.includes(r));
  let match_score = required.length ? Math.round((strengths.length / required.length) * 100) : 0;

  const title = `${job.title || ''} ${job.company_name || ''}`.toLowerCase();
  const goalHit = goalToks.some((t) => title.includes(t));
  if (match_score === 0 && goalHit) match_score = 40;
  const relevant = strengths.length > 0 || goalHit;

  return { ...job, match_score, match_details: { strengths, gaps }, relevant };
}

const byRelevanceThenRecency = (a, b) =>
  (b.match_score - a.match_score) ||
  (new Date(b.posted_at || 0).getTime() - new Date(a.posted_at || 0).getTime());

export const jobService = {
  // All active listings, annotated with a real relevance score and ordered
  // relevance-first (so even the browse view leads with relevant roles).
  getListings: async () => {
    const [jobs, signals] = await Promise.all([loadActiveJobs(), loadUserSignals()]);
    const toks = goalTokens(signals.goal);
    return { data: jobs.map((j) => scoreJob(j, signals.skills, toks)).sort(byRelevanceThenRecency) };
  },

  // Only the listings relevant to the user's skills/goal, best match first.
  // If the user has no skills or goal yet, everything from trusted sources is
  // considered relevant so the feed is never empty.
  getMatches: async () => {
    const [jobs, signals] = await Promise.all([loadActiveJobs(), loadUserSignals()]);
    const toks = goalTokens(signals.goal);
    const hasSignals = signals.skills.length > 0 || toks.length > 0;
    let scored = jobs.map((j) => scoreJob(j, signals.skills, toks));
    if (hasSignals) scored = scored.filter((j) => j.relevant);
    scored.sort(byRelevanceThenRecency);
    return { data: { matches: scored.slice(0, 60) } };
  },
  getApplications: async () => {
    const { data, error } = await insforge.from('job_applications').select('*, job:jobs(*)');
    if (error) return { data: { applications: [] } };
    return { data: { applications: data || [] } };
  },
  apply: async (payload) => {
    const { data: { user } } = await insforge.auth.getCurrentUser();
    if (!user?.id) throw new Error('Not authenticated');
    const rows = (Array.isArray(payload) ? payload : [payload]).map((r) => ({
      job_id: r.job_id,
      status: r.status || 'Applied',
      cover_letter: r.cover_letter || null,
      user_id: user.id,
    }));
    const { data, error } = await insforge.from('job_applications').insert(rows).select();
    if (error) throw error;
    return { data };
  },
  // Recruiters move an applicant through the pipeline (RLS allows INDUSTRY).
  updateApplicationStatus: async (applicationId, status) => {
    const { data, error } = await insforge.from('job_applications')
      .update({ status }).eq('id', applicationId).select();
    if (error) throw error;
    return { data };
  },
};

// ========== AI Service (InsForge AI Gateway) ==========
async function invokeAiCopilot(body) {
  try {
    const res = await fetch('http://localhost:8000/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const data = await res.json();
      return { data };
    }
  } catch (err) {
    // Local server not running, ignore and fall back
  }
  return await insforge.functions.invoke('ai_copilot', { body });
}

export const aiService = {
  mockInterview: async (payload) => {
    const { data, error } = await invokeAiCopilot({ action: 'mock_interview', payload });
    
    if (error || data?.error) {
      console.warn("AI Function Error:", error || data?.error);
      return { 
        data: { 
          __source: 'fallback',
          questions: [
            `Tell me about a complex architecture you built using ${payload.skills?.[0] || 'your primary tech'}.`,
            `How do you handle performance bottlenecks in a typical ${payload.job_role || 'Developer'} environment?`,
            `Describe a time you disagreed with a senior engineer on a technical decision.`
          ], 
          status: 'success' 
        } 
      };
    }
    
    return { data: { ...data.data, __source: 'live' } };
  },
  
  resumeTailor: async (payload) => {
    const { data, error } = await invokeAiCopilot({ action: 'resume_tailor', payload });
    
    if (error || data?.error) {
      console.error("AI Function Error (resume_tailor):", error || data?.error);
      return { 
        data: { 
          __source: 'fallback',
          resume_markdown: `> **Warning**: The AI service is currently unavailable or encountered an error.\n> Returning your original resume below to prevent data loss.\n\n---\n\n${payload.resume_text || 'No resume data provided.'}`, 
          match_score: null 
        } 
      };
    }
    
    return { data: { ...data.data, __source: 'live' } };
  },

  resumeAnalyze: async (payload) => {
    const { data, error } = await invokeAiCopilot({ action: 'resume_analyze', payload });
    
    if (error || data?.error) {
      return {
        data: {
          __source: 'fallback',
          analysis: {
            score: 72,
            strengths: ["Clear layout", "Relevant skills mentioned"],
            weaknesses: ["Missing quantifiable results", "Generic summary", "ATS keywords missing", "Inconsistent formatting", "Lacking impactful verbs"],
            improvements: "To beat the ATS, you should tailor the keywords more specifically to the job description and use bullet points with measurable metrics.",
            things_to_add: ["AWS Certification", "GitHub repo links"]
          }
        }
      };
    }
    
    return { data: { ...data.data, __source: 'live' } };
  },
  
  careerCopilot: async (payload) => {
    const message = typeof payload === 'string' ? payload : (payload.message || payload.query || JSON.stringify(payload));
    
    const { data, error } = await invokeAiCopilot({ action: 'career_copilot', payload: { message } });
    
    if (error || data?.error) {
      // Try direct API call to bypass Edge Function 503s
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey) {
        try {
          const prompt = `You are a Career Copilot, an AI mentor for developers. Answer concisely and professionally.\nUser says: ${message}`;
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          if (res.ok) {
            const result = await res.json();
            const replyText = result.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
            return { data: { reply: replyText, __source: 'live' } };
          }
        } catch (err) {
          console.warn("Direct API fallback failed:", err);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { data: { __source: 'fallback', reply: "I'm your AI Career Copilot! (Currently running in mock mode as my API keys are being set up). How can I help you today?" } };
    }

    return { data: { ...data.data, __source: 'live' } };
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
  getResources: async (filters) => {
    let mockData = [
      {"id": "44d93449-8785-4d10-b348-e0a806d9ea41", "title": "Python Django Web Framework - Full Course for Beginners", "description": "Video Masterclass on Django.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Django", "duration": "120 min", "url": "https://www.youtube.com/watch?v=F5mRW0jo-U4", "completed": false},
      {"id": "93e43d30-ae0f-4c8a-afd6-dbbe5e3b89ba", "title": "Django Complete Playlist for Beginners (100 Days)", "description": "Video Masterclass on Django.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Django", "duration": "120 min", "url": "https://www.youtube.com/playlist?list=PLu0W_9lII9ah7DDtYtflgwMwpT3xmjXY9", "completed": false},
      {"id": "198859a5-6e47-476b-8fa7-8fd07f753091", "title": "Django Crash Course & Full Stack Projects Series", "description": "Video Masterclass on Django.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Django", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PL-51WBLyFTg2vW-_6XBoUpE7vpucR3CkO", "completed": false},
      {"id": "f426993e-6baf-4046-aa76-c226010c476e", "title": "Django 3 Complete In-Depth Master Series", "description": "Video Masterclass on Django.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Django", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLbGui_ZYuhihfsbzpkm3xP_w2nB_y_mE5", "completed": false},
      {"id": "8adaa32b-e11d-446c-865d-6cb98ec984ce", "title": "Django REST Framework Course - Build Web APIs", "description": "Video Masterclass on Django.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Django", "duration": "60 min", "url": "https://www.youtube.com/watch?v=u1GnZfDw5LU", "completed": false},
      {"id": "1969f971-2adc-4783-a2fa-b1a315f986e1", "title": "Django REST Framework (DRF) Complete Masterclass", "description": "Video Masterclass on Django.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Django", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLbGui_ZYuhigchy8DTw4pX4dcHgp_sNx_", "completed": false},
      {"id": "ab3b4775-074d-4227-a543-b22539b07c50", "title": "SQL and Databases - Full Course for Beginners", "description": "Video Masterclass on Sql & Relational Databases.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Sql & Relational Databases", "duration": "120 min", "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY", "completed": false},
      {"id": "b617a06c-8dd9-4198-a443-eb5dc2767557", "title": "Complete SQL Tutorial in One Shot", "description": "Video Masterclass on Sql & Relational Databases.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Sql & Relational Databases", "duration": "120 min", "url": "https://www.youtube.com/watch?v=hlGoQC332VM", "completed": false},
      {"id": "c024c1f6-a603-466c-9b63-a1c8058c6d45", "title": "Full SQL Bootcamp for Data Analysis & Engineering", "description": "Video Masterclass on Sql & Relational Databases.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Sql & Relational Databases", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLUaB-1hjhk8FE_527U5GwPQT31PBxdlKR", "completed": false},
      {"id": "b2b1b5ec-3471-4e08-8df6-71f84aec3f65", "title": "Complete DBMS & SQL Course for Interviews", "description": "Video Masterclass on Sql & Relational Databases.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Sql & Relational Databases", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLDzeHZWIZsTpukecBCxEQ522TfoOOmY0n", "completed": false},
      {"id": "98e70e75-296f-44ff-8bdb-aa0fefb74280", "title": "Database Internals & Advanced SQL Query Tuning", "description": "Video Masterclass on Sql & Relational Databases.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Sql & Relational Databases", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLQnljOFTspQUNnKWGzvLmqAzboPzQKaxn", "completed": false},
      {"id": "d34525c7-78f8-41e9-85f0-e53d0074a875", "title": "Database Query Optimization & Transaction Internals", "description": "Video Masterclass on Sql & Relational Databases.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Sql & Relational Databases", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLmXKhU9FNesR1rSES7oLdJaNFgmuj0SYVDEVASTRA \u2022 Career Readiness Operating System Verified YouTube Video Curriculum (18 Domains)Exclusive Video Masterclasses \u2022 English & Hindi Tracks Page 1 of 7", "completed": false},
      {"id": "7f4df2dc-9413-4e47-8f9a-ce49636e86da", "title": "Machine Learning for Everybody - Full Course", "description": "Video Masterclass on Sql & Relational Databases.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Sql & Relational Databases", "duration": "120 min", "url": "https://www.youtube.com/watch?v=i_LwzRVP7bg", "completed": false},
      {"id": "48c1eafe-b531-4f0d-b62f-0533e9604658", "title": "Machine Learning Complete Playlist from Scratch", "description": "Video Masterclass on Sql & Relational Databases.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Sql & Relational Databases", "duration": "120 min", "url": "https://www.youtube.com/playlist?list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLujYhhA", "completed": false},
      {"id": "a7d7f48d-7ced-4e8f-9546-8006c9e48e05", "title": "Practical Machine Learning with Python & Scikit- Learn", "description": "Video Masterclass on Sql & Relational Databases.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Sql & Relational Databases", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLQVvvaa0QuDfKTOs3Keq_kaG2P55YRn5v", "completed": false},
      {"id": "1ab8f31c-11bd-436f-a7cf-e075b2090800", "title": "Complete Machine Learning Course with Real Projects", "description": "Video Masterclass on Sql & Relational Databases.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Sql & Relational Databases", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLZoTAELRMXVPBTrWtJkn3wVQxZkmTXGwe", "completed": false},
      {"id": "eb43e615-db8a-4d58-9a07-b9c2cfb53ea7", "title": "Stanford CS229: Machine Learning Course by Andrew Ng", "description": "Video Masterclass on Sql & Relational Databases.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Sql & Relational Databases", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU", "completed": false},
      {"id": "9fdd9f61-812e-48ff-8965-8bf85cd14f53", "title": "Deep Learning & Transformer Math Specialization", "description": "Video Masterclass on Sql & Relational Databases.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Sql & Relational Databases", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLKnIA16_RmvYuZauWaPlRTC54KxQRKtNn", "completed": false},
      {"id": "2d67e19c-6dfa-401b-be33-46bedd8d7f70", "title": "Data Analysis with Python - Full 4-Hour Course", "description": "Video Masterclass on Data Analysis.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Data Analysis", "duration": "120 min", "url": "https://www.youtube.com/watch?v=r-uOLxNrNk8", "completed": false},
      {"id": "61686ba9-880b-4b2f-ac57-c57db2a916e9", "title": "Data Analysis with Python Full Series", "description": "Video Masterclass on Data Analysis.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Data Analysis", "duration": "120 min", "url": "https://www.youtube.com/playlist?list=PLKnIA16_Rmvb8g_1j_j8_v8Vsh_Wv2p3m", "completed": false},
      {"id": "f361fae4-90c1-4d61-88bb-026f86662b10", "title": "Data Analyst Full Portfolio Project Series", "description": "Video Masterclass on Data Analysis.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Data Analysis", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLUaB-1hjhk8H48Pj32z4GZgGWyylqv85f", "completed": false},
      {"id": "eca59aca-ea28-4301-b9d0-3af5c4111346", "title": "Pandas, NumPy & Matplotlib Masterclass", "description": "Video Masterclass on Data Analysis.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Data Analysis", "duration": "90 min", "url": "https://www.youtube.com/watch?v=rhPSo433HNk", "completed": false},
      {"id": "523daaf4-2c01-4132-a05e-e05a9c5409b3", "title": "Statistics & Exploratory Data Analysis for Analysts", "description": "Video Masterclass on Data Analysis.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Data Analysis", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9", "completed": false},
      {"id": "5d74685d-5b7b-4496-b6b6-5ae8570e0c1e", "title": "Statistics & Probability for Data Analytics", "description": "Video Masterclass on Data Analysis.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Data Analysis", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLZoTAELRMXVMhVyr3Ri9IQ-t5QPBtxAUO", "completed": false},
      {"id": "2dfb7c84-82a5-4999-be51-92eeec674914", "title": "HTML and CSS Tutorial for 2024 - Full Beginner Course", "description": "Video Masterclass on Html & Css.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Html & Css", "duration": "120 min", "url": "https://www.youtube.com/watch?v=G3e-cpL7ofc", "completed": false},
      {"id": "a026823c-8512-4492-a1c3-c4119d63be18", "title": "HTML & CSS Complete One-Shot Web Development", "description": "Video Masterclass on Html & Css.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Html & Css", "duration": "120 min", "url": "https://www.youtube.com/watch?v=HcOc7P5BMi4", "completed": false},
      {"id": "66487a0f-b9bb-4a56-8cea-39283613f619", "title": "CSS Flexbox & CSS Grid Mastery Playlists", "description": "Video Masterclass on Html & Css.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Html & Css", "duration": "90 min", "url": "https://www.youtube.com/@KevinPowell", "completed": false},
      {"id": "1aa049e2-6a8d-4c14-bce1-5fcc0d231137", "title": "CSS Flexbox & Responsive Layouts in Hindi", "description": "Video Masterclass on Html & Css.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Html & Css", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLwGdqUZWnOp3t3qT7pvAznwUDzKbhEkCc", "completed": false},
      {"id": "6aa833ba-dafd-4037-894a-b769e9020d78", "title": "Advanced CSS Animations, Architecture & 3D Transforms", "description": "Video Masterclass on Html & Css.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Html & Css", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PL0zVEGEvSaeEfpxA6yY5_jZ3_a2gA2hB4", "completed": false},
      {"id": "ea1b2c60-b2d8-415b-9bdd-44c8d4e18e60", "title": "Advanced CSS Layouts & Browser Engine Optimization", "description": "Video Masterclass on Html & Css.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Html & Css", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLfEr2kn3s-br8gXs5kcBD-8jtseGbTvo8DEVASTRA \u2022 Career Readiness Operating System Verified YouTube Video Curriculum (18 Domains)Exclusive Video Masterclasses \u2022 English & Hindi Tracks Page 2 of 7", "completed": false},
      {"id": "f7ece62c-5cc4-45c6-85a5-1d79771c56ba", "title": "Node.js and Express.js - Full Course for Beginners", "description": "Video Masterclass on Html & Css.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Html & Css", "duration": "120 min", "url": "https://www.youtube.com/watch?v=Oe421EPjeBE", "completed": false},
      {"id": "fa499f56-a868-4a84-9ead-7029e4bec70c", "title": "Node.js & Express.js Tutorial for Beginners in Hindi", "description": "Video Masterclass on Html & Css.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Html & Css", "duration": "120 min", "url": "https://www.youtube.com/playlist?list=PLwGdqUZWnOp00IbeN0OtL9dnnGh4MA5dB", "completed": false},
      {"id": "a3d3d7c1-ce68-4a8d-927f-66050feb873f", "title": "Node.js REST API Masterclass with Express & MongoDB", "description": "Video Masterclass on Html & Css.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Html & Css", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLillGF-RfqbZ2ybcoD2OamnW2s3tLSAWs", "completed": false},
      {"id": "513499ce-cdde-4e32-9d73-b470a91e8756", "title": "Complete Backend Engineering with Node.js Series", "description": "Video Masterclass on Html & Css.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Html & Css", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLinedj3B30sDby4Al-i13hQYoTVtUgwzt", "completed": false},
      {"id": "5ba7f86a-2967-4c12-b6cb-8a3602430e20", "title": "Node.js Event Loop, Libuv & Worker Threads Deep Dive", "description": "Video Masterclass on Html & Css.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Html & Css", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLQnljOFTspQXjDSt3hT1e4q3tK8wSg7Wk", "completed": false},
      {"id": "6f7048c2-004b-4059-8546-bd7379886318", "title": "Advanced Node.js Internals, WebSockets & Redis Pub/Sub", "description": "Video Masterclass on Html & Css.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Html & Css", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLinedj3B30sBgW9s_14vH0bE4e_Z-1sO1", "completed": false},
      {"id": "9fd3189d-7f17-4ce8-b368-6fd6a4d09ae5", "title": "Git and GitHub for Beginners - Crash Course", "description": "Video Masterclass on Git & Github.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Git & Github", "duration": "120 min", "url": "https://www.youtube.com/watch?v=RGOj5yH7evk", "completed": false},
      {"id": "ddfcbf25-5d27-45f7-b9a8-c9e1e6732bdb", "title": "Git & GitHub Complete Tutorial in One Video", "description": "Video Masterclass on Git & Github.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Git & Github", "duration": "120 min", "url": "https://www.youtube.com/watch?v=Ez8F0nW6S-w", "completed": false},
      {"id": "e614a72f-84c1-4033-bede-a98c2601a67f", "title": "Git Branching, Rebase & Interactive Workflows", "description": "Video Masterclass on Git & Github.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Git & Github", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PL-osiE80TeTuRUfjRe54Eea17-YfnOOAx", "completed": false},
      {"id": "7b0baa21-02d9-4eb6-a242-6d12501de3bb", "title": "Complete Git, GitHub & Open Source Contribution", "description": "Video Masterclass on Git & Github.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Git & Github", "duration": "90 min", "url": "https://www.youtube.com/watch?v=apGV9Kg7ics", "completed": false},
      {"id": "0a5a61ee-d178-4704-8067-45df9cc07527", "title": "Git Internals & Plumbing Commands Deep Dive", "description": "Video Masterclass on Git & Github.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Git & Github", "duration": "60 min", "url": "https://www.youtube.com/watch?v=P6jD966jzlk", "completed": false},
      {"id": "714d4376-6167-402b-904a-5c3a0c00741b", "title": "Git CI/CD Workflows & GitHub Actions In-Depth", "description": "Video Masterclass on Git & Github.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Git & Github", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige", "completed": false},
      {"id": "b7b8181b-0313-447d-8954-81eb01daf2db", "title": "Docker Tutorial for Beginners - Full Free Course", "description": "Video Masterclass on Docker.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Docker", "duration": "120 min", "url": "https://www.youtube.com/watch?v=3c-iBn73dDE", "completed": false},
      {"id": "f8d6096d-fe82-4f32-ac5f-c58ed68d10f7", "title": "Docker Tutorial for Beginners in One Shot", "description": "Video Masterclass on Docker.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Docker", "duration": "120 min", "url": "https://www.youtube.com/watch?v=3c-iBn73dDE", "completed": false},
      {"id": "d3c9b7d1-2e6f-436d-a849-5e1e90d55261", "title": "Docker Compose Multi-Container Orchestration Course", "description": "Video Masterclass on Docker.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Docker", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLwvrYc43l1Mxv_iP7Rz8P_s3gM1kP14e8", "completed": false},
      {"id": "1f34d397-2cd8-4555-9eaf-8e15aff66721", "title": "Docker Zero to Hero Masterclass for DevOps", "description": "Video Masterclass on Docker.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Docker", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLdpzxOOAlwvI0O4pejC1CNQvH1ndHl8Jb", "completed": false},
      {"id": "98c573a3-8872-4be3-a9cd-446765eb1e6e", "title": "Production Docker, Multi-Stage Builds & Distroless", "description": "Video Masterclass on Docker.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Docker", "duration": "60 min", "url": "https://www.youtube.com/@BretFisherDockerandDevOps", "completed": false},
      {"id": "010eb019-2a54-477f-815e-8b75277ad3d3", "title": "Docker Production Best Practices & Security Auditing", "description": "Video Masterclass on Docker.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Docker", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLlfy9GnSVerQ9UvUe_g_k9S9U_KzW2Xm1DEVASTRA \u2022 Career Readiness Operating System Verified YouTube Video Curriculum (18 Domains)Exclusive Video Masterclasses \u2022 English & Hindi Tracks Page 3 of 7", "completed": false},
      {"id": "de909680-aae8-4a29-b7c7-68443ff6e494", "title": "AWS Certified Cloud Practitioner Certification Course", "description": "Video Masterclass on Docker.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Docker", "duration": "120 min", "url": "https://www.youtube.com/watch?v=SOTamWNgDKc", "completed": false},
      {"id": "597d14a4-ae5a-4847-9b90-4935f4a3c378", "title": "AWS Cloud Practitioner Complete Course in Hindi", "description": "Video Masterclass on Docker.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Docker", "duration": "120 min", "url": "https://www.youtube.com/playlist?list=PLdpzxOOAlwvLNOxX0RfndiYSt1LeQdaoe", "completed": false},
      {"id": "f5b4d103-120c-4072-ae09-2de3fd656b81", "title": "AWS Solutions Architect Associate Full Course", "description": "Video Masterclass on Docker.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Docker", "duration": "90 min", "url": "https://www.youtube.com/watch?v=Ia-UEYYR44s", "completed": false},
      {"id": "010f814d-2dcd-4e1b-a4d8-b10099655a01", "title": "AWS Solutions Architect Associate Complete Hindi Course", "description": "Video Masterclass on Docker.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Docker", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PL6XT0grm_Tfhurxhy__i9p_Y_H8NfE4kZ", "completed": false},
      {"id": "74ee93e7-8b54-4066-a221-e226ac000feb", "title": "Enterprise Cloud Architecture & Well-Architected Framework", "description": "Video Masterclass on Docker.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Docker", "duration": "60 min", "url": "https://www.youtube.com/@AWSEventsChannel", "completed": false},
      {"id": "e41b6e56-bead-470c-a104-b82482c7cc87", "title": "Terraform & Multi-Cloud Infrastructure Automation", "description": "Video Masterclass on Docker.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Docker", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLlfy9GnSVerTp8k2g_B3FkHj8iUvH4pA1", "completed": false},
      {"id": "39eb8b23-5024-4eff-ba39-d7d7c50af423", "title": "Cybersecurity Full Course for Beginners", "description": "Video Masterclass on Cybersecurity.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Cybersecurity", "duration": "120 min", "url": "https://www.youtube.com/watch?v=inWWhr5tnEA", "completed": false},
      {"id": "e738f42a-bc06-45b2-8ba9-e7c5c6a33b3a", "title": "Cyber Security Full Course for Beginners in Hindi", "description": "Video Masterclass on Cybersecurity.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Cybersecurity", "duration": "120 min", "url": "https://www.youtube.com/playlist?list=PLjVLYmvl5V-c84G954g_2mI-k5gDugj9F", "completed": false},
      {"id": "73466492-1b14-42c1-9d24-0b67213999f2", "title": "Web Application Penetration Testing & OWASP Top 10", "description": "Video Masterclass on Cybersecurity.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Cybersecurity", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLLKT__MCUeix3O0DPbHAauZ_smNUeyN66", "completed": false},
      {"id": "13d05476-657f-4034-a4c8-47700f3328e0", "title": "Ethical Hacking & Bug Bounty Course in Hindi", "description": "Video Masterclass on Cybersecurity.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Cybersecurity", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PL2-Zstn48l8Bq6Jq_K4eZ1e1a_1bX_8Xk", "completed": false},
      {"id": "c2b103f0-460d-41c7-b3f2-7650ac3f9f2b", "title": "Binary Exploitation & Reverse Engineering Series", "description": "Video Masterclass on Cybersecurity.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Cybersecurity", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLhixgUqwRTjxglIswKp9mpkfPNfHcGzye", "completed": false},
      {"id": "70863bd5-6a9c-4968-89a8-2919ea2bb7ca", "title": "Advanced Penetration Testing, Metasploit & Wireless Attacks", "description": "Video Masterclass on Cybersecurity.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Cybersecurity", "duration": "60 min", "url": "https://www.youtube.com/c/TechChip/playlists", "completed": false},
      {"id": "025ee3a6-ed25-4efd-bb44-c2746820da06", "title": "Figma UI/UX Design Essentials Course", "description": "Video Masterclass on Ui/Ux Design.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Ui/Ux Design", "duration": "120 min", "url": "https://www.youtube.com/watch?v=c9Wg6Cb_YlU", "completed": false},
      {"id": "2cece752-90d2-4b8e-b7e8-fb170d78db4e", "title": "UI/UX Design Full Course for Beginners in Hindi", "description": "Video Masterclass on Ui/Ux Design.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Ui/Ux Design", "duration": "120 min", "url": "https://www.youtube.com/playlist?list=PLjVLYmvl5V-d5k_hU73N_g3L5n7I1K5_4", "completed": false},
      {"id": "3b33f2a8-0ec3-4fc1-bab2-ee1c21fdce26", "title": "Advanced Figma UI Design & Auto-Layout Masterclass", "description": "Video Masterclass on Ui/Ux Design.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Ui/Ux Design", "duration": "90 min", "url": "https://www.youtube.com/@Mizko", "completed": false},
      {"id": "a2986687-1070-4801-ade8-4cbb6f179408", "title": "Figma UI/UX Design Masterclass & Components in Hindi", "description": "Video Masterclass on Ui/Ux Design.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Ui/Ux Design", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLlHtucAD9KT3k_7c1p4hB4e7A9hI0a1rT", "completed": false},
      {"id": "70e0347a-7f97-4518-9cef-c6b5ff97db48", "title": "UX Research Methodologies & Usability Heuristics", "description": "Video Masterclass on Ui/Ux Design.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Ui/Ux Design", "duration": "60 min", "url": "https://www.youtube.com/@NNgroup", "completed": false},
      {"id": "0dfb9d43-3072-4a3f-90ff-0251aa7e45ee", "title": "Product Design Case Studies & Systems in Hindi", "description": "Video Masterclass on Ui/Ux Design.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Ui/Ux Design", "duration": "60 min", "url": "https://www.youtube.com/c/SaptarshiPrakashDEVASTRA \u2022 Career Readiness Operating System Verified YouTube Video Curriculum (18 Domains)Exclusive Video Masterclasses \u2022 English & Hindi Tracks Page 4 of 7", "completed": false},
      {"id": "0715053b-7552-4ac1-b0f9-d9c36e2c5a06", "title": "Java Tutorial for Beginners - Full Course", "description": "Video Masterclass on Ui/Ux Design.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Ui/Ux Design", "duration": "120 min", "url": "https://www.youtube.com/watch?v=eIrMbAQSU34", "completed": false},
      {"id": "c6ff9942-eacf-4e60-a1f3-3d0518e2a846", "title": "Java Tutorial for Beginners with Placement Guidance", "description": "Video Masterclass on Ui/Ux Design.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Ui/Ux Design", "duration": "120 min", "url": "https://www.youtube.com/watch?v=yRpLlJmRo2w", "completed": false},
      {"id": "5b37ebf3-4a55-4367-8bf6-9eb38df45968", "title": "Java Spring Boot Full Course for Beginners", "description": "Video Masterclass on Ui/Ux Design.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Ui/Ux Design", "duration": "90 min", "url": "https://www.youtube.com/watch?v=9SGDpanrc8U", "completed": false},
      {"id": "41a7bca1-5b4e-4e2e-89f6-770575416a35", "title": "Java Collections & OOPs In-Depth Masterclass", "description": "Video Masterclass on Ui/Ux Design.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Ui/Ux Design", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_Um3429L8S0-zHajX_F7z", "completed": false},
      {"id": "68cd4023-6c9c-4ce2-bc8f-48c870a1ebeb", "title": "JVM Architecture & High-Performance Java Concurrency", "description": "Video Masterclass on Ui/Ux Design.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Ui/Ux Design", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLrn-z3-W7bYnrS9nS475y5yT3K9b5R2rK", "completed": false},
      {"id": "b11f5d33-0846-4d4a-a0f0-ec6b56eb96e3", "title": "Java Multithreading & Spring Boot Microservices in Hindi", "description": "Video Masterclass on Ui/Ux Design.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Ui/Ux Design", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLsyeobzWxl7rji_K_bC_y_E_y_4k_oA-j", "completed": false},
      {"id": "f5795436-10f2-4f9b-8d5a-57768124841f", "title": "C++ Tutorial for Beginners - Full Course", "description": "Video Masterclass on C++.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "C++", "duration": "120 min", "url": "https://www.youtube.com/watch?v=vLnPwxZdW4Y", "completed": false},
      {"id": "84459632-0c00-4225-9c8e-b77cd40e4bc6", "title": "C++ Full Course for Beginners with DSA Foundation", "description": "Video Masterclass on C++.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "C++", "duration": "120 min", "url": "https://www.youtube.com/playlist?list=PLu0W_9lII9agpFUAlPFe_VNSlXW5uE0YL", "completed": false},
      {"id": "07ff02a3-409d-46bb-87ab-3fffc17cb0d4", "title": "C++ Series (Pointers, Memory, Smart Pointers & STL)", "description": "Video Masterclass on C++.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "C++", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLlrATfBNZ98dudnM48yfGUldqGD0S4G5b", "completed": false},
      {"id": "7da4da00-83a9-4d60-b61c-9ff95ae5af60", "title": "C++ STL & Object-Oriented Programming for Placements", "description": "Video Masterclass on C++.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "C++", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz", "completed": false},
      {"id": "d37491b7-da65-4509-ba68-746bc959076b", "title": "Modern C++ (C++20/C++23) Metaprogramming & Optimization", "description": "Video Masterclass on C++.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "C++", "duration": "60 min", "url": "https://www.youtube.com/user/CppCon", "completed": false},
      {"id": "b25bbf72-d361-4d4f-87a3-99f0473c453c", "title": "Advanced C++ Memory Architecture & Low-Level Systems", "description": "Video Masterclass on C++.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "C++", "duration": "60 min", "url": "https://www.youtube.com/c/GateSmashers/playlists", "completed": false},
      {"id": "7273379e-50eb-42fc-b631-41bc7647b264", "title": "Go Programming Language Tutorial - Full Course", "description": "Video Masterclass on Golang (Go).", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Golang (Go)", "duration": "120 min", "url": "https://www.youtube.com/watch?v=YS4e4q9oBaU", "completed": false},
      {"id": "fabad180-cb32-4514-a254-2f248c8fa45b", "title": "Golang Complete Tutorial for Beginners in Hindi", "description": "Video Masterclass on Golang (Go).", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Golang (Go)", "duration": "120 min", "url": "https://www.youtube.com/playlist?list=PL5dTjWUk_cPbqKSh_Q_5vNfX6Xp_0F68j", "completed": false},
      {"id": "288ebf62-2b6f-4f02-91da-5428daf04e32", "title": "Golang Microservices Tutorial Series", "description": "Video Masterclass on Golang (Go).", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Golang (Go)", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLmD83V1RqHYvdv54634ReJ53AsbQYBPPP", "completed": false},
      {"id": "ad6052b4-5d93-400a-8f44-942436b8135f", "title": "Golang Web Development & Backend Microservices", "description": "Video Masterclass on Golang (Go).", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Golang (Go)", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLinedj3B30sBvW6i-yY3P30pG_LwzVp5U", "completed": false},
      {"id": "a080ea5f-5eb9-4925-ac02-97f342bef8bb", "title": "Ultimate Go & Memory Profiling Concurrency Patterns", "description": "Video Masterclass on Golang (Go).", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Golang (Go)", "duration": "60 min", "url": "https://www.youtube.com/@ArdanLabs", "completed": false},
      {"id": "80aa0a7d-6c58-4d6f-9274-4501a0dd1e4c", "title": "Advanced Go Concurrency, Mutex, Waitgroups & Channels", "description": "Video Masterclass on Golang (Go).", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Golang (Go)", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PL5dTjWUk_cPaK-7kO6wZ6_P1_xU4v8V0pDEVASTRA \u2022 Career Readiness Operating System Verified YouTube Video Curriculum (18 Domains)Exclusive Video Masterclasses \u2022 English & Hindi Tracks Page 5 of 7", "completed": false},
      {"id": "f80c90b0-aeb9-4709-a157-ed0ea2eecd49", "title": "Kubernetes Course for Beginners - Complete Crash Course", "description": "Video Masterclass on Golang (Go).", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Golang (Go)", "duration": "120 min", "url": "https://www.youtube.com/watch?v=X48VuDVv0do", "completed": false},
      {"id": "1dc5b2fb-5ced-417e-b2cc-6fd22f7cb98e", "title": "Kubernetes Tutorial for Beginners in Hindi", "description": "Video Masterclass on Golang (Go).", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Golang (Go)", "duration": "120 min", "url": "https://www.youtube.com/playlist?list=PLdpzxOOAlwvIKMhk8WhzN1bYoJ1Ag8CDB", "completed": false},
      {"id": "a320b4bb-9439-484b-88b9-a9041df0f0e0", "title": "Kubernetes Hands-on Labs & Architecture Playlist", "description": "Video Masterclass on Golang (Go).", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Golang (Go)", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PL2_OBreMn7FqZCh3QKtKGEk_0d8jN77uA", "completed": false},
      {"id": "44bdd8e2-06dc-4e5c-8701-b78479fbcc80", "title": "Kubernetes Zero to Hero in Hindi for DevOps Engineers", "description": "Video Masterclass on Golang (Go).", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Golang (Go)", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLlfy9GnSVerTp8k2g_B3FkHj8iUvH4pA1", "completed": false},
      {"id": "c7cccb9e-fe00-4c58-9913-c8df2980ec1f", "title": "Certified Kubernetes Administrator (CKA) Full Prep Course", "description": "Video Masterclass on Golang (Go).", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Golang (Go)", "duration": "60 min", "url": "https://www.youtube.com/watch?v=d6WC5n9G_sM", "completed": false},
      {"id": "a1f28dc5-e5a2-40e2-8e7b-d6266826877e", "title": "Advanced Kubernetes (CKA & CKS Exam Track in Hindi)", "description": "Video Masterclass on Golang (Go).", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Golang (Go)", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLdpzxOOAlwvJdsW6A0jCz_3VaANuFMLpc", "completed": false},
      {"id": "8c2424cb-57c6-4d61-a28b-6946785abf2b", "title": "Python for Beginners - Full Course (Programming with Mosh)", "description": "Video Masterclass on Python.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Python", "duration": "120 min", "url": "https://www.youtube.com/watch?v=_uQrJ0TkZlc", "completed": false},
      {"id": "eb755e8f-8fc3-491e-ae5b-b66aa628fdbf", "title": "Python 100 Days of Code Full Course in Hindi", "description": "Video Masterclass on Python.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "Python", "duration": "120 min", "url": "https://www.youtube.com/playlist?list=PLu0W_9lII9agwh1XjRt242xIpHhPT2DDg", "completed": false},
      {"id": "68c348a6-8a14-46c3-9671-8e039caba13e", "title": "Python OOP, Decorators & Design Patterns Series", "description": "Video Masterclass on Python.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Python", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PL-osiE80TeTt2d9bfVyQKpuMVwpBQ9nGW", "completed": false},
      {"id": "c2f8ff87-de3a-4ab0-b93a-bd69702eaa95", "title": "Advanced Python Programming Concepts in Hindi", "description": "Video Masterclass on Python.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "Python", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLwgFb6VsUj_lQTpQKDtLXKXElQychpd_2", "completed": false},
      {"id": "e5bac8d8-d1fb-4c81-bcf3-4b83ce7c2c95", "title": "Modern Python Architecture, Metaclasses & AsyncIO", "description": "Video Masterclass on Python.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Python", "duration": "60 min", "url": "https://www.youtube.com/@ArjanCodes", "completed": false},
      {"id": "507da2f9-e6ec-45aa-9a38-722db65c033f", "title": "Python Multiprocessing, Concurrency & Asyncio in Hindi", "description": "Video Masterclass on Python.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "Python", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLbGui_ZYuhiiaQ5pNJpXXpXF8OUxrnsqQ", "completed": false},
      {"id": "d6e89cd2-f92b-471a-bfe0-50deea1be85b", "title": "React Course 2024 - Beginner to Professional", "description": "Video Masterclass on React.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "React", "duration": "120 min", "url": "https://www.youtube.com/watch?v=bMknfKXIFA8", "completed": false},
      {"id": "1ee6ca62-47cd-4965-9d4e-ecd16f7a845b", "title": "Chai aur React JS Full Course in Hindi", "description": "Video Masterclass on React.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "React", "duration": "120 min", "url": "https://www.youtube.com/playlist?list=PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige", "completed": false},
      {"id": "c9b42bbc-0051-4b64-a645-0e275877c8ae", "title": "React Hooks, Context API & Custom Hooks Masterclass", "description": "Video Masterclass on React.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "React", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLZlA0Gpn_vH8EtggFGERCwMY56Jr9VO37", "completed": false},
      {"id": "92164417-e2a2-425f-8778-aaafb8da7850", "title": "React JS Complete Master Series with 5 Projects", "description": "Video Masterclass on React.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "React", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLwGdqUZWnOp3aROg4wypcRhZqJG3ajZWJ", "completed": false},
      {"id": "69b97302-7d64-4473-9543-c0235915ce17", "title": "React Fiber Internals & Performance Optimization", "description": "Video Masterclass on React.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "React", "duration": "60 min", "url": "https://www.youtube.com/@jherr", "completed": false},
      {"id": "0b7df42d-99c3-404a-824d-1ad43007fb21", "title": "Advanced React, Redux Toolkit & Next.js Foundation", "description": "Video Masterclass on React.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "React", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37DEVASTRA \u2022 Career Readiness Operating System Verified YouTube Video Curriculum (18 Domains)Exclusive Video Masterclasses \u2022 English & Hindi Tracks Page 6 of 7", "completed": false},
      {"id": "e4f441f9-b734-4ce3-b66d-6e1dca82c94e", "title": "JavaScript Tutorial for Beginners: 3-Hour Crash Course", "description": "Video Masterclass on React.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "React", "duration": "120 min", "url": "https://www.youtube.com/watch?v=W6NZfCO5SIk", "completed": false},
      {"id": "5a3bbb52-9c78-419a-91d8-7967cddb7966", "title": "Chai aur JavaScript Full Playlist from Scratch", "description": "Video Masterclass on React.", "resource_type": "Video", "difficulty_level": "Beginner", "skill_category": "React", "duration": "120 min", "url": "https://www.youtube.com/playlist?list=PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37", "completed": false},
      {"id": "b36136d2-4dbc-45f0-87fc-8c5550272bd3", "title": "Namaste JavaScript (Season 1 & 2) - Akshay Saini", "description": "Video Masterclass on React.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "React", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvPETQAlHsvcHi", "completed": false},
      {"id": "dd562efa-3f26-43e6-8bcf-332afe16aafd", "title": "Namaste JavaScript (Call Stack, Closures & Event Loop)", "description": "Video Masterclass on React.", "resource_type": "Video", "difficulty_level": "Intermediate", "skill_category": "React", "duration": "90 min", "url": "https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvPETQAlHsvcHi", "completed": false},
      {"id": "b3ab1346-a3ef-4c59-ba9f-07cce9b59640", "title": "JavaScript V8 Engine Optimization & Concurrency", "description": "Video Masterclass on React.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "React", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PL4cUxeGkcC9i9SO37a4422TEFGTuG3031", "completed": false},
      {"id": "56f8fc07-e04e-48d8-a0f3-98799cc1420b", "title": "Advanced JavaScript V8 Engine & Execution Internals", "description": "Video Masterclass on React.", "resource_type": "Video", "difficulty_level": "Advanced", "skill_category": "React", "duration": "60 min", "url": "https://www.youtube.com/playlist?list=PLbtI3_V4BLTMuUu-aWzO_O_mF6E3qf3xJDEVASTRA \u2022 Career Readiness Operating System Verified YouTube Video Curriculum (18 Domains)Exclusive Video Masterclasses \u2022 English & Hindi Tracks Page 7 of 7", "completed": false},
      {"id": "4e420eb1-0412-447d-9a93-6b992f71852b", "title": "Django Introduction & Basic Syntax", "description": "In-depth written tutorial covering Django.", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "Django", "duration": "15 min", "url": "https://www.w3schools.com/django/", "completed": false},
      {"id": "183e5d25-e3a2-45eb-96dd-2e5a20a4062e", "title": "Django Tutorial - Models, Views & URL Routing", "description": "In-depth written tutorial covering Django.", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "Django", "duration": "30 min", "url": "https://www.geeksforgeeks.org/django-tutorial/", "completed": false},
      {"id": "9b204bbd-df36-40ab-bfb4-de52407f6f09", "title": "Building REST APIs with Django REST Framework (DRF)", "description": "In-depth written tutorial covering Django.", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "Django", "duration": "45 min", "url": "https://www.geeksforgeeks.org/python/how-to-create-a-basic-api-using-django-rest-framework/", "completed": false},
      {"id": "7d35abcd-ea63-4fce-b139-dc4b6a74cf84", "title": "SQL Tutorial - Interactive Querying & CRUD Commands", "description": "In-depth written tutorial covering Sql & Relational Databases.", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "Sql & Relational Databases", "duration": "15 min", "url": "https://www.w3schools.com/sql/", "completed": false},
      {"id": "81900f43-e8f9-42bc-aa32-6bef1108782c", "title": "SQL Tutorial - Joins, Group By, Subqueries", "description": "In-depth written tutorial covering Sql & Relational Databases.", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "Sql & Relational Databases", "duration": "30 min", "url": "https://www.w3schools.com/sql/sql_join.asp", "completed": false},
      {"id": "010fcc99-d2a9-4012-9522-d6434a040749", "title": "Advanced SQL: Window Functions & Indexing", "description": "In-depth written tutorial covering Sql & Relational Databases.", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "Sql & Relational Databases", "duration": "45 min", "url": "https://www.geeksforgeeks.org/sql/sql-advanced-functions/", "completed": false},
      {"id": "314d51cd-cb88-4665-8553-c526c8ea9733", "title": "Machine Learning Tutorial - Practical Python ML", "description": "In-depth written tutorial covering Machine Learning (Ml).", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "Machine Learning (Ml)", "duration": "15 min", "url": "https://www.w3schools.com/python/python_ml_getting_started.asp", "completed": false},
      {"id": "099a8ca9-d46f-4e41-af2b-b15df1e3540e", "title": "Supervised & Unsupervised Learning Algorithms", "description": "In-depth written tutorial covering Machine Learning (Ml).", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "Machine Learning (Ml)", "duration": "30 min", "url": "https://www.geeksforgeeks.org/machine-learning/", "completed": false},
      {"id": "07e0eb2e-d8f6-448c-9d9f-9ec48d0c9e9e", "title": "Deep Learning & Neural Networks Architecture", "description": "In-depth written tutorial covering Machine Learning (Ml).", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "Machine Learning (Ml)", "duration": "45 min", "url": "https://www.geeksforgeeks.org/deep-learning/deep-learning-101/DEVASTRA \u2022 Written Docs & Tutorials Directory GeeksforGeeks vs W3Schools Verified CurriculumUnique & Valid URLs per Tier \u2022 English Track Only Page 1 of 5", "completed": false},
      {"id": "2c91099f-7978-42c3-8e31-c22c918824aa", "title": "Pandas Tutorial - DataFrames & CSV Parsing", "description": "In-depth written tutorial covering Machine Learning (Ml).", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "Machine Learning (Ml)", "duration": "15 min", "url": "https://www.w3schools.com/python/pandas/", "completed": false},
      {"id": "03db764b-4dee-46f0-8f11-8a45efdb6a91", "title": "Data Analysis with Python - Merging & Cleaning", "description": "In-depth written tutorial covering Machine Learning (Ml).", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "Machine Learning (Ml)", "duration": "30 min", "url": "https://www.geeksforgeeks.org/data-analysis-with-python-tutorial/", "completed": false},
      {"id": "f9212c30-56d2-4570-b840-9abb60e7187f", "title": "Data Visualization with Matplotlib", "description": "In-depth written tutorial covering Machine Learning (Ml).", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "Machine Learning (Ml)", "duration": "45 min", "url": "https://www.w3schools.com/python/matplotlib_intro.asp", "completed": false},
      {"id": "9cd9b75f-f42e-468d-ab89-3b0d8f902bd6", "title": "HTML5 Tutorial - Semantic Tags, Forms & Elements", "description": "In-depth written tutorial covering Html & Css.", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "Html & Css", "duration": "15 min", "url": "https://www.w3schools.com/html/", "completed": false},
      {"id": "688b9e87-b1b3-4649-bb4b-558a70ba2946", "title": "CSS Flexbox & Responsive Design", "description": "In-depth written tutorial covering Html & Css.", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "Html & Css", "duration": "30 min", "url": "https://www.w3schools.com/css/css3_flexbox.asp", "completed": false},
      {"id": "186ca9ed-a762-42bc-a168-93e4c96901fc", "title": "CSS3 Animations & Keyframes", "description": "In-depth written tutorial covering Html & Css.", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "Html & Css", "duration": "45 min", "url": "https://www.w3schools.com/css/css3_animations.asp", "completed": false},
      {"id": "55e3e4b8-016c-4e4e-84fd-6a0656b2221d", "title": "Node.js Tutorial - Modules & HTTP Servers", "description": "In-depth written tutorial covering Node.Js.", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "Node.Js", "duration": "15 min", "url": "https://www.w3schools.com/nodejs/", "completed": false},
      {"id": "f2ff4d26-c47c-4630-bab0-1787b2d46389", "title": "Node.js MySQL Database Integration", "description": "In-depth written tutorial covering Node.Js.", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "Node.Js", "duration": "30 min", "url": "https://www.w3schools.com/nodejs/nodejs_mysql.asp", "completed": false},
      {"id": "e2ef9136-8aad-400a-a34c-9023770ffb4c", "title": "Node.js Event Loop & Multithreading", "description": "In-depth written tutorial covering Node.Js.", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "Node.Js", "duration": "45 min", "url": "https://www.geeksforgeeks.org/node-js-event-loop/", "completed": false},
      {"id": "21d346f3-9484-43d0-ac4b-a898896dfafd", "title": "Git Tutorial - init, commit, push, pull", "description": "In-depth written tutorial covering Git & Github.", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "Git & Github", "duration": "15 min", "url": "https://www.w3schools.com/git/", "completed": false},
      {"id": "9491fa15-5bdb-444b-a4e1-58b1eeae912f", "title": "Git Branching, Merging & Conflict Fixes", "description": "In-depth written tutorial covering Git & Github.", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "Git & Github", "duration": "30 min", "url": "https://www.w3schools.com/git/git_branching.asp", "completed": false},
      {"id": "1aeb83b9-9975-4b7e-8606-348b7b8d032f", "title": "Git Internals, Reflog & Rebase Workflows", "description": "In-depth written tutorial covering Git & Github.", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "Git & Github", "duration": "45 min", "url": "https://www.geeksforgeeks.org/git-rebase/DEVASTRA \u2022 Written Docs & Tutorials Directory GeeksforGeeks vs W3Schools Verified CurriculumUnique & Valid URLs per Tier \u2022 English Track Only Page 2 of 5", "completed": false},
      {"id": "9319c8bb-1d37-4576-8c3d-dd16faa643a4", "title": "Docker Tutorial for Beginners - Containers & Images", "description": "In-depth written tutorial covering Git & Github.", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "Git & Github", "duration": "15 min", "url": "https://www.geeksforgeeks.org/docker-tutorial/", "completed": false},
      {"id": "22b2b80a-c42f-4de4-a3ec-29830a860fa3", "title": "Docker Compose & Multi-Container Setup", "description": "In-depth written tutorial covering Git & Github.", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "Git & Github", "duration": "30 min", "url": "https://www.geeksforgeeks.org/docker-compose-tutorial/", "completed": false},
      {"id": "a5110a2e-e2a7-40e5-931d-afcdfa265557", "title": "Docker Architecture & Networking", "description": "In-depth written tutorial covering Git & Github.", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "Git & Github", "duration": "45 min", "url": "https://www.geeksforgeeks.org/docker-architecture/", "completed": false},
      {"id": "f6f79d4b-ad2e-4cff-a18c-0a6d72bd75b4", "title": "Introduction to Cloud Computing & Service Models", "description": "In-depth written tutorial covering Cloud Computing.", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "Cloud Computing", "duration": "15 min", "url": "https://www.geeksforgeeks.org/cloud-computing/", "completed": false},
      {"id": "8db9ada7-7ff7-4e84-9c6c-f6468162932a", "title": "AWS Tutorial - Core Services (EC2, S3, IAM, VPC)", "description": "In-depth written tutorial covering Cloud Computing.", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "Cloud Computing", "duration": "30 min", "url": "https://www.geeksforgeeks.org/aws-tutorial/", "completed": false},
      {"id": "e4ad6cf5-5e9f-4dbb-a401-b15f93252d0b", "title": "Cloud Architecture & Scalability", "description": "In-depth written tutorial covering Cloud Computing.", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "Cloud Computing", "duration": "45 min", "url": "https://www.geeksforgeeks.org/cloud-computing-architecture/", "completed": false},
      {"id": "9e51e57e-c82b-47b6-92e6-9371ea34fcb7", "title": "Cybersecurity Tutorial - Threats & Malware", "description": "In-depth written tutorial covering Cybersecurity.", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "Cybersecurity", "duration": "15 min", "url": "https://www.w3schools.com/cybersecurity/", "completed": false},
      {"id": "6d2e3a69-4bc4-497a-8007-f854cc83f85b", "title": "Cyber Security Tutorial - Firewalls & AppSec", "description": "In-depth written tutorial covering Cybersecurity.", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "Cybersecurity", "duration": "30 min", "url": "https://www.geeksforgeeks.org/cyber-security-tutorial/", "completed": false},
      {"id": "854f94b4-db55-495d-9c30-4551b3d199f5", "title": "Cryptography & Network Security Principles", "description": "In-depth written tutorial covering Cybersecurity.", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "Cybersecurity", "duration": "45 min", "url": "https://www.geeksforgeeks.org/cryptography-and-network-security/", "completed": false},
      {"id": "f8f2bfbb-5916-4fb7-92bc-e8f10101b9ef", "title": "UI/UX Design Tutorial & Principles", "description": "In-depth written tutorial covering Ui/Ux Design.", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "Ui/Ux Design", "duration": "15 min", "url": "https://www.geeksforgeeks.org/ui-ux-design-tutorial/", "completed": false},
      {"id": "cc8adb66-df4e-45d2-b63a-5b282ef6441e", "title": "Figma Tutorial - Auto Layout & Prototyping", "description": "In-depth written tutorial covering Ui/Ux Design.", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "Ui/Ux Design", "duration": "30 min", "url": "https://www.geeksforgeeks.org/figma-tutorial/", "completed": false},
      {"id": "c7d405ae-1a8b-4970-a55e-3fe65afcf561", "title": "User Experience (UX) Design & Architecture", "description": "In-depth written tutorial covering Ui/Ux Design.", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "Ui/Ux Design", "duration": "45 min", "url": "https://www.geeksforgeeks.org/user-experience-ux-design/DEVASTRA \u2022 Written Docs & Tutorials Directory GeeksforGeeks vs W3Schools Verified CurriculumUnique & Valid URLs per Tier \u2022 English Track Only Page 3 of 5", "completed": false},
      {"id": "6509ebcc-ec62-47af-b62d-1e0c1e5154bf", "title": "Java Tutorial - Syntax, OOP, Classes & Methods", "description": "In-depth written tutorial covering Ui/Ux Design.", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "Ui/Ux Design", "duration": "15 min", "url": "https://www.w3schools.com/java/", "completed": false},
      {"id": "2c004e13-05c2-4c01-9367-afc4b2786ef0", "title": "Java Collections Framework Tutorial", "description": "In-depth written tutorial covering Ui/Ux Design.", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "Ui/Ux Design", "duration": "30 min", "url": "https://www.geeksforgeeks.org/java-collection-tutorial/", "completed": false},
      {"id": "5eab7ef1-202f-4972-b29e-1190ff1bbf7a", "title": "Multithreading & Concurrency in Java", "description": "In-depth written tutorial covering Ui/Ux Design.", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "Ui/Ux Design", "duration": "45 min", "url": "https://www.geeksforgeeks.org/multithreading-in-java/", "completed": false},
      {"id": "0d97d35b-5ebc-48e3-9b82-30ab8416ee6b", "title": "C++ Tutorial - Variables, Loops, Functions", "description": "In-depth written tutorial covering C++.", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "C++", "duration": "15 min", "url": "https://www.w3schools.com/cpp/", "completed": false},
      {"id": "6a535a72-9bf4-405a-ab07-f02412ca22a6", "title": "C++ Standard Template Library (STL)", "description": "In-depth written tutorial covering C++.", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "C++", "duration": "30 min", "url": "https://www.geeksforgeeks.org/cpp-stl-tutorial/", "completed": false},
      {"id": "e954c7ec-0ce9-457c-8574-412f985bf7c3", "title": "Smart Pointers & Memory Management in C++", "description": "In-depth written tutorial covering C++.", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "C++", "duration": "45 min", "url": "https://www.geeksforgeeks.org/smart-pointers-cpp/", "completed": false},
      {"id": "6668f5cc-160f-4d6c-b3e3-a98e9cb18dcb", "title": "Go Tutorial - Structs, Arrays, Slices", "description": "In-depth written tutorial covering Golang (Go).", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "Golang (Go)", "duration": "15 min", "url": "https://www.w3schools.com/go/", "completed": false},
      {"id": "afd88752-721f-486b-86f8-c897311a9e7b", "title": "Golang Tutorial - Complete Guide", "description": "In-depth written tutorial covering Golang (Go).", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "Golang (Go)", "duration": "30 min", "url": "https://www.geeksforgeeks.org/golang/", "completed": false},
      {"id": "84942c83-d005-48ae-bef3-28b22df35eaa", "title": "Concurrency in Golang (Goroutines & Channels)", "description": "In-depth written tutorial covering Golang (Go).", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "Golang (Go)", "duration": "45 min", "url": "https://www.geeksforgeeks.org/concurrency-in-golang/", "completed": false},
      {"id": "8dd8edc8-60c6-4fa8-8135-8054422ec701", "title": "Kubernetes Tutorial - Master/Worker Nodes", "description": "In-depth written tutorial covering Kubernetes (K8S).", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "Kubernetes (K8S)", "duration": "15 min", "url": "https://www.geeksforgeeks.org/kubernetes-tutorial/", "completed": false},
      {"id": "a5dc2ab4-2014-4f68-87f0-20efd3611ff3", "title": "Kubernetes Pods & Services", "description": "In-depth written tutorial covering Kubernetes (K8S).", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "Kubernetes (K8S)", "duration": "30 min", "url": "https://www.geeksforgeeks.org/kubernetes-pods/", "completed": false},
      {"id": "d3fe95c2-1258-4359-ad1d-e089e123e1c0", "title": "Kubernetes Architecture & Components", "description": "In-depth written tutorial covering Kubernetes (K8S).", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "Kubernetes (K8S)", "duration": "45 min", "url": "https://www.geeksforgeeks.org/kubernetes-architecture/DEVASTRA \u2022 Written Docs & Tutorials Directory GeeksforGeeks vs W3Schools Verified CurriculumUnique & Valid URLs per Tier \u2022 English Track Only Page 4 of 5", "completed": false},
      {"id": "fe8248c7-ec01-460e-98d5-219ceffae7b2", "title": "Python Tutorial - Syntax, Loops & File I/O", "description": "In-depth written tutorial covering Kubernetes (K8S).", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "Kubernetes (K8S)", "duration": "15 min", "url": "https://www.w3schools.com/python/", "completed": false},
      {"id": "8926785e-7495-44b9-9667-7530f0efaf27", "title": "Python OOPs Concepts & Decorators", "description": "In-depth written tutorial covering Kubernetes (K8S).", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "Kubernetes (K8S)", "duration": "30 min", "url": "https://www.geeksforgeeks.org/python-oops-concepts/", "completed": false},
      {"id": "144b1cca-76f8-4c6a-a3de-a1df0ae5c04f", "title": "Python Multithreading & Concurrency", "description": "In-depth written tutorial covering Kubernetes (K8S).", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "Kubernetes (K8S)", "duration": "45 min", "url": "https://www.geeksforgeeks.org/python-multithreading/", "completed": false},
      {"id": "74d18add-b172-4a9e-b496-e5c53de26e7f", "title": "React Tutorial - JSX, Components", "description": "In-depth written tutorial covering React.", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "React", "duration": "15 min", "url": "https://www.w3schools.com/react/", "completed": false},
      {"id": "75dec083-899d-4ef1-a8f4-a0fce419b32a", "title": "React Hooks (useEffect, useState, useContext)", "description": "In-depth written tutorial covering React.", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "React", "duration": "30 min", "url": "https://www.w3schools.com/react/react_hooks.asp", "completed": false},
      {"id": "0cb528d9-bd25-4508-aa63-e5f81bc840d9", "title": "Redux Toolkit & State Management in React", "description": "In-depth written tutorial covering React.", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "React", "duration": "45 min", "url": "https://www.geeksforgeeks.org/redux-tutorial/", "completed": false},
      {"id": "8508b39d-b1ad-4b77-a164-67dc31c603e9", "title": "JavaScript Tutorial - Syntax & DOM Manipulation", "description": "In-depth written tutorial covering Javascript.", "resource_type": "Article", "difficulty_level": "Beginner", "skill_category": "Javascript", "duration": "15 min", "url": "https://www.w3schools.com/js/", "completed": false},
      {"id": "f11e5ac0-b7f5-4afe-9195-8548d2b5de7d", "title": "JavaScript Asynchronous (Callbacks & Promises)", "description": "In-depth written tutorial covering Javascript.", "resource_type": "Article", "difficulty_level": "Intermediate", "skill_category": "Javascript", "duration": "30 min", "url": "https://www.w3schools.com/js/js_async.asp", "completed": false},
      {"id": "1e1b102a-6594-4261-acaa-b643359e9101", "title": "JS Event Loop, Microtask Queue & Prototypes", "description": "In-depth written tutorial covering Javascript.", "resource_type": "Article", "difficulty_level": "Advanced", "skill_category": "Javascript", "duration": "45 min", "url": "https://www.geeksforgeeks.org/javascript-event-loop/DEVASTRA \u2022 Written Docs & Tutorials Directory GeeksforGeeks vs W3Schools Verified CurriculumUnique & Valid URLs per Tier \u2022 English Track Only Page 5 of 5", "completed": false},
    ];


    try {
      let query = insforge.from('learning_resources').select('*');
      if (filters?.resource_type) query = query.eq('resource_type', filters.resource_type);
      if (filters?.difficulty_level) query = query.eq('difficulty_level', filters.difficulty_level);
      const { data, error } = await query;
      if (error) throw error;
      
      // Prefer the database; only fall back to the bundled offline copy when
      // the table is empty (the list is copied into the DB, not removed here).
      let combined = (data && data.length > 0) ? [...data] : [...mockData];
      
      // Apply filters locally
      if (filters?.resource_type) combined = combined.filter(r => r.resource_type === filters.resource_type);
      if (filters?.difficulty_level) combined = combined.filter(r => r.difficulty_level === filters.difficulty_level);

      if (filters?.search_query) {
        const sq = filters.search_query.toLowerCase();
        combined = combined.filter(r => r.title.toLowerCase().includes(sq) || r.description.toLowerCase().includes(sq) || r.skill_category.toLowerCase().includes(sq));
      }

      // Merge the user's real completion state
      try {
        const { data: { user } } = await insforge.auth.getCurrentUser();
        if (user?.id) {
          const { data: progress } = await insforge.from('user_resource_progress')
            .select('resource_id, completed').eq('user_id', user.id);
          const doneMap = new Map((progress || []).map(p => [p.resource_id, p.completed]));
          combined = combined.map(r => ({ ...r, completed: doneMap.get(r.id) ?? false }));
        }
      } catch { /* progress merge is best-effort */ }

      return { data: combined };
    } catch {
      // Offline fallback
      let combined = [...mockData];
      if (filters?.resource_type) combined = combined.filter(r => r.resource_type === filters.resource_type);
      if (filters?.difficulty_level) combined = combined.filter(r => r.difficulty_level === filters.difficulty_level);

      if (filters?.search_query) {
        const sq = filters.search_query.toLowerCase();
        combined = combined.filter(r => r.title.toLowerCase().includes(sq) || r.description.toLowerCase().includes(sq) || r.skill_category.toLowerCase().includes(sq));
      }

      return { data: combined };
    }
  },
  getPaths: async () => {
    const { data: { user } } = await insforge.auth.getCurrentUser();
    if (!user?.id) return { data: [] };
    const { data, error } = await insforge.from('learning_paths')
      .select('*').eq('user_id', user.id).limit(1);
    if (error) throw error;
    if (!data || data.length === 0) return { data: [] };
    return { data: { nodes: data[0].nodes || [], career_goal: data[0].career_goal } };
  },
  createPath: async (pathData) => {
    const { data: { user } } = await insforge.auth.getCurrentUser();
    if (!user?.id) throw new Error('Not authenticated');
    const payload = {
      nodes: pathData?.nodes || [],
      career_goal: pathData?.career_goal || null,
      updated_at: new Date().toISOString(),
    };
    const { data: existing } = await insforge.from('learning_paths')
      .select('id').eq('user_id', user.id).limit(1);
    if (existing && existing.length > 0) {
      const { data, error } = await insforge.from('learning_paths')
        .update(payload).eq('id', existing[0].id).select();
      if (error) throw error;
      return { data };
    }
    const { data, error } = await insforge.from('learning_paths')
      .insert([{ user_id: user.id, ...payload }]).select();
    if (error) throw error;
    return { data };
  },
  
  suggestGoals: async () => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey) {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            contents: [{ parts: [{ text: "You are an AI career advisor. Generate a JSON array of 4 distinct, exciting tech career goals (e.g. 'Frontend Engineer', 'Cloud Architect'). Reply ONLY with the raw JSON array of strings, nothing else." }] }] 
          })
        });
        const data = await res.json();
        const text = data.candidates[0].content.parts[0].text;
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return { data: JSON.parse(cleaned) };
      }
      return { data: ['Frontend Engineer', 'Backend Engineer', 'Data Scientist', 'DevOps Specialist'] };
    } catch {
      return { data: ['Full Stack Developer', 'Cloud Architect', 'Machine Learning Engineer', 'Web3 Developer'] };
    }
  },
  generatePath: async (goal) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey) {
        const prompt = `The user wants a career roadmap to become a: '${goal}'.
Generate a JSON array of up to 8 roadmap nodes (milestones/skills to learn).
Each object MUST have:
- id (string, e.g., '1', '2')
- title (string, e.g., 'Learn React')
- description (string)
- estimated_hours (number)
- skills_gained (array of strings)

Reply ONLY with the raw JSON array. No markdown, no explanation.`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        const text = data.candidates[0].content.parts[0].text;
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return { data: JSON.parse(cleaned) };
      }
      return { data: [] };
    } catch (err) {
      console.error(err);
      return { data: [] };
    }
  },
  generateTimetable: async (goal, days = 7) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const { data: { user } } = await insforge.auth.getCurrentUser();
      if (!user?.id) throw new Error('Not authenticated');

      if (!apiKey) throw new Error("Gemini API key missing");

      const prompt = `The user wants a study timetable to achieve the goal: '${goal}'.
They want a ${days}-day plan.
The platform has the following types of tasks (you MUST use these 'type' values):
- 'assessment' (Skill assessments)
- 'video' (Watch video masterclass)

Generate a JSON array of daily task objects. Each object should have:
- day (integer 1 to ${days})
- title (short title of the task, specific to a topic in ${goal})
- description (brief explanation of what to do)
- type (one of the exact strings above)
- duration (e.g., '30 min', '1 hr')

CRITICAL RULE: You MUST provide between 3 and 5 tasks per day.
For each day, the tasks MUST include at least:
1. Two tasks of type 'assessment' (testing different sub-topics).
2. One task of type 'video' (learning a new sub-topic).

Distribute tasks across the days to logically progress towards the goal.
Reply ONLY with the raw JSON array. No markdown, no explanation.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      const text = data.candidates[0].content.parts[0].text;
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const tasks = JSON.parse(cleaned);

      // Insert tasks into database
      const today = new Date();
      const inserts = tasks.map(task => {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + (task.day - 1));
        return {
          user_id: user.id,
          title: task.title,
          description: task.description,
          type: task.type,
          duration: task.duration,
          status: 'pending',
          target_date: targetDate.toISOString().split('T')[0],
        };
      });

      // Clear existing pending future tasks
      await insforge.from('daily_planner_targets')
        .delete()
        .eq('user_id', user.id)
        .gte('target_date', today.toISOString().split('T')[0]);

      const { data: created, error } = await insforge.from('daily_planner_targets').insert(inserts).select();
      if (error) throw error;
      return { data: created };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  updateProgress: async (progressData) => {
    const { data: { user } } = await insforge.auth.getCurrentUser();
    if (!user?.id) throw new Error('Not authenticated');

    // Resource completion (Learning Hub "Mark Done")
    if (progressData?.resource_id) {
      const completed = progressData.completed !== false;
      const { data: existing } = await insforge.from('user_resource_progress')
        .select('id').eq('user_id', user.id)
        .eq('resource_id', progressData.resource_id).limit(1);
      if (existing && existing.length > 0) {
        const { error } = await insforge.from('user_resource_progress')
          .update({ completed, completed_at: new Date().toISOString() })
          .eq('id', existing[0].id);
        if (error) throw error;
      } else {
        const { error } = await insforge.from('user_resource_progress').insert([{
          user_id: user.id,
          resource_id: progressData.resource_id,
          completed,
          completed_at: new Date().toISOString(),
        }]);
        if (error) throw error;
      }
      return { data: true };
    }

    // Daily planner target completion
    if (progressData?.target_id) {
      const { error } = await insforge.from('daily_planner_targets')
        .update({ status: 'completed' })
        .eq('id', progressData.target_id)
        .eq('user_id', user.id);
      if (error) throw error;
      return { data: true };
    }

    return { data: true };
  },

  // Create a user-authored daily target (Dashboard "Add Task").
  addTarget: async ({ title, description, type, duration }) => {
    const { data: { user } } = await insforge.auth.getCurrentUser();
    if (!user?.id) throw new Error('Not authenticated');
    if (!title || !String(title).trim()) throw new Error('Task title is required');
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await insforge.from('daily_planner_targets').insert([{
      user_id: user.id,
      title: String(title).trim(),
      description: description || null,
      type: type || 'task',
      duration: duration || '15 min',
      status: 'pending',
      target_date: today,
    }]).select();
    if (error) throw error;
    return { data };
  },

  // Number of learning resources the user has marked complete.
  getCompletedResourceCount: async () => {
    const { data: { user } } = await insforge.auth.getCurrentUser();
    if (!user?.id) return { data: 0 };
    const { data, error } = await insforge.from('user_resource_progress')
      .select('id').eq('user_id', user.id).eq('completed', true);
    if (error) throw error;
    return { data: (data || []).length };
  },

  getDailyPlanner: async () => {
    const { data: { user } } = await insforge.auth.getCurrentUser();
    if (!user?.id) return { data: [] };
    const today = new Date().toISOString().split('T')[0];

    // 1. Check if TODAY specifically already has targets (not just future dates)
    const { data: todayTargets, error: todayErr } = await insforge.from('daily_planner_targets')
      .select('*')
      .eq('user_id', user.id)
      .eq('target_date', today);
    if (todayErr) throw todayErr;

    // 2. Also fetch any future-dated targets (from generated timetables)
    const { data: futureTargets } = await insforge.from('daily_planner_targets')
      .select('*')
      .eq('user_id', user.id)
      .gt('target_date', today)
      .order('target_date', { ascending: true });

    // If today already has targets, return today's + future
    if (todayTargets && todayTargets.length > 0) {
      return { data: [...todayTargets, ...(futureTargets || [])].sort((a, b) => a.target_date.localeCompare(b.target_date)) };
    }

    // 3. Today has NO targets — auto-generate fresh daily missions
    //    Personalize based on the user's actual weak categories from assessment history
    const goal = user?.user_metadata?.target_role || user?.user_metadata?.career_goal || 'Software Engineering';
    const userSkills = user?.user_metadata?.skills || [];

    let weakCategories = [];
    try {
      const { data: history } = await insforge.from('user_assessments')
        .select('percentage, assessment:assessments(title, skill_categories(name))')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(20);
      if (history && history.length > 0) {
        // Find categories where the user scored below 70%
        const categoryScores = {};
        history.forEach(h => {
          const cat = h.assessment?.skill_categories?.name || h.assessment?.title || 'General';
          if (!categoryScores[cat]) categoryScores[cat] = [];
          categoryScores[cat].push(Number(h.percentage) || 0);
        });
        weakCategories = Object.entries(categoryScores)
          .map(([name, scores]) => ({ name, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
          .filter(c => c.avg < 70)
          .sort((a, b) => a.avg - b.avg)
          .slice(0, 3)
          .map(c => c.name);
      }
    } catch (e) {
      console.warn('[getDailyPlanner] assessment history unavailable:', e?.message);
    }

    // Try AI-powered daily mission generation when Gemini API key is available
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey && (weakCategories.length > 0 || userSkills.length > 0)) {
      try {
        const context = weakCategories.length > 0
          ? `Their weak areas (score < 70%) are: ${weakCategories.join(', ')}.`
          : `Their skills are: ${userSkills.join(', ')}.`;
        const prompt = `Generate exactly 3 daily learning tasks for a student targeting the role "${goal}". ${context}
The platform has these task types: 'assessment', 'learning', 'exercise', 'video', 'article', 'mock-interview', 'resume'.
Each task should help them improve their weak areas. Return a JSON array with objects containing: title, description, type, duration.
Reply ONLY with the raw JSON array.`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const aiTasks = JSON.parse(cleaned);
          if (Array.isArray(aiTasks) && aiTasks.length > 0) {
            const inserts = aiTasks.slice(0, 4).map(t => ({
              user_id: user.id,
              title: t.title,
              description: t.description,
              type: t.type || 'task',
              duration: t.duration || '30 min',
              status: 'pending',
              target_date: today,
            }));
            const { data: created, error: insErr } = await insforge.from('daily_planner_targets').insert(inserts).select();
            if (!insErr && created) return { data: [...created, ...(futureTargets || [])] };
          }
        }
      } catch (aiErr) {
        console.warn('[getDailyPlanner] AI generation failed, using smart fallback:', aiErr?.message);
      }
    }

    // Smart fallback: personalized tasks based on weak categories or goal
    const focusArea = weakCategories[0] || goal;
    const inserts = [
      {
        user_id: user.id,
        title: `Assess your ${focusArea} skills`,
        description: `Take a skill assessment to track your progress in ${focusArea}.`,
        type: 'assessment',
        duration: '30 min',
        status: 'pending',
        target_date: today,
      },
      {
        user_id: user.id,
        title: weakCategories.length > 1
          ? `Study ${weakCategories[1]} concepts`
          : `Explore ${goal} Learning Path`,
        description: weakCategories.length > 1
          ? `Focus on improving your understanding of ${weakCategories[1]}.`
          : `Review the recommended resources and roadmap for ${goal}.`,
        type: 'learning',
        duration: '20 min',
        status: 'pending',
        target_date: today,
      },
      {
        user_id: user.id,
        title: `Practice ${focusArea} hands-on`,
        description: `Apply what you've learned in a coding challenge or exercise.`,
        type: 'exercise',
        duration: '45 min',
        status: 'pending',
        target_date: today,
      }
    ];

    const { data: created, error: insErr } = await insforge.from('daily_planner_targets')
      .insert(inserts).select();
    if (insErr) throw insErr;
    return { data: [...(created || []), ...(futureTargets || [])] };
  },
};

export const leaderboardService = {
  getLeaderboard: async (limit = 50) => {
    try {
      const { data, error } = await insforge.rpc('get_leaderboard', { p_limit: limit });
      if (error) throw error;
      return { data: data || [] };
    } catch (err) {
      console.warn('Leaderboard RPC failed, using fallback:', err);
      return { data: [] };
    }
  },
};

export const analyticsService = {
  // Real aggregated analytics computed by a SECURITY DEFINER RPC that is
  // gated to INSTITUTION_ADMIN. No hardcoded fallback arrays.
  getInstitutionAnalytics: async () => {
    const { data, error } = await insforge.rpc('get_institution_analytics');
    if (error) throw error;
    return { data: data || {} };
  },
};

export const industryService = {
  // Deterministic demand-vs-supply intelligence from live jobs vs real student skills.
  getSkillIntelligence: async () => {
    const { data, error } = await insforge.rpc('get_industry_skill_intelligence');
    if (error) throw error;
    return { data: data || [] };
  },
};

export const statsService = {
  getProfile: async () => ({ data: {} }),
};
