import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const LEADERBOARD_KEY = "gumbuo:leaderboard";
const BALANCES_KEY = "gumbuo:points:balances";

export interface LeaderboardEntry {
  wallet: string;
  joinedAt: number;
  alienPoints: number;
  rank: number;
}

interface UserBalances {
  [address: string]: number;
}

// POST /api/admin/sync-leaderboard - Sync all leaderboard entries with actual Redis balances
export async function POST() {
  try {
    // Fetch leaderboard and balances
    const leaderboard = await redis.get<LeaderboardEntry[]>(LEADERBOARD_KEY) || [];
    const balances = await redis.get<UserBalances>(BALANCES_KEY) || {};

    let synced = 0;
    let errors = 0;

    // Update each leaderboard entry with their actual balance
    const updatedLeaderboard = leaderboard.map(entry => {
      const normalizedWallet = entry.wallet.toLowerCase();
      const actualBalance = balances[normalizedWallet] || 0;

      if (entry.alienPoints !== actualBalance) {
        synced++;
        console.log(`Syncing ${entry.wallet}: ${entry.alienPoints} -> ${actualBalance}`);
        return {
          ...entry,
          alienPoints: actualBalance,
        };
      }

      return entry;
    });

    // Save updated leaderboard
    if (synced > 0) {
      await redis.set(LEADERBOARD_KEY, updatedLeaderboard);
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${synced} entries, ${errors} errors`,
      totalEntries: leaderboard.length,
      synced,
      errors,
      leaderboard: updatedLeaderboard,
    });
  } catch (error) {
    console.error("Error syncing leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync leaderboard" },
      { status: 500 }
    );
  }
}
