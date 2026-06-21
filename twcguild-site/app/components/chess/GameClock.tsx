"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface GameClockProps {
  initialTime: number; // milliseconds
  isRunning: boolean;
  onTimeout: () => void;
  increment?: number; // milliseconds added after each move
  className?: string;
}

export function GameClock({
  initialTime,
  isRunning,
  onTimeout,
  increment = 0,
  className = "",
}: GameClockProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  // Reset when initial time changes
  useEffect(() => {
    setTimeRemaining(initialTime);
  }, [initialTime]);

  // Countdown logic
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 100);
        if (newTime === 0) {
          onTimeout();
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, onTimeout, timeRemaining]);

  // Add increment after move (called externally)
  const addIncrement = useCallback(() => {
    if (increment > 0) {
      setTimeRemaining((prev) => prev + increment);
    }
  }, [increment]);

  // Format time display
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${seconds}.${tenths}`;
  };

  const isLow = timeRemaining < 30000; // Less than 30 seconds
  const isCritical = timeRemaining < 10000; // Less than 10 seconds

  return (
    <motion.div
      animate={
        isCritical && isRunning
          ? {
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 10px rgba(255, 0, 0, 0.3)",
                "0 0 20px rgba(255, 0, 0, 0.6)",
                "0 0 10px rgba(255, 0, 0, 0.3)",
              ],
            }
          : {}
      }
      transition={{ repeat: Infinity, duration: 0.5 }}
      className={`
        px-6 py-3 rounded-lg font-mono text-2xl font-bold
        transition-colors duration-200
        ${isRunning && !isLow ? "bg-green-600 text-white" : ""}
        ${!isRunning ? "bg-gray-700 text-gray-300" : ""}
        ${isRunning && isLow && !isCritical ? "bg-yellow-500 text-black" : ""}
        ${isRunning && isCritical ? "bg-red-600 text-white" : ""}
        ${className}
      `}
      style={{ fontFamily: "Share Tech Mono, monospace" }}
    >
      {formatTime(timeRemaining)}
    </motion.div>
  );
}

// Time control presets
export const TIME_CONTROLS = {
  bullet1: { name: "Bullet 1+0", initial: 60 * 1000, increment: 0 },
  bullet2: { name: "Bullet 2+1", initial: 2 * 60 * 1000, increment: 1000 },
  blitz3: { name: "Blitz 3+0", initial: 3 * 60 * 1000, increment: 0 },
  blitz5: { name: "Blitz 5+0", initial: 5 * 60 * 1000, increment: 0 },
  rapid10: { name: "Rapid 10+0", initial: 10 * 60 * 1000, increment: 0 },
  rapid15: { name: "Rapid 15+10", initial: 15 * 60 * 1000, increment: 10000 },
  classical30: { name: "Classical 30+0", initial: 30 * 60 * 1000, increment: 0 },
  unlimited: { name: "Unlimited", initial: Infinity, increment: 0 },
};

export default GameClock;
