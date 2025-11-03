import React, { useState } from 'react';

export default function UFOProgressBar() {
  // Simulated alien points (0-1000)
  const [alienPoints, setAlienPoints] = useState(350);
  
  // Recent activity feed
  const [activities, setActivities] = useState([
    { id: 1, action: 'Completed daily mission', points: 50, time: '2m ago', icon: '🎯' },
    { id: 2, action: 'Invited a friend', points: 100, time: '15m ago', icon: '👽' },
    { id: 3, action: 'Streak bonus', points: 25, time: '1h ago', icon: '🔥' },
    { id: 4, action: 'Profile completion', points: 75, time: '2h ago', icon: '✨' }
  ]);
  
  // Other players' UFOs (ghost mode)
  const otherPlayers = [
    { username: 'ZorgMaster', points: 987, color: '#fbbf24', position: 98.7 },
    { username: 'AlienQueen47', points: 856, color: '#ec4899', position: 85.6 },
    { username: 'CosmicRider', points: 743, color: '#8b5cf6', position: 74.3 },
    { username: 'StarHunter99', points: 312, color: '#06b6d4', position: 31.2 },
    { username: 'VoidWalker', points: 289, color: '#10b981', position: 28.9 }
  ];
  
  // Points history for the graph (last 7 days)
  const [pointsHistory, setPointsHistory] = useState([
    { day: 'Mon', points: 150 },
    { day: 'Tue', points: 200 },
    { day: 'Wed', points: 250 },
    { day: 'Thu', points: 280 },
    { day: 'Fri', points: 320 },
    { day: 'Sat', points: 330 },
    { day: 'Sun', points: 350 }
  ]);

  // Leaderboard data (mock data)
  const leaderboard = [
    { rank: 1, username: 'ZorgMaster', points: 987, isYou: false },
    { rank: 2, username: 'AlienQueen47', points: 856, isYou: false },
    { rank: 3, username: 'CosmicRider', points: 743, isYou: false },
    { rank: 4, username: 'YOU', points: alienPoints, isYou: true },
    { rank: 5, username: 'StarHunter99', points: 312, isYou: false },
    { rank: 6, username: 'VoidWalker', points: 289, isYou: false },
    { rank: 7, username: 'NebulaKid', points: 201, isYou: false }
  ];
  
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
    const newPoints = Math.min(alienPoints + amount, 1000);
    setAlienPoints(newPoints);
    
    // Update today's points in history
    setPointsHistory(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], points: newPoints };
      return updated;
    });
    
    // Add new activity to feed
    const actions = [
      { action: 'Completed mission', icon: '🎯' },
      { action: 'Achievement unlocked', icon: '🏆' },
      { action: 'Daily login bonus', icon: '⭐' },
      { action: 'Task completed', icon: '✅' },
      { action: 'Milestone reached', icon: '🚀' }
    ];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    setActivities(prev => [
      { 
        id: Date.now(), 
        action: randomAction.action, 
        points: amount, 
        time: 'Just now', 
        icon: randomAction.icon 
      },
      ...prev.slice(0, 4) // Keep only last 5 activities
    ]);
  };

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black p-8 flex items-center justify-center">
      <div className="max-w-7xl w-full">
        
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
              className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-20"
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

            {/* Ghost UFOs - Other Players */}
            {otherPlayers.map((player, index) => (
              <div
                key={player.username}
                className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-10 group"
                style={{ 
                  bottom: `${player.position}%`,
                  opacity: 0.6
                }}
              >
                {/* Player name tooltip */}
                <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  <div className="bg-black/90 border border-gray-600 rounded px-3 py-2 text-xs">
                    <p className="font-bold" style={{ color: player.color }}>{player.username}</p>
                    <p className="text-gray-400">{player.points} points</p>
                  </div>
                </div>

                {/* Ghost UFO */}
                <svg width="50" height="32" viewBox="0 0 80 50" className="relative" style={{ animationDuration: `${3 + index * 0.5}s` }}>
                  {/* UFO Dome/Top */}
                  <ellipse cx="40" cy="20" rx="20" ry="12" fill={player.color} opacity="0.4"/>
                  
                  {/* UFO Base/Saucer */}
                  <ellipse cx="40" cy="28" rx="35" ry="8" fill={player.color} opacity="0.5"/>
                  <ellipse cx="40" cy="26" rx="35" ry="8" fill={player.color} opacity="0.3"/>
                  
                  {/* Light indicator */}
                  <circle cx="40" cy="20" r="3" fill={player.color} opacity="0.8">
                    <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" begin={`${index * 0.4}s`}/>
                  </circle>
                </svg>
              </div>
            ))}

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
          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#22d3ee #1a1a1a' }}>
            
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

            {/* Points History Graph */}
            <div className="bg-black/40 border-2 border-cyan-400/40 rounded-lg p-6 backdrop-blur-sm">
              <p className="text-cyan-300 text-sm mb-4">EARNING VELOCITY</p>
              
              {/* Chart */}
              <div className="relative h-32 mb-4">
                <svg width="100%" height="100%" viewBox="0 0 280 120" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="280" y2="30" stroke="#1f2937" strokeWidth="1" opacity="0.3"/>
                  <line x1="0" y1="60" x2="280" y2="60" stroke="#1f2937" strokeWidth="1" opacity="0.3"/>
                  <line x1="0" y1="90" x2="280" y2="90" stroke="#1f2937" strokeWidth="1" opacity="0.3"/>
                  
                  {/* Area fill */}
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#22d3ee', stopOpacity: 0.4 }} />
                      <stop offset="100%" style={{ stopColor: '#22d3ee', stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  
                  <path
                    d={`M 0 ${120 - (pointsHistory[0].points / 1000) * 120} 
                        L 46.67 ${120 - (pointsHistory[1].points / 1000) * 120}
                        L 93.33 ${120 - (pointsHistory[2].points / 1000) * 120}
                        L 140 ${120 - (pointsHistory[3].points / 1000) * 120}
                        L 186.67 ${120 - (pointsHistory[4].points / 1000) * 120}
                        L 233.33 ${120 - (pointsHistory[5].points / 1000) * 120}
                        L 280 ${120 - (pointsHistory[6].points / 1000) * 120}
                        L 280 120 L 0 120 Z`}
                    fill="url(#areaGradient)"
                  />
                  
                  {/* Line */}
                  <path
                    d={`M 0 ${120 - (pointsHistory[0].points / 1000) * 120} 
                        L 46.67 ${120 - (pointsHistory[1].points / 1000) * 120}
                        L 93.33 ${120 - (pointsHistory[2].points / 1000) * 120}
                        L 140 ${120 - (pointsHistory[3].points / 1000) * 120}
                        L 186.67 ${120 - (pointsHistory[4].points / 1000) * 120}
                        L 233.33 ${120 - (pointsHistory[5].points / 1000) * 120}
                        L 280 ${120 - (pointsHistory[6].points / 1000) * 120}`}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points */}
                  {pointsHistory.map((data, i) => {
                    const x = i * 46.67;
                    const y = 120 - (data.points / 1000) * 120;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="4" fill="#22d3ee" stroke="#0a0a0a" strokeWidth="2"/>
                        <circle cx={x} cy={y} r="6" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.3">
                          <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" begin={`${i * 0.2}s`}/>
                          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" begin={`${i * 0.2}s`}/>
                        </circle>
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              {/* Day labels */}
              <div className="flex justify-between text-xs text-gray-500">
                {pointsHistory.map((data, i) => (
                  <span key={i} className={i === pointsHistory.length - 1 ? 'text-cyan-400 font-bold' : ''}>
                    {data.day}
                  </span>
                ))}
              </div>
              
              {/* Velocity stats */}
              <div className="mt-4 pt-4 border-t border-cyan-400/20">
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">DAILY AVERAGE</p>
                    <p className="text-green-400 text-lg font-bold">
                      +{Math.round((pointsHistory[pointsHistory.length - 1].points - pointsHistory[0].points) / 7)} pts/day
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">TREND</p>
                    <p className="text-green-400 text-lg font-bold flex items-center justify-end gap-1">
                      <svg width="16" height="16" viewBox="0 0 16 16" className="text-green-400">
                        <path d="M8 4 L12 8 L8 8 L8 12 L4 8 L8 8 Z" fill="currentColor"/>
                      </svg>
                      UP
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-black/40 border-2 border-yellow-400/40 rounded-lg p-6 backdrop-blur-sm">
              <p className="text-yellow-300 text-sm mb-4">GALACTIC LEADERBOARD</p>
              
              <div className="space-y-2">
                {leaderboard.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center gap-3 p-2 rounded transition-all duration-300 ${
                      player.isYou 
                        ? 'bg-green-500/20 border-2 border-green-400 shadow-lg shadow-green-400/20' 
                        : 'bg-gray-800/30 border border-gray-700'
                    }`}
                  >
                    {/* Rank */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      player.rank === 1 ? 'bg-yellow-400 text-black' :
                      player.rank === 2 ? 'bg-gray-300 text-black' :
                      player.rank === 3 ? 'bg-orange-400 text-black' :
                      player.isYou ? 'bg-green-400 text-black' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {player.rank}
                    </div>
                    
                    {/* Username */}
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${
                        player.isYou ? 'text-green-400' : 'text-gray-300'
                      }`}>
                        {player.username}
                        {player.isYou && (
                          <span className="ml-2 text-xs bg-green-400/20 text-green-400 px-2 py-0.5 rounded">YOU</span>
                        )}
                      </p>
                    </div>
                    
                    {/* Points */}
                    <div className="text-right">
                      <p className={`font-bold ${
                        player.isYou ? 'text-green-400' : 'text-cyan-400'
                      }`}>
                        {player.points}
                      </p>
                      <p className="text-xs text-gray-500">pts</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Your position summary */}
              <div className="mt-4 pt-4 border-t border-yellow-400/20">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-xs">YOUR RANK</p>
                    <p className="text-yellow-400 text-2xl font-bold">#4</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">POINTS TO #3</p>
                    <p className="text-orange-400 text-xl font-bold">
                      {leaderboard[2].points - alienPoints}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-black/40 border-2 border-green-400/40 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-green-300 text-sm">RECENT ACTIVITY</p>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#22d3ee #1a1a1a' }}>
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-green-400/50 transition-all duration-300"
                    style={{
                      animation: index === 0 && activity.time === 'Just now' ? 'slideIn 0.5s ease-out' : 'none'
                    }}
                  >
                    {/* Icon */}
                    <div className="text-2xl">{activity.icon}</div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 text-sm font-medium">{activity.action}</p>
                      <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                    </div>
                    
                    {/* Points */}
                    <div className="flex items-center gap-1">
                      <span className="text-green-400 font-bold text-lg">+{activity.points}</span>
                      <span className="text-gray-500 text-xs">pts</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total today */}
              <div className="mt-4 pt-4 border-t border-green-400/20">
                <div className="flex justify-between items-center">
                  <p className="text-gray-400 text-xs">EARNED TODAY</p>
                  <p className="text-green-400 text-xl font-bold">
                    +{activities.reduce((sum, a) => sum + a.points, 0)} pts
                  </p>
                </div>
              </div>
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
                onClick={() => {
                  setAlienPoints(0);
                  setPointsHistory([
                    { day: 'Mon', points: 0 },
                    { day: 'Tue', points: 0 },
                    { day: 'Wed', points: 0 },
                    { day: 'Thu', points: 0 },
                    { day: 'Fri', points: 0 },
                    { day: 'Sat', points: 0 },
                    { day: 'Sun', points: 0 }
                  ]);
                  setActivities([
                    { id: 1, action: 'Started fresh journey', points: 0, time: 'Just now', icon: '🚀' }
                  ]);
                }}
                className="w-full px-4 py-2 bg-red-500/20 border border-red-400 text-red-400 rounded hover:bg-red-500/40 transition-all duration-300 text-sm"
              >
                RESET
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
    </>
  );
}
