import React, { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ParticleSystemProps {
  particleCount?: number;
  enabled?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  colors?: string[];
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  particleCount = 50,
  enabled = true,
  intensity = 'medium',
  colors = ['#6366f1', '#8b5cf6', '#3b82f6', '#a855f7']
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const { actualTheme } = useTheme();

  const intensitySettings = {
    low: { speed: 0.5, size: 2, opacity: 0.3 },
    medium: { speed: 1, size: 3, opacity: 0.5 },
    high: { speed: 1.5, size: 4, opacity: 0.7 }
  };

  const settings = intensitySettings[intensity];

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * settings.speed,
      vy: (Math.random() - 0.5) * settings.speed,
      size: Math.random() * settings.size + 1,
      opacity: Math.random() * settings.opacity,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: Math.random() * 100,
      maxLife: 100 + Math.random() * 100
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Update opacity based on life
        const lifeRatio = particle.life / particle.maxLife;
        particle.opacity = settings.opacity * (1 - lifeRatio) * 0.8;

        // Reset particle if life exceeded
        if (particle.life >= particle.maxLife) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.life = 0;
          particle.opacity = Math.random() * settings.opacity;
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Add glow effect
        ctx.save();
        ctx.globalAlpha = particle.opacity * 0.3;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Connect nearby particles
      particlesRef.current.forEach((particleA) => {
        particlesRef.current.forEach((particleB) => {
          if (particleA !== particleB) {
            const dx = particleA.x - particleB.x;
            const dy = particleA.y - particleB.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              const opacity = (1 - distance / 100) * 0.2;
              ctx.save();
              ctx.globalAlpha = opacity;
              ctx.strokeStyle = actualTheme === 'dark' ? '#6366f1' : '#8b5cf6';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(particleA.x, particleA.y);
              ctx.lineTo(particleB.x, particleB.y);
              ctx.stroke();
              ctx.restore();
            }
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, particleCount, intensity, colors, actualTheme, settings]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        mixBlendMode: actualTheme === 'dark' ? 'screen' : 'multiply',
        opacity: 0.6
      }}
    />
  );
};