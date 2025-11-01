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
              {/* Floating Blockchain Portals using portal PNG images */}
              <Link href="/base" className="portal-floating base">
                <img src="/blueportal.png" alt="Base Chain" className="portal-image" />
                <div className="portal-label">BASE</div>
              </Link>

              <Link href="/abstract" className="portal-floating abstract">
                <img src="/greenportal.png" alt="Abstract Chain" className="portal-image" />
                <div className="portal-label">ABSTRACT</div>
              </Link>

              <Link href="/blast" className="portal-floating blast">
                <img src="/greyportal.png" alt="Blast Chain" className="portal-image" />
                <div className="portal-label">BLAST</div>
              </Link>

              <Link href="/arbitrum" className="portal-floating arbitrum">
                <img src="/redportal.png" alt="Arbitrum Chain" className="portal-image" />
                <div className="portal-label">ARBITRUM</div>
              </Link>
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
          <div className="warning-light" style={{top: '20px', left: '50px'}}></div>
          <div className="warning-light" style={{top: '20px', right: '50px'}}></div>
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
          <div className="rivet" style={{top: '20px', right: '20px'}}></div>
          <div className="rivet" style={{top: '50%', right: '20px'}}></div>
          <div className="rivet" style={{bottom: '20px', right: '20px'}}></div>
          <div className="circuit-line" style={{top: '30%', width: '70%', right: '10%'}}></div>

          <div style={{position: 'absolute', top: '50%', right: '12%', width: '75%', transform: 'translateY(-50%)'}}>
            <button
              className={`control-btn ${activeScene === 'portals' ? 'active' : ''}`}
              onClick={() => showScene('portals')}
              onMouseEnter={() => playSound('hover')}
            >
              <span className="btn-icon">🌀</span> PORTALS
              <span className="btn-status"></span>
            </button>
            <button
              className={`control-btn ${activeScene === 'drip' ? 'active' : ''}`}
              onClick={() => showScene('drip')}
              onMouseEnter={() => playSound('hover')}
            >
              <span className="btn-icon">💧</span> DRIP
              <span className="btn-status"></span>
            </button>
            <button
              className={`control-btn ${activeScene === 'leaderboard' ? 'active' : ''}`}
              onClick={() => showScene('leaderboard')}
              onMouseEnter={() => playSound('hover')}
            >
              <span className="btn-icon">🏆</span> LEADERBOARD
              <span className="btn-status"></span>
            </button>
          </div>
        </div>

        {/* Right Side Panel with Buttons */}
        <div className="right-panel steel-panel steel-brushed">
          <div className="rivet" style={{top: '20px', left: '20px'}}></div>
          <div className="rivet" style={{top: '50%', left: '20px'}}></div>
          <div className="rivet" style={{bottom: '20px', left: '20px'}}></div>
          <div className="circuit-line" style={{top: '30%', width: '70%', left: '10%'}}></div>

          <div style={{position: 'absolute', top: '50%', left: '12%', width: '75%', transform: 'translateY(-50%)'}}>
            <button
              className={`control-btn ${activeScene === 'shopify' ? 'active' : ''}`}
              onClick={() => showScene('shopify')}
              onMouseEnter={() => playSound('hover')}
            >
              <span className="btn-icon">🛒</span> SHOP
              <span className="btn-status"></span>
            </button>
            <button
              className={`control-btn ${activeScene === 'socials' ? 'active' : ''}`}
              onClick={() => showScene('socials')}
              onMouseEnter={() => playSound('hover')}
            >
              <span className="btn-icon">🌐</span> SOCIALS
              <span className="btn-status"></span>
            </button>
            <button
              className={`control-btn ${activeScene === 'support' ? 'active' : ''}`}
              onClick={() => showScene('support')}
              onMouseEnter={() => playSound('hover')}
            >
              <span className="btn-icon">🔒</span> SUPPORT
              <span className="btn-status"></span>
            </button>
          </div>
        </div>

        {/* Front Console with MAIN CONTROLS */}
        <div className="front-console steel-brushed">
          <div className="rivet" style={{top: '30px', left: '30px'}}></div>
          <div className="rivet" style={{top: '30px', right: '30px'}}></div>
          <div className="rivet" style={{bottom: '40px', left: '30px'}}></div>
          <div className="rivet" style={{bottom: '40px', right: '30px'}}></div>
          <div className="circuit-line" style={{top: '20%', width: '80%', left: '10%'}}></div>

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
              className={`control-btn ${activeScene === 'buygmb' ? 'active' : ''}`}
              onClick={() => showScene('buygmb')}
              onMouseEnter={() => playSound('hover')}
              style={{flex: '1', minWidth: '140px', padding: '15px 20px', fontSize: '0.95rem'}}
            >
              <span className="btn-icon">💰</span> BUY GMB
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
          width: 60%;
          height: 60%;
          background: #000;
          border: 12px solid #7a7a85;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 0 50px rgba(0, 255, 255, 0.4), inset 0 0 50px rgba(0, 0, 0, 0.9), 0 20px 40px rgba(0, 0, 0, 0.8);
        }

        .viewport-scene {
          width: 100%;
          height: 100%;
          position: relative;
          transition: opacity 0.5s;
        }

        .viewport-scene.hidden {
          display: none;
        }

        /* Space Scene */
        .space-scene {
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at center, #0a0a2e 0%, #000000 100%);
          position: relative;
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

        /* Floating Blockchain Portals using PNG images */
        .portal-floating {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          animation: portalFloat 4s ease-in-out infinite;
          border: 2px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.6);
          overflow: hidden;
        }

        @keyframes portalFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.1); }
        }

        .portal-floating:hover {
          transform: scale(1.3) !important;
          z-index: 10;
          box-shadow: 0 0 60px rgba(0, 255, 255, 1);
        }

        .portal-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .portal-label {
          position: absolute;
          bottom: -25px;
          font-size: 0.7rem;
          font-weight: bold;
          text-transform: uppercase;
          color: #fff;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.6);
          background: rgba(0, 0, 0, 0.9);
          padding: 3px 10px;
          border-radius: 4px;
          border: 2px solid #00ffff;
          white-space: nowrap;
        }

        .portal-floating.base {
          top: 10%;
          left: 8%;
          animation-delay: 0s;
        }

        .portal-floating.blast {
          top: 10%;
          right: 8%;
          animation-delay: 1s;
        }

        .portal-floating.abstract {
          bottom: 10%;
          left: 8%;
          animation-delay: 2s;
        }

        .portal-floating.arbitrum {
          bottom: 10%;
          right: 8%;
          animation-delay: 1.5s;
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
          width: 25%;
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
          width: 25%;
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
          left: 25%;
          width: 50%;
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
          left: 20%;
          width: 60%;
          height: 25%;
          background: linear-gradient(180deg, #9a9aa5 0%, #6a6a75 50%, #5a5a65 100%);
          transform-origin: center top;
          transform: perspective(600px) rotateX(30deg);
          border-top: 8px solid #7a7a85;
          border-radius: 20px 20px 0 0;
          box-shadow: inset 0 10px 30px rgba(0, 0, 0, 0.6), 0 -20px 50px rgba(0, 0, 0, 0.8);
          z-index: 10;
        }

        .rivet {
          position: absolute;
          width: 10px;
          height: 10px;
          background: radial-gradient(circle, #888, #333);
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3);
        }

        /* Physical Control Buttons */
        .control-btn {
          padding: 14px 22px;
          background: linear-gradient(180deg, #9a9aa5, #6a6a75);
          border: none;
          border-radius: 6px;
          color: #000;
          font-size: 0.9rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          margin: 10px 0;
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
          font-size: 1.2rem;
          margin-right: 5px;
        }

        .btn-status {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 8px;
          height: 8px;
          background: #00ff00;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(0, 255, 0, 0.8);
          animation: blink 2s infinite;
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
          .left-panel, .right-panel { width: 20%; }
          .main-viewport { width: 60%; }
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
