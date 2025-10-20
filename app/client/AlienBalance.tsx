"use client";
import { useEffect } from "react";

export default function AlienBalance({ wallet }: { wallet: string }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("AlienBalance wallet:", wallet);
    }
  }, [wallet]);

  return (
    <div>
      {/* Alien balance rendering */}
    </div>
  );
}
