# AI Coordination Log

## InsForge Backend Integration
- Successfully wired the app to the InsForge backend (`https://6vjqpi3p.us-west.insforge.app`).
- Configured Gemini Edge Functions for AI capabilities and updated to `gemini-3.6-flash`.
- Fixed the Edge Function payload structure (extracted message safely from `payload.payload?.message`).

## Database Wipe and Reseed
- Wiped all dummy questions, assessments, and skill categories from the database.
- Created robust Python scripts (`seed_all_clean.py`) to systematically map and re-insert the user's provided questions from 3 separate JSON files.
- Successfully imported **17 domains** (Python, JavaScript, React, Django, SQL, Machine Learning, Data Analysis, HTML/CSS, Node.js, Git, Docker, Cloud Computing, Cybersecurity, UI/UX Design, Java, C++, Kubernetes) × 3 difficulty levels × 10 questions = **510 questions in total**.
- *Note:* The domain "Go" was listed in the UI skills list but was not present in the provided JSON files.

## Instant Feedback UI (Red/Green)
- Integrated real-time answer locking on the frontend when an option is clicked.
- Implemented a secure PostgreSQL `SECURITY DEFINER` RPC function (`check_single_answer`) to securely validate answers without exposing the `correct_option` to the browser client.
- Added a robust API polyfill in `frontend/src/services/api.js` to correctly route `insforge.rpc` calls.
- Swapped unreliable Tailwind CSS classes for **inline styles** to guarantee the Red/Green border and background colors display flawlessly without CSS conflicts.
- Added visual Checkmark (✅) and Cross (❌) Lucide icons to selected options for better UX.

## Onboarding Flow Fixes
- Rewrote the Onboarding quiz component to mirror the main `TestQuiz.jsx` logic (instant Red/Green feedback and answer locking).
- Fixed a bug in `Onboarding.jsx` where the fuzzy matcher was accidentally selecting arbitrary domains (like Docker for Cybersecurity) because it prioritized skills over explicit career goals.
- Fixed a critical SDK bug where `getAssessments()` was returning all domains, causing the Onboarding flow to always return the alphabetically-first domain (C++) regardless of user choice. The frontend now strictly filters the results by `category_id`.

## Deployment
- All backend edge functions deployed to InsForge.
- All frontend React code built and deployed to InsForge Edge hosting (`https://6vjqpi3p.insforge.site`).
- All code pushed to the `master` branch of the GitHub repository.
