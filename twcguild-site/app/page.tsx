"use client";
import Link from "next/link";

const NOMSTEAD = {
  title: "NomStead",
  description:
    "Casual sandbox MMORPG where every player helps shape the world. Farm, craft, trade, and build your civilization on Immutable zkEVM — casually, on your phone, in your spare time.",
  color: "#4ade80",
  tags: ["Sandbox MMO", "Cozy", "Immutable"],
  playUrl: "https://play.immutable.com/games/nomstead/",
  guideUrl: "https://www.gamehole.games/nomstead",
  guideLabel: "NFT Guide",
  eventUrl: "/guildevents",
  eventLabel: "GUILD EVENT ACTIVE",
  toolUrl: "https://www.gamehole.games/nomstead/calculator",
  toolLabel: "Farm Calculator",
  tool2Url: "https://www.gamehole.games/nomstead/farms",
  tool2Label: "Farm Navigator",
  tool3Url: "https://www.gamehole.games/logfilter",
  tool3Label: "Log Filter",
  tool4Url: "https://docs.nomstead.com",
  tool4Label: "NomStead Docs",
};

const INFINITYRISING = {
  title: "Infinity Rising",
  description:
    "Open-world multiplayer RPG (formerly Cornucopias) on Cardano & Base. Race, build, craft, and earn $RISE. Multiple NFT collections including Land Zones and vehicles.",
  color: "#ff0033",
  tags: ["RPG", "Action", "Cardano", "Base", "$RISE"],
  playUrl: "https://infinityrising.io/",
  youtubeTrailer: "yZECO2nDyu8",
  guideUrl: "https://www.gamehole.games/infinityrising",
  guideLabel: "File Nodes & Token Guide",
};

const SPIDERTANKS = {
  title: "Spider Tanks: Cores of Chaos",
  description:
    "PvP brawler where you battle in arenas with customizable tanks. Revived by GAMEDIA on Immutable. Note: IMX questing indefinitely removed due to bot abuse.",
  color: "#ff6b00",
  tags: ["PvP", "Brawler", "Immutable"],
  playUrl: "https://play.immutable.com/games/spider-tanks-cores-of-chaos/",
  youtubeTrailer: "5Tyqhqp3GYI",
  guideUrl: "https://www.spidergang.xyz",
  guideLabel: "Spider Gang",
};

const ADVENTUREWURLD = {
  title: "AdventureWurld",
  description:
    "An adventure gaming world. Explore, battle, and discover what awaits.",
  color: "#a855f7",
  tags: ["Adventure", "Gaming"],
  playUrl: "https://adventurewurld.com/",
};

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0b0c10" }}>

      {/* Hero */}
      <div style={{
        position: "relative",
        minHeight: "100vh",
        backgroundImage: "url('/images/hero.png')",
        backgroundSize: "80%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: "60px",
      }}>
        {/* dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(11,12,16,0.3) 0%, rgba(11,12,16,0.6) 70%, rgba(11,12,16,1) 100%)",
        }} />

        {/* Nav */}
        <nav style={{
          position: "absolute", top: 0, left: 0, right: 0,
          padding: "20px 30px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          zIndex: 10,
        }}>
          <span style={{
            fontFamily: "Orbitron, sans-serif",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#fff",
            letterSpacing: "3px",
          }}>
            TWC GUILD
          </span>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/guildevents" style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: "12px",
              color: "#b44dff",
              textDecoration: "none",
              border: "1px solid #b44dff60",
              padding: "6px 14px",
              borderRadius: "6px",
            }}>
              GUILD EVENTS
            </Link>
          </div>
        </nav>

        {/* Hero CTA */}
        <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
          <Link
            href="/guildevents"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              background: "linear-gradient(135deg, rgba(180,77,255,0.9), rgba(142,45,226,0.9))",
              color: "#fff",
              fontFamily: "Orbitron, sans-serif",
              fontSize: "14px",
              fontWeight: "bold",
              letterSpacing: "2px",
              textDecoration: "none",
              borderRadius: "8px",
              boxShadow: "0 0 30px rgba(180,77,255,0.5)",
            }}
          >
            VIEW GUILD ACTIVITY →
          </Link>
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 20px" }}>
        <h2 style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "24px",
          color: "#fff",
          letterSpacing: "3px",
          textTransform: "uppercase",
          marginBottom: "40px",
          textAlign: "center",
        }}>
          Games We Enjoy
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "28px",
        }}>

          {/* NomStead Card */}
          <div style={{
            background: "linear-gradient(135deg, #0a1a10, #0b0c10)",
            border: `2px solid ${NOMSTEAD.color}40`,
            borderRadius: "16px",
            overflow: "hidden",
            transition: "all 0.3s ease",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = NOMSTEAD.color;
              e.currentTarget.style.boxShadow = `0 0 30px ${NOMSTEAD.color}40`;
              e.currentTarget.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${NOMSTEAD.color}40`;
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Banner */}
            <div style={{
              height: "180px",
              background: `linear-gradient(135deg, ${NOMSTEAD.color}30, #0a1a10)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              borderBottom: `1px solid ${NOMSTEAD.color}40`,
            }}>
              <span style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "36px",
                fontWeight: "bold",
                color: NOMSTEAD.color,
                letterSpacing: "4px",
                textShadow: `0 0 20px ${NOMSTEAD.color}`,
              }}>
                NomStead
              </span>
              {/* Pulsing event banner */}
              <a
                href={NOMSTEAD.eventUrl}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  bottom: 0, left: 0, right: 0,
                  padding: "10px 14px",
                  background: "linear-gradient(135deg, rgba(180,77,255,0.95), rgba(142,45,226,0.95))",
                  color: "#fff",
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "13px",
                  fontWeight: "bold",
                  textAlign: "center",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  animation: "eventPulse 2s ease-in-out infinite",
                }}
              >
                {NOMSTEAD.eventLabel}
                <style>{`@keyframes eventPulse { 0%, 100% { box-shadow: 0 0 15px rgba(180,77,255,0.6); } 50% { box-shadow: 0 0 30px rgba(180,77,255,0.9), 0 0 50px rgba(180,77,255,0.4); } }`}</style>
              </a>
            </div>

            <div style={{ padding: "20px" }}>
              <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "22px", color: NOMSTEAD.color, marginBottom: "10px" }}>
                {NOMSTEAD.title}
              </h3>
              <p style={{ fontFamily: "Share Tech Mono, monospace", color: "#aaa", fontSize: "14px", lineHeight: "1.6", marginBottom: "15px" }}>
                {NOMSTEAD.description}
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                {NOMSTEAD.tags.map((tag) => (
                  <span key={tag} style={{
                    padding: "4px 10px",
                    background: `${NOMSTEAD.color}20`,
                    border: `1px solid ${NOMSTEAD.color}40`,
                    borderRadius: "12px",
                    color: NOMSTEAD.color,
                    fontFamily: "Share Tech Mono, monospace",
                    fontSize: "11px",
                  }}>{tag}</span>
                ))}
              </div>

              <a href={NOMSTEAD.playUrl} target="_blank" rel="noopener noreferrer" style={{
                display: "block", width: "100%", padding: "12px",
                background: `${NOMSTEAD.color}20`, border: `2px solid ${NOMSTEAD.color}`,
                borderRadius: "8px", color: NOMSTEAD.color,
                fontFamily: "Orbitron, sans-serif", fontWeight: "bold", fontSize: "13px",
                textAlign: "center", textDecoration: "none", textTransform: "uppercase",
                marginBottom: "10px", boxSizing: "border-box",
              }}>
                ▶ PLAY NOW
              </a>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {[
                  { url: NOMSTEAD.guideUrl, label: NOMSTEAD.guideLabel },
                  { url: NOMSTEAD.toolUrl, label: NOMSTEAD.toolLabel },
                  { url: NOMSTEAD.tool2Url, label: NOMSTEAD.tool2Label },
                  { url: NOMSTEAD.tool3Url, label: NOMSTEAD.tool3Label },
                  { url: NOMSTEAD.tool4Url, label: NOMSTEAD.tool4Label },
                ].map(({ url, label }) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer" style={{
                    display: "block", padding: "8px",
                    background: `${NOMSTEAD.color}10`, border: `1px solid ${NOMSTEAD.color}40`,
                    borderRadius: "6px", color: NOMSTEAD.color,
                    fontFamily: "Share Tech Mono, monospace", fontSize: "11px",
                    textAlign: "center", textDecoration: "none",
                  }}>
                    {label} →
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Spider Tanks Card */}
          <div style={{
            background: "linear-gradient(135deg, #1a0a00, #0b0c10)",
            border: `2px solid ${SPIDERTANKS.color}40`,
            borderRadius: "16px",
            overflow: "hidden",
            transition: "all 0.3s ease",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = SPIDERTANKS.color;
              e.currentTarget.style.boxShadow = `0 0 30px ${SPIDERTANKS.color}40`;
              e.currentTarget.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${SPIDERTANKS.color}40`;
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* YouTube trailer */}
            <div style={{ height: "200px", borderBottom: `1px solid ${SPIDERTANKS.color}40`, overflow: "hidden" }}>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${SPIDERTANKS.youtubeTrailer}`}
                title="Spider Tanks Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: "none" }}
              />
            </div>

            <div style={{ padding: "20px" }}>
              <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "20px", color: SPIDERTANKS.color, marginBottom: "10px" }}>
                {SPIDERTANKS.title}
              </h3>
              <p style={{ fontFamily: "Share Tech Mono, monospace", color: "#aaa", fontSize: "14px", lineHeight: "1.6", marginBottom: "15px" }}>
                {SPIDERTANKS.description}
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                {SPIDERTANKS.tags.map((tag) => (
                  <span key={tag} style={{
                    padding: "4px 10px",
                    background: `${SPIDERTANKS.color}20`,
                    border: `1px solid ${SPIDERTANKS.color}40`,
                    borderRadius: "12px",
                    color: SPIDERTANKS.color,
                    fontFamily: "Share Tech Mono, monospace",
                    fontSize: "11px",
                  }}>{tag}</span>
                ))}
              </div>

              <a href={SPIDERTANKS.playUrl} target="_blank" rel="noopener noreferrer" style={{
                display: "block", width: "100%", padding: "12px",
                background: `${SPIDERTANKS.color}20`, border: `2px solid ${SPIDERTANKS.color}`,
                borderRadius: "8px", color: SPIDERTANKS.color,
                fontFamily: "Orbitron, sans-serif", fontWeight: "bold", fontSize: "13px",
                textAlign: "center", textDecoration: "none", textTransform: "uppercase",
                marginBottom: "10px", boxSizing: "border-box",
              }}>
                ▶ PLAY NOW
              </a>

              <a href={SPIDERTANKS.guideUrl} target="_blank" rel="noopener noreferrer" style={{
                display: "block", width: "100%", padding: "10px",
                background: `${SPIDERTANKS.color}10`, border: `1px solid ${SPIDERTANKS.color}40`,
                borderRadius: "6px", color: SPIDERTANKS.color,
                fontFamily: "Share Tech Mono, monospace", fontSize: "12px",
                textAlign: "center", textDecoration: "none", boxSizing: "border-box",
              }}>
                {SPIDERTANKS.guideLabel} →
              </a>
            </div>
          </div>

          {/* Infinity Rising Card */}
          <div style={{
            background: "linear-gradient(135deg, #1a1a1a, #0b0c10)",
            border: `2px solid ${INFINITYRISING.color}40`,
            borderRadius: "16px",
            overflow: "hidden",
            transition: "all 0.3s ease",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = INFINITYRISING.color;
              e.currentTarget.style.boxShadow = `0 0 30px ${INFINITYRISING.color}40`;
              e.currentTarget.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${INFINITYRISING.color}40`;
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* YouTube trailer */}
            <div style={{ height: "200px", borderBottom: `1px solid ${INFINITYRISING.color}40`, overflow: "hidden" }}>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${INFINITYRISING.youtubeTrailer}`}
                title="Infinity Rising Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: "none" }}
              />
            </div>

            <div style={{ padding: "20px" }}>
              <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "20px", color: INFINITYRISING.color, marginBottom: "10px" }}>
                {INFINITYRISING.title}
              </h3>
              <p style={{ fontFamily: "Share Tech Mono, monospace", color: "#aaa", fontSize: "14px", lineHeight: "1.6", marginBottom: "15px" }}>
                {INFINITYRISING.description}
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                {INFINITYRISING.tags.map((tag) => (
                  <span key={tag} style={{
                    padding: "4px 10px",
                    background: `${INFINITYRISING.color}20`,
                    border: `1px solid ${INFINITYRISING.color}40`,
                    borderRadius: "12px",
                    color: INFINITYRISING.color,
                    fontFamily: "Share Tech Mono, monospace",
                    fontSize: "11px",
                  }}>{tag}</span>
                ))}
              </div>

              <a href={INFINITYRISING.playUrl} target="_blank" rel="noopener noreferrer" style={{
                display: "block", width: "100%", padding: "12px",
                background: `${INFINITYRISING.color}20`, border: `2px solid ${INFINITYRISING.color}`,
                borderRadius: "8px", color: INFINITYRISING.color,
                fontFamily: "Orbitron, sans-serif", fontWeight: "bold", fontSize: "13px",
                textAlign: "center", textDecoration: "none", textTransform: "uppercase",
                marginBottom: "10px", boxSizing: "border-box",
              }}>
                ▶ PLAY NOW
              </a>

              <a href={INFINITYRISING.guideUrl} target="_blank" rel="noopener noreferrer" style={{
                display: "block", width: "100%", padding: "10px",
                background: `${INFINITYRISING.color}10`, border: `1px solid ${INFINITYRISING.color}40`,
                borderRadius: "6px", color: INFINITYRISING.color,
                fontFamily: "Share Tech Mono, monospace", fontSize: "12px",
                textAlign: "center", textDecoration: "none", boxSizing: "border-box",
              }}>
                {INFINITYRISING.guideLabel} →
              </a>
            </div>
          </div>

          {/* AdventureWurld Card */}
          <div style={{
            background: "linear-gradient(135deg, #0f0a1a, #0b0c10)",
            border: `2px solid ${ADVENTUREWURLD.color}40`,
            borderRadius: "16px",
            overflow: "hidden",
            transition: "all 0.3s ease",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = ADVENTUREWURLD.color;
              e.currentTarget.style.boxShadow = `0 0 30px ${ADVENTUREWURLD.color}40`;
              e.currentTarget.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${ADVENTUREWURLD.color}40`;
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Banner */}
            <div style={{
              height: "180px",
              background: `linear-gradient(135deg, ${ADVENTUREWURLD.color}30, #0f0a1a)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: `1px solid ${ADVENTUREWURLD.color}40`,
            }}>
              <span style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "28px",
                fontWeight: "bold",
                color: ADVENTUREWURLD.color,
                letterSpacing: "3px",
                textShadow: `0 0 20px ${ADVENTUREWURLD.color}`,
                textAlign: "center",
                padding: "0 20px",
              }}>
                AdventureWurld
              </span>
            </div>

            <div style={{ padding: "20px" }}>
              <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "22px", color: ADVENTUREWURLD.color, marginBottom: "10px" }}>
                {ADVENTUREWURLD.title}
              </h3>
              <p style={{ fontFamily: "Share Tech Mono, monospace", color: "#aaa", fontSize: "14px", lineHeight: "1.6", marginBottom: "15px" }}>
                {ADVENTUREWURLD.description}
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                {ADVENTUREWURLD.tags.map((tag) => (
                  <span key={tag} style={{
                    padding: "4px 10px",
                    background: `${ADVENTUREWURLD.color}20`,
                    border: `1px solid ${ADVENTUREWURLD.color}40`,
                    borderRadius: "12px",
                    color: ADVENTUREWURLD.color,
                    fontFamily: "Share Tech Mono, monospace",
                    fontSize: "11px",
                  }}>{tag}</span>
                ))}
              </div>

              <a href={ADVENTUREWURLD.playUrl} target="_blank" rel="noopener noreferrer" style={{
                display: "block", width: "100%", padding: "12px",
                background: `${ADVENTUREWURLD.color}20`, border: `2px solid ${ADVENTUREWURLD.color}`,
                borderRadius: "8px", color: ADVENTUREWURLD.color,
                fontFamily: "Orbitron, sans-serif", fontWeight: "bold", fontSize: "13px",
                textAlign: "center", textDecoration: "none", textTransform: "uppercase",
                boxSizing: "border-box",
              }}>
                VISIT ADVENTUREWURLD →
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.1)",
        padding: "30px 20px",
        textAlign: "center",
      }}>
        <p style={{
          fontFamily: "Share Tech Mono, monospace",
          color: "#555",
          fontSize: "12px",
          letterSpacing: "2px",
        }}>
          TWC GUILD — TOGETHER WE CAN
        </p>
      </footer>
    </div>
  );
}
