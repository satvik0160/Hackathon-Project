# SkillMaster Pro - AI Coordination

> **Status:** ✅ Prototype Built — Ready for Development
> **Current Phase:** Feature Development
> **Tech Stack:** Django 6.1 (Backend) + React 19 with Vite (Frontend)

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
**SkillMaster Pro** — A smart platform where students can:
1. **Test their skills** through interactive assessments/quizzes
2. **Get a personalized learning path** based on their assessment results
3. **Find matching jobs/internships** that match their skill profile

---

## 📁 Project Structure
```
hackathon-project/
├── AI_COORDINATION.md          ← This file (shared brain)
├── .gitignore
├── backend/                    ← Django REST API
│   ├── manage.py
│   ├── skillmaster/            ← Django project settings
│   │   ├── settings.py
│   │   ├── urls.py             ← Main URL router (/api/*)
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── users/                  ← User profiles & authentication
│   │   ├── models.py           ← Custom User model
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│   ├── assessments/            ← Skill tests & quizzes
│   │   ├── models.py           ← SkillCategory, Assessment, Question, UserAssessment
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│   ├── learning/               ← Personalized learning paths
│   │   ├── models.py           ← LearningResource, LearningPath, UserProgress
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│   └── jobs/                   ← Job/internship matching
│       ├── models.py           ← Company, JobListing, JobApplication
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│       └── admin.py
└── frontend/                   ← React + Vite
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── App.css              ← Global styles (dark theme, glass-morphism)
        ├── components/
        │   └── Navbar.jsx
        ├── pages/
        │   ├── Home.jsx         ← Landing page
        │   ├── Dashboard.jsx    ← User dashboard
        │   ├── Assessments.jsx  ← Browse assessments
        │   ├── AssessmentQuiz.jsx ← Take a quiz
        │   ├── LearningPath.jsx ← Personalized learning
        │   ├── Jobs.jsx         ← Job/internship listings
        │   └── Profile.jsx      ← User profile
        └── services/
            └── api.js           ← Axios API service
```

---

## 👥 Division of Labor
*   **Person 1 (Laptop 1):** Project setup, Django models, initial prototype ✅ DONE
*   **Person 2 (Laptop 2):** Unassigned — Suggested: Backend API refinement, seed data, authentication
*   **Person 3 (Laptop 3):** Unassigned — Suggested: Frontend polish, animations, responsive design

---

## 🚀 How to Run the Project

### Backend (Django):
```bash
cd hackathon-project
source venv/bin/activate         # Activate Python environment
cd backend
python manage.py runserver       # Starts at http://localhost:8000
```

### Frontend (React):
```bash
cd hackathon-project/frontend
npm run dev                      # Starts at http://localhost:5173
```

---

## 📝 AI Communication Log
*(When an AI finishes a task, it logs it here so the other AIs understand what happened)*

*   **[2026-08-23 01:08] Person 1's AI:** Initialized repository, created AI_COORDINATION.md
*   **[2026-08-23 01:17] Person 1's AI:** Installed Python pip, Node.js, npm on the system
*   **[2026-08-23 01:17] Person 1's AI:** Created Django project (skillmaster) with 4 apps: users, assessments, learning, jobs
*   **[2026-08-23 01:23] Person 1's AI:** Built complete Django backend — all models, serializers, views, URLs, admin registrations
*   **[2026-08-23 01:23] Person 1's AI:** Built complete React frontend — 7 pages with dark theme, glass-morphism UI, mock data
*   **[2026-08-23 01:24] Person 1's AI:** Ran migrations successfully, all database tables created
*   **[2026-08-23 01:26] Person 1's AI:** Installed all frontend npm dependencies

---

## 🔑 API Endpoints Reference
| Endpoint | Method | Description |
|---|---|---|
| `/api/users/register/` | POST | Register new user |
| `/api/users/profile/` | GET/PUT | View/update profile |
| `/api/users/skills/` | GET/PUT | View/update user skills |
| `/api/assessments/categories/` | GET | List skill categories |
| `/api/assessments/` | GET | List all assessments |
| `/api/assessments/<id>/` | GET | Assessment details with questions |
| `/api/assessments/submit/` | POST | Submit assessment answers |
| `/api/assessments/history/` | GET | User's assessment history |
| `/api/learning/resources/` | GET | List learning resources |
| `/api/learning/paths/` | GET | List user's learning paths |
| `/api/learning/generate/` | POST | Generate learning path from results |
| `/api/learning/progress/` | POST | Update learning progress |
| `/api/jobs/listings/` | GET | List job/internship listings |
| `/api/jobs/match/` | GET | Get jobs matching user skills |
| `/api/jobs/apply/` | POST | Apply to a job |
| `/api/jobs/applications/` | GET | User's application history |
