"use client";
import WalletHUD from "./client/WalletHUD";
import AlienBalance from "./client/AlienBalance";
import HUDBar from "./client/HUDBar";

export default function HUDPage() {
  return (
    <>
      <HUDBar />
      <WalletHUD />
      {/* Pass wallet address here if AlienBalance requires it */}
      {/* <AlienBalance wallet={address} /> */}
    </>
  );
}
