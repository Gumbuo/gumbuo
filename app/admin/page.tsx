"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ConnectButton = dynamic(
  () => import("@rainbow-me/rainbowkit").then((mod) => mod.ConnectButton),
  { ssr: false }
);

// Admin wallet addresses (lowercase)
const ADMIN_WALLETS = [
  "0xb374735cbe89a552421ddb4aad80380ae40f67a7", // Your wallet
];

interface Referral {
  referrerWallet: string;
  referredWallet: string;
  timestamp: number;
  ipAddress?: string;
}

interface ReferralReward {
  id: string;
  referrerWallet: string;
  amount: string;
  status: "pending" | "paid";
  createdAt: number;
  paidAt?: number;
  txHash?: string;
  note?: string;
}

interface EventConfig {
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  activatedBy: string | null;
}

export default function AdminPanel() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [pendingRewards, setPendingRewards] = useState<ReferralReward[]>([]);

  // Event Config
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [eventStatus, setEventStatus] = useState<string>("inactive");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [savingEvent, setSavingEvent] = useState(false);
  const [activeTab, setActiveTab] = useState<"referrals" | "event">("event");

  // Create Reward Form
  const [createWallet, setCreateWallet] = useState("");
  const [createAmount, setCreateAmount] = useState("");
  const [createNote, setCreateNote] = useState("");
  const [creating, setCreating] = useState(false);

  // Mark Paid Form
  const [selectedRewardId, setSelectedRewardId] = useState("");
  const [txHash, setTxHash] = useState("");
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (address && isConnected) {
      checkAdminAccess();
    }
  }, [address, isConnected]);

  const checkAdminAccess = () => {
    if (!address) return;

    const hasAccess = ADMIN_WALLETS.includes(address.toLowerCase());
    setIsAdmin(hasAccess);

    if (hasAccess) {
      loadAdminData();
    }

    setLoading(false);
  };

  const loadAdminData = async () => {
    if (!address) return;

    try {
      const [referralsRes, pendingRes, eventRes] = await Promise.all([
        fetch(`/api/referral/admin?adminWallet=${address}&action=all-referrals&limit=100`),
        fetch(`/api/referral/admin?adminWallet=${address}&action=pending-rewards`),
        fetch(`/api/event/config`),
      ]);

      if (referralsRes.ok) {
        const data = await referralsRes.json();
        setReferrals(data.referrals);
      }

      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingRewards(data.pendingRewards);
      }

      if (eventRes.ok) {
        const data = await eventRes.json();
        setEventConfig(data.config);
        setEventStatus(data.status || "inactive");
        if (data.config.startDate) {
          setEventStartDate(data.config.startDate.split("T")[0]);
        }
        if (data.config.endDate) {
          setEventEndDate(data.config.endDate.split("T")[0]);
        }
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  };

  const handleToggleEvent = async () => {
    if (!address || !eventConfig) return;

    setSavingEvent(true);
    try {
      const res = await fetch("/api/event/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminWallet: address,
          isActive: !eventConfig.isActive,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEventConfig(data.config);
        setEventStatus(data.config.isActive ? "live" : "inactive");
        alert(data.message);
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    } finally {
      setSavingEvent(false);
    }
  };

  const handleSaveEventDates = async () => {
    if (!address) return;

    setSavingEvent(true);
    try {
      const res = await fetch("/api/event/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminWallet: address,
          startDate: eventStartDate ? new Date(eventStartDate).toISOString() : null,
          endDate: eventEndDate ? new Date(eventEndDate + "T23:59:59").toISOString() : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEventConfig(data.config);
        alert("Event dates saved!");
        await loadAdminData();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    } finally {
      setSavingEvent(false);
    }
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !createWallet || !createAmount) return;

    setCreating(true);
    try {
      const res = await fetch("/api/referral/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminWallet: address,
          action: "create-reward",
          referrerWallet: createWallet,
          amount: createAmount,
          note: createNote,
        }),
      });

      if (res.ok) {
        alert(`Successfully created ${createAmount} ETH reward for ${createWallet}`);
        setCreateWallet("");
        setCreateAmount("");
        setCreateNote("");
        await loadAdminData();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !selectedRewardId || !txHash) return;

    setMarking(true);
    try {
      const res = await fetch("/api/referral/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminWallet: address,
          action: "mark-paid",
          rewardId: selectedRewardId,
          txHash,
        }),
      });

      if (res.ok) {
        alert("Successfully marked reward as paid!");
        setSelectedRewardId("");
        setTxHash("");
        await loadAdminData();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    } finally {
      setMarking(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0c10",
        color: "#ffffff",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              color: "#66fcf1",
              textShadow: "0 0 15px #66fcf1",
              fontFamily: "'Orbitron', sans-serif",
            }}
          >
            Admin Panel
          </h1>
          <p style={{ color: "#c5c6c7", fontSize: "1.25rem" }}>
            Manage events, referrals & rewards
          </p>
        </div>

        {/* Wallet Connection */}
        <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "center" }}>
          <ConnectButton />
        </div>

        {!isConnected && (
          <div
            style={{
              padding: "3rem",
              background: "rgba(31, 40, 51, 0.8)",
              borderRadius: "1rem",
              border: "2px solid #45a29e",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "1.5rem", color: "#66fcf1" }}>
              Connect your wallet to access admin panel
            </p>
          </div>
        )}

        {isConnected && loading && (
          <div
            style={{
              padding: "3rem",
              background: "rgba(31, 40, 51, 0.8)",
              borderRadius: "1rem",
              border: "2px solid #45a29e",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "1.5rem", color: "#66fcf1" }}>
              Checking admin access...
            </p>
          </div>
        )}

        {isConnected && !loading && !isAdmin && (
          <div
            style={{
              padding: "3rem",
              background: "rgba(255, 71, 87, 0.2)",
              borderRadius: "1rem",
              border: "2px solid #ff4757",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "1.5rem", color: "#ff4757", marginBottom: "1rem" }}>
              ❌ Access Denied
            </p>
            <p style={{ color: "#aaa" }}>
              You are not authorized to access this admin panel.
            </p>
            <p style={{ color: "#666", fontSize: "0.875rem", marginTop: "0.5rem", fontFamily: "monospace" }}>
              Connected: {address}
            </p>
          </div>
        )}

        {isConnected && !loading && isAdmin && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Tab Navigation */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={() => setActiveTab("event")}
                style={{
                  padding: "1rem 2rem",
                  background: activeTab === "event" ? "linear-gradient(135deg, #ffd700, #ff8c00)" : "rgba(20, 20, 40, 0.8)",
                  color: activeTab === "event" ? "#000" : "#ffd700",
                  border: "2px solid #ffd700",
                  borderRadius: "0.5rem",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer",
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                Event Controls
              </button>
              <button
                onClick={() => setActiveTab("referrals")}
                style={{
                  padding: "1rem 2rem",
                  background: activeTab === "referrals" ? "linear-gradient(135deg, #66fcf1, #45a29e)" : "rgba(20, 20, 40, 0.8)",
                  color: activeTab === "referrals" ? "#000" : "#66fcf1",
                  border: "2px solid #66fcf1",
                  borderRadius: "0.5rem",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer",
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                Referrals
              </button>
            </div>

            {/* Event Controls Tab */}
            {activeTab === "event" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {/* Event Status Card */}
                <div
                  style={{
                    padding: "2rem",
                    background: eventConfig?.isActive
                      ? "linear-gradient(135deg, rgba(0, 255, 65, 0.15), rgba(0, 170, 42, 0.1))"
                      : "linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(255, 71, 87, 0.1))",
                    borderRadius: "1rem",
                    border: eventConfig?.isActive ? "2px solid #00ff41" : "2px solid #ff6b6b",
                    textAlign: "center",
                  }}
                >
                  <div style={{ marginBottom: "1rem" }}>
                    <span
                      style={{
                        fontSize: "1rem",
                        color: eventConfig?.isActive ? "#00ff41" : "#ff6b6b",
                        textTransform: "uppercase",
                        letterSpacing: "3px",
                        fontWeight: "bold",
                      }}
                    >
                      Event Status
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: "bold",
                      color: eventConfig?.isActive ? "#00ff41" : "#ff6b6b",
                      marginBottom: "1rem",
                      textShadow: eventConfig?.isActive ? "0 0 15px #00ff41" : "0 0 15px #ff6b6b",
                    }}
                  >
                    {eventStatus === "live" ? "LIVE" : eventStatus === "upcoming" ? "UPCOMING" : eventStatus === "ended" ? "ENDED" : "INACTIVE"}
                  </div>
                  <button
                    onClick={handleToggleEvent}
                    disabled={savingEvent}
                    style={{
                      padding: "1rem 3rem",
                      background: eventConfig?.isActive
                        ? "linear-gradient(135deg, #ff6b6b, #ff4757)"
                        : "linear-gradient(135deg, #00ff41, #00aa2a)",
                      color: "#000",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      cursor: savingEvent ? "not-allowed" : "pointer",
                      fontFamily: "'Orbitron', sans-serif",
                      opacity: savingEvent ? 0.7 : 1,
                    }}
                  >
                    {savingEvent ? "Saving..." : eventConfig?.isActive ? "DEACTIVATE EVENT" : "ACTIVATE EVENT"}
                  </button>
                  {eventConfig?.activatedBy && (
                    <p style={{ color: "#888", fontSize: "0.75rem", marginTop: "1rem", fontFamily: "monospace" }}>
                      Last activated by: {eventConfig.activatedBy.slice(0, 6)}...{eventConfig.activatedBy.slice(-4)}
                    </p>
                  )}
                </div>

                {/* Event Dates */}
                <div
                  style={{
                    padding: "2rem",
                    background: "rgba(20, 20, 40, 0.8)",
                    borderRadius: "1rem",
                    border: "2px solid #ffd700",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      marginBottom: "1.5rem",
                      color: "#ffd700",
                      fontFamily: "'Orbitron', sans-serif",
                    }}
                  >
                    Event Duration
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div>
                      <label style={{ display: "block", color: "#aaa", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={eventStartDate}
                        onChange={(e) => setEventStartDate(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "1rem",
                          borderRadius: "0.5rem",
                          border: "2px solid #333",
                          background: "#1a1a2e",
                          color: "#fff",
                          fontSize: "1rem",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", color: "#aaa", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                        End Date
                      </label>
                      <input
                        type="date"
                        value={eventEndDate}
                        onChange={(e) => setEventEndDate(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "1rem",
                          borderRadius: "0.5rem",
                          border: "2px solid #333",
                          background: "#1a1a2e",
                          color: "#fff",
                          fontSize: "1rem",
                        }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveEventDates}
                    disabled={savingEvent}
                    style={{
                      width: "100%",
                      padding: "1rem 2rem",
                      background: savingEvent ? "#444" : "linear-gradient(135deg, #ffd700, #ff8c00)",
                      color: "#000",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      cursor: savingEvent ? "not-allowed" : "pointer",
                      fontFamily: "'Orbitron', sans-serif",
                    }}
                  >
                    {savingEvent ? "Saving..." : "Save Dates"}
                  </button>
                  {eventConfig?.startDate && eventConfig?.endDate && (
                    <p style={{ color: "#888", fontSize: "0.875rem", marginTop: "1rem", textAlign: "center" }}>
                      Duration: {Math.ceil((new Date(eventConfig.endDate).getTime() - new Date(eventConfig.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  )}
                </div>

                {/* Quick Actions */}
                <div
                  style={{
                    padding: "2rem",
                    background: "rgba(20, 20, 40, 0.8)",
                    borderRadius: "1rem",
                    border: "2px solid #333",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      marginBottom: "1.5rem",
                      color: "#66fcf1",
                      fontFamily: "'Orbitron', sans-serif",
                    }}
                  >
                    Quick Actions
                  </h3>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <a
                      href="/event"
                      target="_blank"
                      style={{
                        padding: "1rem 2rem",
                        background: "linear-gradient(135deg, #1da1f2, #0d8bd9)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "0.5rem",
                        fontWeight: "bold",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        fontFamily: "'Orbitron', sans-serif",
                        textDecoration: "none",
                      }}
                    >
                      View Event Page
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Referrals Tab */}
            {activeTab === "referrals" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Summary Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem",
              }}
            >
              <div
                style={{
                  padding: "2rem",
                  background: "linear-gradient(135deg, rgba(102, 252, 241, 0.1), rgba(69, 162, 158, 0.05))",
                  borderRadius: "1rem",
                  border: "2px solid #45a29e",
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#c5c6c7", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                  Total Referrals
                </p>
                <p style={{ color: "#66fcf1", fontSize: "3rem", fontWeight: "bold" }}>
                  {referrals.length}
                </p>
              </div>

              <div
                style={{
                  padding: "2rem",
                  background: "linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))",
                  borderRadius: "1rem",
                  border: "2px solid #ffd700",
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#888", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                  Pending Rewards
                </p>
                <p style={{ color: "#ffd700", fontSize: "3rem", fontWeight: "bold" }}>
                  {pendingRewards.length}
                </p>
                <p style={{ color: "#888", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                  {pendingRewards.reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(4)} ETH
                </p>
              </div>
            </div>

            {/* Create Reward */}
            <div
              style={{
                padding: "2rem",
                background: "rgba(20, 20, 40, 0.8)",
                borderRadius: "1rem",
                border: "2px solid #333",
              }}
            >
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "1.5rem",
                  color: "#66fcf1",
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                Create Reward
              </h3>
              <form onSubmit={handleCreateReward} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input
                  type="text"
                  placeholder="Wallet Address (0x...)"
                  value={createWallet}
                  onChange={(e) => setCreateWallet(e.target.value)}
                  style={{
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    border: "2px solid #333",
                    background: "#1a1a2e",
                    color: "#fff",
                    fontSize: "1rem",
                  }}
                />
                <input
                  type="text"
                  placeholder="Amount (ETH, e.g., 0.01)"
                  value={createAmount}
                  onChange={(e) => setCreateAmount(e.target.value)}
                  style={{
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    border: "2px solid #333",
                    background: "#1a1a2e",
                    color: "#fff",
                    fontSize: "1rem",
                  }}
                />
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={createNote}
                  onChange={(e) => setCreateNote(e.target.value)}
                  style={{
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    border: "2px solid #333",
                    background: "#1a1a2e",
                    color: "#fff",
                    fontSize: "1rem",
                  }}
                />
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    padding: "1rem 2rem",
                    background: creating ? "#444" : "linear-gradient(135deg, #66fcf1, #45a29e)",
                    color: "#000",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    cursor: creating ? "not-allowed" : "pointer",
                    fontFamily: "'Orbitron', sans-serif",
                  }}
                >
                  {creating ? "Creating..." : "Create Reward"}
                </button>
              </form>
            </div>

            {/* Pending Rewards */}
            {pendingRewards.length > 0 && (
              <div
                style={{
                  padding: "2rem",
                  background: "rgba(20, 20, 40, 0.8)",
                  borderRadius: "1rem",
                  border: "2px solid #333",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    marginBottom: "1.5rem",
                    color: "#ffd700",
                    fontFamily: "'Orbitron', sans-serif",
                  }}
                >
                  Pending Rewards ({pendingRewards.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {pendingRewards.map((reward) => (
                    <div
                      key={reward.id}
                      style={{
                        padding: "1.5rem",
                        background: "rgba(255, 215, 0, 0.05)",
                        border: "2px solid #ffd700",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <div>
                          <p style={{ color: "#fff", fontWeight: "bold", fontSize: "1.25rem" }}>
                            {reward.amount} ETH
                          </p>
                          <p style={{ color: "#888", fontSize: "0.875rem", fontFamily: "monospace" }}>
                            {reward.referrerWallet}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ color: "#ffd700", fontSize: "0.875rem" }}>
                            {new Date(reward.createdAt).toLocaleDateString()}
                          </p>
                          {reward.note && (
                            <p style={{ color: "#aaa", fontSize: "0.875rem" }}>{reward.note}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedRewardId(reward.id)}
                        style={{
                          padding: "0.75rem 1.5rem",
                          background: selectedRewardId === reward.id ? "#00ff99" : "linear-gradient(135deg, #1da1f2, #0d8bd9)",
                          color: selectedRewardId === reward.id ? "#000" : "#fff",
                          border: "none",
                          borderRadius: "0.5rem",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: "0.875rem",
                        }}
                      >
                        {selectedRewardId === reward.id ? "✓ Selected" : "Mark as Paid"}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Mark Paid Form */}
                {selectedRewardId && (
                  <form
                    onSubmit={handleMarkPaid}
                    style={{
                      marginTop: "2rem",
                      padding: "1.5rem",
                      background: "rgba(29, 161, 242, 0.1)",
                      border: "2px solid #1da1f2",
                      borderRadius: "0.5rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <h4 style={{ color: "#1da1f2", fontWeight: "bold" }}>
                      Mark Reward as Paid
                    </h4>
                    <input
                      type="text"
                      placeholder="Transaction Hash (0x...)"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      style={{
                        padding: "1rem",
                        borderRadius: "0.5rem",
                        border: "2px solid #1da1f2",
                        background: "#1a1a2e",
                        color: "#fff",
                        fontSize: "1rem",
                        fontFamily: "monospace",
                      }}
                    />
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <button
                        type="submit"
                        disabled={marking}
                        style={{
                          flex: 1,
                          padding: "1rem 2rem",
                          background: marking ? "#444" : "linear-gradient(135deg, #1da1f2, #0d8bd9)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "0.5rem",
                          fontWeight: "bold",
                          cursor: marking ? "not-allowed" : "pointer",
                          fontFamily: "'Orbitron', sans-serif",
                        }}
                      >
                        {marking ? "Marking..." : "Confirm Payment"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRewardId("");
                          setTxHash("");
                        }}
                        style={{
                          padding: "1rem 2rem",
                          background: "#444",
                          color: "#fff",
                          border: "none",
                          borderRadius: "0.5rem",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontFamily: "'Orbitron', sans-serif",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* All Referrals */}
            <div
              style={{
                padding: "2rem",
                background: "rgba(20, 20, 40, 0.8)",
                borderRadius: "1rem",
                border: "2px solid #333",
              }}
            >
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "1.5rem",
                  color: "#66fcf1",
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                All Referrals ({referrals.length})
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #333" }}>
                      <th style={{ padding: "1rem", textAlign: "left", color: "#00ff99" }}>Referrer</th>
                      <th style={{ padding: "1rem", textAlign: "left", color: "#00ff99" }}>Referred</th>
                      <th style={{ padding: "1rem", textAlign: "center", color: "#00ff99" }}>Date</th>
                      <th style={{ padding: "1rem", textAlign: "center", color: "#00ff99" }}>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((referral, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #222" }}>
                        <td style={{ padding: "1rem", fontFamily: "monospace", fontSize: "0.875rem" }}>
                          {referral.referrerWallet.slice(0, 6)}...{referral.referrerWallet.slice(-4)}
                        </td>
                        <td style={{ padding: "1rem", fontFamily: "monospace", fontSize: "0.875rem" }}>
                          {referral.referredWallet.slice(0, 6)}...{referral.referredWallet.slice(-4)}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "center", fontSize: "0.875rem", color: "#888" }}>
                          {new Date(referral.timestamp).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "center", fontSize: "0.875rem", color: "#666", fontFamily: "monospace" }}>
                          {referral.ipAddress || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
