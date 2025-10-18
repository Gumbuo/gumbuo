
"use client";
import { useAlienPoints } from "@/context/AlienPointContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect, useBalance, useAccount } from "wagmi";

export default function HUD() {
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const alien = useAlienPoints();
  const points = alien?.alienPoints ?? 100;

  const { data: gmbBalance } = useBalance({ address });

  return (
    <div className="absolute top-4 right-4 text-blue-400 text-sm z-50 text-right drop-shadow-lg">
      <ConnectButton />
      <div className="mt-2">Alien Points: {points}</div>
      <div>GMB: {gmbBalance?.formatted ?? "0"}</div>
      <div>Pool: 100,000,000</div>
    </div>
  );
}
