"use client";
import dynamic from "next/dynamic";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const AlienHUD = dynamic(() => import("@lib/hud").then(mod => mod.AlienHUD), { ssr: false });
const AlienWheel = dynamic(() => import("../app/components/AlienWheel"), { ssr: false });
const AlienDripStation = dynamic(() => import("../app/components/AlienDripStation"), { ssr: false });
const AlienLeaderboard = dynamic(() => import("../app/components/AlienLeaderboard"), { ssr: false });
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

      {/* Content with proper spacing */}
      <div className="relative z-10 p-6">
        {/* Top center - Welcome header and Buy button */}
        <div className="flex flex-col items-center space-y-8 mb-8">
          {/* Header with mascots */}
          <div className="flex items-center justify-center space-x-8">
            <img src="/nyx.png" alt="Nyx" className="animate-bounce" style={{width: '120px', height: '120px', maxWidth: '120px', maxHeight: '120px', objectFit: 'cover', animationDuration: '2s'}} />
            <h1 className="font-bold text-green-400 tracking-wider" style={{fontSize: '8rem'}}>
              Welcome To Gumbuo
            </h1>
            <img src="/zorb.png" alt="Zorb" className="animate-bounce" style={{width: '120px', height: '120px', maxWidth: '120px', maxHeight: '120px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
          </div>

          <div className="flex flex-col items-center space-y-4">
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
            <div className="flex gap-6 mt-4">
              <a
                href="https://x.com/gumbuogw3"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500/80 hover:bg-blue-600 px-12 py-6 rounded-xl text-white font-bold text-3xl transition-all hover:scale-110 shadow-lg hover:shadow-blue-400/50 flex items-center gap-3"
              >
                <span className="text-4xl">𝕏</span>
                <span>Twitter</span>
              </a>
              <a
                href="https://discord.gg/NptkDYn8fm"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-500/80 hover:bg-purple-600 px-12 py-6 rounded-xl text-white font-bold text-3xl transition-all hover:scale-110 shadow-lg hover:shadow-purple-400/50 flex items-center gap-3"
              >
                <span className="text-4xl">💬</span>
                <span>Discord</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right side layout */}
        <div className="flex flex-col items-end space-y-6">
          {/* Connect Button on top right */}
          <ConnectButton />

          {/* AlienHUD below it */}
          <AlienHUD />

          {/* Music Player on right side */}
          <AlienMusicPlayer />
        </div>

        {/* Wheel and Drip Station - Stacked */}
        <div className="flex flex-col items-center space-y-12 mt-12">
          <AlienWheel />
          <AlienDripStation />
        </div>

        {/* Alien Leaderboard */}
        <div className="flex justify-center mt-12">
          <AlienLeaderboard />
        </div>

        {/* Alien Market & Arena (Combined) */}
        <div className="flex justify-center mt-12">
          <AlienMarketAndArena />
        </div>

        {/* Gumbuo Boss Battle */}
        <div className="flex justify-center mt-12 mb-12">
          <GumbuoBoss />
        </div>

        {/* FoxHole Productions Credit */}
        <div className="flex justify-center mt-12 mb-8">
          <div className="flex items-center space-x-4 bg-black/60 backdrop-blur-sm px-8 py-4 rounded-2xl border border-green-400/30 shadow-lg shadow-green-400/20">
            <img
              src="/foxholeproductions.jpg"
              alt="FoxHole Productions"
              className="w-16 h-16 object-contain rounded-lg"
            />
            <div className="text-center">
              <p className="text-green-400 font-bold text-2xl font-alien holographic-text">FoxHole Productions</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
