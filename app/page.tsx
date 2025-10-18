
"use client";
import HUD from "@/components/HUD";

export default function Home() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
      <HUD />
      <h1 className="text-4xl font-bold">Welcome to Gumbuo</h1>
    </div>
  );
}
