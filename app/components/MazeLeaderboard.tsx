"use client";

import { useEffect, useState } from "react";
import { useCosmicSound } from "../hooks/useCosmicSound";

interface MazeScore {
  wallet: string;
  nftCharacter?: string;
  score: number;
  timeElapsed: number;
  collectedItems: number;
  totalItems: number;
  timestamp: number;
  rank: number;
}

export default function MazeLeaderboard() {
  const { playSound } = useCosmicSound();
  const [leaderboard, setLeaderboard] = useState<MazeScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const TOP_COUNT = 20;

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/maze-leaderboard");
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
      } else {
        setError("Failed to load leaderboard");
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const getCharacterEmoji = (character?: string) => {
    const emojiMap: Record<string, string> = {
      nyx: "👾",
      zorb: "🛸",
      baob: "👽",
      apelian: "🦍",
      j3d1: "🤖",
      zit: "⚡"
    };
    return character ? emojiMap[character] || "👽" : "👽";
  };

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const displayedScores = showAll ? leaderboard : leaderboard.slice(0, TOP_COUNT);
  const hasMore = leaderboard.length > TOP_COUNT;

  if (loading) {
    return (
      <div className="bg-cyan-900/20 border-2 border-cyan-400 rounded-2xl p-8 text-center">
        <div className="text-cyan-400 font-alien text-2xl animate-pulse">
          Loading Leaderboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border-2 border-red-400 rounded-2xl p-8 text-center">
        <div className="text-red-400 font-alien text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl bg-black/80 border-2 border-cyan-400 rounded-3xl p-8 holographic-panel">
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      {/* Header */}
      <div className="relative z-10 text-center mb-8">
        <h2 className="font-alien text-4xl text-cyan-400 holographic-text mb-2">
          🏆 MAZE CHAMPIONS 🏆
        </h2>
        <p className="text-cyan-300 text-sm">
          {leaderboard.length} {leaderboard.length === 1 ? "brave explorer" : "brave explorers"} have completed the maze
        </p>
      </div>

      {/* Leaderboard Table */}
      {leaderboard.length === 0 ? (
        <div className="relative z-10 text-center py-12">
          <div className="text-6xl mb-4">🛸</div>
          <div className="text-cyan-400 font-alien text-2xl mb-2">No Scores Yet!</div>
          <div className="text-cyan-300">Be the first to complete the maze and claim your spot!</div>
        </div>
      ) : (
        <>
          <div className="relative z-10 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-cyan-400/50">
                  <th className="px-4 py-3 text-cyan-400 font-alien text-sm">RANK</th>
                  <th className="px-4 py-3 text-cyan-400 font-alien text-sm">CHARACTER</th>
                  <th className="px-4 py-3 text-cyan-400 font-alien text-sm">EXPLORER</th>
                  <th className="px-4 py-3 text-cyan-400 font-alien text-sm text-right">SCORE</th>
                  <th className="px-4 py-3 text-cyan-400 font-alien text-sm text-right">TIME</th>
                  <th className="px-4 py-3 text-cyan-400 font-alien text-sm text-right">ITEMS</th>
                </tr>
              </thead>
              <tbody>
                {displayedScores.map((entry, index) => {
                  const isTopThree = entry.rank <= 3;
                  const rankColor =
                    entry.rank === 1 ? "text-yellow-400" :
                    entry.rank === 2 ? "text-gray-300" :
                    entry.rank === 3 ? "text-orange-400" :
                    "text-cyan-300";

                  return (
                    <tr
                      key={`${entry.wallet}-${entry.timestamp}`}
                      className={`border-b border-cyan-400/20 hover:bg-cyan-900/20 transition-colors ${
                        isTopThree ? "bg-cyan-900/30" : ""
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-4 py-3">
                        <div className={`font-alien text-xl ${rankColor}`}>
                          {entry.rank === 1 && "🥇"}
                          {entry.rank === 2 && "🥈"}
                          {entry.rank === 3 && "🥉"}
                          {entry.rank > 3 && `#${entry.rank}`}
                        </div>
                      </td>

                      {/* Character */}
                      <td className="px-4 py-3">
                        <div className="text-3xl">
                          {getCharacterEmoji(entry.nftCharacter)}
                        </div>
                      </td>

                      {/* Wallet */}
                      <td className="px-4 py-3">
                        <div className="text-cyan-300 font-mono text-sm">
                          {formatWallet(entry.wallet)}
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-4 py-3 text-right">
                        <div className="text-green-400 font-alien text-lg">
                          {entry.score.toLocaleString()}
                        </div>
                      </td>

                      {/* Time */}
                      <td className="px-4 py-3 text-right">
                        <div className="text-purple-400 font-alien text-sm">
                          {formatTime(entry.timeElapsed)}
                        </div>
                      </td>

                      {/* Items Collected */}
                      <td className="px-4 py-3 text-right">
                        <div className="text-yellow-400 font-alien text-sm">
                          {entry.collectedItems}/{entry.totalItems}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Show More/Less Button */}
          {hasMore && (
            <div className="relative z-10 flex justify-center mt-6">
              <button
                onClick={() => {
                  setShowAll(!showAll);
                  playSound("click");
                }}
                onMouseEnter={() => playSound("hover")}
                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-alien rounded-3xl transition-all hover:scale-105 shadow-lg shadow-cyan-500/50"
              >
                {showAll ? (
                  <>⬆️ SHOW LESS</>
                ) : (
                  <>⬇️ SHOW MORE ({leaderboard.length - TOP_COUNT} more)</>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Refresh Button */}
      <div className="relative z-10 flex justify-center mt-6">
        <button
          onClick={() => {
            fetchLeaderboard();
            playSound("click");
          }}
          onMouseEnter={() => playSound("hover")}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-alien text-sm rounded-3xl transition-all hover:scale-105"
        >
          🔄 REFRESH
        </button>
      </div>
    </div>
  );
}
