"use client";
import AlienBalance from "@/components/AlienBalance";

export default function Page() {
  const wallet = "0x000000000000000000000000000000000000dead";
  return (
    <div className="flex items-center justify-center min-h-screen text-white text-4xl">
      <AlienBalance wallet={wallet} />
    </div>
  );
}
