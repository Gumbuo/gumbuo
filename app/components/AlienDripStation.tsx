"use client";
import { useState, useEffect, useMemo } from "react";
import { useAccount, useBalance } from "wagmi";
import { useAlienPoints } from "../context/AlienPointsEconomy";
import { useCosmicSound } from "../hooks/useCosmicSound";

type TabType = "staking" | "faucet" | "nft";

const GMB_TOKEN_ADDRESS_BASE = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";
const GMB_TOKEN_ADDRESS_ABSTRACT = "0x1660AA473D936029C7659e7d047F05EcF28D40c9";

// Drip tiers based on GMB holdings (daily claim - 12 hour cooldown)
const DRIP_TIERS = [
  { minGMB: 1000000, maxGMB: Infinity, points: 10000, name: "LEGENDARY WHALE", color: "#FFD700" },
  { minGMB: 500000, maxGMB: 999999, points: 8000, name: "Epic Holder", color: "#FF6B6B" },
  { minGMB: 100000, maxGMB: 499999, points: 6000, name: "Rare Collector", color: "#9B59B6" },
  { minGMB: 50000, maxGMB: 99999, points: 5000, name: "Uncommon Stacker", color: "#3498DB" },
  { minGMB: 10000, maxGMB: 49999, points: 4000, name: "Common Holder", color: "#00ff99" },
  { minGMB: 1000, maxGMB: 9999, points: 3500, name: "Starter", color: "#95A5A6" },
  { minGMB: 0, maxGMB: 999, points: 3000, name: "Beginner", color: "#7F8C8D" },
];

// Staking formula: 10,000 AP per day MAXIMUM (scales up to 1M GMB)
// Example: 100K GMB = 1,000 AP/day = ~41.67 AP/hour
// Example: 1M+ GMB = 10,000 AP/day = ~416.67 AP/hour (CAPPED)
const MAX_STAKING_AP_PER_DAY = 10000;
const MAX_STAKING_AP_PER_HOUR = MAX_STAKING_AP_PER_DAY / 24;

// Calculate AP per hour based on GMB amount (capped at 10,000 AP/day)
const calculateAPPerHour = (gmbAmount: number): number => {
  const millions = gmbAmount / 1_000_000;
  const uncappedAPPerHour = millions * (MAX_STAKING_AP_PER_DAY / 24);
  // Cap at max staking rate (10k AP/day = ~416.67 AP/hour)
  return Math.min(uncappedAPPerHour, MAX_STAKING_AP_PER_HOUR);
};

interface StakingData {
  isStaking: boolean;
  stakedAmount: number;
  stakeStartTime: number;
  lastClaimTime: number;
}

export default function AlienDripStation() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>("staking");

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

  // Load staking data from backend API (only on mount and address change)
  useEffect(() => {
    console.log('📡 Data loading useEffect triggered', { address });

    // Reset staking state when wallet disconnects
    if (!address) {
      console.log('🚫 No address, resetting state');
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
        console.log('📥 Fetching staking data from backend for', address);
        const response = await fetch(`/api/user-data?wallet=${address}`);
        const result = await response.json();

        console.log('📦 Backend response:', result);

        if (result.success && result.userData) {
          const data = result.userData.stakingData || {
            isStaking: false,
            stakedAmount: 0,
            stakeStartTime: 0,
            lastClaimTime: 0,
          };

          console.log('✏️ Setting stakingData to:', data);

          // Calculate how long ago staking started
          if (data.isStaking && data.lastClaimTime > 0) {
            const now = Date.now();
            const timeElapsed = now - data.lastClaimTime;
            const hoursElapsed = timeElapsed / (1000 * 60 * 60);
            const minutesElapsed = timeElapsed / (1000 * 60);
            console.log(`⏰ Last claim was ${minutesElapsed.toFixed(2)} minutes ago (${hoursElapsed.toFixed(2)} hours)`);
            console.log(`📅 Last claim time: ${new Date(data.lastClaimTime).toLocaleString()}`);
          }

          setStakingData(data);
        } else {
          console.log('❌ No user data found in backend response');
        }
      } catch (error) {
        console.error('Failed to load staking data:', error);
      }
    };

    fetchStakingData();
  }, [address]);

  // Separate effect to check for balance drops (only after GMB has loaded from BOTH chains)
  useEffect(() => {
    // Skip if not staking
    if (!stakingData.isStaking) {
      return;
    }

    // Skip if GMB hasn't loaded yet
    if (!gmbAmount || gmbAmount === 0) {
      return;
    }

    // IMPORTANT: Wait for both chain balances to load before checking
    // This prevents false positives when one chain loads faster than the other
    const baseLoaded = gmbBalanceBase !== undefined && gmbBalanceBase !== null;
    const abstractLoaded = gmbBalanceAbstract !== undefined && gmbBalanceAbstract !== null;

    if (!baseLoaded || !abstractLoaded) {
      console.log('⏳ Waiting for both chain balances to load...', { baseLoaded, abstractLoaded });
      return;
    }

    // Add a 2-second delay after page load to ensure balances are stable
    const timeoutId = setTimeout(() => {
      // Check if balance dropped more than 5%
      if (gmbAmount < stakingData.stakedAmount * 0.95) {
        console.log('⚠️ Balance dropped, pausing staking', {
          currentGMB: gmbAmount,
          stakedAmount: stakingData.stakedAmount,
          threshold: stakingData.stakedAmount * 0.95,
          baseBalance: parseFloat(gmbBalanceBase?.formatted || '0'),
          abstractBalance: parseFloat(gmbBalanceAbstract?.formatted || '0')
        });
        playSound('error');
        alert("⚠️ Your GMB balance dropped! Staking rewards have been paused. Your accumulated rewards are still claimable.");

        const pausedData = { ...stakingData, isStaking: false };
        setStakingData(pausedData);

        // Save to backend
        fetch('/api/user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: address, stakingData: pausedData }),
        }).catch(error => console.error('Failed to save paused state:', error));
      }
    }, 2000); // Wait 2 seconds for balances to stabilize

    return () => clearTimeout(timeoutId);
  }, [gmbAmount, stakingData.stakedAmount, gmbBalanceBase, gmbBalanceAbstract]);

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

  // Memoize to prevent unnecessary re-renders of the rewards counter
  const currentStakingRewards = useMemo(() => {
    return getStakingRewards(stakingData.isStaking ? stakingData.stakedAmount : gmbAmount);
  }, [stakingData.isStaking, stakingData.stakedAmount, gmbAmount]);

  // Calculate accumulated rewards in real-time
  useEffect(() => {
    console.log('🔄 Rewards useEffect triggered', {
      isStaking: stakingData.isStaking,
      stakedAmount: stakingData.stakedAmount,
      lastClaimTime: stakingData.lastClaimTime,
      currentStakingRewards
    });

    if (!stakingData.isStaking || !currentStakingRewards) {
      console.log('❌ Not staking or no rewards calculated');
      setAccumulatedRewards(0);
      return;
    }

    const updateRewards = () => {
      const now = Date.now();
      const timeElapsed = now - stakingData.lastClaimTime;
      const hoursElapsed = timeElapsed / (1000 * 60 * 60);
      // Show 2 decimal places for real-time counting, but claim will round down to whole number
      const rewards = parseFloat((hoursElapsed * currentStakingRewards.apPerHour).toFixed(2));

      console.log('💰 Updating rewards:', {
        now,
        lastClaimTime: stakingData.lastClaimTime,
        timeElapsed,
        hoursElapsed,
        apPerHour: currentStakingRewards.apPerHour,
        rewards
      });

      setAccumulatedRewards(rewards);

      // Update time staked display
      const totalTimeStaked = now - stakingData.stakeStartTime;
      const days = Math.floor(totalTimeStaked / (1000 * 60 * 60 * 24));
      const hours = Math.floor((totalTimeStaked % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((totalTimeStaked % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((totalTimeStaked % (1000 * 60)) / 1000);

      setTimeStaked(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    console.log('✅ Starting rewards counter interval');
    updateRewards();
    const interval = setInterval(updateRewards, 1000);

    return () => {
      console.log('🛑 Clearing rewards counter interval');
      clearInterval(interval);
    };
  }, [stakingData.isStaking, stakingData.lastClaimTime, stakingData.stakeStartTime, currentStakingRewards]);

  // Start staking
  const handleStartStaking = async () => {
    console.log('🚀 START STAKING button clicked', { isConnected, address, gmbAmount });

    if (!isConnected || !address) {
      console.log('❌ Not connected or no address');
      playSound('error');
      alert("Please connect your wallet first!");
      return;
    }

    if (gmbAmount < 100) {
      console.log('❌ Insufficient GMB balance:', gmbAmount);
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
      console.log('❌ User cancelled confirmation dialog');
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

    console.log('💾 Attempting to save staking data to backend:', newStakingData);

    // Save to backend API first
    try {
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address, stakingData: newStakingData }),
      });

      console.log('📡 Backend response status:', response.status);

      const result = await response.json();

      console.log('📦 Backend response data:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save staking data');
      }

      console.log('✅ Backend save successful! Updating local state...');

      // Only update local state if save was successful
      setStakingData(newStakingData);

      console.log('✅ Local state updated to:', newStakingData);

      playSound('success');
      alert(`✅ Staking started! You're now earning ${currentStakingRewards?.apPerDay.toFixed(2) || 0} AP per day!`);
    } catch (error) {
      console.error('❌ Failed to save staking data:', error);
      playSound('error');
      alert(`❌ Failed to start staking: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
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
        // Round down to whole number when claiming
        const rewardsToAdd = Math.floor(accumulatedRewards);
        const success = await addPoints(address, rewardsToAdd, 'staking');

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

          // Record claim in history
          await fetch('/api/user-data', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wallet: address,
              type: 'staking',
              amount: rewardsToAdd,
              gmbHoldings: {
                base: parseFloat(gmbBalanceBase?.formatted || '0'),
                abstract: parseFloat(gmbBalanceAbstract?.formatted || '0'),
                arbitrum: 0,
                blast: 0,
                total: gmbAmount,
                lastUpdated: Date.now(),
              },
            }),
          });

          setUserPoints(getUserBalance(address));
          setAccumulatedRewards(0);

          alert(`💰 Claimed ${rewardsToAdd} AP from staking! Counter reset!`);
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

        // Record claim in history
        await fetch('/api/user-data', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: address,
            type: 'faucet',
            amount: currentTier.points,
            gmbHoldings: {
              base: parseFloat(gmbBalanceBase?.formatted || '0'),
              abstract: parseFloat(gmbBalanceAbstract?.formatted || '0'),
              arbitrum: 0,
              blast: 0,
              total: gmbAmount,
              lastUpdated: Date.now(),
            },
          }),
        }).catch(error => console.error('Failed to record claim history:', error));

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
      borderRadius: '8px'
    }} className="flex flex-col items-center space-y-6 p-8 holographic-panel max-w-6xl relative overflow-visible">
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <div className="absolute top-0 left-1/4 w-1 h-1 bg-green-400 rounded-full blur-sm animate-drip" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-0 left-1/2 w-1 h-1 bg-green-400 rounded-full blur-sm animate-drip" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute top-0 left-3/4 w-1 h-1 bg-green-400 rounded-full blur-sm animate-drip" style={{animationDelay: '1s'}}></div>

      {/* Header */}
      <h2 className="font-alien font-bold holographic-text tracking-wider flex items-center justify-center space-x-2 drop-shadow-lg relative z-10 alien-glyph-text" style={{fontSize: '4rem'}}>
        <span className="animate-glow">💧 Alien Drip Station 💧</span>
      </h2>

      {/* Tab Navigation - Horizontal like portal pages */}
      <div className="flex justify-center gap-4 relative z-10 w-full flex-wrap">
        <button
          onClick={() => { setActiveTab("staking"); playSound('click'); }}
          style={{
            padding: '12px 24px',
            background: activeTab === "staking"
              ? 'linear-gradient(135deg, #9B59B6, #8e44ad)'
              : 'rgba(155, 89, 182, 0.1)',
            color: activeTab === "staking" ? '#fff' : '#9B59B6',
            border: `2px solid ${activeTab === "staking" ? '#9B59B6' : '#9B59B644'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 'bold',
            fontSize: '14px',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === "staking"
              ? '0 0 20px rgba(155, 89, 182, 0.5)'
              : 'none',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "staking") {
              e.currentTarget.style.background = 'rgba(155, 89, 182, 0.2)';
              e.currentTarget.style.borderColor = '#9B59B6';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "staking") {
              e.currentTarget.style.background = 'rgba(155, 89, 182, 0.1)';
              e.currentTarget.style.borderColor = '#9B59B644';
            }
          }}
        >
          🔒 STAKING
        </button>
        <button
          onClick={() => { setActiveTab("faucet"); playSound('click'); }}
          style={{
            padding: '12px 24px',
            background: activeTab === "faucet"
              ? 'linear-gradient(135deg, #00ff99, #00cc7a)'
              : 'rgba(0, 255, 153, 0.1)',
            color: activeTab === "faucet" ? '#000' : '#00ff99',
            border: `2px solid ${activeTab === "faucet" ? '#00ff99' : '#00ff9944'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 'bold',
            fontSize: '14px',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === "faucet"
              ? '0 0 20px rgba(0, 255, 153, 0.5)'
              : 'none',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "faucet") {
              e.currentTarget.style.background = 'rgba(0, 255, 153, 0.2)';
              e.currentTarget.style.borderColor = '#00ff99';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "faucet") {
              e.currentTarget.style.background = 'rgba(0, 255, 153, 0.1)';
              e.currentTarget.style.borderColor = '#00ff9944';
            }
          }}
        >
          💧 FAUCET/DRIP
        </button>
        <button
          onClick={() => { setActiveTab("nft"); playSound('click'); }}
          style={{
            padding: '12px 24px',
            background: activeTab === "nft"
              ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)'
              : 'rgba(255, 107, 107, 0.1)',
            color: activeTab === "nft" ? '#fff' : '#ff6b6b',
            border: `2px solid ${activeTab === "nft" ? '#ff6b6b' : '#ff6b6b44'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 'bold',
            fontSize: '14px',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === "nft"
              ? '0 0 20px rgba(255, 107, 107, 0.5)'
              : 'none',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "nft") {
              e.currentTarget.style.background = 'rgba(255, 107, 107, 0.2)';
              e.currentTarget.style.borderColor = '#ff6b6b';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "nft") {
              e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
              e.currentTarget.style.borderColor = '#ff6b6b44';
            }
          }}
        >
          🖼️ NFT STAKING
        </button>
      </div>

      {/* Tab Content */}
      {isConnected && address ? (
        <>
          {/* STAKING TAB */}
          {activeTab === "staking" && (
            <div style={{
              borderRadius: '8px'
            }} className="w-full space-y-6 relative holographic-panel p-6">
              <div className="corner-glow corner-glow-tl"></div>
              <div className="corner-glow corner-glow-tr"></div>
              <div className="corner-glow corner-glow-bl"></div>
              <div className="corner-glow corner-glow-br"></div>
              <div className="flex justify-center gap-4 mb-6 relative z-10 flex-wrap">
            {/* Staking Action Buttons */}
            {stakingData.isStaking ? (
              <>
                <button
                  onClick={handleClaimStakingRewards}
                  disabled={accumulatedRewards <= 0 || claimingStake}
                  style={{
                    padding: '12px 24px',
                    background: accumulatedRewards > 0 && !claimingStake
                      ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                      : 'rgba(128, 128, 128, 0.3)',
                    color: accumulatedRewards > 0 && !claimingStake ? '#000' : '#666',
                    border: `2px solid ${accumulatedRewards > 0 && !claimingStake ? '#FFD700' : '#666'}`,
                    borderRadius: '8px',
                    cursor: accumulatedRewards > 0 && !claimingStake ? 'pointer' : 'not-allowed',
                    fontFamily: 'Orbitron, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease',
                    boxShadow: accumulatedRewards > 0 && !claimingStake
                      ? '0 0 20px rgba(255, 215, 0, 0.5)'
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (accumulatedRewards > 0 && !claimingStake) {
                      playSound('hover');
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {claimingStake ? "💰 Claiming..." : accumulatedRewards > 0 ? `CLAIM ${Math.floor(accumulatedRewards)} AP! 💰` : "CLAIM REWARDS (0 AP)"}
                </button>
                <button
                  onClick={handleStopStaking}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                    color: '#fff',
                    border: '2px solid #ff6b6b',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: 'Orbitron, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 0 20px rgba(255, 107, 107, 0.5)',
                  }}
                  onMouseEnter={(e) => {
                    playSound('hover');
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  STOP STAKING ⛔
                </button>
              </>
            ) : (
              <button
                onClick={handleStartStaking}
                disabled={gmbAmount < 100}
                style={{
                  padding: '12px 24px',
                  background: gmbAmount >= 100
                    ? 'linear-gradient(135deg, #9B59B6, #8e44ad)'
                    : 'rgba(128, 128, 128, 0.3)',
                  color: gmbAmount >= 100 ? '#fff' : '#666',
                  border: `2px solid ${gmbAmount >= 100 ? '#9B59B6' : '#666'}`,
                  borderRadius: '8px',
                  cursor: gmbAmount >= 100 ? 'pointer' : 'not-allowed',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  boxShadow: gmbAmount >= 100
                    ? '0 0 20px rgba(155, 89, 182, 0.5)'
                    : 'none',
                }}
                onMouseEnter={(e) => {
                  if (gmbAmount >= 100) {
                    playSound('hover');
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {gmbAmount < 100 ? "Need 100+ GMB to Stake" : "START STAKING 🔒"}
              </button>
            )}
          </div>

          <div className="text-center text-purple-400 relative z-10 mb-4">
            <p className="text-xl mb-2 font-electro alien-brackets">🔒 No-Lock GMB Staking 🔒</p>
            <p className="text-sm opacity-75 font-mono alien-code">Stake GMB with no lockup period - earn AP continuously!</p>
          </div>

          {/* STAKING CONTENT */}
          <div style={{
            borderRadius: '8px'
          }} className="holographic-panel relative p-6 bg-gradient-to-br from-purple-500/10 via-green-500/10 to-purple-500/10">
            <div className="corner-glow corner-glow-tl"></div>
            <div className="corner-glow corner-glow-tr"></div>
            <div className="corner-glow corner-glow-bl"></div>
            <div className="corner-glow corner-glow-br"></div>
            <h3 className="text-4xl font-bold text-center mb-6 holographic-text relative z-10">
              <span className="text-purple-400">🔒</span> STAKING REWARDS <span className="text-purple-400">🔒</span>
            </h3>

            <div className="space-y-6 relative z-10">
              {/* GMB Balance & Points */}
              <div className="grid grid-cols-2 gap-4">
                <div style={{
                  borderRadius: '8px'
                }} className="holographic-panel relative p-4 text-center">
                  <div className="corner-glow corner-glow-tl"></div>
                  <div className="corner-glow corner-glow-tr"></div>
                  <div className="corner-glow corner-glow-bl"></div>
                  <div className="corner-glow corner-glow-br"></div>
                  <p className="text-gray-400 text-sm mb-1 relative z-10">Your GMB Balance</p>
                  <p className="text-white font-bold text-3xl relative z-10">{gmbAmount.toFixed(2)}</p>
                </div>
                <div style={{
                  borderRadius: '8px'
                }} className="holographic-panel relative p-4 text-center">
                  <div className="corner-glow corner-glow-tl"></div>
                  <div className="corner-glow corner-glow-tr"></div>
                  <div className="corner-glow corner-glow-bl"></div>
                  <div className="corner-glow corner-glow-br"></div>
                  <p className="text-gray-400 text-sm mb-1 relative z-10">Your Alien Points</p>
                  <p className="text-green-400 font-bold text-3xl relative z-10">{userPoints.toLocaleString()}</p>
                </div>
              </div>

              {/* NO-LOCK STAKING */}
              <div className="space-y-4">
                  {stakingData.isStaking ? (
                    <>
                  <div className="glass-panel rounded-xl p-4 bg-green-500/10 border-2 border-green-500/30">
                    <p className="text-green-400 font-bold text-center text-xl mb-2 animate-pulse">✅ NO-LOCK STAKING ACTIVE</p>
                    <p className="text-center text-white">
                      Staked Amount: <span className="font-bold text-2xl text-green-400">{stakingData.stakedAmount.toFixed(2)} GMB</span>
                    </p>
                    <p className="text-center text-purple-400 text-sm mt-2">
                      Time Staked: {timeStaked}
                    </p>
                  </div>

                  {/* Real-time Rewards Counter */}
                  <div style={{
                    borderRadius: '8px'
                  }} className="holographic-panel relative p-6 bg-yellow-500/10 overflow-hidden">
                    <div className="corner-glow corner-glow-tl"></div>
                    <div className="corner-glow corner-glow-tr"></div>
                    <div className="corner-glow corner-glow-bl"></div>
                    <div className="corner-glow corner-glow-br"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0 animate-pulse"></div>
                    <p className="text-yellow-400 text-center text-2xl mb-3 relative z-10 font-bold">💰 REAL-TIME REWARDS COUNTER 💰</p>
                    <p className="text-center text-6xl font-bold text-yellow-300 animate-pulse relative z-10 mb-3" style={{
                      textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.5)'
                    }}>
                      {accumulatedRewards.toFixed(2)} AP
                    </p>
                    <p className="text-center text-yellow-400 text-lg mt-2 relative z-10 font-bold">
                      ⚡ Earning {currentStakingRewards?.apPerDay.toFixed(2) || 0} AP/day
                    </p>
                    <p className="text-center text-yellow-300 text-sm mt-1 relative z-10">
                      ({currentStakingRewards?.apPerHour.toFixed(2) || 0} AP/hr)
                    </p>
                    <p className="text-center text-gray-400 text-xs mt-2 relative z-10 italic">
                      *Displays show decimals, but claims round down to whole AP
                    </p>
                    {/* Debug Info */}
                    <div className="text-xs text-gray-500 mt-3 relative z-10 text-center">
                      <p>Staking: {stakingData.isStaking ? 'YES' : 'NO'} | Staked: {stakingData.stakedAmount} GMB</p>
                      <p>Last Claim: {new Date(stakingData.lastClaimTime).toLocaleTimeString()}</p>
                      <p>Current GMB: {gmbAmount.toFixed(2)} | Rate: {currentStakingRewards?.apPerHour.toFixed(4) || 0} AP/hr</p>
                    </div>
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

              {/* Staking Tiers */}
              <div className="glass-panel rounded-xl p-6">
                <p className="text-center font-bold text-2xl mb-4 holographic-text">💎 STAKING TIERS 💎</p>
                <div className="space-y-3">
                    <p className="text-purple-400 font-bold text-center text-lg">🔒 Staking Rewards by Tier</p>
                    <div className="bg-purple-400 bg-opacity-20 p-3 rounded-lg text-center mb-3">
                      <p className="text-yellow-400 font-bold">Max 10,000 AP/day</p>
                      <p className="text-gray-400 text-xs mt-1">Scales with GMB held (up to 1M+ GMB) • No lock-up period</p>
                    </div>

                    {/* Current Tier Display (if staking) */}
                    {stakingData.isStaking && currentStakingRewards && (
                      <div className="glass-panel rounded-xl p-4 text-center border-2 border-purple-500/30 relative overflow-hidden mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 animate-pulse"></div>
                        <p className="text-sm opacity-75 mb-1 relative z-10">Your Staking Tier:</p>
                        <p className="text-2xl font-bold tracking-wider relative z-10 animate-pulse text-purple-400" style={{
                          textShadow: '0 0 20px rgba(155, 89, 182, 0.8), 0 0 40px rgba(155, 89, 182, 0.5)'
                        }}>
                          {stakingData.stakedAmount >= 1_000_000 ? "🏆 WHALE STAKER" :
                           stakingData.stakedAmount >= 500_000 ? "💎 DIAMOND STAKER" :
                           stakingData.stakedAmount >= 100_000 ? "🔥 ELITE STAKER" :
                           stakingData.stakedAmount >= 50_000 ? "⭐ PRO STAKER" :
                           stakingData.stakedAmount >= 10_000 ? "🌟 ADVANCED STAKER" :
                           "🌱 STARTER STAKER"}
                        </p>
                        <p className="text-2xl font-bold text-purple-400 mt-2 relative z-10">
                          🔒 {currentStakingRewards.apPerDay.toFixed(2)} AP/day
                        </p>
                        <p className="text-sm text-purple-300 mt-1 relative z-10">
                          ({currentStakingRewards.apPerHour.toFixed(2)} AP/hr)
                        </p>
                      </div>
                    )}

                    {/* Tier Breakdown */}
                    <div className="space-y-1 text-xs">
                      <div className={`flex justify-between items-center p-2 rounded ${
                        stakingData.isStaking && stakingData.stakedAmount >= 1_000_000 ? 'bg-purple-400 bg-opacity-20 border border-purple-400' : ''
                      }`}>
                        <span className="text-yellow-400 font-bold">🏆 WHALE STAKER</span>
                        <span className="text-gray-400">1M+ GMB</span>
                        <span className="text-purple-400 font-bold">10,000 AP/day</span>
                      </div>
                      <div className={`flex justify-between items-center p-2 rounded ${
                        stakingData.isStaking && stakingData.stakedAmount >= 500_000 && stakingData.stakedAmount < 1_000_000 ? 'bg-purple-400 bg-opacity-20 border border-purple-400' : ''
                      }`}>
                        <span className="text-cyan-400 font-bold">💎 DIAMOND STAKER</span>
                        <span className="text-gray-400">500K - 1M GMB</span>
                        <span className="text-purple-400 font-bold">5,000 - 10,000 AP/day</span>
                      </div>
                      <div className={`flex justify-between items-center p-2 rounded ${
                        stakingData.isStaking && stakingData.stakedAmount >= 100_000 && stakingData.stakedAmount < 500_000 ? 'bg-purple-400 bg-opacity-20 border border-purple-400' : ''
                      }`}>
                        <span className="text-red-400 font-bold">🔥 ELITE STAKER</span>
                        <span className="text-gray-400">100K - 500K GMB</span>
                        <span className="text-purple-400 font-bold">1,000 - 5,000 AP/day</span>
                      </div>
                      <div className={`flex justify-between items-center p-2 rounded ${
                        stakingData.isStaking && stakingData.stakedAmount >= 50_000 && stakingData.stakedAmount < 100_000 ? 'bg-purple-400 bg-opacity-20 border border-purple-400' : ''
                      }`}>
                        <span className="text-orange-400 font-bold">⭐ PRO STAKER</span>
                        <span className="text-gray-400">50K - 100K GMB</span>
                        <span className="text-purple-400 font-bold">500 - 1,000 AP/day</span>
                      </div>
                      <div className={`flex justify-between items-center p-2 rounded ${
                        stakingData.isStaking && stakingData.stakedAmount >= 10_000 && stakingData.stakedAmount < 50_000 ? 'bg-purple-400 bg-opacity-20 border border-purple-400' : ''
                      }`}>
                        <span className="text-green-400 font-bold">🌟 ADVANCED STAKER</span>
                        <span className="text-gray-400">10K - 50K GMB</span>
                        <span className="text-purple-400 font-bold">100 - 500 AP/day</span>
                      </div>
                      <div className={`flex justify-between items-center p-2 rounded ${
                        stakingData.isStaking && stakingData.stakedAmount >= 100 && stakingData.stakedAmount < 10_000 ? 'bg-purple-400 bg-opacity-20 border border-purple-400' : ''
                      }`}>
                        <span className="text-blue-400 font-bold">🌱 STARTER STAKER</span>
                        <span className="text-gray-400">100 - 10K GMB</span>
                        <span className="text-purple-400 font-bold">1 - 100 AP/day</span>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAUCET/DRIP TAB */}
      {activeTab === "faucet" && (
        <div style={{
          borderRadius: '8px'
        }} className="w-full space-y-6 relative holographic-panel p-6">
          <div className="corner-glow corner-glow-tl"></div>
          <div className="corner-glow corner-glow-tr"></div>
          <div className="corner-glow corner-glow-bl"></div>
          <div className="corner-glow corner-glow-br"></div>
          <div className="flex justify-center gap-4 mb-6 relative z-10 flex-wrap">
            {/* Daily Claim Button */}
            <button
              onClick={handleClaim}
              disabled={hasClaimedToday || claiming || !currentTier}
              style={{
                padding: '12px 24px',
                background: !hasClaimedToday && !claiming && currentTier
                  ? 'linear-gradient(135deg, #00ff99, #00cc7a)'
                  : 'rgba(128, 128, 128, 0.3)',
                color: !hasClaimedToday && !claiming && currentTier ? '#000' : '#666',
                border: `2px solid ${!hasClaimedToday && !claiming && currentTier ? '#00ff99' : '#666'}`,
                borderRadius: '8px',
                cursor: !hasClaimedToday && !claiming && currentTier ? 'pointer' : 'not-allowed',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                fontSize: '14px',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                boxShadow: !hasClaimedToday && !claiming && currentTier
                  ? '0 0 20px rgba(0, 255, 153, 0.5)'
                  : 'none',
              }}
              onMouseEnter={(e) => {
                if (!hasClaimedToday && !claiming && currentTier) {
                  playSound('hover');
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {claiming ? "💧 Claiming..." : hasClaimedToday ? "Already Claimed! ✅" : currentTier ? `CLAIM ${currentTier.points} AP! 💧` : "Unable to determine tier"}
            </button>
          </div>

          <div className="text-center text-green-400 relative z-10 mb-4">
            <p className="text-xl mb-2 font-electro alien-brackets">💧 Daily Faucet Claims 💧</p>
            <p className="text-sm opacity-75 font-mono alien-code">Claim daily rewards based on your GMB holdings!</p>
          </div>

          {/* FAUCET CONTENT */}
          <div style={{
            borderRadius: '8px'
          }} className="holographic-panel relative p-6 bg-gradient-to-br from-green-500/10 via-yellow-500/10 to-green-500/10">
            <div className="corner-glow corner-glow-tl"></div>
            <div className="corner-glow corner-glow-tr"></div>
            <div className="corner-glow corner-glow-bl"></div>
            <div className="corner-glow corner-glow-br"></div>
            <h3 className="text-4xl font-bold text-center mb-6 holographic-text relative z-10">
              <span className="text-green-400">💧</span> DRIP REWARDS <span className="text-green-400">💧</span>
            </h3>

            <div className="space-y-6 relative z-10">
              {/* GMB Balance & Points */}
              <div className="grid grid-cols-2 gap-4">
                <div style={{
                  borderRadius: '8px'
                }} className="holographic-panel relative p-4 text-center">
                  <div className="corner-glow corner-glow-tl"></div>
                  <div className="corner-glow corner-glow-tr"></div>
                  <div className="corner-glow corner-glow-bl"></div>
                  <div className="corner-glow corner-glow-br"></div>
                  <p className="text-gray-400 text-sm mb-1 relative z-10">Your GMB Balance</p>
                  <p className="text-white font-bold text-3xl relative z-10">{gmbAmount.toFixed(2)}</p>
                </div>
                <div style={{
                  borderRadius: '8px'
                }} className="holographic-panel relative p-4 text-center">
                  <div className="corner-glow corner-glow-tl"></div>
                  <div className="corner-glow corner-glow-tr"></div>
                  <div className="corner-glow corner-glow-bl"></div>
                  <div className="corner-glow corner-glow-br"></div>
                  <p className="text-gray-400 text-sm mb-1 relative z-10">Your Alien Points</p>
                  <p className="text-green-400 font-bold text-3xl relative z-10">{userPoints.toLocaleString()}</p>
                </div>
              </div>

              {/* DAILY CLAIM */}
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

              {/* Daily Claim Tiers */}
              <div className="glass-panel rounded-xl p-6">
                <p className="text-center font-bold text-2xl mb-4 holographic-text">💎 DRIP TIERS 💎</p>
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
      )}

      {/* NFT STAKING TAB */}
      {activeTab === "nft" && (
        <div style={{
          borderRadius: '8px'
        }} className="w-full space-y-6 relative holographic-panel p-6">
          <div className="corner-glow corner-glow-tl"></div>
          <div className="corner-glow corner-glow-tr"></div>
          <div className="corner-glow corner-glow-bl"></div>
          <div className="corner-glow corner-glow-br"></div>
          <div className="text-center text-red-400 relative z-10 mb-4">
            <p className="text-xl mb-2 font-electro alien-brackets">🖼️ NFT Staking Coming Soon 🖼️</p>
            <p className="text-sm opacity-75 font-mono alien-code">Stake your NFTs and earn exclusive rewards!</p>
          </div>

          {/* NFT CONTENT */}
          <div style={{
            borderRadius: '8px'
          }} className="holographic-panel relative p-6 bg-gradient-to-br from-red-500/10 via-purple-500/10 to-red-500/10">
            <div className="corner-glow corner-glow-tl"></div>
            <div className="corner-glow corner-glow-tr"></div>
            <div className="corner-glow corner-glow-bl"></div>
            <div className="corner-glow corner-glow-br"></div>
            <h3 className="text-4xl font-bold text-center mb-6 holographic-text relative z-10">
              <span className="text-red-400">🖼️</span> NFT STAKING <span className="text-red-400">🖼️</span>
            </h3>

            <div className="space-y-6 text-center relative z-10">
              <p className="text-2xl text-gray-300">🚧 Under Construction 🚧</p>
              <p className="text-lg text-gray-400">This feature is coming soon! Stay tuned for updates.</p>
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div style={{
                  borderRadius: '8px'
                }} className="holographic-panel relative p-6">
                  <div className="corner-glow corner-glow-tl"></div>
                  <div className="corner-glow corner-glow-tr"></div>
                  <div className="corner-glow corner-glow-bl"></div>
                  <div className="corner-glow corner-glow-br"></div>
                  <p className="text-4xl mb-2 relative z-10">🎨</p>
                  <p className="text-sm text-gray-400 relative z-10">Stake NFTs</p>
                </div>
                <div style={{
                  borderRadius: '8px'
                }} className="holographic-panel relative p-6">
                  <div className="corner-glow corner-glow-tl"></div>
                  <div className="corner-glow corner-glow-tr"></div>
                  <div className="corner-glow corner-glow-bl"></div>
                  <div className="corner-glow corner-glow-br"></div>
                  <p className="text-4xl mb-2 relative z-10">💎</p>
                  <p className="text-sm text-gray-400 relative z-10">Earn Rewards</p>
                </div>
                <div style={{
                  borderRadius: '8px'
                }} className="holographic-panel relative p-6">
                  <div className="corner-glow corner-glow-tl"></div>
                  <div className="corner-glow corner-glow-tr"></div>
                  <div className="corner-glow corner-glow-bl"></div>
                  <div className="corner-glow corner-glow-br"></div>
                  <p className="text-4xl mb-2 relative z-10">🏆</p>
                  <p className="text-sm text-gray-400 relative z-10">Exclusive Benefits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
    ) : (
      <p className="text-yellow-400 text-center relative z-10">⚠️ Connect your wallet to use the drip station!</p>
    )}
    </div>
  );
}
