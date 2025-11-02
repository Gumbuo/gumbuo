"use client";

import Link from "next/link";
import { useCosmicSound } from "../hooks/useCosmicSound";

export default function BackToMothershipButton() {
  const { playSound } = useCosmicSound();

  return (
    <Link href="/">
      <button
        onMouseEnter={(e) => {
          playSound('hover');
          e.currentTarget.style.backgroundColor = '#b91c1c';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#dc2626';
        }}
        onClick={() => playSound('click')}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 px-6 py-3 text-white font-alien rounded-xl transition-all hover:scale-105 shadow-lg"
        style={{
          zIndex: 9999,
          backgroundColor: '#dc2626',
          boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.5)'
        }}
      >
        ← MOTHERSHIP
      </button>
    </Link>
  );
}
