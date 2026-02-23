"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  ACTIVE:   { bg: "rgba(0,255,65,0.15)",  text: "#00ff41", border: "#00ff41" },
  UPCOMING: { bg: "rgba(255,215,0,0.15)", text: "#ffd700", border: "#ffd700" },
  ENDED:    { bg: "rgba(255,71,87,0.15)", text: "#ff4757", border: "#ff4757" },
} as const;

const TC = [
  { color: "#00ff41", border: "#00ff41", bg: "rgba(0,255,65,0.08)" },   // A
  { color: "#00d9ff", border: "#00d9ff", bg: "rgba(0,217,255,0.08)" },  // B
  { color: "#b44dff", border: "#b44dff", bg: "rgba(180,77,255,0.08)" }, // C
  { color: "#ffd700", border: "#ffd700", bg: "rgba(255,215,0,0.08)" },  // D
  { color: "#ff6b35", border: "#ff6b35", bg: "rgba(255,107,53,0.08)" }, // E
];

// ─── Shared tier items used across events ─────────────────────────────────────
const TIER_A_ITEMS_2K = [
  { name: "Cotton",        qty: "2k", price: "$0.0005 each", max: "$1.00 max" },
  { name: "Potatoes",      qty: "2k", price: "$0.0005 each", max: "$1.00 max" },
  { name: "Red Flower",    qty: "2k", price: "$0.0005 each", max: "$1.00 max" },
  { name: "Blue Flower",   qty: "2k", price: "$0.0005 each", max: "$1.00 max" },
  { name: "Yellow Flower", qty: "2k", price: "$0.0005 each", max: "$1.00 max" },
];

const TIER_B_ITEMS = [
  { name: "Wrapped Potato", qty: "1.3k", price: "$0.001 each",  max: "$1.30 max" },
  { name: "Fries",          qty: "1.3k", price: "$0.001 each",  max: "$1.30 max" },
  { name: "Veggie Salad",   qty: "1.3k", price: "$0.001 each",  max: "$1.30 max" },
  { name: "Soil",           qty: "x500", price: "$0.0024 each", max: "$1.20 max" },
];

const TIER_C_CAKES = [
  { name: "Golden Potato Cake",      qty: "x3", price: "$0.167 each", max: "$0.50 max" },
  { name: "Pumpkin Spice Cake",      qty: "x3", price: "$0.167 each", max: "$0.50 max" },
  { name: "Carrot Cake",             qty: "x3", price: "$0.167 each", max: "$0.50 max" },
  { name: "Grape Tart Cake",         qty: "x3", price: "$0.167 each", max: "$0.50 max" },
  { name: "Upside-Down Tomato Cake", qty: "x3", price: "$0.167 each", max: "$0.50 max" },
  { name: "Chicken Feed",            qty: "TBD" },
  { name: "Mushroom Omelette",       qty: "TBD" },
  { name: "Mushroom Soup",           qty: "TBD" },
  { name: "Pumpkin Bread",           qty: "TBD" },
  { name: "Tomato Omelette",         qty: "TBD" },
];

const TIER_D_TBD_ITEMS = [
  { name: "Wood Plank",           qty: "TBD" },
  { name: "Stone Block",          qty: "TBD" },
  { name: "Stone Brick",          qty: "TBD" },
  { name: "Clay Brick",           qty: "TBD" },
  { name: "Metal Bar",            qty: "TBD" },
  { name: "Iron Ingot",           qty: "TBD" },
  { name: "Silver Ingot",         qty: "TBD" },
  { name: "Gold Ingot",           qty: "TBD" },
  { name: "Wool",                 qty: "TBD" },
  { name: "Grape Must",           qty: "TBD" },
  { name: "Cotton Thread",        qty: "TBD" },
  { name: "Cotton Thread Blue",   qty: "TBD" },
  { name: "Cotton Thread Brown",  qty: "TBD" },
  { name: "Cotton Thread Green",  qty: "TBD" },
  { name: "Cotton Thread Orange", qty: "TBD" },
  { name: "Cotton Thread Red",    qty: "TBD" },
  { name: "Cotton Thread Yellow", qty: "TBD" },
  { name: "Fishing Rod",          qty: "TBD" },
  { name: "Iron Axe",             qty: "TBD" },
  { name: "Iron Pickaxe",         qty: "TBD" },
  { name: "Gold Axe",             qty: "TBD" },
  { name: "Gold Pickaxe",         qty: "TBD" },
];

const TIER_E_ITEMS = [
  { name: "Box",         qty: "TBD" },
  { name: "Bench",       qty: "TBD" },
  { name: "Big Bench",   qty: "TBD" },
  { name: "Bonfire",     qty: "TBD" },
  { name: "Dropbox",     qty: "TBD" },
  { name: "Fence",       qty: "TBD" },
  { name: "Gate",        qty: "TBD" },
  { name: "Well",        qty: "TBD" },
  { name: "Wood Plank",  qty: "TBD" },
  { name: "Stone Block", qty: "TBD" },
  { name: "Metal Bar",   qty: "TBD" },
  { name: "Wool",        qty: "TBD" },
];

// ─── Event 2 (ACTIVE) ─────────────────────────────────────────────────────────
const EVENT2 = {
  title: "NomStead Guild Item Exchange — Event 2",
  dateRange: "Mar 1 – Mar 31, 2026",
  description:
    "Tiered item exchange event for NomStead guild members. Pick a tier, send your items, and receive payment based on the pricing below. Now includes Tier D — Tools & Materials!",
  status: "ACTIVE" as const,
  registeredPlayers: [
    "xidni_xazz", "DevilFirst", "Rachelle (KANIN)", "steemit",
    "abkhan", "Ongbak", "Alstar", "Axolotoi",
  ],
  tiers: [
    {
      name: "Tier A", subtitle: "Basic Items",
      eligibility: "Active Low-Level Members Only",
      ...TC[0],
      priceRange: "$0.0005", playerCap: "$5 max per player", totalCap: "10,000 items",
      items: TIER_A_ITEMS_2K,
    },
    {
      name: "Tier B", subtitle: "Mid-Tier Crafted Items",
      eligibility: "Active Low-Level Members Only",
      ...TC[1],
      priceRange: "$0.001", playerCap: "$5.10 max per player", totalCap: "4,400 items",
      items: TIER_B_ITEMS,
    },
    {
      name: "Tier C", subtitle: "High-Tier Items",
      eligibility: "OG Players Only",
      ...TC[2],
      priceRange: "$0.167 / cake", playerCap: "$2.50 max per player", totalCap: "15 cakes",
      items: TIER_C_CAKES,
    },
    {
      name: "Tier D", subtitle: "Tools & Materials",
      eligibility: "OG Players Only",
      ...TC[3],
      priceRange: "$0.00125–$0.001375", playerCap: "$15 max per player", totalCap: "11,000 items",
      items: [
        { name: "Wheat Flour", qty: "1k", price: "$0.00125 each",  max: "$1.25 max" },
        { name: "Wood",        qty: "5k", price: "$0.001375 each", max: "$6.88 max" },
        { name: "Stone",       qty: "5k", price: "$0.001375 each", max: "$6.88 max" },
        ...TIER_D_TBD_ITEMS,
      ],
    },
  ],
  rules: [
    "Each player can earn up to $27.60 total ($5 from A + $5.10 from B + $2.50 from C + $15 from D).",
    "Max event pool: $220.80 (8 players).",
    "PM FoxHole on Discord before dropping items in the dropbox to make sure activities are acknowledged and paid for.",
    "Tier D: Wheat Flour 1k × $0.00125, Wood & Stone 5k × $0.001375 each.",
    "Caps are per player — unused budget rolls into the July TGE Launch Event pool.",
    "LOYALTY MULTIPLIER: Complete a full Tier D hand-in (all wheat flour, wood & stone) to earn $15 this event and unlock a permanent 1.25x multiplier — earning more from Tier D every month from Event 3 through the July TGE Launch. Earn it once, keep it all season. Tier D participants only.",
  ],
  loyaltyNote:
    "Complete a full Tier D hand-in (1k Wheat Flour + 5k Wood + 5k Stone) and unlock a permanent 1.25× multiplier on Tier D. Instead of earning $15 max, you earn more every month through the July TGE Launch. Earn it once — keep it all season. Tier D participants only.",
  faqs: [
    {
      q: "How does this work?",
      a: "You gather in-game items from NomStead and sell them to FoxHole's dropbox. PM FoxHole on Discord first to set up payment and arrange your drop-off. Pick any tier you want — you can participate in all four.",
    },
    {
      q: "How much can I earn?",
      a: "Up to $27.60 per player across all tiers: $5 from Tier A, $5.10 from Tier B, $2.50 from Tier C, and $15 from Tier D. You don't have to max every tier — earn as much or as little as you want.",
    },
    {
      q: "What are the tiers?",
      a: "Each tier has different items at different price points. Tier A is basic crops and flowers (cheap but high quantity). Tier B is crafted food items (higher value per item). Tier C is rare cakes. Tier D is wheat flour, wood, and stone — the biggest earner.",
    },
    {
      q: "What does 'per player cap' mean?",
      a: "It's the max dollar amount you can earn from a single tier. Tier D is the biggest earner at $15. This ensures the pool is shared fairly across all players.",
    },
    {
      q: "What if I can't fill a whole tier?",
      a: "No problem! You get paid per item at the listed price, so every single item counts. Send what you can, even if it's just a few. There's no minimum. Any money left unspent rolls into the July TGE Launch Event pool.",
    },
    {
      q: "How do I get paid?",
      a: "PM FoxHole on Discord to coordinate. Once your items are verified in the dropbox, payment is sent to you. Details are arranged through Discord DMs.",
    },
    {
      q: "What's the Loyalty Multiplier?",
      a: "Complete a full Tier D hand-in (all 1k wheat flour, 5k wood, and 5k stone) and you unlock a 1.25x multiplier on Tier D earnings — every month from Event 3 through the July TGE Launch. You only need to earn it once and it lasts all season. Tier D participants only.",
    },
    {
      q: "What's the total pool?",
      a: "$220.80 across 8 players. This is the max FoxHole will pay out. If not everyone maxes every tier, all leftover rolls into the July TGE Launch Event pool.",
    },
  ],
};

// ─── Event 3 (UPCOMING — Apr 1) ───────────────────────────────────────────────
// Wood and Stone price increased to $0.0025 each. Tiers A / B / C carry over
// from Event 2. Tier E pricing TBD.
const EVENT3 = {
  title: "NomStead Guild Item Exchange — Event 3",
  dateRange: "Apr 1 – Apr 30, 2026",
  startDate: new Date("2026-04-01"),
  description:
    "Monthly item exchange with all five tiers. Tiers A–C carry over from Event 2. Tier D increases wood & stone value to $0.0025 each — the biggest single-resource earner yet.",
  status: "UPCOMING" as const,
  tiers: [
    {
      name: "Tier A", subtitle: "Basic Items",
      eligibility: "Active Low-Level Members Only",
      ...TC[0],
      priceRange: "$0.0005", playerCap: "$5 max per player", totalCap: "10,000 items",
      items: TIER_A_ITEMS_2K,
    },
    {
      name: "Tier B", subtitle: "Mid-Tier Crafted Items",
      eligibility: "Active Low-Level Members Only",
      ...TC[1],
      priceRange: "$0.001", playerCap: "$5.10 max per player", totalCap: "4,400 items",
      items: TIER_B_ITEMS,
    },
    {
      name: "Tier C", subtitle: "High-Tier Items",
      eligibility: "OG Players Only",
      ...TC[2],
      priceRange: "$0.167 / cake", playerCap: "$2.50 max per player", totalCap: "15 cakes",
      items: TIER_C_CAKES,
    },
    {
      name: "Tier D", subtitle: "Tools & Materials",
      eligibility: "OG Players Only",
      ...TC[3],
      // Wood & Stone up from $0.001375 → $0.0025 (+81% value)
      priceRange: "$0.00125–$0.0025", playerCap: "$26.25 max per player", totalCap: "11,000 items",
      items: [
        { name: "Wheat Flour", qty: "1k", price: "$0.00125 each", max: "$1.25 max" },
        { name: "Wood",        qty: "5k", price: "$0.0025 each",  max: "$12.50 max" },
        { name: "Stone",       qty: "5k", price: "$0.0025 each",  max: "$12.50 max" },
        ...TIER_D_TBD_ITEMS,
      ],
    },
    {
      name: "Tier E", subtitle: "Crafted Items & Structures",
      eligibility: undefined,
      ...TC[4],
      priceRange: "TBD", playerCap: "TBD", totalCap: "TBD",
      items: TIER_E_ITEMS,
    },
  ],
  rules: [
    "Each player can earn up to $38.85 confirmed ($5 from A + $5.10 from B + $2.50 from C + $26.25 from D) — plus TBD from Tier E.",
    "Wood & Stone price increased to $0.0025 each (up from $0.001375 in Event 2).",
    "PM FoxHole on Discord before dropping items in the dropbox.",
    "Caps are per player — unused budget rolls into the July TGE Launch Event pool.",
    "LOYALTY MULTIPLIER HOLDERS: Your Tier D max is $32.81 this event (1.25× applied to $26.25).",
  ],
  loyaltyNote:
    "If you earned the Loyalty Multiplier in Event 2, your Tier D cap this event is $32.81 (1.25× applied to $26.25). Wood and stone are now worth $0.0025 each — making Tier D the highest-value tier in the season so far.",
};

// ─── Event 4 (UPCOMING — May 1, simple card) ──────────────────────────────────
const EVENT4 = {
  id: 4,
  title: "NomStead Guild Item Exchange — Event 4",
  dateRange: "May 1 – May 31, 2026",
  startDate: new Date("2026-05-01"),
  description:
    "Monthly item exchange with all five tiers. Pricing and caps will be finalized based on Event 3 results.",
  tiers: ["Tier A", "Tier B", "Tier C", "Tier D", "Tier E"],
  rules: [
    "Pricing and caps will be set based on Event 3 feedback.",
    "PM FoxHole on Discord before dropping items in the dropbox.",
    "Caps are per player — unused budget rolls into the July TGE Launch Event pool.",
  ],
};

// ─── Countdown ────────────────────────────────────────────────────────────────
function Countdown({ target }: { target: Date }) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return setT({ d: 0, h: 0, m: 0, s: 0 });
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
      {[{ label: "DAYS", val: t.d }, { label: "HRS", val: t.h }, { label: "MIN", val: t.m }, { label: "SEC", val: t.s }].map(
        ({ label, val }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "1.8rem", fontWeight: "bold", color: "#ffd700",
              textShadow: "0 0 10px #ffd700", background: "rgba(0,0,0,0.6)",
              border: "2px solid #ffd700", borderRadius: "8px",
              padding: "8px 12px", minWidth: "56px",
            }}>
              {String(val).padStart(2, "0")}
            </div>
            <div style={{ fontSize: "0.58rem", color: "#c5c6c7", marginTop: "4px", letterSpacing: "1px" }}>
              {label}
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ─── Tier card ────────────────────────────────────────────────────────────────
type Item = { name: string; qty: string; price?: string; max?: string };
type Tier = {
  name: string; subtitle: string; eligibility?: string;
  color: string; border: string; bg: string;
  priceRange: string; playerCap: string; totalCap: string;
  items: Item[];
};

function TierCard({ tier }: { tier: Tier }) {
  return (
    <div style={{
      background: tier.bg, border: `2px solid ${tier.border}`,
      borderRadius: "12px", padding: "20px",
      display: "flex", flexDirection: "column", gap: "12px",
    }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
          <h2 style={{ color: tier.color, fontSize: "1.05rem", margin: 0, letterSpacing: "2px", textTransform: "uppercase" }}>
            {tier.name}
          </h2>
          {tier.eligibility && (
            <span style={{
              fontSize: "0.58rem", color: tier.color,
              border: `1px solid ${tier.color}`, borderRadius: "4px",
              padding: "2px 6px", flexShrink: 0, marginLeft: "8px",
            }}>
              {tier.eligibility}
            </span>
          )}
        </div>
        <span style={{ color: "#c5c6c7", fontSize: "0.73rem" }}>{tier.subtitle}</span>
      </div>

      <div style={{
        background: "rgba(0,0,0,0.4)", borderRadius: "8px", padding: "10px 14px",
        fontSize: "0.7rem", color: "#c5c6c7", display: "flex", flexDirection: "column", gap: "4px",
      }}>
        <span>Price: <strong style={{ color: tier.color }}>{tier.priceRange}</strong></span>
        <span>Cap: <strong style={{ color: "#fff" }}>{tier.totalCap}</strong></span>
        <span>Per player: <strong style={{ color: "#ffd700" }}>{tier.playerCap}</strong></span>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
        {tier.items.map((item) => {
          const tbd = item.qty === "TBD";
          return (
            <li key={item.name} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "5px 10px",
              background: tbd ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.3)",
              borderRadius: "6px", fontSize: "0.7rem", opacity: tbd ? 0.5 : 1,
            }}>
              <span style={{ color: "#e0e0e0" }}>{item.name}</span>
              <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                <span style={{ color: tbd ? "#555" : tier.color, fontWeight: "bold" }}>{item.qty}</span>
                {!tbd && item.price && (
                  <span style={{ color: "#999", fontSize: "0.6rem" }}>{item.price}</span>
                )}
                {!tbd && item.max && (
                  <span style={{
                    color: "#ffd700", fontSize: "0.6rem",
                    background: "rgba(255,215,0,0.12)", padding: "1px 5px", borderRadius: "3px",
                  }}>{item.max}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── FAQ accordion ────────────────────────────────────────────────────────────
function FAQAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {faqs.map((faq, i) => (
        <div key={i} style={{
          background: "rgba(0,0,0,0.5)", border: "1px solid #45a29e",
          borderRadius: "8px", overflow: "hidden",
        }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%", background: "none", border: "none",
              color: "#66fcf1", fontFamily: "Orbitron, sans-serif",
              fontSize: "0.75rem", textAlign: "left",
              padding: "12px 16px", cursor: "pointer",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <span>{faq.q}</span>
            <span style={{ color: "#45a29e", fontSize: "1rem", marginLeft: "8px" }}>
              {open === i ? "−" : "+"}
            </span>
          </button>
          {open === i && (
            <div style={{ padding: "0 16px 14px", color: "#c5c6c7", fontSize: "0.76rem", lineHeight: "1.65" }}>
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Shared section blocks ────────────────────────────────────────────────────
function StatusBadge({ status }: { status: keyof typeof STATUS_COLORS }) {
  const s = STATUS_COLORS[status];
  return (
    <div style={{ textAlign: "center", marginBottom: "20px" }}>
      <span style={{
        display: "inline-block", padding: "4px 18px",
        border: `2px solid ${s.border}`, borderRadius: "20px",
        background: s.bg, color: s.text,
        fontSize: "0.75rem", fontWeight: "bold", letterSpacing: "2px",
      }}>
        {status}
      </span>
    </div>
  );
}

function RulesBlock({ rules }: { rules: string[] }) {
  return (
    <div style={{
      background: "rgba(0,0,0,0.6)", border: "2px solid #45a29e",
      borderRadius: "12px", padding: "24px 20px",
    }}>
      <h3 style={{
        color: "#66fcf1", fontSize: "0.88rem", textTransform: "uppercase",
        letterSpacing: "2px", margin: "0 0 16px 0",
      }}>
        Rules &amp; How to Participate
      </h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
        {rules.map((rule, i) => (
          <li key={i} style={{
            color: "#c5c6c7", fontSize: "0.78rem", lineHeight: "1.6",
            paddingLeft: "18px", position: "relative",
          }}>
            <span style={{ position: "absolute", left: 0, color: "#45a29e", fontWeight: "bold" }}>•</span>
            {rule}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoyaltyBlock({ note }: { note: string }) {
  return (
    <div style={{
      background: "rgba(255,215,0,0.06)", border: "2px solid #ffd700",
      borderRadius: "12px", padding: "20px",
    }}>
      <h3 style={{
        color: "#ffd700", fontSize: "0.85rem", letterSpacing: "2px",
        textTransform: "uppercase", margin: "0 0 12px 0",
      }}>
        ★ Loyalty Multiplier — Tier D Exclusive
      </h3>
      <p style={{ color: "#c5c6c7", fontSize: "0.78rem", lineHeight: "1.7", margin: 0 }}>
        {note}
      </p>
    </div>
  );
}

// ─── Simple upcoming card (Event 4+, TBD pricing) ────────────────────────────
type SimpleUpcoming = typeof EVENT4;

function SimpleUpcomingCard({ event }: { event: SimpleUpcoming }) {
  const label = event.title.split("—")[1]?.trim() ?? event.title;
  return (
    <div style={{
      background: "rgba(0,0,0,0.4)", border: "2px solid #45a29e",
      borderRadius: "12px", padding: "24px 20px", marginBottom: "24px",
    }}>
      <p style={{
        textAlign: "center", color: "#c5c6c7", fontSize: "0.65rem",
        letterSpacing: "2px", marginBottom: "10px", textTransform: "uppercase",
      }}>
        {label} starts in
      </p>
      <Countdown target={event.startDate} />

      <h2 style={{
        textAlign: "center", color: "#66fcf1", fontSize: "1rem",
        letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px",
      }}>
        {event.title}
      </h2>
      <p style={{ textAlign: "center", color: "#ffd700", fontSize: "0.72rem", letterSpacing: "1px", marginBottom: "12px" }}>
        {event.dateRange}
      </p>
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <span style={{
          display: "inline-block", padding: "3px 14px",
          border: "2px solid #ffd700", borderRadius: "20px",
          background: "rgba(255,215,0,0.1)", color: "#ffd700",
          fontSize: "0.68rem", letterSpacing: "2px",
        }}>
          UPCOMING
        </span>
      </div>

      <p style={{ color: "#c5c6c7", fontSize: "0.78rem", lineHeight: "1.6", textAlign: "center", marginBottom: "18px" }}>
        {event.description}
      </p>

      <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "18px" }}>
        {event.tiers.map((tier, i) => (
          <span key={tier} style={{
            padding: "4px 14px", border: `1px solid ${TC[i].border}`,
            borderRadius: "20px", color: TC[i].color,
            fontSize: "0.68rem", letterSpacing: "1px", background: TC[i].bg,
          }}>
            {tier}
          </span>
        ))}
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        {event.rules.map((rule, i) => (
          <li key={i} style={{
            color: "#c5c6c7", fontSize: "0.74rem",
            paddingLeft: "16px", position: "relative", lineHeight: "1.55",
          }}>
            <span style={{ position: "absolute", left: 0, color: "#45a29e" }}>•</span>
            {rule}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider({ label }: { label: string }) {
  return (
    <div style={{ position: "relative", textAlign: "center", margin: "50px 0 40px" }}>
      <div style={{ borderTop: "2px solid #45a29e" }} />
      <span style={{
        position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)",
        background: "#0b0c10", padding: "0 20px",
        color: "#45a29e", fontSize: "0.68rem", letterSpacing: "3px", textTransform: "uppercase",
      }}>
        {label}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GuildEventsPage() {
  return (
    <div style={{
      width: "100%", minHeight: "100vh", backgroundColor: "#0b0c10",
      fontFamily: "Orbitron, sans-serif", color: "#66fcf1",
      overflowX: "hidden", paddingBottom: "80px",
    }}>
      {/* Top bar */}
      <div style={{
        background: "rgba(0,0,0,0.8)", borderBottom: "2px solid #45a29e",
        padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{
          color: "#45a29e", textDecoration: "none",
          fontSize: "0.85rem", fontWeight: "bold", fontFamily: "Orbitron, sans-serif",
        }}>
          &larr; MOTHERSHIP
        </Link>
        <span style={{ fontSize: "0.7rem", color: "#c5c6c7", letterSpacing: "2px", textTransform: "uppercase" }}>
          Guild Events
        </span>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "30px 16px" }}>

        {/* ══════════════════ EVENT 2 — ACTIVE ══════════════════ */}
        <h1 style={{
          fontSize: "1.8rem", textAlign: "center",
          textShadow: "0 0 15px #66fcf1", letterSpacing: "3px",
          textTransform: "uppercase", marginBottom: "6px",
        }}>
          {EVENT2.title}
        </h1>
        <p style={{ textAlign: "center", color: "#ffd700", fontSize: "0.75rem", letterSpacing: "2px", marginBottom: "14px" }}>
          {EVENT2.dateRange}
        </p>
        <StatusBadge status={EVENT2.status} />
        <p style={{
          textAlign: "center", color: "#c5c6c7", fontSize: "0.85rem",
          lineHeight: "1.7", maxWidth: "680px", margin: "0 auto 34px auto",
        }}>
          {EVENT2.description}
        </p>

        {/* Registered Players */}
        <div style={{
          background: "rgba(0,0,0,0.5)", border: "2px solid #45a29e",
          borderRadius: "12px", padding: "20px", marginBottom: "30px",
        }}>
          <h3 style={{
            color: "#66fcf1", fontSize: "0.82rem", letterSpacing: "2px",
            textTransform: "uppercase", margin: "0 0 14px 0",
          }}>
            Registered Players ({EVENT2.registeredPlayers.length})
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {EVENT2.registeredPlayers.map((p) => (
              <span key={p} style={{
                padding: "4px 12px",
                background: "rgba(0,255,65,0.08)", border: "1px solid #00ff41",
                borderRadius: "20px", color: "#00ff41", fontSize: "0.72rem",
              }}>
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Tiers */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px", marginBottom: "30px",
        }}>
          {EVENT2.tiers.map((tier) => <TierCard key={tier.name} tier={tier} />)}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "30px" }}>
          <LoyaltyBlock note={EVENT2.loyaltyNote} />
          <RulesBlock rules={EVENT2.rules} />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h3 style={{
            color: "#66fcf1", fontSize: "0.88rem", textTransform: "uppercase",
            letterSpacing: "2px", marginBottom: "16px",
          }}>
            How It Works — FAQ
          </h3>
          <FAQAccordion faqs={EVENT2.faqs} />
        </div>

        {/* ══════════════════ EVENT 3 — UPCOMING ══════════════════ */}
        <Divider label="Upcoming Events" />

        <p style={{
          textAlign: "center", color: "#c5c6c7", fontSize: "0.65rem",
          letterSpacing: "2px", marginBottom: "10px", textTransform: "uppercase",
        }}>
          Event 3 starts in
        </p>
        <Countdown target={EVENT3.startDate} />

        <h2 style={{
          fontSize: "1.5rem", textAlign: "center",
          textShadow: "0 0 10px #ffd700", letterSpacing: "3px",
          textTransform: "uppercase", marginBottom: "6px", color: "#ffd700",
        }}>
          {EVENT3.title}
        </h2>
        <p style={{ textAlign: "center", color: "#ffd700", fontSize: "0.75rem", letterSpacing: "2px", marginBottom: "14px" }}>
          {EVENT3.dateRange}
        </p>
        <StatusBadge status={EVENT3.status} />
        <p style={{
          textAlign: "center", color: "#c5c6c7", fontSize: "0.85rem",
          lineHeight: "1.7", maxWidth: "680px", margin: "0 auto 34px auto",
        }}>
          {EVENT3.description}
        </p>

        {/* Event 3 Tiers */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px", marginBottom: "30px",
        }}>
          {EVENT3.tiers.map((tier) => <TierCard key={tier.name} tier={tier} />)}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "50px" }}>
          <LoyaltyBlock note={EVENT3.loyaltyNote} />
          <RulesBlock rules={EVENT3.rules} />
        </div>

        {/* ══════════════════ EVENT 4 — SIMPLE CARD ══════════════════ */}
        <SimpleUpcomingCard event={EVENT4} />

      </div>
    </div>
  );
}
