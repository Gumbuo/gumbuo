"use client";
import { useAccount } from "wagmi";
import dynamic from "next/dynamic";

const Wheel = dynamic(() => import("./WheelClient"), { ssr: false });

export default function WheelGame() {
  const { address, isConnected } = useAccount();
  if (!isConnected || !address) return <p>Connect wallet to spin</p>;

  return (
    <div>
      <Wheel />
    </div>
  );
}
