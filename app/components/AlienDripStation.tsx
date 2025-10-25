"use client";
import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { useAlienPoints } from "../context/AlienPointsEconomy";
import { useCosmicSound } from "../hooks/useCosmicSound";

const GMB_TOKEN_ADDRESS = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";

// Drip tiers based on GMB holdings (daily claim)
const DRIP_TIERS = [
  { minGMB: 1000000, maxGMB: Infinity, points: 5000, name: "LEGENDARY WHALE", color: "#FFD700" },
  { minGMB: 500000, maxGMB: 999999, points: 2500, name: "Epic Holder", color: "#FF6B6B" },
  { minGMB: 100000, maxGMB: 499999, points: 1000, name: "Rare Collector", color: "#9B59B6" },
  { minGMB: 50000, maxGMB: 99999, points: 500, name: "Uncommon Stacker", color: "#3498DB" },
  { minGMB: 10000, maxGMB: 49999, points: 250, name: "Common Holder", color: "#00ff99" },
  { minGMB: 1000, maxGMB: 9999, points: 100, name: "Starter", color: "#95A5A6" },
  { minGMB: 0, maxGMB: 999, points: 50, name: "Beginner", color: "#7F8C8D" },
];

// Staking tiers (continuous rewards per hour)
const STAKING_TIERS = [
  { minGMB: 1000000, maxGMB: Infinity, apPerHour: 100, name: "LEGENDARY WHALE", color: "#FFD700" },
  { minGMB: 500000, maxGMB: 999999, apPerHour: 50, name: "Epic Staker", color: "#FF6B6B" },
  { minGMB: 100000, maxGMB: 499999, apPerHour: 20, name: "Rare Staker", color: "#9B59B6" },
  { minGMB: 50000, maxGMB: 99999, apPerHour: 10, name: "Uncommon Staker", color: "#3498DB" },
  { minGMB: 10000, maxGMB: 49999, apPerHour: 5, name: "Common Staker", color: "#00ff99" },
  { minGMB: 1000, maxGMB: 9999, apPerHour: 2, name: "Starter Staker", color: "#95A5A6" },
  { minGMB: 100, maxGMB: 999, apPerHour: 1, name: "Beginner Staker", color: "#7F8C8D" },
];

interface StakingData {
  isStaking: boolean;
  stakedAmount: number;
  stakeStartTime: number;
  lastClaimTime: number;
}

export default function AlienDripStation() {
  const { address, isConnected } = useAccount();
  const { data: gmbBalance } = useBalance({
    address,
    token: GMB_TOKEN_ADDRESS as `0x${string}`
  });
  const { getUserBalance, addPoints, getPoolRemaining } = useAlienPoints();
  const { playSound } = useCosmicSound();

  // Daily claim states
  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [nextClaimTime, setNextClaimTime] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState("");

  // Staking states
  const [stakingData, setStakingData] = useState<StakingData>({
    isStaking: false,
    stakedAmount: 0,
    stakeStartTime: 0,
    lastClaimTime: 0,
  });
  const [accumulatedRewards, setAccumulatedRewards] = useState(0);
  const [timeStaked, setTimeStaked] = useState("");
  const [claimingStake, setClaimingStake] = useState(false);

  const gmbAmount = parseFloat(gmbBalance?.formatted || "0");

  // Load staking data from localStorage
  useEffect(() => {
    if (!address) return;

    const savedStaking = localStorage.getItem(`staking_${address}`);
    if (savedStaking) {
      const data = JSON.parse(savedStaking) as StakingData;
      setStakingData(data);

      // Check if balance dropped significantly (they sold)
      if (data.isStaking && gmbAmount < data.stakedAmount * 0.95) {
        // Balance dropped more than 5% - they likely sold
        playSound('error');
        alert("⚠️ Your GMB balance dropped! Staking rewards have been paused. Your accumulated rewards are still claimable.");
        setStakingData({
          ...data,
          isStaking: false,
        });
        localStorage.setItem(`staking_${address}`, JSON.stringify({
          ...data,
          isStaking: false,
        }));
      }
    }
  }, [address, gmbAmount]);

  // Calculate staking tier
  const getStakingTier = (amount: number) => {
    for (const tier of STAKING_TIERS) {
      if (amount >= tier.minGMB && amount <= tier.maxGMB) {
        return tier;
      }
    }
    return null;
  };

  const currentStakingTier = getStakingTier(stakingData.isStaking ? stakingData.stakedAmount : gmbAmount);

  // Calculate accumulated rewards in real-time
  useEffect(() => {
    if (!stakingData.isStaking || !currentStakingTier) {
      setAccumulatedRewards(0);
      return;
    }

    const updateRewards = () => {
      const now = Date.now();
      const timeElapsed = now - stakingData.lastClaimTime;
      const hoursElapsed = timeElapsed / (1000 * 60 * 60);
      const rewards = Math.floor(hoursElapsed * currentStakingTier.apPerHour);
      setAccumulatedRewards(rewards);

      // Update time staked display
      const totalTimeStaked = now - stakingData.stakeStartTime;
      const days = Math.floor(totalTimeStaked / (1000 * 60 * 60 * 24));
      const hours = Math.floor((totalTimeStaked % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((totalTimeStaked % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((totalTimeStaked % (1000 * 60)) / 1000);

      setTimeStaked(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateRewards();
    const interval = setInterval(updateRewards, 1000);

    return () => clearInterval(interval);
  }, [stakingData, currentStakingTier]);

  // Start staking
  const handleStartStaking = () => {
    if (!isConnected || !address) {
      playSound('error');
      alert("Please connect your wallet first!");
      return;
    }

    if (gmbAmount < 100) {
      playSound('error');
      alert("You need at least 100 GMB to start staking!");
      return;
    }

    const confirmed = window.confirm(
      `🤝 STAKING AGREEMENT 🤝\n\n` +
      `You are about to stake ${gmbAmount.toFixed(2)} GMB tokens.\n\n` +
      `✅ NO LOCK: You can sell your tokens at any time\n` +
      `⚠️ WARNING: If your balance drops more than 5%, staking rewards will pause\n` +
      `💰 You'll earn ${currentStakingTier?.apPerHour || 0} AP per hour\n` +
      `🎯 Claim rewards anytime to reset the counter\n\n` +
      `Do you agree to these terms?`
    );

    if (!confirmed) {
      playSound('error');
      return;
    }

    const now = Date.now();
    const newStakingData: StakingData = {
      isStaking: true,
      stakedAmount: gmbAmount,
      stakeStartTime: now,
      lastClaimTime: now,
    };

    setStakingData(newStakingData);
    localStorage.setItem(`staking_${address}`, JSON.stringify(newStakingData));
    playSound('success');
    alert(`✅ Staking started! You're now earning ${currentStakingTier?.apPerHour || 0} AP per hour!`);
  };

  // Stop staking
  const handleStopStaking = () => {
    if (!stakingData.isStaking) return;

    const confirmed = window.confirm(
      `⚠️ STOP STAKING? ⚠️\n\n` +
      `You have ${accumulatedRewards} AP accumulated.\n` +
      `Time staked: ${timeStaked}\n\n` +
      `You can claim these rewards before stopping.\n` +
      `Do you want to stop staking?`
    );

    if (!confirmed) {
      playSound('error');
      return;
    }

    setStakingData({
      isStaking: false,
      stakedAmount: 0,
      stakeStartTime: 0,
      lastClaimTime: 0,
    });
    localStorage.removeItem(`staking_${address}`);
    playSound('success');
    alert("Staking stopped! You can still claim your accumulated rewards.");
  };

  // Claim staking rewards
  const handleClaimStakingRewards = async () => {
    if (!isConnected || !address) {
      playSound('error');
      alert("Please connect your wallet first!");
      return;
    }

    if (accumulatedRewards <= 0) {
      playSound('error');
      alert("No rewards to claim yet! Keep staking!");
      return;
    }

    playSound('click');
    setClaimingStake(true);

    setTimeout(async () => {
      const success = await addPoints(address, accumulatedRewards, 'staking');

      if (success) {
        playSound('success');

        // Reset last claim time
        const now = Date.now();
        const newStakingData = {
          ...stakingData,
          lastClaimTime: now,
        };
        setStakingData(newStakingData);
        localStorage.setItem(`staking_${address}`, JSON.stringify(newStakingData));
        setUserPoints(getUserBalance(address));
        setAccumulatedRewards(0);

        alert(`💰 Claimed ${accumulatedRewards} AP from staking! Counter reset!`);
      } else {
        playSound('error');
        alert("Failed to claim rewards. Please try again.");
      }

      setClaimingStake(false);
    }, 1500);
  };

  // Calculate time until 8pm EST (daily reset)
  const calculateTimeUntilReset = () => {
    const now = new Date();
    const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const nextReset = new Date(estTime);
    nextReset.setHours(20, 0, 0, 0);
    if (estTime >= nextReset) {
      nextReset.setDate(nextReset.getDate() + 1);
    }
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
      const estNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const estLastClaim = new Date(lastClaim.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const lastReset = new Date(estNow);
      lastReset.setHours(20, 0, 0, 0);
      if (estNow < lastReset) {
        lastReset.setDate(lastReset.getDate() - 1);
      }

      if (estLastClaim >= lastReset) {
        setHasClaimedToday(true);
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

    setUserPoints(getUserBalance(address));
  }, [address, getUserBalance]);

  // Update countdown every second
  useEffect(() => {
    if (!hasClaimedToday) return;

    const updateTimer = () => {
      setTimeUntilReset(calculateTimeUntilReset());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [hasClaimedToday]);

  const handleClaim = async () => {
    if (!isConnected || !address) {
      playSound('error');
      alert("Please connect your wallet first!");
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

    setTimeout(async () => {
      const success = await addPoints(address, currentTier.points, 'faucet');

      if (success) {
        playSound('success');
        localStorage.setItem(`lastDrip_${address}`, Date.now().toString());
        setHasClaimedToday(true);
        setUserPoints(getUserBalance(address));
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
    <div className="flex flex-col items-center space-y-6 p-8 holographic-panel max-w-6xl relative overflow-visible rounded-3xl">
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <div className="absolute top-0 left-1/4 w-1 h-1 bg-green-400 rounded-full blur-sm animate-drip" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-0 left-1/2 w-1 h-1 bg-green-400 rounded-full blur-sm animate-drip" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute top-0 left-3/4 w-1 h-1 bg-green-400 rounded-full blur-sm animate-drip" style={{animationDelay: '1s'}}></div>

      <h2 className="font-alien font-bold holographic-text tracking-wider flex items-center justify-center space-x-2 drop-shadow-lg relative z-10 alien-glyph-text" style={{fontSize: '4rem'}}>
        <span className="animate-glow">💧 Alien Drip Station 💧</span>
      </h2>

      <div className="text-center text-green-400 relative z-10">
        <p className="text-xl mb-2 font-electro alien-brackets">💧 Daily Claims & Continuous Staking 💧</p>
        <p className="text-sm opacity-75 font-mono alien-code">Hold GMB for daily claims OR stake for continuous rewards!</p>
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
        <div className="w-full space-y-6">
          {/* ==================== STAKING SECTION ==================== */}
          <div className="glass-panel rounded-2xl p-6 bg-purple-500/10">
            <h3 className="text-3xl font-bold text-purple-400 text-center mb-4 holographic-text">
              🔒 GMB STAKING 🔒
            </h3>

            <div className="space-y-4">
              {/* GMB Balance */}
              <div className="glass-panel rounded-xl p-4">
                <p className="text-white text-center mb-2">
                  Your GMB Balance: <span className="font-bold text-2xl">{gmbAmount.toFixed(2)}</span>
                </p>
                {currentStakingTier && (
                  <div className="text-center">
                    <p className="text-sm opacity-75 mb-1">Staking Tier:</p>
                    <p className="text-2xl font-bold tracking-wider" style={{color: currentStakingTier.color}}>
                      {currentStakingTier.name}
                    </p>
                    <p className="text-3xl font-bold text-purple-400 mt-2">
                      ⏱️ {currentStakingTier.apPerHour} AP / Hour
                    </p>
                  </div>
                )}
              </div>

              {/* Staking Status */}
              {stakingData.isStaking ? (
                <>
                  <div className="glass-panel rounded-xl p-4 bg-green-500/10">
                    <p className="text-green-400 font-bold text-center text-xl mb-2">✅ STAKING ACTIVE</p>
                    <p className="text-center text-white">
                      Staked Amount: <span className="font-bold text-2xl text-green-400">{stakingData.stakedAmount.toFixed(2)} GMB</span>
                    </p>
                    <p className="text-center text-purple-400 text-sm mt-2">
                      Time Staked: {timeStaked}
                    </p>
                  </div>

                  {/* Real-time Rewards */}
                  <div className="glass-panel rounded-xl p-6 bg-yellow-500/10">
                    <p className="text-yellow-400 text-center text-lg mb-2">💰 Accumulated Rewards</p>
                    <p className="text-center text-6xl font-bold text-yellow-300 animate-pulse">
                      {accumulatedRewards.toLocaleString()} AP
                    </p>
                    <p className="text-center text-yellow-400 text-sm mt-2">
                      Earning {currentStakingTier?.apPerHour || 0} AP/hour
                    </p>
                  </div>

                  {/* Claim Staking Rewards Button */}
                  <button
                    onClick={handleClaimStakingRewards}
                    onMouseEnter={() => accumulatedRewards > 0 && !claimingStake && playSound('hover')}
                    disabled={accumulatedRewards <= 0 || claimingStake}
                    className={`w-full px-12 py-4 text-2xl font-bold tracking-wider transition-all duration-200 relative overflow-hidden ${
                      accumulatedRewards <= 0 || claimingStake
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed rounded-xl"
                        : "alien-button alien-button-gold alien-button-glow text-black hover:scale-105"
                    }`}
                  >
                    {claimingStake ? "💰 Claiming..." : accumulatedRewards > 0 ? `CLAIM ${accumulatedRewards} AP! 💰` : "Keep Staking! ⏱️"}
                  </button>

                  {/* Stop Staking Button */}
                  <button
                    onClick={handleStopStaking}
                    onMouseEnter={() => playSound('hover')}
                    className="w-full px-8 py-3 text-lg font-bold tracking-wider alien-button alien-button-danger hover:scale-105 transition-all duration-200"
                  >
                    STOP STAKING ⛔
                  </button>
                </>
              ) : (
                <>
                  {/* Start Staking Info */}
                  <div className="glass-panel rounded-xl p-4">
                    <p className="text-center text-purple-400 mb-2">📖 How Staking Works:</p>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      <li>No lock-in period - sell anytime</li>
                      <li>Earn continuous AP based on GMB held</li>
                      <li>Claim rewards anytime (resets counter)</li>
                      <li>If balance drops 5%+, staking pauses</li>
                      <li>Higher GMB = higher rewards per hour</li>
                    </ul>
                  </div>

                  {/* Start Staking Button */}
                  <button
                    onClick={handleStartStaking}
                    onMouseEnter={() => gmbAmount >= 100 && playSound('hover')}
                    disabled={gmbAmount < 100}
                    className={`w-full px-12 py-4 text-2xl font-bold tracking-wider transition-all duration-200 relative overflow-hidden ${
                      gmbAmount < 100
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed rounded-xl"
                        : "alien-button alien-button-purple alien-button-glow text-white hover:scale-105"
                    }`}
                  >
                    {gmbAmount < 100 ? "Need 100+ GMB to Stake" : "START STAKING 🔒"}
                  </button>
                </>
              )}

              {/* Staking Tiers */}
              <div className="glass-panel rounded-xl p-4">
                <p className="text-purple-400 font-bold text-center mb-3 font-iceland text-2xl">💎 Staking Tiers 💎</p>
                <div className="space-y-2 text-sm">
                  {STAKING_TIERS.map((tier, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center p-2 rounded ${
                        currentStakingTier?.name === tier.name ? 'bg-purple-400 bg-opacity-20' : ''
                      }`}
                    >
                      <span style={{color: tier.color}} className="font-bold">{tier.name}</span>
                      <span className="text-gray-400">{tier.minGMB.toLocaleString()} - {tier.maxGMB === Infinity ? '∞' : tier.maxGMB.toLocaleString()} GMB</span>
                      <span className="text-purple-400 font-bold">{tier.apPerHour} AP/hr</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ==================== DAILY CLAIM SECTION ==================== */}
          <div className="glass-panel rounded-2xl p-6 bg-green-500/10">
            <h3 className="text-3xl font-bold text-green-400 text-center mb-4 holographic-text">
              💧 DAILY CLAIM 💧
            </h3>

            <div className="space-y-4">
              {/* GMB Balance & Tier */}
              <div className="glass-panel rounded-xl p-4">
                <p className="text-white text-center mb-2">
                  Your GMB Balance: <span className="font-bold text-2xl">{gmbAmount.toFixed(2)}</span>
                </p>
                {currentTier ? (
                  <div className="text-center">
                    <p className="text-sm opacity-75 mb-1">Daily Claim Tier:</p>
                    <p className="text-2xl font-bold tracking-wider" style={{color: currentTier.color}}>
                      {currentTier.name}
                    </p>
                    <p className="text-3xl font-bold text-green-400 mt-2">
                      💧 {currentTier.points} AP / Day
                    </p>
                  </div>
                ) : (
                  <p className="text-red-400 text-center">⚠️ Unable to determine tier</p>
                )}
              </div>

              {/* User Points Balance */}
              <div className="glass-panel rounded-xl p-4 text-center">
                <p className="text-green-400 text-lg">
                  👽 Your Alien Points: <span className="font-bold text-3xl">{userPoints.toLocaleString()}</span>
                </p>
              </div>

              {/* Claim Status */}
              {hasClaimedToday && nextClaimTime && (
                <div className="glass-panel rounded-xl p-4 text-center">
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
                  {claiming ? "💧 Claiming..." : hasClaimedToday ? "Already Claimed! ✅" : currentTier ? `CLAIM ${currentTier.points} AP! 💧` : "Unable to determine tier"}
                </span>
              </button>

              {/* Daily Tier Chart */}
              <div className="glass-panel rounded-xl p-4">
                <p className="text-green-400 font-bold text-center mb-3 font-iceland text-2xl circuit-text">💎 Daily Claim Tiers 💎</p>
                <div className="space-y-2 text-sm">
                  {DRIP_TIERS.map((tier, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center p-2 rounded ${
                        currentTier?.name === tier.name ? 'bg-green-400 bg-opacity-20' : ''
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
          </div>
        </div>
      ) : (
        <p className="text-yellow-400 text-center">⚠️ Connect your wallet to use the drip station!</p>
      )}
    </div>
  );
}
