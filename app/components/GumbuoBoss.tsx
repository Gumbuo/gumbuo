"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAlienPoints } from "../context/AlienPointsEconomy";
import { useCosmicSound } from "../hooks/useCosmicSound";

const BOSS_MAX_HP = 1_000_000;
const MIN_DAMAGE = 1_000;
const MAX_DAMAGE = 10_000;
const ATTACK_COOLDOWN = 5000; // 5 seconds
const REWARD_POOL_SIZE = 5_000_000; // Alien Points in pool
const BOSS_RESPAWN_TIME = 3600000; // 1 hour in milliseconds

// Attack Level System
const MAX_ATTACK_LEVEL = 5;
const UPGRADE_COSTS = {
  normal: [100, 100, 100, 100], // Costs to upgrade from level 1->2, 2->3, 3->4, 4->5
  power: [100, 100, 100, 100],
  ultimate: [100, 100, 100, 100],
};
const ATTACK_ENTRY_FEES = {
  normal: [100, 200, 300, 400, 500], // Entry fee per level (1-5)
  power: [500, 1_000, 1_500, 2_000, 2_500],
  ultimate: [1_000, 2_000, 3_000, 4_000, 5_000],
};

interface BossState {
  currentHP: number;
  maxHP: number;
  defeatedAt: number | null;
  totalDamageDealt: Record<string, number>; // wallet -> damage
  isAlive: boolean;
}

interface AttackResult {
  damage: number;
  isCritical: boolean;
  attackType?: 'normal' | 'power' | 'ultimate';
}

interface RecentAttacker {
  address: string;
  damage: number;
  timestamp: number;
  attackType: 'normal' | 'power' | 'ultimate';
}

interface AttackLevels {
  normal: number;
  power: number;
  ultimate: number;
}

export default function GumbuoBoss() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { getUserBalance, addPoints } = useAlienPoints();
  const { playSound } = useCosmicSound();

  const [bossState, setBossState] = useState<BossState>({
    currentHP: BOSS_MAX_HP,
    maxHP: BOSS_MAX_HP,
    defeatedAt: null,
    totalDamageDealt: {},
    isAlive: true,
  });

  const [lastAttackTime, setLastAttackTime] = useState<number>(0);
  const [isAttacking, setIsAttacking] = useState(false);
  const [lastDamage, setLastDamage] = useState<AttackResult | null>(null);
  const [canAttack, setCanAttack] = useState(true);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [userTotalDamage, setUserTotalDamage] = useState(0);
  const [hasClaimedReward, setHasClaimedReward] = useState(false);
  const [timeUntilRespawn, setTimeUntilRespawn] = useState("");
  const [recentAttackers, setRecentAttackers] = useState<RecentAttacker[]>([]);
  const [selectedAttack, setSelectedAttack] = useState<'normal' | 'power' | 'ultimate'>('normal');
  const [powerCooldown, setPowerCooldown] = useState(0);
  const [ultimateCooldown, setUltimateCooldown] = useState(0);
  const [bossShaking, setBossShaking] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Array<{address: string, damage: number, reward: number}>>([]);
  const [attackLevels, setAttackLevels] = useState<AttackLevels>({ normal: 1, power: 1, ultimate: 1 });

  // Load boss state from API on mount with polling
  useEffect(() => {
    const fetchBossState = async () => {
      try {
        const response = await fetch('/api/boss');
        const data = await response.json();
        if (data.success) {
          setBossState(data.bossState);
          setRecentAttackers(data.recentAttackers || []);

          // Check if boss respawned - clear user's claimed status
          if (data.bossState.isAlive && hasClaimedReward) {
            if (address) {
              // Reset reward claimed status in backend API
              fetch('/api/user-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet: address, bossRewardClaimed: false }),
              }).catch(error => console.error('Failed to reset reward claimed status:', error));

              setHasClaimedReward(false);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch boss state:', error);
      }
    };

    fetchBossState();

    // Poll for updates every 3 seconds
    const pollInterval = setInterval(fetchBossState, 3000);

    return () => clearInterval(pollInterval);
  }, [address, hasClaimedReward]);

  // Load user data from backend API (attack levels, reward claimed, cooldowns)
  useEffect(() => {
    if (!address) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user-data?wallet=${address}`);
        const data = await response.json();
        if (data.success && data.userData) {
          setAttackLevels(data.userData.attackLevels || { normal: 1, power: 1, ultimate: 1 });
          setHasClaimedReward(data.userData.bossRewardClaimed || false);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    fetchUserData();
  }, [address, bossState.isAlive]);

  // Update user's total damage
  useEffect(() => {
    if (!address) return;
    setUserTotalDamage(bossState.totalDamageDealt[address] || 0);
  }, [address, bossState.totalDamageDealt]);

  // Update cooldown timer
  useEffect(() => {
    const updateCooldown = () => {
      const now = Date.now();
      const timeSinceAttack = now - lastAttackTime;
      const remaining = Math.max(0, ATTACK_COOLDOWN - timeSinceAttack);

      setCooldownRemaining(remaining);
      setCanAttack(remaining === 0);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 100);
    return () => clearInterval(interval);
  }, [lastAttackTime]);

  // Update respawn timer for defeated boss (display only - API handles respawn)
  useEffect(() => {
    if (!bossState.isAlive && bossState.defeatedAt) {
      const updateRespawnTimer = () => {
        const now = Date.now();
        const timeSinceDefeat = now - bossState.defeatedAt!;
        const timeRemaining = Math.max(0, BOSS_RESPAWN_TIME - timeSinceDefeat);

        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        setTimeUntilRespawn(`${hours}h ${minutes}m ${seconds}s`);
      };

      updateRespawnTimer();
      const interval = setInterval(updateRespawnTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [bossState.isAlive, bossState.defeatedAt]);

  // Update leaderboard with reward calculations
  useEffect(() => {
    const totalDamageAllUsers = Object.values(bossState.totalDamageDealt).reduce((a, b) => a + b, 0);

    const sorted = Object.entries(bossState.totalDamageDealt)
      .map(([address, damage]) => {
        const damagePercentage = totalDamageAllUsers > 0 ? damage / totalDamageAllUsers : 0;
        const reward = Math.floor(REWARD_POOL_SIZE * damagePercentage);
        return { address, damage, reward };
      })
      .sort((a, b) => b.damage - a.damage)
      .slice(0, 10);
    setLeaderboard(sorted);
  }, [bossState.totalDamageDealt]);

  // Update power/ultimate cooldowns (from backend API)
  useEffect(() => {
    if (!address) return;

    const updateSpecialCooldowns = async () => {
      try {
        const response = await fetch(`/api/user-data?wallet=${address}`);
        const data = await response.json();
        if (data.success && data.userData && data.userData.bossCooldowns) {
          const { powerAttackTime, ultimateAttackTime } = data.userData.bossCooldowns;

          if (powerAttackTime) {
            const remaining = Math.max(0, 30000 - (Date.now() - powerAttackTime));
            setPowerCooldown(remaining);
          }

          if (ultimateAttackTime) {
            const remaining = Math.max(0, 60000 - (Date.now() - ultimateAttackTime));
            setUltimateCooldown(remaining);
          }
        }
      } catch (error) {
        console.error('Failed to load cooldowns:', error);
      }
    };

    updateSpecialCooldowns();
    const interval = setInterval(updateSpecialCooldowns, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [address]);


  const calculateDamage = (attackType: 'normal' | 'power' | 'ultimate'): AttackResult => {
    let baseDamage = Math.floor(Math.random() * (MAX_DAMAGE - MIN_DAMAGE + 1)) + MIN_DAMAGE;

    // Apply attack type multiplier with level bonus
    const level = attackLevels[attackType];

    if (attackType === 'normal') {
      // Normal: 1x + 0.1x per level above 1
      const multiplier = 1 + ((level - 1) * 0.1);
      baseDamage = Math.floor(baseDamage * multiplier);
    } else if (attackType === 'power') {
      // Power: 1.5x + 0.15x per level above 1
      const multiplier = 1.5 + ((level - 1) * 0.15);
      baseDamage = Math.floor(baseDamage * multiplier);
    } else if (attackType === 'ultimate') {
      // Ultimate: 3x + 0.2x per level above 1
      const multiplier = 3 + ((level - 1) * 0.2);
      baseDamage = Math.floor(baseDamage * multiplier);
    }

    // 10% chance for critical hit (2x damage)
    const isCritical = Math.random() < 0.1;
    const damage = isCritical ? baseDamage * 2 : baseDamage;

    return { damage, isCritical, attackType };
  };

  const handleAttack = async () => {
    if (!isConnected || !address) {
      playSound('click');
      openConnectModal?.();
      return;
    }

    if (!bossState.isAlive) {
      playSound('error');
      alert("The boss has been defeated! Wait for respawn.");
      return;
    }

    if (!canAttack) {
      playSound('error');
      alert(`Cooldown active! Wait ${(cooldownRemaining / 1000).toFixed(1)}s`);
      return;
    }

    // Check alien points balance and deduct entry fee
    const currentLevel = attackLevels[selectedAttack];
    const entryFee = ATTACK_ENTRY_FEES[selectedAttack][currentLevel - 1];
    const userBalance = getUserBalance(address);

    if (userBalance < entryFee) {
      playSound('error');
      alert(`Not enough Alien Points! Need ${entryFee.toLocaleString()} AP, you have ${userBalance.toLocaleString()} AP`);
      return;
    }

    // Check special attack cooldowns
    if (selectedAttack === 'power' && powerCooldown > 0) {
      playSound('error');
      alert(`Power Attack on cooldown! Wait ${(powerCooldown / 1000).toFixed(1)}s`);
      return;
    }

    if (selectedAttack === 'ultimate' && ultimateCooldown > 0) {
      playSound('error');
      alert(`Ultimate Attack on cooldown! Wait ${(ultimateCooldown / 1000).toFixed(1)}s`);
      return;
    }

    // Confirmation prompt with cost details
    const attackName = selectedAttack.charAt(0).toUpperCase() + selectedAttack.slice(1);
    const damageMultiplier = selectedAttack === 'normal'
      ? (1 + ((currentLevel - 1) * 0.1)).toFixed(1)
      : selectedAttack === 'power'
      ? (1.5 + ((currentLevel - 1) * 0.15)).toFixed(1)
      : (3 + ((currentLevel - 1) * 0.2)).toFixed(1);

    const confirmed = window.confirm(
      `⚔️ CONFIRM ATTACK ⚔️\n\n` +
      `Attack Type: ${attackName} (Level ${currentLevel})\n` +
      `Damage Multiplier: ${damageMultiplier}x\n` +
      `Cost: ${entryFee.toLocaleString()} Alien Points\n\n` +
      `Your Balance: ${userBalance.toLocaleString()} AP\n` +
      `After Attack: ${(userBalance - entryFee).toLocaleString()} AP\n\n` +
      `Proceed with attack?`
    );

    if (!confirmed) {
      playSound('error');
      return;
    }

    // Deduct entry fee
    await addPoints(address, -entryFee, 'boss');

    playSound('click');
    setIsAttacking(true);
    setLastAttackTime(Date.now());
    setBossShaking(true);

    // Set special attack cooldowns (save to backend API)
    if (selectedAttack === 'power' || selectedAttack === 'ultimate') {
      fetch(`/api/user-data?wallet=${address}`)
        .then(res => res.json())
        .then(data => {
          const currentCooldowns = data.userData?.bossCooldowns || { powerAttackTime: 0, ultimateAttackTime: 0 };
          const updatedCooldowns = {
            ...currentCooldowns,
            [selectedAttack === 'power' ? 'powerAttackTime' : 'ultimateAttackTime']: Date.now(),
          };

          return fetch('/api/user-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet: address, bossCooldowns: updatedCooldowns }),
          });
        })
        .catch(error => console.error('Failed to save cooldown:', error));
    }

    // Simulate attack animation delay
    setTimeout(async () => {
      const attackResult = calculateDamage(selectedAttack);
      setLastDamage(attackResult);

      // Play sound based on attack result
      if (attackResult.isCritical) {
        playSound('success');
      } else {
        playSound('scan');
      }

      // Stop shaking after different durations based on hit type
      // Critical hits shake longer (1000ms) vs normal hits (500ms)
      setTimeout(() => {
        setBossShaking(false);
      }, attackResult.isCritical ? 1000 : 500);

      // Send damage to API
      try {
        const response = await fetch('/api/boss', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            damage: attackResult.damage,
            wallet: address,
            attackType: selectedAttack,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setBossState(data.bossState);
          setRecentAttackers(data.recentAttackers || []);

          // Check if boss was defeated
          if (!data.bossState.isAlive) {
            playSound('success');
            setTimeout(() => {
              alert("🎉 THE GUMBUO BOSS HAS BEEN DEFEATED! 💀\n\nRewards are now available to claim! Check your damage contribution to see your share! 🏆");
            }, 500);
          }
        } else {
          playSound('error');
          alert('Failed to record damage. Please try again.');
        }
      } catch (error) {
        console.error('Failed to update boss:', error);
        playSound('error');
        alert('Network error. Please try again.');
      }

      setIsAttacking(false);
    }, 800);
  };

  const handleClaimReward = async () => {
    if (!isConnected || !address) {
      playSound('click');
      openConnectModal?.();
      return;
    }

    if (bossState.isAlive) {
      playSound('error');
      alert("Boss must be defeated first!");
      return;
    }

    if (hasClaimedReward) {
      playSound('error');
      alert("You've already claimed your reward for this boss!");
      return;
    }

    const userDamage = bossState.totalDamageDealt[address] || 0;
    if (userDamage === 0) {
      playSound('error');
      alert("You didn't deal any damage to this boss!");
      return;
    }

    // Calculate reward based on damage contribution
    const totalDamageAllUsers = Object.values(bossState.totalDamageDealt).reduce((a, b) => a + b, 0);
    const damagePercentage = userDamage / totalDamageAllUsers;
    const rewardAmount = Math.floor(REWARD_POOL_SIZE * damagePercentage);

    playSound('click');

    // Add points to user
    const success = await addPoints(address, rewardAmount, 'boss');

    if (success) {
      playSound('success');

      // Save reward claimed status to backend API
      try {
        await fetch('/api/user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: address, bossRewardClaimed: true }),
        });
      } catch (error) {
        console.error('Failed to save reward claimed status:', error);
      }

      setHasClaimedReward(true);
      alert(`🎉 Claimed ${rewardAmount.toLocaleString()} Alien Points!\n\nYour damage: ${userDamage.toLocaleString()} (${(damagePercentage * 100).toFixed(2)}% of total)\n\nReward pool share: ${rewardAmount.toLocaleString()} AP 🏆`);
    } else {
      playSound('error');
      alert("Failed to claim reward. Please try again.");
    }
  };

  const handleUpgradeAttack = async (attackType: 'normal' | 'power' | 'ultimate') => {
    if (!isConnected || !address) {
      playSound('click');
      openConnectModal?.();
      return;
    }

    const currentLevel = attackLevels[attackType];

    if (currentLevel >= MAX_ATTACK_LEVEL) {
      playSound('error');
      alert('This attack is already at maximum level!');
      return;
    }

    const upgradeCost = UPGRADE_COSTS[attackType][currentLevel - 1];
    const userBalance = getUserBalance(address);

    if (userBalance < upgradeCost) {
      playSound('error');
      alert(`Not enough Alien Points! Need ${upgradeCost.toLocaleString()} AP, you have ${userBalance.toLocaleString()} AP`);
      return;
    }

    // Deduct upgrade cost
    const success = await addPoints(address, -upgradeCost, 'boss');

    if (success) {
      const newLevels = { ...attackLevels, [attackType]: currentLevel + 1 };
      setAttackLevels(newLevels);

      // Save attack levels to backend API
      try {
        await fetch('/api/user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: address, attackLevels: newLevels }),
        });
      } catch (error) {
        console.error('Failed to save attack levels:', error);
      }

      playSound('success');
      alert(`✨ Attack upgraded to Level ${currentLevel + 1}! ✨\n\nDamage multiplier increased!`);
    } else {
      playSound('error');
      alert('Failed to upgrade. Please try again.');
    }
  };

  const getHPPercentage = () => {
    return (bossState.currentHP / bossState.maxHP) * 100;
  };

  const getHPBarColor = () => {
    const percentage = getHPPercentage();
    if (percentage > 60) return "from-green-500 via-green-400 to-green-500";
    if (percentage > 30) return "from-yellow-500 via-yellow-400 to-yellow-500";
    return "from-red-500 via-red-400 to-red-500";
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px',
      padding: '32px',
      background: 'rgba(0, 0, 0, 0.4)',
      maxWidth: '1152px',
      borderRadius: '8px',
      border: '2px solid #00ff9944'
    }}>
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shine {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-10px, -5px) rotate(-2deg); }
          20% { transform: translate(10px, 5px) rotate(2deg); }
          30% { transform: translate(-10px, 5px) rotate(-2deg); }
          40% { transform: translate(10px, -5px) rotate(2deg); }
          50% { transform: translate(-5px, 10px) rotate(-1deg); }
          60% { transform: translate(5px, -10px) rotate(1deg); }
          70% { transform: translate(-10px, -5px) rotate(-2deg); }
          80% { transform: translate(10px, 5px) rotate(2deg); }
          90% { transform: translate(-5px, -5px) rotate(-1deg); }
        }
      `}</style>

      {/* Title */}
      <h2 className="font-alien font-bold holographic-text tracking-wider text-center" style={{fontSize: '4rem'}}>
        <span className="text-red-400">💀 GUMBUO BOSS BATTLE ⚔️</span>
      </h2>

      {/* Boss Status */}
      <div style={{
        width: '100%',
        background: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '8px',
        border: '2px solid #00ff9944',
        padding: '32px'
      }}>
        <div className="space-y-6">
          {/* Boss Name & Status */}
          <div className="text-center">
            <h3 className="text-5xl font-alien mb-2 holographic-text">
              {bossState.isAlive ? "👹 MEGA GUMBUO 👹" : "💀 DEFEATED 💀"}
            </h3>
            <p className="text-2xl text-blue-400 holographic-text">
              {bossState.isAlive ? "DESTROYER OF WORLDS" : "AWAITING RESPAWN"}
            </p>
          </div>

          {/* Boss Image */}
          <div className="flex justify-center">
            <img
              src="/gumbuoboss.png"
              alt="Gumbuo Boss"
              className={`w-48 h-48 ${!bossState.isAlive ? 'opacity-30 grayscale' : ''} transition-all duration-300`}
              style={{
                filter: bossState.isAlive ? 'drop-shadow(0 0 40px rgba(239, 68, 68, 0.9)) drop-shadow(0 0 80px rgba(239, 68, 68, 0.5))' : 'none',
                animation: bossShaking ? 'shake 0.5s ease-in-out' : 'none',
                objectFit: 'contain',
                maxHeight: '200px'
              }}
            />
          </div>

          {/* HP Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-xl font-bold holographic-text">
                HP: {bossState.currentHP.toLocaleString()} / {bossState.maxHP.toLocaleString()}
              </p>
              <p className="text-xl font-bold holographic-text">
                {getHPPercentage().toFixed(1)}%
              </p>
            </div>

            <div className="w-full bg-gray-900 rounded-full h-8 border-2 border-gray-700 overflow-hidden shadow-2xl relative">
              <div
                className={`bg-gradient-to-r ${getHPBarColor()} h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden`}
                style={{
                  width: `${getHPPercentage()}%`,
                  boxShadow: bossState.isAlive ? '0 0 20px currentColor, inset 0 0 20px rgba(255,255,255,0.3)' : 'none',
                  animation: bossShaking ? 'pulse 0.5s ease-in-out' : 'none'
                }}
              >
                {/* Animated shine effect */}
                {bossState.isAlive && (
                  <div
                    className="absolute inset-y-0 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    style={{
                      animation: 'shine 3s infinite linear',
                      transform: 'skewX(-20deg)',
                      width: '100%'
                    }}
                  ></div>
                )}
              </div>
            </div>
          </div>

          {/* Respawn Timer */}
          {!bossState.isAlive && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '8px',
              border: '2px solid #00ff9944',
              padding: '16px',
              textAlign: 'center'
            }}>
              <p className="text-yellow-400 text-lg font-bold">⏰ Respawns in:</p>
              <p className="text-2xl text-yellow-300 font-bold mt-2">{timeUntilRespawn}</p>
            </div>
          )}

          {/* Last Attack Result */}
          {lastDamage && bossState.isAlive && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '8px',
              border: '2px solid #00ff9944',
              padding: '16px',
              textAlign: 'center'
            }}>
              <p className={`text-2xl font-bold ${lastDamage.isCritical ? 'text-yellow-400' : 'text-orange-400'}`}>
                {lastDamage.isCritical ? '⚡ CRITICAL HIT! ⚡' : '💥 HIT! 💥'}
              </p>
              <p className={`text-4xl font-alien ${lastDamage.isCritical ? 'text-yellow-400' : 'text-orange-400'} mt-2`}>
                -{lastDamage.damage.toLocaleString()} HP
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Attack Type Selector */}
      {bossState.isAlive && isConnected && (
        <div style={{
          width: '100%',
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '8px',
          border: '2px solid #00ff9944',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <h3 className="text-3xl font-alien text-orange-400 text-center holographic-text">⚔️ CHOOSE YOUR ATTACK ⚔️</h3>

          {/* Attack Selection Buttons */}
          <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Normal Attack Button */}
            <button
              onClick={() => {
                setSelectedAttack('normal');
                playSound('hover');
              }}
              style={{
                padding: '32px',
                background: selectedAttack === 'normal'
                  ? 'linear-gradient(135deg, #06b6d4, #0891b2)'
                  : 'rgba(107, 114, 128, 0.5)',
                color: '#fff',
                border: selectedAttack === 'normal'
                  ? '2px solid #06b6d4'
                  : '2px solid rgba(107, 114, 128, 0.5)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: selectedAttack === 'normal'
                  ? '0 0 30px rgba(6, 182, 212, 0.7)'
                  : '0 0 10px rgba(6, 182, 212, 0.3)',
                transform: selectedAttack === 'normal' ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (selectedAttack !== 'normal') {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #06b6d4, #0891b2)';
                  e.currentTarget.style.border = '2px solid #06b6d4';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(6, 182, 212, 0.5)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedAttack !== 'normal') {
                  e.currentTarget.style.background = 'rgba(107, 114, 128, 0.5)';
                  e.currentTarget.style.border = '2px solid rgba(107, 114, 128, 0.5)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(6, 182, 212, 0.3)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <div style={{ fontSize: '60px', marginBottom: '12px' }}>👊</div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '24px', marginBottom: '8px' }}>NORMAL</div>
              <div style={{ color: '#fde047', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>{ATTACK_ENTRY_FEES.normal[attackLevels.normal - 1]} AP</div>
              <div style={{ color: '#4ade80', fontSize: '14px' }}>Level {attackLevels.normal}</div>
            </button>

            {/* Power Attack Button */}
            <button
              onClick={() => {
                if (powerCooldown === 0) {
                  setSelectedAttack('power');
                  playSound('hover');
                }
              }}
              disabled={powerCooldown > 0}
              style={{
                padding: '32px',
                background: powerCooldown > 0
                  ? 'rgba(107, 114, 128, 0.3)'
                  : selectedAttack === 'power'
                  ? 'linear-gradient(135deg, #a855f7, #9333ea)'
                  : 'rgba(107, 114, 128, 0.5)',
                color: '#fff',
                border: powerCooldown > 0
                  ? '2px solid rgba(107, 114, 128, 0.3)'
                  : selectedAttack === 'power'
                  ? '2px solid #a855f7'
                  : '2px solid rgba(107, 114, 128, 0.5)',
                borderRadius: '8px',
                cursor: powerCooldown > 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: powerCooldown > 0
                  ? 'none'
                  : selectedAttack === 'power'
                  ? '0 0 30px rgba(168, 85, 247, 0.7)'
                  : '0 0 10px rgba(168, 85, 247, 0.3)',
                opacity: powerCooldown > 0 ? 0.5 : 1,
                transform: selectedAttack === 'power' ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (powerCooldown === 0 && selectedAttack !== 'power') {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #a855f7, #9333ea)';
                  e.currentTarget.style.border = '2px solid #a855f7';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.5)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (powerCooldown === 0 && selectedAttack !== 'power') {
                  e.currentTarget.style.background = 'rgba(107, 114, 128, 0.5)';
                  e.currentTarget.style.border = '2px solid rgba(107, 114, 128, 0.5)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(168, 85, 247, 0.3)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <div style={{ fontSize: '60px', marginBottom: '12px' }}>💪</div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '24px', marginBottom: '8px' }}>POWER</div>
              <div style={{ color: '#fde047', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>{ATTACK_ENTRY_FEES.power[attackLevels.power - 1]} AP</div>
              <div style={{ color: '#4ade80', fontSize: '14px' }}>Level {attackLevels.power}</div>
              {powerCooldown > 0 && (
                <div style={{ color: '#f87171', fontWeight: 'bold', fontSize: '14px', marginTop: '8px' }}>
                  CD: {(powerCooldown / 1000).toFixed(0)}s
                </div>
              )}
            </button>

            {/* Cosmic Attack Button */}
            <button
              onClick={() => {
                if (ultimateCooldown === 0) {
                  setSelectedAttack('ultimate');
                  playSound('hover');
                }
              }}
              disabled={ultimateCooldown > 0}
              style={{
                padding: '32px',
                background: ultimateCooldown > 0
                  ? 'rgba(107, 114, 128, 0.3)'
                  : selectedAttack === 'ultimate'
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                  : 'rgba(107, 114, 128, 0.5)',
                color: '#fff',
                border: ultimateCooldown > 0
                  ? '2px solid rgba(107, 114, 128, 0.3)'
                  : selectedAttack === 'ultimate'
                  ? '2px solid #f59e0b'
                  : '2px solid rgba(107, 114, 128, 0.5)',
                borderRadius: '8px',
                cursor: ultimateCooldown > 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: ultimateCooldown > 0
                  ? 'none'
                  : selectedAttack === 'ultimate'
                  ? '0 0 30px rgba(245, 158, 11, 0.7)'
                  : '0 0 10px rgba(245, 158, 11, 0.3)',
                opacity: ultimateCooldown > 0 ? 0.5 : 1,
                transform: selectedAttack === 'ultimate' ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (ultimateCooldown === 0 && selectedAttack !== 'ultimate') {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
                  e.currentTarget.style.border = '2px solid #f59e0b';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.5)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (ultimateCooldown === 0 && selectedAttack !== 'ultimate') {
                  e.currentTarget.style.background = 'rgba(107, 114, 128, 0.5)';
                  e.currentTarget.style.border = '2px solid rgba(107, 114, 128, 0.5)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(245, 158, 11, 0.3)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <div style={{ fontSize: '60px', marginBottom: '12px' }}>⚡</div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '24px', marginBottom: '8px' }}>COSMIC</div>
              <div style={{ color: '#fde047', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>{ATTACK_ENTRY_FEES.ultimate[attackLevels.ultimate - 1]} AP</div>
              <div style={{ color: '#4ade80', fontSize: '14px' }}>Level {attackLevels.ultimate}</div>
              {ultimateCooldown > 0 && (
                <div style={{ color: '#f87171', fontWeight: 'bold', fontSize: '14px', marginTop: '8px' }}>
                  CD: {(ultimateCooldown / 1000).toFixed(0)}s
                </div>
              )}
            </button>
          </div>

          {/* Upgrade Buttons Row */}
          <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* Normal Upgrade */}
            {attackLevels.normal < MAX_ATTACK_LEVEL && (
              <button
                onClick={() => {
                  handleUpgradeAttack('normal');
                  playSound('hover');
                }}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                  color: '#fff',
                  border: '2px solid #06b6d4',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 15px rgba(6, 182, 212, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0891b2, #0e7490)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(6, 182, 212, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #06b6d4, #0891b2)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.5)';
                }}
              >
                ⬆️ Upgrade Normal ({UPGRADE_COSTS.normal[attackLevels.normal - 1].toLocaleString()} AP)
              </button>
            )}
            {attackLevels.normal >= MAX_ATTACK_LEVEL && (
              <div style={{
                padding: '8px 16px',
                background: 'rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
                border: '2px solid #4ade80',
                borderRadius: '8px',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                fontSize: '12px',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}>
                ✅ Max Level
              </div>
            )}

            {/* Power Upgrade */}
            {attackLevels.power < MAX_ATTACK_LEVEL && (
              <button
                onClick={() => {
                  handleUpgradeAttack('power');
                  playSound('hover');
                }}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                  color: '#fff',
                  border: '2px solid #a855f7',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #9333ea, #7e22ce)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(168, 85, 247, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #a855f7, #9333ea)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(168, 85, 247, 0.5)';
                }}
              >
                ⬆️ Upgrade Power ({UPGRADE_COSTS.power[attackLevels.power - 1].toLocaleString()} AP)
              </button>
            )}
            {attackLevels.power >= MAX_ATTACK_LEVEL && (
              <div style={{
                padding: '8px 16px',
                background: 'rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
                border: '2px solid #4ade80',
                borderRadius: '8px',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                fontSize: '12px',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}>
                ✅ Max Level
              </div>
            )}

            {/* Cosmic Upgrade */}
            {attackLevels.ultimate < MAX_ATTACK_LEVEL && (
              <button
                onClick={() => {
                  handleUpgradeAttack('ultimate');
                  playSound('hover');
                }}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff',
                  border: '2px solid #f59e0b',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #d97706, #b45309)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(245, 158, 11, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(245, 158, 11, 0.5)';
                }}
              >
                ⬆️ Upgrade Cosmic ({UPGRADE_COSTS.ultimate[attackLevels.ultimate - 1].toLocaleString()} AP)
              </button>
            )}
            {attackLevels.ultimate >= MAX_ATTACK_LEVEL && (
              <div style={{
                padding: '8px 16px',
                background: 'rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
                border: '2px solid #4ade80',
                borderRadius: '8px',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                fontSize: '12px',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}>
                ✅ Max Level
              </div>
            )}
          </div>

          {/* Main Attack Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                handleAttack();
                if (canAttack || !isConnected) playSound('hover');
              }}
              disabled={isAttacking || !canAttack}
              style={{
                padding: '24px 64px',
                background: isAttacking || !canAttack
                  ? 'rgba(107, 114, 128, 0.5)'
                  : 'linear-gradient(135deg, #dc2626, #ea580c)',
                color: isAttacking || !canAttack ? '#9ca3af' : '#fff',
                border: isAttacking || !canAttack
                  ? '2px solid rgba(107, 114, 128, 0.5)'
                  : '2px solid #dc2626',
                borderRadius: '8px',
                cursor: isAttacking || !canAttack ? 'not-allowed' : 'pointer',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                fontSize: '36px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                boxShadow: isAttacking || !canAttack
                  ? 'none'
                  : '0 0 30px rgba(220, 38, 38, 0.5)',
                opacity: isAttacking || !canAttack ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isAttacking && canAttack) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #b91c1c, #c2410c)';
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(220, 38, 38, 0.7)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isAttacking && canAttack) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626, #ea580c)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(220, 38, 38, 0.5)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {!isConnected
                ? "CONNECT WALLET"
                : isAttacking
                ? "⚔️ ATTACKING... ⚔️"
                : !canAttack
                ? `COOLDOWN: ${(cooldownRemaining / 1000).toFixed(1)}s`
                : "⚔️ LAUNCH ATTACK ⚔️"}
            </button>
          </div>

          {/* User Stats - Inside Attack Section */}
          {address && (
            <div style={{
              marginTop: '24px',
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '8px',
              border: '2px solid #00ff9944',
              padding: '24px'
            }}>
              <h3 className="text-2xl font-alien text-purple-400 text-center mb-4">👤 YOUR BATTLE STATS 👤</h3>

              <div className="flex items-center justify-between gap-4 mb-4">
                <div style={{
                  flex: 1,
                  textAlign: 'center',
                  background: 'rgba(168, 85, 247, 0.2)',
                  borderRadius: '8px',
                  border: '2px solid #00ff9944',
                  padding: '16px'
                }}>
                  <p className="text-purple-400 text-sm font-semibold mb-2">💥 Total Damage</p>
                  <p className="text-2xl font-bold text-purple-400">{userTotalDamage.toLocaleString()} HP</p>
                </div>

                <div className="flex items-center justify-center px-3">
                  <span className="text-3xl">→</span>
                </div>

                <div style={{
                  flex: 1,
                  textAlign: 'center',
                  background: 'rgba(34, 197, 94, 0.2)',
                  borderRadius: '8px',
                  border: '2px solid #00ff9944',
                  padding: '16px'
                }}>
                  <p className="text-green-400 text-sm font-semibold mb-2">🎁 {bossState.isAlive ? 'Current' : 'Final'} Reward</p>
                  <p className="text-2xl font-bold text-green-400">
                    {(() => {
                      const totalDamage = bossState.isAlive
                        ? (BOSS_MAX_HP - bossState.currentHP)
                        : Object.values(bossState.totalDamageDealt).reduce((a, b) => a + b, 0);
                      const reward = totalDamage > 0
                        ? Math.floor(REWARD_POOL_SIZE * (userTotalDamage / totalDamage))
                        : 0;
                      return reward.toLocaleString();
                    })()} AP
                  </p>
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '8px',
                border: '2px solid #00ff9944',
                padding: '12px'
              }}>
                <p className="text-purple-400 text-sm font-semibold mb-1">📊 Damage Contribution</p>
                <p className="text-xl font-bold text-purple-400">
                  {bossState.isAlive
                    ? `${((userTotalDamage / (BOSS_MAX_HP - bossState.currentHP || 1)) * 100).toFixed(2)}%`
                    : `${((userTotalDamage / (Object.values(bossState.totalDamageDealt).reduce((a, b) => a + b, 0) || 1)) * 100).toFixed(2)}%`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard & Recent Attackers */}
      <div className="w-full grid grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '8px',
          border: '2px solid #00ff9944',
          padding: '24px'
        }}>
          <h3 className="text-2xl font-alien text-yellow-400 text-center mb-4">🏆 DAMAGE & REWARDS 🏆</h3>
          <div className="flex flex-col items-center space-y-2">
            {leaderboard.length === 0 ? (
              <p className="text-gray-400 text-center text-sm">No attacks yet!</p>
            ) : (
              leaderboard.map((entry, index) => (
                <div key={index} style={{
                  borderRadius: '8px',
                  border: '2px solid #00ff9944'
                }} className={`flex items-center gap-3 p-3 ${
                  index === 0 ? 'bg-yellow-500/20' :
                  index === 1 ? 'bg-gray-400/20' :
                  index === 2 ? 'bg-orange-500/20' :
                  'bg-black/40'
                }`}>
                  <span className="text-xl flex-shrink-0">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <span className={`text-xs ${address?.toLowerCase() === entry.address.toLowerCase() ? 'text-green-400 font-bold' : 'text-gray-300'} flex-shrink-0 min-w-[120px]`}>
                    {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                    {address?.toLowerCase() === entry.address.toLowerCase() && ' (You)'}
                  </span>
                  <span className="text-yellow-400 font-bold text-sm whitespace-nowrap flex-shrink-0">
                    {entry.damage.toLocaleString()} HP
                  </span>
                  <span className="text-green-400 font-bold text-sm whitespace-nowrap flex-shrink-0">
                    🎁 {entry.reward.toLocaleString()} AP
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Attackers */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '8px',
          border: '2px solid #00ff9944',
          padding: '24px'
        }}>
          <h3 className="text-2xl font-alien text-cyan-400 text-center mb-4">📡 LIVE ATTACKS 📡</h3>
          <div className="flex flex-col items-center space-y-2 max-h-80 overflow-y-auto">
            {recentAttackers.length === 0 ? (
              <p className="text-gray-400 text-center text-sm">Waiting for attacks...</p>
            ) : (
              recentAttackers.map((attacker, index) => (
                <div key={index} style={{
                  borderRadius: '8px',
                  border: '2px solid #00ff9944',
                  animationDuration: '2s'
                }} className={`flex items-center gap-3 p-3 ${
                  attacker.attackType === 'ultimate' ? 'bg-yellow-500/20' :
                  attacker.attackType === 'power' ? 'bg-purple-500/20' :
                  'bg-blue-500/20'
                } animate-pulse`}>
                  <span className="text-xl flex-shrink-0">
                    {attacker.attackType === 'ultimate' ? '⚡' :
                     attacker.attackType === 'power' ? '💪' : '👊'}
                  </span>
                  <span className="text-xs text-gray-300 flex-shrink-0 min-w-[120px]">
                    {attacker.address.slice(0, 6)}...{attacker.address.slice(-4)}
                  </span>
                  <span className={`font-bold text-sm whitespace-nowrap flex-shrink-0 ${
                    attacker.attackType === 'ultimate' ? 'text-yellow-400' :
                    attacker.attackType === 'power' ? 'text-purple-400' :
                    'text-cyan-400'
                  }`}>
                    -{attacker.damage.toLocaleString()} HP
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Claim Reward Button */}
      {!bossState.isAlive && !hasClaimedReward && userTotalDamage > 0 && (
        <button
          onClick={handleClaimReward}
          onMouseEnter={() => playSound('hover')}
          style={{
            borderRadius: '8px',
            border: '2px solid #00ff9944'
          }}
          className="px-16 py-6 text-3xl font-bold tracking-wider alien-button alien-button-primary alien-button-glow alien-button-organic"
        >
          {!isConnected ? "CONNECT WALLET" : "🏆 CLAIM REWARD 🏆"}
        </button>
      )}

      {/* Already Claimed */}
      {!bossState.isAlive && hasClaimedReward && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '8px',
          border: '2px solid #00ff9944',
          padding: '24px',
          textAlign: 'center'
        }}>
          <p className="text-green-400 text-xl font-bold">✅ Reward Already Claimed! ✅</p>
          <p className="text-green-400 text-base mt-2">Wait for boss respawn to earn more rewards!</p>
        </div>
      )}

      {/* Battle Info */}
      <div style={{
        width: '100%',
        textAlign: 'center',
        maxWidth: '768px',
        background: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '8px',
        border: '2px solid #00ff9944',
        padding: '24px',
        color: '#f87171'
      }}>
        <p className="font-bold mb-3 text-lg">ℹ️ Battle Info ℹ️</p>
        <p className="opacity-75 font-electro text-base leading-relaxed">
          Attack the Gumbuo boss and deal massive damage! Each attack has a {ATTACK_COOLDOWN / 1000} second cooldown.
          Damage is randomly calculated between {MIN_DAMAGE.toLocaleString()} - {MAX_DAMAGE.toLocaleString()} HP with a 10% chance for critical hits (2x damage).
          When defeated, a pool of <span className="text-yellow-400 font-bold">{REWARD_POOL_SIZE.toLocaleString()} Alien Points</span> is distributed to ALL participants based on damage contribution.
          Boss respawns after 1 hour. More damage = bigger rewards! 🎯
        </p>
      </div>
    </div>
  );
}
