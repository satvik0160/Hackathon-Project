# Landing page imagery — what ships today, and the briefs to replace it

The landing page currently uses **existing repository photography**. No new
imagery was generated for this build (there is no image-generation tool
available in this environment), and nothing is left as an empty box or
placeholder.

If you want the art-directed set the redesign was specced with, generate the
files below, drop them in at the **exact paths**, and nothing else needs to
change — the components already reference those paths.

## Current usage

| Path used today | Where it appears | Verdict |
|---|---|---|
| `/images/step-assess.jpg` | Chapter 3, station 01 thumbnail | Relevant, real photo — keep or replace |
| `/images/step-ai.jpg` | Chapter 3, station 02 thumbnail | Relevant, real photo — keep or replace |
| `/images/step-match.jpg` | Chapter 3, station 03 thumbnail | Relevant, real photo — keep or replace |
| `/images/tab-students.jpg` | Chapter 5, For Students panel | Relevant, real photo — keep or replace |
| `/images/tab-industry.jpg` | Chapter 5, For Industry panel | Relevant, real photo — keep or replace |
| `/images/tab-institutions.jpg` | Chapter 5, For Institutions panel | Relevant, real photo — keep or replace |
| `/dhruvlogo.webp` | Chapter 4, copilot mock avatar | Correct asset, keep |
| `/devlogo.jpg` | Nav + footer brand badge | Correct asset, keep |

`/images/hero-skills.jpg` is **no longer used**: the hero's photograph was
replaced by the interactive Skill Signal scene, so that slot is now WebGL.

## Replacement briefs

Save each at the path given, at 1600 px minimum on the long edge, then convert
to WebP (quality ~82) keeping the same filename stem.

1. `frontend/public/generated/devAstra-assess.webp` — 4:3 editorial technology
   photograph: close view of a student at a laptop completing a structured
   coding assessment, subtle code editor and assessment rubric visible but no
   readable words, realistic hands, dark graphite environment with restrained
   gold and indigo practical light, premium documentary photography, subject
   centred, no logos, no watermark, no fake UI text.
2. `frontend/public/generated/devAstra-grow.webp` — 4:3 editorial technology
   photograph: learner reviewing a personalised roadmap beside a supportive AI
   career-coaching interface on a laptop, calm focused mood, realistic
   workspace, indigo with a restrained gold progress highlight, no readable
   generated text, no logos, no watermark.
3. `frontend/public/generated/devAstra-match.webp` — 4:3 editorial technology
   photograph: technical recruiter reviewing a candidate's verified coding
   portfolio and role requirements on a screen, visible skill-evidence concept
   without legible text, professional inclusive setting, charcoal/indigo with
   restrained gold, no logos, no watermark.
4. `frontend/public/generated/devAstra-students.webp` — 3:2 realistic editorial
   photo of a diverse university student confidently preparing for a technical
   interview, laptop and notebook, natural candid framing, no readable
   UI/text, no logos, no watermark.
5. `frontend/public/generated/devAstra-industry.webp` — 3:2 realistic editorial
   photo of a recruiter and engineer reviewing technical skills evidence
   together, collaborative and credible, no readable UI/text, no logos, no
   watermark.
6. `frontend/public/generated/devAstra-institutions.webp` — 3:2 realistic
   editorial photo of university faculty reviewing aggregate curriculum/skills
   analytics on a display, no legible text or personal student data, no logos,
   no watermark.

Keep one consistent photographic grade across all six.

## Rules that must survive any swap

- **Never** render DevAstra copy, numeric metrics, diagrams, charts or logos
  inside an image. Every number on this page is real DOM/SVG so it stays
  accurate, editable and screen-readable (see `src/landing/chapters/EngineVisuals.jsx`).
- Write descriptive `alt` text; the current alts live in
  `src/landing/content.js` (`STEPS[].photoAlt`, `AUDIENCE.tabs[].photoAlt`).
- Below-the-fold images are already `loading="lazy" decoding="async"`.
- Video is deliberately not used anywhere on this page.
