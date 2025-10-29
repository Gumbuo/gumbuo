"use client";
import dynamic from "next/dynamic";

const Home = dynamic(() => import("@lib/Home"), { ssr: false });

export default function BlastSepoliaPage() {
  return <Home chainType="blast-sepolia" />;
}
