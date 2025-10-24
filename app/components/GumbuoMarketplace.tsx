"use client";
import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";

const GMB_TOKEN_ADDRESS = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";

interface GumbuoPic {
  id: string;
  name: string;
  price: number; // In GMB tokens (1:1 with AP)
  image: string;
  description: string;
  comingSoon: boolean;
}

// GMB-purchasable alien pics - Coming Soon!
const GUMBUO_PICS: GumbuoPic[] = [
  { id: "gmb_nyx", name: "Nyx Premium Edition", price: 500, image: "/nyx.png", description: "Exclusive premium Nyx with special abilities", comingSoon: true },
  { id: "gmb_zorb", name: "Zorb Premium Edition", price: 500, image: "/zorb.png", description: "Exclusive premium Zorb with cosmic powers", comingSoon: true },
  { id: "gmb_fighter_1", name: "Elite Fighter Alpha", price: 1000, image: "/nyx.png", description: "Legendary elite fighter with rare traits", comingSoon: true },
  { id: "gmb_fighter_2", name: "Elite Fighter Beta", price: 1000, image: "/zorb.png", description: "Legendary elite fighter with unique powers", comingSoon: true },
  { id: "gmb_legendary", name: "Legendary Cosmic Beast", price: 5000, image: "/nyx.png", description: "Ultra-rare legendary cosmic creature", comingSoon: true },
  { id: "gmb_mythic", name: "Mythic Void Entity", price: 10000, image: "/zorb.png", description: "One-of-a-kind mythic void entity", comingSoon: true },
];

export default function GumbuoMarketplace() {
  const { address, isConnected } = useAccount();
  const { data: gmbBalance } = useBalance({
    address,
    token: GMB_TOKEN_ADDRESS as `0x${string}`
  });

  const gmbAmount = parseFloat(gmbBalance?.formatted || "0");

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-gradient-to-br from-black via-purple-900/30 to-black bg-opacity-95 rounded-xl max-w-6xl w-full relative overflow-hidden shadow-2xl shadow-purple-500/50">
      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 animate-pulse"></div>

      {/* Scan line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-400/5 to-transparent animate-scan pointer-events-none"></div>

      <h2 className="text-5xl font-bold holographic-text tracking-wider flex items-center justify-center space-x-2 drop-shadow-lg relative z-10">
        <span className="animate-glow">💎 GMB Token Marketplace 💎</span>
      </h2>

      <div className="text-center text-purple-400">
        <p className="text-xl mb-2">🚀 Premium Gumbuo Fighters - Pay with GMB Tokens! 🚀</p>
        <p className="text-sm opacity-75">Exclusive NFTs purchasable only with GMB tokens (1 GMB = 1 AP value)</p>
      </div>

      {/* Coming Soon Banner */}
      <div className="w-full bg-gradient-to-r from-yellow-400/20 via-yellow-400/30 to-yellow-400/20 border-2 border-yellow-400 rounded-lg p-6 relative overflow-hidden shadow-lg shadow-yellow-400/50 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-shimmer pointer-events-none"></div>
        <div className="text-center relative z-10">
          <p className="text-yellow-400 text-3xl font-bold mb-2">🚧 COMING SOON! 🚧</p>
          <p className="text-yellow-400 text-lg">
            Smart contract in development. Premium GMB marketplace will launch soon!
          </p>
          <p className="text-yellow-300 text-sm mt-2 opacity-75">
            These exclusive fighters will only be available for GMB token holders
          </p>
        </div>
      </div>

      {/* User GMB Balance */}
      {isConnected && address ? (
        <div className="w-full bg-purple-400 bg-opacity-20 border border-purple-400 rounded-lg p-4 text-center">
          <p className="text-purple-400 text-lg">
            💰 Your GMB Balance: <span className="font-bold text-3xl">{gmbAmount.toLocaleString()}</span>
          </p>
        </div>
      ) : (
        <p className="text-yellow-400 text-center">⚠️ Connect your wallet to view GMB balance!</p>
      )}

      {/* GMB Pics Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
        {GUMBUO_PICS.map((pic) => {
          return (
            <div
              key={pic.id}
              className="bg-black bg-opacity-50 border border-purple-600 rounded-lg p-4 relative"
            >
              {/* Coming Soon Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm rounded-lg flex items-center justify-center z-20">
                <div className="text-center">
                  <p className="text-yellow-400 text-2xl font-bold mb-2">🔒 COMING SOON</p>
                  <p className="text-yellow-300 text-sm">Smart Contract Required</p>
                </div>
              </div>

              {/* Image */}
              <div className="relative mb-4">
                <img
                  src={pic.image}
                  alt={pic.name}
                  className="w-full h-48 object-cover rounded-lg grayscale blur-sm"
                />
                <div className="absolute top-2 right-2 bg-purple-600 text-white font-bold px-3 py-1 rounded-lg text-sm">
                  PREMIUM
                </div>
              </div>

              {/* Details */}
              <h3 className="text-2xl font-bold text-purple-400 mb-2">{pic.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{pic.description}</p>

              {/* Price */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-yellow-400 font-bold text-xl">
                  {pic.price.toLocaleString()} GMB
                </span>
                <span className="text-gray-500 text-sm">
                  (≈ {pic.price.toLocaleString()} AP value)
                </span>
              </div>

              {/* Disabled Button */}
              <button
                disabled
                className="w-full px-6 py-3 text-lg font-bold rounded-lg tracking-wider bg-gray-700 text-gray-500 cursor-not-allowed"
              >
                COMING SOON
              </button>
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="w-full text-purple-400 text-xs text-center max-w-2xl bg-purple-400 bg-opacity-10 p-4 rounded-lg">
        <p className="font-bold mb-2">ℹ️ GMB Marketplace Info</p>
        <p className="opacity-75">
          The GMB marketplace will feature exclusive premium fighters only available to GMB token holders.
          Prices are 1:1 with Alien Points value, but purchases require GMB tokens via smart contract.
          Stay tuned for the launch! 🚀
        </p>
      </div>
    </div>
  );
}
