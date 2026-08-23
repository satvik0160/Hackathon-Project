import axios from 'axios';
import toast from 'react-hot-toast';

// Axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Network Errors
    if (!error.response) {
      toast.error('Network Error: Please check your connection.');
      return Promise.reject(error);
    }

    // Handle 500 Server Errors
    if (error.response.status >= 500) {
      toast.error('Server Error: We are looking into this glitch.');
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post('/api/users/token/refresh/', { refresh: refreshToken });
          localStorage.setItem('access_token', res.data.access);
          if (res.data.refresh) {
            localStorage.setItem('refresh_token', res.data.refresh);
          }
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          toast.error('Session expired. Please log in again.');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ========== Auth Service ==========
export const authService = {
  login: (credentials) => api.post('/users/login/', credentials),
  register: (data) => api.post('/users/register/', data),
  logout: (refresh) => api.post('/users/logout/', { refresh }),
  refreshToken: (refresh) => api.post('/users/token/refresh/', { refresh }),
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data) => api.patch('/users/profile/', data),
  getSkills: () => api.get('/users/skills/'),
  updateSkills: (data) => api.put('/users/skills/', data),
  onboard: (data) => api.put('/users/onboard/', data),
  passwordReset: (email) => api.post('/users/password-reset/', { email }),
  passwordResetConfirm: (data) => api.post('/users/password-reset/confirm/', data),
};

// ========== Assessment Service ==========
export const assessmentService = {
  getCategories: () => api.get('/assessments/categories/'),
  getAssessments: (params) => api.get('/assessments/', { params }),
  getAssessmentById: (id) => api.get(`/assessments/${id}/`),
  submitAssessment: (id, data) => api.post(`/assessments/${id}/submit/`, data),
  getHistory: () => api.get('/assessments/history/'),
};

// ========== Learning Service ==========
export const learningService = {
  getResources: (params) => api.get('/learning/resources/', { params }),
  getPaths: () => api.get('/learning/paths/'),
  createPath: (data) => api.post('/learning/paths/', data),
  generatePath: () => api.post('/learning/generate/'),
  updateProgress: (id, data) => api.put(`/learning/progress/${id}/`, data),
  getDailyPlanner: () => api.get('/learning/daily-planner/'),
};

// ========== Jobs Service ==========
export const jobService = {
  getListings: (params) => api.get('/jobs/listings/', { params }),
  getMatches: () => api.get('/jobs/match/'),
  skillMatch: (skills, topN = 5) => api.post('/jobs/skill-match/', { skills, top_n: topN }),
  getSkillMatchInfo: () => api.get('/jobs/skill-match/'),
  apply: (data) => api.post('/jobs/apply/', data),
  getApplications: () => api.get('/jobs/applications/'),
  updateApplication: (id, data) => api.patch(`/jobs/applications/${id}/`, data),
  postJob: (data) => api.post('/jobs/industry/post-job/', data),
  mentorFeedback: (data) => api.post('/jobs/industry/mentor-feedback/', data),
};

// ========== AI Service ==========
export const aiService = {
  mockInterview: (data) => api.post('/users/ai/interview/', data),
  resumeTailor: (data) => api.post('/users/ai/resume/', data),
  careerCopilot: (query) => api.post('/users/ai/copilot/', { query }),
};

// ========== Notification Service ==========
export const notificationService = {
  getNotifications: () => api.get('/users/notifications/'),
  markRead: (id) => api.post(`/users/notifications/${id}/read/`),
};

// ========== Analytics Service ==========
export const analyticsService = {
  getInstitutionAnalytics: () => api.get('/users/analytics/institution/'),
};

// ========== User Stats Service ==========
export const statsService = {
  getProfile: () => api.get('/users/profile/'),
};

export default api;
