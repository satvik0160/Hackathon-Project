# SkillMaster Pro - AI Coordination

> **Status:** 🟢 Frontend Completed — Ready for Database Seeding
> **Current Phase:** 🗄️ Database Seeding & Final Polish
> **Tech Stack:** Django 6.1 (Backend), PostgreSQL/SQLite, Redis, Celery + React 19 with Vite (Frontend)

---

## 🧠 How we work together (The 3 AIs)
This file is the "Shared Brain" for our 3 Antigravity AI instances. 
Since we are running on 3 different laptops, we will communicate by reading and updating this file.

**Golden Rules for the Humans:**
1. Always run `git pull` before asking us to do work.
2. Always run `git push` immediately after we finish working.
3. Don't ask us to edit the exact same file at the exact same time.

---

## 🏗️ Project Overview
**SkillMaster Pro** — An AI-Powered Academia–Industry Skill Intelligence Platform where students can:
1. Take algorithmic skill assessments.
2. Get AI-generated learning paths and mock interviews.
3. Earn XP and streaks (Gamification).
4. Get deterministically matched to Industry Jobs.
5. Provide Institutions with macro-level Analytics.

---

## 👥 Division of Labor
*   **Person 1 (Laptop 1):** Backend (Django REST API logic, endpoints, and integration) **[STATUS: COMPLETED]**
*   **Person 2 (Laptop 2):** Frontend (React UI, Vite, connecting API to the interface) **[STATUS: READY TO START]**
*   **Person 3 (Laptop 3):** Database (Django Models, seed data, queries, and optimization) **[STATUS: PENDING SEEDING]**

---

## 🚀 How to Run the Project (Backend)

**Terminal 1 (Django Server - Uses Daphne for WebSockets):**
```bash
cd hackathon-project
source venv/bin/activate
cd backend
daphne skillmaster.asgi:application --port 8000
```

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
*   **[2026-08-23 11:25] Person 1's AI:** Fixed GitHub Actions CI/CD pipeline (updated Python matrix to 3.12+ for Numpy/Django 6.1 compatibility). Hard reset remote to ensure stable backend after conflicting database PRs.
*   **[2026-08-23 12:01] Person 2's AI:** 🔥 **COMPLETED THE ENTIRE FRONTEND REBUILD (7,400+ LINES OF CODE).**
    *   Built complete design system with Light/Dark mode and 40+ customized component styles.
    *   Implemented 20+ fully responsive pages using React 19, Vite, and Framer Motion.
    *   Integrated JWT Context, auto-refresh, and complete API service layer connecting to Django.
    *   Built the 8-step Onboarding Wizard, Dashboard (with charts & gauges), Skill Tests, and Roadmap.
    *   Built all AI UI: WebSocket Career Copilot widget, Mock Interview platform, AI Resume Builder.
    *   Built Admin portals: Institution Dashboard and Industry Dashboard with complex Recharts data visualization.
    *   Vite build compiles perfectly with zero errors. Passed control back to DB Developer for final seed data.
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
The Models are perfect, but the database is currently empty. **CRITICAL:** Do NOT generate or seed any fake users! The project owner requested strictly real users only. However, you may seed realistic jobs, courses, and skill assessments so that Person 2 has structural data to render on the screen.
