import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const BOSS_STATE_KEY = "gumbuo:boss_state";
const BOSS_ATTACKERS_KEY = "gumbuo:boss_recent_attackers";

// Initialize Redis client with Vercel KV environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

interface BossState {
  currentHP: number;
  maxHP: number;
  defeatedAt: number | null;
  totalDamageDealt: Record<string, number>; // wallet -> damage
  isAlive: boolean;
}

interface RecentAttacker {
  address: string;
  damage: number;
  timestamp: number;
  attackType: 'normal' | 'power' | 'ultimate';
}

const BOSS_MAX_HP = 1_000_000;
const BOSS_RESPAWN_TIME = 3600000; // 1 hour

const EMPTY_BOSS: BossState = {
  currentHP: BOSS_MAX_HP,
  maxHP: BOSS_MAX_HP,
  defeatedAt: null,
  totalDamageDealt: {},
  isAlive: true,
};

// In-memory cache for read-heavy endpoints (5 second TTL)
let bossCache: { data: { bossState: BossState; recentAttackers: RecentAttacker[] } | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};
const CACHE_TTL = 5000; // 5 seconds

// GET /api/boss - Fetch current boss state and recent attackers
export async function GET() {
  try {
    const now = Date.now();

    // Return cached data if still valid
    if (bossCache.data && (now - bossCache.timestamp) < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        ...bossCache.data,
        cached: true,
      });
    }

    let bossState = await redis.get<BossState>(BOSS_STATE_KEY) || EMPTY_BOSS;

    // Check if boss should respawn
    if (!bossState.isAlive && bossState.defeatedAt) {
      const timeSinceDefeat = now - bossState.defeatedAt;

      if (timeSinceDefeat >= BOSS_RESPAWN_TIME) {
        // Respawn boss
        bossState = { ...EMPTY_BOSS };
        await redis.set(BOSS_STATE_KEY, bossState);
        // Clear recent attackers on respawn
        await redis.del(BOSS_ATTACKERS_KEY);
      }
    }

    // Fetch recent attackers
    const recentAttackers = await redis.get<RecentAttacker[]>(BOSS_ATTACKERS_KEY) || [];

    // Update cache
    bossCache = {
      data: { bossState, recentAttackers },
      timestamp: now,
    };

    return NextResponse.json({
      success: true,
      bossState,
      recentAttackers,
    });
  } catch (error) {
    console.error("Error fetching boss state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch boss state" },
      { status: 500 }
    );
  }
}

// POST /api/boss - Update boss state (damage dealt)
export async function POST(request: NextRequest) {
  try {
    const { damage, wallet, attackType } = await request.json();

    if (!damage || !wallet || !attackType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch current state
    const currentState = await redis.get<BossState>(BOSS_STATE_KEY) || EMPTY_BOSS;

    if (!currentState.isAlive) {
      return NextResponse.json(
        { success: false, error: "Boss is already defeated" },
        { status: 400 }
      );
    }

    // Update damage
    const newHP = Math.max(0, currentState.currentHP - damage);
    const newDamageDealt = { ...currentState.totalDamageDealt };
    newDamageDealt[wallet.toLowerCase()] = (newDamageDealt[wallet.toLowerCase()] || 0) + damage;

    const newState: BossState = {
      ...currentState,
      currentHP: newHP,
      totalDamageDealt: newDamageDealt,
      isAlive: newHP > 0,
      defeatedAt: newHP === 0 ? Date.now() : null,
    };

    // Save to Redis
    await redis.set(BOSS_STATE_KEY, newState);

    // Add to recent attackers
    const recentAttackers = await redis.get<RecentAttacker[]>(BOSS_ATTACKERS_KEY) || [];
    const newAttacker: RecentAttacker = {
      address: wallet,
      damage,
      timestamp: Date.now(),
      attackType,
    };
    const updatedAttackers = [newAttacker, ...recentAttackers].slice(0, 10); // Keep last 10
    await redis.set(BOSS_ATTACKERS_KEY, updatedAttackers);

    // Invalidate cache after state change
    bossCache = { data: { bossState: newState, recentAttackers: updatedAttackers }, timestamp: Date.now() };

    return NextResponse.json({
      success: true,
      bossState: newState,
      recentAttackers: updatedAttackers,
    });
  } catch (error) {
    console.error("Error updating boss state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update boss state" },
      { status: 500 }
    );
  }
}

// DELETE /api/boss - Reset boss (admin/manual reset)
export async function DELETE() {
  try {
    await redis.set(BOSS_STATE_KEY, EMPTY_BOSS);
    await redis.del(BOSS_ATTACKERS_KEY);

    // Invalidate cache
    bossCache = { data: { bossState: EMPTY_BOSS, recentAttackers: [] }, timestamp: Date.now() };

    return NextResponse.json({
      success: true,
      bossState: EMPTY_BOSS,
    });
  } catch (error) {
    console.error("Error resetting boss state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset boss state" },
      { status: 500 }
    );
  }
}
