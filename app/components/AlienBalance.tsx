"use client";
import { useEffect, useState } from "react";

export default function AlienBalance({ wallet }: { wallet: string }) {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Placeholder for balance fetch logic
    setBalance(42);
  }, [wallet]);

  return (
    <div className="text-green-400 text-sm border border-green-600 p-2 rounded">
      ?? Alien Points: {balance} for {wallet}
    </div>
  );
}
