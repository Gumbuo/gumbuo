"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useAlienPoints } from "../context/AlienPointsEconomy";
import { useCosmicSound } from "../hooks/useCosmicSound";

interface OwnedAlien {
  id: string;
  picId: string;
  name: string;
  image: string;
  purchasedAt: number;
}

interface FightResult {
  winner: OwnedAlien;
  loser: OwnedAlien;
  timestamp: number;
}

const ENTRY_FEE = 500; // AP or GMB
const WINNER_PRIZE = 800; // AP or GMB
const HOUSE_FEE = 200; // Total collected (1000 AP) - Winner prize (800 AP) = 200 AP to burn pool

export default function GumbuoFightersArena() {
  const { address } = useAccount();
  const { getUserBalance, spendPoints, addPoints, pool } = useAlienPoints();
  const { playSound } = useCosmicSound();
  const [ownedAliens, setOwnedAliens] = useState<OwnedAlien[]>([]);
  const [fighter1, setFighter1] = useState<OwnedAlien | null>(null);
  const [fighter2, setFighter2] = useState<OwnedAlien | null>(null);
  const [fighter1Owner, setFighter1Owner] = useState<string | null>(null);
  const [fighter2Owner, setFighter2Owner] = useState<string | null>(null);
  const [fighter1Paid, setFighter1Paid] = useState(false);
  const [fighter2Paid, setFighter2Paid] = useState(false);
  const [fighting, setFighting] = useState(false);
  const [fightResult, setFightResult] = useState<FightResult | null>(null);
  const [draggedAlien, setDraggedAlien] = useState<OwnedAlien | null>(null);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    if (!address) return;

    // Load user's owned aliens
    const owned = localStorage.getItem(`ownedAliens_${address}`);
    if (owned) {
      setOwnedAliens(JSON.parse(owned));
    }

    // Update user balance
    setUserBalance(getUserBalance(address));
  }, [address, getUserBalance]);

  // Load arena state from localStorage on mount
  useEffect(() => {
    const savedArena = localStorage.getItem('arenaState');
    if (savedArena) {
      try {
        const arenaState = JSON.parse(savedArena);
        if (arenaState.fighter1) setFighter1(arenaState.fighter1);
        if (arenaState.fighter2) setFighter2(arenaState.fighter2);
        if (arenaState.fighter1Owner) setFighter1Owner(arenaState.fighter1Owner);
        if (arenaState.fighter2Owner) setFighter2Owner(arenaState.fighter2Owner);
        if (arenaState.fighter1Paid) setFighter1Paid(arenaState.fighter1Paid);
        if (arenaState.fighter2Paid) setFighter2Paid(arenaState.fighter2Paid);
      } catch (e) {
        console.error('Failed to load arena state:', e);
      }
    }
  }, []);

  // Save arena state to localStorage whenever fighters change
  useEffect(() => {
    const arenaState = {
      fighter1,
      fighter2,
      fighter1Owner,
      fighter2Owner,
      fighter1Paid,
      fighter2Paid,
    };
    localStorage.setItem('arenaState', JSON.stringify(arenaState));
  }, [fighter1, fighter2, fighter1Owner, fighter2Owner, fighter1Paid, fighter2Paid]);

  // Auto-start fight when both slots filled AND both paid
  useEffect(() => {
    if (fighter1 && fighter2 && fighter1Paid && fighter2Paid && !fighting && !fightResult) {
      startFight();
    }
  }, [fighter1, fighter2, fighter1Paid, fighter2Paid]);

  const handleDragStart = (alien: OwnedAlien) => {
    setDraggedAlien(alien);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropFighter1 = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedAlien || !address || draggedAlien.id === fighter2?.id) return;

    // Prevent same wallet from filling both slots
    if (fighter2Owner && fighter2Owner.toLowerCase() === address.toLowerCase()) {
      alert("⚠️ You cannot fight yourself! Wait for another player to join.");
      setDraggedAlien(null);
      return;
    }

    // Check balance
    const balance = getUserBalance(address);
    if (balance < ENTRY_FEE) {
      alert(`Not enough Alien Points! You need ${ENTRY_FEE} AP to enter.`);
      return;
    }

    // Confirmation dialog
    const confirmed = confirm(
      `⚔️ CONFIRM ARENA ENTRY - FIGHTER 1\n\n` +
      `Alien: ${draggedAlien.name}\n` +
      `Entry Fee: ${ENTRY_FEE.toLocaleString()} AP\n\n` +
      `⚠️ WARNING:\n` +
      `• This alien will be PERMANENTLY BURNED after the fight!\n` +
      `• Winner gets 800 AP (net +300 AP profit)\n` +
      `• Loser loses alien + 500 AP entry fee\n\n` +
      `Your balance: ${balance.toLocaleString()} AP\n` +
      `After entry: ${(balance - ENTRY_FEE).toLocaleString()} AP\n\n` +
      `Do you want to enter ${draggedAlien.name} into the arena?`
    );

    if (!confirmed) {
      setDraggedAlien(null);
      return;
    }

    // Pay entry fee
    const success = await spendPoints(address, ENTRY_FEE, "Arena Entry Fee - Fighter 1");
    if (success) {
      setFighter1(draggedAlien);
      setFighter1Owner(address);
      setFighter1Paid(true);
      setUserBalance(getUserBalance(address));
      setDraggedAlien(null);
    } else {
      alert("Payment failed! Please try again.");
    }
  };

  const handleDropFighter2 = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedAlien || !address || draggedAlien.id === fighter1?.id) return;

    // Prevent same wallet from filling both slots
    if (fighter1Owner && fighter1Owner.toLowerCase() === address.toLowerCase()) {
      alert("⚠️ You cannot fight yourself! Wait for another player to join.");
      setDraggedAlien(null);
      return;
    }

    // Check balance
    const balance = getUserBalance(address);
    if (balance < ENTRY_FEE) {
      alert(`Not enough Alien Points! You need ${ENTRY_FEE} AP to enter.`);
      return;
    }

    // Confirmation dialog
    const confirmed = confirm(
      `⚔️ CONFIRM ARENA ENTRY - FIGHTER 2\n\n` +
      `Alien: ${draggedAlien.name}\n` +
      `Entry Fee: ${ENTRY_FEE.toLocaleString()} AP\n\n` +
      `⚠️ WARNING:\n` +
      `• This alien will be PERMANENTLY BURNED after the fight!\n` +
      `• Winner gets 800 AP (net +300 AP profit)\n` +
      `• Loser loses alien + 500 AP entry fee\n\n` +
      `Your balance: ${balance.toLocaleString()} AP\n` +
      `After entry: ${(balance - ENTRY_FEE).toLocaleString()} AP\n\n` +
      `Do you want to enter ${draggedAlien.name} into the arena?`
    );

    if (!confirmed) {
      setDraggedAlien(null);
      return;
    }

    // Pay entry fee
    const success = await spendPoints(address, ENTRY_FEE, "Arena Entry Fee - Fighter 2");
    if (success) {
      setFighter2(draggedAlien);
      setFighter2Owner(address);
      setFighter2Paid(true);
      setUserBalance(getUserBalance(address));
      setDraggedAlien(null);
    } else {
      alert("Payment failed! Please try again.");
    }
  };

  const burnAlien = (alien: OwnedAlien) => {
    if (!address) return;

    const updated = ownedAliens.filter(a => a.id !== alien.id);
    setOwnedAliens(updated);
    localStorage.setItem(`ownedAliens_${address}`, JSON.stringify(updated));
  };

  const startFight = async () => {
    if (!fighter1 || !fighter2 || !address) return;

    setFighting(true);
    setFightResult(null);

    // Simulate fight with random winner
    setTimeout(async () => {
      const winner = Math.random() > 0.5 ? fighter1 : fighter2;
      const loser = winner === fighter1 ? fighter2 : fighter1;

      // Award winner 800 AP from reserve pool
      await addPoints(address, WINNER_PRIZE, 'arena');

      // Add house fee to burn pool
      // Entry fees collected: 500 + 500 = 1000 AP
      // Winner prize: 800 AP
      // Burn pool gets: 1000 - 800 = 200 AP
      // Note: Alien purchase prices (500 AP each) already went to burn pool when bought from marketplace
      try {
        await fetch('/api/points', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: HOUSE_FEE }),
        });
      } catch (error) {
        console.error("Error adding to burn pool:", error);
      }

      // Burn both aliens
      if (!address) return;
      const updated = ownedAliens.filter(a => a.id !== fighter1.id && a.id !== fighter2.id);
      setOwnedAliens(updated);
      localStorage.setItem(`ownedAliens_${address}`, JSON.stringify(updated));

      // Update balance
      setUserBalance(getUserBalance(address));

      setFightResult({
        winner,
        loser,
        timestamp: Date.now(),
      });

      setFighting(false);
    }, 3000); // 3 second fight animation
  };

  const resetArena = () => {
    setFighter1(null);
    setFighter2(null);
    setFighter1Owner(null);
    setFighter2Owner(null);
    setFighter1Paid(false);
    setFighter2Paid(false);
    setFightResult(null);
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8 holographic-panel max-w-6xl relative overflow-visible rounded-3xl">
      {/* Corner glow accents */}
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <h2 className="font-alien font-bold holographic-text tracking-wider flex items-center justify-center space-x-2 drop-shadow-lg relative z-10" style={{fontSize: '4rem'}}>
        <span className="text-red-400">⚔️ Gumbuo Fighters - Alien Arena ⚔️</span>
      </h2>

      {/* Betting Info Section */}
      <div className="w-full text-red-400 text-sm text-center max-w-2xl glass-panel p-6 rounded-xl border-2 border-red-400/50 z-10 shadow-2xl shadow-red-500/50">
        <p className="font-bold mb-3 font-alien" style={{fontSize: '2.5rem'}}>
          💰 ALIEN POINTS BETTING 💰
        </p>
        <div className="opacity-90 space-y-2 font-electro">
          <p className="text-base">💵 <strong>Entry Fee:</strong> 500 AP per player (1000 AP total collected)</p>
          <p className="text-base">🏆 <strong>Winner Gets:</strong> 800 AP (net +300 AP profit after entry fee)</p>
          <p className="text-base">🔥 <strong>Burn Pool:</strong> 200 AP per fight (1000 AP collected - 800 AP winner prize)</p>
        </div>
      </div>

      {/* Burn Warning */}
      <div className="w-full text-red-400 text-lg text-center glass-panel p-4 rounded-xl border-2 border-red-400/50 z-10 animate-pulse shadow-lg shadow-red-500/50">
        <p className="font-bold font-alien holographic-text text-2xl">🔥 WARNING: Both aliens are permanently burned after the fight! 🔥</p>
      </div>

      {/* Burn Pool Display */}
      <div className="w-full glass-panel border-2 border-purple-500/50 rounded-xl p-6 text-center shadow-2xl shadow-purple-500/50 z-10">
        <p className="text-purple-400 text-2xl font-bold mb-3 font-alien holographic-text">🔥 Burn Pool: {pool.marketplacePool.toLocaleString()} AP 🔥</p>
        <p className="text-purple-300 text-base font-electro">
          Arena fees accumulate here for future airdrops & leaderboard rewards!
        </p>
      </div>

      {/* UFO Battle Dome Arena */}
      <div className="w-full relative mb-6" style={{ minHeight: '600px' }}>
        {/* Circular Arena Platform */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[800px] h-[500px]">
            {/* Energy Dome Shield */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 30 }}>
              <defs>
                <linearGradient id="domeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#00ffff', stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: '#ff00ff', stopOpacity: 0.1 }} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              {/* Dome arc */}
              <ellipse cx="400" cy="450" rx="350" ry="80" fill="none" stroke="url(#domeGradient)" strokeWidth="3" opacity="0.6" className="animate-pulse"/>
              <path d="M 50 450 Q 400 50, 750 450" fill="none" stroke="url(#domeGradient)" strokeWidth="2" opacity="0.4" filter="url(#glow)" className="animate-pulse"/>
              {/* Energy grid lines */}
              <line x1="400" y1="450" x2="400" y2="150" stroke="#00ffff" strokeWidth="1" opacity="0.2" strokeDasharray="5,5"/>
              <line x1="200" y1="450" x2="200" y2="300" stroke="#00ffff" strokeWidth="1" opacity="0.2" strokeDasharray="5,5"/>
              <line x1="600" y1="450" x2="600" y2="300" stroke="#00ffff" strokeWidth="1" opacity="0.2" strokeDasharray="5,5"/>
            </svg>

            {/* Rotating Alien Glyphs Platform */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px]" style={{ zIndex: 1 }}>
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20 animate-spin-slow" style={{ animationDuration: '20s' }}>
                {/* Alien glyphs */}
                <div className="absolute top-[10%] left-1/2 transform -translate-x-1/2 text-green-400/40 text-4xl">◬</div>
                <div className="absolute top-1/2 right-[10%] transform -translate-y-1/2 text-cyan-400/40 text-4xl">◭</div>
                <div className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 text-purple-400/40 text-4xl">◮</div>
                <div className="absolute top-1/2 left-[10%] transform -translate-y-1/2 text-pink-400/40 text-4xl">◯</div>
              </div>
              {/* Inner energy ring */}
              <div className="absolute inset-[20%] rounded-full border-2 border-cyan-400/40 animate-pulse"></div>
              <div className="absolute inset-[40%] rounded-full border border-green-400/30"></div>
            </div>

            {/* Energy Vortex Center (during fight) */}
            {fighting && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 15 }}>
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/50 to-cyan-500/50 animate-spin blur-xl"></div>
                <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-yellow-400/60 animate-ping"></div>
              </div>
            )}

            {/* Lightning Bolts (during fight) */}
            {fighting && fighter1 && fighter2 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 25 }}>
                <defs>
                  <filter id="lightning-glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {/* Animated lightning between fighters */}
                <path d="M 150 250 L 400 240 L 650 250" fill="none" stroke="#ffff00" strokeWidth="3" opacity="0.8" filter="url(#lightning-glow)" className="animate-pulse" strokeDasharray="10,5"/>
                <path d="M 150 260 L 380 270 L 650 260" fill="none" stroke="#00ffff" strokeWidth="2" opacity="0.6" filter="url(#lightning-glow)" className="animate-pulse" strokeDasharray="8,4"/>
              </svg>
            )}

            {/* Fighter 1 Slot - Left Side */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDropFighter1}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-72 h-80 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                fighter1
                  ? 'glass-panel border-4 border-blue-500/70 shadow-2xl shadow-blue-500/70 hover:shadow-blue-500/90'
                  : 'border-4 border-dashed border-gray-600/50 bg-gray-900/20'
              } ${fighting && fighter1 ? 'animate-pulse' : ''}`}
              style={{ zIndex: 20 }}
            >
          {fighter1 ? (
            <div className="text-center">
              <div className="flex justify-center items-center h-16 mb-2">
                <img
                  src={fighter1.image}
                  alt={fighter1.name}
                  className={`max-w-[64px] max-h-[64px] w-auto h-auto object-contain rounded-lg border-2 border-blue-400 ${fighting ? 'animate-bounce' : ''}`}
                  style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                />
              </div>
              <p className="text-blue-400 font-bold text-xl">{fighter1.name}</p>
              {address && fighter1Owner?.toLowerCase() === address.toLowerCase() ? (
                <button
                  onClick={async () => {
                    if (fighter1Paid && address) {
                      // Refund entry fee
                      await addPoints(address, ENTRY_FEE, 'arena');
                      setUserBalance(getUserBalance(address));
                    }
                    setFighter1(null);
                    setFighter1Owner(null);
                    setFighter1Paid(false);
                  }}
                  disabled={fighting}
                  className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Remove {fighter1Paid ? '(Refund 500 AP)' : ''}
                </button>
              ) : (
                <div className="mt-2 px-4 py-1 bg-gray-600 text-gray-300 rounded text-sm">
                  Owner: {fighter1Owner ? `${fighter1Owner.slice(0, 6)}...${fighter1Owner.slice(-4)}` : 'Unknown'}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-4xl mb-2">👽</p>
              <p>Drop Fighter 1 Here</p>
            </div>
          )}
          {fighter1 && !fighter2 && !fighting && (
            <div className="absolute -bottom-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              Waiting for opponent...
            </div>
          )}
        </div>

            {/* Holographic VS Display - Center */}
            <div className="absolute top-[30%] left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 25 }}>
              <div className={`text-7xl font-bold font-alien holographic-text ${fighting ? 'text-yellow-400 animate-ping' : 'text-cyan-400/60'}`}>
                {fighting ? '⚡ VS ⚡' : 'VS'}
              </div>
              {fighting && (
                <div className="absolute inset-0 blur-xl bg-yellow-400/50 animate-pulse"></div>
              )}
            </div>

            {/* Fighter 2 Slot - Right Side */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDropFighter2}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-72 h-80 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                fighter2
                  ? 'glass-panel border-4 border-red-500/70 shadow-2xl shadow-red-500/70 hover:shadow-red-500/90'
                  : 'border-4 border-dashed border-gray-600/50 bg-gray-900/20'
              } ${fighting && fighter2 ? 'animate-pulse' : ''}`}
              style={{ zIndex: 20 }}
            >
          {fighter2 ? (
            <div className="text-center">
              <div className="flex justify-center items-center h-16 mb-2">
                <img
                  src={fighter2.image}
                  alt={fighter2.name}
                  className={`max-w-[64px] max-h-[64px] w-auto h-auto object-contain rounded-lg border-2 border-red-400 ${fighting ? 'animate-bounce' : ''}`}
                  style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                />
              </div>
              <p className="text-red-400 font-bold text-xl">{fighter2.name}</p>
              {address && fighter2Owner?.toLowerCase() === address.toLowerCase() ? (
                <button
                  onClick={async () => {
                    if (fighter2Paid && address) {
                      // Refund entry fee
                      await addPoints(address, ENTRY_FEE, 'arena');
                      setUserBalance(getUserBalance(address));
                    }
                    setFighter2(null);
                    setFighter2Owner(null);
                    setFighter2Paid(false);
                  }}
                  disabled={fighting}
                  className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Remove {fighter2Paid ? '(Refund 500 AP)' : ''}
                </button>
              ) : (
                <div className="mt-2 px-4 py-1 bg-gray-600 text-gray-300 rounded text-sm">
                  Owner: {fighter2Owner ? `${fighter2Owner.slice(0, 6)}...${fighter2Owner.slice(-4)}` : 'Unknown'}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-4xl mb-2">👽</p>
              <p>Drop Fighter 2 Here</p>
            </div>
          )}
        </div>

          </div>
        </div>
      </div>

      {/* Fight Result */}
      {fightResult && (
        <div className="w-full glass-panel border-4 border-yellow-400/70 rounded-2xl p-8 text-center animate-pulse shadow-2xl shadow-yellow-400/70 z-10">
          <p className="text-yellow-400 text-3xl font-bold mb-4">🏆 FIGHT RESULT! 🏆</p>
          <div className="flex justify-center items-center space-x-8">
            <div>
              <div className="flex justify-center items-center h-16 mb-2">
                <img
                  src={fightResult.winner.image}
                  alt="Winner"
                  className="max-w-[64px] max-h-[64px] w-auto h-auto object-contain rounded-lg border-2 border-red-400"
                  style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                />
              </div>
              <p className="text-red-400 font-bold text-xl">WINNER!</p>
              <p className="text-red-400">{fightResult.winner.name}</p>
            </div>
            <p className="text-4xl">VS</p>
            <div className="opacity-50">
              <div className="flex justify-center items-center h-16 mb-2">
                <img
                  src={fightResult.loser.image}
                  alt="Loser"
                  className="max-w-[64px] max-h-[64px] w-auto h-auto object-contain rounded-lg grayscale border-2 border-red-400"
                  style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                />
              </div>
              <p className="text-red-400 font-bold text-xl">DEFEATED</p>
              <p className="text-red-400">{fightResult.loser.name}</p>
            </div>
          </div>
          <button
            onClick={resetArena}
            className="mt-6 px-8 py-3 bg-red-500 text-black font-bold rounded-lg hover:bg-green-600 transition-all"
          >
            FIGHT AGAIN! ⚔️
          </button>
        </div>
      )}

      {/* User's Alien Collection - Draggable */}
      <div className="w-full z-10">
        <h3 className="font-alien font-bold holographic-text tracking-wider text-center mb-4" style={{fontSize: '3.5rem'}}>
          <span className="text-red-400">👽 Your Alien Collection 👽</span>
        </h3>
        <p className="text-red-400 text-sm text-center mb-4 opacity-75">
          Drag and drop your aliens into the arena
        </p>
        <div className="flex flex-wrap justify-center gap-4 max-h-96 overflow-y-auto p-4">
          {ownedAliens.length === 0 ? (
            <div className="w-full text-center text-gray-500 py-8">
              <p className="text-xl">No aliens yet!</p>
              <p className="text-sm">Purchase aliens from the marketplace to start fighting!</p>
            </div>
          ) : (
            ownedAliens.map((alien) => (
              <div
                key={alien.id}
                draggable={!fighting}
                onDragStart={() => handleDragStart(alien)}
                className={`text-center cursor-move transition-all ${
                  fighting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                }`}
              >
                <div className="flex justify-center items-center mb-1">
                  <img
                    src={alien.image}
                    alt={alien.name}
                    className="max-w-[64px] max-h-[64px] w-auto h-auto object-contain rounded-lg"
                    style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                  />
                </div>
                <p className="text-red-400 text-xs font-bold">{alien.name}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* GMB Arena Coming Soon */}
      <div className="w-full glass-panel border-2 border-yellow-500/50 rounded-xl p-6 text-center shadow-lg shadow-yellow-500/50 z-10">
        <p className="text-yellow-400 text-2xl font-bold mb-3 font-alien holographic-text">🚧 GMB ARENA COMING SOON! 🚧</p>
        <p className="text-yellow-300 text-base font-electro">
          Same mechanics with GMB tokens (500 GMB entry, 800 GMB prize).
          Requires smart contract - in development!
        </p>
      </div>

      {/* Info */}
      <div className="w-full text-red-400 text-sm text-center max-w-2xl glass-panel p-6 rounded-xl border-2 border-red-400/50 z-10">
        <p className="font-bold mb-3 text-xl font-iceland">ℹ️ Arena Rules</p>
        <div className="opacity-75 space-y-2 text-center">
          <p>🎮 <strong>How to Play:</strong> Drag aliens from your collection to the fighter slots</p>
          <p>💰 <strong>Entry Fee:</strong> Each player pays 500 AP to enter the arena</p>
          <p>⚔️ <strong>Fight:</strong> When both slots filled and paid, fight starts automatically (random winner)</p>
          <p>🏆 <strong>Winner Gets:</strong> 800 AP (net +300 AP profit after entry fee)</p>
          <p>🏠 <strong>Burn Pool:</strong> 200 AP goes to burn pool for future airdrops/rewards</p>
          <p>🔥 <strong>BURN MECHANIC:</strong> Both aliens are permanently destroyed after the fight!</p>
          <p>⚠️ <strong>Risk vs Reward:</strong> Lose 500 AP + alien, or win 800 AP (net +300 AP after fees)</p>
        </div>
      </div>
    </div>
  );
}
