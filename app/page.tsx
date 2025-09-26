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
  const [visitorList, setVisitorList] = useState<string[]>([]);
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
  <>
    <video autoPlay muted loop id="bg-video">
      <source src="/alien.mp4" type="video/mp4" />
    </video>
    <main>
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
      </div>
    </main>
  </>
);
}





















































