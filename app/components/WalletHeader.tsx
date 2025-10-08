"use client";

import { useAccount } from "wagmi";

export default function WalletHeader() {
  const { address } = useAccount();

  return (
    <header>
      <p>Connected wallet: {address}</p>
    </header>
  );
}

