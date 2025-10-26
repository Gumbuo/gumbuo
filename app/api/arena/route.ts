import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const ARENA_STATE_KEY = "gumbuo:arena_state";

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

const EMPTY_ARENA: ArenaState = {
  fighter1: null,
  fighter2: null,
  fighter1Owner: null,
  fighter2Owner: null,
  fighter1Paid: false,
  fighter2Paid: false,
  lastUpdated: Date.now(),
};

// GET /api/arena - Fetch current arena state
export async function GET() {
  try {
    const arenaState = await redis.get<ArenaState>(ARENA_STATE_KEY) || EMPTY_ARENA;

    return NextResponse.json({
      success: true,
      arenaState,
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
