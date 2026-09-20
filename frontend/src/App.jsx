import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import Layout, { PublicRoute, ProtectedRoute, RoleRoute } from './components/layout/Layout';
import CareerCopilot from './components/features/CareerCopilot';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './hooks/useTheme';
import DevAstraPreloader from './components/common/DevAstraPreloader';

// Lazy load pages for performance
const Landing = lazy(() => import('./pages/Landing'));
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
const Leaderboard = lazy(() => import('./pages/dashboard/Leaderboard'));
const CodeArcade = lazy(() => import('./pages/dashboard/CodeArcade'));
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
  useTheme(); // Initialize global theme listener
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

  // Global Glass Tap Sound Effect (opt-in via Settings)
  useEffect(() => {
    // Default OFF — only play when user explicitly enables in Settings
    const soundEnabled = () => localStorage.getItem('devastra_sound_enabled') === 'true';
    
    let audioCtx = null;
    const playGlassTap = () => {
      if (!soundEnabled()) return;
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2800, t);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.002); // quick attack
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1); // fast decay
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(t);
        osc.stop(t + 0.1);
      } catch (e) {
        console.error('Audio play failed', e);
      }
    };

    const handleClick = (e) => {
      // Check if clicked element is interactive
      const target = e.target.closest('button, a, .card, .dashboard-card, .stat-card, input, select');
      if (target) {
        playGlassTap();
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      if (audioCtx) {
        audioCtx.close();
      }
    };
  }, []);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      document.documentElement.classList.toggle('reduce-motion', mediaQuery.matches);
    };
    handleChange(); // Set initial state
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <>
      {showPreloader && <DevAstraPreloader onComplete={handlePreloaderComplete} />}

      <div style={{ opacity: showPreloader ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
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
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/arcade" element={<CodeArcade />} />
            <Route path="/admin/institution" element={<RoleRoute allowedRoles={['INSTITUTION_ADMIN']}><InstitutionDashboard /></RoleRoute>} />
            <Route path="/admin/industry" element={<RoleRoute allowedRoles={['INDUSTRY']}><IndustryDashboard /></RoleRoute>} />
          </Route>

          {/* Catch-all redirect — unknown paths fall back to the public landing
              page. Signed-in visitors are then forwarded on to the dashboard by
              the auth effect above, which already treats '/' as a public route. */}
          <Route path="*" element={<Navigate to="/" replace />} />
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
