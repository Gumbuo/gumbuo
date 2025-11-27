"use client";

import { useState, useEffect } from "react";

export default function SpiderTanksPage() {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Show video popup after page loads
    setShowVideo(true);
  }, []);

  const closeVideo = () => {
    setShowVideo(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white">
      {/* Video Popup Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl mx-4">
            {/* Close Button */}
            <button
              onClick={closeVideo}
              className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors text-4xl font-bold z-10"
              aria-label="Close video"
            >
              ✕
            </button>

            {/* Video Container */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-purple-500">
              <video
                autoPlay
                controls
                className="w-full h-auto"
                onEnded={closeVideo}
              >
                <source src="/Fox_Fights_Alien_Wins_Video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Skip Button */}
            <div className="text-center mt-4">
              <button
                onClick={closeVideo}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-colors"
              >
                Skip Ad →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            SPIDER TANKS
          </h1>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl text-gray-300">
            Epic PvP Arena Combat
          </p>

          {/* Description */}
          <div className="max-w-2xl mx-auto text-lg text-gray-400 space-y-4">
            <p>
              Enter the arena in top-down vehicular combat. Control powerful spider tanks
              and unleash devastating attacks on your opponents.
            </p>
            <p>
              Featuring 29 unique characters, multiple arena maps, and intense PvP action.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
            <button
              onClick={() => setShowVideo(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold text-xl transition-all transform hover:scale-105"
            >
              Watch Trailer
            </button>

            <a
              href="#play"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold text-xl transition-all border-2 border-purple-500"
            >
              Play Now
            </a>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-purple-500">
              <h3 className="text-2xl font-bold mb-3 text-purple-400">29 Characters</h3>
              <p className="text-gray-400">
                Choose from Ghost Specters and Elemental warriors
              </p>
            </div>

            <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-purple-500">
              <h3 className="text-2xl font-bold mb-3 text-purple-400">PvP Arena</h3>
              <p className="text-gray-400">
                Battle against players in intense top-down combat
              </p>
            </div>

            <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-purple-500">
              <h3 className="text-2xl font-bold mb-3 text-purple-400">Spider Tanks</h3>
              <p className="text-gray-400">
                Command powerful vehicles with 8-directional movement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 border-t border-gray-800">
        <p>Spider Tanks © 2025 | Built with Godot & Next.js</p>
      </footer>
    </div>
  );
}
