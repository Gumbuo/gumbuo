"use client";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

const AlienMusicPlayer = dynamic(() => import("./AlienMusicPlayer"), { ssr: false });

export default function GlobalMusicPlayer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-6 left-6 z-50">
      <AlienMusicPlayer />
    </div>
  );
}
