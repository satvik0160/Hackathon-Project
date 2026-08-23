# SkillMaster Pro - AI Coordination (InsForge Edition)

> **Status:** 🚧 MIGRATING TO INSFORGE SERVERLESS ARCHITECTURE
> **Current Phase:** Tearing down legacy Django monolith, preparing InsForge BaaS
> **Tech Stack:** InsForge (Database, Auth, Serverless Functions, Storage, AI Gateway) + React 19 with Vite (Frontend)

---

## 🧠 How we work together (The 3 AIs)
This file is the "Shared Brain" for our 3 Antigravity AI instances. 
Since we are migrating to **InsForge**, the entire architecture has been simplified.

---

## 🏗️ Project Overview (Serverless)
**SkillMaster Pro** — An AI-Powered Academia–Industry Skill Intelligence Platform.
Instead of managing a monolithic Django backend, Celery workers, and Redis locally, we are utilizing **InsForge** as our Backend-as-a-Service (BaaS).

---

## 👥 Division of Labor
*   **Person 1 (Backend / Serverless):** Porting `SkillEngine` and `GamificationEngine` into InsForge Serverless Functions (Python). Configuring InsForge SDK.
*   **Person 2 (Frontend):** Building React UI, connecting directly to InsForge Auth and Database via SDK.
*   **Person 3 (Database):** Designing the PostgreSQL schema natively in InsForge, handling RLS (Row Level Security) policies, and seeding data.

---

## 🚀 InsForge Migration Progress

*   **[2026-08-24] MIGRATION INITIATED**
    *   Deleted local SQLite database (`db.sqlite3`).
    *   Removed GitHub Actions CI/CD pipeline (no longer needed for monolithic testing).
    *   Deleted local Celery worker configurations and Redis integrations.
    *   Preparing to decouple custom Django JWT Auth in favor of native InsForge Auth.
    *   **Created `insforge_schema.sql`**: Native PostgreSQL schema with Auth and RLS policies defined.
    *   **Created `insforge_functions/ai_copilot.py`**: Python serverless Edge functions for AI integration using `insforge` SDK.

---

## 🔑 InsForge Integration Reference
*(The following replaces our legacy REST API endpoints)*

### Authentication & Security
Handled via InsForge Auth SDK. No custom endpoints required for Login, Logout, or Password Reset.

### Database & Storage
Handled via InsForge Database SDK (direct PostgreSQL queries from Frontend via secure RLS policies). Resumes and images uploaded directly to InsForge Storage.

### Serverless Functions (To Be Deployed on InsForge)
*   `submit_assessment` - Triggers `SkillEngine` & `GamificationEngine` logic.
*   `generate_mock_interview` - Connects to InsForge AI Gateway.
*   `tailor_resume` - Connects to InsForge AI Gateway.
