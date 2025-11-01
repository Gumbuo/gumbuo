"use client";
import { useState, useRef, useEffect } from "react";

// Available music tracks
const TRACKS = [
  { id: 1, name: "👽 Alien Vibes", file: "/demon.mp3", emoji: "👽" },
  { id: 2, name: "🌌 Space Odyssey", file: "/gumbuobeets.mp3", emoji: "🌌" },
  { id: 3, name: "🛸 UFO Transmission", file: "/success.mp3", emoji: "🛸" },
  { id: 4, name: "⭐ Cosmic Energy", file: "/arena.mp3", emoji: "⭐" },
  { id: 5, name: "🎵 Galactic Groove", file: "/home.mp3", emoji: "🎵" },
];

export default function AlienMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(TRACKS[0]);
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

  const handleTrackChange = (trackId: number) => {
    const track = TRACKS.find(t => t.id === trackId);
    if (!track || !audioRef.current) return;

    const wasPlaying = isPlaying;

    // Pause current track
    if (wasPlaying) {
      audioRef.current.pause();
    }

    // Change track
    setSelectedTrack(track);
    audioRef.current.src = track.file;
    audioRef.current.load();

    // Resume playing if it was playing before
    if (wasPlaying) {
      audioRef.current.play();
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
    <div className="relative">
      <audio ref={audioRef} src={selectedTrack.file} loop />

      <div style={{
        borderRadius: '8px',
        border: '2px solid #00ff9944'
      }} className="flex items-center space-x-3 bg-gradient-to-r from-yellow-400 via-purple-600 to-yellow-400 p-6 shadow-2xl shadow-green-500 relative overflow-hidden">
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

        {/* Track Selector Dropdown */}
        <div className="relative z-10">
          <select
            value={selectedTrack.id}
            onChange={(e) => handleTrackChange(Number(e.target.value))}
            style={{
              fontFamily: 'Orbitron, sans-serif',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: '#00ff99',
              border: '2px solid #00ff99',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 0 15px rgba(0, 255, 153, 0.5)'
            }}
            className="hover:bg-black transition-all duration-200"
          >
            {TRACKS.map(track => (
              <option key={track.id} value={track.id}>
                {track.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
