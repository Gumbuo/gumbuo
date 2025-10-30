import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const ARENA_STATE_KEY = "gumbuo:abstract_arena_state";
const FIGHT_HISTORY_KEY = "gumbuo:abstract_fight_history";

// Initialize Redis client with Vercel KV environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

interface OwnedAlien {
  id: string;
  picId: string;
  name: string;
  image: string;
  purchasedAt: number;
}

interface ArenaState {
  fighter1: OwnedAlien | null;
  fighter2: OwnedAlien | null;
  fighter1Owner: string | null;
  fighter2Owner: string | null;
  fighter1Paid: boolean;
  fighter2Paid: boolean;
}

interface FightResult {
  winner: OwnedAlien;
  loser: OwnedAlien;
  winnerOwner: string;
  loserOwner: string;
  timestamp: number;
  prizePool: string;
}

// GET /api/abstract-arena - Fetch arena state and fight history
export async function GET() {
  try {
    const arenaState = await redis.get<ArenaState>(ARENA_STATE_KEY);
    const fightHistory = await redis.get<FightResult[]>(FIGHT_HISTORY_KEY) || [];

    return NextResponse.json({
      success: true,
      arenaState: arenaState || {
        fighter1: null,
        fighter2: null,
        fighter1Owner: null,
        fighter2Owner: null,
        fighter1Paid: false,
        fighter2Paid: false,
      },
      fightHistory,
    });
  } catch (error) {
    console.error("Error fetching Abstract arena state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch arena state" },
      { status: 500 }
    );
  }
}

// POST /api/abstract-arena - Update arena state
export async function POST(request: NextRequest) {
  try {
    const arenaState: ArenaState = await request.json();

    // Save arena state to Redis
    await redis.set(ARENA_STATE_KEY, arenaState);

    return NextResponse.json({
      success: true,
      arenaState,
    });
  } catch (error) {
    console.error("Error updating Abstract arena state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update arena state" },
      { status: 500 }
    );
  }
}

// PUT /api/abstract-arena - Add fight result to history
export async function PUT(request: NextRequest) {
  try {
    const fightResult: FightResult = await request.json();

    // Get current fight history
    const fightHistory = await redis.get<FightResult[]>(FIGHT_HISTORY_KEY) || [];

    // Add new result to the beginning (most recent first)
    const updatedHistory = [fightResult, ...fightHistory].slice(0, 50); // Keep last 50 fights

    // Save to Redis
    await redis.set(FIGHT_HISTORY_KEY, updatedHistory);

    return NextResponse.json({
      success: true,
      fightHistory: updatedHistory,
    });
  } catch (error) {
    console.error("Error adding fight result to Abstract arena history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add fight result" },
      { status: 500 }
    );
  }
}

// DELETE /api/abstract-arena - Clear arena state
export async function DELETE() {
  try {
    await redis.del(ARENA_STATE_KEY);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error clearing Abstract arena state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear arena state" },
      { status: 500 }
    );
  }
}
