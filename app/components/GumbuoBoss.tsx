"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useAlienPoints } from "../context/AlienPointsEconomy";
import { useCosmicSound } from "../hooks/useCosmicSound";

const BOSS_MAX_HP = 1_000_000;
const MIN_DAMAGE = 1_000;
const MAX_DAMAGE = 10_000;
const ATTACK_COOLDOWN = 5000; // 5 seconds
const REWARD_POOL_SIZE = 100_000; // GMB tokens in pool
const BOSS_RESPAWN_TIME = 3600000; // 1 hour in milliseconds

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
}

export default function GumbuoBoss() {
  const { address, isConnected } = useAccount();
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

  const calculateDamage = (): AttackResult => {
    const baseDamage = Math.floor(Math.random() * (MAX_DAMAGE - MIN_DAMAGE + 1)) + MIN_DAMAGE;

    // 10% chance for critical hit (2x damage)
    const isCritical = Math.random() < 0.1;
    const damage = isCritical ? baseDamage * 2 : baseDamage;

    return { damage, isCritical };
  };

  const handleAttack = async () => {
    if (!isConnected || !address) {
      playSound('error');
      alert("Please connect your wallet first!");
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

    playSound('click');
    setIsAttacking(true);
    setLastAttackTime(Date.now());

    // Simulate attack animation delay
    setTimeout(() => {
      const attackResult = calculateDamage();
      setLastDamage(attackResult);

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
      playSound('error');
      alert("Please connect your wallet first!");
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
    <div className="flex flex-col items-center space-y-6 p-8 holographic-panel max-w-6xl relative overflow-visible rounded-3xl">
      {/* Corner glow accents */}
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      {/* Title */}
      <h2 className="font-alien font-bold holographic-text tracking-wider flex items-center justify-center space-x-2 drop-shadow-lg relative z-10 alien-glyph-text tech-corners" style={{fontSize: '4.5rem'}}>
        <span className="animate-glow text-red-400">💀 GUMBUO BOSS BATTLE ⚔️</span>
      </h2>

      {/* Boss Status */}
      <div className="w-full glass-panel border-4 border-red-500/70 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-red-500/70">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent animate-shimmer pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          {/* Boss Name & Status */}
          <div className="text-center">
            <h3 className="text-6xl font-alien holographic-text mb-2">
              {bossState.isAlive ? "👹 MEGA GUMBUO 👹" : "💀 DEFEATED 💀"}
            </h3>
            <p className="text-3xl font-electro text-red-400">
              {bossState.isAlive ? "DESTROYER OF WORLDS" : "AWAITING RESPAWN"}
            </p>
          </div>

          {/* HP Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-red-400 text-2xl font-bold font-iceland">
                HP: {bossState.currentHP.toLocaleString()} / {bossState.maxHP.toLocaleString()}
              </p>
              <p className="text-red-400 text-2xl font-bold">
                {getHPPercentage().toFixed(1)}%
              </p>
            </div>

            <div className="w-full bg-gray-900 rounded-full h-8 border-4 border-red-900 shadow-inner relative overflow-hidden">
              <div
                className={`bg-gradient-to-r ${getHPBarColor()} h-full rounded-full transition-all duration-500 shadow-lg shadow-red-400/50 relative overflow-hidden`}
                style={{width: `${getHPPercentage()}%`}}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>

          {/* Respawn Timer */}
          {!bossState.isAlive && (
            <div className="glass-panel border-2 border-yellow-500/50 rounded-xl p-4 text-center">
              <p className="text-yellow-400 text-xl font-bold">⏰ Respawns in:</p>
              <p className="text-3xl text-yellow-300 font-bold mt-2">{timeUntilRespawn}</p>
            </div>
          )}

          {/* Last Attack Result */}
          {lastDamage && bossState.isAlive && (
            <div className={`glass-panel border-2 ${lastDamage.isCritical ? 'border-yellow-400/70' : 'border-orange-400/50'} rounded-xl p-4 text-center animate-pulse`}>
              <p className={`text-3xl font-bold ${lastDamage.isCritical ? 'text-yellow-400' : 'text-orange-400'}`}>
                {lastDamage.isCritical ? '⚡ CRITICAL HIT! ⚡' : '💥 HIT! 💥'}
              </p>
              <p className={`text-5xl font-alien ${lastDamage.isCritical ? 'text-yellow-400' : 'text-orange-400'} mt-2`}>
                -{lastDamage.damage.toLocaleString()} HP
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Stats */}
      {isConnected && address && (
        <div className="w-full glass-panel border-4 border-purple-500/70 rounded-2xl p-6 shadow-2xl shadow-purple-500/70">
          <h3 className="text-3xl font-alien text-purple-400 text-center mb-4 circuit-text">👤 YOUR BATTLE STATS 👤</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel border-2 border-purple-400/50 rounded-xl p-4 text-center">
              <p className="text-purple-400 text-lg font-electro">Total Damage Dealt</p>
              <p className="text-4xl font-bold text-purple-400 mt-2">{userTotalDamage.toLocaleString()}</p>
            </div>

            <div className="glass-panel border-2 border-purple-400/50 rounded-xl p-4 text-center">
              <p className="text-purple-400 text-lg font-electro">Damage Contribution</p>
              <p className="text-4xl font-bold text-purple-400 mt-2">
                {bossState.isAlive
                  ? `${((userTotalDamage / (BOSS_MAX_HP - bossState.currentHP)) * 100).toFixed(2)}%`
                  : `${((userTotalDamage / Object.values(bossState.totalDamageDealt).reduce((a, b) => a + b, 0)) * 100).toFixed(2)}%`
                }
              </p>
            </div>
          </div>

          {!bossState.isAlive && (
            <div className="mt-4 glass-panel border-2 border-green-400/50 rounded-xl p-4 text-center">
              <p className="text-green-400 text-lg font-electro">Potential Reward</p>
              <p className="text-4xl font-bold text-green-400 mt-2">
                {Math.floor(REWARD_POOL_SIZE * (userTotalDamage / Object.values(bossState.totalDamageDealt).reduce((a, b) => a + b, 0))).toLocaleString()} GMB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Attack Button */}
      {bossState.isAlive && (
        <button
          onClick={handleAttack}
          onMouseEnter={() => canAttack && playSound('hover')}
          disabled={!isConnected || isAttacking || !canAttack}
          className={`px-16 py-6 text-4xl font-bold tracking-wider transition-all duration-200 relative overflow-hidden z-10 ${
            !isConnected || isAttacking || !canAttack
              ? "bg-gray-600 text-gray-400 cursor-not-allowed rounded-xl"
              : "holographic-button organic-button text-white hover:scale-110 hover:shadow-2xl hover:shadow-red-400/80 animate-pulse-glow hover-ripple hover-color-shift hover-morph"
          }`}
        >
          {!isConnected || isAttacking || !canAttack ? null : (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          )}
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
          disabled={!isConnected}
          className={`px-16 py-6 text-4xl font-bold tracking-wider transition-all duration-200 relative overflow-hidden z-10 ${
            !isConnected
              ? "bg-gray-600 text-gray-400 cursor-not-allowed rounded-xl"
              : "holographic-button organic-button text-white hover:scale-110 hover:shadow-2xl hover:shadow-green-400/80 animate-pulse-glow hover-ripple hover-cosmic-pulse hover-morph"
          }`}
        >
          {!isConnected ? null : (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          )}
          <span className="relative z-10">
            {!isConnected ? "CONNECT WALLET" : "🏆 CLAIM REWARD 🏆"}
          </span>
        </button>
      )}

      {/* Already Claimed */}
      {!bossState.isAlive && hasClaimedReward && (
        <div className="glass-panel border-2 border-green-500/50 rounded-xl p-6 text-center">
          <p className="text-green-400 text-2xl font-bold">✅ Reward Already Claimed! ✅</p>
          <p className="text-green-400 text-lg mt-2">Wait for boss respawn to earn more rewards!</p>
        </div>
      )}

      {/* Reward Pool Info */}
      <div className="w-full glass-panel border-2 border-yellow-400/50 rounded-xl p-6">
        <h3 className="text-2xl font-alien text-yellow-400 text-center mb-4 hex-pattern">💰 REWARD POOL 💰</h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-yellow-400 text-lg font-electro">Total Pool Size:</p>
            <p className="text-2xl font-bold text-yellow-400">{REWARD_POOL_SIZE.toLocaleString()} GMB</p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-yellow-400 text-lg font-electro">Distribution Method:</p>
            <p className="text-xl font-bold text-yellow-400">By Damage %</p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-yellow-400 text-lg font-electro">Attack Damage Range:</p>
            <p className="text-xl font-bold text-yellow-400">{MIN_DAMAGE.toLocaleString()} - {MAX_DAMAGE.toLocaleString()} HP</p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-yellow-400 text-lg font-electro">Critical Hit Chance:</p>
            <p className="text-xl font-bold text-yellow-400">10% (2x Damage)</p>
          </div>
        </div>
      </div>

      {/* Battle Info */}
      <div className="w-full text-red-400 text-sm text-center max-w-3xl glass-panel p-6 rounded-xl border-2 border-red-400/50">
        <p className="font-bold mb-3 text-2xl font-iceland circuit-text">ℹ️ Battle Info ℹ️</p>
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
