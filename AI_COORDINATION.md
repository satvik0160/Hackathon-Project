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

## Sign-In & Session Persistence Fixes

### Problem
Users reported two related auth bugs:
1. After entering their email and password on the sign-in form, the app sat on the login screen instead of moving them to the dashboard.
2. Every time a user reopened the site, they were forced through the sign-in flow again — the session did not survive a page reload.

### Root Causes
1. **The InsForge SDK stores the access token in memory only.** Reading the SDK source (`node_modules/@insforge/sdk/dist/index.js`, `TokenManager.saveSession`) confirmed `this.accessToken` and `this.user` are kept on the JS object and never written to `localStorage` or cookies. Recovery on reload relies on an `httpOnly` refresh cookie + `/api/auth/refresh`; when that round-trip fails or the cookie is missing, `getCurrentUser()` returns `null` and the user is treated as signed out.
2. **`LoginForm.jsx` showed a success toast but never explicitly navigated.** It trusted the `PublicRoute` wrapper to detect the new `isAuthenticated === true` and redirect. That redirect races with the 3.5s `DevAstraPreloader` and the `opacity: 0` wrapper around the routes, so the user can end up staring at a faded-out login screen.
3. **`App.jsx`'s `handlePreloaderComplete` read `isAuthenticated` from a stale closure.** The preloader takes 3.5s; if the auth state resolved after the closure was created, the redirect decision was made on a snapshot, not the live value.
4. **`getCurrentUser()` errors were swallowed silently** in `AuthContext.initAuth`, so if the refresh cookie path failed, the user was left in `loading: true` indefinitely (or treated as logged out without any retry).
5. **Circular import** between `services/api.js` and `services/auth.service.js` — fragile and a footgun for any future change.

### Fixes Applied
- **New module `frontend/src/services/sessionPersistence.js`** — snapshots `{ accessToken, refreshToken, user }` into `localStorage` on every `SIGNED_IN` / `TOKEN_REFRESHED` / `USER_UPDATED` event from the SDK, and re-hydrates the SDK's `TokenManager` + HTTP client on cold boot. The capture is deferred to a microtask so any `http.setRefreshToken` the SDK performs after the auth event still lands before we read it.
- **New module `frontend/src/services/insforgeClient.js`** — extracted the SDK client into its own module so `auth.service.js` no longer needs to import from `api.js`, breaking the circular import cleanly.
- **`api.js`** — installs `sessionPersistence` immediately on module load and calls `.hydrate()` so the very first `getCurrentUser()` call (inside `AuthContext.initAuth`) sees the cached session without bouncing to `/login`.
- **`auth.service.js`** — now imports the SDK client from `insforgeClient.js`. No functional changes to the service methods, but the import path is now a one-way tree.
- **`AuthContext.jsx`** — calls `sessionPersistence.hydrate()` before `getCurrentUser()`; persists on every `TOKEN_REFRESHED`; clears the cached session on `SIGNED_OUT` and on `hydrateProfile` failure; `logout` always clears the local cache, even if the remote sign-out call failed.
- **`LoginForm.jsx`** — after a successful `login()`, the form now calls `navigate('/dashboard' | '/onboarding', { replace: true })` explicitly based on `profile.onboarding_completed`. The user no longer has to wait for `PublicRoute` or the preloader to react.
- **`App.jsx`** — fixed the stale-closure bug by storing the latest auth state in `authStateRef`. Added a post-preloader effect that watches `loading`/`isAuthenticated` and routes the user in even if the auth state resolved *after* the preloader finished. The preloader no longer blocks the user from reaching their dashboard on a fresh sign-in.

### Why this is safe
- The localStorage snapshot is only a **cache** of the live session. If the cached token is rejected by the server, the SDK's `refreshSession()` / `setSession(null)` path still logs the user out — we only avoid the silent-bounce caused by the missing refresh cookie.
- Tokens are stored under a single namespaced key (`devastra_insforge_session_v1`) and cleared on `logout`. We never log or transmit the token anywhere outside of the SDK's own HTTP layer.
- The `PublicRoute`, `ProtectedRoute`, and `Layout` guards are unchanged — they still work the moment `isAuthenticated` flips to `true`, so other entry points (OAuth callback, deep links) continue to behave correctly.

## OAuth Blank Screen Fix (Post Sign-In)

### Problem
After clicking "Sign in with Google/GitHub" and choosing an account, users saw a blank screen. The main browser tab stayed stuck on the login page while the dashboard loaded inside an invisible popup.

### Root Cause
`auth.service.js → oauthRedirect()` opened the OAuth provider URL in a **popup window** (`window.open(...)`). After the user authenticated, the provider redirected the **popup** to `/auth/callback`. `AuthCallback.jsx` ran inside the popup, navigated to `/dashboard` — but that rendered the full app inside a 500×600 popup. Meanwhile, the **parent tab** (where the user was looking) never received the auth state change and stayed on the login screen.

### Fixes Applied
1. **`auth.service.js`** — switched OAuth from popup-first to **full-page redirect**. The current tab navigates directly to the OAuth provider, so the callback always returns to the same tab. Popup mode was a misguided attempt to avoid iframe sandbox issues, but full-page redirect is simpler and universally supported.
2. **`AuthCallback.jsx`** — rewritten to:
   - Detect if still running inside a popup (safety net for cached old code) — signals the parent window and closes itself.
   - Extract tokens from URL hash fragments (`#access_token=...&refresh_token=...`) that InsForge may set after OAuth code exchange, and call `insforge.auth.setSession()` to establish the session explicitly.
   - Improved retry logic: 5 attempts with 1s spacing (up from 3 × 800ms) for more robust session establishment.
   - Increased fallback timeout from 8s to 12s to avoid premature "Sign in could not be completed" errors.
3. **`api.js`** — the global `SIGNED_OUT` listener no longer shows a misleading "Session expired" toast on intentional logout. Uses a `window.__devastra_intentional_logout` flag set by `AuthContext.logout()`.
4. **`AuthContext.jsx`** — sets `window.__devastra_intentional_logout = true` before calling `authService.logout()` so the global handler skips the error toast.

### Deployment Status
- Code was successfully built (`npm run build`).
- Frontend changes deployed via InsForge CLI to `https://6vjqpi3p.insforge.site`.
- Changes committed and pushed to the `master` branch on GitHub.

## Onboarding Blank Screen Fix (Post-OAuth)

### Problem
Users experienced a completely blank card on the `/onboarding` page immediately after signing in via OAuth (e.g., Google/GitHub). The stepper was visible, but the content area was empty.

### Root Causes
1. **CSS Filter Rendering Bug**: The Framer Motion `pageVariants` used `filter: blur(8px)` alongside `opacity: 0`. On certain Chromium-based browsers, this hardware-accelerated combination caused the component to remain stuck at `opacity: 0`.
2. **Incorrect Animation Keys**: A previous attempt to fix animations mistakenly added `key={step}` to the `<AnimatePresence>` wrapper. This forced Framer Motion to completely destroy and recreate the animation context on every step change, which prevented exit animations from firing and often left the component stuck in an unmounted or invisible state (`opacity: 0`), resulting in a completely blank card.
3. **Stale Session State**: Abandoned previous sessions left `onb_step = 4` in `localStorage` without a selected career goal. Upon OAuth login, the component jumped to step 4, hit a `pending` state, and rendered an empty card if it couldn't resolve properly.

### Fixes Applied
- Removed `filter: blur(8px)` from the animation variants, relying purely on opacity and transform for universally reliable transitions.
- **Removed `key={step}` from `<AnimatePresence>`**: Fixed the critical bug by ensuring `<AnimatePresence>` remains mounted across step transitions, while keeping unique keys (`step-1`, `step-2`, etc.) on each inner `motion.div` so Framer Motion can properly orchestrate enter/exit animations.
- Implemented a reset mechanism in `Onboarding.jsx` that automatically clears stale `localStorage` keys and resets to step 1 if the user resumes a later step without a selected career goal.
- Added a "Loading assessment..." fallback UI for the `pending` assessment status in step 4 to ensure the card is never blank during data fetching.

## Skill Score Dashboard Fix
- Modified `Onboarding.jsx` to calculate a `skill_score` based on the answers given during the onboarding assessment (both real and mock questions) and pass it to the `completeOnboarding` action.
- Updated `Dashboard.jsx` to rename 'Career Readiness' to 'Skill Score'.
- Connected the `targetVal` in the `Dashboard.jsx` graph to fallback to `user.skill_score` if there is no `user_assessments` data.
- Renamed 'readiness score' to 'skill score' in the Career Copilot suggestions.

## Preloader Logo Animation
- Copied `vidoe.mp4` and `logo1.png` to `frontend/public/` folder.
- Updated `DevAstraPreloader.jsx` to replace the Orbital Gyroscope with a video player displaying the provided logo animation (`video.mp4`) on loop, using `logo1.png` as the poster image.

## Dynamic Dashboard Updates
- Updated `Dashboard.jsx` to replace hardcoded strings like 'Full-Stack Architecture' and 'Frontend Engineer' with the user's selected `career_goal` and `skills` from their profile.
