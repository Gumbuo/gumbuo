"use client";

import { useState, useEffect } from "react";
import { createThirdwebClient } from "thirdweb";
import { useAddress, useDisconnect, ConnectWallet } from "@thirdweb-dev/react";

type PurchaseEntry = {
  walletAddress: string;
  amount: number;
  tokenIn: string;
  tokenOut: string;
  timestamp: string;
};

export default function Page() {
  const [purchaseList, setPurchaseList] = useState<PurchaseEntry[]>([]);
  const [visitorList, setVisitorList] = useState([]);
  const [_, forceUpdate] = useState(0);

  const address = useAddress();
  const disconnect = useDisconnect();

  const PRESALE_CAP = 350000000;
  const SOLD = 12400000;
  const progressPercent = (SOLD / PRESALE_CAP) * 100;
  const projectedValuation = PRESALE_CAP * 0.000004;

  const client = createThirdwebClient({
    clientId: "f985d3ebee58e34a49d8a57f6410b2ec"
  });

  useEffect(() => {
    if (address) {
      fetch("/api/logPurchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address })
      }).then(() => {
        forceUpdate(n => n + 1);
      });
    }
  }, [address]);

  return (
    <>
      <video autoPlay muted loop id="bg-video">
        <source src="/alien.mp4" type="video/mp4" />
      </video>
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
        <h3>?? Gumbuo Presale Progress</h3>
        <p><strong>Price:</strong> $0.000004 per GMB</p>
        <p><strong>Presale Allocation:</strong> 350,000,000 GMB</p>
        <p><strong>Total Supply:</strong> 1,000,000,000 GMB</p>
        <p><strong>Liquidity Pool:</strong> 15%</p>
        <p><strong>Team Reserve:</strong> 5%</p>
        <p><strong>Launch Valuation:</strong> ~$4,000</p>

        <div style={{
          marginTop: "1rem",
          padding: "0.75rem",
          backgroundColor: "#0f0f23",
          borderRadius: "8px",
          boxShadow: "0 0 10px #00ffcc",
          fontFamily: "Orbitron, sans-serif",
          color: "#00ffcc",
          textAlign: "center"
        }}>
          <p><strong>Contract Address:</strong></p>
          <p style={{ wordBreak: "break-word" }}>
            0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0
          </p>
          <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
            You can import this token manually in MetaMask.
          </p>
        </div>

        <div style={{ marginTop: "2rem", width: "100%" }}>
          <h3>?? Presale Progress</h3>
          <div style={{
            width: "100%",
            background: "#222",
            borderRadius: "8px",
            overflow: "hidden",
            height: "16px",
            marginBottom: "0.5rem"
          }}>
            <div style={{
              width: `${progressPercent}%`,
              background: "#00ffcc",
              height: "100%"
            }} />
          </div>
          <p><strong>Sold:</strong> {SOLD.toLocaleString()} GMB</p>
          <p><strong>Remaining:</strong> {(PRESALE_CAP - SOLD).toLocaleString()} GMB</p>
          <p><strong>Projected Valuation:</strong> ${projectedValuation.toLocaleString()}</p>
        </div>

        <button
          onClick={() =>
            window.open(
              `https://playground.thirdweb.com/bridge/swap-widget?walletAddress=${address || ""}`,
              "_blank"
            )
          }
          style={{
            marginTop: "2rem",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#00ffcc",
            color: "#0f0f23",
            border: "none",
            borderRadius: "8px",
            fontFamily: "Orbitron, sans-serif",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 0 10px #00ffcc"
          }}
        >
          ?? Buy Gumbuo
        </button>

        {address ? (
          <>
            <p style={{ marginTop: "1rem" }}>Connected as {address}</p>
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
            <p style={{ marginTop: "1rem" }}>Connect your wallet to enter the mothership.</p>
            <ConnectWallet theme="dark" />
          </>
        )}

        <div style={{ marginTop: "4rem", textAlign: "left", width: "100%" }}>
          <h3>?? Recent Gumbuo Purchases</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {(purchaseList as PurchaseEntry[]).map((entry, i) => (
              <li key={i}>
                #{i + 1} — {entry.walletAddress?.slice(0, 6)}...{entry.walletAddress?.slice(-4)} swapped {entry.amount} {entry.tokenIn} ? {entry.tokenOut} @ {new Date(entry.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}



export const dynamic = "force-dynamic";

export const runtime = "nodejs";

export const preferredRegion = "iad1";

export const runtime = "nodejs";
