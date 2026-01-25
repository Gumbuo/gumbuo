import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const USER_DATA_KEY_PREFIX = "gumbuo:user_data:";

// Initialize Redis client with Vercel KV environment variables
const redis = Redis.fromEnv();

interface OwnedAlien {
  id: string;
  picId: string;
  name: string;
  image: string;
  purchasedAt: number;
}

interface AttackLevels {
  normal: number;
  power: number;
  ultimate: number;
}

interface BossCooldowns {
  powerAttackTime: number;
  ultimateAttackTime: number;
}

interface StakingData {
  isStaking: boolean;
  stakedAmount: number;
  stakeStartTime: number;
  lastClaimTime: number;
}

interface ClaimHistory {
  timestamp: number;
  type: 'staking' | 'faucet';
  amount: number;
  gmbHeldAtClaim: number;
}

interface GMBHoldings {
  base: number;
  abstract: number;
  arbitrum: number;
  blast: number;
  total: number;
  lastUpdated: number;
}

interface GameStats {
  aliensPurchased: number;
  apSpentOnAliens: number;
  arenaBattlesFought: number;
  arenaBattlesWon: number;
  arenaBattlesLost: number;
  bossAttacksTotal: number;
  bossAPSpent: number;
  bossDamageDealt: number;
  normalAttacksUsed: number;
  powerAttacksUsed: number;
  ultimateAttacksUsed: number;
  chessGamesPlayed: number;
  chessGamesWon: number;
  chessGamesLost: number;
  chessEthWon: number;
  mazeLevelsCompleted: number;
  mazeHighestLevel: number;
  mazeTotalScore: number;
  mazeAPEarned: number;
  // Gumbuo Invasion stats
  invasionGamesPlayed: number;
  invasionTotalKills: number;
  invasionAPEarned: number;
  invasionHighScore: number;
  // Dungeon Crawler stats
  dungeonGamesPlayed: number;
  dungeonTotalKills: number;
  dungeonAPEarned: number;
  dungeonHighestFloor: number;
  dungeonTotalGold: number;
}

interface MazeProgress {
  currentLevel: number;
  sessionScore: number;
  levelsCompletedThisSession: number;
  lastPlayed: number;
}

interface UserGameData {
  ownedAliens: OwnedAlien[];
  attackLevels: AttackLevels;
  bossRewardClaimed: boolean;
  bossCooldowns: BossCooldowns;
  stakingData: StakingData;
  lastDripClaim: number;
  lastUpdated: number;
  claimHistory: ClaimHistory[];
  gmbHoldings: GMBHoldings;
  totalStakingClaims: number;
  totalFaucetClaims: number;
  gameStats: GameStats;
  mazeProgress: MazeProgress;
}

const EMPTY_USER_DATA: UserGameData = {
  ownedAliens: [],
  attackLevels: { normal: 1, power: 1, ultimate: 1 },
  bossRewardClaimed: false,
  bossCooldowns: { powerAttackTime: 0, ultimateAttackTime: 0 },
  stakingData: { isStaking: false, stakedAmount: 0, stakeStartTime: 0, lastClaimTime: 0 },
  lastDripClaim: 0,
  lastUpdated: Date.now(),
  claimHistory: [],
  gmbHoldings: { base: 0, abstract: 0, arbitrum: 0, blast: 0, total: 0, lastUpdated: Date.now() },
  totalStakingClaims: 0,
  totalFaucetClaims: 0,
  gameStats: {
    aliensPurchased: 0,
    apSpentOnAliens: 0,
    arenaBattlesFought: 0,
    arenaBattlesWon: 0,
    arenaBattlesLost: 0,
    bossAttacksTotal: 0,
    bossAPSpent: 0,
    bossDamageDealt: 0,
    normalAttacksUsed: 0,
    powerAttacksUsed: 0,
    ultimateAttacksUsed: 0,
    chessGamesPlayed: 0,
    chessGamesWon: 0,
    chessGamesLost: 0,
    chessEthWon: 0,
    mazeLevelsCompleted: 0,
    mazeHighestLevel: 0,
    mazeTotalScore: 0,
    mazeAPEarned: 0,
    invasionGamesPlayed: 0,
    invasionTotalKills: 0,
    invasionAPEarned: 0,
    invasionHighScore: 0,
    dungeonGamesPlayed: 0,
    dungeonTotalKills: 0,
    dungeonAPEarned: 0,
    dungeonHighestFloor: 0,
    dungeonTotalGold: 0,
  },
  mazeProgress: {
    currentLevel: 1,
    sessionScore: 0,
    levelsCompletedThisSession: 0,
    lastPlayed: 0,
  },
};

// GET /api/user-data?wallet=0x... - Fetch user's game data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const userDataKey = `${USER_DATA_KEY_PREFIX}${normalizedWallet}`;

    const userData = await redis.get<UserGameData>(userDataKey) || EMPTY_USER_DATA;

    return NextResponse.json({
      success: true,
      userData,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

// POST /api/user-data - Update user's game data (partial updates supported)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, ...updates } = body;

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const userDataKey = `${USER_DATA_KEY_PREFIX}${normalizedWallet}`;

    // Fetch current data
    const currentData = await redis.get<UserGameData>(userDataKey) || EMPTY_USER_DATA;

    // Merge updates with current data
    const updatedData: UserGameData = {
      ...currentData,
      ...updates,
      lastUpdated: Date.now(),
    };

    // Save to Redis
    await redis.set(userDataKey, updatedData);

    return NextResponse.json({
      success: true,
      userData: updatedData,
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user data" },
      { status: 500 }
    );
  }
}

// PATCH /api/user-data - Add a claim to history
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, type, amount, gmbHoldings } = body;

    if (!wallet || !type || amount === undefined) {
      return NextResponse.json(
        { success: false, error: "wallet, type, and amount are required" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const userDataKey = `${USER_DATA_KEY_PREFIX}${normalizedWallet}`;

    // Fetch current data
    const currentData = await redis.get<UserGameData>(userDataKey) || EMPTY_USER_DATA;

    // Add new claim to history
    const newClaim: ClaimHistory = {
      timestamp: Date.now(),
      type,
      amount,
      gmbHeldAtClaim: gmbHoldings?.total || 0,
    };

    const updatedClaimHistory = [...(currentData.claimHistory || []), newClaim];

    // Update totals
    const totalStakingClaims = type === 'staking'
      ? (currentData.totalStakingClaims || 0) + amount
      : (currentData.totalStakingClaims || 0);

    const totalFaucetClaims = type === 'faucet'
      ? (currentData.totalFaucetClaims || 0) + amount
      : (currentData.totalFaucetClaims || 0);

    // Update GMB holdings if provided
    const updatedGMBHoldings = gmbHoldings || currentData.gmbHoldings;

    // Merge updates
    const updatedData: UserGameData = {
      ...currentData,
      claimHistory: updatedClaimHistory,
      gmbHoldings: updatedGMBHoldings,
      totalStakingClaims,
      totalFaucetClaims,
      lastUpdated: Date.now(),
    };

    // Save to Redis
    await redis.set(userDataKey, updatedData);

    return NextResponse.json({
      success: true,
      userData: updatedData,
      claim: newClaim,
    });
  } catch (error) {
    console.error("Error recording claim:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record claim" },
      { status: 500 }
    );
  }
}

// PUT /api/user-data - Update game stats (increment values)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, statUpdates } = body;

    if (!wallet || !statUpdates) {
      return NextResponse.json(
        { success: false, error: "wallet and statUpdates are required" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const userDataKey = `${USER_DATA_KEY_PREFIX}${normalizedWallet}`;

    // Fetch current data
    const currentData = await redis.get<UserGameData>(userDataKey) || EMPTY_USER_DATA;

    // Ensure gameStats exists
    if (!currentData.gameStats) {
      currentData.gameStats = {
        aliensPurchased: 0,
        apSpentOnAliens: 0,
        arenaBattlesFought: 0,
        arenaBattlesWon: 0,
        arenaBattlesLost: 0,
        bossAttacksTotal: 0,
        bossAPSpent: 0,
        bossDamageDealt: 0,
        normalAttacksUsed: 0,
        powerAttacksUsed: 0,
        ultimateAttacksUsed: 0,
        chessGamesPlayed: 0,
        chessGamesWon: 0,
        chessGamesLost: 0,
        chessEthWon: 0,
        mazeLevelsCompleted: 0,
        mazeHighestLevel: 0,
        mazeTotalScore: 0,
        mazeAPEarned: 0,
        invasionGamesPlayed: 0,
        invasionTotalKills: 0,
        invasionAPEarned: 0,
        invasionHighScore: 0,
        dungeonGamesPlayed: 0,
        dungeonTotalKills: 0,
        dungeonAPEarned: 0,
        dungeonHighestFloor: 0,
        dungeonTotalGold: 0,
      };
    }

    // Update stats by incrementing
    const updatedStats = { ...currentData.gameStats };
    for (const [key, value] of Object.entries(statUpdates)) {
      // Initialize field to 0 if it doesn't exist yet
      if (!(key in updatedStats)) {
        (updatedStats as any)[key] = 0;
      }
      updatedStats[key as keyof GameStats] += value as number;
    }

    const updatedData: UserGameData = {
      ...currentData,
      gameStats: updatedStats,
      lastUpdated: Date.now(),
    };

    // Save to Redis
    await redis.set(userDataKey, updatedData);

    return NextResponse.json({
      success: true,
      userData: updatedData,
    });
  } catch (error) {
    console.error("Error updating game stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update game stats" },
      { status: 500 }
    );
  }
}

// DELETE /api/user-data?wallet=0x... - Clear user's game data (for testing/migration)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const userDataKey = `${USER_DATA_KEY_PREFIX}${normalizedWallet}`;

    await redis.set(userDataKey, EMPTY_USER_DATA);

    return NextResponse.json({
      success: true,
      message: "User data reset",
    });
  } catch (error) {
    console.error("Error deleting user data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user data" },
      { status: 500 }
    );
  }
}
