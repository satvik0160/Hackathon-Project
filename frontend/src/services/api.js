import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

export const assessmentService = {
  getAssessments: () => api.get('/assessments'),
  getAssessmentById: (id) => api.get(`/assessments/${id}`),
  submitAssessment: (id, answers) => api.post(`/assessments/${id}/submit`, { answers }),
};

export const learningService = {
  getLearningPath: () => api.get('/learning/path'),
  updateProgress: (resourceId, completed) => api.put(`/learning/resource/${resourceId}`, { completed }),
};

export const jobService = {
  getJobs: (filters) => api.get('/jobs', { params: filters }),
  applyForJob: (jobId) => api.post(`/jobs/${jobId}/apply`),
};

export default api;
