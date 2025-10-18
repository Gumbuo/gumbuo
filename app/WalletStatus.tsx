"use client";
import { useAddress } from "@thirdweb-dev/react";

export default function WalletStatus() {
  const address = useAddress();
  return (
    <div>
      {address ? (
        <p>Connected wallet: {address}</p>
      ) : (
        <p>No wallet connected</p>
      )}
    </div>
  );
}
