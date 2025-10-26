import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const LEADERBOARD_KEY = "gumbuo:leaderboard";

export interface LeaderboardEntry {
  wallet: string;
  joinedAt: number;
  alienPoints: number;
  rank: number;
}

// POST /api/admin/import-leaderboard - Import leaderboard data from old project
export async function POST(request: NextRequest) {
  try {
    const { entries, overwrite } = await request.json();

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { success: false, error: "Invalid entries data" },
        { status: 400 }
      );
    }

    // Fetch current leaderboard
    const currentLeaderboard = await redis.get<LeaderboardEntry[]>(LEADERBOARD_KEY) || [];

    let imported = 0;
    let skipped = 0;
    let merged = currentLeaderboard;

    for (const entry of entries) {
      const normalizedWallet = entry.wallet.toLowerCase();
      const exists = currentLeaderboard.some(
        e => e.wallet.toLowerCase() === normalizedWallet
      );

      if (exists && !overwrite) {
        skipped++;
        console.log(`Skipping existing wallet: ${entry.wallet}`);
      } else if (exists && overwrite) {
        // Update existing entry
        merged = merged.map(e =>
          e.wallet.toLowerCase() === normalizedWallet ? entry : e
        );
        imported++;
        console.log(`Updated wallet: ${entry.wallet}`);
      } else {
        // Add new entry
        merged.push(entry);
        imported++;
        console.log(`Imported wallet: ${entry.wallet}`);
      }
    }

    // Re-rank all entries
    merged = merged
      .sort((a, b) => a.joinedAt - b.joinedAt)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    // Save updated leaderboard
    await redis.set(LEADERBOARD_KEY, merged);

    return NextResponse.json({
      success: true,
      message: `Imported ${imported} entries, skipped ${skipped} duplicates`,
      imported,
      skipped,
      totalEntries: merged.length,
      leaderboard: merged,
    });
  } catch (error) {
    console.error("Error importing leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to import leaderboard" },
      { status: 500 }
    );
  }
}

// GET /api/admin/import-leaderboard - Fetch leaderboard from old project URL
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sourceUrl = searchParams.get('source');

    if (!sourceUrl) {
      return NextResponse.json(
        { success: false, error: "Missing source URL parameter" },
        { status: 400 }
      );
    }

    // Fetch leaderboard from old project
    console.log(`Fetching leaderboard from: ${sourceUrl}`);
    const response = await fetch(sourceUrl);
    const data = await response.json();

    if (!data.success || !data.leaderboard) {
      return NextResponse.json(
        { success: false, error: "Invalid response from source" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      entries: data.leaderboard,
      count: data.leaderboard.length,
      message: `Found ${data.leaderboard.length} entries. Use POST to import them.`,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard from source" },
      { status: 500 }
    );
  }
}
