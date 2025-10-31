"use client";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

const AlienMusicPlayer = dynamic(() => import("./AlienMusicPlayer"), { ssr: false });

export default function GlobalMusicPlayer() {
  const [mounted, setMounted] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if we're inside an iframe
    setIsInIframe(window.self !== window.top);
  }, []);

  // Don't show music player if inside an iframe
  if (!mounted || isInIframe) return null;

  return (
    <div className="fixed top-6 left-6 z-50">
      <AlienMusicPlayer />
    </div>
  );
}
