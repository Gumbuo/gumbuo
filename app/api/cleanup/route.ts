import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Keys that store data
const KEYS = {
  BOSS_STATE: "gumbuo:boss_state",
  BOSS_ATTACKERS: "gumbuo:boss_recent_attackers",
  ARENA_STATE: "gumbuo:arena_state",
  ARENA_HISTORY: "gumbuo:arena_fight_history",
  POINTS_POOL: "gumbuo:points:pool",
  POINTS_BALANCES: "gumbuo:points:balances",
  LEADERBOARD: "gumbuo:leaderboard",
  MAZE_LEADERBOARD: "gumbuo:maze_leaderboard",
  ALIEN_SALES: "gumbuo:alien_sales",
  ARCADE_LEADERBOARD: "gumbuo:arcade_leaderboard_cache",
};

// GET /api/cleanup - Show current storage stats
export async function GET() {
  try {
    const stats: Record<string, { exists: boolean; size?: string }> = {};

    for (const [name, key] of Object.entries(KEYS)) {
      const data = await redis.get(key);
      if (data) {
        const size = JSON.stringify(data).length;
        stats[name] = {
          exists: true,
          size: size > 1024 ? `${(size / 1024).toFixed(2)} KB` : `${size} bytes`
        };
      } else {
        stats[name] = { exists: false };
      }
    }

    // Count user-specific keys (sample check)
    const balances = await redis.get<Record<string, number>>(KEYS.POINTS_BALANCES) || {};
    const userCount = Object.keys(balances).length;

    return NextResponse.json({
      success: true,
      stats,
      userCount,
      message: "Use POST to clean up data, DELETE to reset everything",
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get stats" },
      { status: 500 }
    );
  }
}

// POST /api/cleanup - Clean up stale data while preserving active users
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    const cleaned: string[] = [];

    if (action === "boss" || action === "all") {
      // Reset boss to fresh state
      await redis.set(KEYS.BOSS_STATE, {
        currentHP: 1_000_000,
        maxHP: 1_000_000,
        defeatedAt: null,
        totalDamageDealt: {},
        isAlive: true,
      });
      await redis.del(KEYS.BOSS_ATTACKERS);
      cleaned.push("boss_state", "boss_attackers");
    }

    if (action === "arena" || action === "all") {
      // Reset arena
      await redis.set(KEYS.ARENA_STATE, {
        fighter1: null,
        fighter2: null,
        fighter1Owner: null,
        fighter2Owner: null,
        fighter1Paid: false,
        fighter2Paid: false,
        lastUpdated: Date.now(),
      });
      // Keep only last 10 fights in history
      const history = await redis.get<unknown[]>(KEYS.ARENA_HISTORY) || [];
      if (history.length > 10) {
        await redis.set(KEYS.ARENA_HISTORY, history.slice(0, 10));
        cleaned.push("arena_history (trimmed to 10)");
      }
      cleaned.push("arena_state");
    }

    if (action === "leaderboards" || action === "all") {
      // Trim maze leaderboard to top 50
      const mazeLeaderboard = await redis.get<unknown[]>(KEYS.MAZE_LEADERBOARD) || [];
      if (mazeLeaderboard.length > 50) {
        await redis.set(KEYS.MAZE_LEADERBOARD, mazeLeaderboard.slice(0, 50));
        cleaned.push("maze_leaderboard (trimmed to 50)");
      }

      // Clear arcade leaderboard cache (will regenerate)
      await redis.del(KEYS.ARCADE_LEADERBOARD);
      cleaned.push("arcade_leaderboard_cache");
    }

    if (action === "sales" || action === "all") {
      // Clear old sales data
      await redis.del(KEYS.ALIEN_SALES);
      cleaned.push("alien_sales");
    }

    return NextResponse.json({
      success: true,
      cleaned,
      message: `Cleaned ${cleaned.length} items`,
    });
  } catch (error) {
    console.error("Error cleaning up:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clean up" },
      { status: 500 }
    );
  }
}

// DELETE /api/cleanup - Nuclear option: clear ALL data
export async function DELETE(request: NextRequest) {
  try {
    const { confirm } = await request.json();

    if (confirm !== "DELETE_ALL_DATA") {
      return NextResponse.json(
        { success: false, error: "Must send { confirm: 'DELETE_ALL_DATA' } to confirm" },
        { status: 400 }
      );
    }

    const deleted: string[] = [];

    // Delete all known keys
    for (const [name, key] of Object.entries(KEYS)) {
      await redis.del(key);
      deleted.push(name);
    }

    // Scan and delete user-specific keys
    const patterns = ["gumbuo:user_data:*", "gumbuo:armory:*", "gumbuo:game_activity:*"];

    for (const pattern of patterns) {
      let cursor = "0";
      do {
        const result = await redis.scan(cursor, { match: pattern, count: 100 });
        cursor = String(result[0]);
        const keys = result[1] as string[];

        for (const key of keys) {
          await redis.del(key);
          deleted.push(key);
        }
      } while (cursor !== "0");
    }

    return NextResponse.json({
      success: true,
      deleted,
      message: `Deleted ${deleted.length} keys. Storage should be cleared.`,
    });
  } catch (error) {
    console.error("Error deleting all data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete data" },
      { status: 500 }
    );
  }
}
