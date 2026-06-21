"use client";

import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Crown } from "./components/Crown";
import memberRoster from "./guildevents/member-roster.json";

// ── Design tokens ────────────────────────────────────────────────────────────
const LIME    = "#c6f53e";
const MAG     = "#3d9eff";
const BG      = "#08090a";
const SURFACE = "#101214";
const LINE    = "rgba(255,255,255,.12)";
const TEXT    = "#f2f4f0";
const MUTED   = "#878d86";

// ── Game data ────────────────────────────────────────────────────────────────
const GAMES = [
  {
    title:    "NomStead",
    squad:    "Primary Squad",
    color:    "#4ade80",
    image:    null,
    eventActive: true,
    playUrl:  "https://play.immutable.com/games/nomstead/",
    guideUrl: "https://www.gamehole.games/nomstead",
    guideLabel: "NFT Guide",
    tools: [
      { url: "https://www.gamehole.games/nomstead/calculator", label: "Farm Calc" },
      { url: "https://www.gamehole.games/logfilter", label: "Log Filter" },
    ],
  },
  {
    title:    "Spider Tanks",
    squad:    "PvP Squad",
    color:    "#ff6b00",
    image:    "/images/spider-tanks.png",
    eventActive: false,
    playUrl:  "https://play.immutable.com/games/spider-tanks-cores-of-chaos/",
    guideUrl: "https://www.spidergang.xyz",
    guideLabel: "Spider Gang",
    tools: [],
  },
  {
    title:    "Infinity Rising",
    squad:    "Founding Members",
    color:    "#ff0033",
    image:    "/images/infinity-rising.png",
    eventActive: false,
    playUrl:  "https://infinityrising.io/",
    guideUrl: "https://www.gamehole.games/infinityrising",
    guideLabel: "Token Guide",
    tools: [],
  },
  {
    title:    "AdventureWurld",
    squad:    "Explorers",
    color:    "#a855f7",
    image:    null,
    eventActive: false,
    playUrl:  "https://adventurewurld.com/",
    guideUrl: null,
    guideLabel: null,
    tools: [],
  },
];

const ROADMAP = [
  {
    live:  true,
    phase: "Now Live",
    title: "The Crew",
    body:  "63 players, four active games, guild events every week. The ladder is open and the bench is deep.",
  },
  {
    live:  false,
    phase: "Phase 02",
    title: "The Vault",
    body:  "One shared treasury — event winnings and officer rewards, governed by the people who earn it.",
  },
  {
    live:  false,
    phase: "Phase 03",
    title: "Genesis",
    body:  "Our own on-chain game hits playtest. Crew members get first access, zero cost, before the public.",
  },
  {
    live:  false,
    phase: "Phase 04",
    title: "Go Public",
    body:  "Full launch. The game we built together, owned by the players who built it.",
  },
];

const TICKER_ITEMS = [
  "Guild Events Live",
  "NomStead Season 4",
  "Now Recruiting",
  "On-Chain Game In Dev",
  "63 Members Strong",
  "Together We Can",
  "Spider Tanks PvP",
  "Infinity Rising Open",
];

const SHOWN_MEMBERS = 19;

function DefaultAvatar({ size, accent }: { size: number; accent: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="15" r="7" fill={accent} opacity={0.7} />
      <path d="M4 38 Q4 26 20 26 Q36 26 36 38" fill={accent} opacity={0.7} />
    </svg>
  );
}

// Deterministic tile color per index
function tileAccent(i: number) {
  const cycle = i % 3;
  if (cycle === 0) return { bg: "rgba(198,245,62,.18)", color: LIME };
  if (cycle === 1) return { bg: "rgba(61,158,255,.18)", color: MAG };
  return { bg: "rgba(255,255,255,.06)", color: MUTED };
}

// ── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [profileData, setProfileData] = useState<Record<string, { avatarUrl?: string; linked: boolean }>>({});

  useEffect(() => {
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((data: { profiles: Record<string, { avatarUrl?: string; claimedBy?: string }> }) => {
        const out: Record<string, { avatarUrl?: string; linked: boolean }> = {};
        for (const [name, p] of Object.entries(data.profiles)) {
          out[name.toLowerCase()] = { avatarUrl: p.avatarUrl, linked: !!p.claimedBy };
        }
        setProfileData(out);
      })
      .catch(() => {});
  }, []);

  const shownRoster = memberRoster.slice(0, SHOWN_MEMBERS);
  const remaining   = memberRoster.length - SHOWN_MEMBERS;

  // Duplicate ticker items for seamless loop
  const tickerAll = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div style={{ background: BG, color: TEXT, fontFamily: "'Space Grotesk', system-ui, sans-serif", overflowX: "hidden", WebkitFontSmoothing: "antialiased" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "84px", padding: "0 clamp(20px, 4vw, 60px)",
        borderBottom: `1.5px solid ${LINE}`,
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(8,9,10,.92)", backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'Anton', sans-serif", fontSize: "clamp(22px, 2.5vw, 30px)", letterSpacing: ".02em", textTransform: "uppercase" }}>
          <Crown size={38} />
          TWC GUILD
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "clamp(16px, 2.5vw, 34px)" }}>
          <a href="#crew"    style={navLink}>Crew</a>
          <a href="#squads"  style={navLink}>Squads</a>
          <a href="#roadmap" style={navLink}>Roadmap</a>
          <Link href="/members" style={navLink}>Roster</Link>
          <Link href="/chess" style={{ ...navLink, color: "#f0c040" }}>Chess</Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/members" style={btnLime}>Join the crew</Link>
          <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" />
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{ padding: "clamp(48px,6vw,72px) clamp(20px,4vw,60px) clamp(40px,5vw,60px)" }}>
        {/* Badge row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 30, flexWrap: "wrap" }}>
          <span style={{ ...pill, background: LIME, color: "#0a0c05" }}>63 Members</span>
          <span style={{ ...pill, background: MAG, color: "#001a33" }}>Recruiting</span>
          <span style={{ ...pill, border: `1.5px solid ${LINE}`, color: MUTED }}>Est. 2023</span>
        </div>

        {/* H1 */}
        <h1 style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: "clamp(60px, 10.5vw, 148px)",
          lineHeight: .86,
          letterSpacing: "-.01em",
          textTransform: "uppercase",
          margin: 0,
          fontWeight: 400,
        }}>
          WE <span style={{ color: LIME }}>PLAY.</span>
          <br />
          WE <span style={{ color: "transparent", WebkitTextStroke: `2px ${TEXT}` }}>WIN.</span> WE
          <br />
          <span style={{ color: MAG }}>BUILD</span> OUR OWN.
        </h1>

        {/* Bottom row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40, gap: 50, flexWrap: "wrap" }}>
          <p style={{ fontSize: "clamp(15px,1.3vw,19px)", lineHeight: 1.55, color: "#c8ccc6", maxWidth: 440, margin: 0, fontWeight: 400 }}>
            A 63-strong gaming guild grinding multiple titles — and building our own on-chain game that the crew actually owns.
          </p>
          <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
            <Link href="/members" style={btnLime}>Join the crew →</Link>
            <a href="#roadmap" style={btnGhost}>See the roadmap</a>
          </div>
        </div>
      </section>

      {/* ── TICKER ──────────────────────────────────────────────────────── */}
      <div style={{ background: LIME, color: "#0a0c05", overflow: "hidden" }}>
        <div className="ticker-track" style={{
          display: "flex", gap: 36, alignItems: "center",
          padding: "14px 60px",
          fontFamily: "'Anton', sans-serif",
          fontSize: "clamp(15px,1.4vw,20px)",
          textTransform: "uppercase",
          letterSpacing: ".02em",
          whiteSpace: "nowrap",
        }}>
          {tickerAll.flatMap((t, i) => [
            <span key={`t${i}`}>{t}</span>,
            <span key={`s${i}`} style={{ width: 7, height: 7, background: "#0a0c05", transform: "rotate(45deg)", display: "inline-block", flexShrink: 0 }} />,
          ])}
        </div>
      </div>

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: `1.5px solid ${LINE}` }}>
        {[
          { num: "63", label: "Members",     color: TEXT },
          { num: "04", label: "Games",       color: LIME },
          { num: "4+", label: "Guild Events", color: MAG },
          { num: "01", label: "Game in dev", color: TEXT },
        ].map(({ num, label, color }, i) => (
          <div key={label} style={{
            padding: "clamp(28px,3.5vw,48px) clamp(16px,2.5vw,36px)",
            borderRight: i < 3 ? `1.5px solid ${LINE}` : "none",
          }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(48px,6vw,84px)", lineHeight: .9, color }}>{num}</div>
            <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: MUTED, marginTop: 10 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── PILLARS ─────────────────────────────────────────────────────── */}
      <section id="crew" style={{ padding: "clamp(60px,6.5vw,96px) clamp(20px,4vw,60px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, gap: 30, flexWrap: "wrap" }}>
          <div>
            <span style={{ ...pill, border: `1.5px solid ${LINE}`, color: MUTED }}>What we do</span>
            <h2 style={secH2}>THREE MOVES, <span style={{ color: LIME }}>NO FILLER.</span></h2>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
          {[
            { n: "01", title: "Compete",  color: LIME,   textColor: "#0a0c05", body: "Active squads across NomStead, Spider Tanks, Infinity Rising, and AdventureWurld. Guild events every week, real competition every season." },
            { n: "02", title: "Belong",   color: MAG,    textColor: "#001a33", body: "63 people who actually show up. Voice every night, guild events with real rewards, zero dead roster slots." },
            { n: "03", title: "Build",    color: "#fff", textColor: "#0a0c05", body: "We are making an on-chain game. No ERC-20 token — ever. The economy runs entirely on ERC-1155 items, built to last. The crew designs it, tests it, and owns a piece before anyone else does." },
          ].map(({ n, title, color, textColor, body }) => (
            <div key={n} style={{ background: SURFACE, border: `1.5px solid ${LINE}`, borderRadius: 18, padding: "34px 30px 38px", cursor: "default", transition: "border-color .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = LIME)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = LINE)}
            >
              <div style={{ width: 52, height: 52, borderRadius: 12, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Anton', sans-serif", fontSize: 26, color: textColor, marginBottom: 60 }}>{n}</div>
              <h3 style={{ fontFamily: "'Anton', sans-serif", textTransform: "uppercase", fontSize: 32, margin: "0 0 14px", fontWeight: 400 }}>{title}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.62, color: MUTED, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SQUADS / GAMES ──────────────────────────────────────────────── */}
      <section id="squads" style={{ padding: "0 clamp(20px,4vw,60px) clamp(60px,6.5vw,96px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, gap: 30, flexWrap: "wrap" }}>
          <div>
            <span style={{ ...pill, border: `1.5px solid ${LINE}`, color: MUTED }}>Squads</span>
            <h2 style={secH2}>WHERE WE <span style={{ color: LIME }}>GRIND</span></h2>
          </div>
          <Link href="/guildevents" style={btnGhost}>Guild events →</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {GAMES.map((g) => (
            <div key={g.title} style={{ borderRadius: 16, overflow: "hidden", border: `1.5px solid ${LINE}`, background: SURFACE, transition: "border-color .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = g.color)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = LINE)}
            >
              {/* Image / banner */}
              <div style={{ aspectRatio: "4/5", position: "relative", overflow: "hidden" }}>
                {g.image ? (
                  <img src={g.image} alt={g.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `linear-gradient(135deg, ${g.color}22 0%, ${BG} 100%)`,
                    backgroundImage: `repeating-linear-gradient(135deg, ${g.color}1a 0 1px, transparent 1px 13px)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(28px, 4vw, 42px)", textTransform: "uppercase", color: g.color, textShadow: `0 0 30px ${g.color}60`, letterSpacing: ".03em", padding: "0 16px", textAlign: "center" }}>{g.title}</span>
                  </div>
                )}
                {g.eventActive && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(135deg, rgba(180,77,255,.95), rgba(142,45,226,.95))", padding: "10px 16px", fontFamily: "'Anton', sans-serif", fontSize: 13, letterSpacing: ".12em", textAlign: "center", textTransform: "uppercase" }}>
                    GUILD EVENT ACTIVE
                  </div>
                )}
              </div>

              {/* Meta */}
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontFamily: "'Anton', sans-serif", textTransform: "uppercase", fontSize: 22, color: TEXT }}>{g.title}</span>
                  <span style={{ fontWeight: 600, fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: ".06em" }}>{g.squad}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <a href={g.playUrl} target="_blank" rel="noopener noreferrer" style={{ ...btnSmallLime }}>Play now →</a>
                  {g.guideUrl && (
                    <a href={g.guideUrl} target="_blank" rel="noopener noreferrer" style={{ ...btnSmallGhost }}>{g.guideLabel}</a>
                  )}
                  {g.tools.map((t) => (
                    <a key={t.label} href={t.url} target="_blank" rel="noopener noreferrer" style={{ ...btnSmallGhost }}>{t.label}</a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROADMAP ─────────────────────────────────────────────────────── */}
      <section id="roadmap" style={{ padding: "0 clamp(20px,4vw,60px) clamp(60px,6.5vw,96px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, gap: 30, flexWrap: "wrap" }}>
          <div>
            <span style={{ ...pill, border: `1.5px solid ${LINE}`, color: MUTED }}>The plan</span>
            <h2 style={secH2}>GUILD <span style={{ color: LIME }}>→</span> GAME</h2>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {ROADMAP.map((r) => (
            <div key={r.phase} style={{
              borderRadius: 16,
              padding: "30px 26px 34px",
              border: `1.5px solid ${r.live ? LIME : LINE}`,
              background: r.live ? LIME : "transparent",
              color: r.live ? "#0a0c05" : TEXT,
            }}>
              <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", opacity: .7 }}>{r.phase}</div>
              <h4 style={{ fontFamily: "'Anton', sans-serif", textTransform: "uppercase", fontSize: 30, margin: "48px 0 12px", fontWeight: 400 }}>{r.title}</h4>
              <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, color: r.live ? "#0a0c05" : MUTED }}>{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROSTER ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 clamp(20px,4vw,60px) clamp(60px,6.5vw,96px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, gap: 30, flexWrap: "wrap" }}>
          <div>
            <span style={{ ...pill, border: `1.5px solid ${LINE}`, color: MUTED }}>The roster</span>
            <h2 style={secH2}>63 AND <span style={{ color: LIME }}>COUNTING</span></h2>
          </div>
          <Link href="/members" style={btnGhost}>Meet the crew →</Link>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {shownRoster.map((m, i) => {
            const key = m.name.toLowerCase();
            const pdata = profileData[key];
            const { bg, color } = tileAccent(i);
            return (
              <Link key={m.name} href={`/member/${encodeURIComponent(m.name)}`} title={m.name}
                style={{ width: 66, height: 66, borderRadius: 16, overflow: "hidden", border: `1.5px solid ${pdata?.linked ? LIME + "60" : LINE}`, display: "block", flexShrink: 0, position: "relative", textDecoration: "none" }}>
                {pdata?.avatarUrl ? (
                  <img src={pdata.avatarUrl} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : pdata?.linked ? (
                  /* Wallet linked, no photo yet → person icon */
                  <div style={{ width: "100%", height: "100%", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <DefaultAvatar size={42} accent={color} />
                  </div>
                ) : (
                  /* No wallet linked → initials */
                  <div style={{ width: "100%", height: "100%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Anton', sans-serif", fontSize: 22, color }}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            );
          })}
          <Link href="/members" style={{ width: 66, height: 66, borderRadius: 16, background: LIME, color: "#0a0c05", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Anton', sans-serif", fontSize: 18, textDecoration: "none", flexShrink: 0 }}>
            +{remaining}
          </Link>
        </div>
      </section>

      {/* ── JOIN CTA ────────────────────────────────────────────────────── */}
      <div style={{ margin: "0 clamp(16px,4vw,60px) clamp(60px,6.5vw,96px)" }}>
        <div style={{ background: LIME, color: "#0a0c05", borderRadius: 28, padding: "clamp(48px,6vw,84px) clamp(28px,5vw,70px)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
          <h2 style={{ fontFamily: "'Anton', sans-serif", textTransform: "uppercase", fontSize: "clamp(56px,6.5vw,92px)", lineHeight: .84, margin: 0, fontWeight: 400 }}>
            GOT<br />GAME?
          </h2>
          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <p style={{ fontWeight: 500, fontSize: 17, maxWidth: 280, margin: "0 0 22px", lineHeight: 1.5, color: "#0a0c05" }}>
              Bring your rank, your role, or your skills. Jump in on Discord or claim your profile on the roster.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <a href="https://discord.gg/CBtfFHmVwZ" target="_blank" rel="noopener noreferrer" style={{ ...btnLime, background: "#0a0c05", color: LIME, display: "inline-flex" }}>Join Discord →</a>
              <Link href="/members" style={{ ...btnLime, background: "rgba(0,0,0,.15)", color: "#0a0c05", border: "1.5px solid rgba(0,0,0,.2)", display: "inline-flex" }}>View roster</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ display: "flex", justifyContent: "space-between", padding: "54px clamp(20px,4vw,60px)", borderTop: `1.5px solid ${LINE}`, flexWrap: "wrap", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'Anton', sans-serif", fontSize: 24, textTransform: "uppercase" }}>
            <Crown size={30} />TWC GUILD
          </div>
          <div style={{ fontSize: 12, color: "#5a605a", fontWeight: 600 }}>© 2026 TWC Guild — Together We Can</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={footerHead}>Navigate</div>
          <Link href="/members"     style={footerLink}>Roster</Link>
          <Link href="/guildevents" style={footerLink}>Guild Events</Link>
          <Link href="/lending"     style={footerLink}>Item Board</Link>
          <Link href="/chess"       style={footerLink}>Chess</Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={footerHead}>Games</div>
          {GAMES.map((g) => (
            <a key={g.title} href={g.playUrl} target="_blank" rel="noopener noreferrer" style={footerLink}>{g.title}</a>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={footerHead}>Community</div>
          <a href="https://discord.gg/CBtfFHmVwZ" target="_blank" rel="noopener noreferrer" style={footerLink}>Discord</a>
          <a href="https://www.gamehole.games" target="_blank" rel="noopener noreferrer" style={footerLink}>GameHole.games</a>
          <Link href="/members" style={footerLink}>Apply / Join</Link>
        </div>
      </footer>
    </div>
  );
}

// ── Shared style objects ─────────────────────────────────────────────────────
const pill: CSSProperties = {
  display: "inline-block",
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  padding: "7px 13px",
  borderRadius: 999,
};

const btnLime: CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: 14,
  letterSpacing: ".02em",
  padding: "13px 24px",
  borderRadius: 999,
  border: "none",
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: LIME,
  color: "#0a0c05",
  transition: "transform .12s, box-shadow .15s",
};

const btnGhost: CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: 14,
  letterSpacing: ".02em",
  padding: "13px 24px",
  borderRadius: 999,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "transparent",
  color: TEXT,
  border: `1.5px solid ${LINE}`,
  transition: "border-color .15s, color .15s",
};

const btnSmallLime: CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700,
  fontSize: 12,
  padding: "7px 14px",
  borderRadius: 999,
  background: LIME,
  color: "#0a0c05",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
};

const btnSmallGhost: CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  fontSize: 12,
  padding: "7px 14px",
  borderRadius: 999,
  background: "transparent",
  color: MUTED,
  border: `1.5px solid ${LINE}`,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
};

const navLink: CSSProperties = {
  fontWeight: 600,
  fontSize: 14,
  color: MUTED,
  textDecoration: "none",
};

const secH2: CSSProperties = {
  fontFamily: "'Anton', sans-serif",
  textTransform: "uppercase",
  fontSize: "clamp(42px,5.5vw,76px)",
  lineHeight: .9,
  margin: "16px 0 0",
  fontWeight: 400,
};

const footerHead: CSSProperties = {
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "#5a605a",
  marginBottom: 4,
};

const footerLink: CSSProperties = {
  fontWeight: 600,
  fontSize: 14,
  color: MUTED,
  textDecoration: "none",
};
