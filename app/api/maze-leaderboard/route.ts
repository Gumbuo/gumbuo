import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const MAZE_LEADERBOARD_KEY = "gumbuo:maze_leaderboard";

// Type definitions
interface MazeScore {
  wallet: string;
  nftCharacter?: string; // "nyx", "zorb", "baob", "apelian", "j3d1", "zit"
  score: number;
  timeElapsed: number;
  collectedItems: number;
  totalItems: number;
  timestamp: number;
  rank?: number;
}

// GET - Fetch leaderboard
export async function GET(req: NextRequest) {
  try {
    // Fetch leaderboard from Redis
    const leaderboard = await redis.get<MazeScore[]>(MAZE_LEADERBOARD_KEY) || [];

    // Sort by score (descending), then by time (ascending - faster is better)
    const sortedLeaderboard = [...leaderboard].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeElapsed - b.timeElapsed;
    });

    // Add rank to each entry
    const rankedLeaderboard = sortedLeaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    return NextResponse.json({
      success: true,
      leaderboard: rankedLeaderboard,
      totalEntries: rankedLeaderboard.length
    });
  } catch (error) {
    console.error("Error fetching maze leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

// POST - Submit a new score
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, nftCharacter, score, timeElapsed, collectedItems, totalItems } = body;

    // Validate required fields
    if (!wallet || score === undefined || timeElapsed === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize wallet address
    const normalizedWallet = wallet.toLowerCase();

    // Create new score entry
    const newScore: MazeScore = {
      wallet: normalizedWallet,
      nftCharacter,
      score: Number(score),
      timeElapsed: Number(timeElapsed),
      collectedItems: Number(collectedItems) || 0,
      totalItems: Number(totalItems) || 0,
      timestamp: Date.now()
    };

    // Fetch current leaderboard
    const leaderboard = await redis.get<MazeScore[]>(MAZE_LEADERBOARD_KEY) || [];

    // Add new score
    leaderboard.push(newScore);

    // Sort leaderboard
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeElapsed - b.timeElapsed;
    });

    // Save back to Redis
    await redis.set(MAZE_LEADERBOARD_KEY, leaderboard);

    // Find the rank of the new entry
    const rank = leaderboard.findIndex(
      entry => entry.wallet === normalizedWallet && entry.timestamp === newScore.timestamp
    ) + 1;

    return NextResponse.json({
      success: true,
      entry: { ...newScore, rank },
      message: `Score submitted! You ranked #${rank}`
    });
  } catch (error) {
    console.error("Error submitting maze score:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit score" },
      { status: 500 }
    );
  }
}

// DELETE - Clear leaderboard (admin only)
export async function DELETE(req: NextRequest) {
  try {
    await redis.set(MAZE_LEADERBOARD_KEY, []);
    return NextResponse.json({
      success: true,
      message: "Leaderboard cleared"
    });
  } catch (error) {
    console.error("Error clearing maze leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear leaderboard" },
      { status: 500 }
    );
  }
}
