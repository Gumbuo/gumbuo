"use client";
import dynamic from "next/dynamic";

const WheelClient = dynamic(() => import("@/components/WheelClient"), { ssr: false });

export default function WheelPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <WheelClient />
    </div>
  );
}
