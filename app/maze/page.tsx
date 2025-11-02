"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCosmicSound } from "../hooks/useCosmicSound";
import BackToMothershipButton from "../components/BackToMothershipButton";

const AlienMaze = dynamic(() => import("../components/AlienMaze"), { ssr: false });
const MazeLeaderboard = dynamic(() => import("../components/MazeLeaderboard"), { ssr: false });
const StarfieldBackground = dynamic(() => import("../components/StarfieldBackground"), { ssr: false });

export default function MazePage() {
  const [mounted, setMounted] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const { playSound } = useCosmicSound();

  useEffect(() => {
    setMounted(true);
    // Check if we're in an iframe
    setIsInIframe(window.self !== window.top);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black relative overflow-y-auto">
      {/* Animated Starfield Background */}
      <StarfieldBackground />

      {/* Back to Mothership Button - Only show if NOT in iframe */}
      {!isInIframe && <BackToMothershipButton />}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="font-alien mb-4 holographic-text tracking-wider animate-pulse flex items-center justify-center gap-4"
            style={{
              fontSize: '4rem',
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

        {/* Game */}
        <div className="flex justify-center items-center mb-16">
          <AlienMaze />
        </div>

        {/* Leaderboard */}
        <div className="flex justify-center items-center mb-16">
          <MazeLeaderboard />
        </div>

        {/* Instructions */}
        <div className="holographic-panel" style={{
          marginTop: '48px',
          maxWidth: '64rem',
          marginLeft: 'auto',
          marginRight: 'auto',
          background: 'rgba(0, 255, 153, 0.05)',
          borderRadius: '8px',
          padding: '32px'
        }}>
          <h2 className="holographic-text" style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '1.875rem',
            marginBottom: '24px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            HOW TO PLAY
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', color: '#22d3ee' }}>
            <div className="holographic-panel" style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '8px',
              padding: '24px'
            }}>
              <h3 className="holographic-text" style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.25rem', marginBottom: '12px' }}>🎮 CONTROLS</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                <li>• <span style={{ color: '#4ade80', fontWeight: 'bold' }}>W or ↑</span> - Move Up</li>
                <li>• <span style={{ color: '#4ade80', fontWeight: 'bold' }}>S or ↓</span> - Move Down</li>
                <li>• <span style={{ color: '#4ade80', fontWeight: 'bold' }}>A or ←</span> - Move Left</li>
                <li>• <span style={{ color: '#4ade80', fontWeight: 'bold' }}>D or →</span> - Move Right</li>
                <li>• <span style={{ color: '#a855f7', fontWeight: 'bold' }}>Click</span> - Collect adjacent items</li>
              </ul>
            </div>

            <div className="holographic-panel" style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '8px',
              padding: '24px'
            }}>
              <h3 className="holographic-text" style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.25rem', marginBottom: '12px' }}>💎 COLLECTIBLES</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                <li>• <span style={{ fontSize: '1.5rem' }}>💎</span> <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>Coins</span> - Worth 10 points each</li>
                <li>• <span style={{ fontSize: '1.5rem' }}>⚡</span> <span style={{ color: '#facc15', fontWeight: 'bold' }}>Power-ups</span> - Worth 25 points each</li>
                <li>• <span style={{ fontSize: '1.5rem' }}>❓</span> <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Mystery Boxes</span> - Worth 50 points each</li>
                <li>• <span style={{ fontSize: '1.5rem' }}>🌀</span> <span style={{ color: '#a855f7', fontWeight: 'bold' }}>Exit Portal</span> - Complete the maze!</li>
              </ul>
            </div>

            <div className="holographic-panel" style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '8px',
              padding: '24px'
            }}>
              <h3 className="holographic-text" style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.25rem', marginBottom: '12px' }}>🏆 SCORING</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                <li>• Collect items to increase your score</li>
                <li>• Finish faster for TIME BONUS (up to +300 points!)</li>
                <li>• All points convert to Alien Points when you win</li>
                <li>• Try to beat your high score!</li>
              </ul>
            </div>

            <div className="holographic-panel" style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '8px',
              padding: '24px'
            }}>
              <h3 className="holographic-text" style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.25rem', marginBottom: '12px' }}>💡 TIPS</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                <li>• Explore every path to find all collectibles</li>
                <li>• Click on nearby items for quick collection</li>
                <li>• Dark walls are impassable</li>
                <li>• The purple portal is your exit goal</li>
              </ul>
            </div>
          </div>

          <div className="holographic-panel" style={{
            marginTop: '24px',
            background: 'rgba(34, 197, 94, 0.2)',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#86efac', fontWeight: 'bold', fontSize: '1.125rem' }}>
              🎯 Complete the maze to earn Alien Points! 🎯
            </p>
            <p style={{ color: '#4ade80', fontSize: '0.875rem', marginTop: '8px' }}>
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
