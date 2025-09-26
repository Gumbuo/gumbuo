"use client";

import { useEffect, useState } from "react";
import { useAddress, useDisconnect, ConnectWallet } from "@thirdweb-dev/react";
import { createThirdwebClient } from "thirdweb";


const client = createThirdwebClient({
  clientId: "f985d3ebee58e34a49d8a57f6410b2ec"
});

export default function Page() {
  const address = useAddress();
  const disconnect = useDisconnect();
  const [visitorList, setVisitorList] = useState([]);
  const [_, forceUpdate] = useState(0);

  const devWallets = [
    "0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b",
    "alienog"
  ];
  const showDevControls = address ? devWallets.includes(address.toLowerCase()) : false;

  useEffect(() => {
    if (address) {
      fetch("/api/logConnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address }),
      });
      forceUpdate(n => n + 1);
    }

    fetch("/api/logConnect")
      .then(res => res.json())
      .then(data => setVisitorList(data.list || []));
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
      <img src="/logo.png" alt="Gumbuo Logo" style={{ width: "120px", marginBottom: "1rem" }} />
      <h2>Gumbuo’s 1st Astral Visitors Airdrop List</h2>

      {address ? (
        <>
          <p>Connected as {address}</p>
          <button
            onClick={disconnect}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#00ffcc",
              color: "#0f0f23",
              border: "none",
              borderRadius: "6px",
              fontFamily: "Orbitron, sans-serif",
              cursor: "pointer"
            }}
          >
            Disconnect Wallet
          </button>
        </>
      ) : (
        <>
          <p>Connect your wallet to enter the mothership.</p>
          <ConnectWallet theme="dark" />
        </>
      )}

      {address && (
        <div style={{
          marginTop: "2rem",
          padding: "1rem",
          borderRadius: "12px",
          backgroundColor: "#0f0f23",
          boxShadow: "0 0 20px #00ffcc"
        }}>
          <>`n  <iframe src="https://playground.thirdweb.com/bridge/swap-widget" style={{ width: "100%", height: "600px", border: "none" }} title="SwapWidget" />`n</>
        </div>
      )}

      <div style={{ marginTop: "2rem", textAlign: "left", width: "100%" }}>
        <h3>🚀 First 50 Astral Visitors</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {visitorList.map((wallet, i) => (
            <li key={wallet}>
              #{i + 1} — {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </li>
          ))}
        </ul>
      </div>

      {showDevControls && (
        <div style={{
          marginTop: "2rem",
          border: "1px solid #00ffcc",
          padding: "1rem"
        }}>
          <p>🛠 Dev Controls Active</p>
        </div>
      )}

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















