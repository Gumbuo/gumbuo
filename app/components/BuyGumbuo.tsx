"use client";
import { useCosmicSound } from "../hooks/useCosmicSound";

export default function BuyGumbuo() {
  const { playSound } = useCosmicSound();

  return (
    <div className="fixed bottom-1/2 left-1/2 z-40 pointer-events-auto transform -translate-x-1/2 translate-y-1/2">
      <a
        href="https://thirdweb.com/base/0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => playSound('hover')}
        onClick={() => playSound('teleport')}
        className="holographic-button organic-button px-12 py-6 text-3xl font-bold text-white !no-underline hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-green-400/50 inline-block relative overflow-hidden hover-ripple hover-float hover-cosmic-pulse"
      >
        <span className="relative z-10 holographic-text tracking-wider">🛸 Buy Gumbuo 💎</span>
      </a>
    </div>
  );
}
