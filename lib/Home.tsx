"use client";
import dynamic from "next/dynamic";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const AlienHUD = dynamic(() => import("@lib/hud").then(mod => mod.AlienHUD), { ssr: false });
const AlienWheel = dynamic(() => import("../app/components/AlienWheel"), { ssr: false });
const AlienDripStation = dynamic(() => import("../app/components/AlienDripStation"), { ssr: false });
const AlienLeaderboard = dynamic(() => import("../app/components/AlienLeaderboard"), { ssr: false });

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

          <div className="flex items-center justify-center space-x-6">
            <img src="/nyx.png" alt="Nyx" className="animate-bounce" style={{width: '80px', height: '80px', maxWidth: '80px', maxHeight: '80px', objectFit: 'cover', animationDuration: '2s'}} />
            <a
              href="https://thirdweb.com/base/0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-24 py-8 bg-green-400 text-black font-bold rounded-2xl hover:bg-green-500 transition-colors duration-200 tracking-wider"
              style={{fontSize: '4rem'}}
            >
              Buy Gumbuo
            </a>
            <img src="/zorb.png" alt="Zorb" className="animate-bounce" style={{width: '80px', height: '80px', maxWidth: '80px', maxHeight: '80px', objectFit: 'cover', animationDuration: '2s', animationDelay: '0.5s'}} />
          </div>
        </div>

        {/* Right side layout */}
        <div className="flex flex-col items-end space-y-6">
          {/* Connect Button on top right */}
          <ConnectButton />

          {/* AlienHUD below it */}
          <AlienHUD />
        </div>

        {/* Wheel and Drip Station - Side by Side, Aligned */}
        <div className="flex justify-center items-stretch space-x-16 mt-12 mb-12 px-4">
          <AlienWheel />
          <AlienDripStation />
        </div>

        {/* Alien Leaderboard - Full width below */}
        <div className="flex justify-center mt-12 mb-12">
          <AlienLeaderboard />
        </div>
      </div>
    </main>
  );
}
