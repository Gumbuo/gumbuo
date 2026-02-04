import { NextRequest, NextResponse } from "next/server";
import { getRedis, getUserBalance } from "../../lib/points";
import { getPlayerLevel } from "../../lib/playerLevel";

const EVENT_CLAIMS_PREFIX = "gumbuo:event:claims:";
const USER_DATA_KEY_PREFIX = "gumbuo:user_data:";
const FISHING_KEY_PREFIX = "gumbuo:fishing:";
const ARMORY_SAVE_PREFIX = "armory:save:";
const EVENT_STREAK_PREFIX = "gumbuo:event:streak:";

// Milestone definitions with IDs
const AP_MILESTONES = [
  { id: "ap_bronze", name: "Bronze", ap: 10000, shares: 1 },
  { id: "ap_silver", name: "Silver", ap: 50000, shares: 3 },
  { id: "ap_gold", name: "Gold", ap: 100000, shares: 5 },
  { id: "ap_platinum", name: "Platinum", ap: 250000, shares: 10 },
  { id: "ap_diamond", name: "Diamond", ap: 500000, shares: 20 },
];

const LEVEL_MILESTONES = [
  { id: "level_novice", name: "Novice", level: 5, shares: 1 },
  { id: "level_apprentice", name: "Apprentice", level: 10, shares: 3 },
  { id: "level_veteran", name: "Veteran", level: 20, shares: 5 },
  { id: "level_elite", name: "Elite", level: 35, shares: 10 },
  { id: "level_legend", name: "Legend", level: 50, shares: 25 },
];

const GAME_STATS_MILESTONES = [
  { id: "game_explorer", name: "Explorer", shares: 1 },
  { id: "game_hunter", name: "Hunter", shares: 3 },
  { id: "game_crafter", name: "Crafter", shares: 3 },
  { id: "game_fisher", name: "Fisher", shares: 3 },
  { id: "game_master", name: "Master", shares: 10 },
];

const STREAK_MILESTONES = [
  { id: "streak_consistent", name: "Consistent", days: 7, shares: 2 },
  { id: "streak_dedicated", name: "Dedicated", days: 14, shares: 5 },
  { id: "streak_committed", name: "Committed", days: 21, shares: 10 },
  { id: "streak_devoted", name: "Devoted", days: 30, shares: 20 },
];

interface ClaimsData {
  claimedMilestones: string[];
  totalSharesClaimed: number;
  lastClaimed: number;
}

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
}

function getClaimsKey(wallet: string): string {
  return `${EVENT_CLAIMS_PREFIX}${wallet.toLowerCase()}`;
}

// GET /api/event/claim?wallet=0x... - Get claimed milestones
export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get("wallet");
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Missing wallet" },
        { status: 400 }
      );
    }

    const redis = getRedis();
    const claimsKey = getClaimsKey(wallet);
    const claims = await redis.get<ClaimsData>(claimsKey);

    return NextResponse.json({
      success: true,
      data: claims || {
        claimedMilestones: [],
        totalSharesClaimed: 0,
        lastClaimed: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching claims:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}

// POST /api/event/claim - Claim a milestone
export async function POST(request: NextRequest) {
  try {
    const { wallet, milestoneId } = await request.json();

    if (!wallet || !milestoneId) {
      return NextResponse.json(
        { success: false, error: "Missing wallet or milestoneId" },
        { status: 400 }
      );
    }

    const redis = getRedis();
    const normalizedWallet = wallet.toLowerCase();
    const claimsKey = getClaimsKey(normalizedWallet);

    // Get current claims
    let claims = await redis.get<ClaimsData>(claimsKey);
    if (!claims) {
      claims = {
        claimedMilestones: [],
        totalSharesClaimed: 0,
        lastClaimed: 0,
      };
    }

    // Check if already claimed
    if (claims.claimedMilestones.includes(milestoneId)) {
      return NextResponse.json({
        success: false,
        error: "Milestone already claimed",
      });
    }

    // Verify milestone is actually completed
    const isCompleted = await verifyMilestoneCompletion(redis, normalizedWallet, milestoneId);
    if (!isCompleted.completed) {
      return NextResponse.json({
        success: false,
        error: isCompleted.reason || "Milestone not completed",
      });
    }

    // Find the milestone shares
    let shares = 0;
    const allMilestones = [
      ...AP_MILESTONES,
      ...LEVEL_MILESTONES,
      ...GAME_STATS_MILESTONES,
      ...STREAK_MILESTONES,
    ];
    const milestone = allMilestones.find(m => m.id === milestoneId);
    if (milestone) {
      shares = milestone.shares;
    }

    // Record the claim
    claims.claimedMilestones.push(milestoneId);
    claims.totalSharesClaimed += shares;
    claims.lastClaimed = Date.now();

    await redis.set(claimsKey, claims);

    return NextResponse.json({
      success: true,
      data: {
        milestoneId,
        shares,
        totalSharesClaimed: claims.totalSharesClaimed,
        claimedMilestones: claims.claimedMilestones,
      },
    });
  } catch (error) {
    console.error("Error claiming milestone:", error);
    return NextResponse.json(
      { success: false, error: "Failed to claim milestone" },
      { status: 500 }
    );
  }
}

async function verifyMilestoneCompletion(
  redis: ReturnType<typeof getRedis>,
  wallet: string,
  milestoneId: string
): Promise<{ completed: boolean; reason?: string }> {
  // AP Milestones
  if (milestoneId.startsWith("ap_")) {
    const apBalance = await getUserBalance(wallet);
    const milestone = AP_MILESTONES.find(m => m.id === milestoneId);
    if (!milestone) return { completed: false, reason: "Invalid milestone" };
    if (apBalance >= milestone.ap) {
      return { completed: true };
    }
    return { completed: false, reason: `Need ${milestone.ap.toLocaleString()} AP (have ${apBalance.toLocaleString()})` };
  }

  // Level Milestones
  if (milestoneId.startsWith("level_")) {
    const levelData = await getPlayerLevel(wallet);
    const milestone = LEVEL_MILESTONES.find(m => m.id === milestoneId);
    if (!milestone) return { completed: false, reason: "Invalid milestone" };
    if (levelData.level >= milestone.level) {
      return { completed: true };
    }
    return { completed: false, reason: `Need level ${milestone.level} (currently level ${levelData.level})` };
  }

  // Streak Milestones
  if (milestoneId.startsWith("streak_")) {
    const streakData = await redis.get<EventStreakData>(`${EVENT_STREAK_PREFIX}${wallet}`);
    const longestStreak = streakData?.longestStreak || 0;
    const milestone = STREAK_MILESTONES.find(m => m.id === milestoneId);
    if (!milestone) return { completed: false, reason: "Invalid milestone" };
    if (longestStreak >= milestone.days) {
      return { completed: true };
    }
    return { completed: false, reason: `Need ${milestone.days} day streak (best: ${longestStreak} days)` };
  }

  // Game Stats Milestones
  if (milestoneId.startsWith("game_")) {
    const userData = await redis.get<UserGameData>(`${USER_DATA_KEY_PREFIX}${wallet}`);
    const fishingData = await redis.get<FishingState>(`${FISHING_KEY_PREFIX}${wallet}`);
    const armoryData = await redis.get<ArmorySaveState>(`${ARMORY_SAVE_PREFIX}${wallet}`);

    const gameStats = userData?.gameStats || {};
    const totalKills = (gameStats.invasionTotalKills || 0) + (gameStats.dungeonTotalKills || 0);
    const totalCasts = fishingData?.totalCasts || 0;
    const itemsCrafted = armoryData?.progress?.totalItemsCrafted || 0;

    const gamesPlayedCount = [
      (gameStats.invasionGamesPlayed || 0) > 0,
      (gameStats.dungeonGamesPlayed || 0) > 0,
      (gameStats.mazeLevelsCompleted || 0) > 0,
      (gameStats.arenaBattlesFought || 0) > 0,
      totalCasts > 0 || itemsCrafted > 0,
    ].filter(Boolean).length;

    switch (milestoneId) {
      case "game_explorer":
        if (gamesPlayedCount >= 5) return { completed: true };
        return { completed: false, reason: `Play all 5 games (${gamesPlayedCount}/5)` };

      case "game_hunter":
        if (totalKills >= 100) return { completed: true };
        return { completed: false, reason: `Get 100 kills (${totalKills}/100)` };

      case "game_crafter":
        if (itemsCrafted >= 10) return { completed: true };
        return { completed: false, reason: `Craft 10 items (${itemsCrafted}/10)` };

      case "game_fisher":
        if (totalCasts >= 50) return { completed: true };
        return { completed: false, reason: `Cast 50 times (${totalCasts}/50)` };

      case "game_master":
        const explorerDone = gamesPlayedCount >= 5;
        const hunterDone = totalKills >= 100;
        const crafterDone = itemsCrafted >= 10;
        const fisherDone = totalCasts >= 50;
        if (explorerDone && hunterDone && crafterDone && fisherDone) {
          return { completed: true };
        }
        return { completed: false, reason: "Complete all other game milestones first" };
    }
  }

  return { completed: false, reason: "Unknown milestone" };
}
