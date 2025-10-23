import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const LEADERBOARD_KEY = "gumbuo:leaderboard";
const MAX_FIRST_TIMERS = 50;

// Initialize Redis client with Vercel KV environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export interface LeaderboardEntry {
  wallet: string;
  joinedAt: number;
  alienPoints: number;
  rank: number;
}

// GET /api/leaderboard - Fetch the full leaderboard
export async function GET() {
  try {
    const leaderboard = await redis.get<LeaderboardEntry[]>(LEADERBOARD_KEY) || [];

    return NextResponse.json({
      success: true,
      leaderboard,
      spotsRemaining: MAX_FIRST_TIMERS - leaderboard.length,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

// POST /api/leaderboard - Register a new wallet
export async function POST(request: NextRequest) {
  try {
    const { wallet, alienPoints } = await request.json();

    if (!wallet || typeof wallet !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Normalize wallet address
    const normalizedWallet = wallet.toLowerCase();

    // Fetch current leaderboard
    const leaderboard = await redis.get<LeaderboardEntry[]>(LEADERBOARD_KEY) || [];

    // Check if wallet is already registered
    const existingEntry = leaderboard.find(
      entry => entry.wallet.toLowerCase() === normalizedWallet
    );

    if (existingEntry) {
      return NextResponse.json({
        success: false,
        error: "Wallet already registered",
        entry: existingEntry,
      });
    }

    // Check if spots are full
    if (leaderboard.length >= MAX_FIRST_TIMERS) {
      return NextResponse.json({
        success: false,
        error: "All spots have been claimed",
      });
    }

    // Create new entry
    const newEntry: LeaderboardEntry = {
      wallet,
      joinedAt: Date.now(),
      alienPoints: alienPoints || 0,
      rank: leaderboard.length + 1,
    };

    // Add to leaderboard
    const updatedLeaderboard = [...leaderboard, newEntry];
    await redis.set(LEADERBOARD_KEY, updatedLeaderboard);

    return NextResponse.json({
      success: true,
      entry: newEntry,
      spotsRemaining: MAX_FIRST_TIMERS - updatedLeaderboard.length,
    });
  } catch (error) {
    console.error("Error registering wallet:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register wallet" },
      { status: 500 }
    );
  }
}

// PATCH /api/leaderboard - Update a wallet's alien points
export async function PATCH(request: NextRequest) {
  try {
    const { wallet, alienPoints } = await request.json();

    if (!wallet || typeof wallet !== "string" || typeof alienPoints !== "number") {
      return NextResponse.json(
        { success: false, error: "Invalid wallet address or points" },
        { status: 400 }
      );
    }

    // Normalize wallet address
    const normalizedWallet = wallet.toLowerCase();

    // Fetch current leaderboard
    const leaderboard = await redis.get<LeaderboardEntry[]>(LEADERBOARD_KEY) || [];

    // Find and update the entry
    const entryIndex = leaderboard.findIndex(
      entry => entry.wallet.toLowerCase() === normalizedWallet
    );

    if (entryIndex === -1) {
      return NextResponse.json({
        success: false,
        error: "Wallet not found in leaderboard",
      });
    }

    // Update the entry
    leaderboard[entryIndex].alienPoints = alienPoints;
    await redis.set(LEADERBOARD_KEY, leaderboard);

    return NextResponse.json({
      success: true,
      entry: leaderboard[entryIndex],
    });
  } catch (error) {
    console.error("Error updating points:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update points" },
      { status: 500 }
    );
  }
}
