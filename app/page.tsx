"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCosmicSound } from "./hooks/useCosmicSound";
import { useAlienPoints } from "./context/AlienPointContext";
import { useAlienPoints as useAlienPointsEconomy } from "./context/AlienPointsEconomy";
import { useAccount, useBalance } from "wagmi";

const AlienLeaderboard = dynamic(() => import("./components/AlienLeaderboard"), { ssr: false });
const AlienDripStation = dynamic(() => import("./components/AlienDripStation"), { ssr: false });

type Scene = "portals" | "drip" | "leaderboard" | "buygmb" | "shopify" | "socials" | "support";

// Compact Alien Points Progress Bar for Left Panel
function AlienProgressBar() {
  const { address } = useAccount();
  const { userBalances } = useAlienPointsEconomy();
  const alienPointContext = useAlienPoints();

  // Compute alien points with same priority as HUD: economy context first, then simple context
  const alienPoints = (() => {
    // PRIORITY 1: Use economy context if available
    if (address && userBalances[address.toLowerCase()] !== undefined) {
      return userBalances[address.toLowerCase()];
    }
    // PRIORITY 2: Fall back to simple context
    if (alienPointContext && alienPointContext.alienPoints !== undefined) {
      return alienPointContext.alienPoints;
    }
    return 0;
  })();

  const goals = [
    { points: 10000, label: 'ROOKIE' },
    { points: 40000, label: 'EXPLORER' },
    { points: 90000, label: 'VOYAGER' },
    { points: 125000, label: 'COMMANDER' },
    { points: 175000, label: 'SUPREME' }
  ];

  const progressPercent = (alienPoints / 175000) * 100;

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '80%',
      height: '70%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Title */}
      <div style={{
        marginBottom: '15px',
        textAlign: 'center'
      }}>
        <p style={{
          color: '#00ffff',
          fontSize: '0.65rem',
          fontWeight: 'bold',
          letterSpacing: '1px',
          marginBottom: '5px'
        }}>ALIEN POINTS</p>
        <p style={{
          color: '#00ff99',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(0, 255, 153, 0.8)'
        }}>{alienPoints.toLocaleString()}</p>
      </div>

      {/* Progress Bar Container */}
      <div style={{ position: 'relative', height: '400px', width: '60px', overflow: 'visible' }}>
        {/* Vertical Progress Track */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '8px',
          height: '100%',
          background: 'linear-gradient(to top, rgba(0, 212, 255, 0.2), rgba(138, 43, 226, 0.2))',
          borderRadius: '4px',
          border: '2px solid rgba(0, 212, 255, 0.3)',
          overflow: 'hidden'
        }}>
          {/* Progress Fill */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${progressPercent}%`,
            background: 'linear-gradient(to top, #00ff99, #00ffff, #8a2be2)',
            borderRadius: '4px',
            boxShadow: '0 0 15px rgba(0, 255, 153, 0.8)',
            transition: 'height 1s ease-out'
          }} />
        </div>

        {/* Goal Markers */}
        {goals.map((goal) => {
          const goalPercent = (goal.points / 175000) * 100;
          const isReached = alienPoints >= goal.points;

          return (
            <div
              key={goal.points}
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bottom: `${goalPercent}%`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.5s'
              }}
            >
              {/* Marker Circle */}
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: `3px solid ${isReached ? '#00ff99' : '#666'}`,
                background: isReached ? 'rgba(0, 255, 153, 0.2)' : 'rgba(102, 102, 102, 0.2)',
                boxShadow: isReached ? '0 0 10px rgba(0, 255, 153, 0.6)' : 'none',
                transition: 'all 0.5s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {isReached && (
                  <div style={{
                    width: '6px',
                    height: '6px',
                    background: '#00ff99',
                    borderRadius: '50%'
                  }} />
                )}
              </div>

              {/* Goal Label - Always Visible */}
              <div style={{
                position: 'absolute',
                left: '24px',
                whiteSpace: 'nowrap',
                background: isReached ? 'rgba(0, 255, 255, 0.2)' : 'rgba(50, 50, 80, 0.95)',
                padding: '4px 8px',
                borderRadius: '4px',
                border: `2px solid ${isReached ? '#00ffff' : '#666'}`,
                boxShadow: isReached ? '0 0 10px rgba(0, 255, 255, 0.5)' : '0 0 5px rgba(100, 100, 150, 0.3)',
                transition: 'all 0.5s'
              }}>
                <p style={{
                  fontSize: '0.6rem',
                  color: isReached ? '#00ffff' : '#ccc',
                  fontWeight: 'bold',
                  transition: 'all 0.5s',
                  marginBottom: '2px',
                  letterSpacing: '0.5px',
                  textShadow: isReached ? '0 0 5px rgba(0, 255, 255, 0.5)' : 'none'
                }}>{goal.label}</p>
                <p style={{
                  fontSize: '0.55rem',
                  color: isReached ? '#00ff99' : '#bbb',
                  transition: 'all 0.5s',
                  fontWeight: 'bold',
                  textShadow: isReached ? '0 0 5px rgba(0, 255, 153, 0.3)' : 'none'
                }}>{goal.points.toLocaleString()} AP</p>
              </div>
            </div>
          );
        })}

        {/* UFO Spaceship */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bottom: `${progressPercent}%`,
          transition: 'bottom 1s ease-out',
          zIndex: 10
        }}>
          {/* Glow effect */}
          <div style={{
            position: 'absolute',
            inset: 0,
            filter: 'blur(15px)',
            background: '#00ffff',
            opacity: 0.5,
            borderRadius: '50%',
            transform: 'scale(1.5)'
          }} />

          {/* UFO SVG */}
          <svg width="50" height="32" viewBox="0 0 80 50" style={{ position: 'relative', animation: 'ufoFloat 3s ease-in-out infinite' }}>
            {/* Beam of light */}
            {progressPercent > 0 && (
              <>
                <defs>
                  <linearGradient id="beam-mothership" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#00ffff', stopOpacity: 0.6 }} />
                    <stop offset="100%" style={{ stopColor: '#00ffff', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                <polygon
                  points="30,35 50,35 45,100 35,100"
                  fill="url(#beam-mothership)"
                  style={{ animation: 'pulse 2s ease-in-out infinite' }}
                />
              </>
            )}

            {/* UFO Dome */}
            <ellipse cx="40" cy="20" rx="20" ry="12" fill="#00ffff" opacity="0.8">
              <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
            </ellipse>

            {/* UFO Base */}
            <ellipse cx="40" cy="28" rx="35" ry="8" fill="#00ff99" opacity="0.9"/>
            <ellipse cx="40" cy="26" rx="35" ry="8" fill="#00ffff" opacity="0.7"/>

            {/* Windows */}
            <circle cx="40" cy="20" r="4" fill="#000" opacity="0.5"/>
            <circle cx="40" cy="19" r="2" fill="#fbbf24">
              <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
            </circle>

            {/* Lights */}
            <circle cx="20" cy="28" r="2" fill="#f472b6">
              <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </circle>
            <circle cx="40" cy="30" r="2" fill="#fbbf24">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite"/>
            </circle>
            <circle cx="60" cy="28" r="2" fill="#a78bfa">
              <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>

        {/* Start Label */}
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}>
          <p style={{ color: '#00ffff', fontSize: '0.45rem', fontWeight: 'bold' }}>0</p>
        </div>

        {/* End Label */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}>
          <p style={{ color: '#00ff99', fontSize: '0.45rem', fontWeight: 'bold' }}>250K</p>
        </div>
      </div>
    </div>
  );
}

// GMB Holdings Progress Bar for Right Panel
function GmbProgressBar() {
  const { address } = useAccount();

  // Fetch GMB from Base chain
  const { data: gmbBalanceBase } = useBalance({
    address,
    chainId: 8453, // Base chain ID
    token: "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0" as `0x${string}`
  });

  // Fetch GMB from Abstract chain
  const { data: gmbBalanceAbstract } = useBalance({
    address,
    chainId: 2741, // Abstract chain ID
    token: "0x1660AA473D936029C7659e7d047F05EcF28D40c9" as `0x${string}`
  });

  // Calculate total GMB across both chains
  const gmbHoldings = parseFloat(gmbBalanceBase?.formatted || '0') + parseFloat(gmbBalanceAbstract?.formatted || '0');

  // Staking tiers based on GMB holdings
  const tiers = [
    { gmb: 0, label: 'STARTER' },
    { gmb: 100000, label: 'ADVANCED' },
    { gmb: 250000, label: 'PRO' },
    { gmb: 500000, label: 'ELITE' },
    { gmb: 750000, label: 'DIAMOND' },
    { gmb: 1000000, label: 'WHALE' }
  ];

  const maxGmb = 1000000;
  const progressPercent = Math.min((gmbHoldings / maxGmb) * 100, 100);

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '80%',
      height: '70%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Title */}
      <div style={{
        marginBottom: '15px',
        textAlign: 'center'
      }}>
        <p style={{
          color: '#FFD700',
          fontSize: '0.65rem',
          fontWeight: 'bold',
          letterSpacing: '1px',
          marginBottom: '5px'
        }}>GMB HOLDINGS</p>
        <p style={{
          color: '#FFA500',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(255, 165, 0, 0.8)'
        }}>{gmbHoldings.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
      </div>

      {/* Progress Bar Container */}
      <div style={{ position: 'relative', height: '400px', width: '60px', overflow: 'visible' }}>
        {/* Vertical Progress Track */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '8px',
          height: '100%',
          background: 'linear-gradient(to top, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2))',
          borderRadius: '4px',
          border: '2px solid rgba(255, 215, 0, 0.3)',
          overflow: 'hidden'
        }}>
          {/* Progress Fill */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${progressPercent}%`,
            background: 'linear-gradient(to top, #FFA500, #FFD700, #FF8C00)',
            borderRadius: '4px',
            boxShadow: '0 0 15px rgba(255, 215, 0, 0.8)',
            transition: 'height 1s ease-out'
          }} />
        </div>

        {/* Tier Markers */}
        {tiers.map((tier) => {
          const tierPercent = (tier.gmb / maxGmb) * 100;
          const isReached = gmbHoldings >= tier.gmb;

          return (
            <div
              key={tier.gmb}
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bottom: `${tierPercent}%`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.5s'
              }}
            >
              {/* Marker Circle */}
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: `3px solid ${isReached ? '#FFD700' : '#666'}`,
                background: isReached ? 'rgba(255, 215, 0, 0.2)' : 'rgba(102, 102, 102, 0.2)',
                boxShadow: isReached ? '0 0 10px rgba(255, 215, 0, 0.6)' : 'none',
                transition: 'all 0.5s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {isReached && (
                  <div style={{
                    width: '6px',
                    height: '6px',
                    background: '#FFD700',
                    borderRadius: '50%'
                  }} />
                )}
              </div>

              {/* Tier Label - On the RIGHT side */}
              <div style={{
                position: 'absolute',
                right: '24px',
                whiteSpace: 'nowrap',
                background: isReached ? 'rgba(255, 215, 0, 0.2)' : 'rgba(50, 50, 80, 0.95)',
                padding: '4px 8px',
                borderRadius: '4px',
                border: `2px solid ${isReached ? '#FFD700' : '#666'}`,
                boxShadow: isReached ? '0 0 10px rgba(255, 215, 0, 0.5)' : '0 0 5px rgba(100, 100, 150, 0.3)',
                transition: 'all 0.5s'
              }}>
                <p style={{
                  fontSize: '0.6rem',
                  color: isReached ? '#FFD700' : '#ccc',
                  fontWeight: 'bold',
                  transition: 'all 0.5s',
                  marginBottom: '2px',
                  letterSpacing: '0.5px',
                  textShadow: isReached ? '0 0 5px rgba(255, 215, 0, 0.5)' : 'none'
                }}>{tier.label}</p>
                <p style={{
                  fontSize: '0.55rem',
                  color: isReached ? '#FFA500' : '#bbb',
                  transition: 'all 0.5s',
                  fontWeight: 'bold',
                  textShadow: isReached ? '0 0 5px rgba(255, 165, 0, 0.3)' : 'none'
                }}>{tier.gmb.toLocaleString()} GMB</p>
              </div>
            </div>
          );
        })}

        {/* Coin Stack Icon */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bottom: `${progressPercent}%`,
          transition: 'bottom 1s ease-out',
          zIndex: 10
        }}>
          {/* Glow effect */}
          <div style={{
            position: 'absolute',
            inset: 0,
            filter: 'blur(15px)',
            background: '#FFD700',
            opacity: 0.5,
            borderRadius: '50%',
            transform: 'scale(1.5)'
          }} />

          {/* Coin Stack - 3 gold coins stacked */}
          <div style={{ position: 'relative', animation: 'coinFloat 3s ease-in-out infinite' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
              border: '3px solid #FFD700',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), inset 0 2px 10px rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#000',
              position: 'relative'
            }}>
              💰
            </div>
          </div>
        </div>

        {/* End Label */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}>
          <p style={{ color: '#FFD700', fontSize: '0.45rem', fontWeight: 'bold' }}>1M+</p>
        </div>
      </div>
    </div>
  );
}

export default function MothershipPage() {
  const [mounted, setMounted] = useState(false);
  const [activeScene, setActiveScene] = useState<Scene>("portals");
  const { playSound } = useCosmicSound();

  useEffect(() => {
    setMounted(true);
    createStars();
  }, []);

  const createStars = () => {
    const space = document.getElementById('space-scene');
    if (!space) return;

    for (let i = 0; i < 150; i++) {
      const star = document.createElement('div');
      star.className = 'space-star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.width = Math.random() * 3 + 1 + 'px';
      star.style.height = star.style.width;
      star.style.animationDelay = Math.random() * 3 + 's';
      space.appendChild(star);
    }
  };

  const showScene = (scene: Scene) => {
    playSound('click');
    setActiveScene(scene);
  };

  if (!mounted) return null;

  return (
    <>
      <div className="cockpit">
        {/* Central Viewport Window */}
        <div className="main-viewport">
          {/* Scene 1: Space with Floating Portals (DEFAULT) */}
          <div id="scene-portals" className={`viewport-scene ${activeScene !== 'portals' ? 'hidden' : ''}`}>
            <div className="space-scene" id="space-scene">
              {/* Video Background */}
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 0,
                  opacity: 0.7
                }}
              >
                <source src="/alien.mp4" type="video/mp4" />
              </video>

              {/* Header */}
              <h1 className="portals-header" style={{ position: 'relative', zIndex: 10 }}>Gumbuo's Blockchain Portals</h1>

              {/* Centered Portal Grid */}
              <div className="portals-grid" style={{ position: 'relative', zIndex: 10 }}>
                <Link
                  href="/base"
                  className="portal-item"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 153, 255, 0.2), rgba(0, 119, 204, 0.3))',
                    padding: '20px',
                    borderRadius: '20px',
                    border: '3px solid #00d4ff',
                    boxShadow: '0 0 20px rgba(0, 212, 255, 0.6), inset 0 0 15px rgba(0, 212, 255, 0.2)'
                  }}
                >
                  <img
                    src="/blueportal.png"
                    alt="Base Chain"
                    className="portal-image"
                    style={{
                      borderColor: '#00d4ff',
                      boxShadow: '0 0 25px rgba(0, 212, 255, 0.8)'
                    }}
                  />
                  <div className="portal-label">BASE</div>
                </Link>

                <Link
                  href="/base"
                  className="portal-item"
                  style={{
                    background: 'linear-gradient(135deg, rgba(136, 136, 136, 0.2), rgba(102, 102, 102, 0.3))',
                    padding: '20px',
                    borderRadius: '20px',
                    border: '3px solid #e0e0e0',
                    boxShadow: '0 0 20px rgba(224, 224, 224, 0.6), inset 0 0 15px rgba(224, 224, 224, 0.2)'
                  }}
                >
                  <img
                    src="/greyportal.png"
                    alt="Games"
                    className="portal-image"
                    style={{
                      borderColor: '#e0e0e0',
                      boxShadow: '0 0 25px rgba(224, 224, 224, 0.8)'
                    }}
                  />
                  <div className="portal-label">GAMES</div>
                </Link>

                <Link
                  href="/base"
                  className="portal-item"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 153, 0.2), rgba(0, 204, 122, 0.3))',
                    padding: '20px',
                    borderRadius: '20px',
                    border: '3px solid #00ff99',
                    boxShadow: '0 0 20px rgba(0, 255, 153, 0.6), inset 0 0 15px rgba(0, 255, 153, 0.2)'
                  }}
                >
                  <img
                    src="/greenportal.png"
                    alt="Games"
                    className="portal-image"
                    style={{
                      borderColor: '#00ff99',
                      boxShadow: '0 0 25px rgba(0, 255, 153, 0.8)'
                    }}
                  />
                  <div className="portal-label">GAMES</div>
                </Link>

                <Link
                  href="/base"
                  className="portal-item"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 68, 68, 0.2), rgba(204, 34, 34, 0.3))',
                    padding: '20px',
                    borderRadius: '20px',
                    border: '3px solid #ff3366',
                    boxShadow: '0 0 20px rgba(255, 51, 102, 0.6), inset 0 0 15px rgba(255, 51, 102, 0.2)'
                  }}
                >
                  <img
                    src="/redportal.png"
                    alt="Games"
                    className="portal-image"
                    style={{
                      borderColor: '#ff3366',
                      boxShadow: '0 0 25px rgba(255, 51, 102, 0.8)'
                    }}
                  />
                  <div className="portal-label">GAMES</div>
                </Link>
              </div>
            </div>
          </div>

          {/* Scene 2: Drip Claim */}
          <div id="scene-drip" className={`viewport-scene ${activeScene !== 'drip' ? 'hidden' : ''}`}>
            <div className="content-scene">
              <h2 className="scene-title">💧 Drip Station 💧</h2>
              <div className="scene-subtitle">Claim all drips here - free and earned</div>
              <AlienDripStation />
            </div>
          </div>

          {/* Scene 3: Leaderboard */}
          <div id="scene-leaderboard" className={`viewport-scene ${activeScene !== 'leaderboard' ? 'hidden' : ''}`}>
            <div className="content-scene">
              <h2 className="scene-title">🏆 First Timer Leaderboard 🏆</h2>
              <AlienLeaderboard />
            </div>
          </div>

          {/* Scene 4: Buy GMB */}
          <div id="scene-buygmb" className={`viewport-scene ${activeScene !== 'buygmb' ? 'hidden' : ''}`}>
            <div className="content-scene" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
              <h2 className="scene-title">💰 Buy GMB Token 💰</h2>

              <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginTop: '40px'}}>
                <img src="/nyx.png" alt="Nyx" style={{width: '60px', height: '60px', animation: 'portalFloat 2s ease-in-out infinite'}} />
                <a
                  href="https://thirdweb.com/base/0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  className="portal-action-btn"
                  style={{fontSize: '1.5rem'}}
                >
                  Buy GMB on Base
                </a>
                <img src="/zorb.png" alt="Zorb" style={{width: '60px', height: '60px', animation: 'portalFloat 2s ease-in-out infinite', animationDelay: '0.5s'}} />
              </div>
              <p style={{color: '#00ffff', fontSize: '1.2rem', marginTop: '20px', fontWeight: 'bold', animation: 'pulse 2s ease-in-out infinite'}}>
                👆 LIVE NOW 👆
              </p>
            </div>
          </div>

          {/* Scene 5: Shopify */}
          <div id="scene-shopify" className={`viewport-scene ${activeScene !== 'shopify' ? 'hidden' : ''}`}>
            <div className="content-scene" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '60px'}}>
              <h2 className="scene-title">🛒 Alien Gear Shop 🛒</h2>

              <div style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.3))',
                border: '3px solid rgba(139, 92, 246, 0.5)',
                borderRadius: '20px',
                padding: '50px',
                textAlign: 'center',
                maxWidth: '600px'
              }}>
                <div style={{fontSize: '5rem', marginBottom: '20px', animation: 'portalFloat 2s ease-in-out infinite'}}>
                  👽🛒👕
                </div>
                <h3 style={{
                  color: '#ffff00',
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  marginBottom: '30px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  textShadow: '0 0 20px rgba(255, 255, 0, 0.8)'
                }}>
                  COMING SOON!
                </h3>
                <div style={{fontSize: '1.3rem', color: '#e0b3ff', lineHeight: '2'}}>
                  <p style={{fontWeight: 'bold', marginBottom: '10px'}}>🎁 Win Exclusive Alien Gear!</p>
                  <p>Get Shopify discount codes</p>
                  <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#00ff00', marginTop: '15px'}}>
                    Pay Shipping & Handling ONLY!
                  </p>
                  <p style={{marginTop: '30px', color: '#00ffff', fontSize: '1.1rem'}}>
                    Stay tuned for merch drops, giveaways, and exclusive alien apparel! 🚀
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scene 6: Socials */}
          <div id="scene-socials" className={`viewport-scene ${activeScene !== 'socials' ? 'hidden' : ''}`}>
            <div className="content-scene" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
              <h2 className="scene-title">🌐 Social Links 🌐</h2>

              <div style={{display: 'flex', gap: '30px', marginTop: '40px'}}>
                <a
                  href="https://x.com/gumbuogw3"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  className="portal-action-btn"
                  style={{fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px'}}
                >
                  <span style={{fontSize: '2rem'}}>𝕏</span> Twitter
                </a>
                <a
                  href="https://discord.gg/NptkDYn8fm"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  className="portal-action-btn"
                  style={{fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px'}}
                >
                  <span style={{fontSize: '2rem'}}>💬</span> Discord
                </a>
              </div>

              <div style={{
                marginTop: '50px',
                background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(255, 140, 0, 0.3))',
                border: '3px solid rgba(255, 165, 0, 0.5)',
                borderRadius: '15px',
                padding: '30px',
                maxWidth: '600px',
                textAlign: 'center'
              }}>
                <p style={{color: '#ffeb3b', fontSize: '1.1rem', lineHeight: '1.8', fontWeight: 'bold'}}>
                  🔒 FOR SUPPORT: PM FoxHole or AlienOG on Discord or Twitter.
                  <br />
                  <span style={{color: '#ff5555', fontSize: '1.3rem'}}>⚠️ WE WILL NEVER PM YOU FIRST ⚠️</span>
                  <br />
                  You must trigger support for a response. BE SAFE!
                </p>
              </div>
            </div>
          </div>

          {/* Scene 7: Support */}
          <div id="scene-support" className={`viewport-scene ${activeScene !== 'support' ? 'hidden' : ''}`}>
            <div className="content-scene" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
              <h2 className="scene-title">🔒 Support & Safety 🔒</h2>

              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(255, 140, 0, 0.3))',
                border: '3px solid rgba(255, 165, 0, 0.5)',
                borderRadius: '15px',
                padding: '40px',
                maxWidth: '700px',
                textAlign: 'center',
                marginBottom: '40px'
              }}>
                <p style={{color: '#ffeb3b', fontSize: '1.2rem', lineHeight: '2', fontWeight: 'bold'}}>
                  🔒 FOR SUPPORT: PM FoxHole or AlienOG on Discord or Twitter.
                  <br />
                  <span style={{color: '#ff5555', fontSize: '1.5rem'}}>⚠️ WE WILL NEVER PM YOU FIRST ⚠️</span>
                  <br />
                  You must trigger support for a response. BE SAFE!
                </p>
              </div>

              <div style={{display: 'flex', gap: '30px'}}>
                <a
                  href="https://x.com/gumbuogw3"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  className="portal-action-btn"
                  style={{fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px'}}
                >
                  <span style={{fontSize: '2rem'}}>𝕏</span> Twitter Support
                </a>
                <a
                  href="https://discord.gg/NptkDYn8fm"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  className="portal-action-btn"
                  style={{fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px'}}
                >
                  <span style={{fontSize: '2rem'}}>💬</span> Discord Support
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Overhead Panel */}
        <div className="overhead-panel steel-panel steel-brushed">
          <div className="rivet rivet-red" style={{top: '20px', left: '50px'}}></div>
          <div className="rivet rivet-red" style={{top: '25px', left: '20%'}}></div>
          <div className="rivet rivet-red" style={{top: '30px', left: '35%'}}></div>
          <div className="rivet rivet-red" style={{top: '25px', right: '35%'}}></div>
          <div className="rivet rivet-red" style={{top: '30px', right: '20%'}}></div>
          <div className="rivet rivet-red" style={{top: '20px', right: '50px'}}></div>
          <div className="circuit-line" style={{top: '50%', width: '80%', left: '10%'}}></div>

          {/* Title */}
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            width: '100%'
          }}>
            <h1 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#00ffff',
              textShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.6)',
              letterSpacing: '4px',
              margin: 0
            }}>
              GUMBUO MOTHERSHIP
            </h1>
          </div>
        </div>

        {/* Left Side Panel with Progress Bar */}
        <div className="left-panel steel-panel steel-brushed">
          <div className="rivet rivet-red" style={{top: '20px', right: '20px'}}></div>
          <div className="rivet rivet-red" style={{top: '15%', right: '15px'}}></div>
          <div className="rivet rivet-red" style={{top: '35%', right: '25px'}}></div>
          <div className="rivet rivet-red" style={{top: '50%', right: '20px'}}></div>
          <div className="rivet rivet-red" style={{top: '60%', right: '30px'}}></div>
          <div className="rivet rivet-red" style={{bottom: '30%', right: '18px'}}></div>
          <div className="rivet rivet-red" style={{bottom: '20px', right: '20px'}}></div>
          <div className="circuit-line" style={{top: '30%', width: '70%', right: '10%'}}></div>

          {/* Alien Points Progress Bar */}
          <AlienProgressBar />
        </div>

        {/* Right Side Panel with GMB Progress Bar */}
        <div className="right-panel steel-panel steel-brushed">
          <div className="rivet rivet-red" style={{top: '20px', left: '20px'}}></div>
          <div className="rivet rivet-red" style={{top: '18%', left: '28px'}}></div>
          <div className="rivet rivet-red" style={{top: '40%', left: '15px'}}></div>
          <div className="rivet rivet-red" style={{top: '50%', left: '20px'}}></div>
          <div className="rivet rivet-red" style={{top: '65%', left: '25px'}}></div>
          <div className="rivet rivet-red" style={{bottom: '25%', left: '18px'}}></div>
          <div className="rivet rivet-red" style={{bottom: '20px', left: '20px'}}></div>
          <div className="circuit-line" style={{top: '30%', width: '70%', left: '10%'}}></div>

          {/* GMB Holdings Progress Bar */}
          <GmbProgressBar />
        </div>

        {/* Front Console with ALIEN CONTROL PANEL */}
        <div className="front-console steel-brushed">
          {/* Alien Control Panel Background with Hexagonal Pattern */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(10, 10, 30, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%)',
            borderRadius: '20px 20px 0 0',
            overflow: 'hidden'
          }}>
            {/* Animated Hexagonal Grid Pattern */}
            <svg style={{position: 'absolute', width: '100%', height: '100%', opacity: 0.1}} xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hexagons" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
                  <polygon points="30,0 52,15 52,37 30,52 8,37 8,15" fill="none" stroke="#00ffff" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hexagons)"/>
            </svg>

            {/* Scanning Line Animation */}
            <div className="scan-line"></div>
          </div>

          {/* 4 Corner Power Indicators (Red Pulsing Orbs) */}
          <div className="power-orb power-orb-tl" style={{top: '20px', left: '20px'}}></div>
          <div className="power-orb power-orb-tr" style={{top: '20px', right: '20px'}}></div>
          <div className="power-orb power-orb-bl" style={{bottom: '30px', left: '20px'}}></div>
          <div className="power-orb power-orb-br" style={{bottom: '30px', right: '20px'}}></div>

          {/* Central Holographic Display Frame */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            height: '85%',
            border: '2px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '15px',
            background: 'radial-gradient(ellipse at center, rgba(0, 255, 255, 0.05) 0%, transparent 70%)',
            boxShadow: 'inset 0 0 30px rgba(0, 255, 255, 0.1), 0 0 20px rgba(0, 255, 255, 0.2)',
            pointerEvents: 'none'
          }}>
            {/* Corner Brackets */}
            <div className="holo-bracket" style={{top: '-2px', left: '-2px'}}></div>
            <div className="holo-bracket" style={{top: '-2px', right: '-2px', transform: 'rotate(90deg)'}}></div>
            <div className="holo-bracket" style={{bottom: '-2px', left: '-2px', transform: 'rotate(-90deg)'}}></div>
            <div className="holo-bracket" style={{bottom: '-2px', right: '-2px', transform: 'rotate(180deg)'}}></div>
          </div>

          {/* ALIEN CONTROL INTERFACE */}
          <div style={{
            position: 'absolute',
            bottom: '12%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxHeight: '35vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 10
          }}>
            {/* Control Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(3, 1fr)',
              gap: '15px',
              padding: '0 15px'
            }}>
              {/* Row 1 */}
              <button
                className={`alien-control-btn ${activeScene === 'portals' ? 'active' : ''}`}
                onClick={() => showScene('portals')}
                onMouseEnter={() => playSound('hover')}
              >
                <div className="btn-glow"></div>
                <div className="btn-content">
                  <span className="btn-icon">🌀</span>
                  <span className="btn-label">PORTALS</span>
                  <div className={`btn-indicator ${activeScene === 'portals' ? 'active' : ''}`}></div>
                </div>
              </button>
              <button
                className={`alien-control-btn ${activeScene === 'drip' ? 'active' : ''}`}
                onClick={() => showScene('drip')}
                onMouseEnter={() => playSound('hover')}
              >
                <div className="btn-glow"></div>
                <div className="btn-content">
                  <span className="btn-icon">💧</span>
                  <span className="btn-label">ALIEN DRIP</span>
                  <div className={`btn-indicator ${activeScene === 'drip' ? 'active' : ''}`}></div>
                </div>
              </button>
              <button
                className={`alien-control-btn ${activeScene === 'leaderboard' ? 'active' : ''}`}
                onClick={() => showScene('leaderboard')}
                onMouseEnter={() => playSound('hover')}
              >
                <div className="btn-glow"></div>
                <div className="btn-content">
                  <span className="btn-icon">🏆</span>
                  <span className="btn-label">LEADERBOARD</span>
                  <div className={`btn-indicator ${activeScene === 'leaderboard' ? 'active' : ''}`}></div>
                </div>
              </button>

              {/* Row 2 */}
              <button
                className={`alien-control-btn ${activeScene === 'buygmb' ? 'active' : ''}`}
                onClick={() => showScene('buygmb')}
                onMouseEnter={() => playSound('hover')}
              >
                <div className="btn-glow"></div>
                <div className="btn-content">
                  <span className="btn-icon">💰</span>
                  <span className="btn-label">BUY GMB</span>
                  <div className={`btn-indicator ${activeScene === 'buygmb' ? 'active' : ''}`}></div>
                </div>
              </button>
              <button
                className={`alien-control-btn ${activeScene === 'shopify' ? 'active' : ''}`}
                onClick={() => showScene('shopify')}
                onMouseEnter={() => playSound('hover')}
              >
                <div className="btn-glow"></div>
                <div className="btn-content">
                  <span className="btn-icon">🛒</span>
                  <span className="btn-label">ALIEN GEAR</span>
                  <div className={`btn-indicator ${activeScene === 'shopify' ? 'active' : ''}`}></div>
                </div>
              </button>
              <button
                className={`alien-control-btn ${activeScene === 'socials' ? 'active' : ''}`}
                onClick={() => showScene('socials')}
                onMouseEnter={() => playSound('hover')}
              >
                <div className="btn-glow"></div>
                <div className="btn-content">
                  <span className="btn-icon">🌐</span>
                  <span className="btn-label">SOCIALS</span>
                  <div className={`btn-indicator ${activeScene === 'socials' ? 'active' : ''}`}></div>
                </div>
              </button>

              {/* Row 3 - Support button centered */}
              <div></div>
              <button
                className={`alien-control-btn ${activeScene === 'support' ? 'active' : ''}`}
                onClick={() => showScene('support')}
                onMouseEnter={() => playSound('hover')}
              >
                <div className="btn-glow"></div>
                <div className="btn-content">
                  <span className="btn-icon">🔒</span>
                  <span className="btn-label">SUPPORT</span>
                  <div className={`btn-indicator ${activeScene === 'support' ? 'active' : ''}`}></div>
                </div>
              </button>
              <div></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .cockpit {
          position: relative;
          width: 100vw;
          height: 100vh;
          background: radial-gradient(ellipse at center, #2a2a3a 0%, #0a0a15 100%);
          overflow: hidden;
          font-family: 'Courier New', monospace;
        }

        /* STAINLESS STEEL PANELS */
        .steel-panel {
          background: linear-gradient(135deg, #c0c0c8 0%, #8a8a95 25%, #c5c5d0 50%, #7a7a85 75%, #b5b5c0 100%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.4);
        }

        .steel-brushed::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 1px, transparent 1px, transparent 2px);
          pointer-events: none;
        }

        /* Central Viewport */
        .main-viewport {
          position: absolute;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          width: 70%;
          height: 50%;
          background: #000;
          border: 12px solid #7a7a85;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 0 50px rgba(0, 255, 255, 0.4), inset 0 0 50px rgba(0, 0, 0, 0.9), 0 20px 40px rgba(0, 0, 0, 0.8);
          z-index: 15;
        }

        .viewport-scene {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          transition: opacity 0.5s;
          overflow: hidden;
        }

        .viewport-scene.hidden {
          display: none;
        }

        /* Space Scene */
        .space-scene {
          width: 100%;
          height: 100%;
          position: relative;
          top: 0;
          left: 0;
          overflow: hidden;
        }

        @keyframes spaceFloat {
          0% { background-position: 0 0; }
          100% { background-position: -50px -30px; }
        }

        .space-star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: starTwinkle 3s infinite;
        }

        @keyframes starTwinkle {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        /* Portals Header */
        .portals-header {
          text-align: center;
          font-size: 2rem;
          font-weight: bold;
          color: #00ffff;
          text-shadow: 0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.6);
          font-family: 'Orbitron', sans-serif;
          margin: 20px 0 20px 0;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        /* Centered Portal Grid */
        .portals-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px 80px;
          max-width: 650px;
          margin: 0 auto;
          padding: 10px 20px;
          place-items: center;
        }

        .portal-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.3s;
        }

        .portal-item:hover {
          transform: scale(1.1);
        }

        .portal-image {
          width: 130px;
          height: 130px;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid #00ffff;
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
          background: rgba(0, 0, 0, 0.9);
        }

        .portal-label {
          margin-top: 10px;
          font-size: 0.85rem;
          font-weight: bold;
          text-transform: uppercase;
          color: #000;
          background: #00ffff;
          padding: 5px 16px;
          border-radius: 6px;
          border: 2px solid currentColor;
          white-space: nowrap;
          letter-spacing: 1.5px;
          box-shadow: 0 0 25px currentColor;
        }

        .portal-item:nth-child(1) .portal-label {
          background: #00d4ff;
          color: #000;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.8);
        }

        .portal-item:nth-child(2) .portal-label {
          background: #e0e0e0;
          color: #000;
          box-shadow: 0 0 20px rgba(224, 224, 224, 0.8);
        }

        .portal-item:nth-child(3) .portal-label {
          background: #00ff99;
          color: #000;
          box-shadow: 0 0 20px rgba(0, 255, 153, 0.8);
        }

        .portal-item:nth-child(4) .portal-label {
          background: #ff3366;
          color: #000;
          box-shadow: 0 0 20px rgba(255, 51, 102, 0.8);
        }

        /* Content Display Scenes */
        .content-scene {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%);
          padding: 30px;
          overflow-y: auto;
        }

        .scene-title {
          font-size: 2rem;
          color: #00ffff;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 3px;
          text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
          margin-bottom: 10px;
          font-family: 'Orbitron', sans-serif;
        }

        .scene-subtitle {
          font-size: 1.1rem;
          color: #00ff99;
          text-align: center;
          margin-bottom: 20px;
          font-family: 'Orbitron', sans-serif;
        }

        .portal-action-btn {
          padding: 15px 40px;
          background: linear-gradient(135deg, #00ffff, #0099cc);
          border: none;
          border-radius: 8px;
          color: #000;
          font-size: 1.2rem;
          font-weight: bold;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.3s;
          box-shadow: 0 5px 20px rgba(0, 255, 255, 0.5);
          text-decoration: none;
          display: inline-block;
        }

        .portal-action-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0, 255, 255, 0.8);
        }

        /* Left Side Panel */
        .left-panel {
          position: absolute;
          left: 0;
          top: 0;
          width: 20%;
          height: 100%;
          transform-origin: right center;
          transform: perspective(800px) rotateY(25deg) translateX(-10%);
          border-right: 8px solid #5a5a65;
          box-shadow: inset -10px 0 30px rgba(0, 0, 0, 0.6), 10px 0 50px rgba(0, 0, 0, 0.7);
          z-index: 5;
        }

        /* Right Side Panel */
        .right-panel {
          position: absolute;
          right: 0;
          top: 0;
          width: 20%;
          height: 100%;
          transform-origin: left center;
          transform: perspective(800px) rotateY(-25deg) translateX(10%);
          border-left: 8px solid #5a5a65;
          box-shadow: inset 10px 0 30px rgba(0, 0, 0, 0.6), -10px 0 50px rgba(0, 0, 0, 0.7);
          z-index: 5;
        }

        /* Overhead Panel */
        .overhead-panel {
          position: absolute;
          top: 0;
          left: 20%;
          width: 60%;
          height: 15%;
          transform-origin: center bottom;
          transform: perspective(800px) rotateX(-30deg) translateY(-20%);
          border-bottom: 6px solid #5a5a65;
          box-shadow: inset 0 -10px 30px rgba(0, 0, 0, 0.6), 0 15px 40px rgba(0, 0, 0, 0.7);
          z-index: 4;
        }

        /* Front Console */
        .front-console {
          position: absolute;
          bottom: 0;
          left: 15%;
          width: 70%;
          height: 38%;
          background: linear-gradient(180deg, #9a9aa5 0%, #6a6a75 50%, #5a5a65 100%);
          transform-origin: center top;
          transform: perspective(600px) rotateX(30deg);
          border-top: 8px solid #7a7a85;
          border-radius: 20px 20px 0 0;
          box-shadow: inset 0 10px 30px rgba(0, 0, 0, 0.6), 0 -20px 50px rgba(0, 0, 0, 0.8);
          z-index: 8;
        }

        .rivet {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .rivet-red {
          background: #ff0000;
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.8), 0 0 20px rgba(255, 0, 0, 0.6);
          animation: blinkRed 2s infinite;
        }

        @keyframes blinkRed {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 10px rgba(255, 0, 0, 0.8), 0 0 20px rgba(255, 0, 0, 0.6);
          }
          50% {
            opacity: 0.3;
            box-shadow: 0 0 5px rgba(255, 0, 0, 0.3), 0 0 10px rgba(255, 0, 0, 0.2);
          }
        }

        /* Smooth scrolling for control panel on mobile */
        .front-console > div:first-child {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 255, 255, 0.5) rgba(0, 0, 0, 0.3);
          scroll-behavior: smooth;
        }

        .front-console > div:first-child::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .front-console > div:first-child::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }

        .front-console > div:first-child::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.5);
          border-radius: 4px;
          border: 2px solid rgba(0, 0, 0, 0.3);
        }

        .front-console > div:first-child::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 255, 0.8);
        }

        /* Gauge Animations */
        .gauge-needle {
          transform-origin: 50px 50px;
          animation: gaugeSwing 3s ease-in-out infinite;
        }

        @keyframes gaugeSwing {
          0%, 100% { transform: rotate(-45deg); }
          50% { transform: rotate(45deg); }
        }

        /* Hourglass Animations */
        .liquid-drop {
          animation: liquidDrip 2s ease-in-out infinite;
        }

        @keyframes liquidDrip {
          0% { cy: 20; opacity: 0.8; }
          50% { cy: 35; opacity: 0.5; }
          100% { cy: 50; opacity: 0; }
        }

        .alien-hourglass {
          filter: drop-shadow(0 0 10px rgba(0, 255, 153, 0.5));
        }

        /* Power Orbs (4 Corner Red Lights) */
        .power-orb {
          position: absolute;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: radial-gradient(circle, #ff0000 0%, #cc0000 50%, #990000 100%);
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.8), 0 0 30px rgba(255, 0, 0, 0.4), inset 0 0 10px rgba(255, 100, 100, 0.6);
          animation: powerPulse 1.5s ease-in-out infinite;
          z-index: 20;
        }

        @keyframes powerPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 15px rgba(255, 0, 0, 0.8), 0 0 30px rgba(255, 0, 0, 0.4), inset 0 0 10px rgba(255, 100, 100, 0.6);
          }
          50% {
            transform: scale(1.15);
            box-shadow: 0 0 25px rgba(255, 0, 0, 1), 0 0 50px rgba(255, 0, 0, 0.6), inset 0 0 15px rgba(255, 150, 150, 0.8);
          }
        }

        /* Scanning Line */
        .scan-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, rgba(0, 255, 255, 0.8) 50%, transparent 100%);
          animation: scanDown 3s linear infinite;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
        }

        @keyframes scanDown {
          0% { transform: translateY(0); opacity: 0.8; }
          100% { transform: translateY(600px); opacity: 0; }
        }

        /* Holographic Brackets */
        .holo-bracket {
          position: absolute;
          width: 30px;
          height: 30px;
          border-top: 3px solid rgba(0, 255, 255, 0.6);
          border-left: 3px solid rgba(0, 255, 255, 0.6);
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
        }

        /* Alien Control Buttons */
        .alien-control-btn {
          position: relative;
          padding: 12px 16px;
          background: linear-gradient(135deg, rgba(0, 40, 60, 0.9) 0%, rgba(0, 20, 40, 0.9) 100%);
          border: 2px solid rgba(0, 255, 255, 0.3);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(0, 255, 255, 0.2);
        }

        .alien-control-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .alien-control-btn:hover::before {
          opacity: 1;
        }

        .alien-control-btn:hover {
          border-color: rgba(0, 255, 255, 0.6);
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 255, 255, 0.4), inset 0 1px 3px rgba(0, 255, 255, 0.3);
        }

        .alien-control-btn:active {
          transform: translateY(-1px);
          box-shadow: 0 2px 10px rgba(0, 255, 255, 0.6), inset 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        .alien-control-btn.active {
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.3) 0%, rgba(0, 200, 200, 0.3) 100%);
          border-color: rgba(0, 255, 255, 0.9);
          box-shadow: 0 0 25px rgba(0, 255, 255, 0.8), 0 0 50px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.2);
        }

        .btn-glow {
          position: absolute;
          inset: -2px;
          background: radial-gradient(circle at center, rgba(0, 255, 255, 0.4) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
          border-radius: 10px;
          pointer-events: none;
        }

        .alien-control-btn.active .btn-glow {
          opacity: 1;
          animation: glowPulse 2s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .btn-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          z-index: 2;
        }

        .btn-icon {
          font-size: 1.8rem;
          filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.6));
        }

        .btn-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.65rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #00ffff;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
        }

        .btn-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(100, 100, 100, 0.5);
          border: 1px solid rgba(150, 150, 150, 0.3);
          transition: all 0.3s;
        }

        .btn-indicator.active {
          background: #00ff00;
          border-color: #00ff00;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.8), 0 0 20px rgba(0, 255, 0, 0.4);
          animation: indicatorBlink 1.5s ease-in-out infinite;
        }

        @keyframes indicatorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Warning Lights */
        .warning-light {
          position: absolute;
          width: 15px;
          height: 15px;
          background: #ff0000;
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
          animation: warningBlink 1s infinite;
        }

        @keyframes warningBlink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0.2; }
        }

        /* Circuit Lines */
        .circuit-line {
          position: absolute;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.4), transparent);
          height: 2px;
          animation: circuitFlow 4s linear infinite;
        }

        @keyframes circuitFlow {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes ufoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        @keyframes coinFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(180deg); }
        }

        /* Scrollbar styling */
        .content-scene::-webkit-scrollbar {
          width: 8px;
        }

        .content-scene::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }

        .content-scene::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.3);
          border-radius: 4px;
        }

        .content-scene::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 255, 0.5);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .left-panel, .right-panel { width: 18%; }
          .main-viewport { width: 64%; }
        }

        @media (max-width: 768px) {
          .control-btn { font-size: 0.7rem; padding: 10px 15px; }
          .portal-floating { width: 60px; height: 60px; }
          .portal-label { font-size: 0.55rem; bottom: -20px; padding: 2px 6px; }
        }
      `}</style>
    </>
  );
}
