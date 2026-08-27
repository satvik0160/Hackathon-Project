import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import Layout, { PublicRoute, ProtectedRoute } from './components/layout/Layout';
import CareerCopilot from './components/features/CareerCopilot';
import { useAuth } from './contexts/AuthContext';
import DevAstraPreloader from './components/common/DevAstraPreloader';

// Lazy load pages for performance
const AuthContainer = lazy(() => import('./pages/auth/AuthContainer'));
const AuthCallback = lazy(() => import('./pages/auth/AuthCallback'));
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
  const { isAuthenticated, user, needsOnboarding, loading } = useAuth();
  const [showPreloader, setShowPreloader] = useState(true);
  const [preloaderResolved, setPreloaderResolved] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Keep the latest auth state in refs so handlePreloaderComplete never reads
  // a stale closure. The preloader takes ~3.5s to finish; the auth state can
  // resolve at any point during that window.
  const authStateRef = useRef({ isAuthenticated, needsOnboarding, loading });
  useEffect(() => {
    authStateRef.current = { isAuthenticated, needsOnboarding, loading };
  }, [isAuthenticated, needsOnboarding, loading]);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
    setPreloaderResolved(true);
    const { isAuthenticated: authed, needsOnboarding: needsOB } = authStateRef.current;
    if (authed) {
      if (needsOB) {
        navigate('/onboarding', { replace: true });
      } else if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
        navigate('/dashboard', { replace: true });
      }
    }
  };

  // Once the preloader has finished and the user is authenticated, watch for
  // the auth state to settle (it may have resolved *after* the preloader
  // finished) and route them in. This closes the race where the user signs in
  // during the 3.5s preloader and would otherwise get stuck on the landing
  // route because handlePreloaderComplete ran with a stale closure.
  useEffect(() => {
    if (!preloaderResolved) return;
    if (loading) return;
    const onAuth = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';
    if (isAuthenticated && onAuth) {
      navigate(needsOnboarding ? '/onboarding' : '/dashboard', { replace: true });
    }
  }, [preloaderResolved, loading, isAuthenticated, needsOnboarding, location.pathname, navigate]);

  return (
    <>
      {showPreloader && <DevAstraPreloader onComplete={handlePreloaderComplete} />}

      <div style={{ opacity: showPreloader ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Public routes */}
          <Route path="/login" element={<PublicRoute><AuthContainer /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><AuthContainer /></PublicRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />

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

      </div>

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
