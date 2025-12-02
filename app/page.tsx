"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { useCosmicSound } from "./hooks/useCosmicSound";

// Add more videos to this array as needed
const AD_VIDEOS = [
  "/Fox_Fights_Alien_Wins_Video.mp4",
  "/can_you_make_these_character.mp4",
  "/Fox_and_Alien_Battle_Video.mp4",
  "/Tank_Battle_Video_Generation.mp4",
  "/Tank_Battle_Video_Generation_2.mp4",
  "/Pixel_Tank_Alien_Invasion_Game.mp4",
  "/Pixel_Alien_Invasion_Game_Trailer.mp4",
];
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

  // Video ad state
  const [showVideo, setShowVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Admin wallet check
  const ADMIN_WALLETS = ["0xb374735cbe89a552421ddb4aad80380ae40f67a7"];
  const isAdmin = address && ADMIN_WALLETS.includes(address.toLowerCase());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show video popup on page load with rotation
  useEffect(() => {
    const lastPlayed = localStorage.getItem("lastVideoAdGumbuo");
    let availableVideos = AD_VIDEOS;
    if (lastPlayed && AD_VIDEOS.length > 1) {
      availableVideos = AD_VIDEOS.filter(v => v !== lastPlayed);
    }
    const randomIndex = Math.floor(Math.random() * availableVideos.length);
    const selected = availableVideos[randomIndex];
    localStorage.setItem("lastVideoAdGumbuo", selected);
    setSelectedVideo(selected);
    setShowVideo(true);
  }, []);

  // Handle video autoplay with unmute
  useEffect(() => {
    if (showVideo && videoRef.current) {
      const video = videoRef.current;
      video.muted = true;
      video.play().then(() => {
        video.muted = false;
      }).catch(() => {
        video.muted = true;
      });
    }
  }, [showVideo]);

  const closeVideo = () => {
    setShowVideo(false);
  };

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
      {/* Video Popup Modal */}
      {showVideo && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '900px', margin: '0 16px' }}>
            {/* Close Button */}
            <button
              onClick={closeVideo}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '32px',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              ×
            </button>
            {/* Video Container */}
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 0 40px rgba(102, 252, 241, 0.5)',
              border: '4px solid #66fcf1',
            }}>
              <video
                ref={videoRef}
                autoPlay
                controls
                style={{ width: '100%', height: 'auto', display: 'block' }}
                onEnded={closeVideo}
              >
                {selectedVideo && <source src={selectedVideo} type="video/mp4" />}
                Your browser does not support the video tag.
              </video>
            </div>
            {/* Play Button */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                onClick={() => videoRef.current?.play()}
                style={{
                  padding: '12px 32px',
                  background: 'linear-gradient(135deg, #66fcf1, #45a29e)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                ▶ Play Video
              </button>
            </div>
          </div>
        </div>
      )}

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
        textAlign: 'center',
        overflowX: 'hidden',
        paddingBottom: '100px'
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: '3.5rem',
          textShadow: '0 0 15px #66fcf1',
          marginTop: '30px',
          letterSpacing: '5px',
          textTransform: 'uppercase',
          marginBottom: '5px'
        }}>
          GUMBUO MOTHERSHIP
        </h1>
        <p style={{ color: '#c5c6c7', fontSize: '0.9rem', marginBottom: '30px', letterSpacing: '2px' }}>
          Your Gateway to the Alien Points Economy
        </p>

        {/* Navigation Panel */}
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          borderTop: '2px solid #45a29e',
          borderBottom: '2px solid #45a29e',
          padding: '15px',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          boxShadow: '0 0 20px rgba(69, 162, 158, 0.2)'
        }}>
          <button
            onClick={() => showScene('portals')}
            style={{
              background: activeScene === 'portals' ? '#45a29e' : 'linear-gradient(180deg, #333 0%, #111 100%)',
              border: '1px solid #45a29e',
              color: activeScene === 'portals' ? '#000' : '#45a29e',
              padding: '12px 25px',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '5px',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
            }}
          >
            Portals
          </button>
          <button
            onClick={() => showScene('drip')}
            style={{
              background: activeScene === 'drip' ? '#45a29e' : 'linear-gradient(180deg, #333 0%, #111 100%)',
              border: '1px solid #45a29e',
              color: activeScene === 'drip' ? '#000' : '#45a29e',
              padding: '12px 25px',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '5px',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
            }}
          >
            Alien Drip
          </button>
          <button
            onClick={() => showScene('leaderboard')}
            style={{
              background: activeScene === 'leaderboard' ? '#45a29e' : 'linear-gradient(180deg, #333 0%, #111 100%)',
              border: '1px solid #45a29e',
              color: activeScene === 'leaderboard' ? '#000' : '#45a29e',
              padding: '12px 25px',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '5px',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
            }}
          >
            Leaderboard
          </button>
          <button
            onClick={() => showScene('buygmb')}
            style={{
              background: activeScene === 'buygmb' ? '#45a29e' : 'linear-gradient(180deg, #333 0%, #111 100%)',
              border: '1px solid #45a29e',
              color: activeScene === 'buygmb' ? '#000' : '#45a29e',
              padding: '12px 25px',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '5px',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
            }}
          >
            Buy GMB
          </button>
          <button
            onClick={() => showScene('shopify')}
            style={{
              background: activeScene === 'shopify' ? '#45a29e' : 'linear-gradient(180deg, #333 0%, #111 100%)',
              border: '1px solid #45a29e',
              color: activeScene === 'shopify' ? '#000' : '#45a29e',
              padding: '12px 25px',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '5px',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
            }}
          >
            Alien Gear
          </button>
          <button
            onClick={() => showScene('socials')}
            style={{
              background: activeScene === 'socials' ? '#45a29e' : 'linear-gradient(180deg, #333 0%, #111 100%)',
              border: '1px solid #45a29e',
              color: activeScene === 'socials' ? '#000' : '#45a29e',
              padding: '12px 25px',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '5px',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
            }}
          >
            Socials
          </button>
          <button
            onClick={() => showScene('support')}
            style={{
              background: activeScene === 'support' ? '#45a29e' : 'linear-gradient(180deg, #333 0%, #111 100%)',
              border: '1px solid #45a29e',
              color: activeScene === 'support' ? '#000' : '#45a29e',
              padding: '12px 25px',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '5px',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
            }}
          >
            Support
          </button>
          {isConnected && (
            <button
              onClick={handleAdminClick}
              style={{
                background: 'linear-gradient(180deg, #333 0%, #111 100%)',
                border: '1px solid #45a29e',
                color: '#45a29e',
                padding: '12px 25px',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                cursor: 'pointer',
                borderRadius: '5px',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
              }}
            >
              Admin
            </button>
          )}
          <button
            onClick={() => {
              playSound('click');
              setReferralDrawerOpen(true);
            }}
            style={{
              background: 'linear-gradient(180deg, #443a00 0%, #221d00 100%)',
              border: '1px solid #ffd700',
              color: '#ffd700',
              padding: '12px 25px',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '5px',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
            }}
          >
            Referrals
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
          }}>
            UNAUTHORIZED - Admin access only
          </div>
        )}

        {/* Content Area */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px'
        }}>
          {/* Scene 1: Portals */}
          {activeScene === 'portals' && (
            <div style={{ position: 'relative', width: '100%', minHeight: '500px' }}>
              {/* Portal Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                maxWidth: '700px',
                margin: '50px auto',
                gap: '30px'
              }}>
                {/* Blue Portal - Base Games */}
                <Link
                  href="/base"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  style={{
                    background: 'rgba(11, 12, 16, 0.7)',
                    border: '2px solid #45a29e',
                    borderRadius: '15px',
                    padding: '20px',
                    transition: 'transform 0.3s, background 0.3s',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backdropFilter: 'blur(5px)',
                    color: '#00d9ff'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.background = 'rgba(11, 12, 16, 0.9)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = 'rgba(11, 12, 16, 0.7)';
                  }}
                >
                  <img src="/blueportal.png" alt="Base Games" style={{
                    width: '100%',
                    maxWidth: '180px',
                    height: 'auto',
                    borderRadius: '50%',
                    boxShadow: '0 0 30px #00d9ff',
                    border: '4px solid rgba(255,255,255,0.1)',
                    display: 'block',
                    margin: '0 auto 15px auto'
                  }} />
                  <span style={{
                    display: 'inline-block',
                    padding: '5px 15px',
                    background: '#000',
                    border: '1px solid #00d9ff',
                    borderRadius: '5px',
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    textShadow: '0 0 5px #00d9ff',
                    textTransform: 'uppercase'
                  }}>
                    Base Games
                  </span>
                </Link>

                {/* Grey Portal - Alien Drip */}
                <div
                  onClick={() => showScene('drip')}
                  onMouseEnter={() => playSound('hover')}
                  style={{
                    background: 'rgba(11, 12, 16, 0.7)',
                    border: '2px solid #45a29e',
                    borderRadius: '15px',
                    padding: '20px',
                    transition: 'transform 0.3s, background 0.3s',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backdropFilter: 'blur(5px)',
                    color: '#e0e0e0'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.background = 'rgba(11, 12, 16, 0.9)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = 'rgba(11, 12, 16, 0.7)';
                  }}
                >
                  <img src="/greyportal.png" alt="Alien Drip" style={{
                    width: '100%',
                    maxWidth: '180px',
                    height: 'auto',
                    borderRadius: '50%',
                    boxShadow: '0 0 30px #e0e0e0',
                    border: '4px solid rgba(255,255,255,0.1)',
                    display: 'block',
                    margin: '0 auto 15px auto'
                  }} />
                  <span style={{
                    display: 'inline-block',
                    padding: '5px 15px',
                    background: '#000',
                    border: '1px solid #e0e0e0',
                    borderRadius: '5px',
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    textShadow: '0 0 5px #e0e0e0',
                    textTransform: 'uppercase'
                  }}>
                    Alien Drip
                  </span>
                </div>

                {/* Green Portal - Leaderboard */}
                <div
                  onClick={() => showScene('leaderboard')}
                  onMouseEnter={() => playSound('hover')}
                  style={{
                    background: 'rgba(11, 12, 16, 0.7)',
                    border: '2px solid #45a29e',
                    borderRadius: '15px',
                    padding: '20px',
                    transition: 'transform 0.3s, background 0.3s',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backdropFilter: 'blur(5px)',
                    color: '#00ff41'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.background = 'rgba(11, 12, 16, 0.9)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = 'rgba(11, 12, 16, 0.7)';
                  }}
                >
                  <img src="/greenportal.png" alt="Leaderboard" style={{
                    width: '100%',
                    maxWidth: '180px',
                    height: 'auto',
                    borderRadius: '50%',
                    boxShadow: '0 0 30px #00ff41',
                    border: '4px solid rgba(255,255,255,0.1)',
                    display: 'block',
                    margin: '0 auto 15px auto'
                  }} />
                  <span style={{
                    display: 'inline-block',
                    padding: '5px 15px',
                    background: '#000',
                    border: '1px solid #00ff41',
                    borderRadius: '5px',
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    textShadow: '0 0 5px #00ff41',
                    textTransform: 'uppercase'
                  }}>
                    Leaderboard
                  </span>
                </div>

                {/* Red Portal - Credits */}
                <Link
                  href="/credits"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  style={{
                    background: 'rgba(11, 12, 16, 0.7)',
                    border: '2px solid #45a29e',
                    borderRadius: '15px',
                    padding: '20px',
                    transition: 'transform 0.3s, background 0.3s',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backdropFilter: 'blur(5px)',
                    color: '#ff003c'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.background = 'rgba(11, 12, 16, 0.9)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = 'rgba(11, 12, 16, 0.7)';
                  }}
                >
                  <img src="/redportal.png" alt="Credits" style={{
                    width: '100%',
                    maxWidth: '180px',
                    height: 'auto',
                    borderRadius: '50%',
                    boxShadow: '0 0 30px #ff003c',
                    border: '4px solid rgba(255,255,255,0.1)',
                    display: 'block',
                    margin: '0 auto 15px auto'
                  }} />
                  <span style={{
                    display: 'inline-block',
                    padding: '5px 15px',
                    background: '#000',
                    border: '1px solid #ff003c',
                    borderRadius: '5px',
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    textShadow: '0 0 5px #ff003c',
                    textTransform: 'uppercase'
                  }}>
                    Credits
                  </span>
                </Link>
              </div>
            </div>
          )}

          {/* Scene 2: Drip */}
          {activeScene === 'drip' && (
            <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
              <h2 style={{
                fontSize: '2.5rem',
                color: '#66fcf1',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                textShadow: '0 0 20px #66fcf1',
                marginBottom: '20px'
              }}>
                Drip Station
              </h2>
              <div style={{
                fontSize: '1rem',
                color: '#00ff99',
                textAlign: 'center',
                marginBottom: '30px'
              }}>
                Claim all drips here - free and earned
              </div>
              <AlienDripStation />
            </div>
          )}

          {/* Scene 3: Leaderboard */}
          {activeScene === 'leaderboard' && (
            <div style={{ padding: '20px' }}>
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
              minHeight: '400px',
              gap: '30px'
            }}>
              <h2 style={{
                fontSize: '2.5rem',
                color: '#66fcf1',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                textShadow: '0 0 20px #66fcf1'
              }}>
                Buy GMB Token
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
                    background: 'linear-gradient(0deg, #005566 0%, #00aacc 100%)',
                    border: '3px solid #00ffea',
                    borderRadius: '8px',
                    color: '#000',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    boxShadow: '0 0 20px #00ffea, inset 0 0 10px rgba(0,255,234,0.3)',
                    transition: 'all 0.3s'
                  }}
                >
                  Buy GMB on Base
                </a>
                <img src="/zorb.png" alt="Zorb" style={{ width: '60px', height: '60px' }} />
              </div>
              <p style={{
                color: '#00ffea',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                LIVE NOW
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
              minHeight: '400px',
              padding: '40px'
            }}>
              <h2 style={{
                fontSize: '2.5rem',
                color: '#66fcf1',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                textShadow: '0 0 20px #66fcf1',
                marginBottom: '30px'
              }}>
                Alien Gear Shop
              </h2>
              <div style={{
                background: 'rgba(0,0,0,0.6)',
                border: '2px solid #333',
                borderRadius: '20px',
                padding: '40px',
                textAlign: 'center',
                maxWidth: '500px'
              }}>
                <h3 style={{
                  color: '#ffd700',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  marginBottom: '20px',
                  textShadow: '0 0 20px #ffd700'
                }}>
                  COMING SOON!
                </h3>
                <div style={{ fontSize: '1.1rem', color: '#00ff99', lineHeight: '2' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Win Exclusive Alien Gear!</p>
                  <p>Get Shopify discount codes</p>
                  <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#00ff99', marginTop: '10px' }}>
                    Pay Shipping & Handling ONLY!
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
              minHeight: '400px',
              gap: '30px'
            }}>
              <h2 style={{
                fontSize: '2.5rem',
                color: '#66fcf1',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                textShadow: '0 0 20px #66fcf1'
              }}>
                Social Links
              </h2>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a
                  href="https://x.com/gumbuogw3"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  style={{
                    padding: '15px 30px',
                    background: 'linear-gradient(0deg, #005566 0%, #00aacc 100%)',
                    border: '2px solid #00ffea',
                    borderRadius: '8px',
                    color: '#000',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    boxShadow: '0 0 15px #00ffea',
                  }}
                >
                  Twitter
                </a>
                <a
                  href="https://discord.gg/NptkDYn8fm"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  style={{
                    padding: '15px 30px',
                    background: 'linear-gradient(0deg, #004422 0%, #00aa66 100%)',
                    border: '2px solid #00ff41',
                    borderRadius: '8px',
                    color: '#000',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    boxShadow: '0 0 15px #00ff41',
                  }}
                >
                  Discord
                </a>
              </div>
              <div style={{
                background: 'rgba(255, 165, 0, 0.1)',
                border: '2px solid rgba(255, 165, 0, 0.5)',
                borderRadius: '10px',
                padding: '20px',
                maxWidth: '500px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#ffeb3b', fontSize: '1rem', lineHeight: '1.8', fontWeight: 'bold' }}>
                  FOR SUPPORT: PM FoxHole or AlienOG on Discord or Twitter.
                  <br />
                  <span style={{ color: '#ff5555', fontSize: '1.1rem' }}>WE WILL NEVER PM YOU FIRST</span>
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
              minHeight: '400px',
              gap: '30px'
            }}>
              <h2 style={{
                fontSize: '2.5rem',
                color: '#66fcf1',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                textShadow: '0 0 20px #66fcf1'
              }}>
                Support & Safety
              </h2>
              <div style={{
                background: 'rgba(255, 165, 0, 0.1)',
                border: '2px solid rgba(255, 165, 0, 0.5)',
                borderRadius: '10px',
                padding: '30px',
                maxWidth: '600px',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <p style={{ color: '#ffeb3b', fontSize: '1.1rem', lineHeight: '2', fontWeight: 'bold' }}>
                  FOR SUPPORT: PM FoxHole or AlienOG on Discord or Twitter.
                  <br />
                  <span style={{ color: '#ff5555', fontSize: '1.3rem' }}>WE WILL NEVER PM YOU FIRST</span>
                  <br />
                  You must trigger support for a response. BE SAFE!
                </p>
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a
                  href="https://x.com/gumbuogw3"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  style={{
                    padding: '15px 30px',
                    background: 'linear-gradient(0deg, #005566 0%, #00aacc 100%)',
                    border: '2px solid #00ffea',
                    borderRadius: '8px',
                    color: '#000',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    boxShadow: '0 0 15px #00ffea',
                  }}
                >
                  Twitter Support
                </a>
                <a
                  href="https://discord.gg/NptkDYn8fm"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  style={{
                    padding: '15px 30px',
                    background: 'linear-gradient(0deg, #004422 0%, #00aa66 100%)',
                    border: '2px solid #00ff41',
                    borderRadius: '8px',
                    color: '#000',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    boxShadow: '0 0 15px #00ff41',
                  }}
                >
                  Discord Support
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Music Player at Bottom */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#000',
        border: '2px solid #00ff41',
        padding: '10px 20px',
        borderRadius: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)',
        zIndex: 100
      }}>
        <GlobalMusicPlayer />
      </div>

      {/* Referral Drawer */}
      {mounted && <ReferralDrawer isOpen={referralDrawerOpen} setIsOpen={setReferralDrawerOpen} />}
    </>
  );
}
