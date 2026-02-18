"use client";
import Link from "next/link";

// ─── Event Data (edit this for each new event) ─────────────────────────────────
const EVENT = {
  title: "NomStead Guild Item Exchange",
  description:
    "Tiered item exchange event for NomStead guild members. Pick a tier, send your items, and receive payment based on the pricing below.",
  status: "ACTIVE" as const,
  tiers: [
    {
      name: "Tier A",
      subtitle: "Basic Items",
      color: "#00ff41",
      border: "#00ff41",
      bg: "rgba(0, 255, 65, 0.08)",
      pricePerItem: "$0.00083",
      playerCap: "$5 max per player",
      totalCap: "6,000 items",
      items: [
        { name: "Cotton", qty: "1k" },
        { name: "Potatoes", qty: "1k" },
        { name: "Red Flower", qty: "1k" },
        { name: "Blue Flower", qty: "1k" },
        { name: "Yellow Flower", qty: "1k" },
        { name: "Grapes", qty: "1k" },
      ],
    },
    {
      name: "Tier B",
      subtitle: "Mid-Tier Crafted Items",
      color: "#00d9ff",
      border: "#00d9ff",
      bg: "rgba(0, 217, 255, 0.08)",
      pricePerItem: "$0.001",
      playerCap: "$5 max per player",
      totalCap: "5,000 items",
      items: [
        { name: "Wrapped Potato", qty: "1k" },
        { name: "Fries", qty: "1k" },
        { name: "Veggie Salad", qty: "1k" },
        { name: "Soil", qty: "1k", note: "$0.002 each" },
      ],
    },
    {
      name: "Tier C",
      subtitle: "High-Tier Items",
      color: "#b44dff",
      border: "#b44dff",
      bg: "rgba(180, 77, 255, 0.08)",
      pricePerItem: "$0.10 / cake",
      playerCap: "$5 max per player",
      totalCap: "50 cakes",
      items: [
        { name: "Golden Potato Cake", qty: "x10" },
        { name: "Pumpkin Spice Cake", qty: "x10" },
        { name: "Carrot Cake", qty: "x10" },
        { name: "Grape Tart Cake", qty: "x10" },
        { name: "Upside-Down Tomato Cake", qty: "x10" },
      ],
    },
  ],
  rules: [
    "Each player is capped at $5 per tier.",
    "Items must be sent to the guild vault before payout.",
    "Soil in Tier B is priced at $0.002 each (double the base rate).",
    "Tier caps are first-come, first-served — once the total cap is hit, the tier closes.",
    "PM FoxHole on Discord to coordinate your exchange.",
  ],
};

// ─── Status badge color map ────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ACTIVE: { bg: "rgba(0,255,65,0.15)", text: "#00ff41", border: "#00ff41" },
  UPCOMING: { bg: "rgba(255,215,0,0.15)", text: "#ffd700", border: "#ffd700" },
  ENDED: { bg: "rgba(255,71,87,0.15)", text: "#ff4757", border: "#ff4757" },
};

export default function GuildEventsPage() {
  const statusStyle = STATUS_COLORS[EVENT.status] ?? STATUS_COLORS.ACTIVE;

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#0b0c10",
        fontFamily: "Orbitron, sans-serif",
        color: "#66fcf1",
        overflowX: "hidden",
        paddingBottom: "60px",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          background: "rgba(0,0,0,0.8)",
          borderBottom: "2px solid #45a29e",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            color: "#45a29e",
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: "bold",
            fontFamily: "Orbitron, sans-serif",
          }}
        >
          &larr; MOTHERSHIP
        </Link>
        <span
          style={{
            fontSize: "0.7rem",
            color: "#c5c6c7",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          Guild Events
        </span>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "30px 16px" }}>
        {/* Title */}
        <h1
          style={{
            fontSize: "2rem",
            textAlign: "center",
            textShadow: "0 0 15px #66fcf1",
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          {EVENT.title}
        </h1>

        {/* Status badge */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 18px",
              border: `2px solid ${statusStyle.border}`,
              borderRadius: "20px",
              background: statusStyle.bg,
              color: statusStyle.text,
              fontSize: "0.75rem",
              fontWeight: "bold",
              letterSpacing: "2px",
            }}
          >
            {EVENT.status}
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            textAlign: "center",
            color: "#c5c6c7",
            fontSize: "0.85rem",
            lineHeight: "1.7",
            maxWidth: "650px",
            margin: "0 auto 40px auto",
          }}
        >
          {EVENT.description}
        </p>

        {/* Tier Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          {EVENT.tiers.map((tier) => (
            <div
              key={tier.name}
              style={{
                background: tier.bg,
                border: `2px solid ${tier.border}`,
                borderRadius: "12px",
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {/* Tier header */}
              <div>
                <h2
                  style={{
                    color: tier.color,
                    fontSize: "1.2rem",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                  }}
                >
                  {tier.name}
                </h2>
                <span
                  style={{
                    color: "#c5c6c7",
                    fontSize: "0.75rem",
                  }}
                >
                  {tier.subtitle}
                </span>
              </div>

              {/* Pricing info */}
              <div
                style={{
                  background: "rgba(0,0,0,0.4)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "0.72rem",
                  color: "#c5c6c7",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span>
                  Price: <strong style={{ color: tier.color }}>{tier.pricePerItem}</strong>
                </span>
                <span>
                  Cap: <strong style={{ color: "#fff" }}>{tier.totalCap}</strong>
                </span>
                <span>
                  Per player: <strong style={{ color: "#ffd700" }}>{tier.playerCap}</strong>
                </span>
              </div>

              {/* Item list */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {tier.items.map((item) => (
                  <li
                    key={item.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 10px",
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                    }}
                  >
                    <span style={{ color: "#e0e0e0" }}>{item.name}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: tier.color, fontWeight: "bold" }}>{item.qty}</span>
                      {item.note && (
                        <span
                          style={{
                            color: "#ffd700",
                            fontSize: "0.65rem",
                            background: "rgba(255,215,0,0.15)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {item.note}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Rules */}
        <div
          style={{
            background: "rgba(0,0,0,0.6)",
            border: "2px solid #45a29e",
            borderRadius: "12px",
            padding: "24px 20px",
          }}
        >
          <h3
            style={{
              color: "#66fcf1",
              fontSize: "1rem",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginTop: 0,
              marginBottom: "16px",
            }}
          >
            Rules &amp; How to Participate
          </h3>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {EVENT.rules.map((rule, i) => (
              <li
                key={i}
                style={{
                  color: "#c5c6c7",
                  fontSize: "0.8rem",
                  lineHeight: "1.6",
                  paddingLeft: "18px",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    color: "#45a29e",
                    fontWeight: "bold",
                  }}
                >
                  &bull;
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
