"use client";
import Link from "next/link";
import { useState } from "react";
import { useCosmicSound } from "../hooks/useCosmicSound";

export default function CreditsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { playSound } = useCosmicSound();

  // Credits data - you can add more as you purchase more assets
  const credits = {
    "Alien Catacombs": {
      icon: "👾",
      color: "#00d4ff",
      assets: [
        {
          name: "Zelda Futuristic Asset Pack",
          creator: "Deakcor",
          url: "https://deakcor.itch.io/",
          description: "Complete tileset and sprites used in Alien Catacombs, including dungeon floors, walls, decorations, and character sprites. Follow on Twitter: @deakcor"
        },
        {
          name: "LPC Character Sprites",
          creator: "bluecarrot16, JaidynReiman, Benjamin K. Smith, Evert, Eliza Wyatt, TheraHedwig, MuffinElZangano, Durrani, Johannes Sjölund, Stephen Challener & OpenGameArt Community",
          url: "https://opengameart.org/content/lpc-character-bases",
          description: "Liberated Pixel Cup (LPC) character base assets and sprite sheets used for player and enemy characters. Licensed under OGA-BY 3.0, CC-BY-SA 3.0, GPL 3.0"
        }
      ]
    },
    "Gumbuo Fighters": {
      icon: "🥊",
      color: "#00ff99",
      assets: [
        {
          name: "Fighter Sprites",
          creator: "TBD",
          url: "",
          description: "Character sprites for all fighters"
        }
      ]
    },
    "Other Games": {
      icon: "🎮",
      color: "#ff3366",
      assets: [
        {
          name: "General Game Assets",
          creator: "TBD",
          url: "",
          description: "Various sprites and tiles used across multiple games"
        }
      ]
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'auto'
    }}>
      {/* Animated Background Stars */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.3
      }}>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              background: 'white',
              borderRadius: '50%',
              animation: `starTwinkle ${Math.random() * 3 + 2}s infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Back Button */}
      <Link
        href="/"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '12px 24px',
          background: 'linear-gradient(135deg, rgba(0, 153, 204, 0.8), rgba(0, 119, 153, 0.8))',
          border: '2px solid #00d4ff',
          borderRadius: '8px',
          color: '#00ffff',
          textDecoration: 'none',
          fontFamily: 'Orbitron, sans-serif',
          fontWeight: 'bold',
          fontSize: '14px',
          textTransform: 'uppercase',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
          transition: 'all 0.3s ease',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          playSound('hover');
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 212, 255, 0.95), rgba(0, 153, 204, 0.95))';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 153, 204, 0.8), rgba(0, 119, 153, 0.8))';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        ← Back to Mothership
      </Link>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px',
          marginTop: '60px'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            color: '#00ffff',
            textShadow: '0 0 30px rgba(0, 255, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.4)',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '4px',
            marginBottom: '20px',
            animation: 'pulse 3s ease-in-out infinite'
          }}>
            🎨 Asset Credits 🎨
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#00ff99',
            fontFamily: 'Orbitron, sans-serif',
            textShadow: '0 0 10px rgba(0, 255, 153, 0.5)'
          }}>
            Special thanks to all the talented creators whose assets bring Gumbuo to life
          </p>
        </div>

        {/* Categories Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {Object.entries(credits).map(([category, data]) => (
            <div
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              style={{
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(138, 43, 226, 0.1))',
                border: `3px solid ${data.color}`,
                borderRadius: '15px',
                padding: '30px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: selectedCategory === category
                  ? `0 0 30px ${data.color}, inset 0 0 20px rgba(0, 212, 255, 0.1)`
                  : `0 0 15px ${data.color}80`,
                transform: selectedCategory === category ? 'scale(1.02)' : 'scale(1)',
              }}
              onMouseEnter={(e) => {
                playSound('hover');
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 0 30px ${data.color}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = selectedCategory === category ? 'scale(1.02)' : 'scale(1)';
                e.currentTarget.style.boxShadow = selectedCategory === category
                  ? `0 0 30px ${data.color}, inset 0 0 20px rgba(0, 212, 255, 0.1)`
                  : `0 0 15px ${data.color}80`;
              }}
            >
              <div style={{
                fontSize: '3rem',
                textAlign: 'center',
                marginBottom: '15px',
                animation: 'float 3s ease-in-out infinite',
                animationDelay: `${Math.random()}s`
              }}>
                {data.icon}
              </div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: data.color,
                textAlign: 'center',
                fontFamily: 'Orbitron, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textShadow: `0 0 15px ${data.color}`,
                marginBottom: '15px'
              }}>
                {category}
              </h2>
              <p style={{
                textAlign: 'center',
                color: '#00ffff',
                fontSize: '0.9rem',
                fontFamily: 'Orbitron, sans-serif'
              }}>
                {data.assets.length} asset{data.assets.length !== 1 ? 's' : ''} • Click to expand
              </p>
            </div>
          ))}
        </div>

        {/* Expanded Category Details */}
        {selectedCategory && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 153, 204, 0.15), rgba(138, 43, 226, 0.15))',
            border: `3px solid ${credits[selectedCategory as keyof typeof credits].color}`,
            borderRadius: '15px',
            padding: '40px',
            marginBottom: '40px',
            boxShadow: `0 0 40px ${credits[selectedCategory as keyof typeof credits].color}`,
            animation: 'fadeIn 0.3s ease-in'
          }}>
            <h3 style={{
              fontSize: '2rem',
              color: credits[selectedCategory as keyof typeof credits].color,
              fontFamily: 'Orbitron, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '30px',
              textAlign: 'center',
              textShadow: `0 0 20px ${credits[selectedCategory as keyof typeof credits].color}`
            }}>
              {selectedCategory} Assets
            </h3>

            <div style={{
              display: 'grid',
              gap: '20px'
            }}>
              {credits[selectedCategory as keyof typeof credits].assets.map((asset, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '2px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '10px',
                    padding: '25px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    playSound('hover');
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                    e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.6)';
                    e.currentTarget.style.transform = 'translateX(10px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <h4 style={{
                    fontSize: '1.3rem',
                    color: '#00ffff',
                    fontFamily: 'Orbitron, sans-serif',
                    marginBottom: '10px',
                    fontWeight: 'bold'
                  }}>
                    {asset.name}
                  </h4>
                  <p style={{
                    fontSize: '1rem',
                    color: '#00ff99',
                    marginBottom: '8px',
                    fontFamily: 'Orbitron, sans-serif'
                  }}>
                    <strong>Creator:</strong> {asset.creator}
                  </p>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#cccccc',
                    marginBottom: '12px',
                    lineHeight: '1.6'
                  }}>
                    {asset.description}
                  </p>
                  {asset.url && (
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #00ffff, #0099cc)',
                        color: '#000',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        fontFamily: 'Orbitron, sans-serif',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)'
                      }}
                      onMouseEnter={(e) => {
                        playSound('hover');
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 255, 255, 0.8)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.4)';
                      }}
                    >
                      Visit Creator →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div style={{
          textAlign: 'center',
          marginTop: '60px',
          padding: '30px',
          background: 'rgba(0, 212, 255, 0.1)',
          border: '2px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '12px'
        }}>
          <p style={{
            fontSize: '1.1rem',
            color: '#00ffff',
            fontFamily: 'Orbitron, sans-serif',
            lineHeight: '1.8'
          }}>
            💜 All assets are used with proper licensing and attribution. 💜
            <br />
            <span style={{ fontSize: '0.9rem', color: '#00ff99' }}>
              Supporting indie creators helps keep the game dev community thriving!
            </span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
