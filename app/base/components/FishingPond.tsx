"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { THEME } from "./armory/constants";

interface CatchEntry {
  reward: string;
  icon: string;
  amount: number;
  label: string;
  timestamp: number;
  rare?: boolean;
}

interface FishingData {
  castsRemaining: number;
  maxCasts: number;
  totalCasts: number;
  totalFishCaught: number;
  catchLog: CatchEntry[];
  apBalance: number;
  totalAPEarned: number;
  totalResourcesEarned: number;
  totalRareCatches: number;
}

interface LeaderboardEntry {
  rank: number;
  wallet: string;
  totalCasts: number;
  totalAPEarned: number;
  totalResourcesEarned: number;
  totalRareCatches: number;
}

interface PlayerLevelInfo {
  level: number;
  title: string;
  xp: number;
  xpForNextLevel: number;
  progressPercent: number;
}

export default function FishingPond() {
  const { address, isConnected } = useAccount();
  const [fishingData, setFishingData] = useState<FishingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [casting, setCasting] = useState(false);
  const [lastReward, setLastReward] = useState<CatchEntry | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [playerLevel, setPlayerLevel] = useState<PlayerLevelInfo | null>(null);
  const [ripple, setRipple] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerStats, setPlayerStats] = useState<LeaderboardEntry | null>(null);

  const fetchFishingState = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/fishing?wallet=${address}`);
      const data = await res.json();
      if (data.success) {
        setFishingData(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch fishing state:", err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  const fetchPlayerLevel = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/player-level?wallet=${address}`);
      const data = await res.json();
      if (data.success) {
        const lvl = data.data;
        setPlayerLevel({
          level: lvl.level,
          title: lvl.title,
          xp: lvl.xp,
          xpForNextLevel: lvl.xpForNextLevel,
          progressPercent: lvl.progressPercent,
        });
      }
    } catch (err) {
      console.error("Failed to fetch player level:", err);
    }
  }, [address]);

  const fetchLeaderboard = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/fishing/leaderboard?wallet=${address}`);
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
        setPlayerStats(data.playerStats || null);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchFishingState();
      fetchPlayerLevel();
      fetchLeaderboard();
    }
  }, [address, fetchFishingState, fetchPlayerLevel, fetchLeaderboard]);

  // Countdown timer to midnight UTC
  useEffect(() => {
    function getTimeUntilMidnightUTC(): string {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setUTCDate(midnight.getUTCDate() + 1);
      midnight.setUTCHours(0, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    setCountdown(getTimeUntilMidnightUTC());
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnightUTC());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCast = async () => {
    if (!address || casting || !fishingData || fishingData.castsRemaining <= 0) return;

    setCasting(true);
    setRipple(true);
    setShowReward(false);

    try {
      const res = await fetch("/api/fishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address }),
      });
      const data = await res.json();

      if (data.success) {
        setFishingData((prev) =>
          prev
            ? {
                ...prev,
                castsRemaining: data.data.castsRemaining,
                totalCasts: data.data.totalCasts,
                totalAPEarned: data.data.totalAPEarned ?? prev.totalAPEarned,
                totalResourcesEarned: data.data.totalResourcesEarned ?? prev.totalResourcesEarned,
                totalRareCatches: data.data.totalRareCatches ?? prev.totalRareCatches,
                catchLog: data.data.catchLog,
                apBalance: data.data.apBalance,
              }
            : prev
        );
        setLastReward(data.data.reward);

        // Update player level from response
        if (data.data.playerLevel) {
          const pl = data.data.playerLevel;
          setPlayerLevel((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              level: pl.level,
              xp: pl.xp,
              xpForNextLevel: pl.xpForNextLevel || prev.xpForNextLevel,
              progressPercent: pl.progressPercent || prev.progressPercent,
            };
          });
          // Re-fetch player level for accurate progress
          fetchPlayerLevel();
        }

        // Re-fetch leaderboard
        fetchLeaderboard();

        // Show reward after brief delay for animation
        setTimeout(() => {
          setShowReward(true);
        }, 600);
      }
    } catch (err) {
      console.error("Cast failed:", err);
    } finally {
      setTimeout(() => {
        setCasting(false);
        setRipple(false);
      }, 800);
    }
  };

  if (!isConnected) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          padding: 40,
          textAlign: "center",
          fontFamily: "Orbitron, sans-serif",
          color: THEME.colors.primary,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 20 }}>🎣</div>
        <div style={{ fontSize: 18, marginBottom: 10 }}>ALIEN FISHING POND</div>
        <div style={{ color: THEME.colors.text, fontSize: 14 }}>
          Connect your wallet to start fishing
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          padding: 40,
          textAlign: "center",
          fontFamily: "Orbitron, sans-serif",
          color: THEME.colors.primary,
        }}
      >
        <div style={{ fontSize: 18 }}>Loading fishing pond...</div>
      </div>
    );
  }

  const castsRemaining = fishingData?.castsRemaining ?? 0;
  const maxCasts = fishingData?.maxCasts ?? 20;
  const catchLog = fishingData?.catchLog ?? [];
  const apBalance = fishingData?.apBalance ?? 0;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 600,
        margin: "0 auto",
        fontFamily: "Orbitron, sans-serif",
        color: THEME.colors.text,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: THEME.colors.panel,
          border: THEME.borders.panel,
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 18, color: THEME.colors.primary, fontWeight: "bold" }}>
            🎣 ALIEN FISHING POND
          </div>
        </div>
        {playerLevel && (
          <div style={{ textAlign: "right", minWidth: 180 }}>
            <div style={{ fontSize: 12, color: THEME.colors.secondary, marginBottom: 4 }}>
              Lv.{playerLevel.level} {playerLevel.title}
            </div>
            <div
              style={{
                width: "100%",
                height: 8,
                background: "rgba(102,252,241,0.15)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${playerLevel.progressPercent}%`,
                  height: "100%",
                  background: THEME.gradients.button,
                  borderRadius: 4,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Pond Visual */}
      <div
        style={{
          background: THEME.colors.panel,
          border: THEME.borders.panel,
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Stats row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          <div>
            <span style={{ color: THEME.colors.secondary }}>Casts: </span>
            <span
              style={{
                color: castsRemaining > 0 ? THEME.colors.primary : THEME.colors.error,
                fontWeight: "bold",
              }}
            >
              {castsRemaining}/{maxCasts}
            </span>
          </div>
          <div>
            <span style={{ color: THEME.colors.secondary }}>AP: </span>
            <span style={{ color: THEME.colors.primary, fontWeight: "bold" }}>
              {apBalance.toLocaleString()}
            </span>
          </div>
          <div>
            <span style={{ color: THEME.colors.secondary }}>Total Catches: </span>
            <span style={{ color: THEME.colors.primary, fontWeight: "bold" }}>
              {fishingData?.totalFishCaught ?? 0}
            </span>
          </div>
        </div>

        {/* Countdown timer */}
        <div
          style={{
            marginBottom: 16,
            fontSize: 12,
            textAlign: "center",
            color: castsRemaining === 0 ? THEME.colors.warning : THEME.colors.secondary,
          }}
        >
          {castsRemaining === 0 ? `Resets in ${countdown}` : `Daily reset in ${countdown}`}
        </div>

        {/* Pond */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 180,
            borderRadius: 12,
            background: "linear-gradient(180deg, #0a2a3a 0%, #0d3d5c 40%, #104e6e 70%, #0a3a5a 100%)",
            border: "2px solid rgba(102,252,241,0.2)",
            overflow: "hidden",
          }}
        >
          {/* Water shimmer overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(90deg, transparent, rgba(102,252,241,0.03) 20px, transparent 40px)",
              animation: ripple ? "pondRipple 0.8s ease-out" : undefined,
            }}
          />

          {/* Floating elements */}
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "15%",
              fontSize: 24,
              opacity: 0.6,
              animation: "fishFloat 3s ease-in-out infinite",
            }}
          >
            🐟
          </div>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "65%",
              fontSize: 20,
              opacity: 0.5,
              animation: "fishFloat 4s ease-in-out infinite 1s",
            }}
          >
            🐠
          </div>
          <div
            style={{
              position: "absolute",
              top: "60%",
              left: "35%",
              fontSize: 18,
              opacity: 0.4,
              animation: "fishFloat 3.5s ease-in-out infinite 0.5s",
            }}
          >
            🦑
          </div>
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "80%",
              fontSize: 16,
              opacity: 0.3,
              animation: "fishFloat 5s ease-in-out infinite 2s",
            }}
          >
            🪼
          </div>

          {/* Wave lines */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 14,
              color: "rgba(102,252,241,0.2)",
              letterSpacing: 4,
              animation: "waveMove 2s linear infinite",
            }}
          >
            ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
          </div>
          <div
            style={{
              position: "absolute",
              top: 30,
              left: 10,
              right: 0,
              textAlign: "center",
              fontSize: 14,
              color: "rgba(102,252,241,0.15)",
              letterSpacing: 4,
              animation: "waveMove 2.5s linear infinite reverse",
            }}
          >
            ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
          </div>

          {/* Casting line animation */}
          {casting && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                width: 2,
                height: "60%",
                background: "linear-gradient(to bottom, #66fcf1, transparent)",
                transform: "translateX(-50%)",
                animation: "castLine 0.6s ease-out",
              }}
            />
          )}

          {/* Center splash on cast */}
          {casting && (
            <div
              style={{
                position: "absolute",
                top: "55%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: 32,
                animation: "splashIn 0.5s ease-out",
              }}
            >
              💦
            </div>
          )}
        </div>

        {/* Reward popup */}
        {showReward && lastReward && (
          <div
            style={{
              marginTop: 12,
              padding: "12px 16px",
              background: lastReward.rare
                ? "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))"
                : "rgba(102,252,241,0.1)",
              border: lastReward.rare
                ? "2px solid rgba(251,191,36,0.5)"
                : `1px solid ${THEME.colors.secondary}`,
              borderRadius: 8,
              textAlign: "center",
              animation: "rewardPop 0.3s ease-out",
            }}
          >
            <span style={{ fontSize: 20, marginRight: 8 }}>{lastReward.icon}</span>
            <span
              style={{
                color: lastReward.rare ? "#fbbf24" : THEME.colors.primary,
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              {lastReward.amount > 1 ? `${lastReward.label} x${lastReward.amount}` : lastReward.label}
              {lastReward.amount === 1 && lastReward.reward === "ap" ? "" : ""}
              {lastReward.reward === "ap" || lastReward.label.includes("AP")
                ? ` (+${lastReward.amount} AP)`
                : ""}
            </span>
            {lastReward.rare && (
              <span style={{ marginLeft: 8, color: "#fbbf24", fontSize: 12 }}>★ RARE</span>
            )}
            <div style={{ fontSize: 11, color: THEME.colors.secondary, marginTop: 4 }}>
              +{10} XP
            </div>
          </div>
        )}
      </div>

      {/* Cast Button */}
      <button
        onClick={handleCast}
        disabled={casting || castsRemaining <= 0}
        style={{
          width: "100%",
          padding: "16px 24px",
          background:
            castsRemaining > 0
              ? casting
                ? "rgba(102,252,241,0.3)"
                : THEME.gradients.button
              : "rgba(107,114,128,0.3)",
          color: castsRemaining > 0 ? "#000" : THEME.colors.locked,
          border:
            castsRemaining > 0
              ? THEME.borders.active
              : THEME.borders.locked,
          borderRadius: 10,
          cursor: castsRemaining > 0 && !casting ? "pointer" : "not-allowed",
          fontFamily: "Orbitron, sans-serif",
          fontWeight: "bold",
          fontSize: 16,
          marginBottom: 16,
          transition: "all 0.3s ease",
          boxShadow: castsRemaining > 0 && !casting ? THEME.shadows.glow : "none",
        }}
      >
        {casting
          ? "🎣 CASTING..."
          : castsRemaining > 0
          ? "🎣 CAST LINE"
          : "No casts remaining today"}
      </button>

      {/* Catch Log */}
      <div
        style={{
          background: THEME.colors.panel,
          border: THEME.borders.panel,
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: THEME.colors.primary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          Recent Catches
        </div>
        {catchLog.length === 0 ? (
          <div style={{ fontSize: 13, color: THEME.colors.locked, textAlign: "center", padding: 20 }}>
            No catches yet. Cast your line!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {catchLog.map((entry, i) => (
              <div
                key={`${entry.timestamp}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  background: entry.rare
                    ? "rgba(251,191,36,0.08)"
                    : "rgba(102,252,241,0.05)",
                  borderRadius: 6,
                  border: entry.rare
                    ? "1px solid rgba(251,191,36,0.3)"
                    : "1px solid rgba(69,162,158,0.2)",
                }}
              >
                <span style={{ fontSize: 18 }}>{entry.icon}</span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: entry.rare ? "#fbbf24" : THEME.colors.text,
                  }}
                >
                  {entry.label}
                  {entry.amount > 1 &&
                    !entry.label.includes("AP") &&
                    ` x${entry.amount}`}
                  {(entry.reward === "ap" || entry.label.includes("AP")) &&
                    ` (+${entry.amount})`}
                </span>
                {entry.rare && (
                  <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: "bold" }}>
                    ★ RARE
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Your Stats */}
      {fishingData && (
        <div
          style={{
            background: THEME.colors.panel,
            border: THEME.borders.panel,
            borderRadius: 12,
            padding: 16,
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: THEME.colors.primary,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            Your Stats
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {[
              { label: "Total Casts", value: fishingData.totalCasts, icon: "🎣" },
              { label: "AP Earned", value: (fishingData.totalAPEarned ?? 0).toLocaleString(), icon: "✨" },
              { label: "Resources", value: fishingData.totalResourcesEarned ?? 0, icon: "📦" },
              { label: "Rare Catches", value: fishingData.totalRareCatches ?? 0, icon: "★" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: "10px 12px",
                  background: "rgba(102,252,241,0.05)",
                  borderRadius: 6,
                  border: "1px solid rgba(69,162,158,0.2)",
                }}
              >
                <div style={{ fontSize: 11, color: THEME.colors.secondary, marginBottom: 4 }}>
                  {stat.icon} {stat.label}
                </div>
                <div style={{ fontSize: 16, color: THEME.colors.primary, fontWeight: "bold" }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div
        style={{
          background: THEME.colors.panel,
          border: THEME.borders.panel,
          borderRadius: 12,
          padding: 16,
          marginTop: 16,
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: THEME.colors.primary,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          Fishing Leaderboard
        </div>
        {leaderboard.length === 0 ? (
          <div style={{ fontSize: 13, color: THEME.colors.locked, textAlign: "center", padding: 20 }}>
            No entries yet. Be the first to cast!
          </div>
        ) : (
          <div>
            {/* Header row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr 80px 80px",
                gap: 8,
                padding: "6px 12px",
                fontSize: 11,
                color: THEME.colors.secondary,
                borderBottom: "1px solid rgba(69,162,158,0.2)",
                marginBottom: 4,
              }}
            >
              <span>#</span>
              <span>Wallet</span>
              <span style={{ textAlign: "right" }}>Casts</span>
              <span style={{ textAlign: "right" }}>AP Earned</span>
            </div>
            {/* Rows */}
            {leaderboard.slice(0, 10).map((entry) => {
              const isPlayer = address && entry.wallet === address.toLowerCase();
              return (
                <div
                  key={entry.wallet}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 80px 80px",
                    gap: 8,
                    padding: "8px 12px",
                    fontSize: 13,
                    borderRadius: 6,
                    background: isPlayer ? "rgba(102,252,241,0.1)" : "transparent",
                    border: isPlayer ? `1px solid ${THEME.colors.primary}` : "1px solid transparent",
                    color: isPlayer ? THEME.colors.primary : THEME.colors.text,
                    fontWeight: isPlayer ? "bold" : "normal",
                  }}
                >
                  <span>{entry.rank}</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {entry.wallet.slice(0, 6)}...{entry.wallet.slice(-4)}
                  </span>
                  <span style={{ textAlign: "right" }}>{entry.totalCasts}</span>
                  <span style={{ textAlign: "right" }}>{entry.totalAPEarned.toLocaleString()}</span>
                </div>
              );
            })}
            {/* Show player row if not in top 10 */}
            {playerStats && playerStats.rank > 10 && (
              <>
                <div
                  style={{
                    textAlign: "center",
                    color: THEME.colors.locked,
                    fontSize: 12,
                    padding: "4px 0",
                  }}
                >
                  ...
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 80px 80px",
                    gap: 8,
                    padding: "8px 12px",
                    fontSize: 13,
                    borderRadius: 6,
                    background: "rgba(102,252,241,0.1)",
                    border: `1px solid ${THEME.colors.primary}`,
                    color: THEME.colors.primary,
                    fontWeight: "bold",
                  }}
                >
                  <span>{playerStats.rank}</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {playerStats.wallet.slice(0, 6)}...{playerStats.wallet.slice(-4)}
                  </span>
                  <span style={{ textAlign: "right" }}>{playerStats.totalCasts}</span>
                  <span style={{ textAlign: "right" }}>{playerStats.totalAPEarned.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fishFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes waveMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(20px); }
        }
        @keyframes castLine {
          0% { height: 0%; opacity: 1; }
          60% { height: 60%; opacity: 1; }
          100% { height: 60%; opacity: 0.5; }
        }
        @keyframes splashIn {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        @keyframes rewardPop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pondRipple {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
      `}</style>
    </div>
  );
}
