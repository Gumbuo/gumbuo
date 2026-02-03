"use client";
import { useEffect, useState } from "react";

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

interface EventProgressProps {
  wallet: string;
}

export default function EventProgress({ wallet }: EventProgressProps) {
  const [progress, setProgress] = useState<MilestoneProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/event?wallet=${wallet}`);
        const data = await res.json();
        if (data.success) {
          setProgress(data.progress);
        } else {
          setError(data.error || "Failed to fetch progress");
        }
      } catch (err) {
        setError("Failed to fetch progress");
        console.error("Error fetching event progress:", err);
      } finally {
        setLoading(false);
      }
    };

    if (wallet) {
      fetchProgress();
    }
  }, [wallet]);

  if (loading) {
    return (
      <div style={{
        background: 'rgba(0,0,0,0.7)',
        border: '2px solid #45a29e',
        borderRadius: '15px',
        padding: '40px',
        textAlign: 'center',
        color: '#66fcf1',
      }}>
        Loading your progress...
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div style={{
        background: 'rgba(0,0,0,0.7)',
        border: '2px solid #ff6b6b',
        borderRadius: '15px',
        padding: '40px',
        textAlign: 'center',
        color: '#ff6b6b',
      }}>
        {error || "Unable to load progress"}
      </div>
    );
  }

  const ProgressBar = ({ current, max, color }: { current: number; max: number; color: string }) => {
    const percent = Math.min(100, (current / max) * 100);
    return (
      <div style={{
        width: '100%',
        height: '8px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${percent}%`,
          height: '100%',
          background: color,
          borderRadius: '4px',
          transition: 'width 0.5s ease',
        }} />
      </div>
    );
  };

  const MilestoneBadge = ({ reached, name }: { reached: boolean; name: string }) => (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '0.7rem',
      fontWeight: 'bold',
      background: reached ? 'rgba(0, 255, 65, 0.2)' : 'rgba(255,255,255,0.05)',
      border: reached ? '1px solid #00ff41' : '1px solid rgba(255,255,255,0.2)',
      color: reached ? '#00ff41' : '#666',
      marginRight: '6px',
      marginBottom: '6px',
    }}>
      {reached ? '&#10003; ' : '&#x1F512; '}{name}
    </span>
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
    }}>
      {/* Total Shares Summary */}
      <div style={{
        gridColumn: '1 / -1',
        background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.15), rgba(0, 170, 42, 0.1))',
        border: '2px solid #00ff41',
        borderRadius: '15px',
        padding: '20px 25px',
        textAlign: 'center',
        boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)',
      }}>
        <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '5px', letterSpacing: '2px' }}>
          TOTAL SHARES EARNED
        </div>
        <div style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#00ff41',
          textShadow: '0 0 15px rgba(0, 255, 65, 0.5)',
        }}>
          {progress.totalShares}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>
          More shares = bigger portion of the reward pool
        </div>
      </div>

      {/* AP Progress */}
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        border: '2px solid #ffd700',
        borderRadius: '15px',
        padding: '20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>&#x1F4B0;</span>
            <span style={{ color: '#ffd700', fontWeight: 'bold' }}>AP EARNED</span>
          </div>
          <span style={{ color: '#00ff41', fontWeight: 'bold' }}>
            {progress.ap.totalShares} shares
          </span>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            marginBottom: '5px',
          }}>
            <span style={{ color: '#c5c6c7' }}>{progress.ap.currentAP.toLocaleString()} AP</span>
            <span style={{ color: '#888' }}>
              Next: {progress.ap.milestones.find(m => !m.reached)?.required.toLocaleString() || 'MAX'} AP
            </span>
          </div>
          <ProgressBar
            current={progress.ap.currentAP}
            max={progress.ap.milestones.find(m => !m.reached)?.required || progress.ap.milestones[progress.ap.milestones.length - 1].required}
            color="#ffd700"
          />
        </div>
        <div style={{ marginTop: '12px' }}>
          {progress.ap.milestones.map((m) => (
            <MilestoneBadge key={m.name} reached={m.reached} name={m.name} />
          ))}
        </div>
      </div>

      {/* Game Stats Progress */}
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        border: '2px solid #00d9ff',
        borderRadius: '15px',
        padding: '20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>&#x1F3AE;</span>
            <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>GAME STATS</span>
          </div>
          <span style={{ color: '#00ff41', fontWeight: 'bold' }}>
            {progress.gameStats.totalShares} shares
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#c5c6c7', lineHeight: '1.8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Explorer (5 games):</span>
            <span style={{ color: progress.gameStats.explorer.completed ? '#00ff41' : '#888' }}>
              {progress.gameStats.explorer.gamesPlayed}/{progress.gameStats.explorer.required}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Hunter (kills):</span>
            <span style={{ color: progress.gameStats.hunter.completed ? '#00ff41' : '#888' }}>
              {progress.gameStats.hunter.totalKills}/{progress.gameStats.hunter.required}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Crafter (items):</span>
            <span style={{ color: progress.gameStats.crafter.completed ? '#00ff41' : '#888' }}>
              {progress.gameStats.crafter.itemsCrafted}/{progress.gameStats.crafter.required}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Fisher (casts):</span>
            <span style={{ color: progress.gameStats.fisher.completed ? '#00ff41' : '#888' }}>
              {progress.gameStats.fisher.totalCasts}/{progress.gameStats.fisher.required}
            </span>
          </div>
        </div>
        <div style={{ marginTop: '12px' }}>
          <MilestoneBadge reached={progress.gameStats.explorer.completed} name="Explorer" />
          <MilestoneBadge reached={progress.gameStats.hunter.completed} name="Hunter" />
          <MilestoneBadge reached={progress.gameStats.crafter.completed} name="Crafter" />
          <MilestoneBadge reached={progress.gameStats.fisher.completed} name="Fisher" />
          <MilestoneBadge reached={progress.gameStats.master.completed} name="Master" />
        </div>
      </div>

      {/* Level Progress */}
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        border: '2px solid #b44dff',
        borderRadius: '15px',
        padding: '20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>&#x2B06;&#xFE0F;</span>
            <span style={{ color: '#b44dff', fontWeight: 'bold' }}>LEVEL UP</span>
          </div>
          <span style={{ color: '#00ff41', fontWeight: 'bold' }}>
            {progress.level.totalShares} shares
          </span>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            marginBottom: '5px',
          }}>
            <span style={{ color: '#c5c6c7' }}>Level {progress.level.currentLevel}</span>
            <span style={{ color: '#888' }}>
              Next: Level {progress.level.milestones.find(m => !m.reached)?.required || 'MAX'}
            </span>
          </div>
          <ProgressBar
            current={progress.level.currentLevel}
            max={progress.level.milestones.find(m => !m.reached)?.required || 50}
            color="#b44dff"
          />
        </div>
        <div style={{ marginTop: '12px' }}>
          {progress.level.milestones.map((m) => (
            <MilestoneBadge key={m.name} reached={m.reached} name={m.name} />
          ))}
        </div>
      </div>

      {/* Streak Progress */}
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        border: '2px solid #ff6b6b',
        borderRadius: '15px',
        padding: '20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>&#x1F525;</span>
            <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>DAILY STREAKS</span>
          </div>
          <span style={{ color: '#00ff41', fontWeight: 'bold' }}>
            {progress.streak.totalShares} shares
          </span>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            marginBottom: '5px',
          }}>
            <span style={{ color: '#c5c6c7' }}>
              Current: {progress.streak.currentStreak} days
            </span>
            <span style={{ color: '#888' }}>
              Best: {progress.streak.longestStreak} days
            </span>
          </div>
          <ProgressBar
            current={progress.streak.longestStreak}
            max={progress.streak.milestones.find(m => !m.reached)?.required || 30}
            color="#ff6b6b"
          />
        </div>
        <div style={{ marginTop: '12px' }}>
          {progress.streak.milestones.map((m) => (
            <MilestoneBadge key={m.name} reached={m.reached} name={m.name} />
          ))}
        </div>
      </div>
    </div>
  );
}
