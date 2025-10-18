"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "@wagmi/connectors";

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const shortAddress = address ? `${address.slice(0, 6)}...` : "";

  const handleConnect = () => {
    disconnect(); // Clear ghost wallet
    const connector = connectors.find(c => c.id === "injected");
    if (connector) connect({ connector });
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      {isConnected ? (
        <>
          <span style={{ color: "#0ff", marginRight: "1rem" }}>
            Connected: {shortAddress}
          </span>
          <button
            onClick={() => disconnect()}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f00",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer"
            }}
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={handleConnect}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#0ff",
            color: "#000",
            fontWeight: "bold",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
