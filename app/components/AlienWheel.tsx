"use client";
import { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import { useAccount } from "wagmi";
import { useAlienPoints } from "../context/AlienPointsEconomy";
import { useCosmicSound } from "../hooks/useCosmicSound";

// Wheel segments with weighted probability (lower value = more common)
const wheelData = [
  { option: "50", style: { backgroundColor: "#00ff99", textColor: "#000" }, probability: 30 },
  { option: "75", style: { backgroundColor: "#3b82f6", textColor: "#fff" }, probability: 25 },
  { option: "100", style: { backgroundColor: "#00ff99", textColor: "#000" }, probability: 20 },
  { option: "150", style: { backgroundColor: "#3b82f6", textColor: "#fff" }, probability: 12 },
  { option: "200", style: { backgroundColor: "#00ff99", textColor: "#000" }, probability: 8 },
  { option: "250", style: { backgroundColor: "#3b82f6", textColor: "#fff" }, probability: 3 },
  { option: "300", style: { backgroundColor: "#00ff99", textColor: "#000" }, probability: 1.5 },
  { option: "400", style: { backgroundColor: "#3b82f6", textColor: "#fff" }, probability: 0.4 },
  { option: "500", style: { backgroundColor: "#FFD700", textColor: "#000" }, probability: 0.1 }, // Rare gold!
  { option: "100", style: { backgroundColor: "#00ff99", textColor: "#000" }, probability: 20 }, // Duplicate for balance
];

export default function AlienWheel() {
  const { address, isConnected } = useAccount();
  const { getUserBalance, addPoints, getPoolRemaining } = useAlienPoints();
  const { playSound } = useCosmicSound();
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [wonPoints, setWonPoints] = useState<number | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

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
      playSound('error');
      alert("Please connect your wallet first!");
      return;
    }

    if (hasSpunToday) {
      playSound('error');
      alert("You've already spun today! Come back tomorrow! 👽");
      return;
    }

    playSound('click');
    const newPrizeNumber = getWeightedRandomIndex();
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  const handleStopSpinning = async () => {
    setMustSpin(false);
    const points = parseInt(wheelData[prizeNumber].option);
    setWonPoints(points);

    // Trigger confetti animation
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1000);

    if (address) {
      // Add points to user balance from wheel pool
      const success = await addPoints(address, points, 'wheel');

      if (success) {
        playSound('success');
        // Save to localStorage with timestamp
        localStorage.setItem(`lastSpin_${address}`, Date.now().toString());
        localStorage.setItem(`lastWin_${address}`, points.toString());
        setHasSpunToday(true);
        setUserPoints(getUserBalance(address));

        // Show celebration
        alert(`🎉 Congratulations! You won ${points} Alien Points! 👽`);
      } else {
        playSound('error');
        alert("Wheel pool depleted! Please try the drip station!");
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8 holographic-panel max-w-6xl relative overflow-visible rounded-3xl">
      {/* Corner glow accents */}
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <h2 className="font-alien font-bold holographic-text tracking-wider flex items-center space-x-3 alien-glyph-text relative z-10" style={{fontSize: '4rem'}}>
        <img src="/nyx.png" alt="Nyx" style={{width: '64px', height: '64px', objectFit: 'cover'}} className="animate-bounce" />
        <span className="animate-glow text-blue-400">🎰 Daily Alien Wheel 🎰</span>
        <img src="/zorb.png" alt="Zorb" style={{width: '64px', height: '64px', objectFit: 'cover'}} className="animate-bounce" />
      </h2>

      {/* Pool Status */}
      <div className="w-full glass-panel rounded-xl p-4 relative overflow-hidden shadow-lg shadow-blue-400/30 z-10">
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
        <div className="w-full glass-panel border-2 border-blue-400/50 rounded-xl p-4 text-center shadow-lg shadow-blue-400/30 z-10">
          <p className="text-blue-400 text-xl font-electro">
            👽 Your Alien Points: <span className="font-bold text-3xl font-alien holographic-text">{userPoints.toLocaleString()}</span>
          </p>
        </div>
      )}

      <div className="relative">
        {/* Confetti particles */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: '10px',
                  height: '10px',
                  backgroundColor: ['#FFD700', '#00ff99', '#3b82f6', '#ff00ff', '#ff6b6b'][Math.floor(Math.random() * 5)],
                  borderRadius: '50%',
                  animationDelay: `${Math.random() * 0.3}s`
                }}
              />
            ))}
          </div>
        )}

        <div className={mustSpin ? "animate-wheel-glow" : ""}>
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
      </div>

      {wonPoints !== null && hasSpunToday && (
        <div className="text-center p-6 glass-panel border-2 border-blue-400/50 rounded-xl shadow-lg shadow-blue-400/30 relative overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-shimmer pointer-events-none"></div>
          <p className="text-3xl text-blue-400 font-bold relative z-10 font-alien holographic-text">
            Today's Win: {wonPoints} Alien Points! 🎉
          </p>
          <p className="text-lg text-blue-300 mt-2 relative z-10 font-electro">Next spin available in:</p>
          <p className="text-2xl text-yellow-400 font-bold mt-1 animate-pulse relative z-10 font-mono alien-code">⏰ {timeUntilReset}</p>
        </div>
      )}

      <div className="relative flex flex-col items-center">
        {/* UFO Button Container */}
        <div className="relative">
          {/* Rotating glow ring */}
          {!hasSpunToday && !mustSpin && (
            <div className="absolute -inset-8 bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 rounded-full opacity-50 blur-xl animate-spin-border-rotate pointer-events-none"></div>
          )}

          {/* UFO Button */}
          <button
            onClick={handleSpinClick}
            onMouseEnter={() => !hasSpunToday && !mustSpin && playSound('hover')}
            disabled={hasSpunToday || mustSpin}
            className={`relative transition-all duration-300 overflow-visible ${
              hasSpunToday || mustSpin
                ? "cursor-not-allowed opacity-50"
                : "hover:scale-105 hover-float"
            }`}
            style={{
              width: '320px',
              height: '200px',
            }}
          >
            {/* UFO Main Saucer Body */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-24 rounded-full ${
                hasSpunToday || mustSpin
                  ? "bg-gray-600"
                  : "bg-gradient-to-b from-cyan-400 via-green-400 to-cyan-500"
              } shadow-2xl`}
              style={{
                boxShadow: hasSpunToday || mustSpin
                  ? 'none'
                  : '0 0 40px rgba(74, 222, 128, 0.8), 0 0 80px rgba(74, 222, 128, 0.6), inset 0 -20px 40px rgba(0, 255, 153, 0.4)'
              }}
            >
              {/* Shimmer effect on saucer */}
              {!hasSpunToday && !mustSpin && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer rounded-full"></div>
              )}
            </div>

            {/* UFO Top Dome */}
            <div
              className={`absolute top-8 left-1/2 -translate-x-1/2 w-32 h-20 rounded-t-full ${
                hasSpunToday || mustSpin ? "bg-gray-500" : "bg-gradient-to-b from-cyan-300 via-cyan-400 to-transparent"
              } opacity-80`}
              style={{
                borderTopLeftRadius: '100px',
                borderTopRightRadius: '100px',
              }}
            ></div>

            {/* UFO Windows around the dome */}
            <div className="absolute top-14 left-1/2 -translate-x-1/2 flex space-x-3">
              <div className={`w-6 h-6 rounded-full ${hasSpunToday || mustSpin ? "bg-gray-400" : "bg-yellow-300 animate-pulse shadow-lg shadow-yellow-400/50"}`}></div>
              <div className={`w-6 h-6 rounded-full ${hasSpunToday || mustSpin ? "bg-gray-400" : "bg-yellow-300 animate-pulse shadow-lg shadow-yellow-400/50"}`} style={{animationDelay: '0.2s'}}></div>
              <div className={`w-6 h-6 rounded-full ${hasSpunToday || mustSpin ? "bg-gray-400" : "bg-yellow-300 animate-pulse shadow-lg shadow-yellow-400/50"}`} style={{animationDelay: '0.4s'}}></div>
            </div>

            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
              <div className="text-5xl mb-1">🛸</div>
              <div className={`text-2xl font-bold font-alien ${hasSpunToday || mustSpin ? "text-gray-300" : "text-white drop-shadow-lg"}`}>
                {hasSpunToday ? "Tomorrow!" : mustSpin ? "Spinning..." : "SPIN!"}
              </div>
            </div>

            {/* Light beam effect below UFO */}
            {!hasSpunToday && !mustSpin && (
              <div
                className="absolute top-28 left-1/2 -translate-x-1/2 bg-gradient-to-b from-cyan-400/60 via-green-400/40 to-transparent blur-md animate-pulse"
                style={{
                  width: '120px',
                  height: '100px',
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                }}
              ></div>
            )}

            {/* Side lights on the saucer */}
            {!hasSpunToday && !mustSpin && (
              <>
                <div className="absolute top-1/2 left-4 w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
                <div className="absolute top-1/2 right-4 w-3 h-3 rounded-full bg-red-400 animate-pulse" style={{animationDelay: '0.3s'}}></div>
              </>
            )}
          </button>
        </div>
      </div>

      {!isConnected && (
        <p className="text-yellow-400 text-lg font-bold animate-pulse">⚠️ Connect your wallet to spin!</p>
      )}

      <div className="w-full glass-panel border-2 border-blue-400/50 rounded-xl p-6 shadow-lg shadow-blue-400/20 z-10">
        <p className="font-bold text-xl mb-4 text-blue-400 text-center font-iceland circuit-text">🎰 Prize Probabilities 🎰</p>
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
