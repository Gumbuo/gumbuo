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
  const [fightLog, setFightLog] = useState<FightResult[]>([]);
  const [isDraggingOverSlot1, setIsDraggingOverSlot1] = useState(false);
  const [isDraggingOverSlot2, setIsDraggingOverSlot2] = useState(false);
  const [fighter1Health, setFighter1Health] = useState(100);
  const [fighter2Health, setFighter2Health] = useState(100);
  const [battleMessage, setBattleMessage] = useState("");

  useEffect(() => {
    if (!address) {
      setOwnedAliens([]);
      setUserBalance(0);
      return;
    }

    // Load user's owned aliens
    const owned = localStorage.getItem(`ownedAliens_${address}`);
    if (owned) {
      setOwnedAliens(JSON.parse(owned));
    } else {
      setOwnedAliens([]); // Clear aliens if new wallet has none
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

    // Load fight log from localStorage
    const savedLog = localStorage.getItem('fightLog');
    if (savedLog) {
      try {
        setFightLog(JSON.parse(savedLog));
      } catch (e) {
        console.error('Failed to load fight log:', e);
      }
    }
  }, []);

  // Check for pending fight results when user connects
  useEffect(() => {
    if (!address) return;

    const pendingFightKey = `pendingFight_${address}`;
    const pendingFight = localStorage.getItem(pendingFightKey);

    if (pendingFight) {
      try {
        const fightData = JSON.parse(pendingFight);

        // Replay the fight animation
        setFighting(true);

        setTimeout(() => {
          setFightResult(fightData.result);
          setFighting(false);

          // Clear pending fight from localStorage
          localStorage.removeItem(pendingFightKey);
        }, 3000); // Match the original fight animation duration
      } catch (e) {
        console.error('Failed to load pending fight:', e);
        localStorage.removeItem(pendingFightKey);
      }
    }
  }, [address]);

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

  const handleDragEnterSlot1 = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedAlien && !fighter1) {
      setIsDraggingOverSlot1(true);
    }
  };

  const handleDragLeaveSlot1 = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverSlot1(false);
  };

  const handleDragEnterSlot2 = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedAlien && !fighter2) {
      setIsDraggingOverSlot2(true);
    }
  };

  const handleDragLeaveSlot2 = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverSlot2(false);
  };

  const handleDropFighter1 = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverSlot1(false);
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
      `⚔️ CONFIRM ARENA ENTRY - PLAYER 1\n\n` +
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
    setIsDraggingOverSlot2(false);
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
      `⚔️ CONFIRM ARENA ENTRY - PLAYER 2\n\n` +
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

  const startFight = async () => {
    if (!fighter1 || !fighter2 || !address) return;

    setFighting(true);
    setFightResult(null);

    // Reset health bars
    setFighter1Health(100);
    setFighter2Health(100);
    setBattleMessage("FIGHT!");

    // Battle start sound
    playSound('hover');

    // Battle messages
    const messages = ["HIT!", "COMBO!", "CRITICAL!", "SMASH!", "POW!", "BOOM!", "ULTRA!"];

    let health1 = 100;
    let health2 = 100;
    let hitCount = 0;

    // Simulate battle over 15 seconds with health bars
    const battleInterval = setInterval(() => {
      hitCount++;

      // Random damage between 5-15 per hit
      const damage = Math.floor(Math.random() * 11) + 5;

      // Randomly choose who gets hit
      if (Math.random() > 0.5) {
        health1 -= damage;
        setBattleMessage(`${fighter2.name} ${messages[Math.floor(Math.random() * messages.length)]}`);
      } else {
        health2 -= damage;
        setBattleMessage(`${fighter1.name} ${messages[Math.floor(Math.random() * messages.length)]}`);
      }

      // Play hit sound - critical hits (damage > 10) get special sound
      if (damage > 10) {
        playSound('success'); // Critical hit sound
      } else {
        playSound('click'); // Normal hit sound
      }

      // Update health bars
      setFighter1Health(Math.max(0, health1));
      setFighter2Health(Math.max(0, health2));

      // Check if someone lost all health
      if (health1 <= 0 || health2 <= 0) {
        clearInterval(battleInterval);
      }
    }, 800); // Hit every 800ms for dramatic effect

    // End fight after 15 seconds
    setTimeout(async () => {
      clearInterval(battleInterval);
      setBattleMessage("FINISH HIM!");
      playSound('error'); // Dramatic finish sound

      // Determine winner based on remaining health
      const winner = health1 > health2 ? fighter1 : fighter2;
      const loser = winner === fighter1 ? fighter2 : fighter1;
      const winnerOwner = winner === fighter1 ? fighter1Owner : fighter2Owner;

      // Award winner 800 AP from reserve pool
      if (winnerOwner) {
        await addPoints(winnerOwner, WINNER_PRIZE, 'arena');
      }

      // Add house fee to burn pool
      try {
        await fetch('/api/points', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: HOUSE_FEE }),
        });
      } catch (error) {
        console.error("Error adding to burn pool:", error);
      }

      // Burn both aliens from their respective owners
      if (fighter1Owner) {
        const owned1 = localStorage.getItem(`ownedAliens_${fighter1Owner}`);
        if (owned1) {
          const aliens1 = JSON.parse(owned1);
          const updated1 = aliens1.filter((a: OwnedAlien) => a.id !== fighter1.id);
          localStorage.setItem(`ownedAliens_${fighter1Owner}`, JSON.stringify(updated1));
          if (fighter1Owner.toLowerCase() === address.toLowerCase()) {
            setOwnedAliens(updated1);
          }
        }
      }

      if (fighter2Owner) {
        const owned2 = localStorage.getItem(`ownedAliens_${fighter2Owner}`);
        if (owned2) {
          const aliens2 = JSON.parse(owned2);
          const updated2 = aliens2.filter((a: OwnedAlien) => a.id !== fighter2.id);
          localStorage.setItem(`ownedAliens_${fighter2Owner}`, JSON.stringify(updated2));
          if (fighter2Owner.toLowerCase() === address.toLowerCase()) {
            setOwnedAliens(updated2);
          }
        }
      }

      // Update balance
      setUserBalance(getUserBalance(address));

      const result: FightResult = {
        winner,
        loser,
        timestamp: Date.now(),
      };

      setFightResult(result);

      // Victory sound
      playSound('success');

      // Add to fight log
      const updatedLog = [result, ...fightLog].slice(0, 50); // Keep last 50 fights
      setFightLog(updatedLog);
      localStorage.setItem('fightLog', JSON.stringify(updatedLog));

      // Save pending fight result for both participants so they can see it if they log out/in
      const fightData = { result, timestamp: Date.now() };
      if (fighter1Owner) {
        localStorage.setItem(`pendingFight_${fighter1Owner}`, JSON.stringify(fightData));
      }
      if (fighter2Owner) {
        localStorage.setItem(`pendingFight_${fighter2Owner}`, JSON.stringify(fightData));
      }

      setFighting(false);
      setBattleMessage("");
    }, 15000); // 15 second cinematic fight animation
  };

  const resetArena = () => {
    setFighter1(null);
    setFighter2(null);
    setFighter1Owner(null);
    setFighter2Owner(null);
    setFighter1Paid(false);
    setFighter2Paid(false);
    setFightResult(null);
    setFighter1Health(100);
    setFighter2Health(100);
    setBattleMessage("");

    // Clear pending fight from localStorage when user dismisses result
    if (address) {
      localStorage.removeItem(`pendingFight_${address}`);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full relative overflow-visible">
      {/* Drag Aliens to Fight */}
      <div className="w-full z-10">
        <h3 className="font-alien font-bold holographic-text tracking-wider text-center mb-4" style={{fontSize: '3.5rem'}}>
          <span className="text-red-400">⚔️ Your Alien Collection ⚔️</span>
        </h3>
        <p className="text-center mb-4">
          <span className="holographic-text font-alien font-bold tracking-wider animate-pulse" style={{fontSize: '2rem'}}>
            ⬇️ Drag and drop your aliens into the arena below to fight ⬇️
          </span>
        </p>
        <div className="flex flex-wrap justify-center gap-4 max-h-96 overflow-y-auto p-4 bg-black/40 rounded-xl border border-red-400/30">
          {ownedAliens.length === 0 ? (
            <div className="w-full text-center text-gray-500 py-8">
              <p className="text-xl">No aliens yet!</p>
              <p className="text-sm">Purchase aliens from the marketplace above to start fighting!</p>
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
                <div className="flex justify-center items-center mb-1 bg-black/60 p-4 rounded-xl border border-orange-400/30">
                  <img
                    src={alien.image}
                    alt={alien.name}
                    className="max-w-[64px] max-h-[64px] w-auto h-auto object-contain rounded-lg"
                  />
                </div>
                <p className="text-orange-400 text-xs font-bold">{alien.name}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* UFO Interior Arena */}
      <div className="w-full relative mb-6 rounded-2xl overflow-hidden" style={{
        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #2a2a2a 100%)',
        boxShadow: 'inset 0 0 50px rgba(0,255,200,0.1), 0 0 30px rgba(0,0,0,0.5)'
      }}>
        {/* Metal Panel Texture with Rivets */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(255,255,255,0.03) 50px, rgba(255,255,255,0.03) 51px),
            repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.03) 50px, rgba(255,255,255,0.03) 51px)
          `,
          zIndex: 1
        }}></div>

        {/* Rivets */}
        {[...Array(20)].map((_, i) => {
          const isTop = i < 10;
          const position = (i % 10) * 10 + 5;
          return (
            <div
              key={`rivet-${i}`}
              className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 shadow-inner"
              style={{
                [isTop ? 'top' : 'bottom']: '10px',
                left: `${position}%`,
                zIndex: 2,
                boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.8), 0 0 3px rgba(255,255,255,0.2)'
              }}
            />
          );
        })}

        {/* Horizontal Pipes */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 shadow-lg" style={{ zIndex: 3 }}>
          <div className="h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 shadow-lg" style={{ zIndex: 3 }}>
          <div className="h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
        </div>

        {/* Vertical Pipes on sides */}
        <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700 shadow-lg" style={{ zIndex: 3 }}>
          <div className="w-1 h-full bg-gradient-to-b from-transparent via-green-400/50 to-transparent ml-2"></div>
        </div>
        <div className="absolute top-0 bottom-0 right-0 w-6 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700 shadow-lg" style={{ zIndex: 3 }}>
          <div className="w-1 h-full bg-gradient-to-b from-transparent via-purple-400/50 to-transparent mr-2"></div>
        </div>

        {/* Control Panels with Dials and Buttons */}
        <div className="absolute top-4 right-12 bg-gray-800 p-3 rounded-lg border-2 border-gray-600 shadow-xl" style={{ zIndex: 4 }}>
          <div className="flex gap-2">
            {/* Dials */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-600 relative">
              <div className="absolute top-1/2 left-1/2 w-1 h-3 bg-cyan-400 rounded-full" style={{ transform: 'translate(-50%, -50%) rotate(45deg)', transformOrigin: 'center bottom' }}></div>
              <div className="absolute inset-1 rounded-full border border-cyan-400/30"></div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-600 relative">
              <div className="absolute top-1/2 left-1/2 w-1 h-3 bg-green-400 rounded-full" style={{ transform: 'translate(-50%, -50%) rotate(-30deg)', transformOrigin: 'center bottom' }}></div>
              <div className="absolute inset-1 rounded-full border border-green-400/30"></div>
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            {/* Buttons */}
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50 animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
          </div>
        </div>

        {/* Left Control Panel */}
        <div className="absolute top-4 left-12 bg-gray-800 p-3 rounded-lg border-2 border-gray-600 shadow-xl" style={{ zIndex: 4 }}>
          <div className="flex flex-col gap-1">
            {/* LED Indicators */}
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse" style={{ animationDuration: '2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50 animate-pulse" style={{ animationDuration: '1.5s' }}></div>
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" style={{ animationDuration: '1.8s' }}></div>
            </div>
            {/* Mini Screens */}
            <div className="w-full h-6 bg-black/80 border border-cyan-400/50 rounded flex items-center justify-center text-[8px] text-cyan-400 font-mono">
              ACTIVE
            </div>
          </div>
        </div>

        {/* Flickering Light Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
          <div className="absolute top-[20%] left-[15%] w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3s' }}></div>
          <div className="absolute top-[60%] right-[15%] w-32 h-32 bg-green-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
        </div>

        {/* Arena Grid */}
        <div className="w-full grid grid-cols-2 gap-8 relative" style={{ zIndex: 10 }}>
          {/* Fighter 1 Slot */}
          <div className="relative flex flex-col p-6">
            <h3 className="text-cyan-400 font-bold text-3xl mb-4 text-center font-alien holographic-text drop-shadow-glow">
              🛸 CHAMBER 1 🛸
            </h3>

            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnterSlot1}
              onDragLeave={handleDragLeaveSlot1}
              onDrop={handleDropFighter1}
              className={`relative h-96 rounded-lg flex items-center justify-center transition-all duration-500 overflow-hidden border-4 ${
                fighter1
                  ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 border-cyan-500 shadow-2xl shadow-cyan-500/50'
                  : 'border-gray-600 bg-gradient-to-br from-gray-900 to-gray-800'
              } ${fighting && fighter1 ? 'animate-pulse' : ''}`}
              style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 11px),
                  repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 11px)
                `
              }}
            >
            {fighter1 ? (
              <div className="text-center">
                <div className="flex justify-center items-center h-32 mb-4">
                  <img
                    src={fighter1.image}
                    alt={fighter1.name}
                    className={`max-w-[128px] max-h-[128px] w-auto h-auto object-contain rounded-lg border-4 border-blue-400 ${fighting ? 'animate-bounce' : ''}`}
                  />
                </div>
                <p className="text-blue-400 font-bold text-2xl mb-2">{fighter1.name}</p>
                {address && fighter1Owner?.toLowerCase() === address.toLowerCase() ? (
                  <button
                    onClick={async () => {
                      if (fighter1Paid && address) {
                        await addPoints(address, ENTRY_FEE, 'arena');
                        setUserBalance(getUserBalance(address));
                      }
                      setFighter1(null);
                      setFighter1Owner(null);
                      setFighter1Paid(false);
                    }}
                    disabled={fighting}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
              <div className="text-center relative w-full h-full">
                {/* Metal Doors */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Left Door */}
                  <div
                    className="absolute left-0 top-0 bottom-0 transition-transform duration-700 ease-in-out border-r-4 border-gray-900"
                    style={{
                      width: '50%',
                      transform: isDraggingOverSlot1 ? 'translateX(-100%)' : 'translateX(0)',
                      background: 'linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
                      boxShadow: 'inset -5px 0 10px rgba(0,0,0,0.9), 5px 0 20px rgba(0,0,0,0.8)',
                      zIndex: 30
                    }}
                  >
                    {/* Door Panel Details */}
                    <div className="absolute inset-0 opacity-40" style={{
                      backgroundImage: `
                        repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 21px),
                        repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 21px)
                      `
                    }}></div>
                    {/* Rivets on door */}
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={`left-rivet-${i}`}
                        className="absolute w-2 h-2 rounded-full bg-gray-700"
                        style={{
                          top: `${15 + i * 15}%`,
                          right: '10px',
                          boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.8)'
                        }}
                      />
                    ))}
                    {/* Door Handle */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg shadow-lg"></div>
                  </div>

                  {/* Right Door */}
                  <div
                    className="absolute right-0 top-0 bottom-0 transition-transform duration-700 ease-in-out border-l-4 border-gray-900"
                    style={{
                      width: '50%',
                      transform: isDraggingOverSlot1 ? 'translateX(100%)' : 'translateX(0)',
                      background: 'linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
                      boxShadow: 'inset 5px 0 10px rgba(0,0,0,0.9), -5px 0 20px rgba(0,0,0,0.8)',
                      zIndex: 30
                    }}
                  >
                    {/* Door Panel Details */}
                    <div className="absolute inset-0 opacity-40" style={{
                      backgroundImage: `
                        repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 21px),
                        repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 21px)
                      `
                    }}></div>
                    {/* Rivets on door */}
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={`right-rivet-${i}`}
                        className="absolute w-2 h-2 rounded-full bg-gray-700"
                        style={{
                          top: `${15 + i * 15}%`,
                          left: '10px',
                          boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.8)'
                        }}
                      />
                    ))}
                    {/* Door Handle */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-16 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg shadow-lg"></div>
                  </div>

                  {/* Warning Stripes on Door Frame */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-full bg-gradient-to-b from-yellow-500/0 via-yellow-500/30 to-yellow-500/0" style={{ zIndex: 19 }}></div>
                </div>

                {/* Inside Chamber (visible when doors open) */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <div className="text-cyan-400 text-6xl mb-4 opacity-70">⚡</div>
                  <p className="text-xl text-cyan-400/80 font-alien">Chamber 1</p>
                  <p className="text-sm text-cyan-400/50 mt-2 font-mono">READY FOR DEPLOYMENT</p>
                  {isDraggingOverSlot1 && (
                    <div className="mt-4 px-4 py-2 bg-cyan-500/20 border border-cyan-400/50 rounded text-cyan-400 text-sm animate-pulse">
                      DOORS OPENING...
                    </div>
                  )}
                </div>
              </div>
            )}
            {fighter1 && !fighter2 && !fighting && (
              <div className="absolute -bottom-4 bg-yellow-400 text-black px-4 py-2 rounded-full text-base font-bold animate-pulse">
                Waiting for Player 2...
              </div>
            )}
          </div>
        </div>

        {/* VS in center - UFO Control Panel Style */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          {fighting ? (
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 w-32 h-32 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="text-8xl font-bold font-alien text-red-500 animate-ping holographic-text">
                  💥 VS 💥
                </div>
              </div>
              <div className="bg-gray-800 px-6 py-2 rounded-lg border-2 border-red-500 shadow-lg shadow-red-500/50 animate-pulse">
                <p className="text-red-500 font-mono text-sm font-bold">BATTLE IN PROGRESS</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg border-2 border-gray-600 shadow-2xl" style={{
              background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #2a2a2a 100%)'
            }}>
              <div className="text-6xl font-bold font-alien text-orange-400 holographic-text mb-2">VS</div>
              <div className="flex gap-2 justify-center mt-3">
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
              </div>
            </div>
          )}
        </div>

        {/* Fighter 2 Slot */}
        <div className="relative flex flex-col p-6">
          <h3 className="text-purple-400 font-bold text-3xl mb-4 text-center font-alien holographic-text drop-shadow-glow">
            🛸 CHAMBER 2 🛸
          </h3>

          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnterSlot2}
            onDragLeave={handleDragLeaveSlot2}
            onDrop={handleDropFighter2}
            className={`relative h-96 rounded-lg flex items-center justify-center transition-all duration-500 overflow-hidden border-4 ${
              fighter2
                ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 border-purple-500 shadow-2xl shadow-purple-500/50'
                : 'border-gray-600 bg-gradient-to-br from-gray-900 to-gray-800'
            } ${fighting && fighter2 ? 'animate-pulse' : ''}`}
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 11px),
                repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 11px)
              `
            }}
          >
            {fighter2 ? (
              <div className="text-center">
                <div className="flex justify-center items-center h-32 mb-4">
                  <img
                    src={fighter2.image}
                    alt={fighter2.name}
                    className={`max-w-[128px] max-h-[128px] w-auto h-auto object-contain rounded-lg border-4 border-red-400 ${fighting ? 'animate-bounce' : ''}`}
                  />
                </div>
                <p className="text-red-400 font-bold text-2xl mb-2">{fighter2.name}</p>
                {address && fighter2Owner?.toLowerCase() === address.toLowerCase() ? (
                  <button
                    onClick={async () => {
                      if (fighter2Paid && address) {
                        await addPoints(address, ENTRY_FEE, 'arena');
                        setUserBalance(getUserBalance(address));
                      }
                      setFighter2(null);
                      setFighter2Owner(null);
                      setFighter2Paid(false);
                    }}
                    disabled={fighting}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Remove {fighter2Paid ? '(Refund 500 AP)' : ''}
                  </button>
                ) : (
                  <div className="mt-2 px-4 py-1 bg-gray-600 text-gray-300 rounded text-sm">
                    Owner: {fighter2Owner ? `${fighter2Owner.slice(0, 6)}...${fighter2Owner.slice(-4)}` : 'Unknown'}
                  </div>
                )}

            {/* Waiting message when fighter2 is set but fighter1 is not */}
            {fighter2 && !fighter1 && !fighting && (
              <div className="absolute -bottom-4 bg-yellow-400 text-black px-4 py-2 rounded-full text-base font-bold animate-pulse">
                Waiting for Player 1...
              </div>
            )}
              </div>
            ) : (
              <div className="text-center relative w-full h-full">
                {/* Metal Doors */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Left Door */}
                  <div
                    className="absolute left-0 top-0 bottom-0 transition-transform duration-700 ease-in-out border-r-4 border-gray-900"
                    style={{
                      width: '50%',
                      transform: isDraggingOverSlot2 ? 'translateX(-100%)' : 'translateX(0)',
                      background: 'linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
                      boxShadow: 'inset -5px 0 10px rgba(0,0,0,0.9), 5px 0 20px rgba(0,0,0,0.8)',
                      zIndex: 30
                    }}
                  >
                    {/* Door Panel Details */}
                    <div className="absolute inset-0 opacity-40" style={{
                      backgroundImage: `
                        repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 21px),
                        repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 21px)
                      `
                    }}></div>
                    {/* Rivets on door */}
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={`left-rivet2-${i}`}
                        className="absolute w-2 h-2 rounded-full bg-gray-700"
                        style={{
                          top: `${15 + i * 15}%`,
                          right: '10px',
                          boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.8)'
                        }}
                      />
                    ))}
                    {/* Door Handle */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg shadow-lg"></div>
                  </div>

                  {/* Right Door */}
                  <div
                    className="absolute right-0 top-0 bottom-0 transition-transform duration-700 ease-in-out border-l-4 border-gray-900"
                    style={{
                      width: '50%',
                      transform: isDraggingOverSlot2 ? 'translateX(100%)' : 'translateX(0)',
                      background: 'linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
                      boxShadow: 'inset 5px 0 10px rgba(0,0,0,0.9), -5px 0 20px rgba(0,0,0,0.8)',
                      zIndex: 30
                    }}
                  >
                    {/* Door Panel Details */}
                    <div className="absolute inset-0 opacity-40" style={{
                      backgroundImage: `
                        repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 21px),
                        repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 21px)
                      `
                    }}></div>
                    {/* Rivets on door */}
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={`right-rivet2-${i}`}
                        className="absolute w-2 h-2 rounded-full bg-gray-700"
                        style={{
                          top: `${15 + i * 15}%`,
                          left: '10px',
                          boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.8)'
                        }}
                      />
                    ))}
                    {/* Door Handle */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-16 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg shadow-lg"></div>
                  </div>

                  {/* Warning Stripes on Door Frame */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-full bg-gradient-to-b from-purple-500/0 via-purple-500/30 to-purple-500/0" style={{ zIndex: 19 }}></div>
                </div>

                {/* Inside Chamber (visible when doors open) */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <div className="text-purple-400 text-6xl mb-4 opacity-70">⚡</div>
                  <p className="text-xl text-purple-400/80 font-alien">Chamber 2</p>
                  <p className="text-sm text-purple-400/50 mt-2 font-mono">READY FOR DEPLOYMENT</p>
                  {isDraggingOverSlot2 && (
                    <div className="mt-4 px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded text-purple-400 text-sm animate-pulse">
                      DOORS OPENING...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Cinematic Battle Overlay */}
      {fighting && fighter1 && fighter2 && (
        <div className="w-full glass-panel border-4 border-red-500/70 rounded-2xl p-8 text-center shadow-2xl shadow-red-500/70 z-10 bg-black/90">
          <p className="text-red-500 text-5xl font-bold mb-8 font-alien animate-pulse">⚔️ BATTLE IN PROGRESS ⚔️</p>

          {/* Battle Message */}
          {battleMessage && (
            <div className="mb-8 animate-pulse">
              <p className="text-yellow-400 text-6xl font-bold font-alien drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]">{battleMessage}</p>
            </div>
          )}

          {/* Fighters Side by Side */}
          <div className="flex justify-center items-start space-x-12 mt-8">
            {/* Fighter 1 */}
            <div className="flex-1 max-w-md">
              <div className="flex justify-center items-center h-48 mb-4">
                <img
                  src={fighter1.image}
                  alt={fighter1.name}
                  className="max-w-[192px] max-h-[192px] w-auto h-auto object-contain rounded-lg border-4 border-blue-400 animate-bounce shadow-2xl shadow-blue-400/50"
                />
              </div>
              <p className="text-blue-400 font-bold text-3xl mb-4 font-alien">{fighter1.name}</p>

              {/* Health Bar */}
              <div className="w-full mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-400 font-bold text-xl">HEALTH</span>
                  <span className="text-blue-400 font-bold text-2xl">{fighter1Health}%</span>
                </div>
                <div className="w-full bg-gray-900 rounded-full h-8 border-4 border-blue-400 overflow-hidden shadow-lg shadow-blue-400/50">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full transition-all duration-300 shadow-lg shadow-blue-400/50"
                    style={{width: `${fighter1Health}%`}}
                  ></div>
                </div>
              </div>
            </div>

            {/* VS */}
            <div className="flex items-center justify-center">
              <p className="text-8xl font-bold text-red-500 font-alien animate-pulse">VS</p>
            </div>

            {/* Fighter 2 */}
            <div className="flex-1 max-w-md">
              <div className="flex justify-center items-center h-48 mb-4">
                <img
                  src={fighter2.image}
                  alt={fighter2.name}
                  className="max-w-[192px] max-h-[192px] w-auto h-auto object-contain rounded-lg border-4 border-red-400 animate-bounce shadow-2xl shadow-red-400/50"
                />
              </div>
              <p className="text-red-400 font-bold text-3xl mb-4 font-alien">{fighter2.name}</p>

              {/* Health Bar */}
              <div className="w-full mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-red-400 font-bold text-xl">HEALTH</span>
                  <span className="text-red-400 font-bold text-2xl">{fighter2Health}%</span>
                </div>
                <div className="w-full bg-gray-900 rounded-full h-8 border-4 border-red-400 overflow-hidden shadow-lg shadow-red-400/50">
                  <div
                    className="bg-gradient-to-r from-red-400 to-orange-400 h-full transition-all duration-300 shadow-lg shadow-red-400/50"
                    style={{width: `${fighter2Health}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fight Result */}
      {fightResult && (
        <div className="w-full glass-panel border-4 border-yellow-400/70 rounded-2xl p-8 text-center animate-pulse shadow-2xl shadow-yellow-400/70 z-10">
          <p className="text-yellow-400 text-4xl font-bold mb-6 font-alien">🏆 FIGHT RESULT! 🏆</p>
          <div className="flex justify-center items-center space-x-12">
            <div>
              <div className="flex justify-center items-center h-32 mb-4">
                <img
                  src={fightResult.winner.image}
                  alt="Winner"
                  className="max-w-[128px] max-h-[128px] w-auto h-auto object-contain rounded-lg border-4 border-yellow-400"
                />
              </div>
              <p className="text-yellow-400 font-bold text-2xl">WINNER!</p>
              <p className="text-yellow-400 text-xl">{fightResult.winner.name}</p>
            </div>
            <p className="text-6xl font-bold">VS</p>
            <div className="opacity-50">
              <div className="flex justify-center items-center h-32 mb-4">
                <img
                  src={fightResult.loser.image}
                  alt="Loser"
                  className="max-w-[128px] max-h-[128px] w-auto h-auto object-contain rounded-lg grayscale border-4 border-gray-600"
                />
              </div>
              <p className="text-gray-400 font-bold text-2xl">DEFEATED</p>
              <p className="text-gray-400 text-xl">{fightResult.loser.name}</p>
            </div>
          </div>
          <button
            onClick={resetArena}
            className="mt-8 px-12 py-4 bg-green-500 text-black font-bold text-xl rounded-xl hover:bg-green-600 transition-all"
          >
            FIGHT AGAIN! ⚔️
          </button>
        </div>
      )}

      {/* Fight Log */}
      {fightLog.length > 0 && (
        <div className="w-full glass-panel border-2 border-cyan-400/50 rounded-xl p-6 z-10 shadow-xl shadow-cyan-400/30">
          <h3 className="font-alien font-bold holographic-text tracking-wider text-center mb-4" style={{fontSize: '3rem'}}>
            <span className="text-cyan-400">📜 Fight History 📜</span>
          </h3>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {fightLog.map((fight, index) => (
              <div
                key={`${fight.timestamp}-${index}`}
                className="bg-black/40 rounded-lg p-4 flex items-center justify-between space-x-4 hover:bg-black/60 transition-all"
              >
                {/* Winner */}
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-12 h-12 flex-shrink-0">
                    <img
                      src={fight.winner.image}
                      alt={fight.winner.name}
                      className="w-full h-full max-w-[48px] max-h-[48px] object-contain rounded border-2 border-green-400"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-green-400 font-bold text-sm">👑 {fight.winner.name}</p>
                    <p className="text-green-300 text-xs">WINNER</p>
                  </div>
                </div>

                {/* VS */}
                <p className="text-purple-400 font-bold text-lg">VS</p>

                {/* Loser */}
                <div className="flex items-center space-x-3 flex-1 justify-end">
                  <div className="text-right">
                    <p className="text-red-400 font-bold text-sm">{fight.loser.name}</p>
                    <p className="text-red-300 text-xs">DEFEATED</p>
                  </div>
                  <div className="w-12 h-12 flex-shrink-0">
                    <img
                      src={fight.loser.image}
                      alt={fight.loser.name}
                      className="w-full h-full max-w-[48px] max-h-[48px] object-contain rounded border-2 border-red-400 grayscale opacity-60"
                    />
                  </div>
                </div>

                {/* Timestamp */}
                <p className="text-cyan-400 text-xs opacity-75 min-w-[80px] text-right">
                  {new Date(fight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
          <p className="text-cyan-400 text-xs text-center mt-4 opacity-75">
            {fightLog.length} {fightLog.length === 1 ? 'fight' : 'fights'} recorded
          </p>
        </div>
      )}

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
          <p>🔥 <strong>BURN MECHANIC:</strong> Both aliens are permanently destroyed after the fight!</p>
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
    </div>
  );
}
