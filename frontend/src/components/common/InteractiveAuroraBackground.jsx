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
 *    nearby particles outward, with a warp-speed snap-back effect.
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
    colors: ['124, 108, 255', '79, 142, 247', '232, 111, 214', '43, 196, 154', '217, 175, 103'],
    particleAlpha: 0.65,
    linkAlpha: 0.28,
    pointerRgb: '124, 108, 255',
    trailAlpha: 0.5,
    density: 14000,
    maxParticles: 200,
  },
  auth: {
    backdrop: ['#0B1020', '#04060F'],
    colors: ['150, 140, 255', '79, 142, 247', '240, 111, 214', '43, 196, 154', '217, 175, 103'],
    particleAlpha: 0.95,
    linkAlpha: 0.38,
    pointerRgb: '160, 150, 255',
    trailAlpha: 0.7,
    density: 11000,
    maxParticles: 220,
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
      animate={reduced ? undefined : { 
        x: ['0%', '8%', '0%', '-8%', '0%'],
        y: ['0%', '-5%', '0%', '5%', '0%'],
        scale: [1, 1.25, 0.9, 1.15, 1], 
        opacity: [0.55, 0.95, 0.6, 0.9, 0.55],
        rotate: [0, 45, 90, 45, 0]
      }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

const customStyles = `
  @keyframes dna-spin {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
  }
  @keyframes float-up {
    0% { transform: translateY(10vh) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
  }
  @keyframes scan-line {
    0% { top: -10%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 110%; opacity: 0; }
  }
  @keyframes pulse-ring {
    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
    100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
  }
  @keyframes screen-glow-pulse {
    0% { box-shadow: inset 0 0 100px rgba(124, 108, 255, 0.1); }
    100% { box-shadow: inset 0 0 200px rgba(124, 108, 255, 0.35); }
  }
  .dv-scan-line {
    position: absolute;
    left: 0; right: 0;
    height: 4px;
    background: linear-gradient(to right, transparent, rgba(34, 189, 220, 0.8), rgba(154, 107, 250, 0.8), transparent);
    box-shadow: 0 0 25px 5px rgba(34, 189, 220, 0.6);
    opacity: 0.6;
    animation: scan-line 8s linear infinite;
    pointer-events: none;
    z-index: 10;
  }
  .dv-screen-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    animation: screen-glow-pulse 4s ease-in-out infinite alternate;
    z-index: 10;
  }
  .dv-streak--enhanced {
    animation-duration: var(--s-dur, 4s) !important;
    width: var(--s-width, 100px) !important;
  }
`;

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
    let nebulas = [];
    let comets = [];
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
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        wx: 0, wy: 0, wvx: 0, wvy: 0, // Warp spring logic
        r: Math.random() * 2.5 + 0.8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        phase: Math.random() * Math.PI * 2,
        alpha: 0.6 + Math.random() * 0.4,
        pulseSpeed: 0.5 + Math.random() * 1.5,
        orbitRadius: Math.random() * 50 + 20,
      }));

      nebulas = Array.from({ length: 4 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 200 + 400,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        phase: Math.random() * Math.PI * 2
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

      /* ---------------- nebulas ---------------- */
      if (!reduced) {
        nebulas.forEach(n => {
          n.x += n.vx * dt;
          n.y += n.vy * dt;
          if (n.x < -200) n.vx *= -1;
          if (n.x > width + 200) n.vx *= -1;
          if (n.y < -200) n.vy *= -1;
          if (n.y > height + 200) n.vy *= -1;
          
          const breathe = 1 + Math.sin(elapsed * 0.01 + n.phase) * 0.3;
          const rad = Math.max(1, n.radius * breathe);
          
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, rad);
          g.addColorStop(0, `rgba(${n.color}, 0.06)`);
          g.addColorStop(1, `rgba(${n.color}, 0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(n.x, n.y, rad, 0, Math.PI * 2);
          ctx.fill();
        });

        /* ---------------- energy waves (center outward) ---------------- */
        const centerW = width / 2;
        const centerH = height / 2;
        for(let w = 0; w < 4; w++) {
          const waveRadius = ((elapsed * 2 + w * 400) % 1600);
          if (waveRadius > 0) {
            const alpha = Math.max(0, (1 - waveRadius / 1600) * 0.12);
            ctx.strokeStyle = `rgba(${cfg.pointerRgb}, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerW, centerH, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        /* ---------------- comets ---------------- */
        if (Math.random() < 0.008) {
          comets.push({
            x: Math.random() < 0.5 ? -50 : width + 50,
            y: Math.random() * height,
            vx: (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 15),
            vy: (Math.random() - 0.5) * 8,
            life: 1,
            color: COLORS[Math.floor(Math.random() * COLORS.length)]
          });
        }
        for (let i = comets.length - 1; i >= 0; i--) {
          let c = comets[i];
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          c.life -= 0.006 * dt;
          if (c.life <= 0) {
            comets.splice(i, 1);
            continue;
          }
          const length = 150 * c.life;
          const tailX = c.x - (c.vx / Math.hypot(c.vx, c.vy)) * length;
          const tailY = c.y - (c.vy / Math.hypot(c.vx, c.vy)) * length;
          
          const grad = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
          grad.addColorStop(0, `rgba(${c.color}, ${c.life * 0.8})`);
          grad.addColorStop(1, `rgba(${c.color}, 0)`);
          
          ctx.strokeStyle = grad;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
          
          ctx.fillStyle = `rgba(${c.color}, ${c.life})`;
          ctx.beginPath();
          ctx.arc(c.x, c.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

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

        // Enhanced ambient wander with multiple frequency waves
        p.vx += Math.cos(p.phase + elapsed * 0.018) * 0.018 * dt;
        p.vy += Math.sin(p.phase + elapsed * 0.016) * 0.016 * dt;
        p.vx += Math.cos(p.phase * 1.3 + elapsed * 0.008) * 0.008 * dt;
        p.vy += Math.sin(p.phase * 1.3 + elapsed * 0.009) * 0.009 * dt;

        // Pulsing size effect
        const pulse = 1 + Math.sin(elapsed * p.pulseSpeed * 0.1) * 0.3;
        p.currentPulse = pulse;

        if (pointer.active) {
          const pdx = pointer.x - (p.x + p.wx);
          const pdy = pointer.y - (p.y + p.wy);
          const dist = Math.hypot(pdx, pdy) || 1;
          if (dist < INFLUENCE) {
            const falloff = 1 - dist / INFLUENCE;
            const nx = pdx / dist;
            const ny = pdy / dist;
            // Enhanced tangential swirl → orbit
            p.vx += -ny * falloff * 0.85 * dt;
            p.vy += nx * falloff * 0.85 * dt;
            // Stronger inward pull
            p.vx += nx * falloff * 0.22 * dt;
            p.vy += ny * falloff * 0.22 * dt;
            // Enhanced short-range repel
            if (dist < CORE) {
              const rf = 1 - dist / CORE;
              p.vx -= nx * rf * 2.4 * dt;
              p.vy -= ny * rf * 2.4 * dt;
            }
          }
        }

        // Enhanced click shockwaves with ripple effect
        for (let b = 0; b < bursts.length; b += 1) {
          const burst = bursts[b];
          const bdx = (p.x + p.wx) - burst.x;
          const bdy = (p.y + p.wy) - burst.y;
          const bdist = Math.hypot(bdx, bdy) || 1;
          if (bdist < burst.radius + 120) {
            const push = (1 - burst.life) * (1 - clamp(bdist / (burst.radius + 120), 0, 1));
            const ripple = Math.sin(bdist * 0.1 - elapsed * 0.5) * 0.5 + 0.5;
            p.vx += (bdx / bdist) * push * 4.5 * dt * ripple;
            p.vy += (bdy / bdist) * push * 4.5 * dt * ripple;
          }
        }

        const damp = Math.pow(0.945, dt);
        p.vx *= damp;
        p.vy *= damp;

        const speed = Math.hypot(p.vx, p.vy);
        const maxSpeed = 9.5;
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const pad = 40;
        if (p.x < -pad) p.x = width + pad;
        else if (p.x > width + pad) p.x = -pad;
        if (p.y < -pad) p.y = height + pad;
        else if (p.y > height + pad) p.y = -pad;

        // Warp spring logic (snap back)
        p.wvx += (0 - p.wx) * 0.04 * dt;
        p.wvy += (0 - p.wy) * 0.04 * dt;
        p.wvx *= Math.pow(0.82, dt);
        p.wvy *= Math.pow(0.82, dt);
        p.wx += p.wvx * dt;
        p.wy += p.wvy * dt;
      }

      /* ---------------- constellation links ---------------- */
      ctx.lineWidth = 0.7;
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        const pX = p.x + p.wx;
        const pY = p.y + p.wy;
        const speed = Math.hypot(p.vx, p.vy);
        const energised = 1 + clamp(speed / 3, 0, 1.4);
        
        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const qX = q.x + q.wx;
          const qY = q.y + q.wy;
          
          const ldx = pX - qX;
          const ldy = pY - qY;
          const ldist2 = ldx * ldx + ldy * ldy;
          if (ldist2 > LINK_DIST * LINK_DIST) continue;
          
          const ldist = Math.sqrt(ldist2);
          const breathe = 1 + Math.sin(elapsed * 0.03 + ldist * 0.02) * 0.4;
          const a = (1 - ldist / LINK_DIST) * cfg.linkAlpha * energised * breathe;
          
          ctx.strokeStyle = `rgba(${p.color}, ${clamp(a, 0, 0.95)})`;
          ctx.beginPath();
          ctx.moveTo(pX, pY);
          ctx.lineTo(qX, qY);
          ctx.stroke();
        }
      }

      /* ---------------- cursor threads + particle dots ---------------- */
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        const pX = p.x + p.wx;
        const pY = p.y + p.wy;

        if (pointer.active) {
          const pdx = pX - pointer.x;
          const pdy = pY - pointer.y;
          const dist = Math.hypot(pdx, pdy);
          if (dist < INFLUENCE + 90) {
            const a = (1 - dist / (INFLUENCE + 90)) * 0.52;
            ctx.strokeStyle = `rgba(${cfg.pointerRgb}, ${clamp(a, 0, 0.8)})`;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(pX, pY);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }

        const speed = Math.hypot(p.vx, p.vy);
        const pulse = p.currentPulse || 1;
        const glow = 0.85 + clamp(speed / 3.5, 0, 1.8) * pulse;
        const radius = (p.r + clamp(speed / 4, 0, 1.8)) * pulse;

        // Outer glow
        const gradient = ctx.createRadialGradient(pX, pY, 0, pX, pY, radius * 2.5);
        gradient.addColorStop(0, `rgba(${p.color}, ${clamp(cfg.particleAlpha * p.alpha * glow, 0, 1)})`);
        gradient.addColorStop(0.5, `rgba(${p.color}, ${clamp(cfg.particleAlpha * p.alpha * glow * 0.5, 0, 1)})`);
        gradient.addColorStop(1, `rgba(${p.color}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pX, pY, radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Core particle
        ctx.fillStyle = `rgba(${p.color}, ${clamp(cfg.particleAlpha * p.alpha * glow * 1.2, 0, 1)})`;
        ctx.beginPath();
        ctx.arc(pX, pY, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ---------------- cursor reticle ---------------- */
      if (pointer.active) {
        const spin = elapsed * 0.025;
        ctx.save();
        ctx.translate(pointer.x, pointer.y);

        // Enhanced outer ring with gradient
        const gradient = ctx.createRadialGradient(0, 0, 30, 0, 0, 60);
        gradient.addColorStop(0, `rgba(${cfg.pointerRgb}, 0)`);
        gradient.addColorStop(0.5, `rgba(${cfg.pointerRgb}, 0.15)`);
        gradient.addColorStop(1, `rgba(${cfg.pointerRgb}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.fill();

        // Multiple rotating arcs
        ctx.strokeStyle = `rgba(${cfg.pointerRgb}, 0.42)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 38, spin, spin + Math.PI * 1.4);
        ctx.stroke();

        ctx.strokeStyle = `rgba(${cfg.pointerRgb}, 0.32)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 52, -spin * 1.6, -spin * 1.6 + Math.PI * 0.8);
        ctx.stroke();

        ctx.strokeStyle = `rgba(${cfg.pointerRgb}, 0.22)`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, 68, spin * 0.8, spin * 0.8 + Math.PI * 0.6);
        ctx.stroke();

        // Pulsing core
        const corePulse = 1 + Math.sin(elapsed * 0.1) * 0.3;
        ctx.fillStyle = `rgba(${cfg.pointerRgb}, 0.92)`;
        ctx.beginPath();
        ctx.arc(0, 0, 2.8 * corePulse, 0, Math.PI * 2);
        ctx.fill();

        // Inner glow
        const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
        innerGlow.addColorStop(0, `rgba(${cfg.pointerRgb}, 0.4)`);
        innerGlow.addColorStop(1, `rgba(${cfg.pointerRgb}, 0)`);
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      /* ---------------- shockwaves ---------------- */
      for (let i = bursts.length - 1; i >= 0; i -= 1) {
        const burst = bursts[i];
        burst.life += 0.015 * dt * 1.8;
        burst.radius += 7.5 * dt;
        if (burst.life >= 1) {
          bursts.splice(i, 1);
          continue;
        }
        const a = (1 - burst.life) * 0.6;
        
        // Main shockwave with gradient
        const shockGradient = ctx.createRadialGradient(burst.x, burst.y, burst.radius * 0.8, burst.x, burst.y, burst.radius);
        shockGradient.addColorStop(0, `rgba(${cfg.pointerRgb}, 0)`);
        shockGradient.addColorStop(0.5, `rgba(${cfg.pointerRgb}, ${a * 0.8})`);
        shockGradient.addColorStop(1, `rgba(${cfg.pointerRgb}, 0)`);
        
        ctx.strokeStyle = shockGradient;
        ctx.lineWidth = clamp(4.5 * (1 - burst.life), 0.6, 5);
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, burst.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Secondary ring
        ctx.strokeStyle = `rgba(${cfg.pointerRgb}, ${a * 0.6})`;
        ctx.lineWidth = clamp(2.5 * (1 - burst.life), 0.4, 3);
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, burst.radius * 0.65, 0, Math.PI * 2);
        ctx.stroke();

        // Tertiary ring
        ctx.strokeStyle = `rgba(${cfg.pointerRgb}, ${a * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, burst.radius * 0.35, 0, Math.PI * 2);
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
      
      // Warp-speed snap-back acceleration
      particles.forEach(p => {
        const px = p.x + p.wx;
        const py = p.y + p.wy;
        const pdx = px - e.clientX;
        const pdy = py - e.clientY;
        const dist = Math.hypot(pdx, pdy) || 1;
        const force = 3500 / Math.max(dist, 50);
        p.wvx += (pdx / dist) * force;
        p.wvy += (pdy / dist) * force;
      });
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
      <style>{customStyles}</style>

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
        duration={14}
        reduced={reduced}
      />
      <AuroraBlob
        sx={sdx}
        sy={sdy}
        depth={-0.045}
        variantClass="dv-blob--blue"
        style={{ bottom: '-20%', left: '-12%', width: '46vw', height: '46vw' }}
        duration={17}
        delay={2}
        reduced={reduced}
      />
      <AuroraBlob
        sx={sdx}
        sy={sdy}
        depth={0.08}
        variantClass="dv-blob--pink"
        style={{ top: '30%', left: '36%', width: '34vw', height: '34vw' }}
        duration={20}
        delay={4}
        reduced={reduced}
      />
      <AuroraBlob
        sx={sdx}
        sy={sdy}
        depth={0.03}
        variantClass="dv-blob--mint"
        style={{ bottom: '10%', right: '20%', width: '26vw', height: '26vw' }}
        duration={18}
        delay={3}
        reduced={reduced}
      />
      <AuroraBlob
        sx={sdx}
        sy={sdy}
        depth={0.065}
        variantClass="dv-blob--gold"
        style={{ top: '15%', left: '10%', width: '38vw', height: '38vw' }}
        duration={24}
        delay={1}
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

      {/* Enhanced Travelling light streaks */}
      <div className="dv-streaks">
        {[
          { top: '18%', delay: '0s', dur: '4s', width: '200px' },
          { top: '46%', delay: '3.5s', dur: '5s', width: '150px' },
          { top: '72%', delay: '7s', dur: '3.5s', width: '250px' },
          { top: '28%', delay: '2s', dur: '4.5s', width: '180px' },
          { top: '58%', delay: '5.5s', dur: '3s', width: '220px' },
          { top: '84%', delay: '1.5s', dur: '5.5s', width: '160px' },
        ].map((s, i) => (
          <span key={i} className="dv-streak dv-streak--enhanced" style={{ 
            top: s.top, 
            animationDelay: s.delay, 
            '--s-dur': s.dur, 
            '--s-width': s.width 
          }} />
        ))}
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

      {/* Interactive grid */}
      <div className="dv-aurora__grid dv-aurora__grid--base" />
      <div ref={liveGridRef} className="dv-aurora__grid dv-aurora__grid--live" />

      {/* Floating ambient particles (12) */}
      <div className="dv-ambient-particles">
        {[
          { l: '10%', t: '20%', d: '0s', dur: '15s' },
          { l: '30%', t: '60%', d: '2s', dur: '18s' },
          { l: '70%', t: '30%', d: '4s', dur: '12s' },
          { l: '85%', t: '70%', d: '1s', dur: '20s' },
          { l: '50%', t: '85%', d: '3s', dur: '16s' },
          { l: '15%', t: '75%', d: '5s', dur: '14s' },
          { l: '40%', t: '15%', d: '1.5s', dur: '17s' },
          { l: '80%', t: '10%', d: '3.5s', dur: '19s' },
          { l: '90%', t: '45%', d: '0.5s', dur: '13s' },
          { l: '60%', t: '55%', d: '4.5s', dur: '15s' },
          { l: '25%', t: '35%', d: '2.5s', dur: '21s' },
          { l: '5%', t: '50%', d: '6s', dur: '16s' },
        ].map((p, i) => (
          <span key={i} className="dv-ambient-particle" style={{ 
            left: p.l, top: p.t, animationDelay: p.d, animationDuration: p.dur,
            transform: `scale(${0.5 + (i % 3) * 0.3})`,
            opacity: 0.4 + (i % 2) * 0.3
          }} />
        ))}
      </div>

      {/* Enhanced CSS Layers */}
      {!reduced && (
        <>
          {/* DNA Helix */}
          <div className="absolute top-[20%] right-[8%] w-12 h-48 flex flex-col justify-between opacity-40 mix-blend-screen pointer-events-none" style={{ perspective: '300px', zIndex: 5 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="relative w-full h-1 my-1.5" style={{ transformStyle: 'preserve-3d', animation: `dna-spin 4s linear infinite`, animationDelay: `-${i * 0.3}s` }}>
                <div className="absolute left-0 w-2.5 h-2.5 rounded-full bg-[#22BDDC]" style={{ transform: 'translateZ(15px)' }}/>
                <div className="absolute right-0 w-2.5 h-2.5 rounded-full bg-[#9A6BFA]" style={{ transform: 'translateZ(-15px)' }}/>
                <div className="absolute top-1/2 left-2.5 right-2.5 h-px bg-white/20" />
              </div>
            ))}
          </div>

          {/* Floating code symbols */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
            {['< />', '{ }', '()', '[]', '=>', ';;', '</>', '&&', '||'].map((sym, i) => (
              <div key={i} className="absolute text-[#4F8EF7]/25 font-mono text-2xl font-bold"
                  style={{
                    left: `${10 + (i * 12)}%`,
                    bottom: '-10%',
                    animation: `float-up ${15 + (i % 4) * 4}s linear infinite`,
                    animationDelay: `${i * 1.2}s`
                  }}>
                {sym}
              </div>
            ))}
          </div>

          {/* Holographic scan line */}
          <div className="dv-scan-line" />

          {/* Pulsing energy rings */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="absolute rounded-full border border-[#2BC49A]/30"
                  style={{
                    left: `${20 + (i * 25)}%`,
                    top: `${30 + (i % 2) * 30}%`,
                    width: '80px', height: '80px',
                    transform: 'translate(-50%, -50%)',
                    animation: `pulse-ring ${8 + i * 3}s cubic-bezier(0.215, 0.61, 0.355, 1) infinite`,
                    animationDelay: `${i * 1.5}s`
                  }} />
            ))}
          </div>

          {/* Screen edge glow */}
          <div className="dv-screen-glow" />
        </>
      )}

      {/* Soft halo trailing the cursor */}
      <motion.div className="dv-aurora__halo" style={{ x: haloX, y: haloY, zIndex: 20 }} />
    </div>
  );
}
