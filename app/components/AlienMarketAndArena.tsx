"use client";
import dynamic from "next/dynamic";

const AlienMarketplace = dynamic(() => import("./AlienMarketplace"), { ssr: false });
const GumbuoFightersArena = dynamic(() => import("./GumbuoFightersArena"), { ssr: false });

export default function AlienMarketAndArena() {
  return (
    <div className="flex flex-col items-center space-y-12 p-8 bg-black/40 backdrop-blur-sm max-w-[95%] rounded-3xl border border-orange-400/30">
      <h1 className="font-alien font-bold holographic-text tracking-wider text-center" style={{fontSize: '4.5rem'}}>
        <span className="text-orange-400">⚔️ Gumbuo Fighters Alien Marketplace and Arena 👽</span>
      </h1>

      {/* Marketplace Section */}
      <AlienMarketplace />

      {/* Divider */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent"></div>

      {/* Arena Section */}
      <GumbuoFightersArena />
    </div>
  );
}
