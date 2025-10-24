"use client";
import { useState, useRef, useEffect } from "react";

export default function AlienMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className="fixed top-6 left-6 z-[9999]">
      <audio ref={audioRef} src="/home.mp3" loop />

      <div className="flex items-center space-x-3 bg-gradient-to-r from-yellow-400 via-purple-600 to-yellow-400 rounded-xl p-6 border-8 border-green-400 shadow-2xl shadow-green-500 relative overflow-hidden">
        {/* Animated corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-400 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-purple-400 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-400 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-400 animate-pulse"></div>

        {/* Scan line effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-400/5 to-transparent animate-scan pointer-events-none"></div>

        {/* Music Icon */}
        <div className="text-5xl relative z-10">
          {isPlaying ? "🎵" : "🎧"}
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-2 relative z-10">
          <button
            onClick={togglePlay}
            className={`px-8 py-4 text-xl font-bold rounded-lg tracking-wider transition-all duration-200 relative overflow-hidden ${
              isPlaying
                ? "bg-gradient-to-r from-red-400 via-red-500 to-red-400 text-black hover:scale-110 hover:shadow-xl hover:shadow-red-400/80 animate-pulse-glow"
                : "bg-gradient-to-r from-green-400 via-green-500 to-green-400 text-black hover:scale-110 hover:shadow-xl hover:shadow-green-400/80 animate-pulse-glow"
            }`}
          >
            {isPlaying ? null : (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            )}
            <span className="relative z-10 flex items-center space-x-2">
              <span className="text-2xl">{isPlaying ? "⏸" : "▶"}</span>
              <span className="text-lg font-black">{isPlaying ? "STOP" : "PLAY"}</span>
            </span>
          </button>
        </div>

        {/* Music label */}
        <div className="text-green-400 text-lg font-bold relative z-10">
          <p className="animate-glow">👽 ALIEN VIBES 🛸</p>
        </div>
      </div>
    </div>
  );
}
