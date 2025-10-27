"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

interface FloatingGumbuoProps {
  position?: "left" | "right";
}

export default function FloatingGumbuo({ position = "right" }: FloatingGumbuoProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const messages = [
    "Welcome to the Gumbuo Universe! 👽",
    "Earn XP to unlock cosmic rewards! 🌟",
    "Bridge to Abstract for maximum gains! 🌉",
    "Swap tokens like an alien boss! 🔄",
    "Collect all badges, human! 🎖️",
    "The mothership is watching... 🛸",
    "Your GMB balance is looking stellar! 💎",
    "Keep grinding those Alien Points! ⭐",
  ];

  useEffect(() => {
    // Show random messages every 15 seconds
    const interval = setInterval(() => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setMessage(randomMessage);
      setShowMessage(true);

      setTimeout(() => {
        setShowMessage(false);
      }, 5000);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const positionClass = position === "left" ? "left-8" : "right-8";

  return (
    <div
      className={`fixed bottom-8 ${positionClass} z-50 pointer-events-auto`}
      style={{ maxWidth: "300px" }}
    >
      {/* Speech Bubble */}
      {showMessage && (
        <div className="mb-4 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="holographic-panel glass-panel p-4 rounded-2xl relative">
            <div className="corner-glow corner-glow-tl"></div>
            <div className="corner-glow corner-glow-br"></div>
            <p className="text-cyan-400 text-sm relative z-10 font-electro">
              {message}
            </p>
            {/* Speech bubble arrow */}
            <div
              className={`absolute bottom-[-10px] ${
                position === "left" ? "left-8" : "right-8"
              } w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-cyan-500/30`}
            ></div>
          </div>
        </div>
      )}

      {/* Gumbuo Mascot */}
      <div className="relative group cursor-pointer">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300 alien-float"></div>

        {/* Mascot container */}
        <div className="relative w-32 h-32 alien-float portal-effect">
          {/* Use your mascot image or emoji */}
          <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-6xl backdrop-blur-lg border-2 border-cyan-400/50 shadow-2xl group-hover:scale-110 transition-transform duration-300">
            👽
          </div>

          {/* Orbiting particles */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-spin-slow"></div>
            <div
              className="absolute bottom-0 right-1/2 w-2 h-2 bg-purple-400 rounded-full animate-spin-slow"
              style={{ animationDirection: "reverse", animationDuration: "15s" }}
            ></div>
            <div
              className="absolute top-1/2 left-0 w-2 h-2 bg-pink-400 rounded-full animate-spin-slow"
              style={{ animationDuration: "25s" }}
            ></div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-500 rounded-full text-white text-xs font-bold transition-all duration-300 hover:scale-110 z-20"
          title="Hide Gumbuo"
        >
          ×
        </button>

        {/* Click hint */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-xs text-cyan-400 whitespace-nowrap font-electro">
            Gumbuo Helper
          </div>
        </div>
      </div>

      {/* Stats indicator */}
      <div className="mt-2 flex justify-center gap-1">
        <div className="status-indicator"></div>
        <div className="status-indicator" style={{ animationDelay: "0.5s" }}></div>
        <div className="status-indicator" style={{ animationDelay: "1s" }}></div>
      </div>
    </div>
  );
}
