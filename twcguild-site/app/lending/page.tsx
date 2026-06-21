"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const ITEMS = [
  { name: "Demon Sword",   color: "#ff2d2d", emoji: "⚔️" },
  { name: "Demon Shield",  color: "#ff6b00", emoji: "🛡️" },
  { name: "Demon Arrow",   color: "#b44dff", emoji: "🏹" },
  { name: "Demon Pavise",  color: "#4fc3f7", emoji: "🔰" },
  { name: "Gold Axe",      color: "#c68642", emoji: "🪓" },
  { name: "Gold Pickaxe",  color: "#ffd700", emoji: "⛏️" },
];

type Request = {
  id: string;
  playerName: string;
  item: string;
  note: string;
  createdAt: string;
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function LendingPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ playerName: "", item: ITEMS[0].name, note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchRequests = () => {
    fetch("/api/lending")
      .then(r => r.json())
      .then(d => { setRequests(d.requests || []); setLoading(false); });
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.playerName.trim()) return;
    setSubmitting(true);
    await fetch("/api/lending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    setSubmitted(true);
    setForm({ playerName: "", item: ITEMS[0].name, note: "" });
    setTimeout(() => setSubmitted(false), 3000);
    fetchRequests();
  };

  const handleFulfill = async (id: string) => {
    await fetch("/api/lending", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchRequests();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0c10", fontFamily: "Orbitron, sans-serif", color: "#66fcf1", paddingBottom: "80px" }}>

      {/* Top bar */}
      <div style={{ background: "rgba(0,0,0,0.8)", borderBottom: "2px solid #45a29e", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ color: "#45a29e", textDecoration: "none", fontSize: "0.85rem", fontWeight: "bold" }}>
          ← TWC GUILD
        </Link>
        <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" />
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 16px" }}>

        <h1 style={{ fontSize: "1.4rem", textAlign: "center", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "6px", textShadow: "0 0 15px #66fcf1" }}>
          NomStead Item Board
        </h1>
        <p style={{ textAlign: "center", color: "#c5c6c7", fontFamily: "Share Tech Mono, monospace", fontSize: "0.8rem", marginBottom: "40px" }}>
          Need a guild item? Post a request and a member will hook you up.
        </p>

        {/* Items reference */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "10px", marginBottom: "40px" }}>
          {ITEMS.map(item => (
            <div key={item.name} style={{ background: `${item.color}11`, border: `1px solid ${item.color}44`, borderRadius: "8px", padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "4px" }}>{item.emoji}</div>
              <div style={{ fontSize: "0.6rem", color: item.color, letterSpacing: "1px", textTransform: "uppercase", lineHeight: "1.3" }}>{item.name}</div>
            </div>
          ))}
        </div>

        {/* Request form */}
        <div style={{ background: "rgba(0,0,0,0.5)", border: "2px solid #45a29e", borderRadius: "12px", padding: "24px", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase", color: "#45a29e", marginBottom: "20px" }}>
            Post a Request
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", color: "#45a29e", fontSize: "0.6rem", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Your Name</label>
                <input
                  type="text"
                  placeholder="In-game name"
                  value={form.playerName}
                  onChange={e => setForm(f => ({ ...f, playerName: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.5)", border: "1px solid #45a29e44", borderRadius: "6px", color: "#fff", fontFamily: "Share Tech Mono, monospace", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", color: "#45a29e", fontSize: "0.6rem", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Item Needed</label>
                <select
                  value={form.item}
                  onChange={e => setForm(f => ({ ...f, item: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.8)", border: "1px solid #45a29e44", borderRadius: "6px", color: "#fff", fontFamily: "Share Tech Mono, monospace", fontSize: "13px", boxSizing: "border-box" }}
                >
                  {ITEMS.map(item => (
                    <option key={item.name} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: "block", color: "#45a29e", fontSize: "0.6rem", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Note <span style={{ color: "#555" }}>(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. need it for PvP event Saturday"
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", background: "rgba(0,0,0,0.5)", border: "1px solid #45a29e44", borderRadius: "6px", color: "#fff", fontFamily: "Share Tech Mono, monospace", fontSize: "13px", boxSizing: "border-box" }}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: "12px", background: "rgba(69,162,158,0.2)", border: "2px solid #45a29e", borderRadius: "8px", color: "#45a29e", fontFamily: "Orbitron, sans-serif", fontWeight: "bold", fontSize: "13px", cursor: "pointer", letterSpacing: "1px" }}
            >
              {submitting ? "POSTING..." : submitted ? "✓ POSTED!" : "POST REQUEST"}
            </button>
          </form>
        </div>

        {/* Active requests */}
        <h2 style={{ fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase", color: "#45a29e", marginBottom: "16px" }}>
          Active Requests {!loading && `(${requests.length})`}
        </h2>

        {loading ? (
          <div style={{ textAlign: "center", color: "#555", fontFamily: "Share Tech Mono, monospace", padding: "40px" }}>Loading...</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: "center", color: "#555", fontFamily: "Share Tech Mono, monospace", padding: "40px", border: "1px dashed #45a29e22", borderRadius: "12px" }}>
            No active requests — guild is stocked up!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {requests.map(req => {
              const itemMeta = ITEMS.find(i => i.name === req.item) || { color: "#45a29e", emoji: "📦" };
              return (
                <div key={req.id} style={{ background: `${itemMeta.color}0d`, border: `1px solid ${itemMeta.color}44`, borderRadius: "10px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>{itemMeta.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ color: "#66fcf1", fontWeight: "bold", fontSize: "0.9rem" }}>{req.playerName}</span>
                      <span style={{ color: itemMeta.color, fontSize: "0.75rem", letterSpacing: "1px" }}>needs {req.item}</span>
                    </div>
                    {req.note && (
                      <div style={{ color: "#888", fontFamily: "Share Tech Mono, monospace", fontSize: "0.75rem" }}>{req.note}</div>
                    )}
                    <div style={{ color: "#444", fontFamily: "Share Tech Mono, monospace", fontSize: "0.65rem", marginTop: "4px" }}>{timeAgo(req.createdAt)}</div>
                  </div>
                  <button
                    onClick={() => handleFulfill(req.id)}
                    style={{ background: "rgba(74,222,128,0.1)", border: "1px solid #4ade8044", color: "#4ade80", fontFamily: "Share Tech Mono, monospace", fontSize: "0.65rem", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                  >
                    ✓ Fulfilled
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
