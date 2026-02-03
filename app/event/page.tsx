"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import dynamic from "next/dynamic";

const EventProgress = dynamic(() => import("../components/EventProgress"), { ssr: false });

// Milestone definitions
const AP_MILESTONES = [
  { name: "Bronze", ap: 10000, shares: 1 },
  { name: "Silver", ap: 50000, shares: 3 },
  { name: "Gold", ap: 100000, shares: 5 },
  { name: "Platinum", ap: 250000, shares: 10 },
  { name: "Diamond", ap: 500000, shares: 20 },
];

const GAME_STATS_MILESTONES = [
  { name: "Explorer", description: "Play each game once", shares: 1 },
  { name: "Hunter", description: "100 total kills (Invasion + Crawler)", shares: 3 },
  { name: "Crafter", description: "Craft 10 items in Armory", shares: 3 },
  { name: "Fisher", description: "50 casts in Pond", shares: 3 },
  { name: "Master", description: "Complete all above", shares: 10 },
];

const LEVEL_MILESTONES = [
  { name: "Novice", level: 5, shares: 1 },
  { name: "Apprentice", level: 10, shares: 3 },
  { name: "Veteran", level: 20, shares: 5 },
  { name: "Elite", level: 35, shares: 10 },
  { name: "Legend", level: 50, shares: 25 },
];

const STREAK_MILESTONES = [
  { name: "Consistent", days: 7, shares: 2 },
  { name: "Dedicated", days: 14, shares: 5 },
  { name: "Committed", days: 21, shares: 10 },
  { name: "Devoted", days: 30, shares: 20 },
];

const GAMES = [
  { name: "Alien Catacombs", color: "#00ff41", href: "/base?game=catacombs" },
  { name: "Alien Invasion", color: "#00d9ff", href: "/base?game=invasion" },
  { name: "Alien Crawler", color: "#ff003c", href: "/base?game=dungeon" },
  { name: "Alien Arena", color: "#888888", href: "/base?game=arena" },
  { name: "Alien Base", color: "#b44dff", href: "/base?game=alienbase" },
];

const FAQ_ITEMS = [
  {
    question: "When does the event start?",
    answer: "The exact start date will be announced soon. The event will run for 30 days once it begins."
  },
  {
    question: "How are rewards distributed?",
    answer: "At the end of the event, the ETH reward pool is split among all participants based on their total shares earned. More shares = bigger portion of the pool."
  },
  {
    question: "Do milestones stack?",
    answer: "Yes! If you reach the Gold AP milestone, you also receive shares from Bronze and Silver. Higher milestones include all lower tier rewards."
  },
  {
    question: "What wallet do I need?",
    answer: "You need a Web3 wallet (like MetaMask) connected to the Base network to participate and receive rewards."
  },
  {
    question: "Can I earn shares in multiple categories?",
    answer: "Absolutely! Each category represents 25% of the pool. Maximize your rewards by completing milestones across all four categories."
  },
];

interface EventConfig {
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  name: string;
}

export default function EventPage() {
  const [mounted, setMounted] = useState(false);
  const [rewardPoolBalance, setRewardPoolBalance] = useState<string | null>(null);
  const [rewardPoolLoading, setRewardPoolLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [eventStatus, setEventStatus] = useState<string>("inactive");
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const { address, isConnected } = useAccount();

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
    const interval = setInterval(fetchEventConfig, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate countdown timer
  useEffect(() => {
    if (!eventConfig) return;

    const updateTimer = () => {
      const now = new Date();
      let targetDate: Date | null = null;
      let prefix = "";

      if (eventStatus === "upcoming" && eventConfig.startDate) {
        targetDate = new Date(eventConfig.startDate);
        prefix = "Starts in: ";
      } else if (eventStatus === "live" && eventConfig.endDate) {
        targetDate = new Date(eventConfig.endDate);
        prefix = "Ends in: ";
      }

      if (targetDate) {
        const diff = targetDate.getTime() - now.getTime();
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining(`${prefix}${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeRemaining("");
        }
      } else {
        setTimeRemaining("");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [eventConfig, eventStatus]);

  // Fetch reward pool balance
  useEffect(() => {
    const fetchRewardPool = async () => {
      try {
        const res = await fetch('/api/reward-pool');
        const data = await res.json();
        if (data.success) {
          const formatted = parseFloat(data.balance).toFixed(4);
          setRewardPoolBalance(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch reward pool:', err);
      } finally {
        setRewardPoolLoading(false);
      }
    };
    fetchRewardPool();
    const interval = setInterval(fetchRewardPool, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0b0c10',
      backgroundImage: 'url("/mothership-bg.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      fontFamily: 'Orbitron, sans-serif',
      color: '#66fcf1',
      overflowX: 'hidden',
      paddingBottom: '50px'
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
          transition: 'all 0.3s',
        }}
      >
        &larr; Back to Mothership
      </Link>

      {/* Header */}
      <div style={{ textAlign: 'center', paddingTop: '80px' }}>
        <h1 style={{
          fontSize: '3rem',
          textShadow: '0 0 20px #ffd700',
          letterSpacing: '5px',
          textTransform: 'uppercase',
          marginBottom: '10px',
          color: '#ffd700',
        }}>
          TESTING EVENT
        </h1>
        <div style={{
          display: 'inline-block',
          background: eventStatus === "live"
            ? 'rgba(0, 255, 65, 0.2)'
            : eventStatus === "upcoming"
            ? 'rgba(255, 215, 0, 0.2)'
            : eventStatus === "ended"
            ? 'rgba(136, 136, 136, 0.2)'
            : 'rgba(255, 107, 107, 0.2)',
          border: eventStatus === "live"
            ? '2px solid #00ff41'
            : eventStatus === "upcoming"
            ? '2px solid #ffd700'
            : eventStatus === "ended"
            ? '2px solid #888'
            : '2px solid #ff6b6b',
          borderRadius: '20px',
          padding: '8px 25px',
          color: eventStatus === "live"
            ? '#00ff41'
            : eventStatus === "upcoming"
            ? '#ffd700'
            : eventStatus === "ended"
            ? '#888'
            : '#ff6b6b',
          fontSize: '1rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          animation: eventStatus === "live" ? 'pulse 2s infinite' : 'none',
        }}>
          {eventStatus === "live" ? "LIVE NOW" : eventStatus === "upcoming" ? "STARTING SOON" : eventStatus === "ended" ? "EVENT ENDED" : "Coming Soon"}
        </div>
        {timeRemaining && (
          <div style={{
            marginTop: '15px',
            fontSize: '1.2rem',
            color: eventStatus === "live" ? '#00ff41' : '#ffd700',
            fontWeight: 'bold',
            textShadow: eventStatus === "live" ? '0 0 10px #00ff41' : '0 0 10px #ffd700',
          }}>
            {timeRemaining}
          </div>
        )}
      </div>

      {/* Reward Pool Banner */}
      <div style={{
        maxWidth: '700px',
        margin: '40px auto',
        padding: '0 20px',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 140, 0, 0.1))',
          border: '3px solid rgba(255, 215, 0, 0.6)',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '15px',
          }}>
            <img src="/base-logo.svg" alt="Base" style={{ width: '40px', height: '40px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span style={{ fontSize: '0.8rem', color: '#ffd700', letterSpacing: '3px', textTransform: 'uppercase' }}>
              Reward Pool
            </span>
          </div>
          <div style={{
            fontSize: '3rem',
            color: '#fff',
            fontWeight: 'bold',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
            marginBottom: '10px',
          }}>
            {rewardPoolLoading ? (
              <span style={{ fontSize: '1.5rem', color: '#aaa' }}>Loading...</span>
            ) : (
              <>{rewardPoolBalance} ETH</>
            )}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#aaa',
            marginBottom: '10px',
          }}>
            Base Chain | Duration: 30 Days
          </div>
          <div style={{
            fontSize: '0.65rem',
            color: '#888',
            fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.4)',
            padding: '8px 15px',
            borderRadius: '6px',
            display: 'inline-block',
          }}>
            0xEd6f38abbc7433Bc2184c18eBC416aDa53731f4B
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{
        width: '80%',
        maxWidth: '800px',
        margin: '20px auto',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #45a29e, transparent)',
      }} />

      {/* How It Works */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 40px auto',
        padding: '0 20px',
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          textAlign: 'center',
          marginBottom: '25px',
          color: '#66fcf1',
          textShadow: '0 0 10px #66fcf1',
        }}>
          HOW IT WORKS
        </h2>
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          border: '2px solid #45a29e',
          borderRadius: '15px',
          padding: '25px 30px',
        }}>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '1rem',
            lineHeight: '2.2',
            color: '#c5c6c7',
          }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ color: '#ffd700', fontSize: '1.2rem' }}>1.</span>
              <span>Play any of our <strong style={{ color: '#66fcf1' }}>5 games</strong> to earn AP and level up</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ color: '#ffd700', fontSize: '1.2rem' }}>2.</span>
              <span>Complete <strong style={{ color: '#66fcf1' }}>milestones</strong> across 4 categories to earn shares</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ color: '#ffd700', fontSize: '1.2rem' }}>3.</span>
              <span>More shares = <strong style={{ color: '#ffd700' }}>bigger portion</strong> of the reward pool</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ color: '#ffd700', fontSize: '1.2rem' }}>4.</span>
              <span>At event end, all milestone earners <strong style={{ color: '#00ff41' }}>split the ETH pool</strong></span>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div style={{
        width: '80%',
        maxWidth: '800px',
        margin: '20px auto',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #45a29e, transparent)',
      }} />

      {/* Milestone Categories */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto 40px auto',
        padding: '0 20px',
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          textAlign: 'center',
          marginBottom: '30px',
          color: '#66fcf1',
          textShadow: '0 0 10px #66fcf1',
        }}>
          MILESTONE CATEGORIES
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {/* Category 1: AP Earned */}
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            border: '2px solid #ffd700',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '15px',
            }}>
              <span style={{ fontSize: '1.5rem' }}>&#x1F4B0;</span>
              <div>
                <h3 style={{ margin: 0, color: '#ffd700', fontSize: '1.1rem' }}>AP EARNED</h3>
                <span style={{ fontSize: '0.7rem', color: '#aaa' }}>25% of Pool</span>
              </div>
            </div>
            <table style={{ width: '100%', fontSize: '0.85rem', color: '#c5c6c7' }}>
              <tbody>
                {AP_MILESTONES.map((m) => (
                  <tr key={m.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '8px 0', color: '#ffd700' }}>{m.name}</td>
                    <td style={{ padding: '8px 0' }}>{m.ap.toLocaleString()} AP</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#00ff41' }}>{m.shares} share{m.shares > 1 ? 's' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Category 2: Game Stats */}
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            border: '2px solid #00d9ff',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 0 15px rgba(0, 217, 255, 0.2)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '15px',
            }}>
              <span style={{ fontSize: '1.5rem' }}>&#x1F3AE;</span>
              <div>
                <h3 style={{ margin: 0, color: '#00d9ff', fontSize: '1.1rem' }}>GAME STATS</h3>
                <span style={{ fontSize: '0.7rem', color: '#aaa' }}>25% of Pool</span>
              </div>
            </div>
            <table style={{ width: '100%', fontSize: '0.85rem', color: '#c5c6c7' }}>
              <tbody>
                {GAME_STATS_MILESTONES.map((m) => (
                  <tr key={m.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '8px 0', color: '#00d9ff' }}>{m.name}</td>
                    <td style={{ padding: '8px 0', fontSize: '0.75rem' }}>{m.description}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#00ff41' }}>{m.shares}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Category 3: Level Up */}
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            border: '2px solid #b44dff',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 0 15px rgba(180, 77, 255, 0.2)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '15px',
            }}>
              <span style={{ fontSize: '1.5rem' }}>&#x2B06;&#xFE0F;</span>
              <div>
                <h3 style={{ margin: 0, color: '#b44dff', fontSize: '1.1rem' }}>LEVEL UP</h3>
                <span style={{ fontSize: '0.7rem', color: '#aaa' }}>25% of Pool</span>
              </div>
            </div>
            <table style={{ width: '100%', fontSize: '0.85rem', color: '#c5c6c7' }}>
              <tbody>
                {LEVEL_MILESTONES.map((m) => (
                  <tr key={m.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '8px 0', color: '#b44dff' }}>{m.name}</td>
                    <td style={{ padding: '8px 0' }}>Reach Level {m.level}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#00ff41' }}>{m.shares} share{m.shares > 1 ? 's' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Category 4: Streaks */}
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            border: '2px solid #ff6b6b',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 0 15px rgba(255, 107, 107, 0.2)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '15px',
            }}>
              <span style={{ fontSize: '1.5rem' }}>&#x1F525;</span>
              <div>
                <h3 style={{ margin: 0, color: '#ff6b6b', fontSize: '1.1rem' }}>DAILY STREAKS</h3>
                <span style={{ fontSize: '0.7rem', color: '#aaa' }}>25% of Pool</span>
              </div>
            </div>
            <table style={{ width: '100%', fontSize: '0.85rem', color: '#c5c6c7' }}>
              <tbody>
                {STREAK_MILESTONES.map((m) => (
                  <tr key={m.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '8px 0', color: '#ff6b6b' }}>{m.name}</td>
                    <td style={{ padding: '8px 0' }}>{m.days} days</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#00ff41' }}>{m.shares} share{m.shares > 1 ? 's' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Player Progress Section (only show if connected) */}
      {isConnected && address && (
        <>
          {/* Divider */}
          <div style={{
            width: '80%',
            maxWidth: '800px',
            margin: '20px auto',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #00ff41, transparent)',
          }} />

          <div style={{
            maxWidth: '900px',
            margin: '0 auto 40px auto',
            padding: '0 20px',
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              textAlign: 'center',
              marginBottom: '30px',
              color: '#00ff41',
              textShadow: '0 0 10px #00ff41',
            }}>
              YOUR PROGRESS
            </h2>
            <EventProgress wallet={address} />
          </div>
        </>
      )}

      {/* Divider */}
      <div style={{
        width: '80%',
        maxWidth: '800px',
        margin: '20px auto',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #45a29e, transparent)',
      }} />

      {/* Games Section */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto 40px auto',
        padding: '0 20px',
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          textAlign: 'center',
          marginBottom: '30px',
          color: '#66fcf1',
          textShadow: '0 0 10px #66fcf1',
        }}>
          PLAY TO EARN
        </h2>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '15px',
        }}>
          {GAMES.map((game) => (
            <Link
              key={game.name}
              href={game.href}
              style={{
                background: 'rgba(0,0,0,0.8)',
                border: `2px solid ${game.color}`,
                borderRadius: '10px',
                padding: '15px 25px',
                color: game.color,
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                fontFamily: 'Orbitron, sans-serif',
                textTransform: 'uppercase',
                transition: 'all 0.3s',
                boxShadow: `0 0 10px ${game.color}40`,
              }}
            >
              {game.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{
        width: '80%',
        maxWidth: '800px',
        margin: '20px auto',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #45a29e, transparent)',
      }} />

      {/* FAQ Section */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 40px auto',
        padding: '0 20px',
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          textAlign: 'center',
          marginBottom: '30px',
          color: '#66fcf1',
          textShadow: '0 0 10px #66fcf1',
        }}>
          FAQ
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(0,0,0,0.7)',
                border: '2px solid #45a29e',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '15px 20px',
                  color: '#66fcf1',
                  fontSize: '1rem',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 'bold',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{item.question}</span>
                <span style={{
                  transform: expandedFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}>
                  &#x25BC;
                </span>
              </button>
              {expandedFaq === index && (
                <div style={{
                  padding: '0 20px 15px 20px',
                  color: '#c5c6c7',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  borderTop: '1px solid rgba(69, 162, 158, 0.3)',
                }}>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      {!isConnected && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #00ff41, #00aa2a)',
              border: 'none',
              borderRadius: '10px',
              padding: '15px 40px',
              color: '#000',
              fontSize: '1.1rem',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
              textDecoration: 'none',
              textTransform: 'uppercase',
              boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)',
            }}
          >
            Connect Wallet & Start Playing
          </Link>
        </div>
      )}
    </div>
  );
}
