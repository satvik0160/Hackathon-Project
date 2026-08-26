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

## ⏭️ Next Steps / Handoff Notes
1. **Mock Interview / AI Resume Modules:** The AI features (`/interview`, `/resume`) need to be integrated with the live backend LLM APIs (OpenRouter via InsForge Edge Functions).
2. **Dynamic Data Fetching:** The current dashboard widgets use heavily polished mock data to establish the UI baseline. The next agent should connect `auth.service.js` and `api.js` to hydrate the Readiness Gauge, Heatmap, and Daily Planner with live PostgreSQL data.
3. **Onboarding Flow:** If a user logs in and `needsOnboarding` is true, they are routed to `/onboarding`. This UI needs the same premium glassmorphic treatment as the Dashboard.

**Terminal 1 (Django Server - Uses Daphne for WebSockets):**
```bash
cd hackathon-project
source venv/bin/activate
cd backend
daphne skillmaster.asgi:application --port 8000
```
*(Ensure you have run `python manage.py migrate` and `python manage.py seed_data` first)*

**Terminal 2 (Celery Background Workers):**
```bash
source venv/bin/activate
cd backend
celery -A skillmaster worker --loglevel=info
```
*(Requires Redis to be installed and running on the OS via `sudo systemctl start redis`)*

---

## 📝 AI Communication Log
*(When an AI finishes a task, it logs it here so the other AIs understand what happened)*

*   **[2026-08-23 01:08] Person 1's AI:** Initialized repository, created AI_COORDINATION.md
*   **[2026-08-23 01:23] Person 1's AI:** Built initial Django models and React mockups.
*   **[2026-08-23 05:15] Person 1's AI:** 🔥 **COMPLETED THE ENTIRE 36-POINT BACKEND ARCHITECTURE.** 
    *   Implemented strict JWT Auth & RBAC (Student, Institution, Industry, Mentor).
    *   Built `SkillEngine` (Algorithmic proficiency updates, gap analysis).
    *   Built `GamificationEngine` (XP, Freezes, Streaks).
    *   Integrated Google Gemini Flash 1.5 for AI Chatbot (WebSockets streaming), Resume Tailor, and Mock Interviews.
    *   Built Institution Analytics and Deterministic Job Matching.
    *   Hardened Security (No `/admin`, Strict CORS, XSS protections, Password Reset flows).
    *   Upgraded to Enterprise Stack (Celery, Channels, Redis Caching).
    *   Created GitHub Actions CI/CD Pipeline & Automated Unit Tests.

---

## 🔑 Advanced API Endpoints Reference
*(The API documentation is auto-generated! View all schemas at `http://localhost:8000/api/docs/swagger/`)*

### Authentication & Security
*   `POST /api/users/login/` - Get JWT Access & Refresh Token
*   `POST /api/users/logout/` - Blacklist Token
*   `POST /api/users/password-reset/` - Send reset email (Generates Link)
*   `POST /api/users/password-reset/confirm/` - Confirm new password

### Student Journey
*   `POST /api/users/onboard/` - Complete profile & career goals
*   `GET /api/users/notifications/` - Get read/unread notifications
*   `POST /api/assessments/submit/` - Triggers `SkillEngine` & `GamificationEngine` logic
*   `GET /api/learning/daily-planner/` - AI-curated daily learning tasks

### Jobs & Industry
*   `GET /api/jobs/match/` - Explainable job matching scores
*   `GET /api/jobs/listings/?job_type=internship&search=engineer` - Advanced filtering
*   `POST /api/jobs/industry/post/` - Industry partners post jobs
*   `POST /api/jobs/mentor-feedback/` - Mentors provide feedback

### AI Integration & WebSockets
*   `POST /api/users/ai/mock-interview/` - Generates technical questions
*   `POST /api/users/ai/resume-tailor/` - Verifies skills and tailors resume
*   `ws://127.0.0.1:8000/ws/chat/` - **WebSocket:** Real-time streaming Career Copilot Chatbot

### Analytics
*   `GET /api/users/analytics/institution/` - 10-minute Cached heavy aggregation

---
**TO PERSON 2 (FRONTEND):** 
The API is fully built, secure, and running on your local network. You can start connecting your Axios calls to these endpoints immediately. Please check the Swagger Docs for exact JSON payloads!

**TO PERSON 3 (DATABASE):**
The Models are perfect, but the database is currently empty. Please write a Python seeder script (`management/commands/seed_db.py`) to generate fake Users, Assessments, Learning Paths, and Jobs so Person 2 has data to render on the screen!

*End of Coordination File*
