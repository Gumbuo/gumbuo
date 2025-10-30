"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCosmicSound } from "../hooks/useCosmicSound";

const AlienMaze = dynamic(() => import("../components/AlienMaze"), { ssr: false });
const MazeLeaderboard = dynamic(() => import("../components/MazeLeaderboard"), { ssr: false });
const StarfieldBackground = dynamic(() => import("../components/StarfieldBackground"), { ssr: false });

export default function MazePage() {
  const [mounted, setMounted] = useState(false);
  const { playSound } = useCosmicSound();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black relative overflow-y-auto">
      {/* Animated Starfield Background */}
      <StarfieldBackground />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="font-alien mb-4 holographic-text tracking-wider animate-pulse text-cyan-400 flex items-center justify-center gap-4"
            style={{
              fontSize: '4rem',
              textShadow: '0 0 30px #00ff99, 0 0 60px #00ff99, 0 0 90px #00ff99',
              animation: 'pulse 3s ease-in-out infinite'
            }}
          >
            <span className="text-6xl">🛸</span>
            ALIEN MAZE CHALLENGE
            <span className="text-6xl">🛸</span>
          </h1>
          <p className="text-cyan-300 text-xl max-w-2xl mx-auto">
            Navigate through the alien labyrinth using WASD keys! Collect cosmic treasures, avoid dead ends, and reach the portal to earn massive Alien Points!
          </p>
        </div>

        {/* Back to Home Button */}
        <div className="flex justify-center mb-6">
          <Link href="/">
            <button
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-alien rounded-xl transition-all hover:scale-105 shadow-lg shadow-purple-500/50"
            >
              ← BACK TO MOTHERSHIP
            </button>
          </Link>
        </div>

        {/* Game */}
        <div className="flex justify-center items-center mb-16">
          <AlienMaze />
        </div>

        {/* Leaderboard */}
        <div className="flex justify-center items-center mb-16">
          <MazeLeaderboard />
        </div>

        {/* Instructions */}
        <div className="mt-12 max-w-4xl mx-auto bg-cyan-900/20 border-2 border-cyan-400/50 rounded-2xl p-8 holographic-panel">
          <div className="corner-glow corner-glow-tl"></div>
          <div className="corner-glow corner-glow-tr"></div>
          <div className="corner-glow corner-glow-bl"></div>
          <div className="corner-glow corner-glow-br"></div>

          <h2 className="relative z-10 font-alien text-3xl text-cyan-400 holographic-text mb-6 text-center">
            HOW TO PLAY
          </h2>

          <div className="relative z-10 grid md:grid-cols-2 gap-6 text-cyan-300">
            <div className="bg-black/40 rounded-xl p-6 border border-cyan-500/30">
              <h3 className="font-alien text-xl text-cyan-400 mb-3">🎮 CONTROLS</h3>
              <ul className="space-y-2 text-sm">
                <li>• <span className="text-green-400 font-bold">W or ↑</span> - Move Up</li>
                <li>• <span className="text-green-400 font-bold">S or ↓</span> - Move Down</li>
                <li>• <span className="text-green-400 font-bold">A or ←</span> - Move Left</li>
                <li>• <span className="text-green-400 font-bold">D or →</span> - Move Right</li>
                <li>• <span className="text-purple-400 font-bold">Click</span> - Collect adjacent items</li>
              </ul>
            </div>

            <div className="bg-black/40 rounded-xl p-6 border border-purple-500/30">
              <h3 className="font-alien text-xl text-purple-400 mb-3">💎 COLLECTIBLES</h3>
              <ul className="space-y-2 text-sm">
                <li>• <span className="text-2xl">💎</span> <span className="text-blue-400 font-bold">Coins</span> - Worth 10 points each</li>
                <li>• <span className="text-2xl">⚡</span> <span className="text-yellow-400 font-bold">Power-ups</span> - Worth 25 points each</li>
                <li>• <span className="text-2xl">❓</span> <span className="text-green-400 font-bold">Mystery Boxes</span> - Worth 50 points each</li>
                <li>• <span className="text-2xl">🌀</span> <span className="text-purple-400 font-bold">Exit Portal</span> - Complete the maze!</li>
              </ul>
            </div>

            <div className="bg-black/40 rounded-xl p-6 border border-green-500/30">
              <h3 className="font-alien text-xl text-green-400 mb-3">🏆 SCORING</h3>
              <ul className="space-y-2 text-sm">
                <li>• Collect items to increase your score</li>
                <li>• Finish faster for TIME BONUS (up to +300 points!)</li>
                <li>• All points convert to Alien Points when you win</li>
                <li>• Try to beat your high score!</li>
              </ul>
            </div>

            <div className="bg-black/40 rounded-xl p-6 border border-yellow-500/30">
              <h3 className="font-alien text-xl text-yellow-400 mb-3">💡 TIPS</h3>
              <ul className="space-y-2 text-sm">
                <li>• Explore every path to find all collectibles</li>
                <li>• Click on nearby items for quick collection</li>
                <li>• Dark walls are impassable</li>
                <li>• The purple portal is your exit goal</li>
              </ul>
            </div>
          </div>

          <div className="relative z-10 mt-6 bg-green-900/40 border-2 border-green-400 rounded-xl p-4 text-center">
            <p className="text-green-300 font-bold text-lg">
              🎯 Complete the maze to earn Alien Points! 🎯
            </p>
            <p className="text-green-400 text-sm mt-2">
              Your score + time bonus = Total Alien Points earned
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            New mazes generated every game • Compete for the fastest time • Earn rewards
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
