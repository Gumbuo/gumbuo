"use client";
import dynamic from "next/dynamic";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const AlienHUD = dynamic(() => import("@lib/hud").then(mod => mod.AlienHUD), { ssr: false });
const AlienMarketAndArena = dynamic(() => import("../app/components/AlienMarketAndArena"), { ssr: false });
const GumbuoBoss = dynamic(() => import("../app/components/GumbuoBoss"), { ssr: false });
const AlienMusicPlayer = dynamic(() => import("../app/components/AlienMusicPlayer"), { ssr: false });
const StarfieldBackground = dynamic(() => import("../app/components/StarfieldBackground"), { ssr: false });

export default function Home() {
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

      {/* Music Player - Middle Left */}
      <div className="fixed top-1/2 left-6 -translate-y-1/2 z-50">
        <AlienMusicPlayer />
      </div>

      {/* Top Right - Connect Button and HUD */}
      <div className="fixed top-6 right-6 z-50 flex flex-col items-end space-y-4">
        <ConnectButton />
        <AlienHUD />
      </div>

      {/* Content with proper spacing */}
      <div className="relative z-10 p-6">

        {/* Alien Market & Arena (Combined) */}
        <div className="flex justify-center mt-32">
          <AlienMarketAndArena />
        </div>

        {/* Gumbuo Boss Battle */}
        <div className="flex justify-center mt-32 mb-24">
          <GumbuoBoss />
        </div>

        {/* FoxHole Productions Credit */}
        <div className="flex justify-center mt-32 mb-12">
          <div className="flex items-center space-x-3 bg-black/60 backdrop-blur-sm px-6 py-3 rounded-xl border border-green-400/30 shadow-lg shadow-green-400/20">
            <div style={{width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', maxWidth: '48px', maxHeight: '48px', overflow: 'hidden'}}>
              <img
                src="/foxholeproductions.jpg"
                alt="FoxHole Productions"
                className="rounded-lg"
                style={{width: '48px', height: '48px', objectFit: 'cover', display: 'block'}}
              />
            </div>
            <div className="text-center">
              <p className="text-green-400 font-bold text-xl font-alien holographic-text">FoxHole Productions</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
