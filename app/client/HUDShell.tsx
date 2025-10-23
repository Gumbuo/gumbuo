"use client";
import { useAccount } from "wagmi";
import WagmiWrapper from "../components/WagmiWrapper";
import WalletHUD from "./WalletHUD";
import AlienBalance from "./AlienBalance";
import HUDBar from "./HUDBar";

export default function HUDShell() {
  const { address } = useAccount();

  return (
    <WagmiWrapper>
      <HUDBar />
      <WalletHUD />
      {address && <AlienBalance wallet={address} />}
    </WagmiWrapper>
  );
}
