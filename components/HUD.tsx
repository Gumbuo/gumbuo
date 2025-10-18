
"use client";
import { useAlienPoints } from "@/context/AlienPointContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";

export default function HUD() {
  const { disconnect } = useDisconnect();
  const alien = useAlienPoints();
  const points = alien?.alienPoints ?? 100;

  return (
    <div className="absolute top-4 right-4 text-white text-sm z-50 text-right">
      <ConnectButton />
      <div className="mt-2">Alien Points: {points}</div>
      <div>Pool: 100,000,000</div>
    </div>
  );
}
