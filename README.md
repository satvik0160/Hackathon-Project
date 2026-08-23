<div align="center">
  <img src="SIH_Final_PPT.pptx" alt="SkillMaster Pro Logo Placeholder" width="200" height="200" />
  <h1>🚀 SkillMaster Pro</h1>
  <p><strong>An AI-Powered Academia–Industry Skill Intelligence Platform</strong></p>
  <p><em>Built natively on <a href="https://insforge.dev">InsForge</a> for SIH 2026 (Problem Statement 26044)</em></p>
</div>

---

## 🌟 The Vision
The gap between academic curriculum and industry expectations is widening. **SkillMaster Pro** acts as the definitive bridge. By leveraging cutting-edge Artificial Intelligence and a robust serverless architecture, we provide real-time skill assessments, deterministically match students with industry roles, and provide institutions with macro-level analytics to adapt their curricula.

## 🏗️ Architecture Pivot (The InsForge Transition)
We have completely transitioned our heavy, monolithic Django backend into a **100% Serverless Architecture** powered by **InsForge**.

Why? Because autonomous scaling, zero-maintenance infrastructure, and edge-deployed AI are the future.
*   **InsForge Database:** Native PostgreSQL with Row-Level Security (RLS).
*   **InsForge Auth:** Seamless JWT-based user authentication (Login, Registration, Password Resets).
*   **InsForge Edge Functions:** Python-based serverless functions for our AI Copilot and Gamification Engines.
*   **Frontend:** React 19 + Vite, talking directly to InsForge via the `insforge-js` SDK.

## ✨ Core Features
1. **🤖 AI Career Copilot:** Real-time mock interviews and automated resume tailoring via Gemini Flash 1.5.
2. **🎯 Deterministic Job Matching:** Advanced algorithms that map a student's assessed skill tree directly to live industry requirements.
3. **📊 Institutional Analytics:** Live macro-dashboards for universities to identify systemic skill gaps in their student body.
4. **🎮 Gamification Engine:** Streaks, XP, and leaderboards to drive daily student engagement.
5. **🔒 Enterprise Security:** End-to-end RLS policies on the database level, ensuring student data is mathematically secure.

## 📂 Repository Structure
```
├── frontend/                  # React 19 UI (Vite)
├── insforge_functions/        # Python Serverless Edge Functions
│   └── ai_copilot.py          # AI integration logic
├── insforge_schema.sql        # Core PostgreSQL Schema with RLS Policies
├── AI_COORDINATION.md         # Internal communication log for AI Agents
└── README.md                  # This file
```

## 🛠️ Tech Stack
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![InsForge](https://img.shields.io/badge/InsForge_BaaS-000000?style=for-the-badge&logo=vercel&logoColor=white)

---
<div align="center">
  <i>Developed for Smart India Hackathon (SIH) 2026</i>
</div>
