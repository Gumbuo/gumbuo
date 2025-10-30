import { NextRequest, NextResponse } from "next/server";

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

// In-memory storage (will be replaced with Vercel KV in production)
let leaderboard: MazeScore[] = [];

// GET - Fetch leaderboard
export async function GET(req: NextRequest) {
  try {
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

    // Add to leaderboard
    leaderboard.push(newScore);

    // Sort leaderboard
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeElapsed - b.timeElapsed;
    });

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
    leaderboard = [];
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
