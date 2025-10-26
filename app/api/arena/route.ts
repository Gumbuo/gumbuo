import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const ARENA_STATE_KEY = "gumbuo:arena_state";
const ARENA_FIGHT_HISTORY_KEY = "gumbuo:arena_fight_history";

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
  lastUpdated: number;
}

interface FightResult {
  winner: OwnedAlien;
  loser: OwnedAlien;
  timestamp: number;
}

const EMPTY_ARENA: ArenaState = {
  fighter1: null,
  fighter2: null,
  fighter1Owner: null,
  fighter2Owner: null,
  fighter1Paid: false,
  fighter2Paid: false,
  lastUpdated: Date.now(),
};

// GET /api/arena - Fetch current arena state and fight history
export async function GET() {
  try {
    const arenaState = await redis.get<ArenaState>(ARENA_STATE_KEY) || EMPTY_ARENA;
    const fightHistory = await redis.get<FightResult[]>(ARENA_FIGHT_HISTORY_KEY) || [];

    return NextResponse.json({
      success: true,
      arenaState,
      fightHistory,
    });
  } catch (error) {
    console.error("Error fetching arena state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch arena state" },
      { status: 500 }
    );
  }
}

// POST /api/arena - Update arena state
export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();

    // Fetch current state
    const currentState = await redis.get<ArenaState>(ARENA_STATE_KEY) || EMPTY_ARENA;

    // Merge updates with current state
    const newState: ArenaState = {
      ...currentState,
      ...updates,
      lastUpdated: Date.now(),
    };

    // Save to Redis
    await redis.set(ARENA_STATE_KEY, newState);

    return NextResponse.json({
      success: true,
      arenaState: newState,
    });
  } catch (error) {
    console.error("Error updating arena state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update arena state" },
      { status: 500 }
    );
  }
}

// PUT /api/arena - Record a fight result
export async function PUT(request: NextRequest) {
  try {
    const fightResult: FightResult = await request.json();

    if (!fightResult.winner || !fightResult.loser || !fightResult.timestamp) {
      return NextResponse.json(
        { success: false, error: "Invalid fight result data" },
        { status: 400 }
      );
    }

    // Fetch current fight history
    const currentHistory = await redis.get<FightResult[]>(ARENA_FIGHT_HISTORY_KEY) || [];

    // Add new fight result to the beginning and keep last 50 fights
    const updatedHistory = [fightResult, ...currentHistory].slice(0, 50);

    // Save to Redis
    await redis.set(ARENA_FIGHT_HISTORY_KEY, updatedHistory);

    return NextResponse.json({
      success: true,
      fightHistory: updatedHistory,
    });
  } catch (error) {
    console.error("Error recording fight result:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record fight result" },
      { status: 500 }
    );
  }
}

// DELETE /api/arena - Clear arena state (reset after fight)
export async function DELETE() {
  try {
    await redis.set(ARENA_STATE_KEY, EMPTY_ARENA);

    return NextResponse.json({
      success: true,
      arenaState: EMPTY_ARENA,
    });
  } catch (error) {
    console.error("Error clearing arena state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear arena state" },
      { status: 500 }
    );
  }
}
