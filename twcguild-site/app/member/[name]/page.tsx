"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import activityData from "../../guildevents/activity-data.json";
import memberRoster from "../../guildevents/member-roster.json";

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

type SavedProfile = {
  avatarUrl?: string;
  discordTag?: string;
  customTitle?: string;
};

function sum(map: Record<string, number>) {
  return Object.values(map).reduce((a, b) => a + b, 0);
}

function fmt(n: number) { return n.toLocaleString(); }

function daysInGuild(joinDate: string | null) {
  if (!joinDate) return null;
  const join = new Date(joinDate + "T00:00:00");
  return Math.floor((Date.now() - join.getTime()) / 86400000);
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

export default function MemberPage({ params }: { params: { name: string } }) {
  const nameParam = params.name;
  const players = (activityData as unknown as { players: Player[] }).players;
  const roster = memberRoster as RosterMember[];

  const player = players.find(p => p.name.toLowerCase() === nameParam.toLowerCase());
  const rosterEntry = roster.find(r => r.name.toLowerCase() === nameParam.toLowerCase());

  const [saved, setSaved] = useState<SavedProfile>({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ avatarUrl: "", discordTag: "", customTitle: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/profile/${nameParam}`)
      .then(r => r.json())
      .then(d => {
        setSaved(d.profile || {});
        setForm({
          avatarUrl: d.profile?.avatarUrl || "",
          discordTag: d.profile?.discordTag || "",
          customTitle: d.profile?.customTitle || "",
        });
      });
  }, [nameParam]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/profile/${nameParam}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(form);
    setSaving(false);
    setEditing(false);
  };

  if (!player && !rosterEntry) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0c10", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Orbitron, sans-serif" }}>
        <div style={{ color: "#ff4444", fontSize: "1.2rem", marginBottom: "20px" }}>Member not found</div>
        <Link href="/" style={{ color: "#45a29e", textDecoration: "none", fontSize: "0.85rem" }}>← Back to TWC Guild</Link>
      </div>
    );
  }

  const autoTitle = player ? getAutoTitle(player) : "Guild Member";
  const title = saved.customTitle || form.customTitle || autoTitle;
  const titleColor = SPECIALTY_COLORS[autoTitle] || "#45a29e";
  const days = player ? daysInGuild(player.joinDate) : null;
  const kicked = player?.guildStatus === "kicked";

  const badges: { label: string; color: string }[] = [];
  if (player) {
    if (player.trees >= 150) badges.push({ label: "🪓 Gold Axe", color: "#c68642" });
    if (player.mineSwings >= 150) badges.push({ label: "⛏️ Gold Pickaxe", color: "#b44dff" });
    if (player.fishCasts >= 150) badges.push({ label: "🎣 Gold Rod", color: "#00838f" });
  }

  const displayName = player?.name || rosterEntry?.name || nameParam;

  return (
    <div style={{ minHeight: "100vh", background: "#0b0c10", fontFamily: "Orbitron, sans-serif", color: "#66fcf1", paddingBottom: "80px" }}>

      {/* Top bar */}
      <div style={{ background: "rgba(0,0,0,0.8)", borderBottom: "2px solid #45a29e", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ color: "#45a29e", textDecoration: "none", fontSize: "0.85rem", fontWeight: "bold" }}>
          ← TWC GUILD
        </Link>
        <span style={{ fontSize: "0.7rem", color: "#c5c6c7", letterSpacing: "2px", textTransform: "uppercase" }}>
          Member Profile
        </span>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 16px" }}>

        {/* Profile card */}
        <div style={{ background: "rgba(0,0,0,0.5)", border: "2px solid #45a29e", borderRadius: "16px", padding: "32px", marginBottom: "30px", textAlign: "center" }}>

          {/* Avatar */}
          <div style={{ marginBottom: "20px" }}>
            {saved.avatarUrl ? (
              <img
                src={saved.avatarUrl}
                alt={displayName}
                style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", border: "3px solid #45a29e", display: "block", margin: "0 auto" }}
              />
            ) : (
              <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: `${titleColor}22`, border: `3px solid ${titleColor}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: "2.5rem", fontWeight: "bold", color: titleColor }}>
                {displayName[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Name */}
          <h1 style={{ fontSize: "2rem", letterSpacing: "3px", margin: "0 0 8px 0", color: kicked ? "#ff6b6b" : "#66fcf1" }}>
            {displayName}
          </h1>

          {/* Title badge */}
          <div style={{ marginBottom: "12px" }}>
            <span style={{ background: `${titleColor}22`, border: `1px solid ${titleColor}`, color: titleColor, padding: "4px 14px", borderRadius: "20px", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase" }}>
              {title}
            </span>
          </div>

          {/* Discord tag */}
          {saved.discordTag && (
            <div style={{ color: "#7289da", fontFamily: "Share Tech Mono, monospace", fontSize: "0.85rem", marginBottom: "12px" }}>
              Discord: {saved.discordTag}
            </div>
          )}

          {/* Days in guild / status */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
            {days !== null && (
              <span style={{ background: kicked ? "rgba(255,45,45,0.1)" : "rgba(255,215,0,0.1)", border: `1px solid ${kicked ? "#ff2d2d" : "#ffd70066"}`, color: kicked ? "#ff6b6b" : "#ffd700", padding: "3px 12px", borderRadius: "4px", fontSize: "0.65rem", letterSpacing: "1px" }}>
                {kicked ? `⚠ KICKED — Day ${days}` : `Day ${days} in Guild`}
              </span>
            )}
            {rosterEntry && (
              <span style={{ background: "rgba(69,162,158,0.1)", border: "1px solid #45a29e44", color: "#45a29e", padding: "3px 12px", borderRadius: "4px", fontSize: "0.65rem", letterSpacing: "1px" }}>
                LV {rosterEntry.level} · {rosterEntry.xp.toLocaleString()} XP
              </span>
            )}
          </div>

          {/* Earned badges */}
          {badges.length > 0 && (
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
              {badges.map(b => (
                <span key={b.label} style={{ background: `${b.color}22`, border: `1px solid ${b.color}`, color: b.color, padding: "3px 12px", borderRadius: "4px", fontSize: "0.65rem", letterSpacing: "1px" }}>
                  {b.label} Earned
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {player && (
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid #45a29e", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", color: "#45a29e", marginBottom: "20px" }}>
              Activity Stats
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "16px" }}>
              {[
                { emoji: "🌾", label: "Harvested", value: fmt(sum(player.harvested)) },
                { emoji: "🌱", label: "Planted", value: fmt(sum(player.planted)) },
                { emoji: "🪓", label: "Wood", value: fmt(player.trees) },
                { emoji: "⛏️", label: "Mined", value: fmt(sum(player.mined)) },
                { emoji: "🎣", label: "Fished", value: fmt(sum(player.fished)) },
                { emoji: "📋", label: "Quest Items", value: fmt(sum(player.quests)) },
                { emoji: "💰", label: "Gold Earned", value: (player.goldEarned || 0).toFixed(2) },
                { emoji: "🏦", label: "Vault Donated", value: fmt(player.vaultDonated || 0) },
              ].map(({ emoji, label, value }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#66fcf1" }}>{value}</div>
                  <div style={{ fontSize: "0.6rem", color: "#c5c6c7", letterSpacing: "1px", textTransform: "uppercase", marginTop: "2px" }}>{emoji} {label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Profile */}
        <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #45a29e33", borderRadius: "12px", padding: "20px" }}>
          <button
            onClick={() => setEditing(!editing)}
            style={{ background: "transparent", border: "1px solid #45a29e", color: "#45a29e", fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", padding: "8px 20px", borderRadius: "6px", cursor: "pointer", letterSpacing: "1px", width: "100%" }}
          >
            {editing ? "CANCEL" : "✏ EDIT MY PROFILE"}
          </button>

          {editing && (
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", color: "#45a29e", fontSize: "0.6rem", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Avatar Image URL</label>
                <input
                  type="text"
                  placeholder="https://... (Discord avatar, Twitter pic, etc.)"
                  value={form.avatarUrl}
                  onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.5)", border: "1px solid #45a29e44", borderRadius: "6px", color: "#fff", fontFamily: "Share Tech Mono, monospace", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", color: "#45a29e", fontSize: "0.6rem", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Discord Tag</label>
                <input
                  type="text"
                  placeholder="e.g. foxhole#1234 or @foxhole"
                  value={form.discordTag}
                  onChange={e => setForm(f => ({ ...f, discordTag: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.5)", border: "1px solid #45a29e44", borderRadius: "6px", color: "#fff", fontFamily: "Share Tech Mono, monospace", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", color: "#45a29e", fontSize: "0.6rem", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Custom Title <span style={{ color: "#555" }}>(leave blank to use earned title)</span></label>
                <input
                  type="text"
                  placeholder="e.g. Officer, Founder, Dragon Slayer..."
                  value={form.customTitle}
                  onChange={e => setForm(f => ({ ...f, customTitle: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.5)", border: "1px solid #45a29e44", borderRadius: "6px", color: "#fff", fontFamily: "Share Tech Mono, monospace", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: "12px", background: "rgba(69,162,158,0.2)", border: "2px solid #45a29e", borderRadius: "8px", color: "#45a29e", fontFamily: "Orbitron, sans-serif", fontWeight: "bold", fontSize: "13px", cursor: "pointer", letterSpacing: "1px" }}
              >
                {saving ? "SAVING..." : "SAVE PROFILE"}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
