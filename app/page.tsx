"use client";

import { useEffect, useState } from "react";
import { useAddress, useDisconnect } from "@thirdweb-dev/react";
import { createThirdwebClient } from "@thirdweb-dev/sdk";

const client = createThirdwebClient({
  clientId: "f985d3ebee58e34a49d8a57f6410b2ec"
});

export default function Page() {
  const address = useAddress();
  const disconnect = useDisconnect();
  const [_, forceUpdate] = useState(0);

  useEffect(() => {
    if (address) {
      forceUpdate(n => n + 1);
    }
  }, [address]);

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "600px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "Orbitron, sans-serif",
      color: "#00ffcc"
    }}>
      <h2>Gumbuo’s 1st Astral Airdrop List</h2>

      {address ? (
        <p>Connected as {address}</p>
      ) : (
        <p>Connect your wallet to enter the mothership.</p>
      )}

      {/* Placeholder for future swap logic */}
      <div style={{
        marginTop: "2rem",
        padding: "1rem",
        border: "1px dashed #00ffcc",
        borderRadius: "8px",
        textAlign: "center"
      }}>
        <p>SwapWidget temporarily disabled while we stabilize the build.</p>
      </div>

      <div style={{
        marginTop: "2rem",
        textAlign: "center"
      }}>
        <p>Join the Gumbuo community:</p>
        <a
          href="https://discord.gg/kbWrjAdqhv"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginRight: "1rem",
            color: "#00ffcc",
            textDecoration: "underline"
          }}
        >
          Discord
        </a>
        <a
          href="https://x.com/gumbuogw3"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#00ffcc",
            textDecoration: "underline"
          }}
        >
          X (Twitter)
        </a>
      </div>
    </div>
  );
}
