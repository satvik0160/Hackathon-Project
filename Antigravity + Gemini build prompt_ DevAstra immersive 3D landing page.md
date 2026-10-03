# Antigravity + Gemini build prompt: DevAstra immersive 3D landing page

## Your role and task

You are a senior creative developer and design engineer working **inside the existing DevAstra repository**. Implement the redesigned public landing page in the real app, run it, inspect it in a browser, and iterate until the acceptance checks below pass. Do not return only a concept, wireframe, code sample, or another prompt.

The goal is a polished, desktop-first, scroll-driven DevAstra experience that uses the **interaction principles** of Trionn—meaningful 3D objects, cause-and-effect pointer interactions, deliberate scroll choreography, animated typography, carefully timed transitions, and restrained audio—while clearly showcasing **DevAstra’s own product, identity, and content**.

**Do not copy Trionn’s brand, logo, exact page composition, imagery, or signature symbol.** Translate its methods into original DevAstra visuals that explain verified skills, career growth, job matching, and institutional insight.

## Important direction: no spiral or split-screen layout

The central-axis spiral-card concept is **explicitly rejected**. Do not build a spiral, helix, orbiting card carousel, central vertical axis with content cards, or any equivalent variation.

Also do not build:

- a conventional page with all text in one column and a separate 3D canvas in a right-hand panel;
- a static full-screen 3D background with ordinary floating text boxes placed over it;
- unrelated 3D objects, random graphs, decorative planets, or generic particle wallpaper;
- a standard flat landing page where only the background or occasional image has a 3D effect;
- card stacks/carousels that detach from the content story.

Instead, make the page a sequence of **distinct, full-width editorial chapters**. Each major chapter must have a purposeful interactive 3D or depth-based visual that is the chapter’s main illustration and visibly responds to scroll or input. Place the chapter’s real semantic headline, copy, and controls in the same art-directed composition as that visual—not in a separate “text side” versus “3D side” template. Keep text as accessible/selectable DOM; use true 3D/WebGL for the explanatory visual, not rasterized copy.

Use one continuous vertical page and normal desktop scrolling. A coherent skill-signal visual may evolve between chapters, but do not turn it into a persistent decorative wallpaper; every chapter’s scene must change in a way that communicates that chapter’s DevAstra content.

## First actions: inspect, preserve, and plan

1. Inspect the repository, package versions, route setup, landing page, theme system, assets, and current interactions before editing.
2. Read `LANDING_PAGE_INVENTORY.md` as the source of truth for all product copy, routes, assets, sample metrics, and capabilities. Preserve the real content and current behavior. Do not invent features, partner logos, testimonials, pricing, outcome claims, or user statistics.
3. Keep the existing stack and conventions where possible: React 19 + Vite + Tailwind, existing Three.js, Framer Motion, Plus Jakarta Sans, JetBrains Mono, and the DevAstra gold/indigo/teal palette. If GSAP/ScrollTrigger or Lenis is not installed, add only what is necessary for the scroll-driven choreography; do not introduce two competing animation/scroll systems.
4. Do not modify backend, auth, API, database, or route semantics. Preserve `/register`, `/login`, and real section anchors.
5. State a short implementation plan, then build. Do not stop after producing an asset board or preview.

## Original DevAstra visual direction

Create a premium **skill-intelligence observatory** aesthetic: deep ink/charcoal foundations, crisp neutral text, DevAstra gold (`#D9AF67` to `#C9A050`) for primary actions and evidence highlights, indigo/violet (`#6366F1`, `#8B5CF6`) for intelligence/AI, and restrained teal (`#14B8A6`) for verified progress. Retain Plus Jakarta Sans for editorial copy and JetBrains Mono for small data labels.

Use large, high-contrast editorial type, deliberate whitespace, restrained texture, and clear content hierarchy. A faint cosmic/technical atmosphere is acceptable only when it supports the skill-constellation concept. Do **not** add a generic galaxy/nebula background to signal “space.” The foreground skill scenes and content must remain the visual focus. Never use blur/glass to the point that copy loses contrast.

The site should feel crafted and alive, not like a generic AI dashboard. Use the brand’s actual logo/wordmark assets where suitable; do not fabricate a new official logo.

## DevAstra chapter plan and exact interaction direction

Preserve the supplied content and routes. Treat these as distinct scene compositions within one page—not as 13 spiral cards.

### Chapter 1 — Hero / “Master your skills. Shape your career.”

Preserve the exact eyebrow, headline, both hero paragraphs, tech chips, and actions from the inventory:

- `Get Started` → `/register`
- `See how it works` → `#how-it-works`

Build an original, foreground **Skill Signal** object in real Three.js: a compact, three-part, faceted constellation instrument representing (1) assessed evidence, (2) guided growth, and (3) role matching. Use labeled React/TypeScript/Node.js/SQL skill nodes connected by deliberate lines; every node/branch must be explainable as a real product idea. This is not a random graph. Animate the object with slow, restrained idle motion and soft pointer-follow tilt (interpolated; never snap to the cursor).

On pointer hover over a real object surface, brighten that surface and reveal a short meaningful label (e.g. “ASSESSED”, “GROWTH PATH”, “ROLE MATCH”). On a deliberate press-and-hold of the visible scene object for about 0.5 seconds, separate its three panels a small, controlled distance to reveal the labels; release eases them back together. This interaction must not block page scrolling or make the CTA difficult to use. Keep the hero headline and actions as normal DOM in the same immersive composition; **do not** place them in detached translucent boxes over a wallpaper canvas.

Show the existing hero match/streak example only as **illustrative UI**, not a factual product claim. Avoid creating a separate fake “92% proof” claim.

### Chapter 2 — Problem / “Graduates are not underqualified. They are unverified.”

Preserve both source paragraphs. Use a restrained 3D comparison in the chapter’s visual: one track represents curriculum content changing slowly; the other represents shifting industry skill requirements. Their mismatch briefly opens a visible, labeled “verification gap.” On scroll, align the two tracks through assessed evidence. The geometry and labels must explain the exact problem—no invented numbers, abstract floating cubes, or illegible tiny graphs.

Use a pinned or staged scroll moment only if it improves this explanation. Keep native page scroll working and do not force-snap or hijack the wheel.

### Chapter 3 — How it works / Assess → Grow → Match

Preserve all three supplied step titles and descriptions. Build one connected, legible scene with **three explicit stations** arranged along a clear path, not a spiral:

1. **Assess & Baseline:** skill nodes are measured/illuminated by an assessment pulse.
2. **AI-Guided Growth:** a visible route branches toward the learner’s assessed gaps; identify Dhruv as the copilot.
3. **Deterministic Matching:** evidence lines connect the verified skill profile to suitable role markers.

As this chapter scrolls, animate one signal through the three stations in order. Use a single normalized section progress value and explicit progress ranges for each stage. Keep the copy visible as real text, with the corresponding station highlighted; do not crossfade only the words while leaving the scene static.

### Chapter 4 — Four engines / “Four engines, one verifiable skill signal.”

Preserve the exact section heading, subtitle, and all four engine descriptions, capabilities, and supplied example data from the inventory. Create a coherent scroll-driven sequence showing the same skill signal feeding each engine, with distinct, purposeful visual behavior per engine:

1. **AI Career Copilot — “Meet Dhruv — your copilot for interviews and resumes.”** Show the supplied React-list interview exchange and Structure/Depth/Clarity values in crisp, selectable HTML UI. Mark all scores/examples as illustrative. Animate a real response/reveal; do not bake text into an image.
2. **Deterministic Job Matching — “Your skill tree, mapped to live industry roles.”** Draw labeled evidence paths from React, TypeScript, Node.js, SQL, and System Design to the supplied example roles and scores. Label the values as illustrative. The visual should make “assessed skill → explainable match” immediately obvious.
3. **Gamification Engine — “Streaks, XP and levels that keep you showing up.”** Animate the supplied Level 7 / 2,480 XP and 520 XP remaining toward Level 8 / 18-day streak / leaderboard. Label the panel illustrative. Use one intentional progress ring or track; do not scatter coins or badges randomly.
4. **Institutional Analytics — “Dashboards that expose curriculum gaps.”** Use the supplied DSA/SQL/Cloud/Testing values and gap statement in an accessible compact chart/UI. Label demo values illustrative. Connect the chart to a curriculum-adjustment insight; do not invent additional statistics.

Drive the progression from one normalized chapter progress value. Give the four stages clear non-overlapping timing ranges. The scene must progress with scroll and reverse smoothly on upward scroll; avoid unrelated simultaneous motion.

### Chapter 5 — Audience / “One platform. Three perspectives.”

Preserve the complete supplied descriptions and benefit lists for **Students**, **Industry**, and **Institutions**. Use accessible tabs or segmented controls, with actual keyboard operation. Selecting a perspective must reconfigure the same skill-signal scene and update the selected tab:

- Students: own verified skill profile → personalized roadmap → matched opportunity.
- Industry: verified candidate evidence → explainable shortlist/role demand.
- Institutions: cohort skill patterns → curriculum alignment/gap insight.

Use a measured transition (roughly 250–500 ms), not a page reset. Keep the selected content and visualization semantically associated. Do not invent performance outcomes.

### Chapter 6 — Final CTA and footer

Preserve the exact supplied CTA title, body, and destinations: `Sign Up free` → `/register`; `Log In` → `/login`. End the visual journey by having the skill-signal pathways resolve into a clear, calm composition that frames—not obscures—the CTA.

Preserve the footer brand statement, `The gap`, `Features`, login/create-account links, GitHub repository link, current year, and tagline. Optional: make the existing logo respond to hover with a subtle SVG stroke ripple. Do not add sound unless it is user-initiated, there is a visible sound toggle, and the scene genuinely benefits from it. Sound must be off by default.

### Existing stats and illustrative data

The four inventory stats (10K+ active students, 50K+ assessments, 500+ roles matched, 92% placement readiness) are explicitly unverified. Omit them from a factual-looking hero/stats display. If retained for visual parity, label them clearly as **“illustrative demo figures — not verified.”** Apply the same label to all supplied example scores, names, streaks, charts, and leaderboard values.

## Scroll and motion engineering requirements

Use scroll as a **continuous storytelling control**, following the useful principle in Trionn, but adapt the actual scenes to DevAstra. Do not copy Trionn’s 371-frame sequence, lion, signature mark, or exact service/work layouts.

- Prefer GSAP + ScrollTrigger for pinned/scrubbed sections and sequenced reveals. If Lenis is used, synchronize it via `gsap.ticker` and integrate it correctly with ScrollTrigger; do not run unsynchronized smooth-scroll loops. With reduced motion, disable Lenis and use native scrolling.
- Give each chapter one normalized progress value `p ∈ [0,1]`. Map scene transitions to explicit ranges. Example only—tune from preview:

```js
const p = clamp(sectionProgress, 0, 1);
const assessT = smoothstep(0.00, 0.28, p);
const growT   = smoothstep(0.28, 0.60, p);
const matchT  = smoothstep(0.60, 0.92, p);
// Use the same p for meaningful object state, DOM reveal, and chapter indicator.
```

- Keep a single frame loop per scene. Use delta-time-based damping (e.g. `alpha = 1 - Math.exp(-damping * deltaSeconds)`) for smooth but responsive movement. Avoid creating new Three.js geometries/materials every frame or setting React state on every scroll pixel.
- Reverse motion naturally on upward scrolling; no random reshuffle, jump, or scene replacement.
- Keep page scroll native and usable. If a section is pinned, set a clear, finite scroll distance and ensure wheel/touchpad input is never trapped. Do not apply forced scroll-snap.
- Animate DOM typography tastefully: split/reveal headlines from blur/opacity to sharp/visible with restrained stagger; preserve full text in accessible DOM. Avoid animating every character everywhere.
- Pointer movement should be eased and low-amplitude. Hover effects should have clear targets and clear outcomes. Respect focus/keyboard input and never require hover to reveal essential content.
- Optional sound is event-based only (no soundtrack), off by default, visibly controllable, and must respect browser autoplay policy.

## Images and video: generate them, never leave vague placeholders

Audit the repository’s existing image assets first. Use an existing asset only if it is relevant, crisp at the target size, and consistent with the new art direction. **Do not leave empty image boxes, gray placeholders, generic stock images, random Unsplash links, or instructions like “add an image here.”**

For every image/video that is needed but absent or unsuitable, use Gemini’s available image/video generation inside Antigravity and save the finished asset into the repository. If generation is available, do it as part of this task—do not merely tell the user to generate it later. If Antigravity’s current Gemini setup cannot generate a particular media type, say so explicitly, then create a deterministic Three.js/SVG/CSS visual for that purpose; never silently leave a placeholder.

Generate **only assets that the actual design uses**. The hero Skill Signal and the explanatory diagrams/charts should be built as original Three.js/SVG/DOM scenes, not flattened into images. Generate the following contextual image assets only if the matching repo asset is absent or unsuitable:

1. `public/generated/devAstra-assess.webp` — 4:3 editorial technology photograph: close view of a student at a laptop completing a structured coding assessment, subtle code editor and assessment rubric visible but no readable words, realistic hands, dark graphite environment with restrained DevAstra gold and indigo practical light, premium documentary photography, clean composition with subject centered, no logos, no watermark, no fake UI text.
2. `public/generated/devAstra-grow.webp` — 4:3 editorial technology photograph: learner reviewing a personalized roadmap beside a supportive AI career-coaching interface on a laptop, calm focused mood, realistic workspace, indigo with a restrained gold progress highlight, no readable generated text, no logos, no watermark.
3. `public/generated/devAstra-match.webp` — 4:3 editorial technology photograph: technical recruiter reviewing a candidate’s verified coding portfolio and role requirements on a screen, visible skill-evidence concept without legible text, professional inclusive setting, charcoal/indigo with restrained gold, no logos, no watermark.
4. `public/generated/devAstra-students.webp` — 3:2 realistic editorial photo of a diverse university student confidently preparing for a technical interview, laptop and notebook, natural candid framing, no visible readable UI/text, no logos or watermark.
5. `public/generated/devAstra-industry.webp` — 3:2 realistic editorial photo of a recruiter and engineer reviewing technical skills evidence together, collaborative and credible, no readable UI/text, no logos or watermark.
6. `public/generated/devAstra-institutions.webp` — 3:2 realistic editorial photo of university faculty reviewing aggregate curriculum/skills analytics on a display, no legible text or personal student data, no logos or watermark.

Generate at high resolution appropriate to desktop use (minimum 1600 px on the long edge; 3:2 or 4:3 as specified), then convert/compress to WebP while preserving visual quality. Keep a single consistent photographic grade across the six images. Never ask Gemini to render DevAstra copy, numeric metrics, diagrams, charts, or logos inside images; create those as DOM/SVG/Three.js so they remain accurate and editable. Write descriptive `alt` text. Lazy-load below-the-fold images.

**Video is not required.** Do not insert a generic background video. If you determine a video is genuinely needed for one specific chapter, explain why in the implementation plan and generate an original 6–8 second seamless loop with no text/logos, then provide a static poster and ensure reduced-motion users receive the poster. If video generation is unavailable, implement the effect procedurally instead—do not substitute stock footage.

## Desktop scope only for this build

Focus exclusively on desktop/PC. Implement and visually tune at:

- 1366 × 768
- 1440 × 900
- 1920 × 1080

Do not create or spend time on a mobile layout, mobile navigation, mobile-specific animation variant, or mobile 3D composition in this pass; the user will adapt mobile separately. Do not let the desktop page collapse into a two-column layout at smaller widths. Within the stated desktop sizes, avoid horizontal overflow, clipped content, and illegible text. Preserve keyboard access and semantic controls even though this pass is desktop-focused.

## Accessibility, performance, and lifecycle

- Keep headings, copy, nav, tabs, and CTAs as semantic/selectable DOM. Provide visible keyboard focus, descriptive labels, and correct link destinations.
- Ensure essential meaning never depends on color, pointer hover, audio, or animation. Give canvas content an accessible label/summary or adjacent text description.
- Respect `prefers-reduced-motion`: keep each chapter understandable with static scene poses; turn off idle rotation, continuous drift, smooth-scroll override, parallax, and scrubbed effects. All copy and controls remain available.
- Cap renderer pixel ratio at 2; lazy-load heavy 3D sections and below-fold images; stop rendering when the document is hidden and pause scenes outside their active chapter where possible.
- Dispose of geometries, materials, textures, event listeners, observers, animation frames, and renderer resources on cleanup. Handle WebGL unavailable/context lost with a composed static DOM/SVG scene that preserves each chapter’s meaning.
- Do not add excessive bloom, dozens of particles, large uncompressed video, multiple redundant post-processing passes, or always-on rendering across the entire page.
- Keep text/background contrast strong in both existing dark and light themes. Fix existing light-theme contrast issues while touching the landing page.

## Verification — completion gate

Build is not complete until the running page has been visually checked. Do not claim a check passed if it was not actually performed.

1. Run the existing typecheck, lint, and production build commands. Fix errors introduced by the redesign. Do not modify backend code.
2. Run the actual app in a browser at all three desktop target resolutions listed above.
3. Capture screenshots of: hero initial state; hero hover; hero hold/release; problem gap; each of the three how-it-works stages; all four feature-engine stages; each of the three audience states; final CTA/footer.
4. Scroll down and back up through every chapter. Confirm scene elements genuinely change position/shape/state with scroll; they must not be static wallpaper while only copy changes. Confirm the visual story is DevAstra-specific and every 3D object maps to supplied product copy.
5. Test pointer hover, click-and-hold/release, audience tabs, nav anchors, all CTAs, keyboard-only navigation, and the sound toggle if included. Ensure pointer interactions do not block normal scrolling.
6. Check reduced-motion and WebGL-unavailable behavior, console/runtime errors, text clipping, image loading, accessibility labels, hidden-tab pause behavior, and frame-rate/performance during scrolling.
7. Verify the generated asset files exist, are actually used, have no visible AI text/artifacts/watermarks, and have alt text. If image/video generation could not be performed, disclose the exact capability issue and confirm the procedural fallback is complete.
8. In the final response, report files changed, generated assets, build/test status, browser sizes/states actually inspected, and any remaining blocker. Explicitly state if any visual verification could not be completed.

## Definition of done

The result is a **DevAstra landing page**, not a Trionn clone: its exact product story is preserved, its graphics explain assessed skills → guided growth → explainable role matching, and each major chapter has purposeful scroll-linked 3D or depth-based motion. The page is one coherent, naturally scrollable editorial experience—not a spiral, not a split-screen text/3D panel, not floating copy over a static background, and not a random 3D demo. Any missing needed imagery has been generated using the explicit Gemini asset briefs above or replaced with an intentional procedural visual if generation is unavailable. The real running site has been visually tested at all three desktop targets.
