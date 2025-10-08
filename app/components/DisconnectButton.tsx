"use client";

import { useDisconnect } from "wagmi";

export default function DisconnectButton() {
  const { disconnect } = useDisconnect();

  return (
    <button
      onClick={() => disconnect()}
      style={{
        padding: "0.5rem 1rem",
        fontSize: "1rem",
        borderRadius: "8px",
        backgroundColor: "#900",
        color: "white",
        border: "1px solid red",
        cursor: "pointer",
        marginLeft: "1rem"
      }}
    >
      Disconnect Wallet
    </button>
  );
}

