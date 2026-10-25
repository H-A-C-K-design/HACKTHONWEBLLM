import { useEffect, useRef, useMemo, useCallback } from 'react';

/**
 * AnimatedBackground — Game-scene background with multiple layers.
 * Variants: 'home' (full intensity), 'auth' (medium), 'dashboard' (low).
 */
export default function AnimatedBackground({ variant = 'home' }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const hexagonsRef = useRef([]);
  const streaksRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const reducedMotion = useRef(false);

  const config = useMemo(() => {
    const configs = {
      home: { particles: 50, hexagons: 8, streaks: 6, gridOpacity: 0.12, glowIntensity: 1 },
      auth: { particles: 30, hexagons: 5, streaks: 3, gridOpacity: 0.06, glowIntensity: 0.6 },
      dashboard: { particles: 20, hexagons: 3, streaks: 2, gridOpacity: 0.04, glowIntensity: 0.3 },
    };
    return configs[variant] || configs.home;
  }, [variant]);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Initialize particles
  const initParticles = useCallback((width, height) => {
    const isMobile = width < 768;
    const count = isMobile ? Math.floor(config.particles * 0.5) : config.particles;
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      gold: Math.random() > 0.6,
    }));
  }, [config.particles]);

  // Initialize hexagons
  const initHexagons = useCallback((width, height) => {
    hexagonsRef.current = Array.from({ length: config.hexagons }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 40 + 20,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      vy: -(Math.random() * 0.3 + 0.1),
      opacity: Math.random() * 0.12 + 0.03,
      filled: Math.random() > 0.6,
    }));
  }, [config.hexagons]);

  // Initialize streaks
  const initStreaks = useCallback((width, height) => {
    streaksRef.current = Array.from({ length: config.streaks }, () => ({
      x: Math.random() * width,
      y: Math.random() * -height,
      length: Math.random() * 80 + 40,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.15 + 0.05,
    }));
  }, [config.streaks]);

  // Draw hex shape
  const drawHex = useCallback((ctx, cx, cy, size, rotation) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = size * Math.cos(angle);
      const y = size * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
      initHexagons(canvas.width, canvas.height);
      initStreaks(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse);

    // Check tab visibility
    let visible = true;
    const handleVisibility = () => { visible = !document.hidden; };
    document.addEventListener('visibilitychange', handleVisibility);

    let time = 0;

    const animate = () => {
      if (!visible || reducedMotion.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      time += 0.005;

      // Layer 1: Radial golden glows
      const glowX = width * 0.3 + Math.sin(time * 0.5) * width * 0.1;
      const glowY = height * 0.4 + Math.cos(time * 0.3) * height * 0.1;
      const grad1 = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, width * 0.4);
      grad1.addColorStop(0, `rgba(212, 175, 55, ${0.06 * config.glowIntensity})`);
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const glow2X = width * 0.7 + Math.cos(time * 0.4) * width * 0.08;
      const glow2Y = height * 0.6 + Math.sin(time * 0.6) * height * 0.08;
      const grad2 = ctx.createRadialGradient(glow2X, glow2Y, 0, glow2X, glow2Y, width * 0.3);
      grad2.addColorStop(0, `rgba(212, 175, 55, ${0.04 * config.glowIntensity})`);
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Layer 2: Perspective grid (synthwave floor)
      if (config.gridOpacity > 0) {
        ctx.save();
        ctx.globalAlpha = config.gridOpacity;
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.lineWidth = 0.5;

        const horizonY = height * 0.45;
        const gridOffset = (time * 50) % 60;

        // Horizontal lines
        for (let i = 0; i < 15; i++) {
          const t = i / 15;
          const y = horizonY + (height - horizonY) * Math.pow(t, 1.5) + gridOffset * t;
          if (y > height) continue;
          ctx.beginPath();
          const spread = 1 + t * 2;
          ctx.moveTo(width * 0.5 - width * spread * 0.5, y);
          ctx.lineTo(width * 0.5 + width * spread * 0.5, y);
          ctx.stroke();
        }

        // Vertical lines (converging to vanishing point)
        for (let i = -8; i <= 8; i++) {
          ctx.beginPath();
          ctx.moveTo(width * 0.5, horizonY);
          ctx.lineTo(width * 0.5 + i * width * 0.15, height);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Layer 3: Floating hexagons
      hexagonsRef.current.forEach((hex) => {
        hex.y += hex.vy;
        hex.rotation += hex.rotSpeed;
        if (hex.y + hex.size < 0) {
          hex.y = height + hex.size;
          hex.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = hex.opacity;
        drawHex(ctx, hex.x, hex.y, hex.size, hex.rotation);
        if (hex.filled) {
          ctx.fillStyle = 'rgba(212, 175, 55, 0.05)';
          ctx.fill();
        }
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });

      // Layer 4: Particles with links
      const particles = particlesRef.current;
      particles.forEach((p) => {
        // Mouse repulse
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120 * 0.5;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Wrap
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(212, 175, 55, ${p.opacity})`
          : `rgba(255, 255, 255, ${p.opacity * 0.6})`;
        ctx.fill();
      });

      // Particle links (neural network look)
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.06)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.globalAlpha = (1 - dist / 120) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Layer 5: Light streaks / data rain
      streaksRef.current.forEach((s) => {
        s.y += s.speed;
        if (s.y > height + s.length) {
          s.y = -s.length;
          s.x = Math.random() * width;
        }

        const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.length);
        grad.addColorStop(0, `rgba(212, 175, 55, ${s.opacity})`);
        grad.addColorStop(1, 'transparent');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + s.length);
        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [config, initParticles, initHexagons, initStreaks, drawHex]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
        }}
      />
      {/* Vignette overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(11,11,13,0.4) 70%, rgba(11,11,13,0.8) 100%)',
        }}
      />
    </>
  );
}
