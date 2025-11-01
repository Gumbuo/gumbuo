"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCosmicSound } from "./hooks/useCosmicSound";

const AlienLeaderboard = dynamic(() => import("./components/AlienLeaderboard"), { ssr: false });
const AlienDripStation = dynamic(() => import("./components/AlienDripStation"), { ssr: false });
const AlienHUD = dynamic(() => import("@lib/hud").then(mod => mod.AlienHUD), { ssr: false });

type Scene = "portals" | "drip" | "leaderboard" | "buygmb" | "shopify" | "socials" | "support";

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
        {/* Top Right - Connect Button and HUD */}
        <div style={{position: 'fixed', top: '24px', right: '24px', zIndex: 100}} className="flex flex-col items-end space-y-4">
          {/* Wallet Connect Button with Alien Styling */}
          <div style={{
            borderRadius: '8px',
            border: '2px solid #00ff9944'
          }} className="holographic-panel glass-panel p-4">
            <div className="corner-glow corner-glow-tl"></div>
            <div className="corner-glow corner-glow-tr"></div>
            <div className="corner-glow corner-glow-bl"></div>
            <div className="corner-glow corner-glow-br"></div>
            <div className="relative z-10">
              <ConnectButton />
            </div>
          </div>

          {/* Alien HUD */}
          <AlienHUD />
        </div>

        {/* Central Viewport Window */}
        <div className="main-viewport">
          {/* Scene 1: Space with Floating Portals (DEFAULT) */}
          <div id="scene-portals" className={`viewport-scene ${activeScene !== 'portals' ? 'hidden' : ''}`}>
            <div className="space-scene" id="space-scene">
              {/* Header */}
              <h1 className="portals-header">Gumbuo's Blockchain Portals</h1>

              {/* Centered Portal Grid */}
              <div className="portals-grid">
                <Link href="/base" className="portal-item">
                  <img src="/blueportal.png" alt="Base Chain" className="portal-image" />
                  <div className="portal-label">BASE</div>
                </Link>

                <Link href="/blast" className="portal-item">
                  <img src="/greyportal.png" alt="Blast Chain" className="portal-image" />
                  <div className="portal-label">BLAST</div>
                </Link>

                <Link href="/abstract" className="portal-item">
                  <img src="/greenportal.png" alt="Abstract Chain" className="portal-image" />
                  <div className="portal-label">ABSTRACT</div>
                </Link>

                <Link href="/arbitrum" className="portal-item">
                  <img src="/redportal.png" alt="Arbitrum Chain" className="portal-image" />
                  <div className="portal-label">ARBITRUM</div>
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

        {/* Left Side Panel with Buttons */}
        <div className="left-panel steel-panel steel-brushed">
          <div className="rivet rivet-red" style={{top: '20px', right: '20px'}}></div>
          <div className="rivet rivet-red" style={{top: '15%', right: '15px'}}></div>
          <div className="rivet rivet-red" style={{top: '35%', right: '25px'}}></div>
          <div className="rivet rivet-red" style={{top: '50%', right: '20px'}}></div>
          <div className="rivet rivet-red" style={{top: '60%', right: '30px'}}></div>
          <div className="rivet rivet-red" style={{bottom: '30%', right: '18px'}}></div>
          <div className="rivet rivet-red" style={{bottom: '20px', right: '20px'}}></div>
          <div className="circuit-line" style={{top: '30%', width: '70%', right: '10%'}}></div>
        </div>

        {/* Right Side Panel with Buttons */}
        <div className="right-panel steel-panel steel-brushed">
          <div className="rivet rivet-red" style={{top: '20px', left: '20px'}}></div>
          <div className="rivet rivet-red" style={{top: '18%', left: '28px'}}></div>
          <div className="rivet rivet-red" style={{top: '40%', left: '15px'}}></div>
          <div className="rivet rivet-red" style={{top: '50%', left: '20px'}}></div>
          <div className="rivet rivet-red" style={{top: '65%', left: '25px'}}></div>
          <div className="rivet rivet-red" style={{bottom: '25%', left: '18px'}}></div>
          <div className="rivet rivet-red" style={{bottom: '20px', left: '20px'}}></div>
          <div className="circuit-line" style={{top: '30%', width: '70%', left: '10%'}}></div>
        </div>

        {/* Front Console with MAIN CONTROLS */}
        <div className="front-console steel-brushed">
          {/* 4 Corner Red Lights */}
          <div className="rivet rivet-red" style={{top: '30px', left: '30px'}}></div>
          <div className="rivet rivet-red" style={{top: '30px', right: '30px'}}></div>
          <div className="rivet rivet-red" style={{bottom: '40px', left: '30px'}}></div>
          <div className="rivet rivet-red" style={{bottom: '40px', right: '30px'}}></div>

          {/* Center - Alien Hourglass */}
          <div className="alien-hourglass" style={{position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)'}}>
            <svg width="50" height="70" viewBox="0 0 50 70">
              {/* Top bulb */}
              <ellipse cx="25" cy="15" rx="18" ry="12" fill="rgba(0,255,153,0.3)" stroke="#00ff99" strokeWidth="2"/>
              {/* Bottom bulb */}
              <ellipse cx="25" cy="55" rx="18" ry="12" fill="rgba(0,255,153,0.6)" stroke="#00ff99" strokeWidth="2"/>
              {/* Narrow middle */}
              <path d="M 15 25 L 25 35 L 35 25 M 15 45 L 25 35 L 35 45" fill="none" stroke="#00ff99" strokeWidth="2"/>
              {/* Frame */}
              <rect x="5" y="5" width="40" height="15" fill="none" stroke="#666" strokeWidth="2" rx="2"/>
              <rect x="5" y="50" width="40" height="15" fill="none" stroke="#666" strokeWidth="2" rx="2"/>
              {/* Liquid flow */}
              <circle className="liquid-drop" cx="25" cy="20" r="3" fill="#00ff99" opacity="0.8"/>
            </svg>
          </div>

          <div style={{
            position: 'absolute',
            bottom: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              className={`control-btn ${activeScene === 'portals' ? 'active' : ''}`}
              onClick={() => showScene('portals')}
              onMouseEnter={() => playSound('hover')}
            >
              PORTALS
              <span className="btn-status"></span>
            </button>
            <button
              className={`control-btn ${activeScene === 'drip' ? 'active' : ''}`}
              onClick={() => showScene('drip')}
              onMouseEnter={() => playSound('hover')}
            >
              ALIEN DRIP
              <span className="btn-status"></span>
            </button>
            <button
              className={`control-btn ${activeScene === 'leaderboard' ? 'active' : ''}`}
              onClick={() => showScene('leaderboard')}
              onMouseEnter={() => playSound('hover')}
            >
              LEADERBOARD
              <span className="btn-status"></span>
            </button>
            <button
              className={`control-btn ${activeScene === 'support' ? 'active' : ''}`}
              onClick={() => showScene('support')}
              onMouseEnter={() => playSound('hover')}
            >
              SUPPORT
              <span className="btn-status"></span>
            </button>
            <button
              className={`control-btn ${activeScene === 'buygmb' ? 'active' : ''}`}
              onClick={() => showScene('buygmb')}
              onMouseEnter={() => playSound('hover')}
            >
              BUY GMB
              <span className="btn-status"></span>
            </button>
            <button
              className={`control-btn ${activeScene === 'shopify' ? 'active' : ''}`}
              onClick={() => showScene('shopify')}
              onMouseEnter={() => playSound('hover')}
            >
              ALIEN GEAR
              <span className="btn-status"></span>
            </button>
            <button
              className={`control-btn ${activeScene === 'socials' ? 'active' : ''}`}
              onClick={() => showScene('socials')}
              onMouseEnter={() => playSound('hover')}
            >
              SOCIALS
              <span className="btn-status"></span>
            </button>
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
          top: 8%;
          left: 50%;
          transform: translateX(-50%);
          width: 70%;
          height: 68%;
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
          background: radial-gradient(ellipse at center, #0a0a2e 0%, #000000 100%);
          position: absolute;
          top: 0;
          left: 0;
          animation: spaceFloat 60s linear infinite;
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
          background: #0099ff;
          color: #fff;
        }

        .portal-item:nth-child(2) .portal-label {
          background: #888888;
          color: #fff;
        }

        .portal-item:nth-child(3) .portal-label {
          background: #00ff99;
          color: #000;
        }

        .portal-item:nth-child(4) .portal-label {
          background: #ff4444;
          color: #fff;
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
          height: 25%;
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

        /* Physical Control Buttons */
        .control-btn {
          padding: 8px 12px;
          background: linear-gradient(180deg, #9a9aa5, #6a6a75);
          border: none;
          border-radius: 4px;
          color: #000;
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s;
          width: auto;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin: 6px 0;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .control-btn:hover {
          background: linear-gradient(180deg, #aaaaaf, #7a7a85);
          transform: translateY(-2px);
          box-shadow: 0 5px 12px rgba(0, 255, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        .control-btn:active {
          transform: translateY(2px);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.8), inset 0 2px 5px rgba(0, 0, 0, 0.5);
        }

        .control-btn.active {
          background: linear-gradient(180deg, #00ffff, #0099cc);
          color: #000;
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.8), inset 0 2px 5px rgba(255, 255, 255, 0.5);
        }

        .btn-icon {
          font-size: 1rem;
        }

        .btn-status {
          width: 6px;
          height: 6px;
          background: #00ff00;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(0, 255, 0, 0.8);
          animation: blink 2s infinite;
          flex-shrink: 0;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
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
