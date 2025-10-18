"use client";
import { useState } from "react";

export default function BuyGMB() {
  const [ethAmount, setEthAmount] = useState("");
  const gmbRate = 100_000_000;
  const gmbAmount = parseFloat(ethAmount || "0") * gmbRate;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <input
        type="number"
        placeholder="ETH amount"
        value={ethAmount}
        onChange={(e) => setEthAmount(e.target.value)}
        style={{
          padding: "0.5rem",
          fontSize: "1rem",
          marginRight: "1rem",
          borderRadius: "4px",
          border: "1px solid #0ff",
          backgroundColor: "#111",
          color: "#0ff"
        }}
      />
      <span style={{ fontSize: "1rem" }}>
        ≈ {gmbAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} GMB
      </span>
      <button
        onClick={() => window.location.href = `/buy?eth=${ethAmount}`}
        style={{
          marginLeft: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#0f0",
          color: "#000",
          fontWeight: "bold",
          borderRadius: "4px",
          border: "none",
          cursor: "pointer"
        }}
      >
        Buy GMB
      </button>
    </div>
  );
}
