import React, { useEffect, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';

/* --------------------------------------------------------------------------
 * InteractiveAuroraBackground
 *
 * A single, self-contained animated backdrop used behind the app shell
 * (`variant="app"`, light pastel) and behind the auth screens
 * (`variant="auth"`, deep cosmic). Everything below is *background only* —
 * it never renders content, never captures pointer events, and every layer is
 * GPU-composited (transform / opacity) or drawn on one 2D canvas.
 *
 * Interaction model
 *  - Moving the pointer spawns a vortex: particles inside the influence radius
 *    are swept tangentially into orbit around the cursor and are pushed back
 *    once they get too close, so they settle into a spinning ring.
 *  - A live grid is masked by a radial spotlight that follows the cursor, and a
 *    soft coloured halo trails it on a spring.
 *  - Clicking (or tapping) anywhere emits an expanding shockwave that shoves
 *    nearby particles outward.
 *  - Ambient motion continues with no input: drifting blobs, a slowly rotating
 *    aurora sweep, flowing ribbons, streaks and a floating ringed planet.
 *
 * Accessibility / performance
 *  - `prefers-reduced-motion` → one static frame, no rAF loop, no listeners.
 *  - The loop pauses when the tab is hidden, and DPR is capped at 2.
 * ------------------------------------------------------------------------ */

const VARIANTS = {
  app: {
    backdrop: null, // transparent → the page gradient shows through
    colors: ['124, 108, 255', '79, 142, 247', '232, 111, 214', '43, 196, 154'],
    particleAlpha: 0.55,
    linkAlpha: 0.22,
    pointerRgb: '124, 108, 255',
    trailAlpha: 0.4,
    density: 17000,
    maxParticles: 150,
  },
  auth: {
    backdrop: ['#0B1020', '#04060F'],
    colors: ['150, 140, 255', '79, 142, 247', '240, 111, 214', '43, 196, 154'],
    particleAlpha: 0.9,
    linkAlpha: 0.34,
    pointerRgb: '160, 150, 255',
    trailAlpha: 0.6,
    density: 13000,
    maxParticles: 180,
  },
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/* Parallax wrapper: turns the shared centre-relative cursor spring into a small
   depth-scaled offset so each layer drifts a different amount. */
function Parallax({ sx, sy, depth, className, style, animate, transition, children }) {
  const x = useTransform(sx, (v) => v * depth);
  const y = useTransform(sy, (v) => v * depth);
  return (
    <motion.div
      className={className}
      style={{ ...style, x, y }}
      animate={animate}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

/* Soft blurred aurora blob — breathes on its own and parallaxes with the
   pointer. `depth` is negative for a few layers so they counter-move. */
function AuroraBlob({ sx, sy, depth, variantClass, style, duration, delay = 0, reduced }) {
  return (
    <Parallax
      sx={sx}
      sy={sy}
      depth={depth}
      className={`dv-blob ${variantClass}`}
      style={style}
      animate={reduced ? undefined : { scale: [1, 1.14, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

export default function InteractiveAuroraBackground({ variant = 'app' }) {
  const cfg = VARIANTS[variant] || VARIANTS.app;
  const reduced = useReducedMotion();

  const canvasRef = useRef(null);
  const liveGridRef = useRef(null);

  // Cursor offset from the viewport centre → drives the parallax layers.
  const dx = useMotionValue(0);
  const dy = useMotionValue(0);
  const sdx = useSpring(dx, { stiffness: 42, damping: 18, mass: 0.7 });
  const sdy = useSpring(dy, { stiffness: 42, damping: 18, mass: 0.7 });

  // Raw cursor position → soft halo that trails the pointer.
  const cx = useMotionValue(-9999);
  const cy = useMotionValue(-9999);
  const scx = useSpring(cx, { stiffness: 60, damping: 22, mass: 0.6 });
  const scy = useSpring(cy, { stiffness: 60, damping: 22, mass: 0.6 });
  const haloX = useTransform(scx, (v) => v - 340);
  const haloY = useTransform(scy, (v) => v - 340);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const COLORS = cfg.colors;
    const INFLUENCE = 230; // cursor vortex radius
    const CORE = 62; // inner repel zone → keeps the ring open
    const LINK_DIST = 118; // particle ↔ particle constellation distance

    let width = 0;
    let height = 0;
    let rafId = null;
    let last = performance.now();
    let elapsed = 0;
    let backdropGradient = null;

    const pointer = { x: -9999, y: -9999, active: false };
    let particles = [];
    const bursts = [];
    const trail = [];

    const setGridVars = (x, y) => {
      const grid = liveGridRef.current;
      if (!grid) return;
      grid.style.setProperty('--dv-mx', `${x}px`);
      grid.style.setProperty('--dv-my', `${y}px`);
    };

    const initParticles = () => {
      const count = clamp(Math.round((width * height) / cfg.density), 40, cfg.maxParticles);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        r: Math.random() * 1.5 + 0.9,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        phase: Math.random() * Math.PI * 2,
        alpha: 0.5 + Math.random() * 0.5,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
      buildBackdrop();
    };

    /* The backdrop gradient only depends on the viewport size, so build it once
       per resize instead of allocating a new one on every frame. */
    const buildBackdrop = () => {
      if (!cfg.backdrop) {
        backdropGradient = null;
        return;
      }
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      grad.addColorStop(0, cfg.backdrop[0]);
      grad.addColorStop(1, cfg.backdrop[1]);
      backdropGradient = grad;
    };

    const paintBackdrop = () => {
      if (!backdropGradient) {
        ctx.clearRect(0, 0, width, height);
        return;
      }
      ctx.fillStyle = backdropGradient;
      ctx.fillRect(0, 0, width, height);
    };

    const drawFrame = (now) => {
      let dt = (now - last) / 16.6667;
      last = now;
      if (!Number.isFinite(dt) || dt <= 0) dt = 1;
      dt = Math.min(dt, 3);
      elapsed += dt;

      paintBackdrop();

      /* ---------------- pointer trail ---------------- */
      for (let i = trail.length - 1; i >= 0; i -= 1) {
        if (now - trail[i].t > 420) trail.splice(i, 1);
      }
      for (let i = 1; i < trail.length; i += 1) {
        const a = trail[i - 1];
        const b = trail[i];
        const life = 1 - (now - b.t) / 420;
        ctx.strokeStyle = `rgba(${cfg.pointerRgb}, ${clamp(life, 0, 1) * 0.4})`;
        ctx.lineWidth = clamp(life * 10, 0.4, 9);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      /* ---------------- physics ---------------- */
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];

        // Ambient wander keeps the field alive with no input at all.
        p.vx += Math.cos(p.phase + elapsed * 0.012) * 0.012 * dt;
        p.vy += Math.sin(p.phase + elapsed * 0.011) * 0.012 * dt;

        if (pointer.active) {
          const pdx = pointer.x - p.x;
          const pdy = pointer.y - p.y;
          const dist = Math.hypot(pdx, pdy) || 1;
          if (dist < INFLUENCE) {
            const falloff = 1 - dist / INFLUENCE;
            const nx = pdx / dist;
            const ny = pdy / dist;
            // tangential swirl → orbit
            p.vx += -ny * falloff * 0.62 * dt;
            p.vy += nx * falloff * 0.62 * dt;
            // gentle inward pull
            p.vx += nx * falloff * 0.14 * dt;
            p.vy += ny * falloff * 0.14 * dt;
            // short-range repel → the ring never collapses to a dot
            if (dist < CORE) {
              const rf = 1 - dist / CORE;
              p.vx -= nx * rf * 1.8 * dt;
              p.vy -= ny * rf * 1.8 * dt;
            }
          }
        }

        // click shockwaves shove everything nearby outward
        for (let b = 0; b < bursts.length; b += 1) {
          const burst = bursts[b];
          const bdx = p.x - burst.x;
          const bdy = p.y - burst.y;
          const bdist = Math.hypot(bdx, bdy) || 1;
          if (bdist < burst.radius + 90) {
            const push = (1 - burst.life) * (1 - clamp(bdist / (burst.radius + 90), 0, 1));
            p.vx += (bdx / bdist) * push * 3.2 * dt;
            p.vy += (bdy / bdist) * push * 3.2 * dt;
          }
        }

        const damp = Math.pow(0.955, dt);
        p.vx *= damp;
        p.vy *= damp;

        const speed = Math.hypot(p.vx, p.vy);
        const maxSpeed = 7.5;
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const pad = 30;
        if (p.x < -pad) p.x = width + pad;
        else if (p.x > width + pad) p.x = -pad;
        if (p.y < -pad) p.y = height + pad;
        else if (p.y > height + pad) p.y = -pad;
      }

      /* ---------------- constellation links ---------------- */
      ctx.lineWidth = 0.7;
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        const speed = Math.hypot(p.vx, p.vy);
        const energised = 1 + clamp(speed / 3, 0, 1.4);
        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const ldx = p.x - q.x;
          const ldy = p.y - q.y;
          const ldist2 = ldx * ldx + ldy * ldy;
          if (ldist2 > LINK_DIST * LINK_DIST) continue;
          const ldist = Math.sqrt(ldist2);
          const a = (1 - ldist / LINK_DIST) * cfg.linkAlpha * energised;
          ctx.strokeStyle = `rgba(${p.color}, ${clamp(a, 0, 0.85)})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      /* ---------------- cursor threads + particle dots ---------------- */
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];

        if (pointer.active) {
          const pdx = p.x - pointer.x;
          const pdy = p.y - pointer.y;
          const dist = Math.hypot(pdx, pdy);
          if (dist < INFLUENCE + 70) {
            const a = (1 - dist / (INFLUENCE + 70)) * 0.42;
            ctx.strokeStyle = `rgba(${cfg.pointerRgb}, ${clamp(a, 0, 0.7)})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }

        const speed = Math.hypot(p.vx, p.vy);
        const glow = 0.75 + clamp(speed / 4, 0, 1.5);
        ctx.fillStyle = `rgba(${p.color}, ${clamp(cfg.particleAlpha * p.alpha * glow, 0, 1)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + clamp(speed / 5, 0, 1.6), 0, Math.PI * 2);
        ctx.fill();
      }

      /* ---------------- cursor reticle ---------------- */
      if (pointer.active) {
        const spin = elapsed * 0.02;
        ctx.save();
        ctx.translate(pointer.x, pointer.y);

        ctx.strokeStyle = `rgba(${cfg.pointerRgb}, 0.32)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 34, spin, spin + Math.PI * 1.25);
        ctx.stroke();

        ctx.strokeStyle = `rgba(${cfg.pointerRgb}, 0.22)`;
        ctx.beginPath();
        ctx.arc(0, 0, 50, -spin * 1.4, -spin * 1.4 + Math.PI * 0.7);
        ctx.stroke();

        ctx.fillStyle = `rgba(${cfg.pointerRgb}, 0.85)`;
        ctx.beginPath();
        ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      /* ---------------- shockwaves ---------------- */
      for (let i = bursts.length - 1; i >= 0; i -= 1) {
        const burst = bursts[i];
        burst.life += 0.017 * dt * 1.6;
        burst.radius += 6.2 * dt;
        if (burst.life >= 1) {
          bursts.splice(i, 1);
          continue;
        }
        const a = (1 - burst.life) * 0.5;
        ctx.strokeStyle = `rgba(${cfg.pointerRgb}, ${a})`;
        ctx.lineWidth = clamp(3.5 * (1 - burst.life), 0.4, 4);
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, burst.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(${cfg.pointerRgb}, ${a * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, burst.radius * 0.62, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const loop = (now) => {
      rafId = requestAnimationFrame(loop);
      drawFrame(now);
    };

    const start = () => {
      if (rafId !== null) return;
      last = performance.now();
      rafId = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (rafId === null) return;
      cancelAnimationFrame(rafId);
      rafId = null;
    };

    /* ---------------- input ---------------- */
    const handlePointerMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
      dx.set(x - window.innerWidth / 2);
      dy.set(y - window.innerHeight / 2);
      cx.set(x);
      cy.set(y);
      setGridVars(x, y);
      trail.push({ x, y, t: performance.now() });
      if (trail.length > 22) trail.shift();
    };

    const handlePointerDown = (e) => {
      bursts.push({ x: e.clientX, y: e.clientY, radius: 6, life: 0 });
      if (bursts.length > 6) bursts.shift();
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
      dx.set(0);
      dy.set(0);
      cx.set(-9999);
      cy.set(-9999);
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const handleResize = () => {
      resize();
      if (reduced) drawFrame(performance.now());
    };

    window.addEventListener('resize', handleResize);
    resize();

    if (reduced) {
      // Static field: one frame, no loop, no pointer listeners.
      drawFrame(performance.now());
      return () => window.removeEventListener('resize', handleResize);
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibility);
    start();

    return () => {
      stop();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [cfg, reduced]);

  return (
    <div className={`dv-aurora dv-aurora--${variant}`} aria-hidden="true">
      {/* Particle canvas — painted first (bottom layer) so every aurora layer
          above it glows over the field instead of being hidden by it. */}
      <canvas ref={canvasRef} className="dv-aurora__canvas" />

      {/* Rotating aurora sweep — the slow colour engine of the whole layer */}
      <div className="dv-aurora__sweep" />

      {/* Aurora blobs: each parallaxes at its own depth */}
      <AuroraBlob
        sx={sdx}
        sy={sdy}
        depth={0.055}
        variantClass="dv-blob--violet"
        style={{ top: '-18%', right: '-12%', width: '52vw', height: '52vw' }}
        duration={16}
        reduced={reduced}
      />
      <AuroraBlob
        sx={sdx}
        sy={sdy}
        depth={-0.045}
        variantClass="dv-blob--blue"
        style={{ bottom: '-20%', left: '-12%', width: '46vw', height: '46vw' }}
        duration={19}
        delay={2}
        reduced={reduced}
      />
      <AuroraBlob
        sx={sdx}
        sy={sdy}
        depth={0.08}
        variantClass="dv-blob--pink"
        style={{ top: '30%', left: '36%', width: '34vw', height: '34vw' }}
        duration={22}
        delay={4}
        reduced={reduced}
      />
      <AuroraBlob
        sx={sdx}
        sy={sdy}
        depth={0.03}
        variantClass="dv-blob--mint"
        style={{ bottom: '10%', right: '20%', width: '26vw', height: '26vw' }}
        duration={20}
        delay={3}
        reduced={reduced}
      />

      {/* Flowing light ribbons */}
      <Parallax sx={sdx} sy={sdy} depth={0.018} className="dv-ribbon-wrap">
        <svg
          className="dv-ribbon"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`dvRibbonA-${variant}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9A6BFA" stopOpacity="0.34" />
              <stop offset="55%" stopColor="#4F8EF7" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#22BDDC" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`dvRibbonB-${variant}`} x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E86FD6" stopOpacity="0.26" />
              <stop offset="60%" stopColor="#9A6BFA" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#2BC49A" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            className="dv-ribbon__flow"
            d="M-100 620 C 260 470, 460 760, 820 560 C 1120 392, 1300 520, 1560 380"
            fill="none"
            stroke={`url(#dvRibbonA-${variant})`}
            strokeWidth="120"
            strokeLinecap="round"
          />
          <path
            className="dv-ribbon__flow dv-ribbon__flow--slow"
            d="M-80 250 C 300 120, 620 340, 960 180 C 1220 58, 1360 170, 1540 90"
            fill="none"
            stroke={`url(#dvRibbonB-${variant})`}
            strokeWidth="90"
            strokeLinecap="round"
          />
        </svg>
      </Parallax>

      {/* Travelling light streaks */}
      <div className="dv-streaks">
        <span className="dv-streak" style={{ top: '18%', animationDelay: '0s' }} />
        <span className="dv-streak" style={{ top: '46%', animationDelay: '3.5s' }} />
        <span className="dv-streak" style={{ top: '72%', animationDelay: '7s' }} />
      </div>

      {/* Floating ringed planet */}
      <Parallax
        sx={sdx}
        sy={sdy}
        depth={0.026}
        className="dv-planet-wrap hidden lg:block"
        animate={reduced ? undefined : { y: [0, -16, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="dv-planet inset-0 absolute" />
        <div className="dv-planet-ring absolute -inset-x-16 top-1/2 h-[110px] -translate-y-1/2" />
      </Parallax>

      {/* Interactive grid: a faint base everywhere + a live copy that lights up
          inside a radial mask tracking the pointer */}
      <div className="dv-aurora__grid dv-aurora__grid--base" />
      <div ref={liveGridRef} className="dv-aurora__grid dv-aurora__grid--live" />

      {/* Soft halo trailing the cursor */}
      <motion.div className="dv-aurora__halo" style={{ x: haloX, y: haloY }} />
    </div>
  );
}
