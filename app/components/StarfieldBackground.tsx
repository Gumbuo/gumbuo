"use client";
import { useEffect, useRef } from "react";

interface BurnMark {
  x: number;
  y: number;
  radius: number;
  createdAt: number;
  fadeDuration: number;
  color: string;
}

interface LaserBeam {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  createdAt: number;
  color: string;
  intensity: number;
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Star layers with different speeds for parallax
    const starLayers = [
      { stars: generateStars(50, 2, 3), speed: 0.1, color: "#00ff99" }, // Close green stars
      { stars: generateStars(100, 1, 2), speed: 0.05, color: "#00ffff" }, // Mid cyan stars
      { stars: generateStars(150, 0.5, 1.5), speed: 0.02, color: "#ffffff" }, // Far white stars
    ];

    function generateStars(count: number, minSize: number, maxSize: number) {
      return Array.from({ length: count }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        size: Math.random() * (maxSize - minSize) + minSize,
        opacity: Math.random() * 0.5 + 0.5,
      }));
    }

    // Nebula particles
    const nebulae = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas!.width,
      y: Math.random() * canvas!.height,
      radius: Math.random() * 100 + 50,
      color: Math.random() > 0.5 ? "rgba(138, 43, 226, 0.1)" : "rgba(0, 255, 153, 0.1)",
      speedX: (Math.random() - 0.5) * 0.1,
      speedY: (Math.random() - 0.5) * 0.1,
    }));

    // UFO configurations with colors
    const ufos = [
      {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        baseSpeed: 2,
        angle: Math.random() * Math.PI * 2,
        wobbleOffset: 0,
        targetAngle: Math.random() * Math.PI * 2,
        tilt: 0,
        color: { name: 'green', beam: [0, 255, 153], body: '#00ffaa', dark: '#1a4d4d', dome: 'rgba(0, 255, 200, 0.3)' },
        lastLaserTime: 0,
      },
      {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        baseSpeed: 1.5,
        angle: Math.random() * Math.PI * 2,
        wobbleOffset: Math.PI,
        targetAngle: Math.random() * Math.PI * 2,
        tilt: 0,
        color: { name: 'blue', beam: [0, 150, 255], body: '#0088ff', dark: '#1a3d4d', dome: 'rgba(0, 150, 255, 0.3)' },
        lastLaserTime: 0,
      },
      {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        baseSpeed: 1.8,
        angle: Math.random() * Math.PI * 2,
        wobbleOffset: Math.PI * 1.5,
        targetAngle: Math.random() * Math.PI * 2,
        tilt: 0,
        color: { name: 'red', beam: [255, 50, 50], body: '#ff3333', dark: '#4d1a1a', dome: 'rgba(255, 100, 100, 0.3)' },
        lastLaserTime: 0,
      },
      {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        baseSpeed: 2.2,
        angle: Math.random() * Math.PI * 2,
        wobbleOffset: Math.PI * 0.5,
        targetAngle: Math.random() * Math.PI * 2,
        tilt: 0,
        color: { name: 'orange', beam: [255, 165, 0], body: '#ff9933', dark: '#4d3d1a', dome: 'rgba(255, 165, 0, 0.3)' },
        lastLaserTime: 0,
      },
      {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        baseSpeed: 1.7,
        angle: Math.random() * Math.PI * 2,
        wobbleOffset: Math.PI * 1.2,
        targetAngle: Math.random() * Math.PI * 2,
        tilt: 0,
        color: { name: 'yellow', beam: [255, 255, 0], body: '#ffff33', dark: '#4d4d1a', dome: 'rgba(255, 255, 150, 0.3)' },
        lastLaserTime: 0,
      },
    ];

    // Burn marks and laser beams tracking
    const burnMarks: BurnMark[] = [];
    const laserBeams: LaserBeam[] = [];

    // Function to draw enhanced UFO
    const drawEnhancedUFO = (ufo: typeof ufos[0]) => {
      ctx!.save();
      ctx!.translate(ufo.x, ufo.y);

      // Light beam (subtle)
      const beamGradient = ctx!.createLinearGradient(0, 0, 0, 240);
      beamGradient.addColorStop(0, `rgba(${ufo.color.beam[0]}, ${ufo.color.beam[1]}, ${ufo.color.beam[2]}, 0.15)`);
      beamGradient.addColorStop(1, `rgba(${ufo.color.beam[0]}, ${ufo.color.beam[1]}, ${ufo.color.beam[2]}, 0)`);
      ctx!.fillStyle = beamGradient;
      ctx!.beginPath();
      ctx!.moveTo(-32, 0);
      ctx!.lineTo(32, 0);
      ctx!.lineTo(60, 240);
      ctx!.lineTo(-60, 240);
      ctx!.closePath();
      ctx!.fill();

      // Shadow beneath UFO for depth
      ctx!.beginPath();
      ctx!.ellipse(0, 5 + ufo.tilt * 20, 105, 42, 0, 0, Math.PI * 2);
      ctx!.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx!.fill();

      // UFO body (saucer) - metallic effect
      ctx!.beginPath();
      ctx!.ellipse(0, ufo.tilt * 20, 100, 40, 0, 0, Math.PI * 2);
      const saucerGradient = ctx!.createLinearGradient(-100, -20, 100, 20);
      saucerGradient.addColorStop(0, ufo.color.dark);
      saucerGradient.addColorStop(0.3, ufo.color.body);
      saucerGradient.addColorStop(0.5, '#ffffff');
      saucerGradient.addColorStop(0.7, ufo.color.body);
      saucerGradient.addColorStop(1, ufo.color.dark);
      ctx!.fillStyle = saucerGradient;
      ctx!.fill();

      // Panel lines for detail
      ctx!.strokeStyle = ufo.color.dark;
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.ellipse(0, ufo.tilt * 20, 80, 32, 0, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.ellipse(0, ufo.tilt * 20, 60, 24, 0, 0, Math.PI * 2);
      ctx!.stroke();

      // Bottom detail ring
      ctx!.beginPath();
      ctx!.ellipse(0, 8 + ufo.tilt * 20, 95, 35, 0, 0, Math.PI);
      ctx!.strokeStyle = ufo.color.dark;
      ctx!.lineWidth = 2;
      ctx!.stroke();

      // UFO dome - glass-like effect
      ctx!.beginPath();
      ctx!.ellipse(0, -12 + ufo.tilt * 12, 48, 32, 0, Math.PI, 0);
      const domeGradient = ctx!.createRadialGradient(0, -20, 0, 0, -20, 48);
      domeGradient.addColorStop(0, ufo.color.dome);
      domeGradient.addColorStop(0.7, ufo.color.dome);
      domeGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      ctx!.fillStyle = domeGradient;
      ctx!.fill();

      // Dome highlight (reflection)
      ctx!.beginPath();
      ctx!.ellipse(-15, -25 + ufo.tilt * 8, 12, 8, 0, 0, Math.PI * 2);
      ctx!.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx!.fill();

      // Glowing lights with halos
      const lights = [-60, -20, 20, 60];
      lights.forEach((x, i) => {
        const pulse = Math.sin(Date.now() * 0.01 + i) * 0.5 + 0.5;

        // Halo
        ctx!.beginPath();
        ctx!.arc(x, 0, 12, 0, Math.PI * 2);
        const haloGradient = ctx!.createRadialGradient(x, 0, 0, x, 0, 12);
        haloGradient.addColorStop(0, `rgba(255, 200, 0, ${pulse * 0.5})`);
        haloGradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
        ctx!.fillStyle = haloGradient;
        ctx!.fill();

        // Light
        ctx!.beginPath();
        ctx!.arc(x, 0, 8, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 220, 0, ${pulse})`;
        ctx!.shadowBlur = 40;
        ctx!.shadowColor = "#ffcc00";
        ctx!.fill();
        ctx!.shadowBlur = 0;

        // Light reflection on body
        ctx!.beginPath();
        ctx!.arc(x, 2, 4, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${pulse * 0.3})`;
        ctx!.fill();
      });

      ctx!.restore();
    };

    let animationFrameId: number;

    const animate = () => {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Draw nebulae
      nebulae.forEach((nebula) => {
        const gradient = ctx!.createRadialGradient(
          nebula.x,
          nebula.y,
          0,
          nebula.x,
          nebula.y,
          nebula.radius
        );
        gradient.addColorStop(0, nebula.color);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx!.fillStyle = gradient;
        ctx!.fillRect(
          nebula.x - nebula.radius,
          nebula.y - nebula.radius,
          nebula.radius * 2,
          nebula.radius * 2
        );

        // Move nebula
        nebula.x += nebula.speedX;
        nebula.y += nebula.speedY;

        // Wrap around
        if (nebula.x < -nebula.radius) nebula.x = canvas!.width + nebula.radius;
        if (nebula.x > canvas!.width + nebula.radius) nebula.x = -nebula.radius;
        if (nebula.y < -nebula.radius) nebula.y = canvas!.height + nebula.radius;
        if (nebula.y > canvas!.height + nebula.radius) nebula.y = -nebula.radius;
      });

      const currentTime = Date.now();

      // Update and draw all UFOs
      ufos.forEach((ufo) => {
        // Smooth angle interpolation
        let angleDiff = ufo.targetAngle - ufo.angle;
        if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        ufo.angle += angleDiff * 0.02;

        // Occasionally change direction
        if (Math.random() < 0.01) {
          ufo.targetAngle = Math.random() * Math.PI * 2;
        }

        // Add wobble for natural movement
        ufo.wobbleOffset += 0.05;
        const wobbleX = Math.sin(ufo.wobbleOffset) * 0.5;
        const wobbleY = Math.cos(ufo.wobbleOffset * 0.7) * 0.3;

        // Update position with wobble
        ufo.x += Math.cos(ufo.angle) * ufo.baseSpeed + wobbleX;
        ufo.y += Math.sin(ufo.angle) * ufo.baseSpeed + wobbleY;

        // Calculate tilt based on movement direction
        ufo.tilt = Math.cos(ufo.angle) * 0.3;

        // Wrap around screen
        if (ufo.x < -100) ufo.x = canvas!.width + 100;
        if (ufo.x > canvas!.width + 100) ufo.x = -100;
        if (ufo.y < -100) ufo.y = canvas!.height + 100;
        if (ufo.y > canvas!.height + 100) ufo.y = -100;

        // Randomly shoot laser (5% chance every 3 seconds minimum)
        if (currentTime - ufo.lastLaserTime > 3000 && Math.random() < 0.05) {
          const targetX = Math.random() * canvas!.width;
          const targetY = Math.random() * canvas!.height;

          // Create laser beam
          laserBeams.push({
            fromX: ufo.x,
            fromY: ufo.y,
            toX: targetX,
            toY: targetY,
            createdAt: currentTime,
            color: `rgb(${ufo.color.beam[0]}, ${ufo.color.beam[1]}, ${ufo.color.beam[2]})`,
            intensity: 1,
          });

          // Create burn mark
          burnMarks.push({
            x: targetX,
            y: targetY,
            radius: 20 + Math.random() * 30,
            createdAt: currentTime,
            fadeDuration: 5000 + Math.random() * 3000, // 5-8 seconds
            color: ufo.color.body,
          });

          ufo.lastLaserTime = currentTime;
        }

        drawEnhancedUFO(ufo);
      });

      // Draw laser beams (only last 200ms)
      laserBeams.forEach((laser, index) => {
        const age = currentTime - laser.createdAt;
        if (age > 200) {
          laserBeams.splice(index, 1);
          return;
        }

        const alpha = 1 - (age / 200);
        ctx!.strokeStyle = laser.color;
        ctx!.lineWidth = 3;
        ctx!.globalAlpha = alpha;
        ctx!.shadowBlur = 20;
        ctx!.shadowColor = laser.color;

        ctx!.beginPath();
        ctx!.moveTo(laser.fromX, laser.fromY);
        ctx!.lineTo(laser.toX, laser.toY);
        ctx!.stroke();

        ctx!.shadowBlur = 0;
        ctx!.globalAlpha = 1;
      });

      // Draw burn marks with fade and repair effect
      burnMarks.forEach((burn, index) => {
        const age = currentTime - burn.createdAt;

        if (age > burn.fadeDuration) {
          burnMarks.splice(index, 1);
          return;
        }

        // Calculate fade progress (0 to 1)
        const fadeProgress = age / burn.fadeDuration;
        const alpha = 1 - fadeProgress;

        // Burn mark with charred edges
        const burnGradient = ctx!.createRadialGradient(
          burn.x, burn.y, 0,
          burn.x, burn.y, burn.radius
        );

        // Center is darker, edges fade out
        burnGradient.addColorStop(0, `rgba(30, 30, 30, ${alpha * 0.8})`);
        burnGradient.addColorStop(0.4, `rgba(60, 40, 20, ${alpha * 0.6})`);
        burnGradient.addColorStop(0.7, `rgba(80, 50, 20, ${alpha * 0.4})`);
        burnGradient.addColorStop(1, `rgba(0, 0, 0, 0)`);

        ctx!.fillStyle = burnGradient;
        ctx!.beginPath();
        ctx!.arc(burn.x, burn.y, burn.radius * (1 - fadeProgress * 0.3), 0, Math.PI * 2);
        ctx!.fill();

        // Glowing embers effect (first half of fade)
        if (fadeProgress < 0.5) {
          const emberCount = 5;
          for (let i = 0; i < emberCount; i++) {
            const emberAngle = (Math.PI * 2 * i) / emberCount + age * 0.001;
            const emberDist = burn.radius * 0.7;
            const emberX = burn.x + Math.cos(emberAngle) * emberDist;
            const emberY = burn.y + Math.sin(emberAngle) * emberDist;
            const emberPulse = Math.sin(age * 0.01 + i) * 0.5 + 0.5;

            ctx!.beginPath();
            ctx!.arc(emberX, emberY, 2, 0, Math.PI * 2);
            ctx!.fillStyle = `rgba(255, 100, 0, ${alpha * emberPulse * 0.8})`;
            ctx!.shadowBlur = 10;
            ctx!.shadowColor = 'rgba(255, 100, 0, 0.5)';
            ctx!.fill();
            ctx!.shadowBlur = 0;
          }
        }

        // Repair sparkles effect (last half of fade)
        if (fadeProgress > 0.5) {
          const repairProgress = (fadeProgress - 0.5) * 2;
          const sparkleCount = 8;
          for (let i = 0; i < sparkleCount; i++) {
            const sparkleAngle = (Math.PI * 2 * i) / sparkleCount;
            const sparkleDist = burn.radius * (1 - repairProgress);
            const sparkleX = burn.x + Math.cos(sparkleAngle) * sparkleDist;
            const sparkleY = burn.y + Math.sin(sparkleAngle) * sparkleDist;
            const sparklePulse = Math.sin(age * 0.02 + i) * 0.5 + 0.5;

            ctx!.beginPath();
            ctx!.arc(sparkleX, sparkleY, 1.5, 0, Math.PI * 2);
            ctx!.fillStyle = `rgba(0, 255, 200, ${(1 - fadeProgress) * sparklePulse})`;
            ctx!.shadowBlur = 8;
            ctx!.shadowColor = 'rgba(0, 255, 200, 0.5)';
            ctx!.fill();
            ctx!.shadowBlur = 0;
          }
        }
      });

      // Draw star layers (parallax)
      starLayers.forEach((layer) => {
        layer.stars.forEach((star) => {
          // Twinkle effect
          const twinkle = Math.sin(Date.now() * 0.002 + star.x) * 0.3 + 0.7;

          ctx!.beginPath();
          ctx!.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx!.fillStyle = layer.color;
          ctx!.globalAlpha = star.opacity * twinkle;
          ctx!.fill();
          ctx!.globalAlpha = 1;

          // Move star
          star.y += layer.speed;

          // Wrap around
          if (star.y > canvas!.height) {
            star.y = 0;
            star.x = Math.random() * canvas!.width;
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
