"use client";
import WagmiWrapper from "./components/WagmiWrapper";
import WalletHUD from "./client/WalletHUD";
import AlienBalance from "./client/AlienBalance";
import HUDBar from "./client/HUDBar";

export default function HUDPage() {
  return (
    <WagmiWrapper>
      <HUDBar />
      <WalletHUD />
      {/* Pass wallet address here if AlienBalance requires it */}
      {/* <AlienBalance wallet={address} /> */}
    </WagmiWrapper>
  );
}
