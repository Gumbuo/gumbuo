"use client";

import { useConnect } from "wagmi";
import { injected, metaMask, coinbaseWallet } from "@wagmi/connectors";

export default function ConnectButton() {
  const { connect } = useConnect();

  return (
    <div style={{ margin: "2rem", display: "flex", flexDirection: "column", gap: "1rem", fontSize: "1.5rem", color: "white" }}>
      <button onClick={() => connect({ connector: injected() })}>Connect with Injected</button>
      <button onClick={() => connect({ connector: metaMask() })}>Connect with MetaMask</button>
      <button onClick={() => connect({ connector: coinbaseWallet() })}>Connect with Coinbase</button>
    </div>
  );
}
