"use client";

import { useEffect, useMemo, useState } from "react";
import { useAddress, useDisconnect } from "@thirdweb-dev/react";
import { SwapWidget } from "@thirdweb-dev/react";
import { createThirdwebClient } from "thirdweb";

const client = createThirdwebClient({
  clientId: "YOUR_CLIENT_ID" // Replace with your actual Thirdweb client ID
});

export default function Page() {
  const address = useAddress();
  const disconnect = useDisconnect();
  const [_, forceUpdate] = useState(0);

  useEffect(() => {
    if (address) {
      (async () => {
        await addWallet(address);
        forceUpdate(n => n + 1);
      })();
    }
  }, [address]);

  return (
    <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h2>?? Gumbuo’s 1st Astral Visitors Airdrop List</h2>
      <SwapWidget
        client={client}
        defaultBuyToken="0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0"
        defaultBuyAmount="10000000"
      />
    </div>
  );
}
