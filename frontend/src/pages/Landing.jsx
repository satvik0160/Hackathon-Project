import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Github,
  Check,
  Target,
  Trophy,
  BarChart3,
  Brain,
  GraduationCap,
  Building2,
  Zap,
  Rocket,
  Users,
  Flame,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react';
import '../landing.css';

const GITHUB_REPO_URL = 'https://github.com/satvik0160/Hackathon-Project-Ai-Manthan-2.0-';

/**
 * Scroll-reveal wrapper.
 *
 * `whileInView` runs on IntersectionObserver under the hood, and `once: true`
 * guarantees a reveal happens exactly once — so a block can never re-trigger or
 * flicker when the user scrolls back up. Content is rendered in the DOM at all
 * times and only its opacity/transform animate, so fast scrollers still see
 * everything (the reveal simply doesn't play for the section they flew past).
 * `prefers-reduced-motion` is honoured via framer-motion's useReducedMotion.
 */
function Reveal({ children, delay = 0, className = '' }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Decorative ambient glow. Hidden from assistive tech and clipped by .landing-ambience. */
function Glow({ top, left, right, bottom, size, color, alpha }) {
  return (
    <div
      aria-hidden="true"
      className="landing-glow"
      style={{
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        '--glow-color': color,
        '--glow-alpha': alpha,
      }}
    />
  );
}

const FEATURES = [
  {
    id: 'copilot',
    index: '01',
    eyebrow: 'AI Career Copilot',
    title: 'Meet Dhruv — your copilot for interviews and resumes',
    body: 'Dhruv runs realistic mock interviews and scores every answer, then tailors your resume to the exact role you are targeting. It is the same coach at 2am as it is the day before a placement drive.',
    bullets: [
      'Mock interviews with per-answer scoring on structure, depth and clarity',
      'Resume rewritten against a specific job description, not generic advice',
      'Powered by Gemini Flash through InsForge edge functions',
    ],
    icon: Brain,
  },
  {
    id: 'matching',
    index: '02',
    eyebrow: 'Deterministic Job Matching',
    title: 'Your skill tree, mapped to live industry roles',
    body: 'No keyword guessing. DevAstra diffs your assessed skill tree against real role requirements, so every match is explainable — you can see precisely which skill earned you the match, and which one is holding you back.',
    bullets: [
      'Matches derived from assessed skills, never from resume keywords',
      'A visible gap list telling you exactly what to learn next',
      'Explainable match scores you can defend in an interview',
    ],
    icon: Target,
  },
  {
    id: 'gamification',
    index: '03',
    eyebrow: 'Gamification Engine',
    title: 'Streaks, XP and levels that keep you showing up',
    body: 'Skill building dies on day four — so progress is engineered to be visible. Daily streaks, XP for completed assessments and leaderboards turn a vague promise to "upskill" into something you actually do again tomorrow.',
    bullets: [
      'Daily streaks with a consistency multiplier',
      'XP, levels and achievements tied to real assessment outcomes',
      'Leaderboards that make progress social, not solitary',
    ],
    icon: Trophy,
  },
  {
    id: 'analytics',
    index: '04',
    eyebrow: 'Institutional Analytics',
    title: 'Dashboards that expose curriculum gaps',
    body: 'Universities see the macro picture their syllabus never shows them: which skills their cohort is consistently missing, compared with what hiring partners actually demand. Analytics that turn into a curriculum decision.',
    bullets: [
      'Cohort-wide skill gap detection across departments',
      'Live comparison against industry role requirements',
      'Placement-readiness trends for faculty and administration',
    ],
    icon: BarChart3,
  },
];

/* ------------------------------------------------------------------
   Mock product visuals.

   These are illustrative UI mocks built from the design system — there
   are no real product screenshots in /public yet. Each one is clearly
   labelled for assistive tech and contains no external image links.
   ------------------------------------------------------------------ */

function CopilotVisual() {
  return (
    <div className="landing-mock w-full max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <div className="landing-mock-avatar">
          <img src="/dhruvlogo.webp" alt="Dhruv, the DevAstra AI career copilot" />
        </div>
        <div className="min-w-0">
          <p className="landing-mock-title">Dhruv · AI Career Copilot</p>
          <p className="landing-mock-meta">Mock interview · Frontend Engineer</p>
        </div>
        <span className="landing-chip ml-auto">Live</span>
      </div>

      <div className="landing-mock-stack mt-4">
        <div className="landing-bubble landing-bubble-ai">
          Walk me through how you would optimise a slow-rendering React list.
        </div>
        <div className="landing-bubble landing-bubble-user">
          Virtualise the rows, memoise the item component, and move filtering off the render path.
        </div>
        <div className="landing-bubble landing-bubble-ai">
          Strong answer. Structure 82 · Depth 74 · Clarity 88 — resume tailored below.
        </div>
      </div>
    </div>
  );
}

function MatchingVisual() {
  const skills = ['React', 'TypeScript', 'Node.js', 'SQL', 'System Design'];
  const roles = [
    { name: 'Frontend Engineer', meta: 'Bengaluru · Full-time', score: 92 },
    { name: 'Full Stack Developer', meta: 'Remote · Full-time', score: 78 },
    { name: 'Data Analyst', meta: 'Hybrid · Internship', score: 61 },
  ];

  return (
    <div className="landing-mock landing-mock-stack w-full max-w-md mx-auto">
      <p className="landing-mock-meta">YOUR ASSESSED SKILL TREE</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span key={skill} className="landing-chip">
            {skill}
          </span>
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '0.5rem 0' }} />

      <p className="landing-mock-meta">MATCHED LIVE ROLES</p>
      {roles.map((role) => (
        <div key={role.name} className="landing-mock-row flex-col !items-stretch gap-2">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="landing-mock-title">{role.name}</p>
              <p className="landing-mock-meta">{role.meta}</p>
            </div>
            <span className="landing-score">{role.score}%</span>
          </div>
          <div className="landing-bar">
            <span style={{ width: `${role.score}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function GamificationVisual() {
  const board = [
    { rank: 1, name: 'Ananya R.', xp: '12,480' },
    { rank: 2, name: 'You', xp: '11,905' },
    { rank: 3, name: 'Rahul K.', xp: '10,220' },
  ];

  return (
    <div className="landing-mock landing-mock-stack w-full max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <div
          className="landing-feature-icon shrink-0"
          style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)' }}
        >
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <p className="landing-mock-title">18-day streak</p>
          <p className="landing-mock-meta">Consistency multiplier active</p>
        </div>
        <span className="landing-chip ml-auto">Level 7</span>
      </div>

      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="landing-mock-meta">520 XP to Level 8</span>
          <span className="landing-score">2,480 XP</span>
        </div>
        <div className="landing-bar">
          <span style={{ width: '68%' }} />
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '0.5rem 0' }} />

      <p className="landing-mock-meta">WEEKLY LEADERBOARD</p>
      {board.map((entry) => (
        <div key={entry.rank} className="landing-mock-row">
          <span className="landing-score" style={{ width: 18 }}>
            {entry.rank}
          </span>
          <p className="landing-mock-title">{entry.name}</p>
          <span className="landing-mock-meta ml-auto">{entry.xp} XP</span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsVisual() {
  const bars = [
    { label: 'DSA', value: 78 },
    { label: 'SQL', value: 64 },
    { label: 'Cloud', value: 31 },
    { label: 'Testing', value: 22 },
  ];

  return (
    <div className="landing-mock landing-mock-stack w-full max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <p className="landing-mock-meta">COHORT SKILL COVERAGE</p>
        <span className="landing-chip">CSE · 2026</span>
      </div>

      <div className="flex items-end gap-3 h-28 mt-2">
        {bars.map((bar) => (
          <div key={bar.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <span className="landing-score">{bar.value}%</span>
            <div
              className="w-full rounded-t-md"
              style={{
                height: `${bar.value}%`,
                background:
                  bar.value < 40
                    ? 'linear-gradient(180deg, rgba(239,68,68,0.8), rgba(239,68,68,0.35))'
                    : 'linear-gradient(180deg, var(--primary), var(--accent))',
              }}
            />
            <span className="landing-mock-meta">{bar.label}</span>
          </div>
        ))}
      </div>

      <div className="landing-mock-row mt-2">
        <div className="landing-mock-avatar !w-8 !h-8 !basis-8">
          <img src="/devlogo.jpg" alt="" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="landing-mock-title">Curriculum gap detected</p>
          <p className="landing-mock-meta">Cloud and Testing trail industry demand by 40%+</p>
        </div>
      </div>
    </div>
  );
}

const VISUALS = {
  copilot: CopilotVisual,
  matching: MatchingVisual,
  gamification: GamificationVisual,
  analytics: AnalyticsVisual,
};

/**
 * PLACEHOLDER HERO VISUAL
 *
 * There is no real product screenshot/asset in /public yet, so this is an
 * inline SVG illustration of the skill-tree → role-match flow. It is
 * explicitly labelled for assistive tech and references no external files,
 * so it can never render as a broken image. Swap this <svg> for a real
 * screenshot when one exists.
 */
function HeroVisual() {
  const skillNodes = [
    { y: 96, label: 'React · 86%' },
    { y: 176, label: 'SQL · 74%' },
    { y: 256, label: 'DSA · 81%' },
  ];
  const roleNodes = [
    { y: 116, label: 'Frontend Engineer', score: '92%' },
    { y: 236, label: 'Data Analyst', score: '67%' },
  ];

  return (
    <svg
      viewBox="0 0 520 360"
      role="img"
      aria-label="Placeholder illustration of the DevAstra skill graph, mapping assessed student skills to matched industry roles"
      className="w-full h-auto"
    >
      <title>Placeholder illustration: DevAstra skill graph and job matches</title>
      <defs>
        <linearGradient id="landingHeroGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8C882" />
          <stop offset="100%" stopColor="#D9AF67" />
        </linearGradient>
        <linearGradient id="landingHeroIndigo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
      </defs>

      <rect x="1" y="1" width="518" height="358" rx="24" fill="var(--bg-secondary)" stroke="var(--border)" />

      {/* connectors */}
      <path d="M150 96 C 210 96, 210 176, 250 176" fill="none" stroke="var(--border)" strokeWidth="2" />
      <path d="M150 176 C 210 176, 210 176, 250 176" fill="none" stroke="var(--border)" strokeWidth="2" />
      <path d="M150 256 C 210 256, 210 176, 250 176" fill="none" stroke="var(--border)" strokeWidth="2" />
      <path d="M300 176 C 340 176, 340 116, 366 116" fill="none" stroke="url(#landingHeroGold)" strokeWidth="2" />
      <path
        d="M300 176 C 340 176, 340 236, 366 236"
        fill="none"
        stroke="url(#landingHeroIndigo)"
        strokeWidth="2"
        strokeDasharray="5 6"
      />

      {/* skill nodes */}
      {skillNodes.map((node) => (
        <g key={node.label}>
          <rect x="24" y={node.y - 17} width="126" height="34" rx="10" fill="var(--bg-tertiary)" stroke="var(--border)" />
          <text
            x="87"
            y={node.y + 5}
            textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="12"
            fill="var(--text-secondary)"
          >
            {node.label}
          </text>
        </g>
      ))}

      {/* hub */}
      <circle cx="275" cy="176" r="30" fill="url(#landingHeroGold)" />
      <text
        x="275"
        y="182"
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontSize="14"
        fontWeight="700"
        fill="#0a0a0a"
      >
        DA
      </text>

      {/* role nodes */}
      {roleNodes.map((node, i) => (
        <g key={node.label}>
          <rect x="362" y={node.y - 26} width="132" height="52" rx="12" fill="var(--bg-tertiary)" stroke="var(--border)" />
          <text
            x="378"
            y={node.y - 4}
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize="12.5"
            fontWeight="600"
            fill="var(--text-primary)"
          >
            {node.label}
          </text>
          <text
            x="378"
            y={node.y + 14}
            fontFamily="'JetBrains Mono', monospace"
            fontSize="11"
            fill={i === 0 ? 'var(--primary)' : 'var(--text-tertiary)'}
          >
            {node.score} match
          </text>
        </g>
      ))}

      <text
        x="30"
        y="42"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="11"
        letterSpacing="2"
        fill="var(--text-tertiary)"
      >
        ASSESSED SKILLS → LIVE ROLES
      </text>
    </svg>
  );
}

export default function Landing() {
  const [activeTab, setActiveTab] = useState('students');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing min-h-screen">
      {/* ---------------- Sticky top nav ---------------- */}
      <header className={`landing-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="landing-container">
          <div className="landing-nav-inner">
            <Link to="/" className="landing-brand" aria-label="DevAstra home">
              <span className="landing-brand-badge">
                <img src="/devlogo.jpg" alt="DevAstra" />
              </span>
              <span className="min-w-0">
                <span className="landing-wordmark">DevAstra</span>
                <span className="landing-brand-sub">Intelligence OS</span>
              </span>
            </Link>

            <nav className="landing-nav-links" aria-label="Landing page sections">
              <a className="landing-nav-link" href="#problem">
                The gap
              </a>
              <a className="landing-nav-link" href="#features">
                Features
              </a>
            </nav>

            <div className="landing-nav-actions">
              <Link to="/login" className="landing-btn landing-btn-ghost">
                Log In
              </Link>
              <Link to="/register" className="landing-btn landing-btn-primary">
                Sign Up
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* ---------------- Hero ---------------- */}
        <section className="landing-hero">
          <div className="landing-ambience">
            <Glow top="-14rem" left="-10rem" size="34rem" color="rgba(217,175,103,0.5)" alpha={0.3} />
            <Glow top="-6rem" right="-12rem" size="40rem" color="rgba(79,70,229,0.55)" alpha={0.32} />
            <Glow bottom="-16rem" left="34%" size="30rem" color="rgba(20,184,166,0.35)" alpha={0.26} />
          </div>

          <div className="landing-container relative z-10">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 items-center">
              <div>
                <Reveal>
                  <span className="landing-eyebrow">
                    <Sparkles className="w-3.5 h-3.5" />
                    Academia–Industry Skill Platform
                  </span>
                </Reveal>

                <Reveal delay={0.05}>
                  <h1 className="landing-title mt-6">
                    Master your skills.
                    <br />
                    <span className="landing-gradient-text">Shape your career.</span>
                  </h1>
                </Reveal>

                <Reveal delay={0.1}>
                  <p className="landing-lede mt-6 max-w-xl">
                    DevAstra closes the gap between what your syllabus covers and what industry actually
                    hires for — AI coaching, deterministic job matching and progress that keeps you
                    showing up.
                  </p>
                </Reveal>

                <Reveal delay={0.15}>
                  <p className="landing-body mt-4 max-w-xl">
                    Assess your real skill level, get matched to live roles on evidence rather than
                    keywords, and hand your institution the analytics to fix the curriculum behind you.
                  </p>
                </Reveal>

                <Reveal delay={0.2}>
                  <div className="flex flex-wrap items-center gap-3 mt-8">
                    <Link to="/register" className="landing-btn landing-btn-primary landing-btn-lg">
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a href="#features" className="landing-btn landing-btn-outline landing-btn-lg">
                      See how it works
                    </a>
                  </div>
                </Reveal>

                <Reveal delay={0.25}>
                  <div className="flex flex-wrap items-center gap-2 mt-8">
                    <span className="landing-chip">
                      <Rocket className="w-3.5 h-3.5" />
                      React 19 + Vite
                    </span>
                    <span className="landing-chip">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Postgres + RLS
                    </span>
                    <span className="landing-chip">
                      <Zap className="w-3.5 h-3.5" />
                      Serverless on InsForge
                    </span>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={0.15}>
                <HeroVisual />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------- Problem / hook ---------------- */}
        <section id="problem" className="landing-section">
          <div className="landing-ambience">
            <Glow top="10%" left="-14rem" size="28rem" color="rgba(129,140,248,0.45)" alpha={0.22} />
          </div>

          <div className="landing-container relative z-10">
            <Reveal>
              <div className="landing-card max-w-3xl mx-auto text-center">
                <span className="landing-eyebrow">
                  <GraduationCap className="w-3.5 h-3.5" />
                  The problem
                </span>
                <h2 className="landing-h2 mt-5">
                  Graduates are not underqualified. They are <span className="landing-gradient-text">unverified</span>.
                </h2>
                <p className="landing-lede mt-5">
                  Curricula move in years; industry hiring moves in months. Students graduate with
                  transcripts that say nothing about whether they can actually do the job, and
                  institutions have no early signal that a skill has stopped being relevant.
                </p>
                <p className="landing-body mt-4">
                  The result is a widening gap that hurts everyone: students apply blind, recruiters
                  screen on guesswork, and colleges find out too late — after the placement numbers
                  come in.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        
        {/* ---------------- How It Works ---------------- */}
        <section id="how-it-works" className="landing-section bg-neutral-900/30">
          <div className="landing-container relative z-10">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto">
                <span className="landing-eyebrow">
                  <Zap className="w-3.5 h-3.5" />
                  How it works
                </span>
                <h2 className="landing-h2 mt-5">
                  Your skill journey in <span className="landing-gradient-text">three steps</span>.
                </h2>
              </div>
            </Reveal>

            <div className="mt-16 grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              
              <Reveal delay={0.1} className="relative bg-neutral-950/50 border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">1. Assess & Baseline</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Take adaptive assessments to map your current skill tree. No more guessing—know exactly where you stand against industry standards.
                </p>
              </Reveal>

              <Reveal delay={0.2} className="relative bg-neutral-950/50 border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-400">
                  <Brain className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">2. AI-Guided Growth</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Dhruv, your AI Career Copilot, identifies your gaps and builds a personalized daily roadmap to make you job-ready.
                </p>
              </Reveal>

              <Reveal delay={0.3} className="relative bg-neutral-950/50 border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">3. Deterministic Matching</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Get matched to live industry roles based on verifiable evidence rather than keyword-stuffed resumes.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------- Feature showcase (zigzag) ---------------- */}
        <section id="features" className="landing-section">
          <div className="landing-container relative z-10">
            <Reveal>
              <div className="max-w-2xl">
                <span className="landing-eyebrow">
                  <Sparkles className="w-3.5 h-3.5" />
                  What DevAstra does
                </span>
                <h2 className="landing-h2 mt-5">
                  Four engines, one <span className="landing-gradient-text">verifiable</span> skill signal.
                </h2>
                <p className="landing-lede mt-5">
                  Each engine feeds the next: assessments build your skill tree, the skill tree drives
                  matching, coaching closes the gaps, and the analytics loop back to the curriculum.
                </p>
              </div>
            </Reveal>

            <div className="mt-16 flex flex-col gap-20">
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                const Visual = VISUALS[feature.id];
                const reversed = i % 2 === 1;

                return (
                  <Reveal key={feature.id} className={`landing-feature-grid ${reversed ? 'is-reversed' : ''}`}>
                    <div className="landing-feature-text">
                      <div className="flex items-center gap-3">
                        <span className="landing-feature-icon">
                          <Icon className="w-5 h-5" />
                        </span>
                        <div>
                          <span className="landing-feature-index">{feature.index}</span>
                          <p className="landing-mock-title">{feature.eyebrow}</p>
                        </div>
                      </div>

                      <h3 className="landing-h3 mt-5">{feature.title}</h3>
                      <p className="landing-body mt-4">{feature.body}</p>

                      <ul className="landing-feature-list mt-6">
                        {feature.bullets.map((bullet) => (
                          <li key={bullet}>
                            <span className="landing-check">
                              <Check className="w-3 h-3" />
                            </span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="landing-feature-visual">
                      <Visual />
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        
        {/* ---------------- Audience Tabs ---------------- */}
        <section id="audience" className="landing-section">
          <div className="landing-container relative z-10">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="landing-eyebrow">
                  <Users className="w-3.5 h-3.5" />
                  Who is DevAstra for?
                </span>
                <h2 className="landing-h2 mt-5">
                  One platform. <span className="landing-gradient-text">Three perspectives.</span>
                </h2>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <button 
                  onClick={() => setActiveTab('students')}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'students' ? 'bg-white text-black' : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'}`}
                >
                  <GraduationCap className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                  For Students
                </button>
                <button 
                  onClick={() => setActiveTab('industry')}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'industry' ? 'bg-white text-black' : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'}`}
                >
                  <Building2 className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                  For Industry
                </button>
                <button 
                  onClick={() => setActiveTab('institutions')}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'institutions' ? 'bg-white text-black' : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'}`}
                >
                  <Users className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                  For Institutions
                </button>
              </div>

              <div className="bg-neutral-950/50 border border-white/10 rounded-3xl p-8 md:p-12 min-h-[300px] flex flex-col md:flex-row items-center overflow-hidden">
                {activeTab === 'students' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-10 items-center w-full">
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-4">Stop applying blind.</h3>
                      <p className="text-neutral-400 leading-relaxed mb-6">
                        Build a verifiable skill profile through assessments and mock interviews. Let AI identify your weak spots and give you a clear, personalized roadmap to get hired.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-emerald-500 mr-3 shrink-0" /> Prove your skills to employers instantly.</li>
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-emerald-500 mr-3 shrink-0" /> Get matched to jobs you actually qualify for.</li>
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-emerald-500 mr-3 shrink-0" /> AI-driven interview prep and feedback.</li>
                      </ul>
                    </div>
                    <div className="bg-neutral-900 rounded-2xl aspect-video border border-white/5 flex items-center justify-center">
                      <Target className="w-16 h-16 text-neutral-700" />
                    </div>
                  </motion.div>
                )}
                {activeTab === 'industry' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-10 items-center w-full">
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-4">Hire on evidence, not keywords.</h3>
                      <p className="text-neutral-400 leading-relaxed mb-6">
                        Stop filtering through thousands of identical resumes. See deterministic matching scores based on actual coding assessments and technical interviews.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-amber-500 mr-3 shrink-0" /> Real-time skill verification of candidates.</li>
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-amber-500 mr-3 shrink-0" /> Post roles and get perfectly matched shortlists.</li>
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-amber-500 mr-3 shrink-0" /> Reduce time-to-hire and interview overhead.</li>
                      </ul>
                    </div>
                    <div className="bg-neutral-900 rounded-2xl aspect-video border border-white/5 flex items-center justify-center">
                      <BarChart3 className="w-16 h-16 text-neutral-700" />
                    </div>
                  </motion.div>
                )}
                {activeTab === 'institutions' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-10 items-center w-full">
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-4">Fix the curriculum in real-time.</h3>
                      <p className="text-neutral-400 leading-relaxed mb-6">
                        Get aggregate analytics on your students' skill gaps compared to current industry demands. Update your syllabus before graduation, not after placement season.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-indigo-500 mr-3 shrink-0" /> Macro-level student performance analytics.</li>
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-indigo-500 mr-3 shrink-0" /> Live industry alignment scores.</li>
                        <li className="flex items-center text-sm text-neutral-300"><Check className="w-4 h-4 text-indigo-500 mr-3 shrink-0" /> Better placement rates through early intervention.</li>
                      </ul>
                    </div>
                    <div className="bg-neutral-900 rounded-2xl aspect-video border border-white/5 flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-neutral-700" />
                    </div>
                  </motion.div>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------- Final CTA ---------------- */}
        <section className="landing-section">
          <div className="landing-container">
            <Reveal>
              <div className="landing-cta-panel">
                <span className="landing-eyebrow">
                  <Building2 className="w-3.5 h-3.5" />
                  For students, institutions and industry
                </span>

                <h2 className="landing-h2 mt-6" style={{ fontSize: 'clamp(1.9rem, 4.2vw, 2.9rem)' }}>
                  Stop guessing where you stand.
                  <br />
                  <span className="landing-gradient-text">Prove it instead.</span>
                </h2>

                <p className="landing-lede mt-5 mx-auto" style={{ maxWidth: '38rem' }}>
                  Create your free account, take your first skill assessment, and see the roles your
                  current skill tree actually qualifies you for.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                  <Link to="/register" className="landing-btn landing-btn-primary landing-btn-lg">
                    Sign Up free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/login" className="landing-btn landing-btn-outline landing-btn-lg">
                    Log In
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="max-w-sm">
              <div className="flex items-center gap-3">
                <span className="landing-brand-badge">
                  <img src="/devlogo.jpg" alt="DevAstra" />
                </span>
                <span className="landing-wordmark">DevAstra</span>
              </div>
              <p className="landing-mock-meta mt-4" style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
                An AI-powered academia–industry skill intelligence platform. Built natively on InsForge.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <span className="landing-mock-meta">EXPLORE</span>
              <a className="landing-footer-link" href="#problem">
                The gap
              </a>
              <a className="landing-footer-link" href="#features">
                Features
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <span className="landing-mock-meta">GET STARTED</span>
              <Link className="landing-footer-link" to="/login">
                Log In
              </Link>
              <Link className="landing-footer-link" to="/register">
                Create an account
              </Link>
              <a
                className="landing-footer-link"
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4" />
                GitHub repository
              </a>
            </div>
          </div>

          <div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-10 pt-6"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <p className="landing-mock-meta">© {new Date().getFullYear()} DevAstra</p>
            <p className="landing-mock-meta">
              Master Your Skills. Shape Your Career.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
