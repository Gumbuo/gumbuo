"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { Crown } from "../components/Crown";

const LIME    = "#c6f53e";
const MAG     = "#3d9eff";
const BG      = "#08090a";
const SURFACE = "#101214";
const LINE    = "rgba(255,255,255,.12)";
const MUTED   = "#878d86";

type GuildStatus = "pending" | "accepted" | "removed";

type MemberEntry = {
  name: string;
  profile: {
    avatarUrl?: string;
    discordTag?: string;
    claimedBy?: string;
    guildStatus?: GuildStatus;
    claimedAt?: number;
  };
};

type OfficerData = {
  pending: MemberEntry[];
  members: MemberEntry[];
};

type PanelState = "not-connected" | "not-officer" | "loading" | "ready" | "error";

export default function OfficerPage() {
  const { address, isConnected } = useAccount();
  const [panelState, setPanelState] = useState<PanelState>("not-connected");
  const [data, setData] = useState<OfficerData>({ pending: [], members: [] });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const loadData = useCallback(async (wallet: string) => {
    setPanelState("loading");
    try {
      const res = await fetch(`/api/officer?wallet=${wallet.toLowerCase()}`);
      if (res.status === 403) { setPanelState("not-officer"); return; }
      if (!res.ok) { setPanelState("error"); return; }
      const json = await res.json() as OfficerData;
      setData(json);
      setPanelState("ready");
    } catch {
      setPanelState("error");
    }
  }, []);

  useEffect(() => {
    if (!isConnected || !address) { setPanelState("not-connected"); return; }
    loadData(address);
  }, [address, isConnected, loadData]);

  const act = async (name: string, action: "accept" | "remove") => {
    if (!address) return;
    setActionLoading(name + action);
    setMessage(null);
    try {
      const res = await fetch("/api/officer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officerWallet: address.toLowerCase(), name, action }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ text: `${name} ${action === "accept" ? "approved" : "removed"}`, ok: true });
        await loadData(address);
      } else {
        setMessage({ text: json.error || "Action failed", ok: false });
      }
    } catch {
      setMessage({ text: "Network error", ok: false });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#f2f4f0", fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72, padding: "0 clamp(20px,4vw,60px)", borderBottom: `1.5px solid ${LINE}`, background: "rgba(8,9,10,.95)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'Anton', sans-serif", fontSize: 24, textTransform: "uppercase", color: "#f2f4f0", textDecoration: "none" }}>
          <Crown size={32} />TWC GUILD
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 14, textTransform: "uppercase", color: LIME, letterSpacing: ".08em" }}>Officer Panel</span>
          <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" />
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px clamp(16px,3vw,40px)" }}>

        {/* Gate screens */}
        {panelState === "not-connected" && (
          <GateScreen
            emoji="🛡"
            title="Officer Panel"
            body="Connect your officer wallet to access the approval queue."
            action={<ConnectButton />}
          />
        )}

        {panelState === "not-officer" && (
          <GateScreen
            emoji="⛔"
            title="Access Denied"
            body="Your wallet is not registered as a guild officer. Ask the guild leader to add your wallet to OFFICER_WALLETS."
            action={<Link href="/" style={ghostBtn}>← Back to guild</Link>}
          />
        )}

        {panelState === "loading" && (
          <GateScreen emoji="⏳" title="Checking access…" body="" action={null} />
        )}

        {panelState === "error" && (
          <GateScreen
            emoji="⚠️"
            title="Something went wrong"
            body="Could not load officer data. Try again."
            action={<button onClick={() => address && loadData(address)} style={limeBtn}>Retry</button>}
          />
        )}

        {panelState === "ready" && (
          <>
            <div style={{ marginBottom: 40 }}>
              <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(32px,4vw,52px)", textTransform: "uppercase", margin: "0 0 8px", fontWeight: 400 }}>
                OFFICER <span style={{ color: LIME }}>PANEL</span>
              </h1>
              <p style={{ color: MUTED, margin: 0 }}>Approve or remove pending guild members.</p>
            </div>

            {message && (
              <div style={{ padding: "12px 18px", borderRadius: 10, marginBottom: 24, background: message.ok ? "rgba(198,245,62,.1)" : "rgba(61,158,255,.1)", border: `1.5px solid ${message.ok ? LIME : MAG}`, color: message.ok ? LIME : MAG, fontWeight: 600 }}>
                {message.text}
              </div>
            )}

            {/* Pending approvals */}
            <section style={{ marginBottom: 48 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, textTransform: "uppercase", margin: 0, fontWeight: 400 }}>Pending</h2>
                {data.pending.length > 0 && (
                  <span style={{ background: MAG, color: "#001a33", fontWeight: 700, fontSize: 12, padding: "3px 10px", borderRadius: 999 }}>
                    {data.pending.length}
                  </span>
                )}
              </div>

              {data.pending.length === 0 ? (
                <div style={{ padding: "32px 24px", background: SURFACE, border: `1.5px solid ${LINE}`, borderRadius: 16, textAlign: "center", color: MUTED }}>
                  No pending approvals — you&apos;re all caught up.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {data.pending.map((entry) => (
                    <MemberCard
                      key={entry.name}
                      entry={entry}
                      actionLoading={actionLoading}
                      onAccept={() => act(entry.name, "accept")}
                      onRemove={() => act(entry.name, "remove")}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Accepted members */}
            <section>
              <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, textTransform: "uppercase", margin: "0 0 20px", fontWeight: 400 }}>
                Guild Members <span style={{ color: MUTED, fontSize: 18 }}>({data.members.length})</span>
              </h2>
              {data.members.length === 0 ? (
                <div style={{ padding: "32px 24px", background: SURFACE, border: `1.5px solid ${LINE}`, borderRadius: 16, textAlign: "center", color: MUTED }}>
                  No approved members yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.members.map((entry) => (
                    <div key={entry.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: SURFACE, border: `1.5px solid ${LINE}`, borderRadius: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <Avatar entry={entry} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, textTransform: "capitalize" }}>{entry.name}</div>
                          {entry.profile.discordTag && <div style={{ fontSize: 12, color: MUTED }}>Discord: {entry.profile.discordTag}</div>}
                          <div style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>{entry.profile.claimedBy?.slice(0, 10)}…</div>
                        </div>
                      </div>
                      <button
                        onClick={() => act(entry.name, "remove")}
                        disabled={actionLoading === entry.name + "remove"}
                        style={{ ...ghostBtn, color: MAG, borderColor: "rgba(61,158,255,.3)", fontSize: 12, padding: "6px 14px" }}
                      >
                        {actionLoading === entry.name + "remove" ? "…" : "Remove"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function GateScreen({ emoji, title, body, action }: { emoji: string; title: string; body: string; action: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", gap: 16 }}>
      <div style={{ fontSize: 56 }}>{emoji}</div>
      <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 36, textTransform: "uppercase", margin: 0, color: "#c6f53e", fontWeight: 400 }}>{title}</h2>
      {body && <p style={{ color: MUTED, maxWidth: 400, lineHeight: 1.6, margin: 0 }}>{body}</p>}
      {action}
    </div>
  );
}

function Avatar({ entry }: { entry: MemberEntry }) {
  return entry.profile.avatarUrl ? (
    <img src={entry.profile.avatarUrl} alt={entry.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", border: `1.5px solid ${LINE}` }} />
  ) : (
    <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(198,245,62,.1)", border: `1.5px solid ${LINE}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 40 40" width={28} height={28} xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="15" r="7" fill={LIME} opacity={0.7} />
        <path d="M4 38 Q4 26 20 26 Q36 26 36 38" fill={LIME} opacity={0.7} />
      </svg>
    </div>
  );
}

function MemberCard({ entry, actionLoading, onAccept, onRemove }: {
  entry: MemberEntry;
  actionLoading: string | null;
  onAccept: () => void;
  onRemove: () => void;
}) {
  const claimedDate = entry.profile.claimedAt
    ? new Date(entry.profile.claimedAt).toLocaleDateString()
    : "Unknown";

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: SURFACE, border: `1.5px solid rgba(61,158,255,.25)`, borderRadius: 14, gap: 16, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar entry={entry} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, textTransform: "capitalize" }}>{entry.name}</div>
          {entry.profile.discordTag && <div style={{ fontSize: 12, color: MUTED }}>Discord: {entry.profile.discordTag}</div>}
          <div style={{ fontSize: 11, color: MUTED }}>
            Claimed {claimedDate} · <span style={{ fontFamily: "monospace" }}>{entry.profile.claimedBy?.slice(0, 10)}…</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        <button onClick={onAccept} disabled={!!actionLoading} style={limeBtn}>
          {actionLoading === entry.name + "accept" ? "…" : "✓ Approve"}
        </button>
        <button onClick={onRemove} disabled={!!actionLoading} style={{ ...ghostBtn, color: MAG, borderColor: "rgba(61,158,255,.3)" }}>
          {actionLoading === entry.name + "remove" ? "…" : "✕ Remove"}
        </button>
      </div>
    </div>
  );
}

const limeBtn: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: 13,
  padding: "9px 20px",
  borderRadius: 999,
  border: "none",
  cursor: "pointer",
  background: LIME,
  color: "#0a0c05",
};

const ghostBtn: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: 13,
  padding: "9px 20px",
  borderRadius: 999,
  background: "transparent",
  color: "#f2f4f0",
  border: `1.5px solid ${LINE}`,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-block",
};
