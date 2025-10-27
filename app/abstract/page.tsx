"use client";
import dynamic from "next/dynamic";

const Home = dynamic(() => import("@lib/Home"), { ssr: false });

export default function AbstractPage() {
  return <Home chainType="abstract" />;
}
