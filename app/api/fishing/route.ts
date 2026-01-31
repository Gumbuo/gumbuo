import { NextRequest, NextResponse } from "next/server";
import { getRedis, addUserPoints, getUserBalance } from "../lib/points";
import { addPlayerXP } from "../lib/playerLevel";
import { ArmorySaveState } from "../../base/components/armory/types";

const FISHING_KEY_PREFIX = "gumbuo:fishing:";
const ARMORY_SAVE_PREFIX = "armory:save:";
const FISHING_LEADERBOARD_KEY = "gumbuo:fishing:leaderboard";
const MAX_CASTS_PER_DAY = 20;
const XP_PER_CAST = 10;

interface FishingState {
  castsRemaining: number;
  totalCasts: number;
  totalFishCaught: number;
  lastCastDate: string;
  catchLog: CatchEntry[];
  totalAPEarned: number;
  totalResourcesEarned: number;
  totalRareCatches: number;
}

interface CatchEntry {
  reward: string;
  icon: string;
  amount: number;
  label: string;
  timestamp: number;
  rare?: boolean;
}

interface LootEntry {
  weight: number;
  type: "ap" | "resource";
  resourceKey?: string;
  minAmount: number;
  maxAmount: number;
  label: string;
  icon: string;
  rare?: boolean;
}

const LOOT_TABLE: LootEntry[] = [
  { weight: 30, type: "ap", minAmount: 50, maxAmount: 200, label: "Alien Points", icon: "✨" },
  { weight: 18, type: "resource", resourceKey: "plasmaOre", minAmount: 1, maxAmount: 3, label: "Plasma Ore", icon: "🟢" },
  { weight: 14, type: "resource", resourceKey: "voidCrystal", minAmount: 1, maxAmount: 2, label: "Void Crystal", icon: "🔮" },
  { weight: 14, type: "resource", resourceKey: "bioMetal", minAmount: 1, maxAmount: 2, label: "Bio-Metal", icon: "🧬" },
  { weight: 10, type: "resource", resourceKey: "quantumDust", minAmount: 1, maxAmount: 1, label: "Quantum Dust", icon: "✨" },
  { weight: 6, type: "resource", resourceKey: "nebulaEssence", minAmount: 1, maxAmount: 1, label: "Nebula Essence", icon: "🌌" },
  { weight: 4, type: "resource", resourceKey: "refinedPlasma", minAmount: 1, maxAmount: 1, label: "Refined Plasma", icon: "💚" },
  { weight: 2, type: "resource", resourceKey: "voidShard", minAmount: 1, maxAmount: 1, label: "Void Shard", icon: "💎", rare: true },
  { weight: 1, type: "resource", resourceKey: "quantumCore", minAmount: 1, maxAmount: 1, label: "Quantum Core", icon: "⚛️", rare: true },
  { weight: 1, type: "ap", minAmount: 1000, maxAmount: 1000, label: "JACKPOT! Alien Points", icon: "🎰", rare: true },
];

const TOTAL_WEIGHT = LOOT_TABLE.reduce((sum, e) => sum + e.weight, 0);

function rollLoot(): LootEntry & { rolledAmount: number } {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const entry of LOOT_TABLE) {
    roll -= entry.weight;
    if (roll <= 0) {
      const amount = entry.minAmount + Math.floor(Math.random() * (entry.maxAmount - entry.minAmount + 1));
      return { ...entry, rolledAmount: amount };
    }
  }
  // Fallback
  const fallback = LOOT_TABLE[0];
  return { ...fallback, rolledAmount: fallback.minAmount };
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getFishingKey(wallet: string): string {
  return `${FISHING_KEY_PREFIX}${wallet.toLowerCase()}`;
}

function getArmorySaveKey(wallet: string): string {
  return `${ARMORY_SAVE_PREFIX}${wallet.toLowerCase()}`;
}

function getDefaultState(): FishingState {
  return {
    castsRemaining: MAX_CASTS_PER_DAY,
    totalCasts: 0,
    totalFishCaught: 0,
    lastCastDate: getTodayDate(),
    catchLog: [],
    totalAPEarned: 0,
    totalResourcesEarned: 0,
    totalRareCatches: 0,
  };
}

// Ensure existing states have the new cumulative fields
function migrateCumulativeFields(state: FishingState): FishingState {
  if (state.totalAPEarned === undefined) state.totalAPEarned = 0;
  if (state.totalResourcesEarned === undefined) state.totalResourcesEarned = 0;
  if (state.totalRareCatches === undefined) state.totalRareCatches = 0;
  return state;
}

// Reset casts if it's a new day
function checkDailyReset(state: FishingState): FishingState {
  const today = getTodayDate();
  if (state.lastCastDate !== today) {
    state.castsRemaining = MAX_CASTS_PER_DAY;
    state.lastCastDate = today;
  }
  return state;
}

// GET /api/fishing?wallet=0x...
export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get("wallet");
    if (!wallet) {
      return NextResponse.json({ success: false, error: "Missing wallet" }, { status: 400 });
    }

    const redis = getRedis();
    const key = getFishingKey(wallet);
    let state = await redis.get<FishingState>(key);

    if (!state) {
      state = getDefaultState();
      await redis.set(key, state);
    } else {
      state = migrateCumulativeFields(state);
      state = checkDailyReset(state);
    }

    const apBalance = await getUserBalance(wallet);

    return NextResponse.json({
      success: true,
      data: {
        ...state,
        maxCasts: MAX_CASTS_PER_DAY,
        apBalance,
      },
    });
  } catch (error) {
    console.error("Error in fishing GET:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch fishing state" }, { status: 500 });
  }
}

// POST /api/fishing — perform a cast
export async function POST(request: NextRequest) {
  try {
    const { wallet } = await request.json();
    if (!wallet) {
      return NextResponse.json({ success: false, error: "Missing wallet" }, { status: 400 });
    }

    const redis = getRedis();
    const key = getFishingKey(wallet);
    const normalizedWallet = wallet.toLowerCase();

    let state = await redis.get<FishingState>(key);
    if (!state) {
      state = getDefaultState();
    } else {
      state = migrateCumulativeFields(state);
      state = checkDailyReset(state);
    }

    if (state.castsRemaining <= 0) {
      return NextResponse.json({
        success: false,
        error: "No casts remaining today. Come back tomorrow!",
      });
    }

    // Roll the loot
    const loot = rollLoot();

    let newApBalance: number | undefined;

    if (loot.type === "ap") {
      // Award Alien Points
      newApBalance = await addUserPoints(normalizedWallet, loot.rolledAmount);
    } else if (loot.type === "resource" && loot.resourceKey) {
      // Add to armory inventory
      const armoryKey = getArmorySaveKey(wallet);
      const saveState = await redis.get<ArmorySaveState>(armoryKey);

      if (saveState) {
        const resKey = loot.resourceKey as keyof typeof saveState.resources;
        saveState.resources[resKey] = (saveState.resources[resKey] || 0) + loot.rolledAmount;
        saveState.lastUpdated = Date.now();
        await redis.set(armoryKey, saveState);
      } else {
        // No armory save yet — create a minimal resource stash stored under armory key
        // They'll get their full armory save when they visit the armory
        // For now, just skip adding to armory if no save exists
        // Convert to AP instead as a fallback
        const fallbackAP = loot.rolledAmount * 50;
        newApBalance = await addUserPoints(normalizedWallet, fallbackAP);
        loot.label = `${loot.label} (as ${fallbackAP} AP)`;
        loot.icon = "✨";
      }

      if (newApBalance === undefined) {
        newApBalance = await getUserBalance(normalizedWallet);
      }
    }

    // Award XP
    const xpResult = await addPlayerXP(wallet, XP_PER_CAST, "fishing");

    // Update state
    state.castsRemaining--;
    state.totalCasts++;
    state.totalFishCaught++;

    // Track cumulative stats
    if (loot.type === "ap") {
      state.totalAPEarned += loot.rolledAmount;
    } else if (loot.type === "resource") {
      state.totalResourcesEarned += loot.rolledAmount;
    }
    if (loot.rare) {
      state.totalRareCatches++;
    }

    const catchEntry: CatchEntry = {
      reward: loot.type === "ap" ? "ap" : loot.resourceKey || "unknown",
      icon: loot.icon,
      amount: loot.rolledAmount,
      label: loot.label,
      timestamp: Date.now(),
      rare: loot.rare,
    };

    state.catchLog.unshift(catchEntry);
    if (state.catchLog.length > 5) {
      state.catchLog = state.catchLog.slice(0, 5);
    }

    await redis.set(key, state);

    // Update leaderboard sorted set
    await redis.zincrby(FISHING_LEADERBOARD_KEY, 1, normalizedWallet);

    return NextResponse.json({
      success: true,
      data: {
        reward: catchEntry,
        castsRemaining: state.castsRemaining,
        maxCasts: MAX_CASTS_PER_DAY,
        totalCasts: state.totalCasts,
        totalAPEarned: state.totalAPEarned,
        totalResourcesEarned: state.totalResourcesEarned,
        totalRareCatches: state.totalRareCatches,
        catchLog: state.catchLog,
        apBalance: newApBalance,
        playerLevel: {
          level: xpResult.levelData.level,
          xp: xpResult.levelData.xp,
          xpAdded: xpResult.xpAdded,
          levelsGained: xpResult.levelsGained,
          apRewarded: xpResult.apRewarded,
        },
      },
    });
  } catch (error) {
    console.error("Error in fishing POST:", error);
    return NextResponse.json({ success: false, error: "Failed to cast line" }, { status: 500 });
  }
}
