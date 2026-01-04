"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";

interface LeaderboardEntry {
  wallet: string;
  totalAPEarned: number;
  totalGamesPlayed: number;
  uniqueGamesPlayed: number;
  todayAPEarned: number;
  lastActive: string;
  rank: number;
}

interface ArcadeLeaderboardProps {
  mini?: boolean; // Mini version for embedding in arcade
  limit?: number;
  showViewAll?: boolean;
}

type SortField = "totalAPEarned" | "totalGamesPlayed" | "uniqueGamesPlayed" | "todayAPEarned";

const SORT_OPTIONS: { value: SortField; label: string; shortLabel: string }[] = [
  { value: "totalAPEarned", label: "Total AP Earned", shortLabel: "AP" },
  { value: "totalGamesPlayed", label: "Games Played", shortLabel: "Games" },
  { value: "uniqueGamesPlayed", label: "Unique Games", shortLabel: "Unique" },
  { value: "todayAPEarned", label: "Today's AP", shortLabel: "Today" },
];

export default function ArcadeLeaderboard({
  mini = false,
  limit = 10,
  showViewAll = true,
}: ArcadeLeaderboardProps) {
  const { address } = useAccount();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortField>("totalAPEarned");
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/arcade-leaderboard?sortBy=${sortBy}&limit=${limit}${address ? `&wallet=${address}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
        setTotalPlayers(data.totalPlayers);
        setUserRank(data.userRank);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
    setLoading(false);
  }, [sortBy, limit, address]);

  useEffect(() => {
    fetchLeaderboard();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "#FFD700"; // Gold
    if (rank === 2) return "#C0C0C0"; // Silver
    if (rank === 3) return "#CD7F32"; // Bronze
    return "#66fcf1";
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  if (mini) {
    return (
      <div
        style={{
          background: "rgba(31, 40, 51, 0.95)",
          border: "2px solid #45a29e",
          borderRadius: "12px",
          padding: "15px",
          fontFamily: "Orbitron, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "14px", color: "#66fcf1" }}>
            TOP ARCADE PLAYERS
          </h3>
          {showViewAll && (
            <Link
              href="/arcade-leaderboard"
              style={{
                fontSize: "11px",
                color: "#45a29e",
                textDecoration: "none",
              }}
            >
              View All →
            </Link>
          )}
        </div>

        {/* Mini sort tabs */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "10px",
            flexWrap: "wrap",
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              style={{
                padding: "4px 8px",
                background: sortBy === opt.value ? "#45a29e" : "transparent",
                color: sortBy === opt.value ? "#000" : "#66fcf1",
                border: `1px solid ${sortBy === opt.value ? "#45a29e" : "#45a29e55"}`,
                borderRadius: "4px",
                fontSize: "9px",
                fontFamily: "Orbitron, sans-serif",
                cursor: "pointer",
              }}
            >
              {opt.shortLabel}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px", fontSize: "12px", color: "#66fcf1" }}>
            Loading...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {leaderboard.slice(0, 5).map((entry) => {
              const isUser = address && entry.wallet.toLowerCase() === address.toLowerCase();
              return (
                <div
                  key={entry.wallet}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 8px",
                    background: isUser ? "rgba(102, 252, 241, 0.15)" : "rgba(0,0,0,0.3)",
                    borderRadius: "6px",
                    border: isUser ? "1px solid #66fcf1" : "1px solid transparent",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      minWidth: "28px",
                      color: getRankColor(entry.rank),
                    }}
                  >
                    {getRankEmoji(entry.rank)}
                  </span>
                  <span style={{ flex: 1, fontSize: "11px", color: "#c5c6c7" }}>
                    {formatWallet(entry.wallet)}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: "#66fcf1" }}>
                    {formatNumber(
                      sortBy === "totalGamesPlayed"
                        ? entry.totalGamesPlayed
                        : sortBy === "uniqueGamesPlayed"
                        ? entry.uniqueGamesPlayed
                        : sortBy === "todayAPEarned"
                        ? entry.todayAPEarned
                        : entry.totalAPEarned
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* User's rank if not in top 5 */}
        {userRank && userRank.rank > 5 && (
          <div
            style={{
              marginTop: "10px",
              padding: "8px",
              background: "rgba(102, 252, 241, 0.1)",
              borderRadius: "6px",
              border: "1px solid #66fcf1",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "11px", color: "#66fcf1" }}>Your Rank:</span>
            <span style={{ fontSize: "12px", fontWeight: "bold" }}>#{userRank.rank}</span>
            <span style={{ fontSize: "11px", color: "#c5c6c7", marginLeft: "auto" }}>
              {formatNumber(userRank.totalAPEarned)} AP
            </span>
          </div>
        )}
      </div>
    );
  }

  // Full version
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Orbitron, sans-serif",
        color: "#66fcf1",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "28px",
          marginBottom: "10px",
          background: "linear-gradient(135deg, #66fcf1, #45a29e)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        ARCADE LEADERBOARD
      </h1>
      <p
        style={{
          textAlign: "center",
          fontSize: "14px",
          color: "#c5c6c7",
          marginBottom: "30px",
        }}
      >
        {totalPlayers} players competing
      </p>

      {/* Sort Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSortBy(opt.value)}
            style={{
              padding: "10px 20px",
              background: sortBy === opt.value
                ? "linear-gradient(135deg, #66fcf1, #45a29e)"
                : "rgba(102, 252, 241, 0.1)",
              color: sortBy === opt.value ? "#000" : "#66fcf1",
              border: `2px solid ${sortBy === opt.value ? "#66fcf1" : "#45a29e55"}`,
              borderRadius: "8px",
              fontSize: "12px",
              fontFamily: "Orbitron, sans-serif",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* User's Rank Card */}
      {userRank && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(102, 252, 241, 0.2), rgba(69, 162, 158, 0.2))",
            border: "2px solid #66fcf1",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "15px",
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>YOUR RANK</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: getRankColor(userRank.rank) }}>
              {getRankEmoji(userRank.rank)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>TOTAL AP</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {formatNumber(userRank.totalAPEarned)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>GAMES PLAYED</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {userRank.totalGamesPlayed}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>UNIQUE GAMES</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {userRank.uniqueGamesPlayed}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div
        style={{
          background: "rgba(31, 40, 51, 0.95)",
          border: "2px solid #45a29e",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 100px 100px 100px 100px",
            padding: "15px 20px",
            background: "rgba(69, 162, 158, 0.3)",
            fontSize: "11px",
            fontWeight: "bold",
            textTransform: "uppercase",
            borderBottom: "1px solid #45a29e",
          }}
        >
          <div>Rank</div>
          <div>Player</div>
          <div style={{ textAlign: "right" }}>Total AP</div>
          <div style={{ textAlign: "right" }}>Games</div>
          <div style={{ textAlign: "right" }}>Unique</div>
          <div style={{ textAlign: "right" }}>Today</div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#c5c6c7" }}>
            No players yet. Be the first!
          </div>
        ) : (
          leaderboard.map((entry) => {
            const isUser = address && entry.wallet.toLowerCase() === address.toLowerCase();
            return (
              <div
                key={entry.wallet}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 100px 100px 100px 100px",
                  padding: "12px 20px",
                  background: isUser ? "rgba(102, 252, 241, 0.1)" : "transparent",
                  borderBottom: "1px solid rgba(69, 162, 158, 0.3)",
                  alignItems: "center",
                }}
              >
                <div style={{ color: getRankColor(entry.rank), fontWeight: "bold" }}>
                  {getRankEmoji(entry.rank)}
                </div>
                <div style={{ color: isUser ? "#66fcf1" : "#c5c6c7" }}>
                  {formatWallet(entry.wallet)}
                  {isUser && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "10px",
                        background: "#66fcf1",
                        color: "#000",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      YOU
                    </span>
                  )}
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontWeight: sortBy === "totalAPEarned" ? "bold" : "normal",
                    color: sortBy === "totalAPEarned" ? "#66fcf1" : "#c5c6c7",
                  }}
                >
                  {formatNumber(entry.totalAPEarned)}
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontWeight: sortBy === "totalGamesPlayed" ? "bold" : "normal",
                    color: sortBy === "totalGamesPlayed" ? "#66fcf1" : "#c5c6c7",
                  }}
                >
                  {entry.totalGamesPlayed}
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontWeight: sortBy === "uniqueGamesPlayed" ? "bold" : "normal",
                    color: sortBy === "uniqueGamesPlayed" ? "#66fcf1" : "#c5c6c7",
                  }}
                >
                  {entry.uniqueGamesPlayed}
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontWeight: sortBy === "todayAPEarned" ? "bold" : "normal",
                    color: sortBy === "todayAPEarned" ? "#66fcf1" : "#c5c6c7",
                  }}
                >
                  {formatNumber(entry.todayAPEarned)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
