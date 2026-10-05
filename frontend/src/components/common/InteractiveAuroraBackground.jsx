import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

const VARIANTS = {
  app: {
    backdrop: ['#0B1020', '#04060F'],
    colors: ['124, 108, 255', '79, 142, 247', '232, 111, 214', '43, 196, 154', '217, 175, 103'],
  },
  auth: {
    backdrop: ['#0B1020', '#04060F'],
    colors: ['150, 140, 255', '79, 142, 247', '240, 111, 214', '43, 196, 154', '217, 175, 103'],
  },
};

export default function InteractiveAuroraBackground({ variant = 'app' }) {
  const cfg = VARIANTS[variant] || VARIANTS.app;
  const reduced = useReducedMotion();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let rafId = null;
    let stars = [];
    let shootingStars = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Initialize static stars
      stars = Array.from({ length: Math.floor((width * height) / 6000) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.0 + 0.8, // Increased radius
        alpha: Math.random() * 0.6 + 0.4, // Increased base opacity
        blinkSpeed: Math.random() * 0.02 + 0.005,
      }));
    };

    window.addEventListener('resize', resize);
    resize();

    let last = performance.now();

    const drawFrame = (now) => {
      rafId = requestAnimationFrame(drawFrame);
      let dt = (now - last) / 16.6667;
      last = now;
      if (dt > 3) dt = 3;

      const isLightMode = !document.documentElement.classList.contains('dark');
      
      // Dynamic colors based on theme
      const bgCenter = isLightMode ? '#ffffff' : cfg.backdrop[0];
      const bgEdge = isLightMode ? '#f8fafc' : cfg.backdrop[1];
      const starRgb = isLightMode ? '15, 23, 42' : '255, 255, 255'; // Dark slate for light mode

      // Draw backdrop gradient
      const grad = ctx.createRadialGradient(
        width * 0.5, height * 0.35, 0,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.85
      );
      grad.addColorStop(0, bgCenter);
      grad.addColorStop(1, bgEdge);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw static stars
      if (!reduced) {
        stars.forEach(star => {
          star.alpha += star.blinkSpeed * dt;
          if (star.alpha > 1.0 || star.alpha < 0.3) {
            star.blinkSpeed *= -1;
          }
          ctx.fillStyle = `rgba(${starRgb}, ${star.alpha})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Spawn shooting stars
        if (Math.random() < 0.035) { // 3.5% chance per frame
          const isLeftToRight = Math.random() > 0.5;
          const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
          shootingStars.push({
            x: isLeftToRight ? -50 : width + 50,
            y: Math.random() * (height * 0.6), // Spawn in upper 60%
            vx: (isLeftToRight ? 1 : -1) * (18 + Math.random() * 12),
            vy: 2 + Math.random() * 4, // Always go downwards slightly
            life: 1,
            color,
          });
        }

        // Draw shooting stars
        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const c = shootingStars[i];
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          c.life -= 0.012 * dt;
          
          if (c.life <= 0) {
            shootingStars.splice(i, 1);
            continue;
          }

          const tailLength = 140 * c.life;
          const speed = Math.hypot(c.vx, c.vy);
          const tailX = c.x - (c.vx / speed) * tailLength;
          const tailY = c.y - (c.vy / speed) * tailLength;

          const sGrad = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
          sGrad.addColorStop(0, `rgba(${c.color}, ${c.life})`);
          sGrad.addColorStop(1, `rgba(${c.color}, 0)`);

          ctx.strokeStyle = sGrad;
          ctx.lineWidth = 4.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          // Star head
          ctx.fillStyle = `rgba(${starRgb}, ${c.life})`;
          ctx.beginPath();
          ctx.arc(c.x, c.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Reduced motion: Just draw static stars without blinking
        stars.forEach(star => {
          ctx.fillStyle = `rgba(${starRgb}, 0.8)`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    };

    rafId = requestAnimationFrame(drawFrame);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [cfg, reduced]);

  return (
    <div className={`dv-aurora dv-aurora--${variant}`} role="presentation" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
