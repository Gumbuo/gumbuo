"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const AlienHUD = dynamic(() => import("@lib/hud").then(mod => mod.AlienHUD), { ssr: false });
const StarfieldBackground = dynamic(() => import("../components/StarfieldBackground"), { ssr: false });

// Sound effects
const playSound = (type: 'hover' | 'click') => {
  if (typeof window !== 'undefined') {
    const audio = new Audio(type === 'hover' ? '/hover.mp3' : '/click.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }
};

export default function BlastPage() {
  return (
    <main className="min-h-screen bg-black overflow-y-auto">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
        src="/alien.mp4"
      />

      {/* Starfield Parallax Background */}
      <StarfieldBackground />

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

      {/* Content with proper spacing */}
      <div className="relative z-10 p-6">

        {/* Alien Maze Game Link */}
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <h2 className="font-alien text-cyan-400 holographic-text mb-6 text-center" style={{fontSize: '3rem'}}>
            🛸 GUMBUO GAMES 🛸
          </h2>
          <Link href="/maze">
            <div
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="group relative bg-gradient-to-br from-green-900/40 to-cyan-900/40 rounded-3xl p-8 border-2 border-cyan-400 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 max-w-2xl"
            >
              <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 rounded-3xl transition-all duration-300"></div>

              <div className="relative z-10 text-center">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-4xl font-alien text-cyan-300 mb-4 holographic-text">ALIEN MAZE CHALLENGE</h3>
                <p className="text-cyan-400 text-lg mb-4">
                  Navigate the alien labyrinth using WASD! Collect cosmic treasures and earn Alien Points!
                </p>
                <div className="flex justify-center items-center gap-3 mb-4">
                  <img src="/apelian.png" alt="Apelian" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s'}} />
                  <img src="/j3d1.png" alt="J3D1" className="animate-bounce" style={{width: '60px', height: '60px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
                </div>
                <div className="inline-block px-8 py-3 bg-cyan-500/20 rounded-xl border-2 border-cyan-400 text-cyan-300 font-bold group-hover:bg-cyan-500/30 transition-all text-xl">
                  PLAY NOW →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* FoxHole Productions Credit */}
        <div className="flex justify-center mt-32 mb-12">
          <div className="flex items-center space-x-4 bg-black/60 backdrop-blur-sm px-8 py-4 rounded-xl border border-green-400/30 shadow-lg shadow-green-400/20">
            <div style={{width: '96px', height: '96px', minWidth: '96px', minHeight: '96px', maxWidth: '96px', maxHeight: '96px', overflow: 'hidden'}}>
              <img
                src="/foxholeproductions.jpg"
                alt="FoxHole Productions"
                className="rounded-lg"
                style={{width: '96px', height: '96px', objectFit: 'cover', display: 'block'}}
              />
            </div>
            <div className="text-center">
              <p className="text-green-400 font-bold text-2xl font-alien holographic-text">FoxHole Productions</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
