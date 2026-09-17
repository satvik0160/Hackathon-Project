import React, { useEffect, useRef } from 'react';

const InteractiveMesh = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width, height;
    let mouse = { x: -1000, y: -1000 };
    let time = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleResize = () => resize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.005;

      const spacing = 50;
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const points = [];

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;

          // Create organic movement using sine/cosine waves
          const offsetX = Math.sin(time + (j * 0.3)) * 15;
          const offsetY = Math.cos(time + (i * 0.3)) * 15;

          // Mouse interaction: repel points
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const force = Math.max(0, (200 - dist) / 200);
          const moveX = (dx / dist) * force * 50;
          const moveY = (dy / dist) * force * 50;

          points.push({
            x: x + offsetX + moveX,
            y: y + offsetY + moveY,
            baseX: x,
            baseY: y,
            dist: dist
          });
        }
      }

      ctx.lineWidth = 0.8;
      
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        
        // Only check a few neighbors for performance
        const neighbors = [
          { col: i % cols + 1, row: Math.floor(i / cols) },
          { col: i % cols, row: Math.floor(i / cols) + 1 }
        ];

        neighbors.forEach(n => {
          const index = n.row * cols + n.col;
          if (index < points.length) {
            const p2 = points[index];
            const d = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
            
            if (d < spacing * 1.5) {
              // Color based on proximity to mouse and global time
              const opacity = Math.max(0.1, 1 - d / (spacing * 1.5));
              const hue = (220 + Math.sin(time * 0.5) * 30 + (p1.dist / 10)) % 360;
              ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${opacity * 0.4})`;
              
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        });
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none opacity-60"
      style={{ filter: 'blur(1px)' }}
    />
  );
};

export default InteractiveMesh;
