import { NextRequest, NextResponse } from "next/server";
import { getRedis, getUserBalance } from "../lib/points";
import { getPlayerLevel } from "../lib/playerLevel";

// Key prefixes for data retrieval
const USER_DATA_KEY_PREFIX = "gumbuo:user_data:";
const FISHING_KEY_PREFIX = "gumbuo:fishing:";
const ARMORY_SAVE_PREFIX = "armory:save:";
const EVENT_STREAK_PREFIX = "gumbuo:event:streak:";

// Milestone definitions
const AP_MILESTONES = [
  { name: "Bronze", ap: 10000, shares: 1 },
  { name: "Silver", ap: 50000, shares: 3 },
  { name: "Gold", ap: 100000, shares: 5 },
  { name: "Platinum", ap: 250000, shares: 10 },
  { name: "Diamond", ap: 500000, shares: 20 },
];

const LEVEL_MILESTONES = [
  { name: "Novice", level: 5, shares: 1 },
  { name: "Apprentice", level: 10, shares: 3 },
  { name: "Veteran", level: 20, shares: 5 },
  { name: "Elite", level: 35, shares: 10 },
  { name: "Legend", level: 50, shares: 25 },
];

const STREAK_MILESTONES = [
  { name: "Consistent", days: 7, shares: 2 },
  { name: "Dedicated", days: 14, shares: 5 },
  { name: "Committed", days: 21, shares: 10 },
  { name: "Devoted", days: 30, shares: 20 },
];

// Game stats milestone requirements
const GAME_STATS_REQUIREMENTS = {
  explorer: { gamesPlayed: 5 }, // All 5 games
  hunter: { totalKills: 100 },
  crafter: { itemsCrafted: 10 },
  fisher: { totalCasts: 50 },
};

interface UserGameData {
  gameStats?: {
    invasionGamesPlayed?: number;
    invasionTotalKills?: number;
    dungeonGamesPlayed?: number;
    dungeonTotalKills?: number;
    mazeLevelsCompleted?: number;
    arenaBattlesFought?: number;
    [key: string]: number | undefined;
  };
  [key: string]: unknown;
}

interface FishingState {
  totalCasts?: number;
  [key: string]: unknown;
}

interface ArmoryProgress {
  totalItemsCrafted?: number;
  [key: string]: unknown;
}

interface ArmorySaveState {
  progress?: ArmoryProgress;
  [key: string]: unknown;
}

interface EventStreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  activityDates: string[];
}

interface GameStatsProgress {
  explorer: { completed: boolean; gamesPlayed: number; required: number };
  hunter: { completed: boolean; totalKills: number; required: number };
  crafter: { completed: boolean; itemsCrafted: number; required: number };
  fisher: { completed: boolean; totalCasts: number; required: number };
  master: { completed: boolean };
  totalShares: number;
}

interface MilestoneProgress {
  ap: {
    currentAP: number;
    milestones: Array<{ name: string; required: number; reached: boolean; shares: number }>;
    totalShares: number;
  };
  gameStats: GameStatsProgress;
  level: {
    currentLevel: number;
    milestones: Array<{ name: string; required: number; reached: boolean; shares: number }>;
    totalShares: number;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    milestones: Array<{ name: string; required: number; reached: boolean; shares: number }>;
    totalShares: number;
  };
  totalShares: number;
}

// GET /api/event?wallet=0x... - Get player's event progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 400 }
      );
    }

    const redis = getRedis();
    const normalizedWallet = wallet.toLowerCase();

    // Fetch all relevant data in parallel
    const [
      apBalance,
      playerLevelData,
      userData,
      fishingData,
      armoryData,
      streakData,
    ] = await Promise.all([
      getUserBalance(normalizedWallet),
      getPlayerLevel(normalizedWallet),
      redis.get<UserGameData>(`${USER_DATA_KEY_PREFIX}${normalizedWallet}`),
      redis.get<FishingState>(`${FISHING_KEY_PREFIX}${normalizedWallet}`),
      redis.get<ArmorySaveState>(`${ARMORY_SAVE_PREFIX}${normalizedWallet}`),
      redis.get<EventStreakData>(`${EVENT_STREAK_PREFIX}${normalizedWallet}`),
    ]);

    // Calculate AP milestone progress
    const apProgress = {
      currentAP: apBalance,
      milestones: AP_MILESTONES.map((m) => ({
        name: m.name,
        required: m.ap,
        reached: apBalance >= m.ap,
        shares: m.shares,
      })),
      totalShares: AP_MILESTONES.filter((m) => apBalance >= m.ap).reduce(
        (sum, m) => sum + m.shares,
        0
      ),
    };

    // Calculate game stats milestone progress
    const gameStats = userData?.gameStats || {};
    const totalKills =
      (gameStats.invasionTotalKills || 0) + (gameStats.dungeonTotalKills || 0);
    const totalCasts = fishingData?.totalCasts || 0;
    const itemsCrafted = armoryData?.progress?.totalItemsCrafted || 0;

    // Count unique games played
    const gamesPlayedCount = [
      (gameStats.invasionGamesPlayed || 0) > 0,
      (gameStats.dungeonGamesPlayed || 0) > 0,
      (gameStats.mazeLevelsCompleted || 0) > 0,
      (gameStats.arenaBattlesFought || 0) > 0,
      totalCasts > 0 || itemsCrafted > 0, // Alien Base (Armory or Pond)
    ].filter(Boolean).length;

    const explorerComplete = gamesPlayedCount >= 5;
    const hunterComplete = totalKills >= GAME_STATS_REQUIREMENTS.hunter.totalKills;
    const crafterComplete = itemsCrafted >= GAME_STATS_REQUIREMENTS.crafter.itemsCrafted;
    const fisherComplete = totalCasts >= GAME_STATS_REQUIREMENTS.fisher.totalCasts;
    const masterComplete =
      explorerComplete && hunterComplete && crafterComplete && fisherComplete;

    let gameStatsShares = 0;
    if (explorerComplete) gameStatsShares += 1;
    if (hunterComplete) gameStatsShares += 3;
    if (crafterComplete) gameStatsShares += 3;
    if (fisherComplete) gameStatsShares += 3;
    if (masterComplete) gameStatsShares += 10;

    const gameStatsProgress: GameStatsProgress = {
      explorer: {
        completed: explorerComplete,
        gamesPlayed: gamesPlayedCount,
        required: 5,
      },
      hunter: {
        completed: hunterComplete,
        totalKills,
        required: GAME_STATS_REQUIREMENTS.hunter.totalKills,
      },
      crafter: {
        completed: crafterComplete,
        itemsCrafted,
        required: GAME_STATS_REQUIREMENTS.crafter.itemsCrafted,
      },
      fisher: {
        completed: fisherComplete,
        totalCasts,
        required: GAME_STATS_REQUIREMENTS.fisher.totalCasts,
      },
      master: { completed: masterComplete },
      totalShares: gameStatsShares,
    };

    // Calculate level milestone progress
    const currentLevel = playerLevelData.level;
    const levelProgress = {
      currentLevel,
      milestones: LEVEL_MILESTONES.map((m) => ({
        name: m.name,
        required: m.level,
        reached: currentLevel >= m.level,
        shares: m.shares,
      })),
      totalShares: LEVEL_MILESTONES.filter((m) => currentLevel >= m.level).reduce(
        (sum, m) => sum + m.shares,
        0
      ),
    };

    // Calculate streak milestone progress
    const currentStreak = streakData?.currentStreak || 0;
    const longestStreak = streakData?.longestStreak || currentStreak;
    const streakProgress = {
      currentStreak,
      longestStreak,
      milestones: STREAK_MILESTONES.map((m) => ({
        name: m.name,
        required: m.days,
        reached: longestStreak >= m.days,
        shares: m.shares,
      })),
      totalShares: STREAK_MILESTONES.filter((m) => longestStreak >= m.days).reduce(
        (sum, m) => sum + m.shares,
        0
      ),
    };

    // Calculate total shares
    const totalShares =
      apProgress.totalShares +
      gameStatsProgress.totalShares +
      levelProgress.totalShares +
      streakProgress.totalShares;

    const progress: MilestoneProgress = {
      ap: apProgress,
      gameStats: gameStatsProgress,
      level: levelProgress,
      streak: streakProgress,
      totalShares,
    };

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Error fetching event progress:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event progress" },
      { status: 500 }
    );
  }
}
