import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Telemetry logs
const TELEMETRY_LOGS = [
  { threshold: 0, text: '[BOOT]: Initializing DevAstra Neural Kernel...' },
  { threshold: 26, text: '[LINK]: Calibrating Academia–Industry Skill Vector Engine...' },
  { threshold: 56, text: '[SYNC]: Loading Career Readiness & Telemetry Matrix...' },
  { threshold: 86, text: '[READY]: Synthesizing personalized career dashboard...' },
  { threshold: 100, text: '[SYSTEM LIVE]: Welcome to DevAstra.' },
];

export default function DevAstraPreloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState(TELEMETRY_LOGS[0].text);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const canvasRef = useRef(null);
  
  // Finish preloader
  const completePreloader = useCallback(() => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 600); // Wait for fade-out animation
  }, [onComplete]);

  // Skip functionality removed as per user request

  // Progress logic (0 to 100 in 8s)
  useEffect(() => {
    if (isFadingOut) return;
    
    let startTime = null;
    const duration = 8000; // 8 seconds
    
    const animateProgress = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const newProgress = Math.min(Math.floor((elapsed / duration) * 100), 100);
      
      setProgress(newProgress);
      
      // Update log based on progress
      const logEntry = [...TELEMETRY_LOGS].reverse().find(log => newProgress >= log.threshold);
      if (logEntry) setCurrentLog(logEntry.text);
      
      if (newProgress < 100) {
        requestAnimationFrame(animateProgress);
      } else {
        setTimeout(() => {
          completePreloader();
        }, 500); // Brief pause at 100% before fade out
      }
    };
    
    const req = requestAnimationFrame(animateProgress);
    return () => cancelAnimationFrame(req);
  }, [isFadingOut, completePreloader]);

  // Canvas particle logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let mouse = { x: null, y: null, radius: 100 };
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    const handleMouseMove = (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    };
    
    const handleTouchMove = (e) => {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 20) + 1;
        this.color = Math.random() > 0.5 ? 'rgba(217, 175, 103, 0.4)' : 'rgba(232, 200, 130, 0.4)';
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      
      update() {
        if (mouse.x != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          let maxDistance = mouse.radius;
          let force = (maxDistance - distance) / maxDistance;
          let directionX = forceDirectionX * force * this.density;
          let directionY = forceDirectionY * force * this.density;
          
          if (distance < mouse.radius) {
            this.x -= directionX;
            this.y -= directionY;
          } else {
            if (this.x !== this.baseX) {
              let dx = this.x - this.baseX;
              this.x -= dx / 10;
            }
            if (this.y !== this.baseY) {
              let dy = this.y - this.baseY;
              this.y -= dy / 10;
            }
          }
        }
        this.draw();
      }
    }
    
    const initParticles = () => {
      particles = [];
      const numberOfParticles = Math.min((canvas.width * canvas.height) / 8000, 200);
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    
    initParticles();
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Compute progress bar color
  const getProgressColor = () => {
    if (progress < 50) return '#D9AF67'; // Amber/Gold base
    if (progress < 85) return '#E8C882'; // Lighter gold
    return '#10B981'; // Emerald for success/complete
  };

  return (
    <AnimatePresence>
      {!isFadingOut && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden font-sans"
          style={{ background: 'radial-gradient(circle at center, #0A0F1D 0%, #050811 100%)' }}
        >
          {/* Particle Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-auto"
            style={{ zIndex: 0 }}
          />

          {/* Full Screen Background Video */}
          <video 
            src="/video.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline 
            poster="/logo1.png"
            className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-20"
            style={{ zIndex: 1, filter: 'grayscale(100%) contrast(1.2)' }}
          />

          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl px-6">
            
            {/* Skip Button Removed */}


            {/* Counter & Progress Bar Container */}
            <div className="w-full flex flex-col items-center gap-6">
              {/* Tabular Percentage */}
              <motion.div 
                className="text-6xl font-mono tracking-tighter font-light text-white tabular-nums"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {progress}<span className="text-4xl text-gray-500">%</span>
              </motion.div>

              {/* Progress Track */}
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative backdrop-blur-md">
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: getProgressColor(),
                    boxShadow: `0 0 10px ${getProgressColor()}`,
                  }}
                  layout
                  transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
                />
              </div>

              {/* Telemetry Logs */}
              <div className="h-6 mt-2 overflow-hidden flex justify-center w-full">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentLog}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-mono text-amber-400/80 tracking-widest uppercase text-center"
                  >
                    {currentLog}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
