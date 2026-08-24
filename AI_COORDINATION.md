# DevAstra - AI Coordination & Project State

This document serves as the central coordination file for all AI agents and developers working on the **DevAstra** project. It details the current state of the application, completed milestones, and active architectural decisions.

## 🚀 Project Overview
**DevAstra** (formerly SkillMaster Pro) is a flagship, highly interactive platform designed as an "Academia–Industry Skill Intelligence OS." It features a premium, glassmorphic dark-theme UI with advanced telemetry, AI-driven career guidance, and interactive skill vectors.

## 🛠 Tech Stack
- **Frontend:** React (Vite), Tailwind CSS v4, Framer Motion, Lucide React, React Hook Form, Zod.
- **Backend/DB/Auth:** InsForge (PostgreSQL, Edge Functions, GoTrue Auth).
- **Hosting:** InsForge Edge Network (Vercel under the hood).
- **Styling:** Custom design tokens mapped to Tailwind (`#050811` background, `#0F172A/75` surfaces, with Indigo/Cyan/Emerald accents).

## ✅ Completed Milestones

### 1. Preloader & Theme Architecture
- Integrated **Tailwind CSS v4** and set up core font families (Geist Sans / Plus Jakarta Sans & Geist Mono / JetBrains Mono).
- Built `DevAstraPreloader.jsx`: A high-performance 3.5s animated loading screen with an orbital gyroscope, canvas particle void, and telemetry terminal simulation.

### 2. Enterprise Authentication Suite
- **Location:** `src/pages/auth/AuthContainer.jsx`, `src/components/auth/*`
- Built a split-screen responsive layout with glowing grid backgrounds and metric badges.
- Implemented robust `react-hook-form` + `zod` validation for Login and Register flows.
- Added live username availability checking (debounced) and a 4-stage visual password strength meter.
- Implemented `ForgotPasswordModal.jsx` with a 3-step OTP flow (Request Code → 6-digit visual OTP input with paste support → Reset Password).
- Abstracted all auth logic into `src/services/auth.service.js`.

### 3. Dashboard Shell & Layout
- **Location:** `src/components/layout/Layout.jsx`, `Header.jsx`, `Sidebar.jsx`
- Built a deep obsidian (`#0B101B`) glassmorphic shell architecture.
- **Header:** Features quick-switch pills, Student Pro badge, Cmd+K search trigger, and an interactive Avatar dropdown.
- **Sidebar:** Left-docked, translucent navigation panel with smooth active states and subtle pill glows, responsive mobile drawer.

### 4. Dashboard Grid & Widgets (Pathfix-Inspired)
- **Location:** `src/pages/dashboard/Dashboard.jsx`
- **12-Column Responsive Grid** featuring deep navy glass cards.
- **Main Hero Sprint Card:** Tracks roadmap sprint progress, target skill deltas (e.g., `ML: 48% → 55%`), and a "Launch Next Module" action.
- **Career Copilot AI Widget:** Top-right gradient card that opens a floating conversational drawer (Framer Motion) pre-loaded with contextual prompts.
- **Career Readiness Gauge:** Custom SVG circular gauge that animates from `0% → 68%` with a smooth Cyan → Indigo → Emerald gradient, alongside vector breakdown bars.
- **Activity Heatmap:** 40-week GitHub-style contribution grid with 4-level emerald color intensity and hover tooltips.
- **Daily Planner:** Checklist cards with time slots, durations, and dynamic strikethrough/XP reward states.
- **Opportunity Match Gap Card:** Highlights a target role (e.g., Google Frontend Engineer), shows a 72% match badge, and provides a clear tabular breakdown of Required vs User skills.

## 🌐 Deployment Status
- **Frontend URL:** [https://6vjqpi3p.insforge.site](https://6vjqpi3p.insforge.site)
- **InsForge API:** `https://6vjqpi3p.us-west.insforge.app`
- Continuous deployment via `@insforge/cli deployments deploy frontend` is working successfully.
- Added `vercel.json` with SPA rewrite rules to prevent 404s on client-side routes.

### 5. Critical Bug Fix & Deployment Recovery (Agent Session — 2026-08-24)
- **Root Cause:** `404: DEPLOYMENT_NOT_FOUND` error caused by missing SPA rewrite rules and stale deployment. Full source audit revealed **10 additional runtime bugs** preventing app functionality.
- **Deployment Fix:**
  - Created `frontend/vercel.json` with `"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]` to handle SPA client-side routing on Vercel/InsForge.
- **Critical Fixes (Fatal Crashes):**
  - `Dashboard.jsx` (L3): Added missing `Briefcase` import from `lucide-react` — was causing `ReferenceError` crash on `/dashboard`.
  - `api.js`: Added missing `assessmentService.getAssessmentById()` and `assessmentService.getHistory()` — was crashing `/assessments`, `/profile`, `/onboarding`.
  - `api.js`: Added missing `jobService.getApplications()` and `jobService.apply()` — was crashing "My Applications" and "Apply Now" in `/jobs`.
  - `api.js`: Added missing `aiService.careerCopilot()` — was crashing AI chat in `/career-guidance` and the floating Career Copilot drawer.
- **High-Priority Fixes:**
  - `TestQuiz.jsx` (L213): Fixed broken navigation from `/learning-paths` → `/roadmap` (route didn't exist).
  - `Analytics.jsx` (L4–5, L246): Imported `Cell` from `recharts` and fixed lowercase `<cell>` → `<Cell>` JSX element.
- **Medium-Priority Fixes:**
  - `App.jsx` (L38, L45): Fixed `user?.needsOnboarding` → destructured `needsOnboarding` from `useAuth()` context directly.
  - `CareerCopilot.jsx` (L29): Replaced hardcoded `ws://localhost:8000/ws/chat/` with dynamic `window.location.host`-based WebSocket URL.
  - `auth.service.js` (L35): Replaced deprecated synchronous `insforge.auth.user()?.id` with async `insforge.auth.getSession()`.

## ⏭️ Next Steps / Handoff Notes
1. **Mock Interview / AI Resume Modules:** The AI features (`/interview`, `/resume`) need to be integrated with the live backend LLM APIs (OpenRouter via InsForge Edge Functions).
2. **Dynamic Data Fetching:** The current dashboard widgets use heavily polished mock data to establish the UI baseline. The next agent should connect `auth.service.js` and `api.js` to hydrate the Readiness Gauge, Heatmap, and Daily Planner with live PostgreSQL data.
3. **Onboarding Flow:** If a user logs in and `needsOnboarding` is true, they are routed to `/onboarding`. This UI needs the same premium glassmorphic treatment as the Dashboard.
4. **Industry Admin Sidebar:** `isIndustry` role is detected in `Sidebar.jsx` but the `/admin/industry` nav item is not rendered (unlike `isInstitution`).
5. **DailyPlanner SPA Link:** `DailyPlanner.jsx` (L107) uses native `<a href="/assessments">` which causes a full page reload instead of React Router `<Link>`.

*End of Coordination File*
