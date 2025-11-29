"use client";

import { useState, useEffect } from "react";

export default function SpiderTanksPage() {
  const [showVideo, setShowVideo] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Show video popup after page loads
    setShowVideo(true);
  }, []);

  // Countdown timer to December 8th, 2025
  useEffect(() => {
    const calculateTimeLeft = () => {
      const launchDate = new Date('December 8, 2025 00:00:00').getTime();
      const now = new Date().getTime();
      const difference = launchDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const closeVideo = () => {
    setShowVideo(false);
  };

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(to bottom, #1f2833, #0b0c10)' }}>
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
            <div className="relative rounded-lg overflow-hidden shadow-2xl border-4" style={{ borderColor: '#45a29e' }}>
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
                className="px-6 py-3 rounded-lg font-bold transition-colors"
                style={{ background: '#45a29e', color: '#0b0c10' }}
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
          <h1 className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #66fcf1, #45a29e)' }}>
            SPIDER TANKS
          </h1>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl text-gray-300">
            Epic PvP Arena Combat
          </p>

          {/* Countdown Timer */}
          <div className="max-w-4xl mx-auto my-12">
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#66fcf1' }}>
              Launch Countdown
            </h2>
            <div className="grid grid-cols-4 gap-4 md:gap-8">
              <div className="p-6 rounded-xl border-2 shadow-2xl" style={{ background: 'linear-gradient(to bottom right, #1f2833, #0b0c10)', borderColor: '#45a29e' }}>
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                  {timeLeft.days}
                </div>
                <div className="text-sm md:text-lg uppercase tracking-wider" style={{ color: '#45a29e' }}>
                  Days
                </div>
              </div>
              <div className="p-6 rounded-xl border-2 shadow-2xl" style={{ background: 'linear-gradient(to bottom right, #1f2833, #0b0c10)', borderColor: '#45a29e' }}>
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                  {timeLeft.hours}
                </div>
                <div className="text-sm md:text-lg uppercase tracking-wider" style={{ color: '#45a29e' }}>
                  Hours
                </div>
              </div>
              <div className="p-6 rounded-xl border-2 shadow-2xl" style={{ background: 'linear-gradient(to bottom right, #1f2833, #0b0c10)', borderColor: '#45a29e' }}>
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                  {timeLeft.minutes}
                </div>
                <div className="text-sm md:text-lg uppercase tracking-wider" style={{ color: '#45a29e' }}>
                  Minutes
                </div>
              </div>
              <div className="p-6 rounded-xl border-2 shadow-2xl" style={{ background: 'linear-gradient(to bottom right, #1f2833, #0b0c10)', borderColor: '#45a29e' }}>
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                  {timeLeft.seconds}
                </div>
                <div className="text-sm md:text-lg uppercase tracking-wider" style={{ color: '#45a29e' }}>
                  Seconds
                </div>
              </div>
            </div>
            <p className="text-xl font-bold mt-6" style={{ color: '#66fcf1' }}>
              December 8th, 2025
            </p>
          </div>

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
              className="px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105"
              style={{ background: 'linear-gradient(to right, #66fcf1, #45a29e)', color: '#0b0c10' }}
            >
              Watch Trailer
            </button>

            <a
              href="#play"
              className="px-8 py-4 rounded-lg font-bold text-xl transition-all border-2"
              style={{ background: '#1f2833', borderColor: '#45a29e', color: '#66fcf1' }}
            >
              Play Now
            </a>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="bg-opacity-50 p-6 rounded-lg border" style={{ background: 'rgba(31, 40, 51, 0.5)', borderColor: '#45a29e' }}>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#66fcf1' }}>29 Characters</h3>
              <p style={{ color: '#c5c6c7' }}>
                Choose from Ghost Specters and Elemental warriors
              </p>
            </div>

            <div className="bg-opacity-50 p-6 rounded-lg border" style={{ background: 'rgba(31, 40, 51, 0.5)', borderColor: '#45a29e' }}>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#66fcf1' }}>PvP Arena</h3>
              <p style={{ color: '#c5c6c7' }}>
                Battle against players in intense top-down combat
              </p>
            </div>

            <div className="bg-opacity-50 p-6 rounded-lg border" style={{ background: 'rgba(31, 40, 51, 0.5)', borderColor: '#45a29e' }}>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#66fcf1' }}>Spider Tanks</h3>
              <p style={{ color: '#c5c6c7' }}>
                Command powerful vehicles with 8-directional movement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 border-t" style={{ color: '#c5c6c7', borderColor: '#1f2833' }}>
        <p>Spider Tanks © 2025 | Built with Godot & Next.js</p>
      </footer>
    </div>
  );
}
