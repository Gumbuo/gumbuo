"use client";
import dynamic from "next/dynamic";

const AlienMarketplace = dynamic(() => import("./AlienMarketplace"), { ssr: false });

export default function AlienMarketAndArena() {
  return (
    <div className="flex flex-col items-center space-y-12 p-8 max-w-[95%] rounded-2xl relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #2a2a2a 100%)',
      boxShadow: 'inset 0 0 80px rgba(0,255,200,0.1), 0 0 40px rgba(0,0,0,0.8)'
    }}>
      {/* UFO Interior Metal Panel Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(255,255,255,0.03) 60px, rgba(255,255,255,0.03) 61px),
          repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.03) 60px, rgba(255,255,255,0.03) 61px)
        `,
        zIndex: 1
      }}></div>

      {/* Corner Rivets */}
      {[
        { top: '20px', left: '20px' },
        { top: '20px', right: '20px' },
        { bottom: '20px', left: '20px' },
        { bottom: '20px', right: '20px' }
      ].map((pos, i) => (
        <div
          key={`corner-rivet-${i}`}
          className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-gray-600 to-gray-800"
          style={{
            ...pos,
            zIndex: 2,
            boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.8), 0 0 5px rgba(255,255,255,0.2)'
          }}
        />
      ))}

      {/* Top Control Panel Bar */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 flex items-center justify-between px-8" style={{ zIndex: 3 }}>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" style={{ animationDuration: '2s' }}></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50 animate-pulse" style={{ animationDuration: '1.5s' }}></div>
          <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50 animate-pulse" style={{ animationDuration: '1.8s' }}></div>
        </div>
        <div className="bg-black/80 px-4 py-1 rounded border border-orange-400/50 text-orange-400 text-xs font-mono">
          SYSTEM ACTIVE
        </div>
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border border-gray-500 relative">
            <div className="absolute top-1/2 left-1/2 w-0.5 h-2 bg-orange-400 rounded-full" style={{ transform: 'translate(-50%, -50%) rotate(30deg)', transformOrigin: 'center bottom' }}></div>
          </div>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border border-gray-500 relative">
            <div className="absolute top-1/2 left-1/2 w-0.5 h-2 bg-cyan-400 rounded-full" style={{ transform: 'translate(-50%, -50%) rotate(-45deg)', transformOrigin: 'center bottom' }}></div>
          </div>
        </div>
      </div>

      {/* Vertical Pipes on Left */}
      <div className="absolute left-0 top-12 bottom-0 w-8 bg-gradient-to-r from-gray-700 to-gray-600 border-r border-gray-500" style={{ zIndex: 2 }}>
        <div className="w-1 h-full bg-gradient-to-b from-transparent via-orange-400/40 to-transparent ml-3"></div>
      </div>

      {/* Vertical Pipes on Right */}
      <div className="absolute right-0 top-12 bottom-0 w-8 bg-gradient-to-l from-gray-700 to-gray-600 border-l border-gray-500" style={{ zIndex: 2 }}>
        <div className="w-1 h-full bg-gradient-to-b from-transparent via-purple-400/40 to-transparent mr-3"></div>
      </div>

      {/* Content with proper spacing for pipes */}
      <div className="relative z-10 w-full mt-8">
        <h1 className="font-alien font-bold holographic-text tracking-wider text-center mb-8" style={{fontSize: '4.5rem'}}>
          <span className="text-orange-400">🛸 Gumbuo Fighters UFO Marketplace 👽</span>
        </h1>

        {/* Marketplace Section */}
        <AlienMarketplace />
      </div>
    </div>
  );
}
