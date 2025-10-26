"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MothershipPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
        >
          <source src="/alien.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        {/* Title */}
        <h1 className="font-alien text-8xl mb-4 holographic-text tracking-wider animate-pulse" style={{
          textShadow: '0 0 30px #00ff99, 0 0 60px #00ff99, 0 0 90px #00ff99',
          animation: 'pulse 3s ease-in-out infinite'
        }}>
          🛸 GUMBUO MOTHERSHIP 🛸
        </h1>

        <p className="text-2xl text-cyan-400 mb-16 font-electro opacity-90">
          Choose Your Chain • Enter the Alien Economy
        </p>

        {/* Chain Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Base Chain Card */}
          <Link href="/base">
            <div className="group relative bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-3xl p-8 border-4 border-blue-500/50 hover:border-blue-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50">
              <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">⛓️</div>
                <h2 className="text-4xl font-alien text-blue-300 mb-4 holographic-text">BASE CHAIN</h2>

                <div className="space-y-2 text-left mb-6">
                  <p className="text-blue-200 text-sm">✅ GMB Token Economy</p>
                  <p className="text-blue-200 text-sm">✅ Staking & Rewards</p>
                  <p className="text-blue-200 text-sm">✅ Boss Battles</p>
                  <p className="text-blue-200 text-sm">✅ Arena Fights</p>
                  <p className="text-blue-200 text-sm">✅ Alien Marketplace</p>
                </div>

                <div className="inline-block px-6 py-3 bg-blue-500/20 rounded-xl border-2 border-blue-400 text-blue-300 font-bold group-hover:bg-blue-500/30 transition-all">
                  ENTER BASE →
                </div>
              </div>
            </div>
          </Link>

          {/* Abstract Chain Card */}
          <Link href="/abstract">
            <div className="group relative bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-3xl p-8 border-4 border-purple-500/50 hover:border-purple-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50">
              <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">⚡</div>
                <h2 className="text-4xl font-alien text-purple-300 mb-4 holographic-text">ABSTRACT CHAIN</h2>

                <div className="space-y-2 text-left mb-6">
                  <p className="text-purple-200 text-sm">✅ Pure XP Economy</p>
                  <p className="text-purple-200 text-sm">✅ Lightning Fast</p>
                  <p className="text-purple-200 text-sm">✅ Ultra Low Fees</p>
                  <p className="text-purple-200 text-sm">✅ Boss Battles</p>
                  <p className="text-purple-200 text-sm">✅ Arena Fights</p>
                </div>

                <div className="inline-block px-6 py-3 bg-purple-500/20 rounded-xl border-2 border-purple-400 text-purple-300 font-bold group-hover:bg-purple-500/30 transition-all">
                  ENTER ABSTRACT →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-black/60 rounded-2xl p-8 border-2 border-cyan-500/30 max-w-3xl mx-auto">
          <h3 className="text-2xl font-alien text-cyan-400 mb-4">🌌 About Gumbuo</h3>
          <p className="text-gray-300 text-base leading-relaxed">
            Gumbuo is a multi-chain alien economy where you collect aliens, battle bosses,
            fight in the arena, and earn rewards. Each chain offers a unique experience -
            choose Base for the full token economy or Abstract for lightning-fast, low-cost gameplay!
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-gray-500 text-sm">
          <p>Both chains share the same gameplay • Different economies • Your choice</p>
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
