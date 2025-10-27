"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import AbstractBridge from "../components/AbstractBridge";
import AbstractSwap from "../components/AbstractSwap";
import AlienBadgeMinter from "../components/AlienBadgeMinter";
import AbstractXPDashboard from "../components/AbstractXPDashboard";
import AbstractActivityFeed from "../components/AbstractActivityFeed";
import AlienBackground from "../components/AlienBackground";
import FloatingGumbuo from "../components/FloatingGumbuo";
import GumbuoCard from "../components/GumbuoCard";
import AlienButton from "../components/AlienButton";

const Home = dynamic(() => import("@lib/Home"), { ssr: false });

type Tab = "overview" | "bridge" | "swap" | "badges" | "xp" | "activity";

export default function AbstractPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "overview", label: "Overview", emoji: "🏠" },
    { id: "bridge", label: "Bridge", emoji: "🌉" },
    { id: "swap", label: "Swap", emoji: "🔄" },
    { id: "badges", label: "Badges", emoji: "🎖️" },
    { id: "xp", label: "XP Tracker", emoji: "⭐" },
    { id: "activity", label: "Activity", emoji: "📊" },
  ];

  return (
    <div className="min-h-screen animated-gradient-bg relative overflow-hidden">
      {/* Alien Background Effects */}
      <AlienBackground />

      {/* Floating Gumbuo Mascot */}
      <FloatingGumbuo position="right" />

      {/* Hero Section */}
      <div className="relative pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-4 font-electro">
            <span className="holographic-text">Abstract XP Hub</span>
          </h1>
          <p className="text-2xl text-cyan-400 mb-3">
            Maximize Your Abstract XP & Airdrop Allocation
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Bridge, swap, mint, and earn. Every interaction on Abstract earns you XP
            that will determine your allocation in the upcoming Abstract token airdrop!
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
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
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GumbuoCard variant="neon" hoverable>
                <div className="text-5xl mb-3 alien-float">🌉</div>
                <h3 className="text-xl font-bold text-cyan-400 mb-2 font-electro">
                  Bridge Assets
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Bridge ETH from Ethereum to Abstract and earn massive XP. This is the #1 way to earn!
                </p>
                <AlienButton
                  onClick={() => setActiveTab("bridge")}
                  variant="primary"
                  size="sm"
                  icon="🌉"
                >
                  Start Bridging
                </AlienButton>
              </GumbuoCard>

              <GumbuoCard variant="portal" hoverable>
                <div className="text-5xl mb-3 alien-float" style={{ animationDelay: "0.5s" }}>
                  🔄
                </div>
                <h3 className="text-xl font-bold text-purple-400 mb-2 font-electro">
                  Swap Tokens
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Trade tokens on Abstract using Uniswap V3 and Symbiosis. Each swap = more XP!
                </p>
                <AlienButton
                  onClick={() => setActiveTab("swap")}
                  variant="secondary"
                  size="sm"
                  icon="🔄"
                >
                  Start Swapping
                </AlienButton>
              </GumbuoCard>

              <GumbuoCard variant="cyber" hoverable>
                <div className="text-5xl mb-3 alien-float" style={{ animationDelay: "1s" }}>
                  🎖️
                </div>
                <h3 className="text-xl font-bold text-green-400 mb-2 font-electro">
                  Mint Badges
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Mint exclusive Alien NFT badges tied to your points. Limited edition collectibles!
                </p>
                <AlienButton
                  onClick={() => setActiveTab("badges")}
                  variant="success"
                  size="sm"
                  icon="🎖️"
                >
                  View Badges
                </AlienButton>
              </GumbuoCard>
            </div>

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
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">How to Maximize XP</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                        <div className="font-bold text-purple-400">1. Bridge Often</div>
                        <div className="text-sm text-gray-400">Bridge assets from L1 to L2</div>
                      </div>
                      <div className="p-3 bg-cyan-900/30 rounded-lg border border-cyan-500/30">
                        <div className="font-bold text-cyan-400">2. Swap Regularly</div>
                        <div className="text-sm text-gray-400">Trade on DEXes frequently</div>
                      </div>
                      <div className="p-3 bg-green-900/30 rounded-lg border border-green-500/30">
                        <div className="font-bold text-green-400">3. Use dApps</div>
                        <div className="text-sm text-gray-400">Interact with Abstract apps</div>
                      </div>
                      <div className="p-3 bg-pink-900/30 rounded-lg border border-pink-500/30">
                        <div className="font-bold text-pink-400">4. Mint NFTs</div>
                        <div className="text-sm text-gray-400">Create and collect on Abstract</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Component */}
            <div>
              <Home chainType="abstract" />
            </div>
          </div>
        )}

        {activeTab === "bridge" && <AbstractBridge />}
        {activeTab === "swap" && <AbstractSwap />}
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
