"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCosmicSound } from "./hooks/useCosmicSound";

const AlienLeaderboard = dynamic(() => import("./components/AlienLeaderboard"), { ssr: false });
const AlienDripStation = dynamic(() => import("./components/AlienDripStation"), { ssr: false });
const AlienHUD = dynamic(() => import("@lib/hud").then(mod => mod.AlienHUD), { ssr: false });
const AlienMusicPlayer = dynamic(() => import("./components/AlienMusicPlayer"), { ssr: false });

export default function MothershipPage() {
  const [mounted, setMounted] = useState(false);
  const { playSound } = useCosmicSound();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black relative overflow-y-auto">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
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

      {/* Music Player - Middle Left */}
      <div className="fixed top-1/2 left-6 -translate-y-1/2 z-50">
        <AlienMusicPlayer />
      </div>

      {/* Top Right - Connect Button and HUD */}
      <div className="fixed top-6 right-6 z-50 flex flex-col items-end space-y-4">
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

        {/* Buy Gumbuo Buttons with Mascots */}
        <div className="flex flex-col items-center space-y-6 mb-12">
          {/* Base Chain Buy Button */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center space-x-4">
              <img src="/nyx.png" alt="Nyx" className="animate-bounce" style={{width: '50px', height: '50px', maxWidth: '50px', maxHeight: '50px', objectFit: 'cover', animationDuration: '2s'}} />
              <a
                href="https://thirdweb.com/base/0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => playSound('hover')}
                onClick={() => playSound('click')}
                className="inline-block px-12 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all duration-200 tracking-wider hover:scale-105 shadow-lg shadow-blue-500/50"
                style={{fontSize: '2rem'}}
              >
                Buy GMB (Base)
              </a>
              <img src="/zorb.png" alt="Zorb" className="animate-bounce" style={{width: '50px', height: '50px', maxWidth: '50px', maxHeight: '50px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
            </div>
            <p className="text-blue-400 font-bold text-xl animate-pulse tracking-wider">👆 LIVE NOW 👆</p>
          </div>

          {/* Abstract Chain Buy Button */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center space-x-4">
              <img src="/nyx.png" alt="Nyx" className="animate-bounce" style={{width: '50px', height: '50px', maxWidth: '50px', maxHeight: '50px', objectFit: 'cover', animationDuration: '2s'}} />
              <a
                href="https://thirdweb.com/abstract/0x1660AA473D936029C7659e7d047F05EcF28D40c9"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => playSound('hover')}
                onClick={() => playSound('click')}
                className="inline-block px-12 py-4 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition-all duration-200 tracking-wider hover:scale-105 shadow-lg shadow-purple-500/50"
                style={{fontSize: '2rem'}}
              >
                Buy GMB (Abstract)
              </a>
              <img src="/zorb.png" alt="Zorb" className="animate-bounce" style={{width: '50px', height: '50px', maxWidth: '50px', maxHeight: '50px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
            </div>
            <p className="text-purple-400 font-bold text-xl animate-pulse tracking-wider">👆 LIVE NOW 👆</p>
          </div>

          {/* Social Links */}
          <div className="flex gap-6 mt-4">
            <a
              href="https://x.com/gumbuogw3"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="bg-blue-500/80 hover:bg-blue-600 px-12 py-4 rounded-xl text-white font-bold transition-all hover:scale-105 shadow-lg hover:shadow-blue-400/80 flex items-center gap-3"
              style={{fontSize: '2rem'}}
            >
              <span style={{fontSize: '2.5rem'}}>𝕏</span>
              <span>Twitter</span>
            </a>
            <a
              href="https://discord.gg/NptkDYn8fm"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="bg-purple-500/80 hover:bg-purple-600 px-12 py-4 rounded-xl text-white font-bold transition-all hover:scale-105 shadow-lg hover:shadow-purple-400/80 flex items-center gap-3"
              style={{fontSize: '2rem'}}
            >
              <span style={{fontSize: '2.5rem'}}>💬</span>
              <span>Discord</span>
            </a>
          </div>
        </div>

        {/* Active Chains */}
        <h2 className="text-3xl font-alien text-cyan-400 mb-6 holographic-text">GUMBUO'S BLOCKCHAIN PORTAL</h2>
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          {/* Base Chain Card */}
          <Link href="/base">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-3xl p-6 border-4 border-blue-500/50 hover:border-blue-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50"
              style={{width: '400px', maxWidth: '400px'}}
            >
              <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">⛓️</div>
                <h2 className="text-4xl font-alien text-blue-300 mb-4 holographic-text">BASE CHAIN</h2>

                <div className="flex justify-center items-center gap-4 mb-6">
                  <img src="/nyx.png" alt="Nyx" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/zorb.png" alt="Zorb" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-6 py-3 bg-blue-500/20 rounded-xl border-2 border-blue-400 text-blue-300 font-bold group-hover:bg-blue-500/30 transition-all">
                  ENTER BASE →
                </div>
              </div>
            </div>
          </Link>

          {/* Abstract Chain Card */}
          <Link href="/abstract">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-3xl p-6 border-4 border-purple-500/50 hover:border-purple-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
              style={{width: '400px', maxWidth: '400px'}}
            >
              <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">⚡</div>
                <h2 className="text-4xl font-alien text-purple-300 mb-4 holographic-text">ABSTRACT CHAIN</h2>

                <div className="flex justify-center items-center gap-4 mb-6">
                  <img src="/apelian.png" alt="Apelian" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/baob.png" alt="Baob" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-6 py-3 bg-purple-500/20 rounded-xl border-2 border-purple-400 text-purple-300 font-bold group-hover:bg-purple-500/30 transition-all">
                  ENTER ABSTRACT →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Abstract XP Rewards Banner */}
        <div className="flex justify-center mt-16 mb-8 px-6">
          <div className="max-w-4xl w-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 rounded-2xl p-6 backdrop-blur-sm animate-pulse">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-3xl font-alien text-purple-300 mb-2 holographic-text">⚡ EARN ABSTRACT XP ⚡</h3>
              <p className="text-purple-200 text-lg mb-4">
                Play on Gumbuo's Abstract chain and earn <span className="text-yellow-300 font-bold">Abstract XP</span> toward the upcoming airdrop!
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <span className="bg-purple-500/30 px-3 py-1 rounded-lg border border-purple-400">✅ Battle Bosses</span>
                <span className="bg-purple-500/30 px-3 py-1 rounded-lg border border-purple-400">✅ Arena Fights</span>
                <span className="bg-purple-500/30 px-3 py-1 rounded-lg border border-purple-400">✅ Stake GMB</span>
                <span className="bg-purple-500/30 px-3 py-1 rounded-lg border border-purple-400">✅ Trade NFTs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alien Drip Station */}
        <div className="flex justify-center mt-8">
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
