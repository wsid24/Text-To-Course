import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    let particles = [];
    let mouse = { x: -1000, y: -1000, radius: 180 };

    const emerald = '16, 185, 129';
    const gold = '212, 175, 55';
    
    const initParticles = () => {
      particles = [];
      // Responsive particle count
      const numParticles = Math.floor((canvas.width * canvas.height) / 18000);
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 4 + 3,
          isGold: Math.random() > 0.7, // 30% gold, 70% emerald
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.02
        });
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleMouseOut = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);
    
    resizeCanvas();

    const drawHexagon = (x, y, radius, rotation, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Extract rgb values to add fill opacity
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        ctx.fillStyle = `rgba(${match[1]}, ${match[2]}, ${match[3]}, 0.2)`;
        ctx.fill();
      }
      ctx.restore();
    };

    const drawBackground = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
      const baseAlpha = isLightMode ? 0.7 : 0.5;
      const lineAlpha = isLightMode ? 0.3 : 0.15;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        
        // Move
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;

        // Bounce off walls
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Anti-gravity repulsion from mouse
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          // Inverse squareish falloff for smooth repulsion
          const force = (mouse.radius - distance) / mouse.radius;
          const pushX = forceDirectionX * force * 5;
          const pushY = forceDirectionY * force * 5;
          
          p.x += pushX;
          p.y += pushY;
        }

        // Draw node
        const rgb = p.isGold ? gold : emerald;
        const color = `rgba(${rgb}, ${baseAlpha})`;
        
        drawHexagon(p.x, p.y, p.size, p.rotation, color);

        // Constellation lines
        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          
          if (distance2 < 120) {
            const opacity = (1 - distance2 / 120) * lineAlpha;
            // Mixed color line if they are different
            ctx.beginPath();
            ctx.strokeStyle = p.isGold 
              ? `rgba(${gold}, ${opacity})` 
              : `rgba(${emerald}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = window.requestAnimationFrame(drawBackground);
    };

    drawBackground();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0, 
      }}
    />
  );
}
