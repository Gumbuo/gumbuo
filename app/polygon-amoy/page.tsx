"use client";
import dynamic from "next/dynamic";

const Home = dynamic(() => import("@lib/Home"), { ssr: false });

export default function PolygonAmoyPage() {
  return <Home chainType="polygon-amoy" />;
}
