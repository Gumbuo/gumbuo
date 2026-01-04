"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAccount } from "wagmi";
import ArcadeLeaderboard from "./ArcadeLeaderboard";

interface FreeGame {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
}

interface ArcadeStats {
  gamesPlayedToday: number;
  timeSpentToday: number;
  apEarnedToday: number;
  totalGamesPlayed: number;
  totalAPEarned: number;
  varietyProgress: number;
  varietyThreshold: number;
  varietyBonusClaimed: boolean;
  canClaimVariety: boolean;
  timeAPEarned: number;
  timeAPRemaining: number;
  timeCap: number;
}

const CATEGORIES = [
  { value: "", label: "All Games" },
  { value: "shooter", label: "Shooter" },
  { value: "mmorpg", label: "MMORPG" },
  { value: "strategy", label: "Strategy" },
  { value: "moba", label: "MOBA" },
  { value: "racing", label: "Racing" },
  { value: "sports", label: "Sports" },
  { value: "battle-royale", label: "Battle Royale" },
  { value: "card", label: "Card Games" },
  { value: "fantasy", label: "Fantasy" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "action", label: "Action" },
  { value: "fighting", label: "Fighting" },
  { value: "horror", label: "Horror" },
  { value: "anime", label: "Anime" },
];

type ArcadeTab = "games" | "leaderboard";

export default function ArcadeGames() {
  const { address, isConnected } = useAccount();
  const [games, setGames] = useState<FreeGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [stats, setStats] = useState<ArcadeStats | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<{ [gameId: number]: number }>({});
  const [activeTab, setActiveTab] = useState<ArcadeTab>("games");
  const timeTrackerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch games
  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/games?platform=browser${category ? `&category=${category}` : ""}&limit=50`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setGames(data.games);
      }
    } catch (error) {
      console.error("Failed to fetch games:", error);
    }
    setLoading(false);
  }, [category]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!address) return;
    try {
      const response = await fetch(`/api/game-activity?wallet=${address}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.activity);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, [address]);

  // Track time spent on arcade
  const trackTime = useCallback(async () => {
    if (!address) return;
    try {
      const response = await fetch("/api/game-activity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address }),
      });
      const data = await response.json();
      if (data.success && data.apAwarded > 0) {
        showNotification(`+${data.apAwarded} AP (Time Bonus)`);
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to track time:", error);
    }
  }, [address, fetchStats]);

  // Play game and track activity
  const playGame = async (game: FreeGame) => {
    if (!isConnected || !address) {
      showNotification("Connect your wallet to earn AP!");
      window.open(game.game_url, "_blank");
      return;
    }

    // Check client-side cooldown
    const cooldownEnd = cooldowns[game.id];
    if (cooldownEnd && Date.now() < cooldownEnd) {
      const remaining = Math.ceil((cooldownEnd - Date.now()) / 1000);
      showNotification(`Cooldown: ${remaining}s remaining`);
      window.open(game.game_url, "_blank");
      return;
    }

    // Log activity and open game
    try {
      const response = await fetch("/api/game-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          gameId: game.id,
          gameTitle: game.title,
        }),
      });
      const data = await response.json();

      if (data.success) {
        if (data.onCooldown) {
          showNotification(`Cooldown: ${data.cooldownRemaining}s`);
        } else if (data.apAwarded > 0) {
          let msg = `+${data.apAwarded} AP`;
          if (data.varietyBonusAwarded) {
            msg += " (includes 500 AP Variety Bonus!)";
          }
          showNotification(msg);

          // Set client-side cooldown
          setCooldowns((prev) => ({
            ...prev,
            [game.id]: Date.now() + 5 * 60 * 1000,
          }));
        }
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to log activity:", error);
    }

    window.open(game.game_url, "_blank");
  };

  // Show notification
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Initial load
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Time tracking interval
  useEffect(() => {
    if (isConnected && address) {
      timeTrackerRef.current = setInterval(trackTime, 60000); // Every minute
    }
    return () => {
      if (timeTrackerRef.current) {
        clearInterval(timeTrackerRef.current);
      }
    };
  }, [isConnected, address, trackTime]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Orbitron, sans-serif",
        color: "#66fcf1",
      }}
    >
      {/* Notification */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, #66fcf1, #45a29e)",
            color: "#000",
            padding: "15px 30px",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            zIndex: 1000,
            boxShadow: "0 0 30px rgba(102, 252, 241, 0.8)",
            animation: "pulse 0.5s ease-in-out",
          }}
        >
          {notification}
        </div>
      )}

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setActiveTab("games")}
          style={{
            padding: "12px 30px",
            background: activeTab === "games"
              ? "linear-gradient(135deg, #66fcf1, #45a29e)"
              : "rgba(102, 252, 241, 0.1)",
            color: activeTab === "games" ? "#000" : "#66fcf1",
            border: `2px solid ${activeTab === "games" ? "#66fcf1" : "#45a29e55"}`,
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "Orbitron, sans-serif",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          🎮 GAMES
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          style={{
            padding: "12px 30px",
            background: activeTab === "leaderboard"
              ? "linear-gradient(135deg, #66fcf1, #45a29e)"
              : "rgba(102, 252, 241, 0.1)",
            color: activeTab === "leaderboard" ? "#000" : "#66fcf1",
            border: `2px solid ${activeTab === "leaderboard" ? "#66fcf1" : "#45a29e55"}`,
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "Orbitron, sans-serif",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          🏆 LEADERBOARD
        </button>
      </div>

      {/* Stats Panel */}
      {isConnected && stats && activeTab === "games" && (
        <div
          style={{
            background: "rgba(31, 40, 51, 0.9)",
            border: "2px solid #45a29e",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>TODAY'S AP</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {stats.apEarnedToday}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>GAMES TODAY</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {stats.gamesPlayedToday}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>
              VARIETY BONUS ({stats.varietyProgress}/{stats.varietyThreshold})
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: stats.varietyBonusClaimed ? "#45a29e" : "#66fcf1",
              }}
            >
              {stats.varietyBonusClaimed ? "CLAIMED" : `${stats.varietyProgress >= stats.varietyThreshold ? "500 AP" : "Play more!"}`}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>
              TIME BONUS ({stats.timeAPEarned}/{stats.timeCap} AP)
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {stats.timeAPRemaining > 0
                ? `${stats.timeAPRemaining} AP left`
                : "MAXED"}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>LIFETIME AP</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              {stats.totalAPEarned}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Tab Content */}
      {activeTab === "leaderboard" && (
        <ArcadeLeaderboard mini={false} limit={50} showViewAll={false} />
      )}

      {/* Games Tab Content */}
      {activeTab === "games" && (
        <>
          {/* Not Connected Warning */}
          {!isConnected && (
            <div
              style={{
                background: "rgba(255, 100, 100, 0.2)",
                border: "2px solid #ff6464",
                borderRadius: "8px",
                padding: "15px 20px",
                marginBottom: "20px",
                textAlign: "center",
                color: "#ff6464",
              }}
            >
              Connect your wallet to earn Alien Points while playing!
            </div>
          )}

          {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px" }}>Category:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              background: "#1f2833",
              color: "#66fcf1",
              border: "2px solid #45a29e",
              borderRadius: "6px",
              padding: "8px 12px",
              fontFamily: "Orbitron, sans-serif",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </label>
        <div style={{ fontSize: "14px", opacity: 0.7 }}>
          {games.length} games available
        </div>
      </div>

      {/* Games Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div style={{ fontSize: "18px" }}>Loading games...</div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {games.map((game) => {
            const onCooldown =
              cooldowns[game.id] && Date.now() < cooldowns[game.id];
            return (
              <div
                key={game.id}
                onClick={() => playGame(game)}
                style={{
                  background: "rgba(31, 40, 51, 0.95)",
                  border: "2px solid #45a29e",
                  borderRadius: "12px",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  opacity: onCooldown ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(102, 252, 241, 0.3)";
                  e.currentTarget.style.borderColor = "#66fcf1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#45a29e";
                }}
              >
                <img
                  src={game.thumbnail}
                  alt={game.title}
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                  }}
                />
                <div style={{ padding: "15px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#66fcf1",
                        flex: 1,
                      }}
                    >
                      {game.title}
                    </h3>
                    <span
                      style={{
                        background: "#45a29e",
                        color: "#000",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        flexShrink: 0,
                        marginLeft: "8px",
                      }}
                    >
                      {game.genre}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      color: "#c5c6c7",
                      lineHeight: "1.4",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {game.short_description}
                  </p>
                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        opacity: 0.6,
                      }}
                    >
                      {game.publisher}
                    </span>
                    <span
                      style={{
                        background: onCooldown
                          ? "#666"
                          : "linear-gradient(135deg, #66fcf1, #45a29e)",
                        color: "#000",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      {onCooldown ? "COOLDOWN" : "+100 AP"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rewards Info */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          background: "rgba(31, 40, 51, 0.8)",
          border: "2px solid #45a29e",
          borderRadius: "12px",
        }}
      >
        <h3
          style={{
            margin: "0 0 15px 0",
            fontSize: "16px",
            color: "#66fcf1",
          }}
        >
          HOW TO EARN ALIEN POINTS
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
            fontSize: "12px",
            color: "#c5c6c7",
          }}
        >
          <div>
            <strong style={{ color: "#66fcf1" }}>PLAY GAMES:</strong> +100 AP per
            game (5 min cooldown)
          </div>
          <div>
            <strong style={{ color: "#66fcf1" }}>TIME BONUS:</strong> +20 AP per
            minute on this page (max 200/day)
          </div>
          <div>
            <strong style={{ color: "#66fcf1" }}>VARIETY BONUS:</strong> +500 AP
            for playing 5+ unique games daily
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
