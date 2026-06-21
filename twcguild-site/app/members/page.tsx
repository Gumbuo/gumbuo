"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import activityData from "../guildevents/activity-data.json";
import memberRoster from "../guildevents/member-roster.json";

type SavedProfile = {
  avatarUrl?: string;
  claimedBy?: string;
  games?: string[];
};

type Player = {
  name: string;
  score: number;
  harvested: Record<string, number>;
  planted: Record<string, number>;
  trees: number;
  mined: Record<string, number>;
  fished: Record<string, number>;
  quests: Record<string, number>;
  treeChops: number;
  mineSwings: number;
  fishCasts: number;
  questContributions: number;
  goldEarned: number;
  vaultDonated: number;
  joinDate: string | null;
  guildStatus: "accepted" | "kicked" | null;
};

type RosterMember = { name: string; level: number; xp: number };

function sum(map: Record<string, number>) {
  return Object.values(map).reduce((a, b) => a + b, 0);
}

function getAutoTitle(player: Player): string {
  const scores: Record<string, number> = {
    Farmer: sum(player.harvested) + sum(player.planted),
    Fisher: sum(player.fished),
    Woodcutter: player.trees,
    Miner: sum(player.mined),
    "Quest Runner": sum(player.quests),
  };
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : "Guild Member";
}

const SPECIALTY_COLORS: Record<string, string> = {
  Farmer: "#2e7d32",
  Fisher: "#00838f",
  Woodcutter: "#c68642",
  Miner: "#b44dff",
  "Quest Runner": "#ffd700",
  "Guild Member": "#45a29e",
};

const SPECIALTY_EMOJI: Record<string, string> = {
  Farmer: "🌾",
  Fisher: "🎣",
  Woodcutter: "🪓",
  Miner: "⛏️",
  "Quest Runner": "📋",
  "Guild Member": "⚔️",
};

export default function MembersPage() {
  const players = (activityData as unknown as { players: Player[] }).players;
  const roster = memberRoster as RosterMember[];
  const [savedProfiles, setSavedProfiles] = useState<Record<string, SavedProfile>>({});

  useEffect(() => {
    fetch("/api/profiles")
      .then(r => r.json())
      .then(d => setSavedProfiles(d.profiles || {}));
  }, []);

  // Build merged list: roster is the source of truth, enhance with activity data
  const activeRoster = roster.filter(r => {
    const player = players.find(p => p.name.toLowerCase() === r.name.toLowerCase());
    return !player || player.guildStatus !== "kicked";
  });

  const members = activeRoster
    .map(r => {
      const player = players.find(p => p.name.toLowerCase() === r.name.toLowerCase());
      const specialty = player ? getAutoTitle(player) : "Guild Member";
      const score = player?.score || 0;
      return { ...r, player, specialty, score };
    })
    .sort((a, b) => b.xp - a.xp);

  return (
    <div style={{ minHeight: "100vh", background: "#0b0c10", fontFamily: "Orbitron, sans-serif", color: "#66fcf1", paddingBottom: "80px" }}>

      {/* Top bar */}
      <div style={{ background: "rgba(0,0,0,0.8)", borderBottom: "2px solid #45a29e", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ color: "#45a29e", textDecoration: "none", fontSize: "0.85rem", fontWeight: "bold" }}>
          ← TWC GUILD
        </Link>
        <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" />
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 16px" }}>

        <h1 style={{ fontSize: "1.4rem", textAlign: "center", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "6px", textShadow: "0 0 15px #66fcf1" }}>
          TWC Guild Members
        </h1>
        <p style={{ textAlign: "center", color: "#c5c6c7", fontFamily: "Share Tech Mono, monospace", fontSize: "0.8rem", marginBottom: "40px" }}>
          {members.length} active members · Click a card to view profile
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {members.map((m, i) => {
            const color = SPECIALTY_COLORS[m.specialty];
            const emoji = SPECIALTY_EMOJI[m.specialty];
            const initials = m.name[0].toUpperCase();
            const slug = encodeURIComponent(m.name);
            const saved = savedProfiles[m.name.toLowerCase()];
            const avatarUrl = saved?.avatarUrl;
            const verified = !!saved?.claimedBy;

            return (
              <Link
                key={m.name}
                href={`/member/${slug}`}
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  background: `${color}0a`,
                  border: `1px solid ${verified ? color : color + "44"}`,
                  borderRadius: "12px",
                  padding: "20px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  position: "relative",
                }}>
                  {/* Rank badge */}
                  <div style={{ position: "absolute", top: "10px", left: "12px", color: "#555", fontFamily: "Share Tech Mono, monospace", fontSize: "0.6rem" }}>
                    #{i + 1}
                  </div>

                  {/* Verified badge */}
                  {verified && (
                    <div style={{ position: "absolute", top: "10px", right: "10px", color: "#4ade80", fontSize: "0.6rem" }}>✓</div>
                  )}

                  {/* Avatar */}
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={m.name}
                      style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${color}`, display: "block", margin: "0 auto 12px" }}
                    />
                  ) : (
                    <div style={{
                      width: "64px", height: "64px", borderRadius: "50%",
                      background: `${color}22`, border: `2px solid ${color}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 12px",
                      fontSize: "1.5rem", fontWeight: "bold", color,
                    }}>
                      {verified ? (
                        /* Wallet linked, no photo → person icon */
                        <svg viewBox="0 0 40 40" width={36} height={36} xmlns="http://www.w3.org/2000/svg">
                          <circle cx="20" cy="15" r="7" fill={color} opacity={0.75} />
                          <path d="M4 38 Q4 26 20 26 Q36 26 36 38" fill={color} opacity={0.75} />
                        </svg>
                      ) : (
                        /* No wallet linked → initials */
                        initials
                      )}
                    </div>
                  )}

                  {/* Name */}
                  <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#66fcf1", letterSpacing: "1px", marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.name}
                  </div>

                  {/* Specialty */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: `${color}22`, border: `1px solid ${color}55`, color, padding: "2px 10px", borderRadius: "20px", fontSize: "0.55rem", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
                    {emoji} {m.specialty}
                  </div>

                  {/* Level / XP */}
                  <div style={{ fontFamily: "Share Tech Mono, monospace", fontSize: "0.65rem", color: "#888", marginBottom: saved?.games?.length ? "8px" : "0" }}>
                    LV {m.level} · {m.xp.toLocaleString()} XP
                  </div>

                  {/* Game tags */}
                  {saved?.games && saved.games.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: "center" }}>
                      {saved.games.slice(0, 3).map(g => (
                        <span key={g} style={{ background: "rgba(198,245,62,.08)", border: "1px solid rgba(198,245,62,.25)", color: "#c6f53e", padding: "2px 8px", borderRadius: "999px", fontSize: "0.55rem", letterSpacing: "0.5px", fontFamily: "Share Tech Mono, monospace" }}>
                          {g}
                        </span>
                      ))}
                      {saved.games.length > 3 && (
                        <span style={{ color: "#555", fontSize: "0.55rem", fontFamily: "Share Tech Mono, monospace", padding: "2px 4px" }}>+{saved.games.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
