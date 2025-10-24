"use client";
import { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import { useAccount } from "wagmi";
import { useAlienPoints } from "../context/AlienPointsEconomy";

// Wheel segments with weighted probability (lower value = more common)
const wheelData = [
  { option: "50", style: { backgroundColor: "#00ff99", textColor: "#000" }, probability: 30 },
  { option: "75", style: { backgroundColor: "#8e44ad", textColor: "#fff" }, probability: 25 },
  { option: "100", style: { backgroundColor: "#00ff99", textColor: "#000" }, probability: 20 },
  { option: "150", style: { backgroundColor: "#8e44ad", textColor: "#fff" }, probability: 12 },
  { option: "200", style: { backgroundColor: "#00ff99", textColor: "#000" }, probability: 8 },
  { option: "250", style: { backgroundColor: "#8e44ad", textColor: "#fff" }, probability: 3 },
  { option: "300", style: { backgroundColor: "#00ff99", textColor: "#000" }, probability: 1.5 },
  { option: "400", style: { backgroundColor: "#8e44ad", textColor: "#fff" }, probability: 0.4 },
  { option: "500", style: { backgroundColor: "#FFD700", textColor: "#000" }, probability: 0.1 }, // Rare gold!
  { option: "100", style: { backgroundColor: "#00ff99", textColor: "#000" }, probability: 20 }, // Duplicate for balance
];

export default function AlienWheel() {
  const { address, isConnected } = useAccount();
  const { getUserBalance, addPoints, getPoolRemaining } = useAlienPoints();
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [wonPoints, setWonPoints] = useState<number | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState("");

  // Calculate time until 8pm EST (daily reset)
  const calculateTimeUntilReset = () => {
    const now = new Date();

    // Convert current time to EST
    const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));

    // Set next reset to 8pm EST today
    const nextReset = new Date(estTime);
    nextReset.setHours(20, 0, 0, 0); // 8pm = 20:00

    // If we're past 8pm EST today, set to 8pm EST tomorrow
    if (estTime >= nextReset) {
      nextReset.setDate(nextReset.getDate() + 1);
    }

    // Convert back to local time for comparison
    const nextResetLocal = new Date(nextReset.toLocaleString("en-US", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));

    const diff = nextResetLocal.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Check if user has spun in current 24hr cycle (8pm EST to 8pm EST)
  useEffect(() => {
    if (!address) return;

    const lastSpinTime = localStorage.getItem(`lastSpin_${address}`);

    if (lastSpinTime) {
      const lastSpin = new Date(parseInt(lastSpinTime));
      const now = new Date();

      // Convert to EST
      const estNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const estLastSpin = new Date(lastSpin.toLocaleString("en-US", { timeZone: "America/New_York" }));

      // Find the last 8pm EST reset
      const lastReset = new Date(estNow);
      lastReset.setHours(20, 0, 0, 0);
      if (estNow < lastReset) {
        // If before 8pm today, last reset was yesterday at 8pm
        lastReset.setDate(lastReset.getDate() - 1);
      }

      // Check if last spin was after the most recent 8pm EST reset
      if (estLastSpin >= lastReset) {
        setHasSpunToday(true);
        const savedPoints = localStorage.getItem(`lastWin_${address}`);
        if (savedPoints) {
          setWonPoints(parseInt(savedPoints));
        }
      } else {
        setHasSpunToday(false);
        setWonPoints(null);
      }
    } else {
      setHasSpunToday(false);
      setWonPoints(null);
    }

    // Update user balance
    setUserPoints(getUserBalance(address));
  }, [address, getUserBalance]);

  // Update countdown every second
  useEffect(() => {
    if (!hasSpunToday) return;

    const updateTimer = () => {
      setTimeUntilReset(calculateTimeUntilReset());
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [hasSpunToday]);

  // Weighted random selection
  const getWeightedRandomIndex = () => {
    const totalWeight = wheelData.reduce((sum, item) => sum + item.probability, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < wheelData.length; i++) {
      random -= wheelData[i].probability;
      if (random <= 0) {
        return i;
      }
    }
    return 0;
  };

  const handleSpinClick = () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    if (hasSpunToday) {
      alert("You've already spun today! Come back tomorrow! 👽");
      return;
    }

    const newPrizeNumber = getWeightedRandomIndex();
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  const handleStopSpinning = async () => {
    setMustSpin(false);
    const points = parseInt(wheelData[prizeNumber].option);
    setWonPoints(points);

    if (address) {
      // Add points to user balance from wheel pool
      const success = await addPoints(address, points, 'wheel');

      if (success) {
        // Save to localStorage with timestamp
        localStorage.setItem(`lastSpin_${address}`, Date.now().toString());
        localStorage.setItem(`lastWin_${address}`, points.toString());
        setHasSpunToday(true);
        setUserPoints(getUserBalance(address));

        // Show celebration
        alert(`🎉 Congratulations! You won ${points} Alien Points! 👽`);
      } else {
        alert("Wheel pool depleted! Please try the drip station!");
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8 bg-gradient-to-br from-blue-900/40 via-black/90 to-blue-900/40 rounded-2xl border-4 border-blue-400 shadow-2xl shadow-blue-500/50 w-full max-w-3xl">
      <h2 className="font-bold holographic-text tracking-wider flex items-center space-x-3" style={{fontSize: '4rem'}}>
        <img src="/nyx.png" alt="Nyx" style={{width: '64px', height: '64px', objectFit: 'cover'}} className="animate-bounce" />
        <span className="animate-glow text-blue-400">🎰 Daily Alien Wheel 🎰</span>
        <img src="/zorb.png" alt="Zorb" style={{width: '64px', height: '64px', objectFit: 'cover'}} className="animate-bounce" />
      </h2>

      {/* Pool Status */}
      <div className="w-full bg-gradient-to-r from-blue-400/10 via-blue-400/20 to-blue-400/10 border-2 border-blue-400/50 rounded-lg p-4 relative overflow-hidden shadow-lg shadow-blue-400/30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-shimmer pointer-events-none"></div>
        <p className="text-blue-400 text-center text-xl drop-shadow-glow relative z-10">
          🎰 Wheel Pool: <span className="font-bold text-2xl">{getPoolRemaining('wheel').toLocaleString()}</span> / 100,000,000 AP
        </p>
        <div className="w-full bg-gray-900 rounded-full h-5 border-2 border-gray-700 shadow-inner mt-2 relative overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 h-full rounded-full transition-all duration-500 shadow-lg shadow-blue-400/50 relative overflow-hidden"
            style={{width: `${(getPoolRemaining('wheel') / 100_000_000) * 100}%`}}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* User Balance */}
      {isConnected && address && (
        <div className="w-full bg-blue-400 bg-opacity-20 border-2 border-blue-400 rounded-lg p-4 text-center shadow-lg shadow-blue-400/30">
          <p className="text-blue-400 text-xl">
            👽 Your Alien Points: <span className="font-bold text-3xl">{userPoints.toLocaleString()}</span>
          </p>
        </div>
      )}

      <div className="relative">
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={wheelData}
          onStopSpinning={handleStopSpinning}
          backgroundColors={["#3b82f6", "#1e3a8a"]}
          textColors={["#ffffff", "#ffffff"]}
          outerBorderColor="#60a5fa"
          outerBorderWidth={5}
          innerBorderColor="#1e40af"
          innerBorderWidth={3}
          radiusLineColor="#1e293b"
          radiusLineWidth={2}
          fontSize={20}
          perpendicularText={false}
          textDistance={60}
        />
      </div>

      {wonPoints !== null && hasSpunToday && (
        <div className="text-center p-6 bg-gradient-to-r from-blue-400/20 via-blue-400/30 to-blue-400/20 border-2 border-blue-400 rounded-lg shadow-lg shadow-blue-400/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-shimmer pointer-events-none"></div>
          <p className="text-3xl text-blue-400 font-bold relative z-10">
            Today's Win: {wonPoints} Alien Points! 🎉
          </p>
          <p className="text-lg text-blue-300 mt-2 relative z-10">Next spin available in:</p>
          <p className="text-2xl text-yellow-400 font-bold mt-1 animate-pulse relative z-10">⏰ {timeUntilReset}</p>
        </div>
      )}

      <button
        onClick={handleSpinClick}
        disabled={hasSpunToday || mustSpin}
        className={`px-16 py-6 text-3xl font-bold rounded-xl tracking-wider transition-all duration-200 relative overflow-hidden ${
          hasSpunToday || mustSpin
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 text-white hover:scale-110 hover:shadow-2xl hover:shadow-blue-400/80 animate-pulse-glow"
        }`}
      >
        {!hasSpunToday && !mustSpin && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        )}
        <span className="relative z-10">
          {hasSpunToday ? "Already Spun Today! 👽" : mustSpin ? "Spinning... 🎰" : "SPIN THE WHEEL! 🎰"}
        </span>
      </button>

      {!isConnected && (
        <p className="text-yellow-400 text-lg font-bold animate-pulse">⚠️ Connect your wallet to spin!</p>
      )}

      <div className="w-full bg-gradient-to-r from-blue-900/30 via-blue-800/40 to-blue-900/30 border-2 border-blue-400/50 rounded-lg p-6 shadow-lg shadow-blue-400/20">
        <p className="font-bold text-xl mb-4 text-blue-400 text-center">🎰 Prize Probabilities 🎰</p>
        <div className="grid grid-cols-2 gap-3 text-base">
          <span className="text-blue-300">50 pts: Common</span>
          <span className="text-blue-300">75 pts: Common</span>
          <span className="text-blue-300">100 pts: Common</span>
          <span className="text-purple-300">150 pts: Uncommon</span>
          <span className="text-purple-300">200 pts: Uncommon</span>
          <span className="text-pink-300">250 pts: Rare</span>
          <span className="text-pink-400">300 pts: Very Rare</span>
          <span className="text-orange-400">400 pts: Epic</span>
          <span className="col-span-2 text-yellow-400 font-bold text-lg text-center animate-pulse">500 pts: LEGENDARY! 🌟</span>
        </div>
      </div>
    </div>
  );
}
