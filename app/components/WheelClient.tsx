
"use client";
import { triggerClaim } from "@/api/triggerClaim";
import { useAlienPoints } from "@/context/AlienPointContext";
import { useAccount } from "wagmi";
import { useState } from "react";

export default function WheelClient() {
  const { address } = useAccount();
  const alien = useAlienPoints();
  const alienPoints = alien?.alienPoints ?? 100;
  const setAlienPoints = alien?.setAlienPoints ?? (() => {});
  const [pool, setPool] = useState(100000000);

  const handleSpinComplete = async () => {
    const reward = await triggerClaim();
    setAlienPoints(reward);
    setPool((prev) => prev - reward);
  };

  return (
    <div className="text-blue-400 text-sm z-50 text-center drop-shadow-lg mt-8">
      <div className="mb-2">Alien Points: {alienPoints}</div>
      <div className="mb-4">Pool: {pool.toLocaleString()}</div>
      <button onClick={handleSpinComplete} className="bg-green-500 text-black px-4 py-2 rounded">
        ?? Spin the Wheel
      </button>
    </div>
  );
}
