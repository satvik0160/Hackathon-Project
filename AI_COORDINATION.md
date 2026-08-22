# SkillMaster Pro - AI Coordination

> **Status:** ⚙️ Backend Overhaul in Progress
> **Current Phase:** API Development (Adapting to New Database Architecture)
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
**SkillMaster Pro** — A smart platform for Academia-Industry Collaboration (SIH 26044).
Connecting STUDENTS ↔ INSTITUTIONS ↔ INDUSTRY through skill mapping, internships, placement, and personalized learning.

---

## 📁 Project Structure
```
hackathon-project/
├── AI_COORDINATION.md          ← This file (shared brain)
├── .gitignore
├── backend/                    ← Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── skillmaster/            ← Django project settings (Main routing)
│   ├── core/                   ← Base models (TimeStamped, SoftDelete), Audit, Notifications
│   ├── users/                  ← Users, StudentProfiles, FacultyProfiles, CareerGoals
│   ├── skills/                 ← Skill Taxonomy, Relationships, StudentSkills, Evidences
│   ├── institutions/           ← Institutions, Departments, Courses, Curriculum Alignment
│   ├── assessments/            ← Diagnostic Assessments, User Submissions
│   ├── learning/               ← Learning Resources, Resource Prerequisites, Progress
│   ├── skill_tests/            ← Rigorous Verification Tests, Questions, Attempts, Results
│   ├── planner/                ← Daily Planner, Targets, Streaks, Gamification (XP)
│   ├── roadmaps/               ← Career Roadmaps, Nodes, Dependencies, Student Progress
│   ├── jobs/                   ← Companies, Job/Internship Postings, Skill Matches, Applications
│   ├── interviews/             ← Mock Interviews, Technical/Soft Skills Scoring
│   ├── resumes/                ← Resume Builder, Versions, Sections, Generation Logs
│   ├── guidance/               ← AI Career Guidance Sessions, Context Snapshots
│   └── industry/               ← Industry Skill Demands, Projects, Feedback
└── frontend/                   ← React + Vite
    ├── package.json
    ├── vite.config.js
    └── src/
        └── (Frontend structure remains to be adapted to new API)
```

---

## 👥 Division of Labor
*   **Person 1 (Laptop 1):** Backend (Django REST API logic, endpoints, and integration)
*   **Person 2 (Laptop 2):** Frontend (React UI, Vite, connecting API to the interface)
*   **Person 3 (Laptop 3):** Database (Django Models, seed data, queries, and optimization)

---

## 🚀 How to Run the Project

### Backend (Django):
```bash
cd hackathon-project/backend
export PATH="$HOME/.local/bin:$PATH"
python manage.py runserver       # Starts at http://localhost:8000
```
*(Ensure you have run `python manage.py migrate` and `python manage.py seed_data` first)*

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
*   **[2026-08-23 01:23] Person 1's AI:** Built complete React frontend prototype.
*   **[2026-08-23 03:17] Person 3's AI (Database):** Massive Database Overhaul! Replaced 4 apps with 14 normalized apps (`core`, `users`, `skills`, `institutions`, `assessments`, `learning`, `skill_tests`, `planner`, `roadmaps`, `jobs`, `interviews`, `resumes`, `guidance`, `industry`). Created 60+ models, added security/constraints, migrated DB, and ran a comprehensive `seed_data.py`. Temporarily commented out old API URLs in `skillmaster/urls.py` to prevent crashes. Handing off to Person 1.
*   **[2026-08-23 03:25] Person 1's AI (Backend):** Acknowledged the new database schema. Preparing to rewrite serializers, views, and API endpoints for the 14 new apps.

---

## 🔑 API Endpoints Reference (UNDER CONSTRUCTION ⚠️)
*Person 1 (Backend) is currently rewriting the API to match the new 14-app database schema. The old endpoints have been removed from this list to prevent frontend confusion. New endpoints will be documented here as they are built.*
