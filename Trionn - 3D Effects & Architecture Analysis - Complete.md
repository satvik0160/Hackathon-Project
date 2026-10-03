# Trionn: 3D Effects & Architecture Analysis

**Website:** [trionn.com](https://trionn.com/?ref=landing.love)  
**Analysis updated:** 27 September 2026

## Scope and confidence

The browser renderer available for this review did not successfully display Trionn’s WebGL canvas, so this analysis does **not** claim a fresh visual inspection of every frame. It is grounded in Trionn’s publicly available implementation breakdown, the official page’s extracted text, and the Awwwards description. Implementation details are attributed to those sources; visual interpretation is identified as such. The homepage's raw HTML/hydration payload was separately inspected directly (see the addendum, §25); that pass corroborates several points below and adds a few concrete details the secondary sources didn't mention, but it still stops short of executing or rendering the live WebGL canvas.

> **Important:** Trionn is a hybrid interactive website—not a page in which every heading, section, and interface element is a 3D object. It combines custom Three.js/WebGL scenes with ordinary HTML, SVG, canvas, image sequences, and DOM animation.

## Executive summary

The site’s strongest idea is not “make everything 3D”; it is to give each effect a purpose and coordinate it with the story:

1. A multi-part hero symbol idles, responds to pointer movement, lights up on hover, emits line-welding sparks, and can be held to make its panels separate and reassemble.
2. The Services chapter uses scroll as a timeline: it scrubs a **371-frame WebP sequence**, animates a headline into particles, reveals six service cards, transitions the palette, and wipes into Testimonials.
3. The portfolio work grid places project cards on a helix-like 3D arrangement, with scroll-driven rendering and raycast-based hover scaling.
4. The footer turns SVG logo strokes into pluckable “strings” and couples their generated sound to a procedural smoke shader.
5. The About chapter combines a depth-map parallax portrait with a user-dragged curtain made from 2D canvas strips and spring physics.
6. A separate team-photo scatter wall assembles eleven images during scrolling and responds to clicks with depth-like movement and collision-aware shifts.

### Which parts are actually 3D?

| Experience | Best description | What not to confuse it with |
|---|---|---|
| Hero brand symbol | Live Three.js scene with separately animated mesh panels | Not just a flat logo; not evidence that the whole page is 3D |
| Services chapter | Hybrid: Three.js experience plus a 371-frame, pre-rendered WebP sequence and DOM/card animation | The frame sequence itself is not a live 3D model rendered from scratch on every scroll tick |
| Work grid | Live Three.js/WebGL helix scene with 3D card objects | The source does not establish that a single camera fly-through drives the whole scene |
| Footer wire logo | Interactive SVG path deformation | Not 3D geometry |
| Footer smoke | Full-screen fragment shader with audio-reactive noise | Not a 3D particle cloud |
| Lion portrait | One textured plane displaced by a precomputed depth map in a shader | A parallax/depth illusion, not a fully modeled 3D lion |
| Curtain | Procedurally drawn 2D canvas strips with spring-like motion | Not a 3D cloth simulation |
| Team-photo scatter wall | Scroll-animated images with DOM motion and collision-aware layout | The source does not identify this as a Three.js scene |

## Core technology and responsibilities

The published implementation breakdown credits:

- **Next.js and React:** application and component structure.
- **Three.js:** custom WebGL scenes, including the hero symbol, Services experience, and interactive work grid. The developers chose direct Three.js rather than React Three Fiber to control the shared render loop, resource management, and individually animated hero meshes.
- **GSAP and `@gsap/react`:** page transitions, component timelines, and animation orchestration through `useGSAP`.
- **ScrollTrigger:** pinned chapters, scroll-scrubbed sequences, section reveals, and scroll-position-driven animation.
- **SplitText:** reusable character-, word-, and line-level text animation.
- **Lenis:** smooth scrolling, advanced from `gsap.ticker` so scroll updates stay synchronized with GSAP and ScrollTrigger.
- **Web Audio API:** runtime-generated interaction sounds in several scenes. The About curtain interaction also uses recorded sound assets.
- **Tailwind CSS and Swiper:** styling and testimonials/awards carousels.

The architecture uses `gsap.matchMedia()` to give desktop and mobile separate motion logic rather than simply reusing one set of dimensions. A shared transition-ready state delays scene animations until the page transition is finished; non-critical work can be deferred with `requestIdleCallback`. The reusable text-reveal component centralizes reduced-motion handling and GPU-layer cleanup.

## 1. Hero: interactive, multi-part brand symbol

The hero uses two coordinated layers. The background is a Three.js scene containing the brand symbol. The foreground headline, rotating word, and stats hint remain normal DOM text animated with GSAP/SplitText. The implementation uses `mix-blend-mode: difference` for legibility over the WebGL canvas, keeping text semantic and selectable rather than baking it into a texture.

### Idle and pointer response

- The symbol rotates slowly while idle.
- Its three arms/panels use separate sine-wave phases, so their ambient drift is not perfectly synchronized.
- Pointer position influences the symbol’s tilt through interpolation (`lerp`), creating a soft, magnetic follow rather than snapping directly to the cursor.
- Hover detection uses Three.js raycasting against the symbol’s actual geometry. A hovered panel becomes brighter and more glass-like through material-property changes; a short beep plays on entry, not on every animation frame.
- Hover is gated while the scene is transitioning, the symbol is scrolled away, or a stronger interaction is active.

### Guide lines and weld sparks

Three guide lines draw outward from the symbol. After they finish drawing, hovering over a line triggers a brief burst of weld-like sparks that arc toward one or two other lines. A new burst occurs on pointer entry, not continuously while the cursor rests on a line; the source describes about five or six bolts per entry, rate-limited by a short cooldown.

The guide lines are drawn to an offscreen 2D canvas, then used as a texture in the Three.js scene. Spark hit-testing is performed in canvas coordinates. The sparks themselves use layered `THREE.Line` geometries to create glow—**not** an expensive post-processing bloom pass. One synthesized sound plays per burst rather than once per bolt.

### Hold-to-blast

Holding down on the symbol creates a staged interaction:

1. The first roughly **0.5 seconds** are a charge-up; nearby UI, including navigation and headings, vibrates subtly.
2. Once charged, the symbol’s panels separate along individually defined directions and rotate. An explosion and sustained whoosh sound accompany the movement.
3. Releasing the pointer eases the burst back down, returning the panels to their assembled state rather than snapping them back.

Scrolling, hover, intro, and hold feed a shared `explodeAmt` value that controls panel separation. Sharing one state value allows the different causes to transition smoothly instead of starting separate, potentially conflicting animations.

### Headline reveal

The “Designed to” headline is split into characters and revealed from blurred/transparent to sharp/visible with a stagger; characters settle in a randomized order. The rotating word and stats hint reuse the same text-animation component. This is animated typography, **not** 3D text geometry.

## 2. Services: a scroll-scrubbed hybrid sequence

The Services chapter is a pinned sequence controlled by one normalized scroll-progress value from 0 to 1. That shared driver coordinates several effects:

- A **371-frame WebP image sequence** is scrubbed according to scroll position. The frames are pre-rendered images displayed by updating an ordinary `<img>` source; this specific backdrop is not a live Three.js model being recomputed from scratch on every scroll tick.
- The “OUR SERVICES” headline breaks into animated glyph particles.
- Six service cards enter along predefined motion paths.
- The palette transitions from black to white.
- A stripe wipe leads into Testimonials.

The image-frame index eases toward its scroll-derived target, while the other effects use their own timing ranges derived from the same progress value. It is a **hybrid WebGL/DOM/image-sequence composition**: Three.js is credited to the overall Services experience, but its conspicuous scrubbed backdrop is a pre-rendered image sequence.

## 3. Work grid: projects positioned along a helix

The work showcase uses a custom Three.js/WebGL scene rather than relying only on a conventional CSS grid. Project cards are positioned along a helix-like arrangement. ScrollTrigger pins the scene for its active chapter and updates the scene on scroll. The helix is not continuously rendered when it is far from view or at rest; a lightweight ticker runs only when interaction or settling requires it.

Hover is resolved with a Three.js raycaster against visible cards. The hovered card eases from its resting scale toward about **1.12×**, then returns smoothly when the pointer leaves. A fragment shader uses a signed-distance mask to create rounded card corners, avoiding rounded PNGs or nine-slice assets.

The helix gives the portfolio spatial depth while keeping the cards recognizable as project previews. The source describes scroll-driven card/helix positioning and rendering; it does **not** establish that the entire effect is a single camera fly-through, so that would be too specific a description.

## 4. Footer: pluckable wire logo and audio-reactive smoke

Each stroke of the footer’s SVG wordmark behaves like a string. Hovering a stroke makes it oscillate procedurally; each path has its own motion state. Because the visible strokes are thin, an invisible duplicate with a much wider pointer hit area makes them easier to interact with.

A pluck generates a soft note at runtime using the Web Audio API: three harmonic oscillators, subtle vibrato, and a feedback delay. The note’s audio signal is also read by an `AnalyserNode`.

The accompanying smoke is rendered as a full-screen fragment shader with layered fractal noise and domain warping; it is **not** a 3D particle cloud. It drifts upward and changes with both user interaction and the actual frequency energy of the plucked note. The footer therefore couples SVG motion, synthesized sound, and a shader effect without making the logo itself a 3D mesh.

## 5. About chapter: depth-mapped portrait and draggable curtain

The lion portrait creates depth using a single image, a precomputed depth map, and a fragment shader. Cursor movement displaces image pixels according to the depth map to create parallax, with a subtle idle “breathing” movement. This is a depth illusion rendered on one textured plane, **not** a fully modeled lion.

A curtain of strips can be dragged to reveal the portrait. The strips use spring-and-damping motion; neighboring strips follow the active strip so the curtain reads as connected fabric. They are drawn and warped procedurally on a 2D canvas, not simulated as 3D cloth. The lion sequence waits until the preceding headline has completed, preserving a clear reveal order.

The curtain uses recorded audio assets: movement sound begins only after a meaningful drag, a growl is delayed until the curtain has opened enough, and a release sound plays only if the interaction actually moved. This is distinct from the synthesized Web Audio notes and hero sounds.

## 6. Gallery scatter wall: scroll reveal and click response

The “Work hard. Play loud.” section introduces **eleven team photos** from different off-screen directions during a pinned scroll sequence. Each image is assigned a shuffled location from predefined collision-safe slots, plus small position and rotation variations. The arrangement can vary between visits but remains within controlled bounds.

Clicking an image pulls it forward, adjusts its stacking order, shifts overlapping neighboring images away, then eases them back. The clicked image’s dominant color is sampled client-side from a small canvas and used to tint the gallery background. Images are mounted client-side for this interactive section. The case study describes this as an animated image wall; it does **not** identify it as a Three.js scene, so treat it as a separate DOM/image-motion system unless independently verified otherwise.

## 7. Scroll synchronization, rendering, and sound

Lenis is advanced from GSAP’s ticker, synchronizing smooth-scroll updates with ScrollTrigger. ScrollTrigger handles pinning, scrubbing, and reveals. Each scene has a suitable rendering approach: the work grid can render on scroll and keep a light ticker active while interactions settle; the Services backdrop advances a pre-rendered frame sequence; the gallery uses a pinned DOM animation.

Sounds are not one generic soundtrack. Hero hover, blast/whoosh, weld sparks, and footer plucks are synthesized at runtime with the Web Audio API. The curtain interaction uses recorded sound assets. Trionn also exposes a sound toggle. Audio is an opt-in interaction layer, not evidence of a continuously playing soundtrack.

## What not to claim without further evidence

Avoid saying as fact that Trionn uses:

- one 3D camera move as the primary driver of every chapter;
- a fully modeled 3D lion or 3D cloth simulation for the curtain;
- a live 3D render for all 371 frames of the Services animation;
- 3D typography for all animated headings;
- a universal portal/mask system mapping every DOM element to a 3D plane;
- a general `EffectComposer` depth-of-field or bokeh pass;
- a continuously running WebGL render loop across every page section;
- one audio-generation method for every sound (the hero/footer use generated sounds, while the curtain uses recorded audio).

The more accurate takeaway is that Trionn uses **several distinct, coordinated techniques**: live Three.js hero and portfolio scenes; a hybrid scroll-scrubbed Services sequence; SVG, canvas, and DOM interactions; a shader-driven depth-map portrait and smoke; and carefully timed sound.

## References

1. [Trionn official website](https://trionn.com/?ref=landing.love) — page content and site entry point.
2. [Codrops: “The Architecture Behind Trionn: Coordinating GSAP, Three.js, Lenis and Web Audio”](https://tympanus.net/codrops/2026/07/15/the-architecture-behind-trionn-coordinating-gsap-three-js-lenis-and-web-audio/) — primary source for implementation details in this analysis.
3. [Awwwards: Trionn](https://www.awwwards.com/sites/trionn-2) — independent description and technology credits.
---

# 8. Broader website / experience analysis

The 3D implementation makes more sense when viewed as part of Trionn's overall digital-studio design system. The website is not simply a portfolio with 3D effects attached to it. Its interface is itself a demonstration of the studio's capabilities.

## 8.1 Core design philosophy

Trionn presents itself as a premium creative technology / digital studio experience. The visual language combines:

- Minimal, editorial typography
- Oversized headlines
- Strong black/white contrast and deliberate palette transitions
- Generous whitespace
- Large project imagery
- Scroll-driven storytelling
- Continuous but controlled motion
- Micro-interactions
- Interactive 2D and 3D visual layers
- Carefully timed audio
- Strong project presentation
- Short, high-impact copy rather than large explanatory blocks

The important design principle is **restraint**. The site does not need every element to be a 3D object. Motion, typography, imagery, depth and WebGL are selected according to the role they play in the story.

## 8.2 The website behaves like a product

A conventional agency website tends to communicate:

> Here are our services. Here are our projects. Here are our clients.

Trionn instead makes the visitor experience the studio's capabilities through the website itself.

This produces a useful feedback loop:

**The website demonstrates the quality of work that the company is selling.**

The interaction system therefore functions as part of the brand proof, not merely as decoration.

## 8.3 Overall information architecture

The broader homepage experience can be understood as a narrative sequence:

**Navigation → Identity / Hero → About / credibility → Numbers → Work → Services → Testimonials → Design practice / philosophy → CTA / Footer**

The exact implementation varies by page and section, but the underlying storytelling pattern is:

1. Establish identity.
2. Establish credibility.
3. Demonstrate work.
4. Explain capabilities.
5. Provide social proof.
6. End with a clear continuation / contact path.

This is why the website feels more like a presentation or digital editorial experience than a conventional corporate site.

## 8.4 Typography as a primary visual system

Typography carries a significant amount of the visual identity.

The system generally follows a hierarchy like:

**Very large statement → supporting statement → small explanatory text**

rather than filling the interface with many similarly sized headings.

This matters because large typography provides visual drama without requiring decorative 3D objects everywhere.

The hero's "Designed to" treatment is a concrete example: the headline is split into characters and animated from blurred/transparent to sharp/visible with stagger and randomized character order. This is animated DOM typography, not 3D text geometry.

## 8.5 Scroll is treated as a cinematic timeline

The most important interaction principle across the experience is:

**scroll position is a continuous control signal.**

Instead of thinking of sections as isolated blocks with unrelated animations, the implementation can coordinate several properties from a shared normalized progress value.

Conceptually:

```text
Scroll progress 0 ───────────────────────── 1
       │                                     │
       ├── camera / scene movement
       ├── image sequence frame
       ├── object transformation
       ├── typography reveal
       ├── particle state
       ├── image scale
       ├── opacity
       ├── palette transition
       └── next-section transition
```

This is why the interaction can feel like one continuous scene rather than a collection of animated components.

## 8.6 The site's motion hierarchy

The experience can be understood in layers:

### Layer 1 — Typography
Large editorial statements establish hierarchy and composition.

### Layer 2 — Photography / imagery
Large images establish subject matter and emotional tone.

### Layer 3 — DOM motion
Text, cards, navigation and supporting elements move with GSAP.

### Layer 4 — Spatial depth
Parallax, scale, layering, perspective and controlled movement create a sense of space.

### Layer 5 — WebGL / shader effects
GPU-based effects are introduced where they provide a meaningful visual transformation that ordinary DOM/CSS cannot provide as effectively.

This hierarchy prevents the site from becoming a generic "Three.js demo."

## 8.7 Why the 3D feels integrated

The strongest effects do not necessarily announce themselves as "3D."

The user may perceive:

- depth
- inertia
- spatial movement
- smooth transitions
- responsive objects
- image distortion
- atmospheric effects
- changing scale

without consciously thinking about the underlying Three.js implementation.

That is a key lesson in interactive design:

**The technology should support the perceived experience rather than become the experience itself.**

---

# 9. Detailed experience-by-experience breakdown

## 9.1 Hero — brand identity as an interactive object

The hero combines a live Three.js symbol with normal DOM typography.

The WebGL scene is responsible for the visual object, while DOM text remains semantic and selectable.

This creates a deliberate separation:

```text
WebGL layer
└── Interactive brand symbol

DOM layer
├── Main headline
├── Rotating word
└── Stats / supporting information
```

`mix-blend-mode: difference` helps maintain text legibility against the changing WebGL background.

The symbol is not simply rotating continuously. It has multiple interaction states:

```text
Idle
  ↓
Pointer tilt
  ↓
Hover material response
  ↓
Guide-line interaction
  ↓
Hold-to-blast
  ↓
Reassembly
```

The shared `explodeAmt` state is particularly important because multiple interaction sources can influence the same physical property without fighting each other.

## 9.2 Hero interaction philosophy

The hero demonstrates a recurring Trionn principle:

**Use a small number of highly considered interactions instead of dozens of unrelated effects.**

For example:

- Hover produces a material change.
- A guide-line hover produces a short spark event.
- Holding produces a larger staged interaction.
- Releasing reverses the state smoothly.

Each action has a clear cause and effect.

---

# 10. Services as a "hybrid 3D film"

The Services section is particularly important because it demonstrates that a sophisticated interactive section does not need to be purely live 3D.

It combines:

- Pre-rendered image sequence
- Three.js experience infrastructure
- ScrollTrigger
- Particle typography
- DOM service cards
- Palette transition
- Section wipe

The 371-frame WebP sequence is essentially a pre-rendered animation controlled by scroll.

Conceptually:

```text
Scroll progress
       ↓
Target frame
       ↓
371-frame WebP sequence
       ↓
Displayed image
```

At the same time:

```text
Same scroll progress
       ├── headline → particles
       ├── cards → motion paths
       ├── palette → black → white
       └── transition → Testimonials
```

This is an important performance/design lesson:

**A visually 3D-looking result does not require every visual frame to be generated by a real-time 3D engine.**

Pre-rendering can be the correct solution when the desired sequence is cinematic and deterministic.

---

# 11. Portfolio / Work grid as spatial navigation

The Work section changes the mental model from:

**grid of cards**

to:

**objects existing in a shared spatial arrangement.**

The helix arrangement provides:

- depth
- scale variation
- spatial continuity
- a stronger sense of movement
- a recognizable relationship between projects

Yet the cards remain readable as project previews.

The implementation also demonstrates selective rendering: the WebGL scene does not need to behave like an always-on heavy render loop when the section is inactive.

The raycaster creates direct spatial interaction between pointer position and actual card geometry.

---

# 12. Footer as an interaction experiment

The footer is unusually important because it proves that interactive design does not have to stop when the main portfolio content ends.

The SVG logo becomes a set of virtual strings.

The interaction chain is:

```text
Pointer
   ↓
SVG stroke
   ↓
Procedural oscillation
   ↓
Web Audio note
   ↓
AnalyserNode
   ↓
Shader energy
   ↓
Smoke response
```

This is an excellent example of **cross-modal interaction**:

**visual input → physical-looking movement → sound → visual atmosphere**

The smoke is therefore not an isolated visual effect. It is part of the same interaction system as the logo and audio.

---

# 13. About chapter as depth illusion rather than full modeling

The lion portrait is a particularly useful technical lesson.

The input is essentially:

```text
Color image
+
Depth map
```

A shader then uses the depth information to offset pixels based on cursor position.

Conceptually:

```text
2D photograph
     +
depth information
     ↓
pixel displacement
     ↓
perceived 3D depth
```

This can create a surprisingly convincing spatial result without:

- building a complete 3D lion model
- rigging the lion
- creating a full 3D environment

The curtain is similarly clever: it uses 2D strips and spring-like motion to create the perception of connected material without requiring a full cloth simulation.

---

# 14. The team-photo wall demonstrates that not everything needs WebGL

The eleven-image scatter wall reinforces the hybrid philosophy.

It uses:

- DOM images
- predefined collision-safe slots
- shuffled placement
- controlled rotation
- pinned scroll
- click-to-front behavior
- neighboring-image displacement
- client-side color sampling

This is visually spatial but does not need to be a Three.js scene.

That distinction is valuable when designing a high-end website:

**Use WebGL because it solves a visual/interaction problem, not because the site is supposed to contain WebGL.**

---

# 15. Interaction physics

Across the experience, several physical metaphors are used:

### Lerp / interpolation
Used for soft pointer-following rather than direct snapping.

### Spring and damping
Used for curtain strips and other returning movements.

### Easing
Used to make transitions feel physically continuous.

### Stagger
Used to make typography and multiple objects enter sequentially.

### Inertia
Used to prevent interaction from feeling mechanically instantaneous.

### Shared state
Used when multiple triggers need to control the same visual property.

These are important because "smooth" does not simply mean adding a long CSS transition.

---

# 16. Audio is part of the interaction model

The site does not rely on one continuous soundtrack.

Instead, audio is event-based.

Examples include:

- Hero hover beep
- Weld-spark sound
- Hold-to-blast explosion / whoosh
- Footer synthesized notes
- Curtain movement sound
- Curtain growl
- Curtain release sound

This creates a cause-and-effect relationship:

**interaction → sound**

rather than:

**page → background music**

The implementation also includes a sound toggle, reinforcing that audio is an optional interaction layer.

---

# 17. Performance architecture

The implementation shows several performance-conscious decisions:

- Direct Three.js rather than React Three Fiber for specific scenes where the developers wanted tighter render-loop/resource control.
- Scene rendering can be conditional rather than continuously active.
- Non-critical work can be deferred with `requestIdleCallback`.
- Desktop and mobile use separate motion logic through `gsap.matchMedia()`.
- The shared text-reveal component handles reduced-motion behavior and GPU-layer cleanup.
- Smooth scrolling is synchronized through Lenis + GSAP ticker + ScrollTrigger.
- The Services cinematic sequence uses pre-rendered frames rather than forcing real-time 3D rendering for the entire animation.

The larger architectural lesson is:

**Performance is handled at the scene/interaction level, not as an afterthought after all effects have been added.**

---

# 18. Responsive design philosophy

The site does not simply shrink the desktop experience onto mobile.

The implementation uses `gsap.matchMedia()` to provide separate desktop and mobile motion logic.

That means responsive behavior can change:

- dimensions
- animation distances
- interaction assumptions
- scene behavior
- timing
- potentially the complexity of visual effects

For a similar implementation, mobile should therefore be treated as a different interaction environment rather than a smaller desktop canvas.

---

# 19. What makes the experience premium

The combined system can be summarized as:

```text
Premium interactive experience
        │
        ├── Typography
        │
        ├── Composition
        │
        ├── Imagery
        │
        ├── Scroll choreography
        │
        ├── Spatial depth
        │
        ├── WebGL
        │
        ├── Shaders
        │
        ├── Audio
        │
        ├── Micro-interactions
        │
        └── Performance discipline
```

No single item is responsible for the result.

The quality comes from the coordination between them.

---

# 20. What should and should not be copied when creating a similar experience

## Good principles to reproduce

- Treat scrolling as a timeline.
- Keep typography in the DOM.
- Use WebGL selectively.
- Use pre-rendered sequences when they are more appropriate than real-time rendering.
- Use shaders for meaningful pixel-level transformations.
- Give interactions physical-feeling inertia.
- Coordinate multiple effects through shared progress/state.
- Use audio as event feedback when it adds value.
- Separate desktop and mobile interaction logic.
- Stop or reduce rendering when a scene is inactive.
- Make every major interaction have a clear purpose.
- Design the story before choosing the effect.

## Avoid

- Random floating 3D objects.
- Generic glowing particles everywhere.
- A rotating sphere simply because Three.js is available.
- Making every heading into 3D geometry.
- Running an expensive WebGL render loop across the whole site unnecessarily.
- Using excessive blur/glow/post-processing.
- Adding sound to every hover.
- Making every section move at once.
- Treating mobile as desktop scaled down.
- Building a technically impressive effect that has no relationship to the content.

---

# 21. A practical architecture for reproducing the interaction style

A similar project could be structured approximately as:

```text
Next.js / React
│
├── DOM / semantic content
│   ├── Typography
│   ├── Navigation
│   ├── Cards
│   └── Accessibility
│
├── GSAP
│   ├── Timelines
│   ├── SplitText
│   └── Component transitions
│
├── ScrollTrigger
│   ├── Pinning
│   ├── Scrubbing
│   └── Scroll progress
│
├── Lenis
│   └── Smooth scrolling
│
├── Three.js
│   ├── Hero scene
│   ├── Work scene
│   └── Selected interactive scenes
│
├── Shaders
│   ├── Image distortion
│   ├── Depth-map parallax
│   ├── Smoke
│   └── Rounded-card masks
│
├── Canvas
│   ├── Guide lines
│   ├── Curtain
│   └── Other 2D procedural effects
│
└── Web Audio
    ├── Interaction sounds
    └── Audio-reactive visuals
```

The critical architectural principle is that **these systems cooperate rather than one technology attempting to handle everything**.

---

# 22. The most important takeaway

The correct mental model for Trionn is not:

> **"A website with cool 3D animations."**

It is:

> **"A hybrid interactive storytelling system in which DOM, WebGL, shaders, canvas, image sequences, scroll, typography, physics-like motion and audio are coordinated around individual pieces of content."**

That distinction explains why its implementation is considerably more sophisticated than simply adding Three.js to a normal portfolio.

---

# 23. Condensed technical model

For reference, the experience can be reduced to the following model:

```text
                    USER
                     │
          ┌──────────┴──────────┐
          │                     │
        SCROLL                POINTER
          │                     │
          ↓                     ↓
     ScrollTrigger          Raycaster
          │                     │
          ├──────────┐          │
          ↓          ↓          ↓
      GSAP       Progress     Interaction
          │          │          │
          └──────┬───┴──────────┘
                 ↓
          Scene / component state
                 │
       ┌─────────┼─────────┐
       ↓         ↓         ↓
      DOM      Canvas    Three.js
       │         │         │
       ↓         ↓         ↓
    Text/card   2D FX    WebGL scene
       │         │         │
       └─────────┼─────────┘
                 ↓
              SHADERS
                 │
                 ↓
             VISUAL OUTPUT
                 │
                 ↕
             WEB AUDIO
```

This is the architectural pattern that best explains the site as a whole.

---

# 24. Source distinction

The implementation-specific details in this document are based primarily on the published Trionn implementation breakdown, with the official site and Awwwards used for site/context and technology information.

Where the browser renderer could not directly expose the live WebGL canvas, the analysis should be treated as an implementation-based reconstruction rather than a claim that every animation frame was independently inspected.

This distinction should be preserved when using this document as a technical reference.

---

# 25. Addendum: Confirmed details from direct homepage source inspection

Unlike the rest of this document, the findings below come from directly reading the homepage's raw served HTML and React hydration payload (view-source, not a rendered screenshot), rather than from the Codrops write-up or Awwwards. They either corroborate points made above with primary-source evidence or add detail those secondary sources didn't cover. Nothing here contradicts the earlier sections.

## 25.1 A dedicated pre-hero loading sequence (not previously documented)

The entire `<main>` element is held at `opacity:0; visibility:hidden; pointer-events:none` until a full-screen preloader (`.pl-overlay`) finishes. That preloader is its own small animation system, separate from anything described in §1–§14:

- **Ten `.pl-belt` strips** stacked across the screen, presumably translating/scaling in sequence to read as a moving conveyor-belt backdrop.
- **A three-part SVG logo draw-in.** The wordmark's "T" glyph is built from three interlocking puzzle-piece paths (`clipPath` ids `pl-clip1`/`pl-clip2`/`pl-clip3`), each stroked in with `stroke-dasharray`/`stroke-dashoffset`, so the mark appears to trace itself into place rather than fading or popping in.
- **A rotating tagline**, "Inspire · Innovate · Impact," cycling word by word.
- **A slot-machine-style numeric counter** (`.pl-slot-reel` / `.pl-slot-strip`) — an odometer-style "percentage loading" readout rather than a plain number tick-up.
- **Four corner "+" decorations** (`.pl-flying-plus`) that fly in and out around the logo.

The same belts, corner-plus marks, and a matching center logo container (without the counter) reappear in a `.pl-trans-overlay` / `.pl-trans-center` block, which is clearly the in-app **page-transition** treatment — so the initial-load animation and the between-page transition share one visual motif rather than being built as two unrelated systems.

*Confidence:* this is read directly from static markup class names and structure, not from execution, so the exact timing/easing of the belts and counter is inferred from convention (conveyor-style stripes, odometer-style reels) rather than observed in motion.

## 25.2 Primary-source confirmation of the hero symbol's client-only component and vibrate targets

The hydration payload names the hero's WebGL piece explicitly: `TrionnSymbolAnimationDynamic`, loaded through `next/dynamic` and marked with React's `BAILOUT_TO_CLIENT_SIDE_RENDERING` marker — i.e., it's deliberately excluded from server rendering, which is exactly what you'd expect from a canvas/WebGL-only component and lines up with §1 and §9.1's description of a live Three.js hero scene.

That component is passed a `vibrateElementIds` prop naming the exact DOM ids it shakes: `nav`, `s1-headline`, `s1-sub`, `s1-scroll`, `s1-stats`, `s1-box`, `s1-cta`. In plain terms, that's the site header, the hero headline, the hero sub-copy, the scroll-hint, the "dare to touch the lines" stats block, the "Est. 2012" info box, and the CTA buttons. This is primary-source confirmation — down to the specific elements — of the claim in §1 ("Hold-to-blast") that *"nearby UI, including navigation and headings, vibrates subtly"* during the charge-up phase; it also settles that the vibration is a targeted DOM-element list passed into the WebGL controller, not a full-page shake or a purely canvas-internal effect.

## 25.3 A genuine CSS 3D technique not previously catalogued: the "Key Facts" stat cards

Separately from any Three.js/WebGL scene, the three "Key Facts" stat cards (Featured & Awards, Projects completed, Team members) use real browser-native CSS 3D transforms:

- Their shared container carries `perspective-[1400]` and `transform-3d` (Tailwind's arbitrary-value classes for `perspective` and `transform-style: preserve-3d`).
- Each individual card additionally carries `backface-hidden transform-3d will-change-transform`.

That's a genuine shared-perspective 3D scene built entirely in CSS — distinct from the WebGL helix described for the Work grid (§3, §11) and from every other 3D effect this document catalogues, all of which are Three.js/shader-based. This is worth adding as its own row in the "Which parts are actually 3D?" table in the executive summary:

| Experience | Best description | What not to confuse it with |
|---|---|---|
| Key Facts stat cards | Native CSS 3D: shared `perspective` + `preserve-3d` container with `backface-hidden` cards | Not a Three.js/WebGL scene — no canvas or shader involved, just CSS transforms (likely driven by mouse-tilt or scroll via GSAP, given the site's stack) |

## 25.4 A circular clip-path wipe used for UI panels

Both the desktop nav flyout and the contact popup open via `clip-path: circle(0% at 95% 5%)` animating outward from a point near the top-right corner — a expanding-circle reveal. This is a distinct reveal mechanism from the scaleY "stripe wipe" already documented for section transitions (§7, §10): the stripe wipe is used between page sections, while the circular clip-path wipe is reserved for UI overlays (menu, contact form) anchored to the corner they're triggered from.

## 25.5 Confirmed: duplicate-layer text swap on link/button hover

Every nav link, footer link, and button label in the raw markup is rendered twice inside the same element: a `text-layer original` span holding the visible characters, and an absolutely positioned `text-layer clone` span (`opacity-0 pointer-events-none`) holding an identical, character-by-character duplicate of the same text. Both layers split each word into individual `<span class="char">` glyphs.

This is the standard structure for a **hover text-swap** effect: on hover, GSAP almost certainly animates the "original" layer out (via `transform`/`opacity`/`filter`, per the classes present) while cross-fading or sliding the "clone" layer into its place, then reverses on hover-out — giving the impression of the label rolling over or refreshing itself rather than simply changing color. This confirms a genuine micro-interaction on essentially every piece of interactive text on the page (nav items, "Discuss Your Project," "Book a 30-minute call," social links, footer email/phone), not previously itemized in this document. The exact animation curve (vertical roll vs. crossfade vs. blur-swap) can't be confirmed from static markup alone — only that two identical, independently-animatable text layers exist per label.

## 25.6 Confirmed: count-up animation on the Key Facts numbers

The three headline numbers in the Key Facts cards (`50+`, `1.5K+`, `20+`) are each marked up as a visible value stacked on top of a hidden placeholder digit: a `pointer-events-none absolute … opacity-0` span containing `"0"` sits behind a visible span containing the real value, and both use `tabular-nums` (fixed-width digits, so the layout doesn't jitter as digits change). That's the standard scaffold for a **count-up-on-scroll-into-view** animation — the number very likely animates from 0 up to its final value once the section enters the viewport, rather than appearing statically. This can't be confirmed as a "split-flap"/vertical-reel effect from markup alone (that would need to be observed running); the safer, source-grounded description is a numeric count-up tween, most likely driven by GSAP given the rest of the stack.

## 25.7 Net effect on this document's confidence

None of §25.1–§25.6 overturns anything in §1–§24; if anything it raises confidence in the parts it touches (the hero being a genuinely client-only WebGL component; the hold-to-blast vibration targeting specific UI) and adds two previously uncatalogued micro-interactions (§25.5, §25.6). The addition to the "what's actually 3D" inventory remains §25.3 — a real 3D technique using plain CSS rather than WebGL.

## 25.8 A note on a separate AI's "physical description" pass

A separate pass at this site (run through a different assistant, prompted specifically to describe the page "in physical terms") introduced a longer list of effects not present anywhere above: a magnetic cursor-follower with damped-harmonic/spring physics, wave-like liquid displacement on hero canvases, RGB chromatic aberration on the blast release and on scroll-direction reversals, velocity-coupled barrel/lens distortion during fast scrolling, a continuous film-grain/silver-halide GLSL noise pass over the dark background, glassmorphic "bento grid" service panels with inset hairline bevels, an audio-haptic client-testimonial soundbite ("▷ Listen to him!"), and viscous-drag/overshoot physics on horizontal carousels. It also named specific portfolio projects ("MyWorker AI," "Pulse Studio," "Loftloom") that don't appear anywhere in the material this document draws on.

None of that is corroborated by the Codrops implementation breakdown, the Awwwards listing, or the direct source inspection in §25.1–§25.6 — and some of it (the named projects, in particular) doesn't match anything actually visible in the page's own markup. It reads as plausible generic embellishment for the "award-winning WebGL site" genre rather than confirmed specifics of this build, so it's deliberately **not** folded into the sections above as fact. If you want it captured for a future pass, the honest way to do that is to record it as an unverified candidate list to check against devtools/a live running session — not to merge it in at the same confidence level as everything else in this document.
