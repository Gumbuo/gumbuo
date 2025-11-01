"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useAlienPoints } from "../context/AlienPointContext";

interface Activity {
  id: string;
  type: "bridge" | "swap" | "mint" | "transfer";
  description: string;
  xpEarned: number;
  timestamp: number;
  emoji: string;
}

export default function AbstractXPDashboard() {
  const { address } = useAccount();
  const alien = useAlienPoints();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [estimatedXP, setEstimatedXP] = useState(0);

  const currentPoints = alien?.alienPoints || 100;

  // Load activities from localStorage
  useEffect(() => {
    if (address) {
      const saved = localStorage.getItem(`xp-activities-${address}`);
      if (saved) {
        setActivities(JSON.parse(saved));
      } else {
        // Initialize with sample activities
        const sampleActivities: Activity[] = [
          {
            id: "1",
            type: "bridge",
            description: "Bridged 0.1 ETH to Abstract",
            xpEarned: 50,
            timestamp: Date.now() - 86400000,
            emoji: "🌉",
          },
        ];
        setActivities(sampleActivities);
        localStorage.setItem(
          `xp-activities-${address}`,
          JSON.stringify(sampleActivities)
        );
      }
    }
  }, [address]);

  // Calculate estimated XP
  useEffect(() => {
    const totalXP = activities.reduce((sum, activity) => sum + activity.xpEarned, 0);
    setEstimatedXP(totalXP);
  }, [activities]);

  const openAbstractPortal = () => {
    window.open("https://portal.mainnet.abs.xyz/rewards", "_blank");
  };

  const addActivity = (activity: Omit<Activity, "id" | "timestamp">) => {
    if (!address) return;

    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    const updatedActivities = [newActivity, ...activities].slice(0, 20); // Keep last 20
    setActivities(updatedActivities);
    localStorage.setItem(
      `xp-activities-${address}`,
      JSON.stringify(updatedActivities)
    );
  };

  // Expose function globally for other components to use
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).addXPActivity = addActivity;
    }
  }, [address, activities]);

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "bridge":
        return "border-purple-500/50 bg-purple-900/20";
      case "swap":
        return "border-cyan-500/50 bg-cyan-900/20";
      case "mint":
        return "border-green-500/50 bg-green-900/20";
      case "transfer":
        return "border-yellow-500/50 bg-yellow-900/20";
      default:
        return "border-gray-500/50 bg-gray-900/20";
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="holographic-panel glass-panel p-8 rounded-3xl max-w-3xl mx-auto">
      {/* Corner glows */}
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2 font-electro holographic-text">
          ⭐ Abstract XP Dashboard
        </h2>
        <p className="text-green-400 text-sm mb-6">
          Track your XP-earning activities and airdrop progress!
        </p>

        {/* XP Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Estimated XP */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50">
            <div className="text-purple-400 text-sm mb-2">Estimated XP</div>
            <div className="text-4xl font-bold text-white mb-1">{estimatedXP}</div>
            <div className="text-xs text-gray-400">From on-chain activities</div>
          </div>

          {/* Total Activities */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-2 border-cyan-500/50">
            <div className="text-cyan-400 text-sm mb-2">Total Activities</div>
            <div className="text-4xl font-bold text-white mb-1">{activities.length}</div>
            <div className="text-xs text-gray-400">XP-earning actions</div>
          </div>

          {/* Alien Points */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/50">
            <div className="text-green-400 text-sm mb-2">Alien Points</div>
            <div className="text-4xl font-bold text-white mb-1">{currentPoints}</div>
            <div className="text-xs text-gray-400">Your current level</div>
          </div>
        </div>

        {/* Official XP Portal Button */}
        <div className="mb-6">
          <button
            onClick={openAbstractPortal}
            style={{
              width: '100%',
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              color: '#fff',
              border: '2px solid #a855f7',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
              fontSize: '16px',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #9333ea, #db2777)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(168, 85, 247, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #a855f7, #ec4899)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.5)';
            }}
          >
            🎖️ View Official Abstract XP & Badges
          </button>
        </div>

        {/* Activities Feed */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            📊 Recent XP Activities
          </h3>

          {activities.length === 0 ? (
            <div className="text-center p-8 bg-black/30 rounded-3xl border border-gray-700">
              <p className="text-gray-400 mb-4">No activities yet!</p>
              <p className="text-sm text-gray-500">
                Start bridging, swapping, or minting to earn XP
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-4 rounded-3xl border-2 ${getActivityColor(
                    activity.type
                  )} transition-all duration-300 hover:scale-102`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl">{activity.emoji}</div>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-lg">
                        +{activity.xpEarned} XP
                      </div>
                      <div className="text-xs text-gray-400 uppercase">
                        {activity.type}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* XP Earning Guide */}
        <div className="p-6 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 rounded-3xl border border-cyan-500/30">
          <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
            💡 How to Earn More XP
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-2xl">🌉</span>
              <div>
                <div className="text-white font-bold">Bridge Assets</div>
                <div className="text-gray-400">Bridge ETH from L1 to Abstract</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-2xl">🔄</span>
              <div>
                <div className="text-white font-bold">Swap Tokens</div>
                <div className="text-gray-400">Trade on Uniswap or DEXes</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-2xl">🎖️</span>
              <div>
                <div className="text-white font-bold">Mint NFTs</div>
                <div className="text-gray-400">Mint badges and collectibles</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-2xl">📱</span>
              <div>
                <div className="text-white font-bold">Use dApps</div>
                <div className="text-gray-400">Interact with Abstract apps</div>
              </div>
            </div>
          </div>
        </div>

        {/* Airdrop Info */}
        <div className="mt-6 p-4 bg-yellow-900/20 rounded-3xl border border-yellow-500/30">
          <p className="text-yellow-400 text-sm">
            🎁 <strong>Airdrop Coming 2025:</strong> Your XP will determine your allocation
            of the Abstract token. Keep earning to maximize your rewards!
          </p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
