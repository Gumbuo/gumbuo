"use client";
import dynamic from "next/dynamic";

const Home = dynamic(() => import("@lib/Home"), { ssr: false });

export default function AvalancheFujiPage() {
  return <Home chainType="avalanche-fuji" />;
}
