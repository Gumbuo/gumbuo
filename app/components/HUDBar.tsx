"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import WalletConnectButtons from "@/components/WalletConnectButtons";

export default function HUDBar() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const pathname = usePathname();

  const musicMap: Record<string, string> = {
    "/arena": "/arena.mp3",
    "/wheel": "/wheel.mp3",
    "/": "/home.mp3",
    default: "/home.mp3",
  };

  const musicSrc = pathname && pathname in musicMap
    ? musicMap[pathname]
    : musicMap.default;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = musicSrc;
    }
  }, [musicSrc]);

  return (
    <>
      <audio ref={audioRef} loop />
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 text-white text-sm lowercase">
        <a href="/" className="hover:underline">home</a>
        <a href="/presale" className="hover:underline">presale</a>
        <a href="/drip" className="hover:underline">claim</a>
        <a href="/wheel" className="hover:underline">wheel</a>
        <a href="/arena" className="hover:underline">arena</a>
        <a href="/leaderboard" className="hover:underline">leaderboard</a>
        <button onClick={() => audioRef.current?.play()}>?? play</button>
        <button onClick={() => audioRef.current?.pause()}>?? stop</button>
        <WalletConnectButtons />
      </div>
    </>
  );
}
