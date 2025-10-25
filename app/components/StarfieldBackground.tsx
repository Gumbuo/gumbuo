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
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * (maxSize - minSize) + minSize,
        opacity: Math.random() * 0.5 + 0.5,
      }));
    }

    // Nebula particles
    const nebulae = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 100 + 50,
      color: Math.random() > 0.5 ? "rgba(138, 43, 226, 0.1)" : "rgba(0, 255, 153, 0.1)",
      speedX: (Math.random() - 0.5) * 0.1,
      speedY: (Math.random() - 0.5) * 0.1,
    }));

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw nebulae
      nebulae.forEach((nebula) => {
        const gradient = ctx.createRadialGradient(
          nebula.x,
          nebula.y,
          0,
          nebula.x,
          nebula.y,
          nebula.radius
        );
        gradient.addColorStop(0, nebula.color);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(
          nebula.x - nebula.radius,
          nebula.y - nebula.radius,
          nebula.radius * 2,
          nebula.radius * 2
        );

        // Move nebula
        nebula.x += nebula.speedX;
        nebula.y += nebula.speedY;

        // Wrap around
        if (nebula.x < -nebula.radius) nebula.x = canvas.width + nebula.radius;
        if (nebula.x > canvas.width + nebula.radius) nebula.x = -nebula.radius;
        if (nebula.y < -nebula.radius) nebula.y = canvas.height + nebula.radius;
        if (nebula.y > canvas.height + nebula.radius) nebula.y = -nebula.radius;
      });

      // Draw star layers (parallax)
      starLayers.forEach((layer) => {
        layer.stars.forEach((star) => {
          // Twinkle effect
          const twinkle = Math.sin(Date.now() * 0.002 + star.x) * 0.3 + 0.7;

          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = layer.color;
          ctx.globalAlpha = star.opacity * twinkle;
          ctx.fill();
          ctx.globalAlpha = 1;

          // Move star
          star.y += layer.speed;

          // Wrap around
          if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
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
