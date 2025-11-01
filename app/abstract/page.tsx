"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import NetworkSwitcher, { CHAIN_IDS, CHAIN_NAMES } from "../components/NetworkSwitcher";
import AlienBadgeMinter from "../components/AlienBadgeMinter";
import AbstractXPDashboard from "../components/AbstractXPDashboard";
import AbstractActivityFeed from "../components/AbstractActivityFeed";
import AbstractArena from "../components/AbstractArena";

const Home = dynamic(() => import("@lib/Home"), { ssr: false });

type Tab = "overview" | "games" | "arena" | "badges" | "xp" | "activity" | "maze";

export default function AbstractPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "overview", label: "Overview", emoji: "🏠" },
    { id: "games", label: "AP Arena", emoji: "🎮" },
    { id: "arena", label: "ETH Arena", emoji: "⚔️" },
    { id: "badges", label: "Badges", emoji: "🎖️" },
    { id: "xp", label: "XP Tracker", emoji: "⭐" },
    { id: "activity", label: "Activity", emoji: "📊" },
    { id: "maze", label: "Maze Game", emoji: "🎯" },
  ];

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#000' }}>
      {/* Network Switcher */}
      <NetworkSwitcher requiredChainId={CHAIN_IDS.ABSTRACT} chainName={CHAIN_NAMES[CHAIN_IDS.ABSTRACT]} />

      {/* Tab Selector */}
      <div style={{
        display: 'flex',
        gap: '10px',
        padding: '15px',
        background: 'linear-gradient(to bottom, #1a1a2e, #0f0f1e)',
        borderBottom: '2px solid #00ff99',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #00ff99, #00cc7a)'
                : 'rgba(0, 255, 153, 0.1)',
              color: activeTab === tab.id ? '#000' : '#00ff99',
              border: `2px solid ${activeTab === tab.id ? '#00ff99' : '#00ff9944'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
              fontSize: '14px',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === tab.id
                ? '0 0 20px rgba(0, 255, 153, 0.5)'
                : 'none',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'rgba(0, 255, 153, 0.2)';
                e.currentTarget.style.borderColor = '#00ff99';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'rgba(0, 255, 153, 0.1)';
                e.currentTarget.style.borderColor = '#00ff9944';
              }
            }}
          >
            <span style={{ marginRight: '8px' }}>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        background: '#000'
      }}>
        {activeTab === "overview" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* XP Info Section */}
            <div style={{
              padding: '32px',
              background: 'rgba(0, 255, 153, 0.05)',
              border: '2px solid #00ff9944',
              borderRadius: '24px'
            }}>
              <h2 style={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                color: '#00ff99',
                marginBottom: '24px',
                fontFamily: 'Orbitron, sans-serif'
              }}>
                🚀 About Abstract XP
              </h2>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>
                  What is Abstract XP?
                </h3>
                <p style={{ color: '#999', marginBottom: '16px' }}>
                  Abstract XP is a reward system that tracks your on-chain activity. The more you use
                  Abstract, the more XP you earn. XP determines your allocation in the upcoming
                  Abstract token airdrop in 2025.
                </p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: '#ccc' }}>
                  <li>✅ Validated on-chain automatically</li>
                  <li>✅ Updates weekly in your profile</li>
                  <li>✅ Can't be transferred or traded</li>
                  <li>✅ Earn badges for milestones</li>
                </ul>
              </div>
            </div>

            {/* Abstract Transaction Games Info */}
            <div style={{
              padding: '32px',
              background: 'rgba(0, 255, 153, 0.05)',
              border: '2px solid #00ff9944',
              borderRadius: '24px'
            }}>
              <h2 style={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                color: '#a855f7',
                marginBottom: '24px',
                fontFamily: 'Orbitron, sans-serif'
              }}>
                ⚔️ Play to Earn Abstract XP
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div style={{
                  padding: '24px',
                  background: 'rgba(255, 0, 0, 0.1)',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '24px'
                }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f87171', marginBottom: '12px' }}>
                    👹 Boss Battles
                  </h3>
                  <p style={{ color: '#ccc', marginBottom: '16px' }}>
                    Fight the Gumbuo Boss using real ETH transactions on Abstract! Each attack costs almost nothing - spam as many attacks as you want!
                  </p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: '#999' }}>
                    <li>👊 <span style={{ color: '#22d3ee', fontWeight: 'bold' }}>All Attacks:</span> 0.0000001 ETH (~$0.0003)</li>
                    <li>💥 <span style={{ color: '#facc15', fontWeight: 'bold' }}>Ultra Cheap!</span> Spam attacks for max XP</li>
                    <li>⚡ <span style={{ color: '#4ade80', fontWeight: 'bold' }}>More TX = More XP!</span></li>
                  </ul>
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '24px'
                  }}>
                    <div style={{ color: '#4ade80', fontWeight: 'bold' }}>🔥 Spam attacks to farm Abstract XP!</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>Every transaction counts toward your airdrop</div>
                  </div>
                </div>

                <div style={{
                  padding: '24px',
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '2px solid rgba(168, 85, 247, 0.4)',
                  borderRadius: '24px'
                }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#a855f7', marginBottom: '12px' }}>
                    ⚔️ ETH Arena - Winner Takes All
                  </h3>
                  <p style={{ color: '#ccc', marginBottom: '16px' }}>
                    Battle your aliens in the ETH Arena where the winner takes all! Real blockchain battles with real rewards.
                  </p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: '#999' }}>
                    <li>👽 <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Entry Fee:</span> 0.0000002 ETH per fighter (~$0.0006)</li>
                    <li>💰 <span style={{ color: '#facc15', fontWeight: 'bold' }}>Winner Gets:</span> 0.0000004 ETH (100% of prize pool)</li>
                    <li>🔥 Both aliens burn after the fight</li>
                    <li>📈 Earn Abstract XP with every battle</li>
                  </ul>
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '24px'
                  }}>
                    <div style={{ color: '#4ade80', fontWeight: 'bold' }}>🏆 High-stakes PvP battles!</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>Real ETH on the line - winner takes all</div>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'rgba(234, 179, 8, 0.1)',
                border: '2px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '24px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#facc15', marginBottom: '4px' }}>Real Transactions on Abstract</div>
                  <div style={{ fontSize: '0.875rem', color: '#999' }}>
                    All boss attacks and arena fights require real ETH transactions on Abstract chain.
                    Make sure you're connected to Abstract (Chain ID: 2741) and have enough ETH for gas + transaction costs.
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => setActiveTab("games")}
                  style={{
                    padding: '16px 32px',
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #9333ea, #ec4899)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    fontFamily: 'Orbitron, sans-serif',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🎮 Start Playing & Earning XP
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "games" && (
          <div>
            <div style={{
              padding: '24px',
              background: 'rgba(0, 255, 153, 0.05)',
              border: '2px solid #00ff9944',
              borderRadius: '24px',
              marginBottom: '32px',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                color: '#a855f7',
                marginBottom: '12px',
                fontFamily: 'Orbitron, sans-serif'
              }}>
                🎮 Transaction-Based Games
              </h2>
              <p style={{ color: '#999', marginBottom: '16px' }}>
                All games require real ETH transactions on Abstract. Each transaction earns you Abstract XP!
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(34, 197, 94, 0.2)',
                border: '2px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '24px'
              }}>
                <span style={{
                  width: '12px',
                  height: '12px',
                  background: '#4ade80',
                  borderRadius: '50%',
                  animation: 'pulse 2s ease-in-out infinite'
                }}></span>
                <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Connected to Abstract Chain</span>
              </div>
            </div>
            <Home chainType="abstract" />
          </div>
        )}

        {activeTab === "arena" && <AbstractArena />}
        {activeTab === "badges" && <AlienBadgeMinter />}
        {activeTab === "xp" && <AbstractXPDashboard />}
        {activeTab === "activity" && <AbstractActivityFeed />}

        {activeTab === "maze" && (
          <iframe
            src="/maze"
            style={{
              width: '100%',
              height: 'calc(100vh - 140px)',
              border: 'none',
              borderRadius: '24px',
            }}
            title="Maze Game"
          />
        )}
      </div>
    </div>
  );
}
