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
const FloatingGumbuo = dynamic(() => import("./components/FloatingGumbuo"), { ssr: false });

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

      {/* Music Player - Top Left */}
      <div className="fixed top-6 left-6 z-50">
        <AlienMusicPlayer />
      </div>

      {/* Top Right - Connect Button and HUD */}
      <div style={{position: 'fixed', top: '24px', right: '24px', zIndex: 50}} className="flex flex-col items-end space-y-4">
        {/* Wallet Connect Button with Alien Styling */}
        <div className="holographic-panel glass-panel p-4 rounded-xl">
          <div className="corner-glow corner-glow-tl"></div>
          <div className="corner-glow corner-glow-tr"></div>
          <div className="corner-glow corner-glow-bl"></div>
          <div className="corner-glow corner-glow-br"></div>
          <div className="relative z-10">
            <ConnectButton />
          </div>
        </div>

        {/* Alien HUD */}
        <AlienHUD />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        {/* Title */}
        <h1 className="font-alien mb-4 holographic-text tracking-wider animate-pulse text-cyan-400" style={{
          fontSize: '4rem',
          textShadow: '0 0 30px #00ff99, 0 0 60px #00ff99, 0 0 90px #00ff99',
          animation: 'pulse 3s ease-in-out infinite'
        }}>
          🛸 GUMBUO MOTHERSHIP 🛸
        </h1>

        {/* Active Chains */}
        <div className="mb-6 text-center">
          <h2 className="font-alien text-cyan-400 holographic-text" style={{fontSize: '3rem'}}>BLOCKCHAIN PORTAL</h2>
          <p className="text-2xl text-cyan-400 mt-2 font-electro opacity-90">Choose Your Chain • portal to pvp and boss battles</p>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-2 gap-6 mb-4 max-w-4xl mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-alien text-cyan-400 holographic-text">MAINNET</h3>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-alien text-cyan-400 holographic-text">TESTNET</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-16 max-w-4xl mx-auto">
          {/* Base Chain Card */}
          <Link href="/base" className="block">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-3xl p-6 border-4 border-blue-500/50 hover:border-blue-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 w-full"
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

          {/* Base Sepolia Card */}
          <Link href="/base-sepolia" className="block">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-yellow-900/40 to-orange-900/40 rounded-3xl p-6 border-4 border-yellow-500/50 hover:border-yellow-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/50 w-full"
            >
              <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">🧪</div>
                <h2 className="text-4xl font-alien text-cyan-300 mb-4 holographic-text">BASE SEPOLIA</h2>

                <div className="flex justify-center items-center gap-4 mb-6">
                  <img src="/nyx.png" alt="Nyx" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/zorb.png" alt="Zorb" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-6 py-3 bg-cyan-500/20 rounded-xl border-2 border-cyan-400 text-cyan-300 font-bold group-hover:bg-cyan-500/30 transition-all">
                  ENTER TESTNET →
                </div>
              </div>
            </div>
          </Link>

          {/* Abstract Chain Card */}
          <Link href="/abstract" className="block">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-3xl p-6 border-4 border-cyan-500/50 hover:border-cyan-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 w-full"
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

          {/* Abstract Testnet Card */}
          <Link href="/abstract-testnet" className="block">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-3xl p-6 border-4 border-purple-500/50 hover:border-purple-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 w-full"
            >
              <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">🧪</div>
                <h2 className="text-4xl font-alien text-yellow-300 mb-4 holographic-text">ABSTRACT TESTNET</h2>

                <div className="flex justify-center items-center gap-4 mb-6">
                  <img src="/j3d1.jpg" alt="J3D1" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/zit.png" alt="Zit" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-6 py-3 bg-yellow-500/20 rounded-xl border-2 border-yellow-400 text-yellow-300 font-bold group-hover:bg-yellow-500/30 transition-all">
                  ENTER TESTNET →
                </div>
              </div>
            </div>
          </Link>

          {/* Blast Card */}
          <Link href="/blast" className="block">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-yellow-900/40 to-red-900/40 rounded-3xl p-6 border-4 border-yellow-500/50 hover:border-yellow-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/50 w-full"
            >
              <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">💥</div>
                <h2 className="text-4xl font-alien text-yellow-300 mb-4 holographic-text">BLAST CHAIN</h2>

                <div className="flex justify-center items-center gap-4 mb-6">
                  <img src="/apelian.png" alt="Apelian" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/baob.png" alt="Baob" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-6 py-3 bg-yellow-500/20 rounded-xl border-2 border-yellow-400 text-yellow-300 font-bold group-hover:bg-yellow-500/30 transition-all">
                  ENTER BLAST →
                </div>
              </div>
            </div>
          </Link>

          {/* Blast Sepolia Card */}
          <Link href="/blast-sepolia" className="block">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-orange-900/40 to-red-900/40 rounded-3xl p-6 border-4 border-orange-500/50 hover:border-orange-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 w-full"
            >
              <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">🧪</div>
                <h2 className="text-4xl font-alien text-orange-300 mb-4 holographic-text">BLAST SEPOLIA</h2>

                <div className="flex justify-center items-center gap-4 mb-6">
                  <img src="/j3d1.jpg" alt="J3D1" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/zit.png" alt="Zit" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-6 py-3 bg-orange-500/20 rounded-xl border-2 border-orange-400 text-orange-300 font-bold group-hover:bg-orange-500/30 transition-all">
                  ENTER TESTNET →
                </div>
              </div>
            </div>
          </Link>

          {/* Arbitrum Card */}
          <Link href="/arbitrum" className="block">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-3xl p-6 border-4 border-blue-500/50 hover:border-blue-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 w-full"
            >
              <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">🔷</div>
                <h2 className="text-4xl font-alien text-blue-300 mb-4 holographic-text">ARBITRUM</h2>

                <div className="flex justify-center items-center gap-4 mb-6">
                  <img src="/nyx.png" alt="Nyx" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/zorb.png" alt="Zorb" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-6 py-3 bg-blue-500/20 rounded-xl border-2 border-blue-400 text-blue-300 font-bold group-hover:bg-blue-500/30 transition-all">
                  ENTER ARBITRUM →
                </div>
              </div>
            </div>
          </Link>

          {/* Arbitrum Sepolia Card */}
          <Link href="/arbitrum-sepolia" className="block">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-cyan-900/40 to-teal-900/40 rounded-3xl p-6 border-4 border-cyan-500/50 hover:border-cyan-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 w-full"
            >
              <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">🧪</div>
                <h2 className="text-4xl font-alien text-cyan-300 mb-4 holographic-text">ARBITRUM SEPOLIA</h2>

                <div className="flex justify-center items-center gap-4 mb-6">
                  <img src="/apelian.png" alt="Apelian" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/baob.png" alt="Baob" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-6 py-3 bg-cyan-500/20 rounded-xl border-2 border-cyan-400 text-cyan-300 font-bold group-hover:bg-cyan-500/30 transition-all">
                  ENTER TESTNET →
                </div>
              </div>
            </div>
          </Link>

          {/* Polygon Card */}
          <Link href="/polygon" className="block">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-3xl p-6 border-4 border-purple-500/50 hover:border-purple-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 w-full"
            >
              <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">🟣</div>
                <h2 className="text-4xl font-alien text-purple-300 mb-4 holographic-text">POLYGON</h2>

                <div className="flex justify-center items-center gap-4 mb-6">
                  <img src="/j3d1.jpg" alt="J3D1" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/zit.png" alt="Zit" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-6 py-3 bg-purple-500/20 rounded-xl border-2 border-purple-400 text-purple-300 font-bold group-hover:bg-purple-500/30 transition-all">
                  ENTER POLYGON →
                </div>
              </div>
            </div>
          </Link>

          {/* Polygon Amoy Card */}
          <Link href="/polygon-amoy" className="block">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-indigo-900/40 to-violet-900/40 rounded-3xl p-6 border-4 border-indigo-500/50 hover:border-indigo-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/50 w-full"
            >
              <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">🧪</div>
                <h2 className="text-4xl font-alien text-indigo-300 mb-4 holographic-text">POLYGON AMOY</h2>

                <div className="flex justify-center items-center gap-4 mb-6">
                  <img src="/nyx.png" alt="Nyx" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/zorb.png" alt="Zorb" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-6 py-3 bg-indigo-500/20 rounded-xl border-2 border-indigo-400 text-indigo-300 font-bold group-hover:bg-indigo-500/30 transition-all">
                  ENTER TESTNET →
                </div>
              </div>
            </div>
          </Link>

          {/* Avalanche Card */}
          <Link href="/avalanche" className="block">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-red-900/40 to-rose-900/40 rounded-3xl p-6 border-4 border-red-500/50 hover:border-red-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-red-500/50 w-full"
            >
              <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">🔺</div>
                <h2 className="text-4xl font-alien text-red-300 mb-4 holographic-text">AVALANCHE</h2>

                <div className="flex justify-center items-center gap-4 mb-6">
                  <img src="/apelian.png" alt="Apelian" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/baob.png" alt="Baob" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-6 py-3 bg-red-500/20 rounded-xl border-2 border-red-400 text-red-300 font-bold group-hover:bg-red-500/30 transition-all">
                  ENTER AVALANCHE →
                </div>
              </div>
            </div>
          </Link>

          {/* Avalanche Fuji Card */}
          <Link href="/avalanche-fuji" className="block">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-rose-900/40 to-pink-900/40 rounded-3xl p-6 border-4 border-rose-500/50 hover:border-rose-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-rose-500/50 w-full"
            >
              <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">🧪</div>
                <h2 className="text-4xl font-alien text-rose-300 mb-4 holographic-text">AVALANCHE FUJI</h2>

                <div className="flex justify-center items-center gap-4 mb-6">
                  <img src="/j3d1.jpg" alt="J3D1" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/zit.png" alt="Zit" className="animate-bounce" style={{width: '70px', height: '70px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-6 py-3 bg-rose-500/20 rounded-xl border-2 border-rose-400 text-rose-300 font-bold group-hover:bg-rose-500/30 transition-all">
                  ENTER TESTNET →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Abstract XP Rewards Banner */}
        <div className="flex justify-center mt-16 mb-8 px-6">
          <div className="max-w-4xl w-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 rounded-2xl p-6 backdrop-blur-sm animate-pulse">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-3xl font-alien text-purple-300 holographic-text">⚡ EARN ABSTRACT XP ⚡</h3>
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

        {/* Buy Gumbuo Buttons with Mascots */}
        <div className="flex flex-col items-center space-y-6 mt-16 mb-12">
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
