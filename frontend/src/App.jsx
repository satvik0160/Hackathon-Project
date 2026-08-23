import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import Layout, { PublicRoute } from './components/layout/Layout';
import CareerCopilot from './components/features/CareerCopilot';
import { useAuth } from './contexts/AuthContext';

// Lazy load pages for performance
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Onboarding = lazy(() => import('./pages/onboarding/Onboarding'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const LearningResources = lazy(() => import('./pages/learning/LearningResources'));
const SkillTests = lazy(() => import('./pages/assessments/SkillTests'));
const TestQuiz = lazy(() => import('./pages/assessments/TestQuiz'));
const DailyPlanner = lazy(() => import('./pages/learning/DailyPlanner'));
const Jobs = lazy(() => import('./pages/jobs/Jobs'));
const MockInterview = lazy(() => import('./pages/ai/MockInterview'));
const Roadmap = lazy(() => import('./pages/learning/Roadmap'));
const AIResume = lazy(() => import('./pages/ai/AIResume'));
const AICareerGuidance = lazy(() => import('./pages/ai/AICareerGuidance'));
const Achievements = lazy(() => import('./pages/dashboard/Achievements'));
const Analytics = lazy(() => import('./pages/dashboard/Analytics'));
const Profile = lazy(() => import('./pages/Profile'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const InstitutionDashboard = lazy(() => import('./pages/admin/InstitutionDashboard'));
const IndustryDashboard = lazy(() => import('./pages/admin/IndustryDashboard'));

function PageLoader() {
  return (
    <div className="loading-screen" style={{ minHeight: '300px' }}>
      <div className="spinner spinner-lg" />
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Protected routes inside Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learning" element={<LearningResources />} />
            <Route path="/assessments" element={<SkillTests />} />
            <Route path="/assessments/:id" element={<TestQuiz />} />
            <Route path="/planner" element={<DailyPlanner />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/interview" element={<MockInterview />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/resume" element={<AIResume />} />
            <Route path="/career-guidance" element={<AICareerGuidance />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin/institution" element={<InstitutionDashboard />} />
            <Route path="/admin/industry" element={<IndustryDashboard />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </Suspense>

      {/* Floating Career Copilot (only when authenticated) */}
      {isAuthenticated && <CareerCopilot />}

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            fontSize: 'var(--text-sm)',
          },
          success: { iconTheme: { primary: 'var(--success)', secondary: 'white' } },
          error: { iconTheme: { primary: 'var(--danger)', secondary: 'white' } },
        }}
      />
    </>
  );
}

export default App;
