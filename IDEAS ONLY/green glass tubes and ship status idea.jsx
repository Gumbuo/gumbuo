import React, { useState, useEffect } from 'react';

export default function AlienMothershipUI() {
  const [tubeProgress, setTubeProgress] = useState({
    tube1: 0,
    tube2: 0,
    tube3: 0,
    tube4: 0
  });

  // Auto-fill tubes on a timer
  useEffect(() => {
    const intervals = [
      // Each tube fills at a slightly different rate for variety
      setInterval(() => {
        setTubeProgress(prev => ({
          ...prev,
          tube1: prev.tube1 >= 100 ? 0 : prev.tube1 + 1
        }));
      }, 100), // Fills 1% every 100ms (10 seconds total)

      setInterval(() => {
        setTubeProgress(prev => ({
          ...prev,
          tube2: prev.tube2 >= 100 ? 0 : prev.tube2 + 1
        }));
      }, 120), // Fills 1% every 120ms (12 seconds total)

      setInterval(() => {
        setTubeProgress(prev => ({
          ...prev,
          tube3: prev.tube3 >= 100 ? 0 : prev.tube3 + 1
        }));
      }, 90), // Fills 1% every 90ms (9 seconds total)

      setInterval(() => {
        setTubeProgress(prev => ({
          ...prev,
          tube4: prev.tube4 >= 100 ? 0 : prev.tube4 + 1
        }));
      }, 110) // Fills 1% every 110ms (11 seconds total)
    ];

    return () => intervals.forEach(interval => clearInterval(interval));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black p-8 relative overflow-hidden">
      {/* Animated stars/particles background */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500 mb-4 animate-pulse">
            GUMBUO MOTHERSHIP
          </h1>
          <p className="text-cyan-300 text-xl tracking-widest">
            [ ALIEN COMMAND CENTER ]
          </p>
        </div>

        {/* Glass Tubes */}
        <div className="grid grid-cols-4 gap-6 mb-16">
          {['tube1', 'tube2', 'tube3', 'tube4'].map((tubeId, index) => (
            <div key={tubeId} className="text-center">
              <p className="text-cyan-300 text-sm mb-3 tracking-wider">TANK {index + 1}</p>
              <div className="relative mx-auto" style={{ width: '80px', height: '300px' }}>
                {/* Outer glass tube */}
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 to-cyan-800/30 rounded-full border-4 border-cyan-400/40 backdrop-blur-sm shadow-lg shadow-cyan-500/50">
                  {/* Glass shine effect */}
                  <div className="absolute left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-white/40 to-transparent rounded-full"></div>
                </div>
                
                {/* Liquid fill */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-green-400 to-green-300 rounded-full transition-all duration-1000 ease-out overflow-hidden"
                  style={{ 
                    height: `${tubeProgress[tubeId]}%`,
                    boxShadow: '0 0 30px rgba(34, 197, 94, 0.8), inset 0 0 20px rgba(34, 197, 94, 0.5)'
                  }}
                >
                  {/* Bubbles */}
                  {tubeProgress[tubeId] > 0 && (
                    <>
                      <div className="absolute w-2 h-2 bg-green-200/60 rounded-full animate-ping" style={{ left: '20%', bottom: '20%', animationDuration: '2s' }}></div>
                      <div className="absolute w-3 h-3 bg-green-200/60 rounded-full animate-ping" style={{ left: '60%', bottom: '40%', animationDuration: '3s', animationDelay: '0.5s' }}></div>
                      <div className="absolute w-2 h-2 bg-green-200/60 rounded-full animate-ping" style={{ left: '40%', bottom: '60%', animationDuration: '2.5s', animationDelay: '1s' }}></div>
                    </>
                  )}
                </div>

                {/* Measurement marks */}
                <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between py-4 text-cyan-400 text-xs">
                  <span>100</span>
                  <span>50</span>
                  <span>0</span>
                </div>
              </div>
              
              {/* Progress percentage */}
              <p className="text-green-400 font-bold text-xl mt-3">{tubeProgress[tubeId]}%</p>
            </div>
          ))}
        </div>

        {/* Status Panel */}
        <div className="mt-12 p-6 bg-black/40 border-2 border-cyan-400/40 rounded-lg backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-cyan-400 text-sm mb-1">SHIP STATUS</p>
              <p className="text-green-400 text-2xl font-bold">ALL SYSTEMS OPERATIONAL</p>
            </div>
            <div className="text-right">
              <p className="text-cyan-400 text-sm mb-1">COORDINATES</p>
              <p className="text-purple-400 text-xl font-mono">X: 42.87 Y: -73.21 Z: 901.44</p>
            </div>
          </div>
        </div>

      </div>

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
    </div>
  );
}
