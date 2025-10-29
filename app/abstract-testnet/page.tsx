"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import AlienBadgeMinter from "../components/AlienBadgeMinter";
import AbstractXPDashboard from "../components/AbstractXPDashboard";
import AbstractActivityFeed from "../components/AbstractActivityFeed";
import AlienBackground from "../components/AlienBackground";
import FloatingGumbuo from "../components/FloatingGumbuo";
import GumbuoCard from "../components/GumbuoCard";
import AbstractArena from "../components/AbstractArena";

const AlienHUD = dynamic(() => import("@lib/hud").then(mod => mod.AlienHUD), { ssr: false });

const Home = dynamic(() => import("@lib/Home"), { ssr: false });

type Tab = "overview" | "games" | "arena" | "badges" | "xp" | "activity";

export default function AbstractTestnetPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "overview", label: "Overview", emoji: "🏠" },
    { id: "games", label: "AP Arena", emoji: "🎮" },
    { id: "arena", label: "ETH Arena", emoji: "⚔️" },
    { id: "badges", label: "Badges", emoji: "🎖️" },
    { id: "xp", label: "XP Tracker", emoji: "⭐" },
    { id: "activity", label: "Activity", emoji: "📊" },
  ];

  return (
    <div className="min-h-screen animated-gradient-bg relative overflow-hidden">
      {/* Alien Background Effects */}
      <AlienBackground />

      {/* Alien Vibes - Top Left */}
      <div className="fixed top-6 left-6 z-50">
        <div className="holographic-panel glass-panel p-4 rounded-xl">
          <div className="corner-glow corner-glow-tl"></div>
          <div className="corner-glow corner-glow-br"></div>
          <div className="relative z-10 flex items-center gap-3">
            <span className="text-4xl animate-pulse">👽</span>
            <span className="text-2xl font-alien text-yellow-400 holographic-text">TESTNET</span>
          </div>
        </div>
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

      {/* Hero Section */}
      <div className="relative pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-4 font-electro">
            <span className="holographic-text">Abstract Testnet</span>
          </h1>
          <p className="text-2xl text-yellow-400 mb-3">
            🧪 Test Environment - Practice Arena
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Test the NFT arena with testnet ETH! No real funds needed.
            <a href="https://faucet.testnet.abs.xyz" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline ml-2">
              Get testnet ETH →
            </a>
          </p>
        </div>
      </div>

      {/* Navigation Tabs - Always Visible */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-cyan-500/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-2 py-4 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg shadow-cyan-500/50"
                    : "bg-black/40 text-gray-400 hover:text-white hover:bg-black/60 border border-cyan-500/30"
                }`}
              >
                <span className="text-xl">{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* XP Info Section */}
            <div className="holographic-panel glass-panel p-8 rounded-2xl">
              <div className="corner-glow corner-glow-tl"></div>
              <div className="corner-glow corner-glow-br"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-cyan-400 mb-6 font-electro holographic-text">
                  🚀 About Abstract XP
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">What is Abstract XP?</h3>
                    <p className="text-gray-400 mb-4">
                      Abstract XP is a reward system that tracks your on-chain activity. The more you use
                      Abstract, the more XP you earn. XP determines your allocation in the upcoming
                      Abstract token airdrop in 2025.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✅ Validated on-chain automatically</li>
                      <li>✅ Updates weekly in your profile</li>
                      <li>✅ Can't be transferred or traded</li>
                      <li>✅ Earn badges for milestones</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Abstract Transaction Games Info */}
            <div className="holographic-panel glass-panel p-8 rounded-2xl">
              <div className="corner-glow corner-glow-tl"></div>
              <div className="corner-glow corner-glow-br"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-purple-400 mb-6 font-electro holographic-text">
                  ⚔️ Play to Earn Abstract XP
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-xl border border-red-500/30">
                    <h3 className="text-2xl font-bold text-red-400 mb-3">👹 Boss Battles</h3>
                    <p className="text-gray-300 mb-4">
                      Fight the Gumbuo Boss using real ETH transactions on Abstract! Each attack costs almost nothing - spam as many attacks as you want!
                    </p>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>👊 <span className="text-cyan-400 font-bold">All Attacks:</span> 0.0000001 ETH (~$0.0003)</li>
                      <li>💥 <span className="text-yellow-400 font-bold">Ultra Cheap!</span> Spam attacks for max XP</li>
                      <li>⚡ <span className="text-green-400 font-bold">More TX = More XP!</span></li>
                    </ul>
                    <div className="mt-4 p-3 bg-black/40 rounded-lg">
                      <div className="text-green-400 font-bold">🔥 Spam attacks to farm Abstract XP!</div>
                      <div className="text-xs text-gray-500 mt-1">Every transaction counts toward your airdrop</div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30">
                    <h3 className="text-2xl font-bold text-purple-400 mb-3">⚔️ ETH Arena - Winner Takes All</h3>
                    <p className="text-gray-300 mb-4">
                      Battle your aliens in the ETH Arena where the winner takes all! Real blockchain battles with real rewards.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>👽 <span className="text-green-400 font-bold">Entry Fee:</span> 0.0000002 ETH per fighter (~$0.0006)</li>
                      <li>💰 <span className="text-yellow-400 font-bold">Winner Gets:</span> 0.0000004 ETH (100% of prize pool)</li>
                      <li>🔥 Both aliens burn after the fight</li>
                      <li>📈 Earn Abstract XP with every battle</li>
                    </ul>
                    <div className="mt-4 p-3 bg-black/40 rounded-lg">
                      <div className="text-green-400 font-bold">🏆 High-stakes PvP battles!</div>
                      <div className="text-xs text-gray-500 mt-1">Real ETH on the line - winner takes all</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <div className="font-bold text-yellow-400 mb-1">Real Transactions on Abstract</div>
                      <div className="text-sm text-gray-400">
                        All boss attacks and arena fights require real ETH transactions on Abstract chain.
                        Make sure you're connected to Abstract (Chain ID: 2741) and have enough ETH for gas + transaction costs.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setActiveTab("games")}
                    className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-purple-500/50"
                  >
                    🎮 Start Playing & Earning XP
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "games" && (
          <div>
            <div className="holographic-panel glass-panel p-6 rounded-2xl mb-8">
              <div className="corner-glow corner-glow-tl"></div>
              <div className="corner-glow corner-glow-br"></div>
              <div className="relative z-10 text-center">
                <h2 className="text-3xl font-bold text-purple-400 mb-3 font-electro holographic-text">
                  🎮 Transaction-Based Games
                </h2>
                <p className="text-gray-400">
                  All games require real ETH transactions on Abstract. Each transaction earns you Abstract XP!
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-lg">
                  <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-green-400 font-bold">Connected to Abstract Chain</span>
                </div>
              </div>
            </div>
            <Home chainType="abstract-testnet" />
          </div>
        )}

        {activeTab === "arena" && <AbstractArena />}
        {activeTab === "badges" && <AlienBadgeMinter />}
        {activeTab === "xp" && <AbstractXPDashboard />}
        {activeTab === "activity" && <AbstractActivityFeed />}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
