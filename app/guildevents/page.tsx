"use client";
import Link from "next/link";
import activityData from "./activity-data.json";

// ── Types ──────────────────────────────────────────────────────────────────────
type Player = {
  name: string;
  score: number;
  harvested: Record<string, number>;
  planted: Record<string, number>;
  trees: number;
  mined: Record<string, number>;
  fished: Record<string, number>;
  quests: Record<string, number>;
  unplanted: Record<string, number>;
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function sorted(map: Record<string, number>): [string, number][] {
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}
function sum(map: Record<string, number>) {
  return Object.values(map).reduce((a, b) => a + b, 0);
}
function fmt(n: number) {
  return n.toLocaleString();
}

const MEDALS = ["🥇", "🥈", "🥉"];

// Players exempt from the harvest-without-planting violation flag
const VIOLATION_EXEMPT = ["Dravyn"];

function isHarvestViolator(player: Player): boolean {
  if (VIOLATION_EXEMPT.includes(player.name)) return false;
  return sum(player.harvested) > 0 && sum(player.planted) === 0;
}

// ── Mini table ─────────────────────────────────────────────────────────────────
function MiniTable({ rows, unit = "" }: { rows: [string, number][]; unit?: string }) {
  return (
    <table style={{ borderCollapse: "collapse", fontSize: "0.72rem", width: "100%" }}>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <td style={{ padding: "2px 10px 2px 0", color: "#c5c6c7" }}>{k}</td>
            <td style={{ padding: "2px 0", textAlign: "right", color: "#66fcf1", fontWeight: "bold" }}>
              {fmt(v)}{unit}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Section block inside a player card ────────────────────────────────────────
function CardSection({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ minWidth: "140px" }}>
      <div style={{
        fontSize: "0.65rem", letterSpacing: "1px", textTransform: "uppercase",
        color: "#45a29e", marginBottom: "6px", fontWeight: "bold",
      }}>
        {emoji} {title}
      </div>
      {children}
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────────
function Badge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span style={{
      display: "inline-block",
      background: color + "22",
      border: `1px solid ${color}`,
      color,
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "0.65rem",
      marginRight: "5px",
      marginBottom: "4px",
      whiteSpace: "nowrap",
    }}>
      {label}: <strong>{value}</strong>
    </span>
  );
}

// ── Player card ────────────────────────────────────────────────────────────────
function PlayerCard({ player, rank }: { player: Player; rank: number }) {
  const violation = isHarvestViolator(player);
  const harv = sorted(player.harvested);
  const plant = sorted(player.planted);
  const mine = sorted(player.mined);
  const fish = sorted(player.fished);
  const quest = sorted(player.quests);

  const totalHarv  = sum(player.harvested);
  const totalPlant = sum(player.planted);
  const totalMine  = sum(player.mined);
  const totalFish  = sum(player.fished);
  const totalQuest = sum(player.quests);

  const medal = rank < 3 ? MEDALS[rank] + " " : "";

  return (
    <div style={{
      background: violation ? "rgba(60,0,0,0.55)" : "rgba(0,0,0,0.45)",
      border: `1px solid ${violation ? "#ff2d2d" : "#45a29e"}`,
      borderRadius: "12px",
      padding: "18px 20px",
      marginBottom: "16px",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "baseline", gap: "10px",
        borderBottom: `1px solid ${violation ? "#ff2d2d44" : "#45a29e22"}`, paddingBottom: "10px", marginBottom: "12px",
      }}>
        <span style={{ fontSize: "0.65rem", color: violation ? "#ff2d2d" : "#45a29e", minWidth: "22px" }}>
          #{rank + 1}
        </span>
        <h3 style={{ margin: 0, fontSize: "1rem", color: violation ? "#ff6b6b" : "#66fcf1", letterSpacing: "1px" }}>
          {medal}{player.name}
        </h3>
        {violation && (
          <span style={{
            marginLeft: "auto", fontSize: "0.6rem", letterSpacing: "1px",
            color: "#ff2d2d", border: "1px solid #ff2d2d", borderRadius: "4px",
            padding: "2px 7px", textTransform: "uppercase", whiteSpace: "nowrap",
          }}>
            ⚠ Harvesting — Not Planting
          </span>
        )}
      </div>

      {/* Summary badges */}
      <div style={{ marginBottom: "14px" }}>
        {totalHarv  ? <Badge label="Harvested" value={fmt(totalHarv) + " items"}    color="#00ff41" /> : null}
        {totalPlant ? <Badge label="Planted"   value={fmt(totalPlant) + " seeds"}   color="#00d9ff" /> : null}
        {player.trees ? <Badge label="Wood"    value={fmt(player.trees)}            color="#c68642" /> : null}
        {totalMine  ? <Badge label="Mined"     value={fmt(totalMine) + " minerals"} color="#b44dff" /> : null}
        {totalFish  ? <Badge label="Fished"    value={fmt(totalFish) + " fish"}     color="#00d9ff" /> : null}
        {totalQuest ? <Badge label="Quest"     value={fmt(totalQuest) + " items"}   color="#ffd700" /> : null}
      </div>

      {/* Detail sections */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px 30px" }}>
        {harv.length > 0 && (
          <CardSection emoji="🌾" title="Harvested">
            <MiniTable rows={harv} />
          </CardSection>
        )}
        {plant.length > 0 && (
          <CardSection emoji="🌱" title="Planted">
            <MiniTable rows={plant} unit=" seeds" />
          </CardSection>
        )}
        {player.trees > 0 && (
          <CardSection emoji="🪓" title="Tree Chopping">
            <MiniTable rows={[["Wood collected", player.trees]]} />
          </CardSection>
        )}
        {mine.length > 0 && (
          <CardSection emoji="⛏️" title="Mining">
            <MiniTable rows={mine} />
          </CardSection>
        )}
        {fish.length > 0 && (
          <CardSection emoji="🎣" title="Fishing">
            <MiniTable rows={fish} />
          </CardSection>
        )}
        {quest.length > 0 && (
          <CardSection emoji="📋" title="Daily Quest">
            <MiniTable rows={quest} />
          </CardSection>
        )}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function GuildEventsPage() {
  const { date, totals, players } = activityData as unknown as {
    date: string;
    totals: {
      totalHarvested: number; totalPlanted: number; totalWood: number;
      totalMined: number; totalFish: number; totalQuest: number;
    };
    players: Player[];
  };

  const displayDate = new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

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
          Guild Activity
        </span>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "30px 16px" }}>

        {/* Title */}
        <h1 style={{
          fontSize: "1.6rem", textAlign: "center",
          textShadow: "0 0 15px #66fcf1", letterSpacing: "3px",
          textTransform: "uppercase", marginBottom: "6px",
        }}>
          Guild Activity Report
        </h1>
        <p style={{
          textAlign: "center", color: "#ffd700", fontSize: "0.75rem",
          letterSpacing: "2px", marginBottom: "30px",
        }}>
          {displayDate} · NomStead
        </p>

        {/* Summary box */}
        <div style={{
          background: "rgba(0,0,0,0.5)", border: "2px solid #45a29e",
          borderRadius: "12px", padding: "20px 24px", marginBottom: "36px",
        }}>
          <h2 style={{
            margin: "0 0 16px 0", fontSize: "0.8rem", letterSpacing: "2px",
            textTransform: "uppercase", color: "#45a29e",
          }}>
            Guild Totals
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 28px" }}>
            {[
              { emoji: "👥", label: "Active Members",       value: players.length },
              { emoji: "🌾", label: "Items Harvested",      value: totals.totalHarvested },
              { emoji: "🌱", label: "Seeds Planted",        value: totals.totalPlanted },
              { emoji: "🪓", label: "Wood Chopped",         value: totals.totalWood },
              { emoji: "⛏️", label: "Minerals Mined",       value: totals.totalMined },
              { emoji: "🎣", label: "Fish Caught",          value: totals.totalFish },
              { emoji: "📋", label: "Quest Contributions",  value: totals.totalQuest },
            ].map(({ emoji, label, value }) => (
              <div key={label} style={{ minWidth: "140px" }}>
                <div style={{ fontSize: "0.6rem", color: "#c5c6c7", letterSpacing: "1px", textTransform: "uppercase" }}>
                  {emoji} {label}
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#66fcf1", marginTop: "2px" }}>
                  {fmt(value)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player list */}
        <h2 style={{
          fontSize: "0.85rem", letterSpacing: "3px", textTransform: "uppercase",
          color: "#45a29e", marginBottom: "18px",
        }}>
          Member Contributions — Ranked by Activity
        </h2>

        {players.map((player, i) => (
          <PlayerCard key={player.name} player={player} rank={i} />
        ))}

        <p style={{
          textAlign: "center", color: "#45a29e66",
          fontSize: "0.6rem", letterSpacing: "1px", marginTop: "30px",
        }}>
          Generated from guild log · {date}
        </p>
      </div>
    </div>
  );
}
