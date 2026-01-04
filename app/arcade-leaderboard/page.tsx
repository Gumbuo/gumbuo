"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import BackToMothershipButton from "../components/BackToMothershipButton";
import Link from "next/link";

const ArcadeLeaderboard = dynamic(
  () => import("../base/components/ArcadeLeaderboard"),
  { ssr: false }
);
const StarfieldBackground = dynamic(
  () => import("../components/StarfieldBackground"),
  { ssr: false }
);

export default function ArcadeLeaderboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black relative overflow-y-auto">
      {/* Animated Starfield Background */}
      <StarfieldBackground />

      {/* Back to Mothership Button */}
      <BackToMothershipButton />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          <Link
            href="/base?game=arcade"
            style={{
              padding: "10px 20px",
              background: "rgba(102, 252, 241, 0.1)",
              border: "2px solid #45a29e",
              borderRadius: "8px",
              color: "#66fcf1",
              textDecoration: "none",
              fontFamily: "Orbitron, sans-serif",
              fontSize: "12px",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
          >
            ← BACK TO ARCADE
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="font-alien mb-4 holographic-text tracking-wider"
            style={{
              fontSize: "3rem",
              background: "linear-gradient(135deg, #66fcf1, #45a29e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "Orbitron, sans-serif",
            }}
          >
            🎮 ARCADE LEADERBOARD 🏆
          </h1>
          <p
            style={{ color: "#c5c6c7", fontFamily: "Orbitron, sans-serif" }}
            className="text-lg max-w-2xl mx-auto"
          >
            Top players earning Alien Points in the Free Arcade
          </p>
        </div>

        {/* Leaderboard Component */}
        <ArcadeLeaderboard mini={false} limit={50} showViewAll={false} />

        {/* How to Climb */}
        <div
          style={{
            marginTop: "40px",
            padding: "25px",
            background: "rgba(31, 40, 51, 0.9)",
            border: "2px solid #45a29e",
            borderRadius: "12px",
            fontFamily: "Orbitron, sans-serif",
          }}
        >
          <h3
            style={{
              margin: "0 0 20px 0",
              fontSize: "18px",
              color: "#66fcf1",
              textAlign: "center",
            }}
          >
            HOW TO CLIMB THE LEADERBOARD
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              fontSize: "13px",
              color: "#c5c6c7",
            }}
          >
            <div
              style={{
                padding: "15px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🎮</div>
              <strong style={{ color: "#66fcf1" }}>Play Games</strong>
              <p style={{ margin: "8px 0 0 0", fontSize: "11px" }}>
                +100 AP per game (5 min cooldown)
              </p>
            </div>
            <div
              style={{
                padding: "15px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏱️</div>
              <strong style={{ color: "#66fcf1" }}>Spend Time</strong>
              <p style={{ margin: "8px 0 0 0", fontSize: "11px" }}>
                +20 AP per minute (max 200/day)
              </p>
            </div>
            <div
              style={{
                padding: "15px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🌟</div>
              <strong style={{ color: "#66fcf1" }}>Try Variety</strong>
              <p style={{ margin: "8px 0 0 0", fontSize: "11px" }}>
                +500 AP for 5+ unique games/day
              </p>
            </div>
            <div
              style={{
                padding: "15px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>📈</div>
              <strong style={{ color: "#66fcf1" }}>Be Consistent</strong>
              <p style={{ margin: "8px 0 0 0", fontSize: "11px" }}>
                Daily activity adds up fast!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
