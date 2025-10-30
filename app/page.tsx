"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCosmicSound } from "./hooks/useCosmicSound";

const AlienLeaderboard = dynamic(() => import("./components/AlienLeaderboard"), { ssr: false });
const AlienDripStation = dynamic(() => import("./components/AlienDripStation"), { ssr: false });
const AlienHUD = dynamic(() => import("@lib/hud").then(mod => mod.AlienHUD), { ssr: false });
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
        <div className="grid grid-cols-[1fr_auto_1fr] gap-6 mb-4 max-w-4xl mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-alien text-cyan-400 holographic-text">MAINNET</h3>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-alien text-cyan-400 holographic-text">PORTAL</h3>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-alien text-cyan-400 holographic-text">TESTNET</h3>
          </div>
        </div>

        {/* Base Chain Row */}
        <div className="flex items-center justify-center gap-1 mb-8 max-w-5xl mx-auto px-4">
          {/* Base Chain Card */}
          <Link href="/base" className="block flex-shrink-0 w-[280px]">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-3xl p-4 border-0 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50"
            >
              <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-5xl mb-3">⛓️</div>
                <h2 className="text-3xl font-alien text-blue-300 mb-3 holographic-text">BASE CHAIN</h2>

                <div className="flex justify-center items-center gap-3 mb-4">
                  <img src="/nyx.png" alt="Nyx" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/zorb.png" alt="Zorb" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-5 py-2 bg-blue-500/20 rounded-xl border-2 border-blue-400 text-blue-300 font-bold group-hover:bg-blue-500/30 transition-all text-sm">
                  ENTER BASE →
                </div>
              </div>
            </div>
          </Link>

          {/* Blue Portal */}
          <div className="flex items-center justify-center flex-shrink-0">
            <img src="/blueportal.png" alt="Portal" className="w-[150px] h-auto animate-pulse" style={{animationDuration: '3s'}} />
          </div>

          {/* Base Sepolia Card */}
          <Link href="/base-sepolia" className="block flex-shrink-0 w-[280px]">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-yellow-900/40 to-orange-900/40 rounded-3xl p-4 border-0 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/50"
            >
              <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-5xl mb-3">🧪</div>
                <h2 className="text-3xl font-alien text-cyan-300 mb-3 holographic-text">BASE SEPOLIA</h2>

                <div className="flex justify-center items-center gap-3 mb-4">
                  <img src="/nyx.png" alt="Nyx" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/zorb.png" alt="Zorb" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-5 py-2 bg-cyan-500/20 rounded-xl border-2 border-cyan-400 text-cyan-300 font-bold group-hover:bg-cyan-500/30 transition-all text-sm">
                  ENTER TESTNET →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Abstract Chain Row */}
        <div className="flex items-center justify-center gap-1 mb-8 max-w-5xl mx-auto px-4">
          {/* Abstract Chain Card */}
          <Link href="/abstract" className="block flex-shrink-0 w-[280px]">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-3xl p-4 border-0 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 w-full"
            >
              <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-5xl mb-3">⚡</div>
                <h2 className="text-3xl font-alien text-purple-300 mb-3 holographic-text">ABSTRACT CHAIN</h2>

                <div className="flex justify-center items-center gap-3 mb-4">
                  <img src="/apelian.png" alt="Apelian" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/baob.png" alt="Baob" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-5 py-2 bg-purple-500/20 rounded-xl border-2 border-purple-400 text-purple-300 font-bold group-hover:bg-purple-500/30 transition-all text-sm">
                  ENTER ABSTRACT →
                </div>
              </div>
            </div>
          </Link>

          {/* Green Portal */}
          <div className="flex items-center justify-center flex-shrink-0">
            <img src="/greenportal.png" alt="Portal" className="w-[150px] h-auto animate-pulse" style={{animationDuration: '3s'}} />
          </div>

          {/* Abstract Testnet Card */}
          <Link href="/abstract-testnet" className="block flex-shrink-0 w-[280px]">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-3xl p-4 border-0 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 w-full"
            >
              <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-5xl mb-3">🧪</div>
                <h2 className="text-3xl font-alien text-yellow-300 mb-3 holographic-text">ABSTRACT TESTNET</h2>

                <div className="flex justify-center items-center gap-3 mb-4">
                  <img src="/j3d1.jpg" alt="J3D1" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/zit.png" alt="Zit" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-5 py-2 bg-yellow-500/20 rounded-xl border-2 border-yellow-400 text-yellow-300 font-bold group-hover:bg-yellow-500/30 transition-all text-sm">
                  ENTER TESTNET →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Blast Chain Row */}
        <div className="flex items-center justify-center gap-1 mb-8 max-w-5xl mx-auto px-4">
          {/* Blast Card */}
          <Link href="/blast" className="block flex-shrink-0 w-[280px]">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-yellow-900/40 to-red-900/40 rounded-3xl p-4 border-0 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/50 w-full"
            >
              <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-5xl mb-3">💥</div>
                <h2 className="text-3xl font-alien text-yellow-300 mb-3 holographic-text">BLAST CHAIN</h2>

                <div className="flex justify-center items-center gap-3 mb-4">
                  <img src="/apelian.png" alt="Apelian" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/baob.png" alt="Baob" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-5 py-2 bg-yellow-500/20 rounded-xl border-2 border-yellow-400 text-yellow-300 font-bold group-hover:bg-yellow-500/30 transition-all text-sm">
                  ENTER BLAST →
                </div>
              </div>
            </div>
          </Link>

          {/* Grey Portal */}
          <div className="flex items-center justify-center flex-shrink-0">
            <img src="/greyportal.png" alt="Portal" className="w-[150px] h-auto animate-pulse" style={{animationDuration: '3s'}} />
          </div>

          {/* Blast Sepolia Card */}
          <Link href="/blast-sepolia" className="block flex-shrink-0 w-[280px]">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-orange-900/40 to-red-900/40 rounded-3xl p-4 border-0 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 w-full"
            >
              <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-5xl mb-3">🧪</div>
                <h2 className="text-3xl font-alien text-orange-300 mb-3 holographic-text">BLAST SEPOLIA</h2>

                <div className="flex justify-center items-center gap-3 mb-4">
                  <img src="/j3d1.jpg" alt="J3D1" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/zit.png" alt="Zit" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-5 py-2 bg-orange-500/20 rounded-xl border-2 border-orange-400 text-orange-300 font-bold group-hover:bg-orange-500/30 transition-all text-sm">
                  ENTER TESTNET →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Arbitrum Chain Row */}
        <div className="flex items-center justify-center gap-1 mb-8 max-w-5xl mx-auto px-4">
          {/* Arbitrum Card */}
          <Link href="/arbitrum" className="block flex-shrink-0 w-[280px]">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-3xl p-4 border-0 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 w-full"
            >
              <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-5xl mb-3">🔷</div>
                <h2 className="text-3xl font-alien text-blue-300 mb-3 holographic-text">ARBITRUM</h2>

                <div className="flex justify-center items-center gap-3 mb-4">
                  <img src="/nyx.png" alt="Nyx" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/zorb.png" alt="Zorb" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-5 py-2 bg-blue-500/20 rounded-xl border-2 border-blue-400 text-blue-300 font-bold group-hover:bg-blue-500/30 transition-all text-sm">
                  ENTER ARBITRUM →
                </div>
              </div>
            </div>
          </Link>

          {/* Blue Portal */}
          <div className="flex items-center justify-center flex-shrink-0">
            <img src="/blueportal.png" alt="Portal" className="w-[150px] h-auto animate-pulse" style={{animationDuration: '3s'}} />
          </div>

          {/* Arbitrum Sepolia Card */}
          <Link href="/arbitrum-sepolia" className="block flex-shrink-0 w-[280px]">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-cyan-900/40 to-teal-900/40 rounded-3xl p-4 border-0 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 w-full"
            >
              <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-5xl mb-3">🧪</div>
                <h2 className="text-3xl font-alien text-cyan-300 mb-3 holographic-text">ARBITRUM SEPOLIA</h2>

                <div className="flex justify-center items-center gap-3 mb-4">
                  <img src="/apelian.png" alt="Apelian" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/baob.png" alt="Baob" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-5 py-2 bg-cyan-500/20 rounded-xl border-2 border-cyan-400 text-cyan-300 font-bold group-hover:bg-cyan-500/30 transition-all text-sm">
                  ENTER TESTNET →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Polygon Chain Row */}
        <div className="flex items-center justify-center gap-1 mb-8 max-w-5xl mx-auto px-4">
          {/* Polygon Card */}
          <Link href="/polygon" className="block flex-shrink-0 w-[280px]">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-3xl p-4 border-0 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 w-full"
            >
              <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-5xl mb-3">🟣</div>
                <h2 className="text-3xl font-alien text-purple-300 mb-3 holographic-text">POLYGON</h2>

                <div className="flex justify-center items-center gap-3 mb-4">
                  <img src="/j3d1.jpg" alt="J3D1" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/zit.png" alt="Zit" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-5 py-2 bg-purple-500/20 rounded-xl border-2 border-purple-400 text-purple-300 font-bold group-hover:bg-purple-500/30 transition-all text-sm">
                  ENTER POLYGON →
                </div>
              </div>
            </div>
          </Link>

          {/* Purple Portal */}
          <div className="flex items-center justify-center flex-shrink-0">
            <img src="/purpleportal.png" alt="Portal" className="w-[150px] h-auto animate-pulse" style={{animationDuration: '3s'}} />
          </div>

          {/* Polygon Amoy Card */}
          <Link href="/polygon-amoy" className="block flex-shrink-0 w-[280px]">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-indigo-900/40 to-violet-900/40 rounded-3xl p-4 border-0 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/50 w-full"
            >
              <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-5xl mb-3">🧪</div>
                <h2 className="text-3xl font-alien text-indigo-300 mb-3 holographic-text">POLYGON AMOY</h2>

                <div className="flex justify-center items-center gap-3 mb-4">
                  <img src="/nyx.png" alt="Nyx" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/zorb.png" alt="Zorb" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-5 py-2 bg-indigo-500/20 rounded-xl border-2 border-indigo-400 text-indigo-300 font-bold group-hover:bg-indigo-500/30 transition-all text-sm">
                  ENTER TESTNET →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Avalanche Chain Row */}
        <div className="flex items-center justify-center gap-1 mb-16 max-w-5xl mx-auto px-4">
          {/* Avalanche Card */}
          <Link href="/avalanche" className="block flex-shrink-0 w-[280px]">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-red-900/40 to-rose-900/40 rounded-3xl p-4 border-0 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-red-500/50 w-full"
            >
              <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-5xl mb-3">🔺</div>
                <h2 className="text-3xl font-alien text-red-300 mb-3 holographic-text">AVALANCHE</h2>

                <div className="flex justify-center items-center gap-3 mb-4">
                  <img src="/apelian.png" alt="Apelian" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/baob.png" alt="Baob" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-5 py-2 bg-red-500/20 rounded-xl border-2 border-red-400 text-red-300 font-bold group-hover:bg-red-500/30 transition-all text-sm">
                  ENTER AVALANCHE →
                </div>
              </div>
            </div>
          </Link>

          {/* Red Portal */}
          <div className="flex items-center justify-center flex-shrink-0">
            <img src="/redportal.png" alt="Portal" className="w-[150px] h-auto animate-pulse" style={{animationDuration: '3s'}} />
          </div>

          {/* Avalanche Fuji Card */}
          <Link href="/avalanche-fuji" className="block flex-shrink-0 w-[280px]">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-rose-900/40 to-pink-900/40 rounded-3xl p-4 border-0 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-rose-500/50 w-full"
            >
              <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10">
                <div className="text-5xl mb-3">🧪</div>
                <h2 className="text-3xl font-alien text-rose-300 mb-3 holographic-text">AVALANCHE FUJI</h2>

                <div className="flex justify-center items-center gap-3 mb-4">
                  <img src="/j3d1.jpg" alt="J3D1" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/zit.png" alt="Zit" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>

                <div className="inline-block px-5 py-2 bg-rose-500/20 rounded-xl border-2 border-rose-400 text-rose-300 font-bold group-hover:bg-rose-500/30 transition-all text-sm">
                  ENTER TESTNET →
                </div>
              </div>
            </div>
          </Link>
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

          {/* Abstract Chain Buy Button - HIDDEN (keep for later) */}
          <div className="hidden flex flex-col items-center space-y-2">
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

          {/* Safety Message */}
          <div className="mt-6 max-w-3xl mx-auto bg-yellow-900/40 border-2 border-yellow-400/50 rounded-xl p-6 backdrop-blur-sm">
            <p className="text-yellow-300 font-bold text-center text-lg leading-relaxed">
              🔒 <span className="text-yellow-400">FOR SUPPORT:</span> PM <span className="text-green-400">FoxHole</span> or <span className="text-purple-400">Alien</span> on Discord or Twitter.
              <br />
              <span className="text-red-400 text-xl">⚠️ WE WILL NEVER PM YOU FIRST ⚠️</span>
              <br />
              <span className="text-yellow-200">You must trigger support for a response. BE SAFE!</span>
            </p>
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
