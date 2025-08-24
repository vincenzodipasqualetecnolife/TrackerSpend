import React, { useEffect, useRef } from 'react';

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

const ParticleEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Imposta le dimensioni del canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Gestisce il movimento del mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      
      // Crea particelle al movimento del mouse
      if (Math.random() < 0.3) {
        createParticle(e.clientX, e.clientY);
      }
    };

    const createParticle = (x: number, y: number) => {
      const colors = [
        'hsl(250, 70%, 60%)',
        'hsl(280, 70%, 60%)',
        'hsl(320, 70%, 60%)',
        'hsl(200, 70%, 60%)'
      ];
      
      const particle: Particle = {
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        maxLife: Math.random() * 100 + 50
      };
      
      particlesRef.current.push(particle);
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationId: number;

    const animate = () => {
      // Pulisci il canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Aggiorna e disegna particelle
      particlesRef.current = particlesRef.current.filter(particle => {
        // Aggiorna vita
        particle.life++;
        if (particle.life > particle.maxLife) return false;

        // Aggiorna posizione
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Attrito
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Riduci opacità nel tempo
        const lifeRatio = particle.life / particle.maxLife;
        particle.opacity = (1 - lifeRatio) * 0.5;

        // Disegna particella
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        
        // Glow effect
        const glowGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4
        );
        glowGradient.addColorStop(0, particle.color);
        glowGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Particella centrale
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();

        return true;
      });

      // Disegna connessioni tra particelle vicine
      particlesRef.current.forEach((particle1, i) => {
        particlesRef.current.slice(i + 1).forEach(particle2 => {
          const dx = particle1.x - particle2.x;
          const dy = particle1.y - particle2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 80) {
            const opacity = (80 - distance) / 80 * 0.1 * Math.min(particle1.opacity, particle2.opacity);
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = '#8A2BE2';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle1.x, particle1.y);
            ctx.lineTo(particle2.x, particle2.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-10"
    />
  );
};

export default ParticleEffect;
