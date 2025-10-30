"use client";
import { useAccount } from "wagmi";
import WalletHUD from "./WalletHUD";
import AlienBalance from "./AlienBalance";
import HUDBar from "./HUDBar";

export default function HUDShell() {
  const { address } = useAccount();

  return (
    <>
      <HUDBar />
      <WalletHUD />
      {address && <AlienBalance wallet={address} />}
    </>
  );
}
