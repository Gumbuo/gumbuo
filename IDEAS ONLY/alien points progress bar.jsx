import React, { useState } from 'react';

export default function UFOProgressBar() {
  // Simulated alien points (0-1000)
  const [alienPoints, setAlienPoints] = useState(350);
  
  // Goal milestones
  const goals = [
    { points: 100, label: 'ROOKIE', color: 'text-gray-400' },
    { points: 250, label: 'EXPLORER', color: 'text-blue-400' },
    { points: 500, label: 'VOYAGER', color: 'text-purple-400' },
    { points: 750, label: 'COMMANDER', color: 'text-yellow-400' },
    { points: 1000, label: 'SUPREME', color: 'text-green-400' }
  ];

  // Calculate progress percentage
  const progressPercent = (alienPoints / 1000) * 100;

  // Add points for demo
  const addPoints = (amount) => {
    setAlienPoints(prev => Math.min(prev + amount, 1000));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500 mb-4">
            ALIEN POINTS JOURNEY
          </h1>
          <div className="inline-block bg-black/40 border-2 border-cyan-400/40 rounded-lg px-8 py-4 backdrop-blur-sm">
            <p className="text-cyan-300 text-sm mb-1">CURRENT POINTS</p>
            <p className="text-green-400 text-4xl font-bold">{alienPoints}</p>
          </div>
        </div>

        <div className="flex gap-12 items-center justify-center">
          
          {/* Progress Bar with UFO */}
          <div className="relative" style={{ height: '600px', width: '120px' }}>
            
            {/* Vertical Progress Track */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-full bg-gradient-to-t from-cyan-900/30 to-purple-900/30 rounded-full border-2 border-cyan-400/30 backdrop-blur-sm">
              
              {/* Progress Fill */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-cyan-400 to-purple-400 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  height: `${progressPercent}%`,
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.8)'
                }}
              />
            </div>

            {/* Goal Markers */}
            {goals.map((goal, index) => {
              const goalPercent = (goal.points / 1000) * 100;
              const isReached = alienPoints >= goal.points;
              
              return (
                <div
                  key={goal.points}
                  className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                  style={{ bottom: `${goalPercent}%` }}
                >
                  {/* Marker Line */}
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-1 rounded-full ${isReached ? 'bg-green-400' : 'bg-gray-600'} transition-all duration-500`}></div>
                    
                    {/* Marker Circle */}
                    <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                      isReached 
                        ? 'border-green-400 bg-green-400/20 shadow-lg shadow-green-400/50' 
                        : 'border-gray-600 bg-gray-800/50'
                    }`}>
                      {isReached && (
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    
                    <div className={`w-8 h-1 rounded-full ${isReached ? 'bg-green-400' : 'bg-gray-600'} transition-all duration-500`}></div>
                  </div>
                  
                  {/* Goal Label */}
                  <div className="absolute left-20 top-1/2 transform -translate-y-1/2 whitespace-nowrap">
                    <p className={`text-xs ${isReached ? goal.color : 'text-gray-500'} font-bold tracking-wider transition-all duration-500`}>
                      {goal.label}
                    </p>
                    <p className={`text-xs ${isReached ? 'text-cyan-300' : 'text-gray-600'} transition-all duration-500`}>
                      {goal.points} pts
                    </p>
                  </div>
                </div>
              );
            })}

            {/* UFO Spaceship */}
            <div
              className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
              style={{ bottom: `${progressPercent}%` }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 blur-xl bg-cyan-400 opacity-50 rounded-full scale-150"></div>
              
              {/* UFO SVG */}
              <svg width="80" height="50" viewBox="0 0 80 50" className="relative animate-bounce" style={{ animationDuration: '3s' }}>
                {/* Beam of light coming down */}
                {progressPercent > 0 && (
                  <defs>
                    <linearGradient id="beam" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#22d3ee', stopOpacity: 0.6 }} />
                      <stop offset="100%" style={{ stopColor: '#22d3ee', stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                )}
                {progressPercent > 0 && (
                  <polygon 
                    points="30,35 50,35 45,100 35,100" 
                    fill="url(#beam)" 
                    className="animate-pulse"
                  />
                )}
                
                {/* UFO Dome/Top */}
                <ellipse cx="40" cy="20" rx="20" ry="12" fill="#22d3ee" opacity="0.8">
                  <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
                </ellipse>
                
                {/* UFO Base/Saucer */}
                <ellipse cx="40" cy="28" rx="35" ry="8" fill="#4ade80" opacity="0.9"/>
                <ellipse cx="40" cy="26" rx="35" ry="8" fill="#22d3ee" opacity="0.7"/>
                
                {/* Windows */}
                <circle cx="40" cy="20" r="4" fill="#000" opacity="0.5"/>
                <circle cx="40" cy="19" r="2" fill="#fbbf24" className="animate-pulse"/>
                
                {/* Lights on the saucer */}
                <circle cx="20" cy="28" r="2" fill="#f472b6">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
                </circle>
                <circle cx="40" cy="30" r="2" fill="#fbbf24">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite"/>
                </circle>
                <circle cx="60" cy="28" r="2" fill="#a78bfa">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
                </circle>
              </svg>

              {/* Particle effects around UFO */}
              <div className="absolute -inset-8">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: '2s'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Start Label */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 text-center">
              <p className="text-cyan-400 text-xs font-bold">START</p>
              <p className="text-gray-500 text-xs">0 pts</p>
            </div>

            {/* End Label */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 text-center">
              <p className="text-green-400 text-xs font-bold">MAXIMUM</p>
              <p className="text-gray-400 text-xs">1000 pts</p>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            
            {/* Next Goal */}
            <div className="bg-black/40 border-2 border-cyan-400/40 rounded-lg p-6 backdrop-blur-sm">
              <p className="text-cyan-300 text-sm mb-3">NEXT MILESTONE</p>
              {(() => {
                const nextGoal = goals.find(g => g.points > alienPoints);
                if (nextGoal) {
                  const pointsNeeded = nextGoal.points - alienPoints;
                  const progressToNext = ((alienPoints - (goals[goals.indexOf(nextGoal) - 1]?.points || 0)) / (nextGoal.points - (goals[goals.indexOf(nextGoal) - 1]?.points || 0))) * 100;
                  
                  return (
                    <>
                      <p className={`text-2xl font-bold mb-2 ${nextGoal.color}`}>{nextGoal.label}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-400 to-green-400 transition-all duration-500"
                            style={{ width: `${progressToNext}%` }}
                          />
                        </div>
                        <p className="text-cyan-300 text-sm font-bold">{Math.round(progressToNext)}%</p>
                      </div>
                      <p className="text-yellow-400 text-lg font-bold">{pointsNeeded} points to go!</p>
                    </>
                  );
                } else {
                  return <p className="text-green-400 text-xl font-bold">🎉 MAXIMUM RANK ACHIEVED!</p>;
                }
              })()}
            </div>

            {/* Stats */}
            <div className="bg-black/40 border-2 border-purple-400/40 rounded-lg p-6 backdrop-blur-sm">
              <p className="text-purple-300 text-sm mb-3">ACHIEVEMENTS UNLOCKED</p>
              <p className="text-green-400 text-3xl font-bold mb-1">
                {goals.filter(g => alienPoints >= g.points).length} / {goals.length}
              </p>
              <p className="text-gray-400 text-sm">Ranks Completed</p>
            </div>

            {/* Demo Controls */}
            <div className="space-y-2">
              <p className="text-cyan-300 text-xs text-center mb-2">[ DEMO CONTROLS ]</p>
              <button
                onClick={() => addPoints(50)}
                className="w-full px-4 py-3 bg-green-500/20 border border-green-400 text-green-400 rounded hover:bg-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50 font-bold"
              >
                + 50 POINTS
              </button>
              <button
                onClick={() => addPoints(100)}
                className="w-full px-4 py-3 bg-cyan-500/20 border border-cyan-400 text-cyan-400 rounded hover:bg-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 font-bold"
              >
                + 100 POINTS
              </button>
              <button
                onClick={() => setAlienPoints(0)}
                className="w-full px-4 py-2 bg-red-500/20 border border-red-400 text-red-400 rounded hover:bg-red-500/40 transition-all duration-300 text-sm"
              >
                RESET
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
