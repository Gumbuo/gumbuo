"use client";
import dynamic from "next/dynamic";
import { useAccount } from "wagmi";

const WalletHUD = dynamic(() => import("../client/WalletHUD"), { ssr: false });
const AlienBalance = dynamic(() => import("../client/AlienBalance"), { ssr: false });

export default function HUDBar() {
  const { address } = useAccount();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src="/alien.mp4"
      />
      <div className="relative z-10">
        <WalletHUD />
        {address && <AlienBalance wallet={address} />}
      </div>
    </div>
  );
}
