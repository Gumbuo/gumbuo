"use client";
import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function WalletConnectButtons() {
  const { isConnected, address } = useAccount();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (isConnected && address) {
      ["nyx", "zorb"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.add("animate");
          setTimeout(() => el.classList.remove("animate"), 8000);
        }
      });
      fetch("/api/logConnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, timestamp: Date.now() })
      });
    }
  }, [isConnected]);

  return (
    <div style={{
      position: "fixed",
      top: "1rem",
      right: "1rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "1rem",
      zIndex: 9999
    }}>
      <ConnectButton.Custom>
        {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <div>
              {!connected ? (
                <button onClick={openConnectModal} style={{
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  backgroundColor: "#0f0",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}>
                  Connect Wallet
                </button>
              ) : (
                <button onClick={openAccountModal} style={{
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  backgroundColor: "#0f0",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}>
                  {account.displayName}
                </button>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}

