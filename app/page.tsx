"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const AlienLeaderboard = dynamic(() => import("./components/AlienLeaderboard"), { ssr: false });
const AlienDripStation = dynamic(() => import("./components/AlienDripStation"), { ssr: false });
const AlienHUD = dynamic(() => import("@lib/hud").then(mod => mod.AlienHUD), { ssr: false });

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

      {/* Top Right - Connect Button and HUD */}
      <div className="absolute top-6 right-6 z-20 flex flex-col items-end space-y-4">
        <ConnectButton />
        <AlienHUD />
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

        {/* Buy Gumbuo Button with Mascots */}
        <div className="flex flex-col items-center space-y-4 mb-12">
          <div className="flex items-center justify-center space-x-6">
            <img src="/nyx.png" alt="Nyx" className="animate-bounce" style={{width: '80px', height: '80px', maxWidth: '80px', maxHeight: '80px', objectFit: 'cover', animationDuration: '2s'}} />
            <a
              href="https://thirdweb.com/base/0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-24 py-8 bg-green-400 text-black font-bold rounded-2xl hover:bg-green-500 transition-all duration-200 tracking-wider hover-ripple hover-float hover-cosmic-pulse"
              style={{fontSize: '4rem'}}
            >
              Buy Gumbuo
            </a>
            <img src="/zorb.png" alt="Zorb" className="animate-bounce" style={{width: '80px', height: '80px', maxWidth: '80px', maxHeight: '80px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
          </div>
          <p className="text-green-400 font-bold text-3xl animate-pulse tracking-wider">👆 CLICK HERE 👆</p>

          {/* Social Links */}
          <div className="flex gap-12 mt-4">
            <a
              href="https://x.com/gumbuogw3"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500/80 hover:bg-blue-600 px-36 py-18 rounded-3xl text-white font-bold transition-all hover:scale-110 shadow-2xl hover:shadow-blue-400/80 flex items-center gap-8"
              style={{fontSize: '6rem'}}
            >
              <span style={{fontSize: '8rem'}}>𝕏</span>
              <span>Twitter</span>
            </a>
            <a
              href="https://discord.gg/NptkDYn8fm"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-500/80 hover:bg-purple-600 px-36 py-18 rounded-3xl text-white font-bold transition-all hover:scale-110 shadow-2xl hover:shadow-purple-400/80 flex items-center gap-8"
              style={{fontSize: '6rem'}}
            >
              <span style={{fontSize: '8rem'}}>💬</span>
              <span>Discord</span>
            </a>
          </div>
        </div>

        {/* Active Chains */}
        <h2 className="text-3xl font-alien text-cyan-400 mb-6 holographic-text">GUMBUO'S BLOCKCHAIN PORTAL</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
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

        {/* Alien Drip Station */}
        <div className="flex justify-center mt-16">
          <AlienDripStation />
        </div>

        {/* Alien Leaderboard */}
        <div className="flex justify-center mt-16">
          <AlienLeaderboard />
        </div>

        {/* Footer */}
        <div className="mt-12 mb-12 text-gray-500 text-sm">
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
