// ParticleBackground.jsx
// Pure canvas-based particle field — no three.js required.
// Particles float organically and are gently attracted toward the cursor.

import { useRef, useEffect } from 'react';

const COLORS = ['#5FA8FF', '#8E7CFF', '#FF8FB8', '#B7A8FF', '#8FDFFF'];

export default function ParticleBackground({ className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let mouse = { x: 9999, y: 9999 };
    const interactionRadius = 200;

    // Resize canvas to fill container
    function resize() {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Generate particles
    const count = window.innerWidth < 640 ? 180 : 400;
    const particles = [];

    for (let i = 0; i < count; i++) {
      const t = Math.pow(Math.random(), 0.6);
      const maxR = Math.min(canvas.width, canvas.height) * 0.42;
      const r = t * maxR;
      const angle = Math.random() * Math.PI * 2;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      particles.push({
        x,
        y,
        ox: x,
        oy: y,
        vx: 0,
        vy: 0,
        size: 2 + Math.random() * 1.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.4,
      });
    }

    // Mouse tracking
    function handleMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function handleLeave() {
      mouse.x = 9999;
      mouse.y = 9999;
    }
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseleave', handleLeave);

    // Animation loop
    let lastTime = performance.now();

    function animate(now) {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const springK = 0.03;
      const damping = 0.88;

      for (const p of particles) {
        // Organic breathing float
        p.phase += delta * p.speed;
        const breatheX = p.ox + Math.cos(p.phase) * 3;
        const breatheY = p.oy + Math.sin(p.phase * 1.3) * 3;

        // Cursor interaction — gentle magnetic pull
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let ax = 0;
        let ay = 0;
        if (dist < interactionRadius) {
          const force = (1 - dist / interactionRadius) * 0.8;
          ax = dx * force * 0.02;
          ay = dy * force * 0.02;
        }

        // Spring back to breathing position
        const springX = (breatheX - p.x) * springK;
        const springY = (breatheY - p.y) * springK;

        p.vx = (p.vx + springX + ax) * damping;
        p.vy = (p.vy + springY + ay) * damping;
        p.x += p.vx;
        p.y += p.vy;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.5;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    }

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
