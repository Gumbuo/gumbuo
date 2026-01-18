"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

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

const CATEGORIES = [
  { value: "", label: "All Genres" },
  { value: "shooter", label: "Shooter" },
  { value: "mmorpg", label: "MMORPG" },
  { value: "strategy", label: "Strategy" },
  { value: "moba", label: "MOBA" },
  { value: "racing", label: "Racing" },
  { value: "sports", label: "Sports" },
  { value: "social", label: "Social" },
  { value: "battle-royale", label: "Battle Royale" },
  { value: "card", label: "Card Games" },
  { value: "fantasy", label: "Fantasy" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "action", label: "Action" },
  { value: "action-rpg", label: "Action RPG" },
  { value: "fighting", label: "Fighting" },
  { value: "horror", label: "Horror" },
  { value: "anime", label: "Anime" },
];

const PLATFORMS = [
  { value: "all", label: "All Platforms" },
  { value: "browser", label: "Browser" },
  { value: "pc", label: "PC Download" },
];

const SORT_OPTIONS = [
  { value: "popularity", label: "Most Popular" },
  { value: "release-date", label: "Newest" },
  { value: "alphabetical", label: "A-Z" },
  { value: "relevance", label: "Relevance" },
];

export default function ArcadeGames() {
  const [games, setGames] = useState<FreeGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch games
  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (platform !== "all") params.append("platform", platform);
      if (category) params.append("category", category);
      if (sortBy) params.append("sort-by", sortBy);
      params.append("limit", "150");

      const url = `/api/games?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setGames(data.games);
      }
    } catch (error) {
      console.error("Failed to fetch games:", error);
    }
    setLoading(false);
  }, [category, platform, sortBy]);

  // Filter games by search query
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return games;
    const query = searchQuery.toLowerCase();
    return games.filter(
      (game) =>
        game.title.toLowerCase().includes(query) ||
        game.short_description.toLowerCase().includes(query) ||
        game.genre.toLowerCase().includes(query) ||
        game.publisher.toLowerCase().includes(query)
    );
  }, [games, searchQuery]);

  // Play game
  const playGame = (game: FreeGame) => {
    window.open(game.game_url, "_blank");
  };

  // Initial load
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

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
      {/* Search & Filters */}
      <div
        style={{
          background: "rgba(31, 40, 51, 0.9)",
          border: "2px solid #45a29e",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Search Bar */}
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Search games by title, genre, or publisher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              background: "#0b0c10",
              color: "#66fcf1",
              border: "2px solid #45a29e",
              borderRadius: "8px",
              padding: "12px 16px",
              fontFamily: "Orbitron, sans-serif",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        {/* Filter Row */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Platform Filter */}
          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", opacity: 0.7 }}>Platform:</span>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              style={{
                background: "#0b0c10",
                color: "#66fcf1",
                border: "2px solid #45a29e",
                borderRadius: "6px",
                padding: "8px 12px",
                fontFamily: "Orbitron, sans-serif",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {PLATFORMS.map((plat) => (
                <option key={plat.value} value={plat.value}>
                  {plat.label}
                </option>
              ))}
            </select>
          </label>

          {/* Genre Filter */}
          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", opacity: 0.7 }}>Genre:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                background: "#0b0c10",
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

          {/* Sort By */}
          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", opacity: 0.7 }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: "#0b0c10",
                color: "#66fcf1",
                border: "2px solid #45a29e",
                borderRadius: "6px",
                padding: "8px 12px",
                fontFamily: "Orbitron, sans-serif",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {SORT_OPTIONS.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
          </label>

          {/* Game Count */}
          <div style={{ marginLeft: "auto", fontSize: "13px", opacity: 0.7 }}>
            {filteredGames.length} of {games.length} games
          </div>
        </div>
      </div>

      {/* Games Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div style={{ fontSize: "18px" }}>Loading games...</div>
        </div>
      ) : filteredGames.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div style={{ fontSize: "18px", marginBottom: "10px" }}>No games found</div>
          <div style={{ fontSize: "14px", opacity: 0.7 }}>
            Try adjusting your search or filters
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredGames.map((game) => (
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
                      background: "linear-gradient(135deg, #66fcf1, #45a29e)",
                      color: "#000",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    PLAY FREE
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
