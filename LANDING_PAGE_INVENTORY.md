# DevAstra — Landing Page & Platform Inventory (for 3D Redesign)

Source of truth: `frontend/src/pages/Landing.jsx`, `frontend/src/landing.css`,
`frontend/src/App.jsx`, `README.md`, `insforge.toml`, `insforge_schema.sql`,
`insforge_functions/ai_copilot.py`, feature pages under `frontend/src/pages/`.

---

## 1. Brand

| Item | Value |
|---|---|
| Name | **DevAstra** (rendered `DEV` + gradient `ASTRA` in-app) |
| Tagline used on landing | **"Master your skills. Shape your career."** |
| Sub-label | "Intelligence OS" |
| One-liner (footer) | "An AI-powered academia–industry skill intelligence platform. Built natively on InsForge." |
| Category label | "Academia–Industry Skill Platform" |
| AI copilot name | **Dhruv** (the AI Career Copilot persona) |
| Origin | Built for Smart India Hackathon (SIH) 2026, Problem Statement 26044 |
| GitHub | https://github.com/satvik0160/Hackathon-Project-Ai-Manthan-2.0- |

### Design system (from `index.css` / `landing.css`)
- Primary CTA: **gold gradient** `#D9AF67 → #C9A050` (light theme: solid amber `#B45309 → #92400E`).
- Accent: **indigo/violet** `#6366F1` / `#8B5CF6`; teal `#14B8A6` used in glows.
- Fonts: **Plus Jakarta Sans** (sans), **JetBrains Mono** (mono).
- Both dark (default) and light themes; `prefers-reduced-motion` honoured globally.
- Ambient blurred glows (`filter: blur(90px)`) in each section.

### Existing assets (`frontend/public/`)
- Logos: `devlogo.jpg`, `logo1.png`, `dhruvlogo.webp`
- Video: `video.mp4`
- Images (`/images/`): `hero-skills.jpg`, `step-assess.jpg`, `step-ai.jpg`, `step-match.jpg`, `tab-students.jpg`, `tab-industry.jpg`, `tab-institutions.jpg`

---

## 2. Current landing page — structure & exact copy

### 2.1 Sticky top nav
- Brand badge (logo) + wordmark "DevAstra" + sub "Intelligence OS".
- Section links: **"The gap"** (`#problem`), **"Features"** (`#features`) — hidden below 900px, **no mobile hamburger exists**.
- Actions: **Log In** (ghost), **Sign Up** (primary, + arrow).
- On scroll: frosted-glass bar (blur + border + shadow).

### 2.2 Hero
- Eyebrow: "Academia–Industry Skill Platform" (sparkles icon).
- H1: **"Master your skills." / "Shape your career."** (second line gradient text).
- Lede: "DevAstra closes the gap between what your syllabus covers and what industry actually hires for — AI coaching, deterministic job matching and progress that keeps you showing up."
- Body: "Assess your real skill level, get matched to live roles on evidence rather than keywords, and hand your institution the analytics to fix the curriculum behind you."
- CTAs: **"Get Started"** → `/register`, **"See how it works"** → `#features`.
- Tech chips: "React 19 + Vite", "Postgres + RLS", "Serverless on InsForge".
- Hero visual: photo composition that **tilts in 3D with pointer movement** (spring-damped, ±7°), hover zoom, caption "ASSESSED SKILLS → LIVE ROLES", with two floating glass cards:
  - **"92% — Frontend Engineer / match score"**
  - **"18-day streak / consistency ×1.4"**
- Three ambient glow blobs.

### 2.3 Stats strip (4 metrics — *placeholder/aspirational values*)
| Metric | Value |
|---|---|
| Active Students | **10K+** |
| Assessments Taken | **50K+** |
| Industry Roles Matched | **500+** |
| Placement Readiness | **92%** |

### 2.4 Problem / hook (`#problem`)
- Eyebrow: "The problem".
- H2: **"Graduates are not underqualified. They are unverified."**
- Para 1: "Curricula move in years; industry hiring moves in months. Students graduate with transcripts that say nothing about whether they can actually do the job, and institutions have no early signal that a skill has stopped being relevant."
- Para 2: "The result is a widening gap that hurts everyone: students apply blind, recruiters screen on guesswork, and colleges find out too late — after the placement numbers come in."

### 2.5 How it works (`#how-it-works`) — 3 photo step cards
1. **Assess & Baseline** — "Take adaptive assessments to map your current skill tree. No more guessing—know exactly where you stand against industry standards." (icon: Target)
2. **AI-Guided Growth** — "Dhruv, your AI Career Copilot, identifies your gaps and builds a personalized daily roadmap to make you job-ready." (icon: Brain)
3. **Deterministic Matching** — "Get matched to live industry roles based on verifiable evidence rather than keyword-stuffed resumes." (icon: Building2)
- Desktop connector line; hover lift + photo zoom; icon badge overlaps photo.

### 2.6 Feature showcase (`#features`) — 4 zigzag engines
Header H2: **"Four engines, one verifiable skill signal."**
Sub: "Each engine feeds the next: assessments build your skill tree, the skill tree drives matching, coaching closes the gaps, and the analytics loop back to the curriculum."

**01 · AI Career Copilot** — "Meet Dhruv — your copilot for interviews and resumes"
- Mock interviews with per-answer scoring on structure, depth and clarity
- Resume rewritten against a specific job description, not generic advice
- Powered by Gemini Flash through InsForge edge functions
- Visual: chat mock — Q: "Walk me through how you would optimise a slow-rendering React list." A: "Virtualise the rows…" Score: "Structure 82 · Depth 74 · Clarity 88".

**02 · Deterministic Job Matching** — "Your skill tree, mapped to live industry roles"
- Matches derived from assessed skills, never from resume keywords
- A visible gap list telling you exactly what to learn next
- Explainable match scores you can defend in an interview
- Visual: assessed skill tree (React, TypeScript, Node.js, SQL, System Design) + matched roles — Frontend Engineer 92%, Full Stack Developer 78%, Data Analyst 61%.

**03 · Gamification Engine** — "Streaks, XP and levels that keep you showing up"
- Daily streaks with a consistency multiplier
- XP, levels and achievements tied to real assessment outcomes
- Leaderboards that make progress social, not solitary
- Visual: 18-day streak, Level 7, 2,480 XP / 520 XP to Level 8, weekly leaderboard (Ananya R. 12,480 · You 11,905 · Rahul K. 10,220).

**04 · Institutional Analytics** — "Dashboards that expose curriculum gaps"
- Cohort-wide skill gap detection across departments
- Live comparison against industry role requirements
- Placement-readiness trends for faculty and administration
- Visual: cohort skill coverage bars (DSA 78%, SQL 64%, Cloud 31%, Testing 22%) + "Curriculum gap detected — Cloud and Testing trail industry demand by 40%+".

### 2.7 Audience tabs (`#audience`)
Header H2: **"One platform. Three perspectives."**
- **For Students** — "Stop applying blind." … "Build a verifiable skill profile through assessments and mock interviews. Let AI identify your weak spots and give you a clear, personalized roadmap to get hired."
  - Prove your skills to employers instantly.
  - Get matched to jobs you actually qualify for.
  - AI-driven interview prep and feedback.
- **For Industry** — "Hire on evidence, not keywords." … "Stop filtering through thousands of identical resumes. See deterministic matching scores based on actual coding assessments and technical interviews."
  - Real-time skill verification of candidates.
  - Post roles and get perfectly matched shortlists.
  - Reduce time-to-hire and interview overhead.
- **For Institutions** — "Fix the curriculum in real-time." … "Get aggregate analytics on your students' skill gaps compared to current industry demands. Update your syllabus before graduation, not after placement season."
  - Macro-level student performance analytics.
  - Live industry alignment scores.
  - Better placement rates through early intervention.

### 2.8 Final CTA
- Eyebrow: "For students, institutions and industry"
- H2: **"Stop guessing where you stand." / "Prove it instead."**
- Body: "Create your free account, take your first skill assessment, and see the roles your current skill tree actually qualifies you for."
- Buttons: **"Sign Up free"** → `/register`, **"Log In"** → `/login`.

### 2.9 Footer
- Brand + "An AI-powered academia–industry skill intelligence platform. Built natively on InsForge."
- **EXPLORE:** The gap, Features
- **GET STARTED:** Log In, Create an account, GitHub repository
- Bottom: "© {year} DevAstra" · "Master Your Skills. Shape Your Career."

### 2.10 Animation / motion currently used
`Reveal` scroll-in (intersection, once), pointer-tilt 3D hero, floating card drift loops,
hover zoom on all photos, sticky nav transition. Reduced-motion respected everywhere.

---

## 3. The rest of the platform (what a landing page could/should surface)

### 3.1 Public / auth
- `/login`, `/register` (email + Google + GitHub OAuth; email confirmation disabled).
- `/auth/callback` OAuth handler.
- `/onboarding` — multi-step: profile → **skills picker** (Python, JavaScript, React, Django, SQL, ML, Data Analysis, HTML/CSS, Node.js, Git, Docker, Cloud, Cybersecurity, UI/UX, Java, C++, Go, Kubernetes) → **career goal** (Data Scientist, Full Stack, DevOps, Cybersecurity Analyst, AI/ML Engineer, Cloud Architect, Mobile, Backend, Frontend) → initial assessment.
- Role-based routes: `STUDENT`, `INSTITUTION_ADMIN` (`/admin/institution`), `INDUSTRY` (`/admin/industry`).

### 3.2 Student workspace (all `Sidebar` items)
| Route | Nav label | What it actually does |
|---|---|---|
| `/dashboard` | Dashboard | Command center: hero banner, skill score, vector breakdown, opportunity match, roadmap sprint, growth, missions, leaderboard preview, progress overview, activity heatmap |
| `/learning` | Learning Hub | Resource library (video/course/article, filters by type/difficulty/skill, AI path generation) |
| `/assessments` | Skill Tests | Assessment catalog by category/difficulty + attempt history |
| `/assessments/:id` | — | Timed quiz with per-question answer checking |
| `/planner` | Timetable | Daily planner / daily targets, completion tracking |
| `/jobs` | Internships | Live roles, **matched** tab, applications tab, filters, resume/URL analysis |
| `/interview` | Mock Interview | Role + difficulty + type setup, timed Q&A with **voice input**, per-answer scoring (overall/technical/communication, strengths/weaknesses) |
| `/roadmap` | Career Map | **3D force-directed skill graph** (`react-force-graph-3d` + three.js), generate/learning paths |
| `/arcade` | Code Arcade | 3 mini-games: **CSS Battle Royale**, **Algorithm Speedrun**, **SQL Murder Mystery** (each worth XP: 500/800/1200) |
| `/resume` | AI Resume | AI-tailored resume with templates (ATS Optimized, Modern, Minimal, Academic) + match score |
| `/career-guidance` | DevAstra AI | Career guidance chat (predefined prompts: readiness, role comparison, what to learn next, profile strength) |
| `/achievements` | Achievements | XP levels (Beginner → Explorer → Achiever → Expert → Master) + badge grid |
| `/leaderboard` | Top Rank | Global ranking via `get_leaderboard` RPC |
| `/analytics` | Progress | Readiness trend, skill growth, learning hours, application funnel charts |
| `/profile`, `/settings` | — | Profile & preferences (incl. opt-in glass-tap sound) |

### 3.3 Admin / partner hubs
- **Institution Hub** — total students, average score, placement readiness, skill-gap bars (current vs required), career-goal distribution, curriculum alignment ratings (Strong/Moderate/Weak/Missing).
- **Industry Hub** — post/manage job listings, applicant tracking, **skill demand vs supply intelligence** (e.g. React demand 95 / supply 60).

### 3.4 Cross-cutting
- **Floating AI copilot "Dhruv"** available on every authenticated page (WebSocket streaming with REST fallback).
- **Gamification**: XP, levels, daily streaks with consistency multiplier, achievements, arcade XP, leaderboard.

### 3.5 AI capabilities (edge function `ai_copilot`, Gemini 2.0 Flash)
- `career_copilot` — Q&A career mentor.
- `mock_interview` — generates questions; `submit_answer` scores answer as JSON {overall, technical, communication, strengths, weaknesses}.
- `resume_tailor` — tailors resume to a job description, returns 0–100 match score + markdown.
- `job_matching_engine` — deterministic skill-tree → role matching.

### 3.6 Architecture / trust facts (good landing-page proof points)
- **100% serverless on InsForge**; no Django monolith.
- **Postgres with Row-Level Security (RLS)** at DB level (users can only read/update own profile & scores).
- **Auth**: JWT, email + Google + GitHub.
- **Storage**: `resumes` bucket.
- **Edge functions**: Python 3.11 on InsForge; AI via Gemini Flash.
- Tables: `users`, `skill_categories`, `assessments`, `questions`, `user_assessments`, `jobs`, `job_applications`, plus `learning_resources`, `learning_paths`, `daily_planner_targets`.
- Frontend: **React 19 + Vite**, Tailwind, framer-motion, recharts, react-force-graph-3d/three.

---

## 4. Existing 3D / interaction tech already in the repo (reuse, don't reinvent)
- `TiltCard.jsx` — reusable pointer-tilt card (±15°, translateZ 30px).
- `InteractiveAuroraBackground.jsx` (~1136 lines) — canvas particle field, pointer vortex, click shockwave, drifting aurora blobs, flowing ribbons, Milky Way band, ringed planet; `variant="app"` (light pastel) and `variant="auth"` (deep cosmic). Reduced-motion → single static frame.
- `HeroBanner.jsx` (dashboard) — pure-SVG **3D purple planet** with ring, atmosphere glow, terminator shadow, spin/float keyframes.
- `Roadmap.jsx` — live `ForceGraph3D` skill galaxy.
- `three` and `react-force-graph-3d` are already dependencies → a WebGL 3D landing is feasible.

---

## 5. Gaps a 3D redesign should address (currently missing from landing)
- **No mobile nav** (section links hidden < 900px, no hamburger).
- **No social proof**: testimonials, logos of partner colleges/companies, case studies.
- **No pricing / plans** (free-account language exists but no tiered pricing).
- **No FAQ**, no "About/team", no contact, no blog.
- **No legal links** (Privacy, Terms) in footer.
- **Stats are unverified placeholders** (10K+/50K+/500+/92%) — either substantiate or relabel.
- **Light-mode contrast bugs on landing**: multiple `text-neutral-300/400` and `bg-white/5` classes on light surfaces (audience tab list items, step descriptions) — fix during redesign.
- **Only 2 nav anchors** exposed; "How it works" and "Who it's for" are not linked.
- **No real product screenshots** — features use illustrative mocks (documented in code).
- **Accessibility**: keep WCAG AA on accent text; preserve reduced-motion support, keyboard nav, and alt text.

---

## 6. Constraints to state in your 3D prompt
1. Stack: React 19 + Vite + Tailwind + framer-motion; `three` already installed.
2. Must support dark **and** light themes, and degrade to a static frame under `prefers-reduced-motion`.
3. Must stay responsive (mobile → desktop) and not create horizontal overflow from floating elements.
4. Keep copy, CTAs, and routes intact: `/register`, `/login`, anchors `#problem`, `#features`, `#how-it-works`, `#audience`.
5. Perf budget: lazy-load heavy 3D, cap DPR at 2, pause when tab hidden (patterns already used in the aurora background).
6. Preserve the gold CTA + indigo accent identity and Plus Jakarta Sans / JetBrains Mono typography.
