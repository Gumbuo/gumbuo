"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCosmicSound } from "./hooks/useCosmicSound";
import { useAccount } from "wagmi";
import { useSearchParams, useRouter } from "next/navigation";

const AlienLeaderboard = dynamic(() => import("./components/AlienLeaderboard"), { ssr: false });
const AlienDripStation = dynamic(() => import("./components/AlienDripStation"), { ssr: false });
const ReferralDrawer = dynamic(() => import("./components/ReferralDrawer"), { ssr: false });
const GlobalMusicPlayer = dynamic(() => import("./components/GlobalMusicPlayer"), { ssr: false });

type Scene = "portals" | "drip" | "leaderboard" | "buygmb" | "shopify" | "socials" | "support" | "admin";

export default function MothershipPage() {
  const [mounted, setMounted] = useState(false);
  const [activeScene, setActiveScene] = useState<Scene>("portals");
  const [referralDrawerOpen, setReferralDrawerOpen] = useState(false);
  const { playSound } = useCosmicSound();
  const { address, isConnected } = useAccount();
  const searchParams = useSearchParams();
  const [referralRecorded, setReferralRecorded] = useState(false);
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const router = useRouter();

  // Admin wallet check
  const ADMIN_WALLETS = ["0xb374735cbe89a552421ddb4aad80380ae40f67a7"];
  const isAdmin = address && ADMIN_WALLETS.includes(address.toLowerCase());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Record referral when wallet connects
  useEffect(() => {
    const referrer = searchParams?.get("ref");
    if (isConnected && address && referrer && !referralRecorded) {
      recordReferral(address, referrer);
    }
  }, [isConnected, address, searchParams, referralRecorded]);

  const recordReferral = async (referredWallet: string, referrerWallet: string) => {
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrerWallet, referredWallet }),
      });
      if (res.ok) {
        setReferralRecorded(true);
        console.log("Referral recorded successfully!");
      }
    } catch (error) {
      console.error("Error recording referral:", error);
    }
  };

  const showScene = (scene: Scene) => {
    playSound('click');
    setActiveScene(scene);
  };

  const handleAdminClick = () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    if (!isAdmin) {
      setShowUnauthorized(true);
      setTimeout(() => setShowUnauthorized(false), 3000);
      return;
    }
    router.push('/admin');
  };

  if (!mounted) return null;

  return (
    <>
      <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#000' }}>
        {/* Header with tabs */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(to bottom, #1a1a2e, #0f0f1e)',
          borderBottom: '2px solid #00d4ff',
        }}>
          {/* Title */}
          <div style={{
            padding: '20px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(0, 212, 255, 0.3)',
          }}>
            <h1 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '80px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #00d4ff, #00ff99)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '10px'
            }}>
              GUMBUO MOTHERSHIP
            </h1>
            <p style={{
              fontFamily: 'Share Tech Mono, monospace',
              color: '#00d4ff',
              fontSize: '14px',
              marginTop: '8px',
            }}>
              🛸 Your Gateway to the Alien Points Economy 🛸
            </p>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '10px',
            padding: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {[
              { key: 'portals', label: '🌀 Portals', show: true },
              { key: 'drip', label: '💧 Alien Drip', show: true },
              { key: 'leaderboard', label: '🏆 Leaderboard', show: true },
              { key: 'buygmb', label: '💰 Buy GMB', show: true },
              { key: 'shopify', label: '🛒 Alien Gear', show: true },
              { key: 'socials', label: '🌐 Socials', show: true },
              { key: 'support', label: '🔒 Support', show: true },
              { key: 'admin', label: isAdmin ? '🛸 Admin' : '🔒 Admin', show: isConnected }
            ].filter(tab => tab.show).map(tab => (
              <button
                key={tab.key}
                onClick={() => tab.key === 'admin' ? handleAdminClick() : showScene(tab.key as Scene)}
                onMouseEnter={() => playSound('hover')}
                style={{
                  padding: '12px 24px',
                  background: activeScene === tab.key
                    ? 'linear-gradient(135deg, #00d4ff, #0099cc)'
                    : 'rgba(0, 212, 255, 0.1)',
                  color: activeScene === tab.key ? '#000' : '#00d4ff',
                  border: `2px solid ${activeScene === tab.key ? '#00d4ff' : '#00d4ff44'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  boxShadow: activeScene === tab.key
                    ? '0 0 20px rgba(0, 212, 255, 0.5)'
                    : 'none',
                  opacity: !isAdmin && tab.key === 'admin' ? 0.5 : 1
                }}
                onMouseOver={(e) => {
                  if (activeScene !== tab.key) {
                    e.currentTarget.style.background = 'rgba(0, 212, 255, 0.2)';
                    e.currentTarget.style.borderColor = '#00d4ff';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeScene !== tab.key) {
                    e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
                    e.currentTarget.style.borderColor = '#00d4ff44';
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => {
                playSound('click');
                setReferralDrawerOpen(true);
              }}
              onMouseEnter={() => playSound('hover')}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.9), rgba(255, 165, 0, 0.9))',
                color: '#000',
                border: '2px solid #FFD700',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                fontSize: '14px',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.4)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🎁 Referrals
            </button>
          </div>

          {/* Unauthorized message */}
          {showUnauthorized && (
            <div style={{
              padding: '10px',
              background: 'rgba(255, 71, 87, 0.2)',
              border: '2px solid #ff4757',
              color: '#ff4757',
              fontSize: '14px',
              textAlign: 'center',
              fontWeight: 'bold',
              marginBottom: '10px'
            }}>
              ❌ UNAUTHORIZED - Admin access only
            </div>
          )}
        </div>

        {/* Content Area */}
        <div style={{
          width: '100%',
          height: 'calc(100vh - 220px)',
          overflow: 'auto',
          background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)',
        }}>
          {/* Scene 1: Portals */}
          {activeScene === 'portals' && (
            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
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

              <div style={{ position: 'relative', zIndex: 10, padding: '40px' }}>
                <h2 style={{
                  textAlign: 'center',
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: '#00ffff',
                  textShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
                  fontFamily: 'Orbitron, sans-serif',
                  marginBottom: '40px',
                  letterSpacing: '2px',
                }}>
                  Mothership Portals
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '40px 80px',
                  maxWidth: '650px',
                  margin: '0 auto',
                  placeItems: 'center'
                }}>
                  <Link
                    href="/base"
                    onMouseEnter={() => playSound('hover')}
                    onClick={() => playSound('click')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(0, 153, 255, 0.2), rgba(0, 119, 204, 0.3))',
                      padding: '20px',
                      borderRadius: '20px',
                      border: '3px solid #00d4ff',
                      boxShadow: '0 0 20px rgba(0, 212, 255, 0.6)'
                    }}>
                      <img src="/blueportal.png" alt="Base Chain" style={{
                        width: '130px',
                        height: '130px',
                        borderRadius: '50%',
                        border: '3px solid #00d4ff',
                        boxShadow: '0 0 25px rgba(0, 212, 255, 0.8)'
                      }} />
                    </div>
                    <div style={{
                      marginTop: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      color: '#000',
                      background: '#00d4ff',
                      padding: '5px 16px',
                      borderRadius: '6px',
                      letterSpacing: '1.5px',
                      boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)'
                    }}>
                      BASE GAMES
                    </div>
                  </Link>

                  <div
                    onClick={() => showScene('drip')}
                    onMouseEnter={() => playSound('hover')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(136, 136, 136, 0.2), rgba(102, 102, 102, 0.3))',
                      padding: '20px',
                      borderRadius: '20px',
                      border: '3px solid #e0e0e0',
                      boxShadow: '0 0 20px rgba(224, 224, 224, 0.6)'
                    }}>
                      <img src="/greyportal.png" alt="Alien Drip" style={{
                        width: '130px',
                        height: '130px',
                        borderRadius: '50%',
                        border: '3px solid #e0e0e0',
                        boxShadow: '0 0 25px rgba(224, 224, 224, 0.8)'
                      }} />
                    </div>
                    <div style={{
                      marginTop: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      color: '#000',
                      background: '#00ffff',
                      padding: '5px 16px',
                      borderRadius: '6px',
                      letterSpacing: '1.5px',
                      boxShadow: '0 0 25px #000',
                      textDecoration: 'underline',
                      border: '2px solid #000'
                    }}>
                      ALIEN DRIP
                    </div>
                  </div>

                  <div
                    onClick={() => showScene('leaderboard')}
                    onMouseEnter={() => playSound('hover')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(0, 255, 153, 0.2), rgba(0, 204, 122, 0.3))',
                      padding: '20px',
                      borderRadius: '20px',
                      border: '3px solid #00ff99',
                      boxShadow: '0 0 20px rgba(0, 255, 153, 0.6)'
                    }}>
                      <img src="/greenportal.png" alt="Leaderboard" style={{
                        width: '130px',
                        height: '130px',
                        borderRadius: '50%',
                        border: '3px solid #00ff99',
                        boxShadow: '0 0 25px rgba(0, 255, 153, 0.8)'
                      }} />
                    </div>
                    <div style={{
                      marginTop: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      color: '#000',
                      background: '#00ffff',
                      padding: '5px 16px',
                      borderRadius: '6px',
                      letterSpacing: '1.5px',
                      boxShadow: '0 0 25px #000',
                      textDecoration: 'underline',
                      border: '2px solid #000'
                    }}>
                      LEADERBOARD
                    </div>
                  </div>

                  <Link
                    href="/credits"
                    onMouseEnter={() => playSound('hover')}
                    onClick={() => playSound('click')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(255, 68, 68, 0.2), rgba(204, 34, 34, 0.3))',
                      padding: '20px',
                      borderRadius: '20px',
                      border: '3px solid #ff3366',
                      boxShadow: '0 0 20px rgba(255, 51, 102, 0.6)'
                    }}>
                      <img src="/redportal.png" alt="Credits" style={{
                        width: '130px',
                        height: '130px',
                        borderRadius: '50%',
                        border: '3px solid #ff3366',
                        boxShadow: '0 0 25px rgba(255, 51, 102, 0.8)'
                      }} />
                    </div>
                    <div style={{
                      marginTop: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      color: '#000',
                      background: '#ff3366',
                      padding: '5px 16px',
                      borderRadius: '6px',
                      letterSpacing: '1.5px',
                      boxShadow: '0 0 20px rgba(255, 51, 102, 0.8)'
                    }}>
                      CREDITS
                    </div>
                  </Link>
                </div>

                {/* Music Player */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '60px'
                }}>
                  <GlobalMusicPlayer />
                </div>
              </div>
            </div>
          )}

          {/* Scene 2: Drip */}
          {activeScene === 'drip' && (
            <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{
                fontSize: '3rem',
                color: '#00ffff',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                textShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
                marginBottom: '20px',
                fontFamily: 'Orbitron, sans-serif'
              }}>
                💧 Drip Station 💧
              </h2>
              <div style={{
                fontSize: '1.1rem',
                color: '#00ff99',
                textAlign: 'center',
                marginBottom: '40px',
                fontFamily: 'Orbitron, sans-serif'
              }}>
                Claim all drips here - free and earned
              </div>
              <AlienDripStation />
            </div>
          )}

          {/* Scene 3: Leaderboard */}
          {activeScene === 'leaderboard' && (
            <div style={{ padding: '40px' }}>
              <AlienLeaderboard />
            </div>
          )}

          {/* Scene 4: Buy GMB */}
          {activeScene === 'buygmb' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '40px'
            }}>
              <h2 style={{
                fontSize: '3rem',
                color: '#00ffff',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                textShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
                fontFamily: 'Orbitron, sans-serif'
              }}>
                💰 Buy GMB Token 💰
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <img src="/nyx.png" alt="Nyx" style={{ width: '60px', height: '60px' }} />
                <a
                  href="https://thirdweb.com/base/0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  style={{
                    padding: '20px 50px',
                    background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                    border: '3px solid #00d4ff',
                    borderRadius: '12px',
                    color: '#000',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    boxShadow: '0 5px 20px rgba(0, 212, 255, 0.5)',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 212, 255, 0.8)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 212, 255, 0.5)';
                  }}
                >
                  Buy GMB on Base
                </a>
                <img src="/zorb.png" alt="Zorb" style={{ width: '60px', height: '60px' }} />
              </div>
              <p style={{
                color: '#00ffff',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                fontFamily: 'Orbitron, sans-serif'
              }}>
                👆 LIVE NOW 👆
              </p>
            </div>
          )}

          {/* Scene 5: Shopify */}
          {activeScene === 'shopify' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: '60px'
            }}>
              <h2 style={{
                fontSize: '3rem',
                color: '#00ffff',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                textShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
                marginBottom: '40px',
                fontFamily: 'Orbitron, sans-serif'
              }}>
                🛒 Alien Gear Shop 🛒
              </h2>
              <div style={{
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 153, 204, 0.3))',
                border: '3px solid #00d4ff',
                borderRadius: '20px',
                padding: '50px',
                textAlign: 'center',
                maxWidth: '600px'
              }}>
                <div style={{ fontSize: '5rem', marginBottom: '20px' }}>
                  👽🛒👕
                </div>
                <h3 style={{
                  color: '#ffff00',
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  marginBottom: '30px',
                  textShadow: '0 0 20px rgba(255, 255, 0, 0.8)',
                  fontFamily: 'Orbitron, sans-serif'
                }}>
                  COMING SOON!
                </h3>
                <div style={{ fontSize: '1.3rem', color: '#00ff99', lineHeight: '2', fontFamily: 'Orbitron, sans-serif' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>🎁 Win Exclusive Alien Gear!</p>
                  <p>Get Shopify discount codes</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ff99', marginTop: '15px' }}>
                    Pay Shipping & Handling ONLY!
                  </p>
                  <p style={{ marginTop: '30px', color: '#00d4ff', fontSize: '1.1rem' }}>
                    Stay tuned for merch drops, giveaways, and exclusive alien apparel! 🚀
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Scene 6: Socials */}
          {activeScene === 'socials' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '40px'
            }}>
              <h2 style={{
                fontSize: '3rem',
                color: '#00ffff',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                textShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
                fontFamily: 'Orbitron, sans-serif'
              }}>
                🌐 Social Links 🌐
              </h2>
              <div style={{ display: 'flex', gap: '30px' }}>
                <a
                  href="https://x.com/gumbuogw3"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  style={{
                    padding: '20px 40px',
                    background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                    borderRadius: '12px',
                    color: '#000',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontFamily: 'Orbitron, sans-serif',
                    boxShadow: '0 5px 20px rgba(0, 212, 255, 0.5)',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span style={{ fontSize: '2rem' }}>𝕏</span> Twitter
                </a>
                <a
                  href="https://discord.gg/NptkDYn8fm"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  style={{
                    padding: '20px 40px',
                    background: 'linear-gradient(135deg, #00ff99, #00cc7a)',
                    borderRadius: '12px',
                    color: '#000',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontFamily: 'Orbitron, sans-serif',
                    boxShadow: '0 5px 20px rgba(0, 255, 153, 0.5)',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span style={{ fontSize: '2rem' }}>💬</span> Discord
                </a>
              </div>
              <div style={{
                background: 'rgba(255, 165, 0, 0.1)',
                border: '3px solid rgba(255, 165, 0, 0.5)',
                borderRadius: '15px',
                padding: '30px',
                maxWidth: '600px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#ffeb3b', fontSize: '1.1rem', lineHeight: '1.8', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif' }}>
                  🔒 FOR SUPPORT: PM FoxHole or AlienOG on Discord or Twitter.
                  <br />
                  <span style={{ color: '#ff5555', fontSize: '1.3rem' }}>⚠️ WE WILL NEVER PM YOU FIRST ⚠️</span>
                  <br />
                  You must trigger support for a response. BE SAFE!
                </p>
              </div>
            </div>
          )}

          {/* Scene 7: Support */}
          {activeScene === 'support' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '40px'
            }}>
              <h2 style={{
                fontSize: '3rem',
                color: '#00ffff',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                textShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
                fontFamily: 'Orbitron, sans-serif'
              }}>
                🔒 Support & Safety 🔒
              </h2>
              <div style={{
                background: 'rgba(255, 165, 0, 0.1)',
                border: '3px solid rgba(255, 165, 0, 0.5)',
                borderRadius: '15px',
                padding: '40px',
                maxWidth: '700px',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <p style={{ color: '#ffeb3b', fontSize: '1.2rem', lineHeight: '2', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif' }}>
                  🔒 FOR SUPPORT: PM FoxHole or AlienOG on Discord or Twitter.
                  <br />
                  <span style={{ color: '#ff5555', fontSize: '1.5rem' }}>⚠️ WE WILL NEVER PM YOU FIRST ⚠️</span>
                  <br />
                  You must trigger support for a response. BE SAFE!
                </p>
              </div>
              <div style={{ display: 'flex', gap: '30px' }}>
                <a
                  href="https://x.com/gumbuogw3"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  style={{
                    padding: '20px 40px',
                    background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                    borderRadius: '12px',
                    color: '#000',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontFamily: 'Orbitron, sans-serif',
                    boxShadow: '0 5px 20px rgba(0, 212, 255, 0.5)',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span style={{ fontSize: '2rem' }}>𝕏</span> Twitter Support
                </a>
                <a
                  href="https://discord.gg/NptkDYn8fm"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  style={{
                    padding: '20px 40px',
                    background: 'linear-gradient(135deg, #00ff99, #00cc7a)',
                    borderRadius: '12px',
                    color: '#000',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontFamily: 'Orbitron, sans-serif',
                    boxShadow: '0 5px 20px rgba(0, 255, 153, 0.5)',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span style={{ fontSize: '2rem' }}>💬</span> Discord Support
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referral Drawer */}
      {mounted && <ReferralDrawer isOpen={referralDrawerOpen} setIsOpen={setReferralDrawerOpen} />}
    </>
  );
}
