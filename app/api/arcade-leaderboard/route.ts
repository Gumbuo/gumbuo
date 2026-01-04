import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const ACTIVITY_KEY_PREFIX = "gumbuo:arcade_activity:";
const LEADERBOARD_CACHE_KEY = "gumbuo:arcade_leaderboard_cache";
const CACHE_DURATION = 60; // 1 minute cache

interface ArcadeActivity {
  lastGamePlays: { [gameId: string]: number };
  todayGamesPlayed: string[];
  todayTimeSpent: number;
  todayAPEarned: number;
  lastActivityDate: string;
  totalGamesPlayed: number;
  totalAPEarned: number;
  varietyBonusClaimed: boolean;
}

interface LeaderboardEntry {
  wallet: string;
  totalAPEarned: number;
  totalGamesPlayed: number;
  uniqueGamesPlayed: number;
  todayAPEarned: number;
  lastActive: string;
}

interface LeaderboardCache {
  entries: LeaderboardEntry[];
  updatedAt: number;
}

// GET /api/arcade-leaderboard - Fetch arcade leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "totalAPEarned"; // totalAPEarned, totalGamesPlayed, uniqueGamesPlayed
    const limit = parseInt(searchParams.get("limit") || "50");
    const wallet = searchParams.get("wallet"); // Optional: get specific user's rank

    // Check cache first
    const cached = await redis.get<LeaderboardCache>(LEADERBOARD_CACHE_KEY);
    const now = Date.now();

    let entries: LeaderboardEntry[];

    if (cached && (now - cached.updatedAt) < CACHE_DURATION * 1000) {
      entries = cached.entries;
    } else {
      // Scan for all arcade activity keys
      const keys: string[] = [];
      let cursor = "0";

      do {
        const result: [string, string[]] = await redis.scan(cursor, {
          match: `${ACTIVITY_KEY_PREFIX}*`,
          count: 100,
        });
        cursor = result[0];
        keys.push(...result[1]);
      } while (cursor !== "0");

      // Fetch all activities
      entries = [];
      for (const key of keys) {
        const activity = await redis.get<ArcadeActivity>(key);
        if (activity && activity.totalAPEarned > 0) {
          const walletAddress = key.replace(ACTIVITY_KEY_PREFIX, "");

          // Count unique games from lastGamePlays
          const uniqueGames = Object.keys(activity.lastGamePlays || {}).length;

          entries.push({
            wallet: walletAddress,
            totalAPEarned: activity.totalAPEarned || 0,
            totalGamesPlayed: activity.totalGamesPlayed || 0,
            uniqueGamesPlayed: uniqueGames,
            todayAPEarned: activity.todayAPEarned || 0,
            lastActive: activity.lastActivityDate || "",
          });
        }
      }

      // Cache the results
      await redis.set(LEADERBOARD_CACHE_KEY, {
        entries,
        updatedAt: now,
      });
    }

    // Sort by requested field
    const sortedEntries = [...entries].sort((a, b) => {
      switch (sortBy) {
        case "totalGamesPlayed":
          return b.totalGamesPlayed - a.totalGamesPlayed;
        case "uniqueGamesPlayed":
          return b.uniqueGamesPlayed - a.uniqueGamesPlayed;
        case "todayAPEarned":
          return b.todayAPEarned - a.todayAPEarned;
        default:
          return b.totalAPEarned - a.totalAPEarned;
      }
    });

    // Add ranks
    const rankedEntries = sortedEntries.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Get user's rank if wallet provided
    let userRank = null;
    if (wallet) {
      const normalizedWallet = wallet.toLowerCase();
      const userIndex = sortedEntries.findIndex(
        (e) => e.wallet.toLowerCase() === normalizedWallet
      );
      if (userIndex !== -1) {
        userRank = {
          ...sortedEntries[userIndex],
          rank: userIndex + 1,
        };
      }
    }

    return NextResponse.json({
      success: true,
      leaderboard: rankedEntries,
      totalPlayers: entries.length,
      sortBy,
      userRank,
    });
  } catch (error) {
    console.error("Error fetching arcade leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
