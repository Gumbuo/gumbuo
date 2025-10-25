"use client";
import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { useAlienPoints } from "../context/AlienPointsEconomy";
import { useCosmicSound } from "../hooks/useCosmicSound";

const GMB_TOKEN_ADDRESS = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";

// Drip tiers based on GMB holdings
const DRIP_TIERS = [
  { minGMB: 1000000, maxGMB: Infinity, points: 5000, name: "LEGENDARY WHALE", color: "#FFD700" },
  { minGMB: 500000, maxGMB: 999999, points: 2500, name: "Epic Holder", color: "#FF6B6B" },
  { minGMB: 100000, maxGMB: 499999, points: 1000, name: "Rare Collector", color: "#9B59B6" },
  { minGMB: 50000, maxGMB: 99999, points: 500, name: "Uncommon Stacker", color: "#3498DB" },
  { minGMB: 10000, maxGMB: 49999, points: 250, name: "Common Holder", color: "#00ff99" },
  { minGMB: 1000, maxGMB: 9999, points: 100, name: "Starter", color: "#95A5A6" },
  { minGMB: 100, maxGMB: 999, points: 50, name: "Beginner", color: "#7F8C8D" },
];

export default function AlienDripStation() {
  const { address, isConnected } = useAccount();
  const { data: gmbBalance } = useBalance({
    address,
    token: GMB_TOKEN_ADDRESS as `0x${string}`
  });
  const { getUserBalance, addPoints, getPoolRemaining } = useAlienPoints();
  const { playSound } = useCosmicSound();

  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [nextClaimTime, setNextClaimTime] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState("");

  const gmbAmount = parseFloat(gmbBalance?.formatted || "0");

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

  // Get user's drip tier
  const getDripTier = () => {
    for (const tier of DRIP_TIERS) {
      if (gmbAmount >= tier.minGMB && gmbAmount <= tier.maxGMB) {
        return tier;
      }
    }
    return null;
  };

  const currentTier = getDripTier();

  // Check if user has claimed in current 24hr cycle (8pm EST to 8pm EST)
  useEffect(() => {
    if (!address) return;

    const lastClaimTime = localStorage.getItem(`lastDrip_${address}`);

    if (lastClaimTime) {
      const lastClaim = new Date(parseInt(lastClaimTime));
      const now = new Date();

      // Convert to EST
      const estNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const estLastClaim = new Date(lastClaim.toLocaleString("en-US", { timeZone: "America/New_York" }));

      // Find the last 8pm EST reset
      const lastReset = new Date(estNow);
      lastReset.setHours(20, 0, 0, 0);
      if (estNow < lastReset) {
        // If before 8pm today, last reset was yesterday at 8pm
        lastReset.setDate(lastReset.getDate() - 1);
      }

      // Check if last claim was after the most recent 8pm EST reset
      if (estLastClaim >= lastReset) {
        setHasClaimedToday(true);
        // Calculate next reset time (8pm EST today or tomorrow)
        const nextReset = new Date(estNow);
        nextReset.setHours(20, 0, 0, 0);
        if (estNow >= nextReset) {
          nextReset.setDate(nextReset.getDate() + 1);
        }
        setNextClaimTime(nextReset.toLocaleString());
      } else {
        setHasClaimedToday(false);
        setNextClaimTime(null);
      }
    } else {
      setHasClaimedToday(false);
      setNextClaimTime(null);
    }

    // Update user balance
    setUserPoints(getUserBalance(address));
  }, [address, getUserBalance]);

  // Update countdown every second
  useEffect(() => {
    if (!hasClaimedToday) return;

    const updateTimer = () => {
      setTimeUntilReset(calculateTimeUntilReset());
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [hasClaimedToday]);

  const handleClaim = async () => {
    if (!isConnected || !address) {
      playSound('error');
      alert("Please connect your wallet first!");
      return;
    }

    if (gmbAmount < 100) {
      playSound('error');
      alert("You need at least 100 GMB tokens to use the drip station! 🚰");
      return;
    }

    if (hasClaimedToday) {
      playSound('error');
      alert(`You've already claimed today! Come back at ${nextClaimTime} 👽`);
      return;
    }

    if (!currentTier) {
      playSound('error');
      alert("Unable to determine your tier. Please try again.");
      return;
    }

    const poolRemaining = getPoolRemaining('faucet');
    if (poolRemaining < currentTier.points) {
      playSound('error');
      alert("Faucet pool is depleted! 😢 Check back later or try the wheel!");
      return;
    }

    playSound('click');
    setClaiming(true);

    // Simulate claim animation
    setTimeout(async () => {
      const success = await addPoints(address, currentTier.points, 'faucet');

      if (success) {
        playSound('success');

        // Update localStorage
        localStorage.setItem(`lastDrip_${address}`, Date.now().toString());
        setHasClaimedToday(true);
        setUserPoints(getUserBalance(address));

        // Calculate next reset time (8pm EST today or tomorrow)
        const now = new Date();
        const estNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
        const nextReset = new Date(estNow);
        nextReset.setHours(20, 0, 0, 0);
        if (estNow >= nextReset) {
          nextReset.setDate(nextReset.getDate() + 1);
        }
        setNextClaimTime(nextReset.toLocaleString());

        alert(`💧 Drip Successful! You claimed ${currentTier.points} Alien Points! 👽`);
      } else {
        playSound('error');
        alert("Faucet pool is depleted! Please try the drip station!");
      }

      setClaiming(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8 holographic-panel max-w-3xl relative overflow-visible rounded-3xl">
      {/* Corner glow accents */}
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      {/* Dripping particles effect */}
      <div className="absolute top-0 left-1/4 w-1 h-1 bg-green-400 rounded-full blur-sm animate-drip" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-0 left-1/2 w-1 h-1 bg-green-400 rounded-full blur-sm animate-drip" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute top-0 left-3/4 w-1 h-1 bg-green-400 rounded-full blur-sm animate-drip" style={{animationDelay: '1s'}}></div>

      <h2 className="font-alien font-bold holographic-text tracking-wider flex items-center justify-center space-x-2 drop-shadow-lg relative z-10 alien-glyph-text" style={{fontSize: '4rem'}}>
        <span className="animate-glow">💧 Alien Drip Station 💧</span>
      </h2>

      <div className="text-center text-green-400 relative z-10">
        <p className="text-xl mb-2 font-electro alien-brackets">💧 Daily GMB Holder Rewards 💧</p>
        <p className="text-sm opacity-75 font-mono alien-code">Hold GMB tokens to claim daily Alien Points!</p>
      </div>

      {/* Pool Status */}
      <div className="w-full glass-panel rounded-xl p-4 relative overflow-hidden shadow-lg shadow-cyan-400/30 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent animate-shimmer pointer-events-none"></div>
        <p className="text-cyan-400 text-center text-lg drop-shadow-glow relative z-10">
          🌊 Faucet Pool: <span className="font-bold text-xl">{getPoolRemaining('faucet').toLocaleString()}</span> / 100,000,000 AP
        </p>
        <div className="w-full bg-gray-900 rounded-full h-5 border-2 border-gray-700 shadow-inner mt-2 relative overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500 h-full rounded-full transition-all duration-500 shadow-lg shadow-cyan-400/50 relative overflow-hidden"
            style={{width: `${(getPoolRemaining('faucet') / 100_000_000) * 100}%`}}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* User Status */}
      {isConnected && address ? (
        <div className="w-full space-y-4">
          {/* GMB Balance & Tier */}
          <div className="glass-panel rounded-xl p-4 border-2 border-purple-500/50">
            <p className="text-white text-center mb-2">
              Your GMB Balance: <span className="font-bold text-2xl">{gmbAmount.toFixed(2)}</span>
            </p>
            {currentTier ? (
              <div className="text-center">
                <p className="text-sm opacity-75 mb-1">Current Tier:</p>
                <p
                  className="text-2xl font-bold tracking-wider"
                  style={{color: currentTier.color}}
                >
                  {currentTier.name}
                </p>
                <p className="text-3xl font-bold text-green-400 mt-2">
                  💧 {currentTier.points} AP / Day
                </p>
              </div>
            ) : (
              <p className="text-red-400 text-center">⚠️ Need at least 100 GMB to qualify</p>
            )}
          </div>

          {/* User Points Balance */}
          <div className="glass-panel rounded-xl p-4 border-2 border-green-400/50 text-center">
            <p className="text-green-400 text-lg">
              👽 Your Alien Points: <span className="font-bold text-3xl">{userPoints.toLocaleString()}</span>
            </p>
          </div>

          {/* Claim Status */}
          {hasClaimedToday && nextClaimTime && (
            <div className="glass-panel rounded-xl p-4 border-2 border-yellow-500/50 text-center">
              <p className="text-yellow-400 font-bold">✅ Already claimed today!</p>
              <p className="text-yellow-400 text-sm mt-1">Next claim available in:</p>
              <p className="text-xl text-yellow-300 font-bold mt-1">⏰ {timeUntilReset}</p>
            </div>
          )}

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            onMouseEnter={() => !hasClaimedToday && !claiming && currentTier && playSound('hover')}
            disabled={hasClaimedToday || claiming || !currentTier}
            className={`w-full px-12 py-4 text-2xl font-bold tracking-wider transition-all duration-200 relative overflow-hidden ${
              hasClaimedToday || claiming || !currentTier
                ? "bg-gray-600 text-gray-400 cursor-not-allowed rounded-xl"
                : "holographic-button organic-button text-white hover:scale-105 hover:shadow-2xl hover:shadow-purple-400/80 animate-pulse-glow hover-ripple hover-morph"
            }`}
          >
            {!hasClaimedToday && !claiming && currentTier && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            )}
            <span className="relative z-10">
              {claiming ? "💧 Claiming..." : hasClaimedToday ? "Already Claimed! ✅" : currentTier ? `CLAIM ${currentTier.points} AP! 💧` : "Need 100+ GMB"}
            </span>
          </button>
        </div>
      ) : (
        <p className="text-yellow-400 text-center">⚠️ Connect your wallet to use the drip station!</p>
      )}

      {/* Tier Chart */}
      <div className="w-full glass-panel border-2 border-green-400/50 rounded-xl p-4">
        <p className="text-green-400 font-bold text-center mb-3 font-iceland text-2xl circuit-text">💎 Drip Tiers 💎</p>
        <div className="space-y-2 text-sm">
          {DRIP_TIERS.map((tier, idx) => (
            <div
              key={idx}
              className={`flex justify-between items-center p-2 rounded ${
                currentTier?.name === tier.name ? 'bg-green-400 bg-opacity-20 border border-green-400' : ''
              }`}
            >
              <span style={{color: tier.color}} className="font-bold">{tier.name}</span>
              <span className="text-gray-400">{tier.minGMB.toLocaleString()} - {tier.maxGMB === Infinity ? '∞' : tier.maxGMB.toLocaleString()} GMB</span>
              <span className="text-green-400 font-bold">{tier.points} AP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
