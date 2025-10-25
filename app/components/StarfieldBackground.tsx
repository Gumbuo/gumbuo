"use client";
import { useEffect, useRef } from "react";

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

    // Flying UFO 1 (Green)
    const ufo1 = {
      x: Math.random() * canvas!.width,
      y: Math.random() * canvas!.height,
      baseSpeed: 2,
      angle: Math.random() * Math.PI * 2,
      wobbleOffset: 0,
      targetAngle: Math.random() * Math.PI * 2,
      tilt: 0,
    };

    // Flying UFO 2 (Blue)
    const ufo2 = {
      x: Math.random() * canvas!.width,
      y: Math.random() * canvas!.height,
      baseSpeed: 1.5,
      angle: Math.random() * Math.PI * 2,
      wobbleOffset: Math.PI, // Different phase
      targetAngle: Math.random() * Math.PI * 2,
      tilt: 0,
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

      // Update and draw UFO 1 (Green)
      // Smooth angle interpolation
      let angleDiff1 = ufo1.targetAngle - ufo1.angle;
      if (angleDiff1 > Math.PI) angleDiff1 -= Math.PI * 2;
      if (angleDiff1 < -Math.PI) angleDiff1 += Math.PI * 2;
      ufo1.angle += angleDiff1 * 0.02;

      // Occasionally change direction
      if (Math.random() < 0.01) {
        ufo1.targetAngle = Math.random() * Math.PI * 2;
      }

      // Add wobble for natural movement
      ufo1.wobbleOffset += 0.05;
      const wobbleX1 = Math.sin(ufo1.wobbleOffset) * 0.5;
      const wobbleY1 = Math.cos(ufo1.wobbleOffset * 0.7) * 0.3;

      // Update position with wobble
      ufo1.x += Math.cos(ufo1.angle) * ufo1.baseSpeed + wobbleX1;
      ufo1.y += Math.sin(ufo1.angle) * ufo1.baseSpeed + wobbleY1;

      // Calculate tilt based on movement direction
      ufo1.tilt = Math.cos(ufo1.angle) * 0.3;

      // Wrap around screen
      if (ufo1.x < -100) ufo1.x = canvas!.width + 100;
      if (ufo1.x > canvas!.width + 100) ufo1.x = -100;
      if (ufo1.y < -100) ufo1.y = canvas!.height + 100;
      if (ufo1.y > canvas!.height + 100) ufo1.y = -100;

      // Draw UFO 1
      ctx!.save();
      ctx!.translate(ufo1.x, ufo1.y);

      // Light beam (subtle) - 4x bigger
      const beamGradient = ctx!.createLinearGradient(0, 0, 0, 240);
      beamGradient.addColorStop(0, "rgba(0, 255, 153, 0.1)");
      beamGradient.addColorStop(1, "rgba(0, 255, 153, 0)");
      ctx!.fillStyle = beamGradient;
      ctx!.beginPath();
      ctx!.moveTo(-32, 0);
      ctx!.lineTo(32, 0);
      ctx!.lineTo(60, 240);
      ctx!.lineTo(-60, 240);
      ctx!.closePath();
      ctx!.fill();

      // UFO body (saucer) - 4x bigger
      ctx!.beginPath();
      ctx!.ellipse(0, ufo1.tilt * 20, 100, 40, 0, 0, Math.PI * 2);
      const saucerGradient = ctx!.createLinearGradient(-100, 0, 100, 0);
      saucerGradient.addColorStop(0, "#1a4d4d");
      saucerGradient.addColorStop(0.5, "#00ffaa");
      saucerGradient.addColorStop(1, "#1a4d4d");
      ctx!.fillStyle = saucerGradient;
      ctx!.fill();

      // UFO dome - 4x bigger
      ctx!.beginPath();
      ctx!.ellipse(0, -12 + ufo1.tilt * 12, 48, 32, 0, Math.PI, 0);
      ctx!.fillStyle = "rgba(0, 255, 200, 0.3)";
      ctx!.fill();

      // Glowing lights - 4x bigger
      const lights = [-60, -20, 20, 60];
      lights.forEach((x, i) => {
        const pulse = Math.sin(Date.now() * 0.01 + i) * 0.5 + 0.5;
        ctx!.beginPath();
        ctx!.arc(x, 0, 8, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 200, 0, ${pulse})`;
        ctx!.shadowBlur = 40;
        ctx!.shadowColor = "#ffcc00";
        ctx!.fill();
        ctx!.shadowBlur = 0;
      });

      ctx!.restore();

      // Update and draw UFO 2 (Blue)
      // Smooth angle interpolation
      let angleDiff2 = ufo2.targetAngle - ufo2.angle;
      if (angleDiff2 > Math.PI) angleDiff2 -= Math.PI * 2;
      if (angleDiff2 < -Math.PI) angleDiff2 += Math.PI * 2;
      ufo2.angle += angleDiff2 * 0.02;

      // Occasionally change direction
      if (Math.random() < 0.01) {
        ufo2.targetAngle = Math.random() * Math.PI * 2;
      }

      // Add wobble for natural movement
      ufo2.wobbleOffset += 0.05;
      const wobbleX2 = Math.sin(ufo2.wobbleOffset) * 0.5;
      const wobbleY2 = Math.cos(ufo2.wobbleOffset * 0.7) * 0.3;

      // Update position with wobble
      ufo2.x += Math.cos(ufo2.angle) * ufo2.baseSpeed + wobbleX2;
      ufo2.y += Math.sin(ufo2.angle) * ufo2.baseSpeed + wobbleY2;

      // Calculate tilt based on movement direction
      ufo2.tilt = Math.cos(ufo2.angle) * 0.3;

      // Wrap around screen
      if (ufo2.x < -100) ufo2.x = canvas!.width + 100;
      if (ufo2.x > canvas!.width + 100) ufo2.x = -100;
      if (ufo2.y < -100) ufo2.y = canvas!.height + 100;
      if (ufo2.y > canvas!.height + 100) ufo2.y = -100;

      // Draw UFO 2
      ctx!.save();
      ctx!.translate(ufo2.x, ufo2.y);

      // Light beam (subtle) - 4x bigger - BLUE
      const beamGradient2 = ctx!.createLinearGradient(0, 0, 0, 240);
      beamGradient2.addColorStop(0, "rgba(0, 150, 255, 0.1)");
      beamGradient2.addColorStop(1, "rgba(0, 150, 255, 0)");
      ctx!.fillStyle = beamGradient2;
      ctx!.beginPath();
      ctx!.moveTo(-32, 0);
      ctx!.lineTo(32, 0);
      ctx!.lineTo(60, 240);
      ctx!.lineTo(-60, 240);
      ctx!.closePath();
      ctx!.fill();

      // UFO body (saucer) - 4x bigger - BLUE
      ctx!.beginPath();
      ctx!.ellipse(0, ufo2.tilt * 20, 100, 40, 0, 0, Math.PI * 2);
      const saucerGradient2 = ctx!.createLinearGradient(-100, 0, 100, 0);
      saucerGradient2.addColorStop(0, "#1a3d4d");
      saucerGradient2.addColorStop(0.5, "#0088ff");
      saucerGradient2.addColorStop(1, "#1a3d4d");
      ctx!.fillStyle = saucerGradient2;
      ctx!.fill();

      // UFO dome - 4x bigger - BLUE
      ctx!.beginPath();
      ctx!.ellipse(0, -12 + ufo2.tilt * 12, 48, 32, 0, Math.PI, 0);
      ctx!.fillStyle = "rgba(0, 150, 255, 0.3)";
      ctx!.fill();

      // Glowing lights - 4x bigger
      const lights2 = [-60, -20, 20, 60];
      lights2.forEach((x, i) => {
        const pulse = Math.sin(Date.now() * 0.01 + i) * 0.5 + 0.5;
        ctx!.beginPath();
        ctx!.arc(x, 0, 8, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 200, 0, ${pulse})`;
        ctx!.shadowBlur = 40;
        ctx!.shadowColor = "#ffcc00";
        ctx!.fill();
        ctx!.shadowBlur = 0;
      });

      ctx!.restore();

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
