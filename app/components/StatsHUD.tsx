"use client";
import { useEffect, useState } from "react";
import { useAlienPoints } from "../context/AlienPointContext";
import { useBalance, useAccount } from "wagmi";

export default function StatsHUD() {
  const alien = useAlienPoints();
  const [points, setPoints] = useState(100);
  const [gmb, setGmb] = useState("0");

  const { data: gmbBalance } = useBalance({
    token: "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0",
    query: { enabled: true },
  });

  useEffect(() => {
    if (alien?.alienPoints !== undefined) {
      setPoints(alien.alienPoints);
    }
    if (gmbBalance?.formatted) {
      setGmb(gmbBalance.formatted);
    }
  }, [alien, gmbBalance]);

  return (
    <div className="fixed top-24 right-4 z-40 pointer-events-auto bg-black bg-opacity-80 p-4 rounded-lg border border-blue-500 flex flex-col items-end space-y-4 text-blue-400 text-sm drop-shadow-lg">
      <div className="space-y-1 text-right">
        <div>Alien Points: {points}</div>
        <div>GMB: {gmb}</div>
        <div>Pool: 100,000,000</div>
      </div>
    </div>
  );
}
