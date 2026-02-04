"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import dynamic from "next/dynamic";

const ConnectButton = dynamic(
  () => import("@rainbow-me/rainbowkit").then((mod) => mod.ConnectButton),
  { ssr: false }
);

interface MilestoneItem {
  name: string;
  required: number;
  reached: boolean;
  shares: number;
}

interface GameStatsProgress {
  explorer: { completed: boolean; gamesPlayed: number; required: number };
  hunter: { completed: boolean; totalKills: number; required: number };
  crafter: { completed: boolean; itemsCrafted: number; required: number };
  fisher: { completed: boolean; totalCasts: number; required: number };
  master: { completed: boolean };
  totalShares: number;
}

interface MilestoneProgress {
  ap: {
    currentAP: number;
    milestones: MilestoneItem[];
    totalShares: number;
  };
  gameStats: GameStatsProgress;
  level: {
    currentLevel: number;
    milestones: MilestoneItem[];
    totalShares: number;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    milestones: MilestoneItem[];
    totalShares: number;
  };
  totalShares: number;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  todayRecorded: boolean;
}

interface ClaimsData {
  claimedMilestones: string[];
  totalSharesClaimed: number;
}

interface EventConfig {
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
}

// Milestone ID mappings
const AP_MILESTONE_IDS = ["ap_bronze", "ap_silver", "ap_gold", "ap_platinum", "ap_diamond"];
const LEVEL_MILESTONE_IDS = ["level_novice", "level_apprentice", "level_veteran", "level_elite", "level_legend"];
const GAME_MILESTONE_IDS = ["game_explorer", "game_hunter", "game_crafter", "game_fisher", "game_master"];
const STREAK_MILESTONE_IDS = ["streak_consistent", "streak_dedicated", "streak_committed", "streak_devoted"];

export default function QuestPage() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const [progress, setProgress] = useState<MilestoneProgress | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [claims, setClaims] = useState<ClaimsData | null>(null);
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [eventStatus, setEventStatus] = useState<string>("inactive");
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch event config
  useEffect(() => {
    const fetchEventConfig = async () => {
      try {
        const res = await fetch('/api/event/config');
        const data = await res.json();
        if (data.success) {
          setEventConfig(data.config);
          setEventStatus(data.status || "inactive");
        }
      } catch (err) {
        console.error('Failed to fetch event config:', err);
      }
    };
    fetchEventConfig();
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        const [progressRes, streakRes, claimsRes] = await Promise.all([
          fetch(`/api/event?wallet=${address}`),
          fetch(`/api/event/streak?wallet=${address}`),
          fetch(`/api/event/claim?wallet=${address}`),
        ]);

        if (progressRes.ok) {
          const data = await progressRes.json();
          if (data.success) {
            setProgress(data.progress);
          }
        }

        if (streakRes.ok) {
          const data = await streakRes.json();
          if (data.success) {
            setStreakData(data.data);
          }
        }

        if (claimsRes.ok) {
          const data = await claimsRes.json();
          if (data.success) {
            setClaims(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchData();
    }
  }, [address]);

  const handleCheckIn = async () => {
    if (!address || checkingIn) return;

    setCheckingIn(true);
    setMessage(null);

    try {
      const res = await fetch('/api/event/streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address }),
      });

      const data = await res.json();

      if (data.success) {
        setStreakData({
          currentStreak: data.data.currentStreak,
          longestStreak: data.data.longestStreak,
          lastActivityDate: data.data.lastActivityDate,
          todayRecorded: true,
        });

        if (data.data.alreadyRecorded) {
          setMessage({ text: "Already checked in today!", type: 'success' });
        } else {
          setMessage({ text: `Checked in! Streak: ${data.data.currentStreak} days`, type: 'success' });
        }

        // Refresh progress
        const progressRes = await fetch(`/api/event?wallet=${address}`);
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          if (progressData.success) {
            setProgress(progressData.progress);
          }
        }
      } else {
        setMessage({ text: data.error || "Check-in failed", type: 'error' });
      }
    } catch (err) {
      setMessage({ text: "Check-in failed", type: 'error' });
    } finally {
      setCheckingIn(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleClaim = async (milestoneId: string) => {
    if (!address || claiming) return;

    setClaiming(milestoneId);
    setMessage(null);

    try {
      const res = await fetch('/api/event/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address, milestoneId }),
      });

      const data = await res.json();

      if (data.success) {
        setClaims({
          claimedMilestones: data.data.claimedMilestones,
          totalSharesClaimed: data.data.totalSharesClaimed,
        });
        setMessage({ text: `Claimed ${data.data.shares} share${data.data.shares > 1 ? 's' : ''}!`, type: 'success' });
      } else {
        setMessage({ text: data.error || "Claim failed", type: 'error' });
      }
    } catch (err) {
      setMessage({ text: "Claim failed", type: 'error' });
    } finally {
      setClaiming(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (!mounted) return null;

  const ProgressBar = ({ current, max, color }: { current: number; max: number; color: string }) => {
    const percent = Math.min(100, (current / max) * 100);
    return (
      <div style={{
        width: '100%',
        height: '10px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '5px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${percent}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          borderRadius: '5px',
          transition: 'width 0.5s ease',
          boxShadow: `0 0 10px ${color}`,
        }} />
      </div>
    );
  };

  const MilestoneCard = ({
    id,
    name,
    requirement,
    shares,
    completed,
    claimed,
    color,
  }: {
    id: string;
    name: string;
    requirement: string;
    shares: number;
    completed: boolean;
    claimed: boolean;
    color: string;
  }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 15px',
      borderRadius: '10px',
      background: claimed
        ? 'rgba(0, 255, 65, 0.1)'
        : completed
        ? `${color}22`
        : 'rgba(255,255,255,0.03)',
      border: claimed
        ? '2px solid #00ff41'
        : completed
        ? `2px solid ${color}`
        : '2px solid rgba(255,255,255,0.1)',
      marginBottom: '10px',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span style={{ fontSize: '1.1rem' }}>
            {claimed ? '✓' : completed ? '⭐' : '🔒'}
          </span>
          <span style={{
            color: claimed ? '#00ff41' : completed ? color : '#666',
            fontWeight: 'bold',
            fontSize: '0.95rem',
          }}>
            {name}
          </span>
        </div>
        <div style={{ color: '#888', fontSize: '0.8rem', marginLeft: '30px' }}>
          {requirement}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          color: claimed ? '#00ff41' : completed ? color : '#444',
          fontSize: '0.85rem',
          fontWeight: 'bold',
        }}>
          +{shares}
        </span>
        {completed && !claimed && (
          <button
            onClick={() => handleClaim(id)}
            disabled={claiming === id}
            style={{
              padding: '8px 16px',
              background: claiming === id ? '#444' : `linear-gradient(135deg, ${color}, ${color}aa)`,
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              fontFamily: 'Orbitron, sans-serif',
              cursor: claiming === id ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {claiming === id ? '...' : 'Claim'}
          </button>
        )}
        {claimed && (
          <span style={{
            padding: '8px 12px',
            background: 'rgba(0, 255, 65, 0.2)',
            borderRadius: '6px',
            color: '#00ff41',
            fontSize: '0.7rem',
            fontWeight: 'bold',
          }}>
            CLAIMED
          </span>
        )}
      </div>
    </div>
  );

  const isClaimed = (id: string) => claims?.claimedMilestones.includes(id) || false;

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#0b0c10',
      backgroundImage: 'url("/mothership-bg.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      fontFamily: 'Orbitron, sans-serif',
      color: '#66fcf1',
      paddingBottom: '50px',
    }}>
      {/* Back Button */}
      <Link
        href="/"
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          background: 'rgba(0,0,0,0.8)',
          border: '2px solid #45a29e',
          borderRadius: '8px',
          padding: '10px 20px',
          color: '#45a29e',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontFamily: 'Orbitron, sans-serif',
          fontWeight: 'bold',
          zIndex: 100,
        }}
      >
        &larr; Back
      </Link>

      {/* Toast Message */}
      {message && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px 25px',
          background: message.type === 'success' ? 'rgba(0, 255, 65, 0.9)' : 'rgba(255, 71, 87, 0.9)',
          borderRadius: '10px',
          color: message.type === 'success' ? '#000' : '#fff',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        }}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', paddingTop: '80px', marginBottom: '30px' }}>
        <h1 style={{
          fontSize: '2.5rem',
          textShadow: '0 0 20px #00ff41',
          letterSpacing: '5px',
          textTransform: 'uppercase',
          marginBottom: '10px',
          color: '#00ff41',
        }}>
          QUESTS
        </h1>
        <p style={{ color: '#888', fontSize: '1rem' }}>
          Complete milestones and claim your shares
        </p>
        {eventStatus !== "live" && eventStatus !== "upcoming" && (
          <div style={{
            display: 'inline-block',
            marginTop: '15px',
            background: 'rgba(255, 107, 107, 0.2)',
            border: '2px solid #ff6b6b',
            borderRadius: '10px',
            padding: '10px 20px',
            color: '#ff6b6b',
            fontSize: '0.85rem',
          }}>
            Event not active - Progress tracking only
          </div>
        )}
      </div>

      {/* Connect Wallet */}
      {!isConnected && (
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          padding: '40px 20px',
          textAlign: 'center',
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            border: '2px solid #45a29e',
            borderRadius: '15px',
            padding: '40px',
          }}>
            <p style={{ color: '#888', marginBottom: '25px', fontSize: '1.1rem' }}>
              Connect your wallet to view your quests
            </p>
            <ConnectButton />
          </div>
        </div>
      )}

      {/* Loading */}
      {isConnected && loading && (
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          padding: '40px 20px',
          textAlign: 'center',
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            border: '2px solid #45a29e',
            borderRadius: '15px',
            padding: '40px',
            color: '#66fcf1',
          }}>
            Loading your quests...
          </div>
        </div>
      )}

      {/* Main Content */}
      {isConnected && !loading && progress && (
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 20px',
        }}>
          {/* Daily Check-In Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(255, 71, 87, 0.1))',
            border: '3px solid #ff6b6b',
            borderRadius: '20px',
            padding: '25px',
            marginBottom: '25px',
            textAlign: 'center',
            boxShadow: '0 0 30px rgba(255, 107, 107, 0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '15px' }}>
              <span style={{ fontSize: '2rem' }}>🔥</span>
              <h2 style={{ color: '#ff6b6b', margin: 0, fontSize: '1.5rem' }}>DAILY CHECK-IN</h2>
              <span style={{ fontSize: '2rem' }}>🔥</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '20px' }}>
              <div>
                <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '5px' }}>Current Streak</div>
                <div style={{ color: '#ff6b6b', fontSize: '2.5rem', fontWeight: 'bold', textShadow: '0 0 15px #ff6b6b' }}>
                  {streakData?.currentStreak || 0}
                </div>
                <div style={{ color: '#666', fontSize: '0.75rem' }}>days</div>
              </div>
              <div>
                <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '5px' }}>Best Streak</div>
                <div style={{ color: '#ffd700', fontSize: '2.5rem', fontWeight: 'bold', textShadow: '0 0 15px #ffd700' }}>
                  {streakData?.longestStreak || 0}
                </div>
                <div style={{ color: '#666', fontSize: '0.75rem' }}>days</div>
              </div>
            </div>

            <button
              onClick={handleCheckIn}
              disabled={checkingIn || streakData?.todayRecorded}
              style={{
                padding: '15px 50px',
                background: streakData?.todayRecorded
                  ? 'linear-gradient(135deg, #444, #333)'
                  : 'linear-gradient(135deg, #ff6b6b, #ff4757)',
                border: 'none',
                borderRadius: '10px',
                color: streakData?.todayRecorded ? '#888' : '#fff',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                fontFamily: 'Orbitron, sans-serif',
                cursor: streakData?.todayRecorded ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                boxShadow: streakData?.todayRecorded ? 'none' : '0 0 20px rgba(255, 107, 107, 0.5)',
              }}
            >
              {checkingIn ? 'Checking in...' : streakData?.todayRecorded ? '✓ Checked In Today' : 'Check In Now'}
            </button>
          </div>

          {/* Total Shares Claimed */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.15), rgba(0, 170, 42, 0.1))',
            border: '3px solid #00ff41',
            borderRadius: '20px',
            padding: '25px',
            marginBottom: '25px',
            textAlign: 'center',
            boxShadow: '0 0 30px rgba(0, 255, 65, 0.2)',
          }}>
            <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '5px', letterSpacing: '2px' }}>
              SHARES CLAIMED
            </div>
            <div style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              color: '#00ff41',
              textShadow: '0 0 20px rgba(0, 255, 65, 0.6)',
            }}>
              {claims?.totalSharesClaimed || 0}
            </div>
            <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '5px' }}>
              {progress.totalShares - (claims?.totalSharesClaimed || 0)} more available to claim
            </div>
            <Link
              href="/event"
              style={{
                display: 'inline-block',
                marginTop: '10px',
                color: '#66fcf1',
                fontSize: '0.85rem',
                textDecoration: 'underline',
              }}
            >
              View Event Details &rarr;
            </Link>
          </div>

          {/* Quest Categories Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {/* AP Quest */}
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              border: '2px solid #ffd700',
              borderRadius: '15px',
              padding: '20px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>💰</span>
                  <h3 style={{ color: '#ffd700', margin: 0 }}>EARN AP</h3>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>
                    {progress.ap.currentAP.toLocaleString()} AP
                  </span>
                </div>
                <ProgressBar
                  current={progress.ap.currentAP}
                  max={progress.ap.milestones.find(m => !m.reached)?.required || 500000}
                  color="#ffd700"
                />
              </div>

              {progress.ap.milestones.map((m, i) => (
                <MilestoneCard
                  key={AP_MILESTONE_IDS[i]}
                  id={AP_MILESTONE_IDS[i]}
                  name={m.name}
                  requirement={`${m.required.toLocaleString()} AP`}
                  shares={m.shares}
                  completed={m.reached}
                  claimed={isClaimed(AP_MILESTONE_IDS[i])}
                  color="#ffd700"
                />
              ))}
            </div>

            {/* Level Quest */}
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              border: '2px solid #b44dff',
              borderRadius: '15px',
              padding: '20px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>⬆️</span>
                  <h3 style={{ color: '#b44dff', margin: 0 }}>LEVEL UP</h3>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>
                    Level {progress.level.currentLevel}
                  </span>
                </div>
                <ProgressBar
                  current={progress.level.currentLevel}
                  max={progress.level.milestones.find(m => !m.reached)?.required || 50}
                  color="#b44dff"
                />
              </div>

              {progress.level.milestones.map((m, i) => (
                <MilestoneCard
                  key={LEVEL_MILESTONE_IDS[i]}
                  id={LEVEL_MILESTONE_IDS[i]}
                  name={m.name}
                  requirement={`Level ${m.required}`}
                  shares={m.shares}
                  completed={m.reached}
                  claimed={isClaimed(LEVEL_MILESTONE_IDS[i])}
                  color="#b44dff"
                />
              ))}
            </div>

            {/* Game Stats Quest */}
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              border: '2px solid #00d9ff',
              borderRadius: '15px',
              padding: '20px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>🎮</span>
                  <h3 style={{ color: '#00d9ff', margin: 0 }}>GAME STATS</h3>
                </div>
              </div>

              <MilestoneCard
                id="game_explorer"
                name="Explorer"
                requirement={`Play all 5 games (${progress.gameStats.explorer.gamesPlayed}/${progress.gameStats.explorer.required})`}
                shares={1}
                completed={progress.gameStats.explorer.completed}
                claimed={isClaimed("game_explorer")}
                color="#00d9ff"
              />
              <MilestoneCard
                id="game_hunter"
                name="Hunter"
                requirement={`100 kills (${progress.gameStats.hunter.totalKills}/${progress.gameStats.hunter.required})`}
                shares={3}
                completed={progress.gameStats.hunter.completed}
                claimed={isClaimed("game_hunter")}
                color="#00d9ff"
              />
              <MilestoneCard
                id="game_crafter"
                name="Crafter"
                requirement={`Craft 10 items (${progress.gameStats.crafter.itemsCrafted}/${progress.gameStats.crafter.required})`}
                shares={3}
                completed={progress.gameStats.crafter.completed}
                claimed={isClaimed("game_crafter")}
                color="#00d9ff"
              />
              <MilestoneCard
                id="game_fisher"
                name="Fisher"
                requirement={`50 casts (${progress.gameStats.fisher.totalCasts}/${progress.gameStats.fisher.required})`}
                shares={3}
                completed={progress.gameStats.fisher.completed}
                claimed={isClaimed("game_fisher")}
                color="#00d9ff"
              />
              <MilestoneCard
                id="game_master"
                name="Master"
                requirement="Complete all above"
                shares={10}
                completed={progress.gameStats.master.completed}
                claimed={isClaimed("game_master")}
                color="#00d9ff"
              />
            </div>

            {/* Streak Quest */}
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              border: '2px solid #ff6b6b',
              borderRadius: '15px',
              padding: '20px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>🔥</span>
                  <h3 style={{ color: '#ff6b6b', margin: 0 }}>DAILY STREAKS</h3>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>
                    Best: {progress.streak.longestStreak} days
                  </span>
                </div>
                <ProgressBar
                  current={progress.streak.longestStreak}
                  max={progress.streak.milestones.find(m => !m.reached)?.required || 30}
                  color="#ff6b6b"
                />
              </div>

              {progress.streak.milestones.map((m, i) => (
                <MilestoneCard
                  key={STREAK_MILESTONE_IDS[i]}
                  id={STREAK_MILESTONE_IDS[i]}
                  name={m.name}
                  requirement={`${m.required} day streak`}
                  shares={m.shares}
                  completed={m.reached}
                  claimed={isClaimed(STREAK_MILESTONE_IDS[i])}
                  color="#ff6b6b"
                />
              ))}
            </div>
          </div>

          {/* Play Games CTA */}
          <div style={{
            marginTop: '30px',
            textAlign: 'center',
          }}>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '15px 40px',
                background: 'linear-gradient(135deg, #66fcf1, #45a29e)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontSize: '1rem',
                fontWeight: 'bold',
                fontFamily: 'Orbitron, sans-serif',
                textDecoration: 'none',
                textTransform: 'uppercase',
                boxShadow: '0 0 20px rgba(102, 252, 241, 0.4)',
              }}
            >
              Play Games to Earn More
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
