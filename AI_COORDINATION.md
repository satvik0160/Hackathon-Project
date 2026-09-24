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

## AI Career Copilot Fix
- Resolved an issue where the AI Career Copilot returned a generic mock response (`I'm your AI Career Copilot! (Currently running in mock mode...)`).
- Deployed the `ai_copilot` edge function directly to InsForge hosting with the correct Gemini API model name (`gemini-3.6-flash`), resolving `404 Not Found` API rejection errors.
- Fixed a payload mismatch bug in `frontend/src/services/api.js` where the frontend sent `{ query: textToSend }` but the edge function expected `{ message }`. This caused the AI to receive empty prompts and reply with generic introductory greetings. The API service now correctly checks for `payload.message || payload.query`.
- Deployed the updated frontend to the live InsForge hosting (`https://6vjqpi3p.insforge.site/`).

## Profile Auto-Creation & Logout Fixes
- **Logout Race Condition**: Fixed an issue where the user could see a blank screen momentarily during logout by adding an explicit `navigate('/login', { replace: true })` in `AuthContext.jsx`.
- **Profile Auto-Creation Bug**: Removed auto-insertion of the `users` table row in `auth.service.js`'s `getProfile` method. This auto-insertion previously overwrote the `onboarding_completed` flag on page reload.
- **Password Reset Fix**: Replaced the incorrect `insforge.auth.setProfile({ password: newPassword })` method in `confirmNewPassword` with `insforge.auth.resetPassword({ newPassword })`, correctly applying password changes.
- Committed and pushed all fixes to the `master` branch.
- Deployed the updated frontend via InsForge CLI (`https://6vjqpi3p.insforge.site/`).

## Backend Advisor Fixes

### Problem
The InsForge Backend Advisor reported 17-25 issues across Security (High Severity) and Performance (Medium Severity). These included `SECURITY DEFINER` functions vulnerable to search path hijacking, missing foreign key indexes, and Row Level Security (RLS) policies that evaluated `auth.uid()` (and therefore `current_setting()`) on a per-row basis.

### Fixes Applied
1. **Secured Functions**: Modified `rpc_submit_assessment.sql` and `rpc_check_answer.sql` to include `SET search_path = ''` in their function definitions. Added the same fix to `get_email_by_username` directly in the database.
2. **Performance Indexes**: Added `CREATE INDEX` statements to `insforge_schema.sql` for all missing foreign keys (`user_assessments.user_id`, `assessments.category_id`, etc.) to prevent full table scans.
3. **Optimized RLS Policies**: Updated the policies in `insforge_schema.sql` for `users` and `user_assessments` to wrap `auth.uid()` in a subquery `(select auth.uid())`, caching the lookup and dramatically improving query speed on large tables.
4. **Deployment**: Created a new database migration (`20260829234421_fix-backend-advisor-issues.sql`) using the InsForge CLI and applied it directly to the live backend using `npx @insforge/cli db migrations up --all`.

Note: Permissive read policies (e.g., public read access to `jobs` and `questions`) were left as-is, assuming public browsing is intended for the platform.

## Premium Glass UI & High-End Animations
- **Executive Dark Mode & Glassmorphism**: Completely overhauled `index.css` to implement a deep obsidian/charcoal theme. Replaced standard cards with heavy `backdrop-blur-32px`, `saturate-120%`, and translucent linear gradients with crisp inner highlights to create a premium, tactile glass effect.
- **Glass Hamburger Menu & Sidebar**: Converted the mobile hamburger menu and sidebar into deeply blurred glass components. Updated the active nav item colors from indigo to the branded amber/gold.
- **Auditory Feedback**: Integrated a zero-dependency Web Audio API synthesizer in `App.jsx` to play a crisp, high-frequency "glass tap" (triangle wave with fast exponential decay) whenever a user clicks a button, card, link, or input, enhancing the premium tactile feel.
- **Animated Layout Ambience**: Transformed `Layout.jsx` into a highly dynamic container featuring a moving ambient mesh gradient, deep background floating orbs (amber and indigo), and a large contextual spotlight that follows the user's cursor.
- **Cinematic Page Transitions**: Wrapped the React Router `<Outlet />` in `Layout.jsx` with Framer Motion's `<AnimatePresence mode="wait">` to create smooth, native-app-like page transitions (using blur and scale effects).
- **Intense Auth Preloader & Particles**: 
  - Slowed the `DevAstraPreloader` duration from 3.5s to 8.0s and removed the "Skip" button to immerse the user in the background video and telemetry logs.
  - Upgraded `ParticleCanvas.jsx` by tripling the particle count, drastically increasing velocity, and adding aggressive mouse interaction (connecting bright gold lines to particles within a 250px radius and gently repelling them).
  - Deployed these intense particles globally across the Auth and Layout backgrounds.

## Assessment Submission & Feedback Fixes
- **Root Cause**: A previous security update added `SET search_path = ''` to `check_single_answer` and `submit_assessment_secure` RPC functions, breaking their ability to query the `questions` and `user_assessments` tables, which live in the `public` schema. This caused the onboarding mock UI to freeze without colors and assessments to fail submission.
- **Fixes Applied**: 
  - Updated the RPC functions to use `SET search_path = public, ''` to restore access to the database tables while maintaining security.
  - Fixed a missing trailing comma syntax error in `jsonb_build_object` in `rpc_submit_assessment.sql` and ensured `GRANT EXECUTE` permissions were properly applied.
  - Updated `Onboarding.jsx` to correctly compute and render immediate Red/Green visual feedback for locally-generated mock questions.
  - Re-deployed the corrected RPCs using the InsForge CLI.

## Preloader Restart Fix
- **Problem**: The preloader loading page (DevAstraPreloader) would sometimes restart from 0% before reaching 100% or get stuck.
- **Root Cause**: The `useEffect` that handled the progress animation relied on a local `startTime` variable and depended on `completePreloader`. When `App.jsx` re-rendered, `completePreloader` changed, causing the effect to re-run, reset `startTime` to null, and restart the animation.
- **Fix**: Utilized a `useRef` for `startTimeRef` to persist the start time across effect re-renders. Added a `completedRef` to prevent multiple triggerings of the completion timeout.
- **Deployment**: Successfully pushed the preloader restart fix to InsForge Edge hosting using `insforge CLI`.

## Session Persistence & Onboarding Redirect Fix

### Problem
Users who had completed onboarding were being redirected back to the onboarding questionnaire page every time they reopened the website, instead of going directly to their dashboard. The site was not remembering the device/session across page reloads.

### Root Causes
1. **Double-nested `setProfile` call**: `auth.service.js → updateProfile()` called `insforge.auth.setProfile({ data: metadataFields })`. The SDK's `setProfile(obj)` internally sends `{ profile: obj }` to the API, so the actual payload became `{ profile: { data: { onboarding_completed: true, ... } } }`. This stored `onboarding_completed` under `user.profile.data.onboarding_completed` instead of `user.profile.onboarding_completed`. On reload, `getProfile()` read `authData.user.profile` which returned `{ data: { onboarding_completed: true } }`, and the code checked `user.onboarding_completed` at the top level — which was `undefined` because it was nested one level deeper.
2. **SDK's `setUser()` doesn't fire auth events**: After `completeOnboarding` called `setProfile`, the SDK's `tokenManager.setUser()` silently updated the in-memory user but did NOT fire `notifyAuthStateChange`. This meant the `sessionPersistence` listener (which captures the session to `localStorage` on `SIGNED_IN`/`TOKEN_REFRESHED` events) never ran, so the localStorage snapshot retained the **stale** user object without `onboarding_completed`.
3. **Broken early hydration in `installSessionPersistence`**: The `installSessionPersistence()` function called the module-level `hydrate()` which only ran `safeRead()` (reading localStorage) without actually pushing the snapshot into the SDK's `tokenManager`. This meant the very first SDK rehydration during module load was silently a no-op.

### Fixes Applied
1. **`auth.service.js` — `updateProfile()`**: Changed `insforge.auth.setProfile({ data: metadataFields })` → `insforge.auth.setProfile(metadataFields)` to store profile fields directly under `user.profile` without double-nesting.
2. **`auth.service.js` — `getProfile()`**: Added flattening logic that detects and spreads any nested `rawMeta.data` object to the top level, ensuring backwards compatibility with profiles that were saved with the old double-nested format.
3. **`AuthContext.jsx` — `updateProfile()` and `completeOnboarding()`**: Added explicit `sessionPersistence.persist()` calls after every profile update to manually capture the updated in-memory user to localStorage, compensating for the SDK's `setUser()` not firing events.
4. **`sessionPersistence.js` — `installSessionPersistence()`**: Replaced the no-op `hydrate()` call with `safeRead()` + `rehydrate(insforge, snapshot)` so the SDK's token manager is properly seeded on module load.

### Deployment
- Frontend built successfully and deployed to InsForge Edge hosting (`https://6vjqpi3p.insforge.site`).
- Changes committed and pushed to `master` branch on GitHub.


## Dhruv AI Agent Logo Standardization
- **Problem**: The AI Agent logo was requested to be a "Star", but various pages and layouts in the dashboard were still using `Sparkles`, `Bot`, or `Wand2` icons.
- **Fix**: Replaced all remaining instances of the AI/App logo with a filled `Star` icon (`<Star fill="currentColor" />`). 
- **Files Affected**:
  - `Header.jsx` (Top-left App logo replaced with Star)
  - `Sidebar.jsx` (AI Career Guidance nav link icon replaced with Star)
  - `AICareerGuidance.jsx` (Chat Header and AI Avatars replaced with Star)
  - `AIResume.jsx` (Header and Generate buttons replaced with Star)
  - `MockInterview.jsx` (Interviewer Avatars replaced with Star)

## Dhruv Dynamic Thinking Indicator
- **Problem**: The AI Copilot ("Dhruv") showed a static "Thinking..." text and a spinning loader when streaming a response.
- **Fix**: Replaced the static text and loader in `CareerCopilot.jsx` with a dynamic bouncing-dots animation (`typing-indicator`) and explicit "Dhruv is thinking" text. 

## Dhruv Career Copilot Send Button Visibility Fix
- **Problem**: The Send button in the `CareerCopilot.jsx` chat input was not visible or cleanly positioned, preventing users from seeing it.
- **Fix**: Rebuilt the input layout to match `AICareerGuidance.jsx`, using an absolute-positioned rounded Send button inside the right edge of a full-width input field. This guarantees the button is prominently visible and correctly aligned inside the chat input box.

## Custom Logos Implementation
- **Problem**: Default star icons were being used for the app logo and the Dhruv AI agent.
- **Fix**: Replaced the DevAstra header logo with `devlogo.jpg` and the Dhruv Career Copilot triggers/headers with `dhruvlogo.webp` found in the project root. Copied both files into `frontend/public/` so they serve globally.

## Dhruv Logo Cover Fix
- **Problem**: The Dhruv logo (`dhruvlogo.webp`) did not completely fill the circular bounds of the chat trigger button and chat header avatar, leaving padding or transparent gaps.
- **Fix**: Removed padding (`p-1`) from the wrapper, added `overflow-hidden rounded-full` to the wrapper, and changed the image rendering mode from `object-contain` to `object-cover` so it zooms to perfectly fill the entire circle.

## Background Animation Softening
- **Problem**: The background animations (animated particles and motion blobs) were a little too intense/visible, distracting from the main content.
- **Fix**: Lowered the fillStyle and strokeStyle alpha values of the animated particles in `ParticleCanvas.jsx` to less than half their original strength, and reduced the opacity array stops of the animated motion blobs in `AuthContainer.jsx`. This successfully keeps the great animations but makes them softer and less obtrusive.

## Sidebar Navigation Enhancements
- **Problem**: Navigation headings ("Main", "Tools") were visually indistinct from regular links, and the user requested the ability to open/close (collapse) the sidebar on desktop.
- **Fix**: 
  - Restyled the `Main` and `Tools` headings in `Sidebar.jsx` to feature custom tinted background badges (gold for Main, indigo for Tools) along with horizontal gradient divider lines to create clear visual hierarchy.
  - Implemented a desktop collapsible feature using a local `collapsed` state.
  - Added an interactive `ChevronLeft` / `ChevronRight` toggle button floating on the right border of the sidebar.
  - Configured dynamic width (`w-64` expanded, `w-20` collapsed), centering logic for icons, and visually condensed dividers when collapsed.

## Hamburger Menu Integration
- **Problem**: The user wanted the standard "three lines" (Hamburger menu) in the header to open and close the sidebar on desktop, instead of relying on a toggle on the sidebar's edge itself.
- **Fix**: Removed the old edge toggle from `Sidebar.jsx`, hoisted the desktop collapsible state to `Layout.jsx`, and added a new desktop-visible `<Menu />` button directly into `Header.jsx`. This button now smoothly collapses and expands the navigation bar across the whole app.

## Fix Sidebar Collapse Desktop Glitch
- **Problem**: When closing the navigation bar on desktop using the new hamburger menu, it was only shrinking to a width of `w-20` (leaving icons visible) instead of completely disappearing. Additionally, shrinking the container without `overflow-hidden` caused text like "Navigation" to spill over and overwrite/overlap other elements.
- **Fix**: Re-coded `Sidebar.jsx` container logic to apply `md:w-0 md:opacity-0 md:-ml-px overflow-hidden` when the desktop `collapsed` state is true. It now fully disappears smoothly into the left edge of the screen, and the main content seamlessly stretches to fill the space. Added `whitespace-nowrap` constraints to the sidebar titles to ensure they don't break onto multiple lines while the container is animating to a width of 0.

## Light Mode Implementation
- **Problem**: The user wanted to enable Light Mode in the settings, but the application was hardcoded with dark mode Tailwind classes (`bg-neutral-950`, `text-white`, etc.), rendering the Settings theme toggle visually useless.
- **Fix**: Rather than refactoring hundreds of hardcoded dark classes across the whole app, implemented a global CSS structural `invert()` filter for `html[data-theme='light']` in `index.css`. This elegant approach automatically calculates a perfectly color-accurate light mode based on the dark mode design. Images, videos, and canvas items were double-inverted to retain their correct photographic hues.

## Enhanced Professional Light Mode
- **Problem**: The CSS `invert()` strategy for Light Mode washed out colors and produced inverted (white) box shadows which resulted in an amateurish appearance on light backgrounds.
- **Fix**: Removed the `invert()` filter approach entirely. Wrote an extensive CSS override system (`light-mode.css`) targeting specific Tailwind utility classes like `.bg-neutral-950`, `.text-white`, `.border-white/10`, and mapped them explicitly to standard Tailwind Slate light colors (`#f8fafc`, `#e2e8f0`, `#1e293b`). Ensured shadows map gracefully to standard black-alpha shadows. It now looks highly polished, corporate, and interactive, while keeping the native dark mode completely untouched.
- **Fix (Light Mode Text Visibility & Enterprise Look)**: 
  - Addressed an issue where Light Mode resulted in invisible white text and low-contrast UI elements.
  - Revamped `light-mode.css` into a true "Clean Minimalist Enterprise AI" theme. Backgrounds are pure white (`#ffffff`) or sleek crisp grays (`#f8fafc`).
  - Implemented dynamic, robust attribute-based overrides to catch *all* instances of `.text-white` and `.text-neutral-200` to convert them to dark Slate (`#0f172a`).
  - Added specific exclusions for colored UI components (like `.bg-primary`, `.bg-green-600`, etc.) so text remains white when it needs to contrast on dark solid-colored buttons/cards.
  - Adjusted opacity-based text classes (`.text-amber-500/90` etc.) to guarantee visibility on light backgrounds.
- **Feature (Functional Activity Heatmap)**:
  - Replaced the random dummy data in the Dashboard's Activity Heatmap with actual functional logic.
  - Implemented `timeTracker.js` utility that tracks user session time using `localStorage`.
  - Added a global `useEffect` in `Layout.jsx` that continuously logs active session time (updating every 10 seconds).
  - The Heatmap now dynamically generates 40 weeks (280 days) ending on the current day, displays accurate Month labels (`Jan`, `Feb`, etc.), and dynamically turns squares green (Emerald) based on time spent. 
  - Specifically, >10 minutes triggers a lighter green, and >=20 minutes triggers a solid active green (`bg-emerald-400`). Added exact dates and "Active for X mins" tooltips to each square.

## Scoring and Leveling System Updates
- Replaced the old scoring model with a dynamic points system based on assessment difficulty: Beginner (+15 points), Intermediate (+25 points), and Advanced (+35 points).
- Implemented an automatic leveling formula where every 5 points converts to +1% `skill_score_percent`. Once this reaches 100%, the user's `skill_level` increments by 1, and the percent resets (carrying over remainder).
- Updated the backend `rpc_submit_assessment.sql` to atomically calculate and persist `total_points`, `skill_score_percent`, and `skill_level` directly to the `public.users` table upon submission.
- Updated the frontend `dashboard.service.js` to read from the new `skill_score_percent` and `skill_level` fields instead of computing an average percentage.
- Created a migration (`20260912000000_scoring_and_fixes.sql`) that adds these new columns to the `users` table and introduces an `auth.users` trigger to guarantee user rows exist, preventing foreign key constraint violations on `user_assessments`.
- Fixed the previous `search_path = ''` RPC bug by explicitly qualifying `public.questions`, `public.assessments`, and `public.user_assessments` in both `rpc_submit_assessment.sql` and `rpc_check_answer.sql`.

### Scoring Update (Minimum Threshold)
- Added an 80% correctness threshold to the scoring logic in `rpc_submit_assessment.sql`. Points (and thereby level progress) are now **only** awarded if the user scores 80% or higher on the assessment.

## Master Improvement Plan — Full Implementation (14 Sep 2026)

Implemented all changes from the `DevAstra_Master_Improvement_Plan.pdf` across 7 phases. All changes are **logic-only** — zero UI/visual modifications. Build verified with 0 errors.

### Phase 0 — Repo Cleanup
- Removed `pg` (raw PostgreSQL driver) from `frontend/package.json` — it has no place in a browser bundle.
- Added `frontend/.env.local` to `.gitignore` to ensure credentials are never committed.
- Cleaned stray `console.log` statements that printed full profile payloads in `auth.service.js` (line 160) and `AuthContext.jsx` (lines 129, 131).

### Phase 1 — Critical Bug Fixes
- **Institution Dashboard fallback**: Fixed `InstitutionDashboard.jsx` line 55 — `res.data || mockData` was broken because an empty object `{}` is truthy. Changed to `Object.keys(res.data).length > 0 ? res.data : mockData`.
- **DailyPlanner crash guard**: Fixed `DailyPlanner.jsx` — the stub `learningService.getDailyPlanner()` returns `{ data: [] }`. The component expected `.targets` and `.completed_count` on an object, not an array. Added response normalization in `fetchPlanner` and null guards in `handleComplete`.
- **Post Job wired to real DB**: Fixed `IndustryDashboard.jsx` — uncommented and rewired the "Post Job" handler to call `insforge.from('jobs').insert(...)` with proper payload mapping to the `jobs` table schema (company_name, title, description, job_type, location, is_remote, required_skills, salary_range).
- **Job application payload**: Fixed `Jobs.jsx` — changed `jobService.apply({ job: jobId })` to `jobService.apply([{ job_id: jobId, status: 'Applied', cover_letter: '...' }])` to match the `job_applications` table schema and InsForge array insert convention.

### Phase 2 — Role System & Security
- **Role at signup**: Updated `auth.service.js → register()` to accept and pass a `role` field (defaulting to `'STUDENT'`) in the signup metadata so role selection can be integrated into registration.
- **Role lockdown**: Removed `'role'` from the writable `userColumns` array in `auth.service.js → updateProfile()` (line 151). This prevents privilege escalation where a user could self-promote to `INDUSTRY` or `INSTITUTION_ADMIN` via the generic profile update endpoint.
- **RoleRoute guard**: Created a new `RoleRoute` component in `Layout.jsx` that checks `user.role` against an `allowedRoles` array and redirects unauthorized users to `/dashboard`.
- **Admin route protection**: Wrapped `/admin/institution` with `<RoleRoute allowedRoles={['INSTITUTION_ADMIN']}>` and `/admin/industry` with `<RoleRoute allowedRoles={['INDUSTRY']}>` in `App.jsx`.

### Phase 3 — Feature Completion
- **Real Institution Analytics**: Replaced the stub `analyticsService.getInstitutionAnalytics()` in `api.js` with real aggregate queries over `users`, `user_assessments`, and `skill_categories` tables, computing `totalStudents`, `averageScore`, `placementReadiness`, skill gaps, career distributions, and curriculum alignment — with sensible mock fallbacks when the DB is empty.
- **Real Student Analytics**: Rewired `Analytics.jsx` to fetch actual data from `assessmentService.getHistory()` and `jobService.getApplications()` and build chart data (readiness trend, skill growth, learning activity, application funnel) from real records — falling back to demo data gracefully.
- **Industry applicants view**: Replaced the empty "Candidate Matching — Coming Soon" placeholder in `IndustryDashboard.jsx`'s candidates tab with a real query against `job_applications` (with joins to `jobs` and `users`), displaying application cards with status, shortlist actions, and profile viewing.
- **Personalized Roadmap**: Replaced the hardcoded 3-node fallback in `Roadmap.jsx` with career-goal-based roadmap templates (Full Stack Dev, Data Scientist, DevOps, AI/ML Engineer) matched to the user's `career_goal`, with a skill-based fallback for unmatched goals.
- **Un-stubbed learningService**: Replaced the empty stubs with real queries to `learning_resources`, `learning_paths`, and `daily_planner_targets` tables, gracefully falling back to 6 curated resources (React, Python, System Design, Node.js, AWS, DSA) when the tables don't exist yet.

### Phase 4 — Security Hardening
- Confirmed `.env.local` is gitignored (added `frontend/.env.local`).
- Removed `pg` from frontend bundle (was `"pg": "^8.23.0"` in dependencies).
- Locked `role` from being writable via `updateProfile`.

### Phase 5 — AI Reliability & Demo Safety
- **Live vs fallback indicator**: Added `__source: 'live'` to all successful AI responses and `__source: 'fallback'` to all error/fallback paths in `mockInterview`, `resumeTailor`, and `careerCopilot` within `api.js`. This allows the UI or devtools to distinguish real Gemini responses from hardcoded fallbacks.
- **Resume fallback key fix**: Changed the fallback key in `resumeTailor` from `tailored_resume` to `resume_markdown` so the `AIResume.jsx` page can actually parse and display the fallback content (it reads `res.data?.resume_markdown`).

### Phase 6 — Performance & Accessibility
- **Preloader 8s → 2s**: Changed the `DevAstraPreloader.jsx` duration from `8000` to `2000` milliseconds, cutting the forced wait by 75%.
- **Skip button restored**: Re-added a "Skip" button to the preloader (top-right corner) that calls `completePreloader()` immediately. It was previously removed during the Premium Glass UI overhaul.
- **Click-sound opt-in**: Changed the global glass tap sound effect in `App.jsx` from always-on to opt-in. The sound now only plays when `localStorage.getItem('devastra_sound_enabled') === 'true'`. Default is OFF.
- **prefers-reduced-motion**: Added a `useEffect` in `App.jsx` that listens for the `prefers-reduced-motion: reduce` media query and toggles a `reduce-motion` CSS class on `<html>`, allowing CSS animations to be disabled for users who need it.

### Files Modified (14 files)
1. `.gitignore` — added `frontend/.env.local`
2. `frontend/package.json` — removed `pg` dependency
3. `frontend/src/services/api.js` — analyticsService, learningService, AI __source, resume fix
4. `frontend/src/services/auth.service.js` — role registration, role lockdown, console.log cleanup
5. `frontend/src/contexts/AuthContext.jsx` — console.log cleanup
6. `frontend/src/components/layout/Layout.jsx` — RoleRoute guard component
7. `frontend/src/App.jsx` — RoleRoute wiring, sound opt-in, reduced-motion
8. `frontend/src/pages/admin/InstitutionDashboard.jsx` — Object.keys fallback fix
9. `frontend/src/pages/admin/IndustryDashboard.jsx` — real Post Job, applicants view
10. `frontend/src/pages/learning/DailyPlanner.jsx` — crash guard normalization
11. `frontend/src/pages/learning/Roadmap.jsx` — personalized career roadmaps
12. `frontend/src/pages/dashboard/Analytics.jsx` — real data wiring
13. `frontend/src/pages/jobs/Jobs.jsx` — correct application payload
14. `frontend/src/components/common/DevAstraPreloader.jsx` — 2s duration, skip button

## Public Landing Page Integration
- Created a new public landing page (`Landing.jsx`) with associated styles (`landing.css`).
- Updated `App.jsx` to route `/` to the new landing page, acting as the primary entry point for unauthenticated users.
- Adjusted the catch-all redirect in `App.jsx` to point to `/` instead of forcing a redirect to `/login`.
- Added automated verification scripts (`verify-landing.js`, `verify-landing-theme.js`, and `verify-flow.js`) to test the frontend flow.
- Removed Smart India Hackathon (SIH) 2026 references from the landing page to generalize the platform.
- Added a "How It Works" workflow section and Audience tabs (Students, Industry, Institutions) to the landing page.

## Interactive Landing Page Imagery
- **Problem**: The landing page relied on an inline SVG placeholder in the hero and plain gray Lucide icon boxes in the "How It Works" and Audience tabs sections — no real imagery and no interactive visuals.
- **Assets**: Added 7 curated, self-hosted photos to `frontend/public/images/` (`hero-skills.jpg`, `step-assess.jpg`, `step-ai.jpg`, `step-match.jpg`, `tab-students.jpg`, `tab-industry.jpg`, `tab-institutions.jpg`), each matched to the message of its section. Self-hosting removes any external hotlink/broken-image risk.
- **Interactive hero**: Replaced the placeholder hero SVG in `Landing.jsx` with a real photo composition that tilts in 3D following the pointer (framer-motion `useMotionValue` + `useSpring`, ±7°, disabled under `prefers-reduced-motion`), with two floating glass product cards ("92% match score" and "18-day streak") drifting in a slow loop and parallaxing above the photo via `translateZ(46px)`. The photo itself zooms 4.5% on hover beneath a legibility scrim that preserves the "ASSESSED SKILLS → LIVE ROLES" caption.
- **How It Works**: Swapped the flat icon circles for photo step cards (`.landing-step-card` in `landing.css`) with hover lift, image zoom (scale 1.07), and a gold icon badge bridging the photo and the card body.
- **Audience tabs**: Replaced the gray placeholder icon boxes with real photos (`.landing-tab-photo`) with hover zoom and a brand-tinted gold/indigo sheen overlay so the photos sit naturally in the dark UI.
- **Accessibility & safety**: All motion (tilt, drift, zoom) is disabled under `prefers-reduced-motion`; below-fold images use `loading="lazy"`; mobile media queries tuck the floating cards inside the photo frame so the container never overflows horizontally; the verify script's "no broken images" and "no horizontal overflow" checks still pass.
- **Verification**: `npm run build` passed; `verify-landing.js` passed 61/62 checks (the single failure — `/dashboard` not redirecting to `/login` when signed out — is a pre-existing auth-guard issue unrelated to the imagery).
- **Deployment**: Deployed via `npx @insforge/cli deployments deploy frontend` (deployment `f75faf88-32fe-4ce9-bc39-ff5337dd2a55`), live at `https://6vjqpi3p.insforge.site` with all 7 images confirmed returning HTTP 200.
- **Deployment**: Deployed the redesigned Command Center Dashboard UI via `npx @insforge/cli deployments deploy frontend`. (Branch: `feat/command-center-ui`)

## Post-Command Center Overhaul & UX Polish
- **Result Page Layout**: Rebuilt the `TestQuiz.jsx` results page to use a full-width grid layout (`max-w-7xl`). Replaced the limited-width constraint with a side-by-side design featuring a new "What's Next?" recommendations panel (Roadmap, Code Arcade, More Tests) for better user direction after an assessment.
- **Leaderboard Navigation Icon**: Changed the icon for "Leaderboard" in the sidebar from a duplicate `Trophy` to a `Crown` to distinguish it from the Achievements tab.
- **Arcade Card Redesign Revert**: Reverted the Code Arcade games cards from a clunky, misaligned dark-mode styling back to the clean, interactive light-theme glass-morphism style with bright color gradients and smooth tilt physics.
- **Arcade XP Backend Synchronization**: Code Arcade scores were previously only stored in `localStorage`. Added a new RPC function `add_arcade_xp` to the backend and integrated it into the arcade games (`CSSBattle.jsx`, `AlgorithmSpeedrun.jsx`, `SQLMurderMystery.jsx`) to sync the earned XP to the user's `total_points` on the server.
- **Leaderboard 0 XP Visibility**: Fixed an issue where new users with 0 XP were not visible on the leaderboard. Changed the `get_leaderboard` RPC to execute a `LEFT JOIN` on `public.users` from `auth.users`, ensuring every registered user appears on the global rank.
- **Heatmap Timezone Fix**: Fixed a bug where the Activity Heatmap highlighted incorrect days. Changed the time tracking logic in `timeTracker.js` from using UTC date strings (`toISOString()`) to local timezone date strings (`toLocaleDateString` logic) to align with how `ActivityHeatmapCard.jsx` reads local dates.
- **DevAstra Favicon**: Replaced the default Vite globe logo in `index.html` with the official DevAstra logo (`/logo1.png`).

## Interactive Animated Background (Eye-Catching Motion Layer)
- **Problem**: The app background was effectively static. The dashboard rendered `ParticleCanvas` at `opacity-[0.05]` (invisible) on top of flat pastel blobs, a non-animated SVG ribbon, a drifting planet and 5 pulsing dots — no cursor interaction and almost no motion. The auth background had the same particle canvas with no interactivity.
- **Fix**: Added a new self-contained background component `frontend/src/components/common/InteractiveAuroraBackground.jsx` with `app` (light pastel) and `auth` (deep cosmic) variants, used by `Layout.jsx` and `AuthContainer.jsx`.
- **Interactions**: cursor vortex (particles sweep into orbit around the pointer, with an inner repel zone so the ring never collapses), pointer-to-particle threads, a rotating reticle, a fading motion trail, click/tap shockwaves that shove particles outward, a parallax field of 4 aurora blobs (several counter-moving), a slowly rotating conic aurora sweep, animated ribbon `stroke-dashoffset` flow, 3 travelling light streaks, a pulsing ringed planet that parallaxes, a faint base grid plus a second grid revealed through a radial mask that tracks the cursor, and a spring-damped halo trailing the pointer.
- **Performance/accessibility**: particle count scales with viewport (40-180), DPR capped at 2, the rAF loop pauses when the tab is hidden, the backdrop gradient is cached per resize, and `prefers-reduced-motion` renders a single static frame with no loop or pointer listeners (CSS animations also disabled in `reference-theme.css`).
- **Files**: new `InteractiveAuroraBackground.jsx`; `Layout.jsx` and `AuthContainer.jsx` (background layer only — no content, nav, or page logic touched); `reference-theme.css` (new section `13b` + extended reduced-motion rules).
- **Deployment**: `npm run build` passed; deployed to InsForge Edge hosting (deployment `cc88739c-1512-4e23-bb49-c94241571279`, live at `https://6vjqpi3p.insforge.site`).
