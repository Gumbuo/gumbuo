"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useAlienPoints } from "../context/AlienPointsEconomy";

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
const HOUSE_FEE = 200; // AP or GMB (goes to burn pool)

export default function GumbuoFightersArena() {
  const { address } = useAccount();
  const { getUserBalance, spendPoints, addPoints, pool } = useAlienPoints();
  const [ownedAliens, setOwnedAliens] = useState<OwnedAlien[]>([]);
  const [fighter1, setFighter1] = useState<OwnedAlien | null>(null);
  const [fighter2, setFighter2] = useState<OwnedAlien | null>(null);
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

      // Award winner 800 AP
      await addPoints(address, WINNER_PRIZE, 'arena');

      // Burn both aliens
      burnAlien(fighter1);
      burnAlien(fighter2);

      // Update balance
      setUserBalance(getUserBalance(address));

      setFightResult({
        winner,
        loser,
        timestamp: Date.now(),
      });

      setFighting(false);

      // Note: House fee (200 AP) goes to burn pool automatically via spendPoints
    }, 3000); // 3 second fight animation
  };

  const resetArena = () => {
    setFighter1(null);
    setFighter2(null);
    setFighter1Paid(false);
    setFighter2Paid(false);
    setFightResult(null);
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-gradient-to-br from-black via-red-900/30 to-black bg-opacity-95 rounded-xl max-w-6xl w-full relative overflow-hidden shadow-2xl shadow-red-500/50">
      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500 animate-pulse"></div>

      {/* Lightning effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-400/5 to-transparent animate-scan pointer-events-none"></div>

      <h2 className="font-bold holographic-text tracking-wider flex items-center justify-center space-x-2 drop-shadow-lg relative z-10" style={{fontSize: '4rem'}}>
        <span className="animate-glow">⚔️ Gumbuo Fighters - Alien Arena ⚔️</span>
      </h2>

      <div className="text-center text-red-400">
        <p className="text-xl mb-2">🎮 Alien Points Arena - LIVE NOW! 🎮</p>
        <p className="text-sm opacity-75">⚠️ Both aliens BURN after fighting! Winner takes 800 AP! ⚠️</p>
      </div>

      {/* Betting Info Banner */}
      <div className="w-full bg-gradient-to-r from-green-400/20 via-green-400/30 to-green-400/20 border-2 border-green-400 rounded-lg p-6 relative overflow-hidden shadow-lg shadow-green-400/50">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent animate-shimmer pointer-events-none"></div>
        <div className="text-center relative z-10">
          <p className="text-green-400 text-2xl font-bold mb-3">💰 ALIEN POINTS BETTING 💰</p>
          <div className="grid grid-cols-3 gap-4 text-green-300">
            <div className="bg-black/50 p-3 rounded-lg">
              <p className="text-sm opacity-75">Entry Fee</p>
              <p className="text-2xl font-bold">500 AP</p>
            </div>
            <div className="bg-black/50 p-3 rounded-lg">
              <p className="text-sm opacity-75">Winner Gets</p>
              <p className="text-2xl font-bold text-yellow-400">800 AP</p>
            </div>
            <div className="bg-black/50 p-3 rounded-lg">
              <p className="text-sm opacity-75">Burn Pool</p>
              <p className="text-2xl font-bold text-purple-400">200 AP</p>
              <p className="text-xs opacity-75 mt-1">→ Future Airdrops</p>
            </div>
          </div>
          <p className="text-green-400 text-sm mt-3 opacity-75">
            🔥 WARNING: Both aliens are permanently burned after the fight! 🔥
          </p>
        </div>
      </div>

      {/* Burn Pool Display */}
      <div className="w-full bg-purple-900/30 border-2 border-purple-500 rounded-lg p-4 text-center">
        <p className="text-purple-400 text-xl font-bold mb-2">🔥 Burn Pool: {pool.marketplacePool.toLocaleString()} AP 🔥</p>
        <p className="text-purple-300 text-sm">
          Arena fees accumulate here for future airdrops & leaderboard rewards!
        </p>
      </div>

      {/* Arena - Two Fighter Slots */}
      <div className="w-full grid grid-cols-2 gap-8 mb-6">
        {/* Fighter 1 Slot */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDropFighter1}
          className={`relative h-64 border-4 rounded-xl flex items-center justify-center transition-all duration-300 ${
            fighter1
              ? 'border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-500/50'
              : 'border-dashed border-gray-600 bg-gray-900/20'
          } ${fighting && fighter1 ? 'animate-pulse' : ''}`}
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
              <button
                onClick={async () => {
                  if (fighter1Paid && address) {
                    // Refund entry fee
                    await addPoints(address, ENTRY_FEE, 'arena');
                    setUserBalance(getUserBalance(address));
                  }
                  setFighter1(null);
                  setFighter1Paid(false);
                }}
                disabled={fighting}
                className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Remove {fighter1Paid ? '(Refund 500 AP)' : ''}
              </button>
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

        {/* VS */}
        <div className="absolute left-1/2 top-32 transform -translate-x-1/2 z-20">
          <div className={`text-6xl font-bold ${fighting ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}>
            {fighting ? '⚡ VS ⚡' : 'VS'}
          </div>
        </div>

        {/* Fighter 2 Slot */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDropFighter2}
          className={`relative h-64 border-4 rounded-xl flex items-center justify-center transition-all duration-300 ${
            fighter2
              ? 'border-red-500 bg-red-900/20 shadow-lg shadow-red-500/50'
              : 'border-dashed border-gray-600 bg-gray-900/20'
          } ${fighting && fighter2 ? 'animate-pulse' : ''}`}
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
              <button
                onClick={async () => {
                  if (fighter2Paid && address) {
                    // Refund entry fee
                    await addPoints(address, ENTRY_FEE, 'arena');
                    setUserBalance(getUserBalance(address));
                  }
                  setFighter2(null);
                  setFighter2Paid(false);
                }}
                disabled={fighting}
                className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Remove {fighter2Paid ? '(Refund 500 AP)' : ''}
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-4xl mb-2">👽</p>
              <p>Drop Fighter 2 Here</p>
            </div>
          )}
        </div>
      </div>

      {/* Fight Result */}
      {fightResult && (
        <div className="w-full bg-gradient-to-r from-yellow-400/20 via-yellow-400/30 to-yellow-400/20 border-2 border-yellow-400 rounded-lg p-6 text-center animate-pulse">
          <p className="text-yellow-400 text-3xl font-bold mb-4">🏆 FIGHT RESULT! 🏆</p>
          <div className="flex justify-center items-center space-x-8">
            <div>
              <div className="flex justify-center items-center h-16 mb-2">
                <img
                  src={fightResult.winner.image}
                  alt="Winner"
                  className="max-w-[64px] max-h-[64px] w-auto h-auto object-contain rounded-lg border-2 border-green-400"
                  style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                />
              </div>
              <p className="text-green-400 font-bold text-xl">WINNER!</p>
              <p className="text-green-400">{fightResult.winner.name}</p>
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
            className="mt-6 px-8 py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-600 transition-all"
          >
            FIGHT AGAIN! ⚔️
          </button>
        </div>
      )}

      {/* User's Alien Collection - Draggable */}
      <div className="w-full">
        <h3 className="font-bold holographic-text tracking-wider text-center mb-4" style={{fontSize: '4rem'}}>
          <span className="animate-glow">👽 Your Alien Collection 👽</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto p-4 bg-black/50 rounded-lg">
          {ownedAliens.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              <p className="text-xl">No aliens yet!</p>
              <p className="text-sm">Purchase aliens from the marketplace to start fighting!</p>
            </div>
          ) : (
            ownedAliens.map((alien) => (
              <div
                key={alien.id}
                draggable={!fighting}
                onDragStart={() => handleDragStart(alien)}
                className={`bg-gray-900 border-2 border-gray-700 rounded-lg p-2 text-center cursor-move hover:border-green-400 transition-all ${
                  fighting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
              >
                <div className="flex justify-center items-center h-16 mb-2">
                  <img
                    src={alien.image}
                    alt={alien.name}
                    className="max-w-[64px] max-h-[64px] w-auto h-auto object-contain rounded-lg border border-green-400/30"
                    style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                  />
                </div>
                <p className="text-green-400 text-sm font-bold truncate">{alien.name}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* GMB Arena Coming Soon */}
      <div className="w-full bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-4 text-center">
        <p className="text-yellow-400 text-xl font-bold mb-2">🚧 GMB ARENA COMING SOON! 🚧</p>
        <p className="text-yellow-300 text-sm">
          Same mechanics with GMB tokens (500 GMB entry, 800 GMB prize).
          Requires smart contract - in development!
        </p>
      </div>

      {/* Info */}
      <div className="w-full text-red-400 text-xs text-center max-w-2xl bg-red-400 bg-opacity-10 p-4 rounded-lg">
        <p className="font-bold mb-2">ℹ️ Arena Rules</p>
        <div className="opacity-75 space-y-2 text-left">
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
