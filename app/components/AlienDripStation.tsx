"use client";
import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { useAlienPoints } from "../context/AlienPointsEconomy";
import { useCosmicSound } from "../hooks/useCosmicSound";

const GMB_TOKEN_ADDRESS_BASE = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";
const GMB_TOKEN_ADDRESS_ABSTRACT = "0x1660AA473D936029C7659e7d047F05EcF28D40c9";

// Drip tiers based on GMB holdings (daily claim)
const DRIP_TIERS = [
  { minGMB: 1000000, maxGMB: Infinity, points: 50000, name: "LEGENDARY WHALE", color: "#FFD700" },
  { minGMB: 500000, maxGMB: 999999, points: 25000, name: "Epic Holder", color: "#FF6B6B" },
  { minGMB: 100000, maxGMB: 499999, points: 15000, name: "Rare Collector", color: "#9B59B6" },
  { minGMB: 50000, maxGMB: 99999, points: 10000, name: "Uncommon Stacker", color: "#3498DB" },
  { minGMB: 10000, maxGMB: 49999, points: 7500, name: "Common Holder", color: "#00ff99" },
  { minGMB: 1000, maxGMB: 9999, points: 6000, name: "Starter", color: "#95A5A6" },
  { minGMB: 0, maxGMB: 999, points: 5000, name: "Beginner", color: "#7F8C8D" },
];

// Staking formula: 100 AP per day for every 1M GMB held
// Example: 5M GMB = 500 AP/day = ~20.83 AP/hour
const AP_PER_DAY_PER_MILLION = 100;
const AP_PER_HOUR_PER_MILLION = AP_PER_DAY_PER_MILLION / 24;

// Calculate AP per hour based on GMB amount
const calculateAPPerHour = (gmbAmount: number): number => {
  const millions = gmbAmount / 1_000_000;
  return millions * AP_PER_HOUR_PER_MILLION;
};

interface StakingData {
  isStaking: boolean;
  stakedAmount: number;
  stakeStartTime: number;
  lastClaimTime: number;
}

export default function AlienDripStation() {
  const { address, isConnected } = useAccount();

  // Fetch GMB from Base chain
  const { data: gmbBalanceBase } = useBalance({
    address,
    chainId: 8453, // Base chain ID
    token: GMB_TOKEN_ADDRESS_BASE as `0x${string}`
  });

  // Fetch GMB from Abstract chain
  const { data: gmbBalanceAbstract } = useBalance({
    address,
    chainId: 2741, // Abstract chain ID
    token: GMB_TOKEN_ADDRESS_ABSTRACT as `0x${string}`
  });

  // Calculate total GMB across both chains
  const gmbBalance = {
    ...gmbBalanceBase,
    formatted: ((parseFloat(gmbBalanceBase?.formatted || '0') + parseFloat(gmbBalanceAbstract?.formatted || '0'))).toString(),
    value: (BigInt(gmbBalanceBase?.value || 0) + BigInt(gmbBalanceAbstract?.value || 0))
  };
  const { getUserBalance, addPoints } = useAlienPoints();
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

  // Load staking data from backend API
  useEffect(() => {
    // Reset staking state when wallet disconnects
    if (!address) {
      setStakingData({
        isStaking: false,
        stakedAmount: 0,
        stakeStartTime: 0,
        lastClaimTime: 0,
      });
      setAccumulatedRewards(0);
      setTimeStaked("");
      return;
    }

    const fetchStakingData = async () => {
      try {
        const response = await fetch(`/api/user-data?wallet=${address}`);
        const result = await response.json();

        if (result.success && result.userData) {
          const data = result.userData.stakingData || {
            isStaking: false,
            stakedAmount: 0,
            stakeStartTime: 0,
            lastClaimTime: 0,
          };
          setStakingData(data);

          // Only check balance drop if GMB amount has actually loaded (> 0)
          if (data.isStaking && gmbAmount > 0 && gmbAmount < data.stakedAmount * 0.95) {
            // Balance dropped more than 5% - pause staking
            playSound('error');
            alert("⚠️ Your GMB balance dropped! Staking rewards have been paused. Your accumulated rewards are still claimable.");
            const pausedData = { ...data, isStaking: false };
            setStakingData(pausedData);

            // Save to backend
            await fetch('/api/user-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ wallet: address, stakingData: pausedData }),
            });
          }
        }
      } catch (error) {
        console.error('Failed to load staking data:', error);
      }
    };

    fetchStakingData();
  }, [address, gmbAmount]);

  // Calculate staking rewards dynamically based on GMB amount
  const getStakingRewards = (amount: number) => {
    if (amount < 100) return null; // Minimum 100 GMB to stake

    const apPerHour = calculateAPPerHour(amount);
    const apPerDay = apPerHour * 24;
    const millions = amount / 1_000_000;

    return {
      apPerHour,
      apPerDay,
      millions,
      amount
    };
  };

  const currentStakingRewards = getStakingRewards(stakingData.isStaking ? stakingData.stakedAmount : gmbAmount);

  // Calculate accumulated rewards in real-time
  useEffect(() => {
    if (!stakingData.isStaking || !currentStakingRewards) {
      setAccumulatedRewards(0);
      return;
    }

    const updateRewards = () => {
      const now = Date.now();
      const timeElapsed = now - stakingData.lastClaimTime;
      const hoursElapsed = timeElapsed / (1000 * 60 * 60);
      const rewards = Math.floor(hoursElapsed * currentStakingRewards.apPerHour);
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
  }, [stakingData, currentStakingRewards]);

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
      `💰 You'll earn ${currentStakingRewards?.apPerDay.toFixed(2) || 0} AP per day (${currentStakingRewards?.apPerHour.toFixed(2) || 0} AP/hr)\n` +
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

    // Save to backend API
    fetch('/api/user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: address, stakingData: newStakingData }),
    }).catch(error => console.error('Failed to save staking data:', error));

    playSound('success');
    alert(`✅ Staking started! You're now earning ${currentStakingRewards?.apPerDay.toFixed(2) || 0} AP per day!`);
  };

  // Stop staking
  const handleStopStaking = async () => {
    if (!address) {
      playSound('error');
      alert("Please connect your wallet first!");
      return;
    }

    // SECURITY: Verify staking data from backend
    if (!stakingData.isStaking) {
      playSound('error');
      alert("⚠️ No active staking found for this wallet!");
      setStakingData({
        isStaking: false,
        stakedAmount: 0,
        stakeStartTime: 0,
        lastClaimTime: 0,
      });
      return;
    }

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

    const emptyStakingData = {
      isStaking: false,
      stakedAmount: 0,
      stakeStartTime: 0,
      lastClaimTime: 0,
    };

    setStakingData(emptyStakingData);

    // Save to backend API
    await fetch('/api/user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: address, stakingData: emptyStakingData }),
    }).catch(error => console.error('Failed to save staking data:', error));

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

    // SECURITY: Verify staking data from backend
    try {
      const response = await fetch(`/api/user-data?wallet=${address}`);
      const result = await response.json();

      if (!result.success || !result.userData || !result.userData.stakingData?.isStaking) {
        playSound('error');
        alert("⚠️ No active staking found for this wallet!");
        setStakingData({
          isStaking: false,
          stakedAmount: 0,
          stakeStartTime: 0,
          lastClaimTime: 0,
        });
        setAccumulatedRewards(0);
        return;
      }

      // Use backend data for validation
      const backendStakingData = result.userData.stakingData;

      // Validate lastClaimTime is not 0 (prevents exploit)
      if (backendStakingData.lastClaimTime === 0 || backendStakingData.stakeStartTime === 0) {
        playSound('error');
        alert("⚠️ Invalid staking data detected!");
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

          // Save to backend API
          await fetch('/api/user-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet: address, stakingData: newStakingData }),
          });

          setUserPoints(getUserBalance(address));
          setAccumulatedRewards(0);

          alert(`💰 Claimed ${accumulatedRewards} AP from staking! Counter reset!`);
        } else {
          playSound('error');
          alert("Failed to claim rewards. Please try again.");
        }

        setClaimingStake(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to verify staking data:', error);
      playSound('error');
      alert("Failed to verify staking data. Please try again.");
      setClaimingStake(false);
    }
  };

  // Calculate time until next claim (12 hour cooldown)
  const calculateTimeUntilReset = () => {
    if (!nextClaimTime) return "";
    const now = new Date();
    const nextClaim = new Date(nextClaimTime);
    const diff = nextClaim.getTime() - now.getTime();
    if (diff <= 0) return "Ready to claim!";
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

  // Check if user can claim (12 hour cooldown)
  useEffect(() => {
    if (!address) return;

    const fetchDripData = async () => {
      try {
        const response = await fetch(`/api/user-data?wallet=${address}`);
        const result = await response.json();

        const lastClaimTime = result.success && result.userData ? result.userData.lastDripClaim : 0;

        if (lastClaimTime && lastClaimTime > 0) {
          const lastClaim = new Date(lastClaimTime);
          const now = new Date();
          const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);

          // 12 hour cooldown
          if (hoursSinceLastClaim < 12) {
            setHasClaimedToday(true);
            const nextClaim = new Date(lastClaim.getTime() + (12 * 60 * 60 * 1000)); // 12 hours from last claim
            setNextClaimTime(nextClaim.toISOString());
          } else {
            setHasClaimedToday(false);
            setNextClaimTime(null);
          }
        } else {
          setHasClaimedToday(false);
          setNextClaimTime(null);
        }

        setUserPoints(getUserBalance(address));
      } catch (error) {
        console.error('Failed to load drip claim data:', error);
      }
    };

    fetchDripData();
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

    playSound('click');
    setClaiming(true);

    setTimeout(async () => {
      const success = await addPoints(address, currentTier.points, 'faucet');

      if (success) {
        playSound('success');

        // Save claim time to backend API
        await fetch('/api/user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: address, lastDripClaim: Date.now() }),
        }).catch(error => console.error('Failed to save drip claim:', error));

        setHasClaimedToday(true);
        setUserPoints(getUserBalance(address));
        const now = new Date();
        const nextClaim = new Date(now.getTime() + (12 * 60 * 60 * 1000)); // 12 hours from now
        setNextClaimTime(nextClaim.toISOString());
        alert(`💧 Drip Successful! You claimed ${currentTier.points} Alien Points! Come back in 12 hours! 👽`);
      } else {
        playSound('error');
        alert("Faucet pool is depleted! Please try the drip station!");
      }

      setClaiming(false);
    }, 1500);
  };

  return (
    <div style={{
      borderRadius: '8px',
      border: '2px solid #00ff9944'
    }} className="flex flex-col items-center space-y-6 p-8 holographic-panel max-w-6xl relative overflow-visible">
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <div className="absolute top-0 left-1/4 w-1 h-1 bg-green-400 rounded-full blur-sm animate-drip" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-0 left-1/2 w-1 h-1 bg-green-400 rounded-full blur-sm animate-drip" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute top-0 left-3/4 w-1 h-1 bg-green-400 rounded-full blur-sm animate-drip" style={{animationDelay: '1s'}}></div>

      {/* Header Section - Buttons replace text when connected */}
      {isConnected && address ? (
        <>
          <div className="flex justify-center gap-6 mb-2 relative z-10">
            {/* Staking Action Button */}
            {stakingData.isStaking ? (
              <div className="flex gap-4">
                <button
                  onClick={handleClaimStakingRewards}
                  onMouseEnter={() => accumulatedRewards > 0 && !claimingStake && playSound('hover')}
                  disabled={accumulatedRewards <= 0 || claimingStake}
                  className={`px-10 py-5 text-2xl font-bold tracking-wider transition-all duration-300 relative overflow-hidden transform hover:scale-110 shadow-2xl ${
                    accumulatedRewards <= 0 || claimingStake
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed rounded-xl"
                      : "alien-button alien-button-gold alien-button-glow text-black animate-pulse"
                  }`}
                  style={{
                    boxShadow: accumulatedRewards > 0 ? '0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.4)' : undefined
                  }}
                >
                  {claimingStake ? "💰 Claiming..." : accumulatedRewards > 0 ? `CLAIM ${accumulatedRewards} AP! 💰` : "Keep Staking! ⏱️"}
                </button>
                <button
                  onClick={handleStopStaking}
                  onMouseEnter={() => playSound('hover')}
                  className="px-8 py-5 text-xl font-bold tracking-wider alien-button alien-button-danger hover:scale-110 transition-all duration-300 shadow-xl"
                >
                  STOP STAKING ⛔
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartStaking}
                onMouseEnter={() => gmbAmount >= 100 && playSound('hover')}
                disabled={gmbAmount < 100}
                className={`px-12 py-5 text-2xl font-bold tracking-wider transition-all duration-300 relative overflow-hidden transform hover:scale-110 shadow-2xl ${
                  gmbAmount < 100
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed rounded-xl"
                    : "alien-button alien-button-purple alien-button-glow text-white"
                }`}
                style={{
                  boxShadow: gmbAmount >= 100 ? '0 0 30px rgba(138, 43, 226, 0.6), 0 0 60px rgba(138, 43, 226, 0.4)' : undefined
                }}
              >
                {gmbAmount < 100 ? "Need 100+ GMB to Stake" : "START STAKING 🔒"}
              </button>
            )}

            {/* Daily Claim Button */}
            <button
              onClick={handleClaim}
              onMouseEnter={() => !hasClaimedToday && !claiming && currentTier && playSound('hover')}
              disabled={hasClaimedToday || claiming || !currentTier}
              className={`px-12 py-5 text-2xl font-bold tracking-wider transition-all duration-300 relative overflow-hidden transform hover:scale-110 shadow-2xl ${
                hasClaimedToday || claiming || !currentTier
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed rounded-xl"
                  : "alien-button alien-button-gold alien-button-glow text-black"
              }`}
              style={{
                boxShadow: !hasClaimedToday && currentTier ? '0 0 30px rgba(0, 255, 153, 0.6), 0 0 60px rgba(0, 255, 153, 0.4)' : undefined
              }}
            >
              {claiming ? "💧 Claiming..." : hasClaimedToday ? "Already Claimed! ✅" : currentTier ? `CLAIM ${currentTier.points} AP! 💧` : "Unable to determine tier"}
            </button>
          </div>
          <div className="text-center text-green-400 relative z-10">
            <p className="text-xl mb-2 font-electro alien-brackets">💧 Daily Claims & Continuous Staking 💧</p>
            <p className="text-sm opacity-75 font-mono alien-code">Hold GMB for daily claims OR stake for continuous rewards!</p>
          </div>
        </>
      ) : (
        <>
          <h2 className="font-alien font-bold holographic-text tracking-wider flex items-center justify-center space-x-2 drop-shadow-lg relative z-10 alien-glyph-text" style={{fontSize: '4rem'}}>
            <span className="animate-glow">💧 Alien Drip Station 💧</span>
          </h2>
          <div className="text-center text-green-400 relative z-10 mb-6">
            <p className="text-xl mb-2 font-electro alien-brackets">💧 Daily Claims & Continuous Staking 💧</p>
            <p className="text-sm opacity-75 font-mono alien-code">Hold GMB for daily claims OR stake for continuous rewards!</p>
          </div>
        </>
      )}

      {/* User Status */}
      {isConnected && address ? (
        <div className="w-full space-y-6">
          {/* ==================== UNIFIED REWARDS SECTION ==================== */}
          <div className="glass-panel rounded-2xl p-6 bg-gradient-to-br from-purple-500/10 via-green-500/10 to-purple-500/10">
            <h3 className="text-4xl font-bold text-center mb-6 holographic-text">
              <span className="text-purple-400">🔒</span> GMB REWARDS <span className="text-green-400">💧</span>
            </h3>

            <div className="space-y-6">
              {/* Shared: GMB Balance & Points */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm mb-1">Your GMB Balance</p>
                  <p className="text-white font-bold text-3xl">{gmbAmount.toFixed(2)}</p>
                </div>
                <div className="glass-panel rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-sm mb-1">Your Alien Points</p>
                  <p className="text-green-400 font-bold text-3xl">{userPoints.toLocaleString()}</p>
                </div>
              </div>

              {/* Two Column Layout: Staking & Daily Claim */}
              <div className="grid grid-cols-2 gap-6">
                {/* LEFT: CONTINUOUS STAKING */}
                <div className="space-y-4">
                  {stakingData.isStaking ? (
                    <>
                  <div className="glass-panel rounded-xl p-4 bg-green-500/10 border-2 border-green-500/30">
                    <p className="text-green-400 font-bold text-center text-xl mb-2 animate-pulse">✅ STAKING ACTIVE</p>
                    <p className="text-center text-white">
                      Staked Amount: <span className="font-bold text-2xl text-green-400">{stakingData.stakedAmount.toFixed(2)} GMB</span>
                    </p>
                    <p className="text-center text-purple-400 text-sm mt-2">
                      Time Staked: {timeStaked}
                    </p>
                  </div>

                  {/* Real-time Rewards */}
                  <div className="glass-panel rounded-xl p-6 bg-yellow-500/10 border-2 border-yellow-500/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0 animate-pulse"></div>
                    <p className="text-yellow-400 text-center text-lg mb-2 relative z-10">💰 Accumulated Rewards</p>
                    <p className="text-center text-6xl font-bold text-yellow-300 animate-pulse relative z-10" style={{
                      textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.5)'
                    }}>
                      {accumulatedRewards.toLocaleString()} AP
                    </p>
                    <p className="text-center text-yellow-400 text-sm mt-2 relative z-10">
                      Earning {currentStakingRewards?.apPerDay.toFixed(2) || 0} AP/day ({currentStakingRewards?.apPerHour.toFixed(2) || 0} AP/hr)
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Start Staking Info */}
                  <div className="glass-panel rounded-xl p-4 border-2 border-purple-500/30">
                    <p className="text-center text-purple-400 mb-2 font-bold">📖 How Staking Works:</p>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      <li>No lock-in period - sell anytime</li>
                      <li>Earn continuous AP based on GMB held</li>
                      <li>Claim rewards anytime (resets counter)</li>
                      <li>If balance drops 5%+, staking pauses</li>
                      <li>Higher GMB = higher rewards per hour</li>
                    </ul>
                  </div>
                </>
              )}
                </div>

                {/* RIGHT: DAILY CLAIM */}
                <div className="space-y-4">
                  {/* Current Tier Display */}
                  {currentTier ? (
                    <div className="glass-panel rounded-xl p-4 text-center border-2 border-green-500/30 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/20 to-green-500/0 animate-pulse"></div>
                      <p className="text-sm opacity-75 mb-1 relative z-10">Your Tier:</p>
                      <p className="text-2xl font-bold tracking-wider relative z-10 animate-pulse" style={{
                        color: currentTier.color,
                        textShadow: `0 0 20px ${currentTier.color}, 0 0 40px ${currentTier.color}`
                      }}>
                        {currentTier.name}
                      </p>
                      <p className="text-2xl font-bold text-green-400 mt-2 relative z-10">
                        💧 {currentTier.points} AP / Day
                      </p>
                    </div>
                  ) : (
                    <p className="text-red-400 text-center">⚠️ Unable to determine tier</p>
                  )}

                  {/* Claim Status */}
                  {hasClaimedToday && nextClaimTime && (
                    <div className="glass-panel rounded-xl p-4 text-center border-2 border-yellow-500/30">
                      <p className="text-yellow-400 font-bold text-sm">✅ Already claimed today!</p>
                      <p className="text-yellow-400 text-xs mt-1">Next claim in:</p>
                      <p className="text-lg text-yellow-300 font-bold mt-1 animate-pulse">⏰ {timeUntilReset}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Combined Rewards Info Section */}
              <div className="glass-panel rounded-xl p-6">
                <p className="text-center font-bold text-2xl mb-4 holographic-text">💎 REWARDS INFO 💎</p>

                <div className="grid grid-cols-2 gap-6">
                  {/* Staking Formula */}
                  <div className="space-y-3">
                    <p className="text-purple-400 font-bold text-center text-lg">🔒 Staking Formula</p>
                    <div className="bg-purple-400 bg-opacity-20 p-3 rounded-lg text-center">
                      <p className="text-yellow-400 font-bold">100 AP/day per 1M GMB</p>
                      <p className="text-gray-400 text-xs mt-1">Scales with holdings</p>
                    </div>
                    <div className="space-y-1 text-xs text-gray-300 text-center">
                      <p>📊 1M GMB = 100 AP/day</p>
                      <p>📊 5M GMB = 500 AP/day</p>
                      <p>📊 10M GMB = 1,000 AP/day</p>
                    </div>
                    {currentStakingRewards && (
                      <div className="bg-green-400 bg-opacity-20 p-2 rounded-lg border border-green-400 text-center">
                        <p className="text-green-400 font-bold text-xs">Your Rate:</p>
                        <p className="text-white text-lg font-bold">{currentStakingRewards.apPerDay.toFixed(2)} AP/day</p>
                      </div>
                    )}
                  </div>

                  {/* Daily Claim Tiers */}
                  <div className="space-y-3">
                    <p className="text-green-400 font-bold text-center text-lg">💧 Daily Claim Tiers</p>
                    <div className="space-y-1 text-xs">
                      {DRIP_TIERS.map((tier, idx) => (
                        <div
                          key={idx}
                          className={`flex justify-between items-center p-1.5 rounded ${
                            currentTier?.name === tier.name ? 'bg-green-400 bg-opacity-20' : ''
                          }`}
                        >
                          <span style={{color: tier.color}} className="font-bold text-xs">{tier.name}</span>
                          <span className="text-gray-400 text-xs">{tier.minGMB >= 1000 ? `${(tier.minGMB/1000).toFixed(0)}K` : tier.minGMB} - {tier.maxGMB === Infinity ? '∞' : tier.maxGMB >= 1000 ? `${(tier.maxGMB/1000).toFixed(0)}K` : tier.maxGMB}</span>
                          <span className="text-green-400 font-bold text-xs">{tier.points} AP</span>
                        </div>
                      ))}
                    </div>
                  </div>
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
