"use client";
import SwapInput from "../components/SwapInput";

export default function PresalePage() {
  const gmbSold = 0;
  const totalGmb = 350_000_000;
  const progressPercent = (gmbSold / totalGmb) * 100;

  return (
    <main style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "Orbitron, sans-serif",
      backgroundColor: "#000",
      color: "#0ff",
      padding: "2rem"
    }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Presale Dashboard</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Presale Price: $0.0000441 per GMB</p>
      <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
        Presale Progress: {gmbSold.toLocaleString()} / {totalGmb.toLocaleString()} GMB sold
      </p>

      <div style={{
        width: "100%",
        maxWidth: "600px",
        backgroundColor: "#222",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "2rem"
      }}>
        <div style={{
          width: `${progressPercent}%`,
          backgroundColor: "#0f0",
          height: "24px",
          transition: "width 0.5s ease"
        }} />
      </div>

      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "2rem",
        marginBottom: "2rem"
      }}>
        <img id="nyx" src="/media/nyx.png" alt="Nyx" style={{ width: "600px", height: "auto" }} />
        <SwapInput />
        <img id="zorb" src="/media/zorb.png" alt="Zorb" style={{ width: "600px", height: "auto" }} />
      </div>

      <h2>GMB Tokenomics</h2>
      <ul>
        <li>Total Supply: 1,000,000,000 GMB</li>
        <li>Presale Allocation: 350,000,000 GMB</li>
        <li>Liquidity Pool: 300,000,000 GMB</li>
        <li>Team & Treasury: 200,000,000 GMB</li>
        <li>Community Rewards: 150,000,000 GMB</li>
      </ul>

      <h2 style={{ marginTop: "2rem" }}>Presale Price Projection</h2>
      <p>Current Presale Price: $0.0000441 per GMB</p>
      <table style={{ width: "100%", maxWidth: "600px", marginTop: "1rem", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #0ff" }}>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>GMB Sold</th>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>Estimated Launch Price</th>
            <th style={{ textAlign: "left", padding: "0.5rem" }}>Multiplier</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={{ padding: "0.5rem" }}>100M</td><td>$0.0001323</td><td>�3</td></tr>
          <tr><td style={{ padding: "0.5rem" }}>200M</td><td>$0.0002646</td><td>�6</td></tr>
          <tr><td style={{ padding: "0.5rem" }}>300M</td><td>$0.0003969</td><td>�9</td></tr>
          <tr><td style={{ padding: "0.5rem" }}>350M</td><td>$0.0004410</td><td>�10</td></tr>
        </tbody>
      </table>

      <h2 style={{ marginTop: "2rem" }}>Presale ETH Allocation</h2>
      <ul>
        <li>Liquidity Pool: 60% ? 0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b</li>
        <li>Marketing & Community: 25% ? 0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b</li>
        <li>Treasury Reserve: 15% ? 0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b</li>
      </ul>
      <p style={{ marginTop: "1rem" }}>Funds are transparently allocated. Liquidity will be locked at launch.</p>
    </main>
  );
}



export const dynamic = "force-dynamic";


export const preferredRegion = "iad1";

export const runtime = "nodejs";

