import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Github, Check, Target, Trophy,
  BarChart3, Brain, GraduationCap, Building2, Zap, Rocket,
  Users, Flame, ShieldCheck, TrendingUp,
} from 'lucide-react';

const GITHUB_REPO_URL = 'https://github.com/satvik0160/Hackathon-Project-Ai-Manthan-2.0-';

/* ── Card content components ─────────────────────────────────────────── */

function HeroContent() {
  return (
    <div className="spiral-card-content spiral-card--hero">
      <span className="spiral-eyebrow">
        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
        Academia–Industry Skill Platform
      </span>
      <h1 className="spiral-title mt-4">
        Master your skills.
        <br />
        <span className="spiral-gradient-text">Shape your career.</span>
      </h1>
      <p className="spiral-lede mt-4">
        DevAstra closes the gap between what your syllabus covers and what industry actually
        hires for — AI coaching, deterministic job matching and progress that keeps you showing up.
      </p>
      <p className="spiral-body mt-3">
        Assess your real skill level, get matched to live roles on evidence rather than keywords,
        and hand your institution the analytics to fix the curriculum behind you.
      </p>
      <div className="flex flex-wrap items-center gap-3 mt-5">
        <Link to="/register" className="spiral-btn spiral-btn-primary">
          Get Started
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
        <a href="#how-it-works" className="spiral-btn spiral-btn-outline">
          See how it works
        </a>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span className="spiral-chip">
          <Rocket className="w-3 h-3" aria-hidden="true" />
          React 19 + Vite
        </span>
        <span className="spiral-chip">
          <ShieldCheck className="w-3 h-3" aria-hidden="true" />
          Postgres + RLS
        </span>
        <span className="spiral-chip">
          <Zap className="w-3 h-3" aria-hidden="true" />
          Serverless on InsForge
        </span>
      </div>
      {/* Inset match/streak cards */}
      <div className="spiral-hero-insets mt-4">
        <div className="spiral-inset-card">
          <span className="spiral-inset-score">92%</span>
          <span className="spiral-inset-text">
            Frontend Engineer
            <small>match score · example</small>
          </span>
        </div>
        <div className="spiral-inset-card">
          <span className="spiral-inset-icon"><Flame className="w-3.5 h-3.5" /></span>
          <span className="spiral-inset-text">
            18-day streak
            <small>consistency ×1.4</small>
          </span>
        </div>
      </div>
    </div>
  );
}

function ProblemContent() {
  return (
    <div className="spiral-card-content">
      <span className="spiral-eyebrow">
        <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
        The problem
      </span>
      <h2 className="spiral-h2 mt-4">
        Graduates are not underqualified. They are{' '}
        <span className="spiral-gradient-text">unverified</span>.
      </h2>
      <p className="spiral-lede mt-4">
        Curricula move in years; industry hiring moves in months. Students graduate with
        transcripts that say nothing about whether they can actually do the job, and institutions
        have no early signal that a skill has stopped being relevant.
      </p>
      <p className="spiral-body mt-3">
        The result is a widening gap that hurts everyone: students apply blind, recruiters screen
        on guesswork, and colleges find out too late — after the placement numbers come in.
      </p>
      {/* Embedded visual: disconnected tracks */}
      <div className="spiral-problem-visual mt-5" aria-hidden="true">
        <div className="spiral-track spiral-track--slow">
          <span className="spiral-track-label">Academic curriculum</span>
          <div className="spiral-track-bar"><span className="spiral-track-dot" /></div>
        </div>
        <div className="spiral-track spiral-track--fast">
          <span className="spiral-track-label">Industry demand</span>
          <div className="spiral-track-bar"><span className="spiral-track-dot" /></div>
        </div>
      </div>
    </div>
  );
}

function AssessContent() {
  return (
    <div className="spiral-card-content">
      <span className="spiral-eyebrow">
        <Target className="w-3.5 h-3.5" aria-hidden="true" />
        How it works · Step 1
      </span>
      <h2 className="spiral-h2 mt-4">Assess &amp; Baseline</h2>
      <p className="spiral-body mt-3">
        Take adaptive assessments to map your current skill tree. No more guessing—know exactly
        where you stand against industry standards.
      </p>
      {/* Embedded skill-tree inset */}
      <div className="spiral-assess-tree mt-4" aria-hidden="true">
        <div className="spiral-tree-node spiral-tree-node--root">Core Skills</div>
        <div className="spiral-tree-branches">
          <div className="spiral-tree-node spiral-tree-node--active">React</div>
          <div className="spiral-tree-node">Node.js</div>
          <div className="spiral-tree-node spiral-tree-node--active">SQL</div>
          <div className="spiral-tree-node">Testing</div>
        </div>
        <div className="spiral-assess-pulse">
          <span className="spiral-pulse-dot" />
          <span className="spiral-pulse-label">Assessment in progress…</span>
        </div>
      </div>
    </div>
  );
}

function GrowContent() {
  return (
    <div className="spiral-card-content">
      <span className="spiral-eyebrow">
        <Brain className="w-3.5 h-3.5" aria-hidden="true" />
        How it works · Step 2
      </span>
      <h2 className="spiral-h2 mt-4">AI-Guided Growth</h2>
      <p className="spiral-body mt-3">
        Dhruv, your AI Career Copilot, identifies your gaps and builds a personalized daily
        roadmap to make you job-ready.
      </p>
      {/* Dhruv roadmap snippet */}
      <div className="spiral-dhruv-snippet mt-4">
        <div className="spiral-dhruv-header">
          <img src="/dhruvlogo.webp" alt="" aria-hidden="true" className="spiral-dhruv-avatar" />
          <div>
            <p className="spiral-mock-title">Dhruv · AI Career Copilot</p>
            <p className="spiral-mock-meta">Personalized roadmap</p>
          </div>
        </div>
        <div className="spiral-roadmap-path mt-3">
          <div className="spiral-roadmap-step spiral-roadmap-step--done">
            <span className="spiral-roadmap-dot" />
            <span>React fundamentals</span>
          </div>
          <div className="spiral-roadmap-step spiral-roadmap-step--active">
            <span className="spiral-roadmap-dot" />
            <span>System Design basics</span>
          </div>
          <div className="spiral-roadmap-step">
            <span className="spiral-roadmap-dot" />
            <span>Cloud architecture</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchStepContent() {
  return (
    <div className="spiral-card-content">
      <span className="spiral-eyebrow">
        <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
        How it works · Step 3
      </span>
      <h2 className="spiral-h2 mt-4">Deterministic Matching</h2>
      <p className="spiral-body mt-3">
        Get matched to live industry roles based on verifiable evidence rather than
        keyword-stuffed resumes.
      </p>
      {/* Skill → role connection */}
      <div className="spiral-match-visual mt-4" aria-hidden="true">
        <div className="spiral-match-side">
          <p className="spiral-mock-meta">ASSESSED SKILLS</p>
          <div className="spiral-match-nodes">
            <span className="spiral-chip">React</span>
            <span className="spiral-chip">TypeScript</span>
            <span className="spiral-chip">SQL</span>
          </div>
        </div>
        <div className="spiral-match-arrows">
          <span>→</span><span>→</span><span>→</span>
        </div>
        <div className="spiral-match-side">
          <p className="spiral-mock-meta">MATCHED ROLES</p>
          <div className="spiral-match-nodes">
            <span className="spiral-chip">Frontend Eng.</span>
            <span className="spiral-chip">Full Stack Dev</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CopilotContent() {
  return (
    <div className="spiral-card-content">
      <div className="flex items-center gap-3">
        <span className="spiral-feature-icon"><Brain className="w-5 h-5" /></span>
        <div>
          <span className="spiral-feature-index">01</span>
          <p className="spiral-mock-title">AI Career Copilot</p>
        </div>
      </div>
      <h2 className="spiral-h3 mt-3">Meet Dhruv — your copilot for interviews and resumes</h2>
      <ul className="spiral-feature-list mt-3">
        <li><span className="spiral-check"><Check className="w-3 h-3" /></span>Mock interviews with per-answer scoring on structure, depth and clarity</li>
        <li><span className="spiral-check"><Check className="w-3 h-3" /></span>Resume rewritten against a specific job description, not generic advice</li>
        <li><span className="spiral-check"><Check className="w-3 h-3" /></span>Powered by Gemini Flash through InsForge edge functions</li>
      </ul>
      {/* Interview mock panel */}
      <div className="spiral-mock-panel mt-4">
        <div className="spiral-mock-exchange">
          <div className="spiral-mock-bubble"><span className="spiral-mock-meta">Q</span> Walk me through how you would optimise a slow-rendering React list.</div>
          <div className="spiral-mock-bubble"><span className="spiral-mock-meta">A</span> Virtualise the rows, memoise the item component, move filtering off the render path.</div>
        </div>
        <div className="spiral-mock-scores">
          <span>Structure <strong>82</strong></span>
          <span>Depth <strong>74</strong></span>
          <span>Clarity <strong>88</strong></span>
        </div>
        <p className="spiral-mock-caption">Illustrative interface example</p>
      </div>
    </div>
  );
}

function JobMatchingContent() {
  const skills = ['React', 'TypeScript', 'Node.js', 'SQL', 'System Design'];
  const roles = [
    { name: 'Frontend Engineer', score: 92 },
    { name: 'Full Stack Developer', score: 78 },
    { name: 'Data Analyst', score: 61 },
  ];
  return (
    <div className="spiral-card-content">
      <div className="flex items-center gap-3">
        <span className="spiral-feature-icon"><Target className="w-5 h-5" /></span>
        <div>
          <span className="spiral-feature-index">02</span>
          <p className="spiral-mock-title">Deterministic Job Matching</p>
        </div>
      </div>
      <h2 className="spiral-h3 mt-3">Your skill tree, mapped to live industry roles</h2>
      <ul className="spiral-feature-list mt-3">
        <li><span className="spiral-check"><Check className="w-3 h-3" /></span>Matches derived from assessed skills, never from resume keywords</li>
        <li><span className="spiral-check"><Check className="w-3 h-3" /></span>A visible gap list telling you exactly what to learn next</li>
        <li><span className="spiral-check"><Check className="w-3 h-3" /></span>Explainable match scores you can defend in an interview</li>
      </ul>
      <div className="spiral-mock-panel mt-4">
        <p className="spiral-mock-meta">YOUR ASSESSED SKILL TREE</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {skills.map(s => <span key={s} className="spiral-chip">{s}</span>)}
        </div>
        <div className="spiral-divider" />
        <p className="spiral-mock-meta">MATCHED LIVE ROLES</p>
        {roles.map(r => (
          <div key={r.name} className="spiral-role-row">
            <span className="spiral-mock-title">{r.name}</span>
            <span className="spiral-score">{r.score}%</span>
            <div className="spiral-bar"><span style={{ width: `${r.score}%` }} /></div>
          </div>
        ))}
        <p className="spiral-mock-caption">Illustrative interface example</p>
      </div>
    </div>
  );
}

function GamificationContent() {
  const board = [
    { rank: 1, name: 'Ananya R.', xp: '12,480' },
    { rank: 2, name: 'You', xp: '11,905' },
    { rank: 3, name: 'Rahul K.', xp: '10,220' },
  ];
  return (
    <div className="spiral-card-content">
      <div className="flex items-center gap-3">
        <span className="spiral-feature-icon"><Trophy className="w-5 h-5" /></span>
        <div>
          <span className="spiral-feature-index">03</span>
          <p className="spiral-mock-title">Gamification Engine</p>
        </div>
      </div>
      <h2 className="spiral-h3 mt-3">Streaks, XP and levels that keep you showing up</h2>
      <ul className="spiral-feature-list mt-3">
        <li><span className="spiral-check"><Check className="w-3 h-3" /></span>Daily streaks with a consistency multiplier</li>
        <li><span className="spiral-check"><Check className="w-3 h-3" /></span>XP, levels and achievements tied to real assessment outcomes</li>
        <li><span className="spiral-check"><Check className="w-3 h-3" /></span>Leaderboards that make progress social, not solitary</li>
      </ul>
      <div className="spiral-mock-panel mt-4">
        <div className="flex items-center gap-3">
          <div className="spiral-feature-icon" style={{ width: 32, height: 32 }}>
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <p className="spiral-mock-title">18-day streak</p>
            <p className="spiral-mock-meta">Consistency multiplier active</p>
          </div>
          <span className="spiral-chip ml-auto">Level 7</span>
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="spiral-mock-meta">520 XP to Level 8</span>
            <span className="spiral-score">2,480 XP</span>
          </div>
          <div className="spiral-bar"><span style={{ width: '68%' }} /></div>
        </div>
        <div className="spiral-divider" />
        <p className="spiral-mock-meta">WEEKLY LEADERBOARD</p>
        {board.map(e => (
          <div key={e.rank} className="spiral-role-row">
            <span className="spiral-score" style={{ width: 18 }}>{e.rank}</span>
            <span className="spiral-mock-title">{e.name}</span>
            <span className="spiral-mock-meta ml-auto">{e.xp} XP</span>
          </div>
        ))}
        <p className="spiral-mock-caption">Illustrative interface example</p>
      </div>
    </div>
  );
}

function AnalyticsContent() {
  const bars = [
    { label: 'DSA', value: 78 },
    { label: 'SQL', value: 64 },
    { label: 'Cloud', value: 31 },
    { label: 'Testing', value: 22 },
  ];
  return (
    <div className="spiral-card-content">
      <div className="flex items-center gap-3">
        <span className="spiral-feature-icon"><BarChart3 className="w-5 h-5" /></span>
        <div>
          <span className="spiral-feature-index">04</span>
          <p className="spiral-mock-title">Institutional Analytics</p>
        </div>
      </div>
      <h2 className="spiral-h3 mt-3">Dashboards that expose curriculum gaps</h2>
      <ul className="spiral-feature-list mt-3">
        <li><span className="spiral-check"><Check className="w-3 h-3" /></span>Cohort-wide skill gap detection across departments</li>
        <li><span className="spiral-check"><Check className="w-3 h-3" /></span>Live comparison against industry role requirements</li>
        <li><span className="spiral-check"><Check className="w-3 h-3" /></span>Placement-readiness trends for faculty and administration</li>
      </ul>
      <div className="spiral-mock-panel mt-4">
        <div className="flex items-center justify-between">
          <p className="spiral-mock-meta">COHORT SKILL COVERAGE</p>
          <span className="spiral-chip">CSE · 2026</span>
        </div>
        <div className="spiral-analytics-bars mt-2">
          {bars.map(b => (
            <div key={b.label} className="spiral-analytics-col">
              <span className="spiral-score">{b.value}%</span>
              <div
                className="spiral-analytics-fill"
                style={{
                  height: `${b.value}%`,
                  background: b.value < 40
                    ? 'linear-gradient(180deg, rgba(239,68,68,0.8), rgba(239,68,68,0.35))'
                    : 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                }}
              />
              <span className="spiral-mock-meta">{b.label}</span>
            </div>
          ))}
        </div>
        <div className="spiral-gap-alert mt-2">
          <img src="/devlogo.jpg" alt="" aria-hidden="true" className="spiral-gap-icon" />
          <div>
            <p className="spiral-mock-title">Curriculum gap detected</p>
            <p className="spiral-mock-meta">Cloud and Testing trail industry demand by 40%+</p>
          </div>
        </div>
        <p className="spiral-mock-caption">Illustrative interface example</p>
      </div>
    </div>
  );
}

function StudentsContent() {
  return (
    <div className="spiral-card-content">
      <span className="spiral-eyebrow">
        <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
        For Students
      </span>
      <h2 className="spiral-h2 mt-4">Stop applying blind.</h2>
      <p className="spiral-body mt-3">
        Build a verifiable skill profile through assessments and mock interviews. Let AI identify
        your weak spots and give you a clear, personalized roadmap to get hired.
      </p>
      <ul className="spiral-benefit-list mt-4">
        <li><Check className="w-4 h-4 text-emerald-500" /> Prove your skills to employers instantly.</li>
        <li><Check className="w-4 h-4 text-emerald-500" /> Get matched to jobs you actually qualify for.</li>
        <li><Check className="w-4 h-4 text-emerald-500" /> AI-driven interview prep and feedback.</li>
      </ul>
    </div>
  );
}

function IndustryContent() {
  return (
    <div className="spiral-card-content">
      <span className="spiral-eyebrow">
        <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
        For Industry
      </span>
      <h2 className="spiral-h2 mt-4">Hire on evidence, not keywords.</h2>
      <p className="spiral-body mt-3">
        Stop filtering through thousands of identical resumes. See deterministic matching scores
        based on actual coding assessments and technical interviews.
      </p>
      <ul className="spiral-benefit-list mt-4">
        <li><Check className="w-4 h-4 text-amber-500" /> Real-time skill verification of candidates.</li>
        <li><Check className="w-4 h-4 text-amber-500" /> Post roles and get perfectly matched shortlists.</li>
        <li><Check className="w-4 h-4 text-amber-500" /> Reduce time-to-hire and interview overhead.</li>
      </ul>
    </div>
  );
}

function InstitutionsContent() {
  return (
    <div className="spiral-card-content">
      <span className="spiral-eyebrow">
        <Users className="w-3.5 h-3.5" aria-hidden="true" />
        For Institutions
      </span>
      <h2 className="spiral-h2 mt-4">Fix the curriculum in real-time.</h2>
      <p className="spiral-body mt-3">
        Get aggregate analytics on your students' skill gaps compared to current industry demands.
        Update your syllabus before graduation, not after placement season.
      </p>
      <ul className="spiral-benefit-list mt-4">
        <li><Check className="w-4 h-4 text-indigo-400" /> Macro-level student performance analytics.</li>
        <li><Check className="w-4 h-4 text-indigo-400" /> Live industry alignment scores.</li>
        <li><Check className="w-4 h-4 text-indigo-400" /> Better placement rates through early intervention.</li>
      </ul>
    </div>
  );
}

function FinalCtaContent() {
  return (
    <div className="spiral-card-content spiral-card--cta">
      <span className="spiral-eyebrow">
        <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
        For students, institutions and industry
      </span>
      <h2 className="spiral-h2 mt-4">
        Stop guessing where you stand.
        <br />
        <span className="spiral-gradient-text">Prove it instead.</span>
      </h2>
      <p className="spiral-lede mt-4">
        Create your free account, take your first skill assessment, and see the roles your current
        skill tree actually qualifies you for.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
        <Link to="/register" className="spiral-btn spiral-btn-primary">
          Sign Up free
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
        <Link to="/login" className="spiral-btn spiral-btn-outline">
          Log In
        </Link>
      </div>
    </div>
  );
}

/* ── The 13-card registry ────────────────────────────────────────────── */

export const SPIRAL_CARDS = [
  {
    id: 'hero',
    anchor: 'hero',
    navLabel: 'Home',
    Content: HeroContent,
  },
  {
    id: 'problem',
    anchor: 'problem',
    navLabel: 'The gap',
    Content: ProblemContent,
  },
  {
    id: 'assess',
    anchor: 'how-it-works',
    navLabel: 'Assess',
    Content: AssessContent,
  },
  {
    id: 'grow',
    anchor: 'how-it-works',
    navLabel: 'Grow',
    Content: GrowContent,
  },
  {
    id: 'match-step',
    anchor: 'how-it-works',
    navLabel: 'Match',
    Content: MatchStepContent,
  },
  {
    id: 'copilot',
    anchor: 'features',
    navLabel: 'Copilot',
    Content: CopilotContent,
  },
  {
    id: 'job-matching',
    anchor: 'features',
    navLabel: 'Matching',
    Content: JobMatchingContent,
  },
  {
    id: 'gamification',
    anchor: 'features',
    navLabel: 'Gamify',
    Content: GamificationContent,
  },
  {
    id: 'analytics',
    anchor: 'features',
    navLabel: 'Analytics',
    Content: AnalyticsContent,
  },
  {
    id: 'students',
    anchor: 'audience',
    navLabel: 'Students',
    Content: StudentsContent,
  },
  {
    id: 'industry',
    anchor: 'audience',
    navLabel: 'Industry',
    Content: IndustryContent,
  },
  {
    id: 'institutions',
    anchor: 'audience',
    navLabel: 'Institutions',
    Content: InstitutionsContent,
  },
  {
    id: 'final-cta',
    anchor: 'final-cta',
    navLabel: 'Join',
    Content: FinalCtaContent,
  },
];

export const CARD_COUNT = SPIRAL_CARDS.length;

export default SPIRAL_CARDS;
