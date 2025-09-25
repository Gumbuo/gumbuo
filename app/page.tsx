"use client";

import { useEffect, useState } from "react";
import { useAddress, useDisconnect, SwapWidget } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";

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
    <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h2>👽 Gumbuo’s 1st Astral Visitors Airdrop List</h2>

      <SwapWidget
        client={client}
        theme="dark"
        style={{
          borderRadius: "12px",
          backgroundColor: "#0f0f23",
          color: "#00ffcc",
          fontFamily: "Orbitron, sans-serif",
          boxShadow: "0 0 20px #00ffcc",
        }}
        prefill={{
          buyToken: {
            chainId: 8453,
            tokenAddress: "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0",
            amount: "10000000",
          },
          sellToken: {
            chainId: 8453,
          },
        }}
        onSuccess={(quote) => {
          fetch("/api/logPurchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wallet: address,
              amount: quote.buyAmount,
              txHash: quote.transactionHash,
            }),
          });
          alert("👽 You’re on the list!");
        }}
      />

      <div style={{
        marginTop: "2rem",
        textAlign: "center",
        fontFamily: "Orbitron, sans-serif",
        color: "#00ffcc"
      }}>
        <p>👽 Join the Gumbuo community:</p>
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


