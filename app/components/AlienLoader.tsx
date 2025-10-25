"use client";

export default function AlienLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        {/* Spaceship UFO */}
        <div className="relative w-64 h-64 animate-pulse">
          {/* Energy rings */}
          <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-75"></div>
          <div className="absolute inset-4 rounded-full border-4 border-cyan-400 animate-ping opacity-50" style={{animationDelay: '0.3s'}}></div>
          <div className="absolute inset-8 rounded-full border-4 border-purple-400 animate-ping opacity-25" style={{animationDelay: '0.6s'}}></div>

          {/* UFO Body */}
          <div className="absolute inset-16 bg-gradient-to-b from-green-400 via-cyan-400 to-green-600 rounded-full shadow-2xl shadow-green-400/50">
            {/* Dome */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-16 bg-gradient-to-b from-cyan-300 to-cyan-500 rounded-t-full opacity-70"></div>

            {/* Windows */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex space-x-2">
              <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>

            {/* Center emoji */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl animate-spin" style={{animationDuration: '3s'}}>🛸</div>
            </div>
          </div>

          {/* Light beam */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-48 bg-gradient-to-b from-cyan-400/60 to-transparent blur-md animate-pulse"></div>
        </div>

        {/* Loading text */}
        <div className="mt-8 text-center">
          <p className="text-3xl font-bold text-green-400 animate-pulse holographic-text">
            Charging Warp Drive...
          </p>
          <div className="flex space-x-2 mt-4 justify-center">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>

        {/* Particle effects */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full animate-matrix-rain"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
