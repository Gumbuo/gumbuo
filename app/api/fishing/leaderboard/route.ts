import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "../../lib/points";

const FISHING_KEY_PREFIX = "gumbuo:fishing:";
const FISHING_LEADERBOARD_KEY = "gumbuo:fishing:leaderboard";

interface FishingState {
  castsRemaining: number;
  totalCasts: number;
  totalFishCaught: number;
  lastCastDate: string;
  catchLog: unknown[];
  totalAPEarned: number;
  totalResourcesEarned: number;
  totalRareCatches: number;
}

interface LeaderboardEntry {
  rank: number;
  wallet: string;
  totalCasts: number;
  totalAPEarned: number;
  totalResourcesEarned: number;
  totalRareCatches: number;
}

// GET /api/fishing/leaderboard?wallet=0x...
export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get("wallet")?.toLowerCase();
    const redis = getRedis();

    // Get top 20 from sorted set (descending by score = totalCasts)
    const topWallets = await redis.zrange<string[]>(
      FISHING_LEADERBOARD_KEY,
      0,
      19,
      { rev: true, withScores: true }
    );

    // topWallets comes as [member, score, member, score, ...]
    const leaderboard: LeaderboardEntry[] = [];
    for (let i = 0; i < topWallets.length; i += 2) {
      const w = topWallets[i];
      const score = Number(topWallets[i + 1]);
      const key = `${FISHING_KEY_PREFIX}${w}`;
      const state = await redis.get<FishingState>(key);

      leaderboard.push({
        rank: Math.floor(i / 2) + 1,
        wallet: w,
        totalCasts: score,
        totalAPEarned: state?.totalAPEarned ?? 0,
        totalResourcesEarned: state?.totalResourcesEarned ?? 0,
        totalRareCatches: state?.totalRareCatches ?? 0,
      });
    }

    // Get current player stats if wallet provided
    let playerStats: LeaderboardEntry | null = null;
    if (wallet) {
      const playerRank = await redis.zrevrank(FISHING_LEADERBOARD_KEY, wallet);
      const playerScore = await redis.zscore(FISHING_LEADERBOARD_KEY, wallet);
      const key = `${FISHING_KEY_PREFIX}${wallet}`;
      const state = await redis.get<FishingState>(key);

      if (playerRank !== null && playerScore !== null) {
        playerStats = {
          rank: playerRank + 1,
          wallet,
          totalCasts: Number(playerScore),
          totalAPEarned: state?.totalAPEarned ?? 0,
          totalResourcesEarned: state?.totalResourcesEarned ?? 0,
          totalRareCatches: state?.totalRareCatches ?? 0,
        };
      }
    }

    return NextResponse.json({
      success: true,
      leaderboard,
      playerStats,
    });
  } catch (error) {
    console.error("Error in fishing leaderboard GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
