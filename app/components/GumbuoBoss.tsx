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
const REWARD_POOL_SIZE = 100_000; // GMB tokens in pool
const BOSS_RESPAWN_TIME = 3600000; // 1 hour in milliseconds

// Attack Level System
const MAX_ATTACK_LEVEL = 5;
const UPGRADE_COSTS = {
  normal: [5_000, 10_000, 20_000, 40_000], // Costs to upgrade from level 1->2, 2->3, 3->4, 4->5
  power: [10_000, 20_000, 40_000, 80_000],
  ultimate: [20_000, 40_000, 80_000, 160_000],
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
  const [leaderboard, setLeaderboard] = useState<Array<{address: string, damage: number}>>([]);
  const [attackLevels, setAttackLevels] = useState<AttackLevels>({ normal: 1, power: 1, ultimate: 1 });

  // Load boss state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("gumbuoBossState");
    if (savedState) {
      const parsed = JSON.parse(savedState);

      // Check if boss should respawn
      if (!parsed.isAlive && parsed.defeatedAt) {
        const now = Date.now();
        const timeSinceDefeat = now - parsed.defeatedAt;

        if (timeSinceDefeat >= BOSS_RESPAWN_TIME) {
          // Respawn boss
          const newState: BossState = {
            currentHP: BOSS_MAX_HP,
            maxHP: BOSS_MAX_HP,
            defeatedAt: null,
            totalDamageDealt: {},
            isAlive: true,
          };
          setBossState(newState);
          localStorage.setItem("gumbuoBossState", JSON.stringify(newState));

          // Reset claimed status for all users
          if (address) {
            localStorage.removeItem(`bossRewardClaimed_${address}`);
            setHasClaimedReward(false);
          }
        } else {
          setBossState(parsed);
        }
      } else {
        setBossState(parsed);
      }
    }
  }, []);

  // Check if user has claimed reward
  useEffect(() => {
    if (!address) return;
    const claimed = localStorage.getItem(`bossRewardClaimed_${address}`);
    setHasClaimedReward(claimed === "true");
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

  // Update respawn timer for defeated boss
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

        // Auto-respawn when timer reaches 0
        if (timeRemaining === 0) {
          const newState: BossState = {
            currentHP: BOSS_MAX_HP,
            maxHP: BOSS_MAX_HP,
            defeatedAt: null,
            totalDamageDealt: {},
            isAlive: true,
          };
          setBossState(newState);
          localStorage.setItem("gumbuoBossState", JSON.stringify(newState));

          // Reset claimed status
          if (address) {
            localStorage.removeItem(`bossRewardClaimed_${address}`);
            setHasClaimedReward(false);
          }

          playSound('success');
          alert("🎉 The Gumbuo Boss has respawned! Time to battle again! 💀");
        }
      };

      updateRespawnTimer();
      const interval = setInterval(updateRespawnTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [bossState.isAlive, bossState.defeatedAt, address, playSound]);

  // Update leaderboard
  useEffect(() => {
    const sorted = Object.entries(bossState.totalDamageDealt)
      .map(([address, damage]) => ({ address, damage }))
      .sort((a, b) => b.damage - a.damage)
      .slice(0, 10);
    setLeaderboard(sorted);
  }, [bossState.totalDamageDealt]);

  // Update power/ultimate cooldowns
  useEffect(() => {
    const updateSpecialCooldowns = () => {
      const savedPower = localStorage.getItem('powerAttackTime');
      const savedUltimate = localStorage.getItem('ultimateAttackTime');

      if (savedPower) {
        const remaining = Math.max(0, 30000 - (Date.now() - parseInt(savedPower)));
        setPowerCooldown(remaining);
      }

      if (savedUltimate) {
        const remaining = Math.max(0, 60000 - (Date.now() - parseInt(savedUltimate)));
        setUltimateCooldown(remaining);
      }
    };

    updateSpecialCooldowns();
    const interval = setInterval(updateSpecialCooldowns, 100);
    return () => clearInterval(interval);
  }, []);

  // Load attack levels from localStorage
  useEffect(() => {
    if (!address) return;
    const savedLevels = localStorage.getItem(`attackLevels_${address}`);
    if (savedLevels) {
      setAttackLevels(JSON.parse(savedLevels));
    }
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

    // Deduct entry fee
    await addPoints(address, -entryFee, 'boss');

    playSound('click');
    setIsAttacking(true);
    setLastAttackTime(Date.now());
    setBossShaking(true);

    // Set special attack cooldowns
    if (selectedAttack === 'power') {
      localStorage.setItem('powerAttackTime', Date.now().toString());
    }
    if (selectedAttack === 'ultimate') {
      localStorage.setItem('ultimateAttackTime', Date.now().toString());
    }

    // Simulate attack animation delay
    setTimeout(() => {
      const attackResult = calculateDamage(selectedAttack);
      setLastDamage(attackResult);
      setBossShaking(false);

      // Play sound based on attack result
      if (attackResult.isCritical) {
        playSound('success');
      } else {
        playSound('scan');
      }

      // Update boss HP
      const newHP = Math.max(0, bossState.currentHP - attackResult.damage);
      const newDamageDealt = { ...bossState.totalDamageDealt };
      newDamageDealt[address] = (newDamageDealt[address] || 0) + attackResult.damage;

      const newState: BossState = {
        ...bossState,
        currentHP: newHP,
        totalDamageDealt: newDamageDealt,
        isAlive: newHP > 0,
        defeatedAt: newHP === 0 ? Date.now() : null,
      };

      setBossState(newState);
      localStorage.setItem("gumbuoBossState", JSON.stringify(newState));

      // Add to recent attackers feed
      const newAttacker: RecentAttacker = {
        address,
        damage: attackResult.damage,
        timestamp: Date.now(),
        attackType: selectedAttack,
      };
      setRecentAttackers(prev => [newAttacker, ...prev].slice(0, 10));

      // Check if boss was defeated
      if (newHP === 0) {
        playSound('success');
        setTimeout(() => {
          alert("🎉 THE GUMBUO BOSS HAS BEEN DEFEATED! 💀\n\nRewards are now available to claim! Check your damage contribution to see your share! 🏆");
        }, 500);
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
      localStorage.setItem(`bossRewardClaimed_${address}`, "true");
      setHasClaimedReward(true);
      alert(`🎉 Claimed ${rewardAmount.toLocaleString()} GMB tokens!\n\nYour damage: ${userDamage.toLocaleString()} (${(damagePercentage * 100).toFixed(2)}% of total)\n\nReward pool share: ${rewardAmount.toLocaleString()} GMB 🏆`);
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
      localStorage.setItem(`attackLevels_${address}`, JSON.stringify(newLevels));

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
    <div className="flex flex-col items-center space-y-6 p-8 bg-black/40 backdrop-blur-sm max-w-6xl rounded-3xl border border-red-400/30">
      {/* Title */}
      <h2 className="font-alien font-bold holographic-text tracking-wider text-center" style={{fontSize: '4rem'}}>
        <span className="text-red-400">💀 GUMBUO BOSS BATTLE ⚔️</span>
      </h2>

      {/* Boss Status */}
      <div className="w-full bg-black/60 border-2 border-red-500/50 rounded-3xl p-8">
        <div className="space-y-6">
          {/* Boss Image */}
          <div className="flex justify-center">
            <img
              src="/gumbuo.svg"
              alt="Mega Gumbuo Boss"
              className={`w-64 h-64 ${bossShaking ? 'animate-bounce' : ''} ${!bossState.isAlive ? 'opacity-30 grayscale' : ''} transition-all duration-300`}
              style={{
                filter: bossState.isAlive ? 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.8))' : 'none',
                animation: bossShaking ? 'shake 0.5s' : 'none'
              }}
            />
          </div>

          {/* Boss Name & Status */}
          <div className="text-center">
            <h3 className="text-5xl font-alien mb-2">
              {bossState.isAlive ? "👹 MEGA GUMBUO 👹" : "💀 DEFEATED 💀"}
            </h3>
            <p className="text-2xl text-red-400">
              {bossState.isAlive ? "DESTROYER OF WORLDS" : "AWAITING RESPAWN"}
            </p>
          </div>

          {/* HP Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-red-400 text-xl font-bold">
                HP: {bossState.currentHP.toLocaleString()} / {bossState.maxHP.toLocaleString()}
              </p>
              <p className="text-red-400 text-xl font-bold">
                {getHPPercentage().toFixed(1)}%
              </p>
            </div>

            <div className="w-full bg-gray-900 rounded-full h-6 border-2 border-red-900">
              <div
                className={`bg-gradient-to-r ${getHPBarColor()} h-full rounded-full transition-all duration-500`}
                style={{width: `${getHPPercentage()}%`}}
              ></div>
            </div>
          </div>

          {/* Respawn Timer */}
          {!bossState.isAlive && (
            <div className="bg-black/60 border border-yellow-500/50 rounded-xl p-4 text-center">
              <p className="text-yellow-400 text-lg font-bold">⏰ Respawns in:</p>
              <p className="text-2xl text-yellow-300 font-bold mt-2">{timeUntilRespawn}</p>
            </div>
          )}

          {/* Last Attack Result */}
          {lastDamage && bossState.isAlive && (
            <div className={`bg-black/60 border ${lastDamage.isCritical ? 'border-yellow-400/50' : 'border-orange-400/50'} rounded-xl p-4 text-center`}>
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

      {/* User Stats */}
      {isConnected && address && (
        <div className="w-full bg-black/60 border-2 border-purple-500/50 rounded-2xl p-6">
          <h3 className="text-2xl font-alien text-purple-400 text-center mb-4">👤 YOUR BATTLE STATS 👤</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/60 border border-purple-400/30 rounded-xl p-4 text-center">
              <p className="text-purple-400 text-base">Total Damage Dealt</p>
              <p className="text-3xl font-bold text-purple-400 mt-2">{userTotalDamage.toLocaleString()}</p>
            </div>

            <div className="bg-black/60 border border-purple-400/30 rounded-xl p-4 text-center">
              <p className="text-purple-400 text-base">Damage Contribution</p>
              <p className="text-3xl font-bold text-purple-400 mt-2">
                {bossState.isAlive
                  ? `${((userTotalDamage / (BOSS_MAX_HP - bossState.currentHP)) * 100).toFixed(2)}%`
                  : `${((userTotalDamage / Object.values(bossState.totalDamageDealt).reduce((a, b) => a + b, 0)) * 100).toFixed(2)}%`
                }
              </p>
            </div>
          </div>

          {!bossState.isAlive && (
            <div className="mt-4 bg-black/60 border border-green-400/30 rounded-xl p-4 text-center">
              <p className="text-green-400 text-base">Potential Reward</p>
              <p className="text-3xl font-bold text-green-400 mt-2">
                {Math.floor(REWARD_POOL_SIZE * (userTotalDamage / Object.values(bossState.totalDamageDealt).reduce((a, b) => a + b, 0))).toLocaleString()} GMB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Attack Type Selector */}
      {bossState.isAlive && isConnected && (
        <div className="w-full bg-black/60 border-2 border-orange-500/50 rounded-2xl p-6">
          <h3 className="text-2xl font-alien text-orange-400 text-center mb-4">⚔️ SELECT ATTACK TYPE ⚔️</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Normal Attack */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setSelectedAttack('normal')}
                className={`px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                  selectedAttack === 'normal'
                    ? 'bg-blue-500 text-white border-2 border-blue-300'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <p className="text-2xl mb-1">👊</p>
                <p>Normal Attack</p>
                <p className="text-sm mt-1">Level {attackLevels.normal}/5</p>
                <p className="text-xs text-yellow-400 mt-1">
                  {(1 + ((attackLevels.normal - 1) * 0.1)).toFixed(1)}x Damage
                </p>
                <p className="text-xs text-orange-400 mt-1">
                  Cost: {ATTACK_ENTRY_FEES.normal[attackLevels.normal - 1]} AP
                </p>
              </button>
              {attackLevels.normal < MAX_ATTACK_LEVEL && (
                <button
                  onClick={() => handleUpgradeAttack('normal')}
                  onMouseEnter={() => playSound('hover')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold"
                >
                  ⬆️ Upgrade ({UPGRADE_COSTS.normal[attackLevels.normal - 1].toLocaleString()} AP)
                </button>
              )}
            </div>

            {/* Power Attack */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setSelectedAttack('power')}
                disabled={powerCooldown > 0}
                className={`px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                  selectedAttack === 'power' && powerCooldown === 0
                    ? 'bg-purple-500 text-white border-2 border-purple-300'
                    : powerCooldown > 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <p className="text-2xl mb-1">💪</p>
                <p>Power Attack</p>
                <p className="text-sm mt-1">Level {attackLevels.power}/5</p>
                <p className="text-xs text-yellow-400 mt-1">
                  {(1.5 + ((attackLevels.power - 1) * 0.15)).toFixed(1)}x Damage
                </p>
                <p className="text-xs text-orange-400 mt-1">
                  Cost: {ATTACK_ENTRY_FEES.power[attackLevels.power - 1]} AP
                </p>
                <p className={`text-xs mt-1 ${powerCooldown > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {powerCooldown > 0 ? `CD: ${(powerCooldown / 1000).toFixed(1)}s` : 'Ready!'}
                </p>
              </button>
              {attackLevels.power < MAX_ATTACK_LEVEL && (
                <button
                  onClick={() => handleUpgradeAttack('power')}
                  onMouseEnter={() => playSound('hover')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold"
                >
                  ⬆️ Upgrade ({UPGRADE_COSTS.power[attackLevels.power - 1].toLocaleString()} AP)
                </button>
              )}
            </div>

            {/* Ultimate Attack */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setSelectedAttack('ultimate')}
                disabled={ultimateCooldown > 0}
                className={`px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                  selectedAttack === 'ultimate' && ultimateCooldown === 0
                    ? 'bg-yellow-500 text-black border-2 border-yellow-300'
                    : ultimateCooldown > 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <p className="text-2xl mb-1">⚡</p>
                <p>Ultimate Attack</p>
                <p className="text-sm mt-1">Level {attackLevels.ultimate}/5</p>
                <p className="text-xs text-yellow-400 mt-1">
                  {(3 + ((attackLevels.ultimate - 1) * 0.2)).toFixed(1)}x Damage
                </p>
                <p className="text-xs text-orange-400 mt-1">
                  Cost: {ATTACK_ENTRY_FEES.ultimate[attackLevels.ultimate - 1]} AP
                </p>
                <p className={`text-xs mt-1 ${ultimateCooldown > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {ultimateCooldown > 0 ? `CD: ${(ultimateCooldown / 1000).toFixed(1)}s` : 'Ready!'}
                </p>
              </button>
              {attackLevels.ultimate < MAX_ATTACK_LEVEL && (
                <button
                  onClick={() => handleUpgradeAttack('ultimate')}
                  onMouseEnter={() => playSound('hover')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold"
                >
                  ⬆️ Upgrade ({UPGRADE_COSTS.ultimate[attackLevels.ultimate - 1].toLocaleString()} AP)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard & Recent Attackers */}
      <div className="w-full grid grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div className="bg-black/60 border-2 border-yellow-500/50 rounded-2xl p-6">
          <h3 className="text-2xl font-alien text-yellow-400 text-center mb-4">🏆 TOP DAMAGE DEALERS 🏆</h3>
          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              <p className="text-gray-400 text-center text-sm">No attacks yet!</p>
            ) : (
              leaderboard.map((entry, index) => (
                <div key={index} className={`flex justify-between items-center p-3 rounded-xl ${
                  index === 0 ? 'bg-yellow-500/20 border border-yellow-400/50' :
                  index === 1 ? 'bg-gray-400/20 border border-gray-400/50' :
                  index === 2 ? 'bg-orange-500/20 border border-orange-400/50' :
                  'bg-black/40'
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <span className={`text-sm ${address?.toLowerCase() === entry.address.toLowerCase() ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                      {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                      {address?.toLowerCase() === entry.address.toLowerCase() && ' (You)'}
                    </span>
                  </div>
                  <span className="text-yellow-400 font-bold">{entry.damage.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Attackers */}
        <div className="bg-black/60 border-2 border-cyan-500/50 rounded-2xl p-6">
          <h3 className="text-2xl font-alien text-cyan-400 text-center mb-4">📡 LIVE ATTACKS 📡</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recentAttackers.length === 0 ? (
              <p className="text-gray-400 text-center text-sm">Waiting for attacks...</p>
            ) : (
              recentAttackers.map((attacker, index) => (
                <div key={index} className={`p-3 rounded-xl border ${
                  attacker.attackType === 'ultimate' ? 'bg-yellow-500/20 border-yellow-400/50' :
                  attacker.attackType === 'power' ? 'bg-purple-500/20 border-purple-400/50' :
                  'bg-blue-500/20 border-blue-400/50'
                } animate-pulse`} style={{animationDuration: '2s'}}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {attacker.attackType === 'ultimate' ? '⚡' :
                         attacker.attackType === 'power' ? '💪' : '👊'}
                      </span>
                      <span className="text-xs text-gray-300">
                        {attacker.address.slice(0, 6)}...{attacker.address.slice(-4)}
                      </span>
                    </div>
                    <span className={`font-bold text-sm ${
                      attacker.attackType === 'ultimate' ? 'text-yellow-400' :
                      attacker.attackType === 'power' ? 'text-purple-400' :
                      'text-cyan-400'
                    }`}>
                      -{attacker.damage.toLocaleString()} HP
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Attack Button */}
      {bossState.isAlive && (
        <button
          onClick={handleAttack}
          onMouseEnter={() => (canAttack || !isConnected) && playSound('hover')}
          disabled={isAttacking || !canAttack}
          className={`px-16 py-6 text-3xl font-bold tracking-wider transition-all duration-200 rounded-xl ${
            isAttacking || !canAttack
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          <span className="relative z-10">
            {!isConnected
              ? "CONNECT WALLET"
              : isAttacking
              ? "⚔️ ATTACKING... ⚔️"
              : !canAttack
              ? `COOLDOWN: ${(cooldownRemaining / 1000).toFixed(1)}s`
              : "⚔️ ATTACK BOSS ⚔️"}
          </span>
        </button>
      )}

      {/* Claim Reward Button */}
      {!bossState.isAlive && !hasClaimedReward && userTotalDamage > 0 && (
        <button
          onClick={handleClaimReward}
          onMouseEnter={() => playSound('hover')}
          className="px-16 py-6 text-3xl font-bold tracking-wider transition-all duration-200 rounded-xl bg-green-500 text-white hover:bg-green-600"
        >
          {!isConnected ? "CONNECT WALLET" : "🏆 CLAIM REWARD 🏆"}
        </button>
      )}

      {/* Already Claimed */}
      {!bossState.isAlive && hasClaimedReward && (
        <div className="bg-black/60 border border-green-500/30 rounded-xl p-6 text-center">
          <p className="text-green-400 text-xl font-bold">✅ Reward Already Claimed! ✅</p>
          <p className="text-green-400 text-base mt-2">Wait for boss respawn to earn more rewards!</p>
        </div>
      )}

      {/* Reward Pool Info */}
      <div className="w-full bg-black/60 border border-yellow-400/30 rounded-xl p-6">
        <h3 className="text-xl font-alien text-yellow-400 text-center mb-4">💰 REWARD POOL 💰</h3>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-yellow-400 text-base">Total Pool Size:</p>
            <p className="text-lg font-bold text-yellow-400">{REWARD_POOL_SIZE.toLocaleString()} GMB</p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-yellow-400 text-base">Distribution Method:</p>
            <p className="text-base font-bold text-yellow-400">By Damage %</p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-yellow-400 text-base">Attack Damage Range:</p>
            <p className="text-base font-bold text-yellow-400">{MIN_DAMAGE.toLocaleString()} - {MAX_DAMAGE.toLocaleString()} HP</p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-yellow-400 text-base">Critical Hit Chance:</p>
            <p className="text-base font-bold text-yellow-400">10% (2x Damage)</p>
          </div>
        </div>
      </div>

      {/* Battle Info */}
      <div className="w-full text-red-400 text-sm text-center max-w-3xl bg-black/60 p-6 rounded-xl border border-red-400/30">
        <p className="font-bold mb-3 text-lg">ℹ️ Battle Info ℹ️</p>
        <p className="opacity-75 font-electro text-base leading-relaxed">
          Attack the Mega Gumbuo boss and deal massive damage! Each attack has a {ATTACK_COOLDOWN / 1000} second cooldown.
          Damage is randomly calculated between {MIN_DAMAGE.toLocaleString()} - {MAX_DAMAGE.toLocaleString()} HP with a 10% chance for critical hits (2x damage).
          When defeated, rewards are distributed based on your damage contribution percentage.
          Boss respawns after 1 hour. More damage = bigger rewards! 🎯
        </p>
      </div>
    </div>
  );
}
