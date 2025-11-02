"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useAlienPoints } from "../context/AlienPointContext";
import { abstract } from "@lib/wagmi-abstract";

// Simple NFT badges users can mint based on Alien Points milestones
const BADGES = [
  {
    id: 1,
    name: "Alien Recruit",
    emoji: "👽",
    requiredPoints: 100,
    description: "Your first step into the cosmos",
    color: "from-green-500 to-emerald-600",
  },
  {
    id: 2,
    name: "Space Explorer",
    emoji: "🚀",
    requiredPoints: 500,
    description: "You've traveled far",
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: 3,
    name: "Galactic Commander",
    emoji: "🛸",
    requiredPoints: 1000,
    description: "Master of the universe",
    color: "from-purple-500 to-pink-600",
  },
  {
    id: 4,
    name: "Cosmic Legend",
    emoji: "⭐",
    requiredPoints: 5000,
    description: "You are one with the cosmos",
    color: "from-yellow-500 to-orange-600",
  },
];

export default function AlienBadgeMinter() {
  const { address, chain } = useAccount();
  const alien = useAlienPoints();
  const [mintedBadges, setMintedBadges] = useState<number[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<number | null>(null);
  const [minting, setMinting] = useState(false);

  const currentPoints = alien?.alienPoints || 100;
  const isOnAbstract = chain?.id === abstract.id;

  // Load minted badges from localStorage
  useEffect(() => {
    if (address) {
      const saved = localStorage.getItem(`minted-badges-${address}`);
      if (saved) {
        setMintedBadges(JSON.parse(saved));
      }
    }
  }, [address]);

  const handleMint = async (badgeId: number) => {
    if (!address || !isOnAbstract) return;

    setMinting(true);
    setSelectedBadge(badgeId);

    // Simulate minting process (in production, call actual NFT contract)
    setTimeout(() => {
      const newMinted = [...mintedBadges, badgeId];
      setMintedBadges(newMinted);
      localStorage.setItem(`minted-badges-${address}`, JSON.stringify(newMinted));
      setMinting(false);
      setSelectedBadge(null);
    }, 2000);
  };

  const canMint = (requiredPoints: number, badgeId: number) => {
    return (
      currentPoints >= requiredPoints &&
      !mintedBadges.includes(badgeId) &&
      isOnAbstract
    );
  };

  const isMinted = (badgeId: number) => mintedBadges.includes(badgeId);

  return (
    <div style={{borderRadius: '8px'}} className="holographic-panel glass-panel p-8 max-w-3xl mx-auto">
      {/* Corner glows */}
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2 font-electro holographic-text">
          🎖️ Alien Badge Collection
        </h2>
        <p className="text-green-400 text-sm mb-6">
          Mint NFT badges as you earn Alien Points! Each mint earns Abstract XP 🚀
        </p>

        {/* Current Points Display */}
        <div className="mb-8 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-3xl border border-purple-500/30">
          <div className="flex items-center justify-between">
            <span className="text-purple-400 font-bold">Your Alien Points:</span>
            <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 font-alien">
              {currentPoints}
            </span>
          </div>
        </div>

        {!isOnAbstract && (
          <div className="mb-6 p-4 bg-yellow-900/20 rounded-3xl border border-yellow-500/30">
            <p className="text-yellow-400 text-center">
              ⚠️ Switch to Abstract Chain to mint badges and earn XP!
            </p>
          </div>
        )}

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {BADGES.map((badge) => {
            const canMintBadge = canMint(badge.requiredPoints, badge.id);
            const isMintedBadge = isMinted(badge.id);
            const isLocked = currentPoints < badge.requiredPoints;

            return (
              <div
                key={badge.id}
                className={`p-6 rounded-3xl border-2 transition-all duration-300 ${
                  isMintedBadge
                    ? "bg-green-900/30 border-green-500"
                    : isLocked
                    ? "bg-gray-900/30 border-gray-700 opacity-60"
                    : "bg-black/40 border-cyan-500/50 hover:border-cyan-400"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-6xl">{badge.emoji}</div>
                  {isMintedBadge && (
                    <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MINTED ✓
                    </div>
                  )}
                  {isLocked && (
                    <div className="bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      🔒 LOCKED
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {badge.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{badge.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-cyan-400 text-sm">Required:</span>
                  <span className="text-white font-bold">
                    {badge.requiredPoints} Points
                  </span>
                </div>

                {!isMintedBadge && (
                  <button
                    onClick={() => handleMint(badge.id)}
                    disabled={!canMintBadge || minting}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      background: canMintBadge && !minting
                        ? `linear-gradient(135deg, ${badge.color.includes('green') ? '#3b82f6, #2563eb' : badge.color.includes('blue') ? '#3b82f6, #2563eb' : badge.color.includes('purple') ? '#3b82f6, #2563eb' : '#3b82f6, #2563eb'})`
                        : 'rgba(107, 114, 128, 0.5)',
                      color: '#fff',
                      border: canMintBadge && !minting
                        ? `2px solid ${badge.color.includes('green') ? '#3b82f6' : badge.color.includes('blue') ? '#3b82f6' : badge.color.includes('purple') ? '#3b82f6' : '#3b82f6'}`
                        : '2px solid rgba(107, 114, 128, 0.5)',
                      borderRadius: '8px',
                      cursor: canMintBadge && !minting ? 'pointer' : 'not-allowed',
                      fontFamily: 'Orbitron, sans-serif',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      transition: 'all 0.3s ease',
                      boxShadow: canMintBadge && !minting
                        ? `0 0 20px ${badge.color.includes('green') ? 'rgba(59, 130, 246, 0.5)' : badge.color.includes('blue') ? 'rgba(59, 130, 246, 0.5)' : badge.color.includes('purple') ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`
                        : 'none',
                      opacity: canMintBadge && !minting ? 1 : 0.5
                    }}
                  >
                    {minting && selectedBadge === badge.id
                      ? "Minting... 🌌"
                      : isLocked
                      ? `Need ${badge.requiredPoints - currentPoints} more points`
                      : "Mint Badge 🎖️"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* XP Earning Info */}
        <div className="p-4 bg-gradient-to-r from-green-900/20 to-cyan-900/20 rounded-3xl border border-green-500/30">
          <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2">
            ✨ NFT Minting = Abstract XP
          </h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>✅ Each badge mint earns you Abstract XP</li>
            <li>✅ Badges are permanent NFTs on Abstract Chain</li>
            <li>✅ Collect all badges to become a Cosmic Legend</li>
            <li>✅ More mints = more XP = bigger airdrop allocation</li>
          </ul>
        </div>

        {/* Minted Count */}
        {mintedBadges.length > 0 && (
          <div className="mt-4 text-center p-3 bg-purple-900/20 rounded-3xl border border-purple-500/30">
            <p className="text-purple-400 font-bold">
              🎖️ Badges Collected: {mintedBadges.length} / {BADGES.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
