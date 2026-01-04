import { NextRequest, NextResponse } from "next/server";

export interface FreeGame {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
  freetogame_profile_url: string;
}

// In-memory cache
let cachedGames: FreeGame[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// GET /api/games - Fetch free-to-play browser games
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") || "browser"; // browser, pc, all
    const category = searchParams.get("category"); // mmorpg, shooter, strategy, etc.
    const sort = searchParams.get("sort") || "popularity"; // popularity, release-date, alphabetical
    const limit = parseInt(searchParams.get("limit") || "50");

    // Check cache
    const now = Date.now();
    const cacheKey = `${platform}-${category || "all"}-${sort}`;

    if (cachedGames && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        games: cachedGames.slice(0, limit),
        total: cachedGames.length,
        cached: true,
      });
    }

    // Build FreeToGame API URL
    const apiUrl = new URL("https://www.freetogame.com/api/games");

    if (platform && platform !== "all") {
      apiUrl.searchParams.set("platform", platform);
    }
    if (category) {
      apiUrl.searchParams.set("category", category);
    }
    apiUrl.searchParams.set("sort-by", sort);

    // Fetch from FreeToGame API
    const response = await fetch(apiUrl.toString(), {
      headers: {
        "Accept": "application/json",
      },
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!response.ok) {
      throw new Error(`FreeToGame API error: ${response.status}`);
    }

    const games: FreeGame[] = await response.json();

    // Update cache
    cachedGames = games;
    cacheTimestamp = now;

    return NextResponse.json({
      success: true,
      games: games.slice(0, limit),
      total: games.length,
      cached: false,
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

// Available categories for FreeToGame API:
// mmorpg, shooter, strategy, moba, racing, sports, social, sandbox,
// open-world, survival, pvp, pve, pixel, voxel, zombie, turn-based,
// first-person, third-person, top-down, tank, space, sailing,
// side-scroller, superhero, permadeath, card, battle-royale, mmo,
// mmofps, mmotps, 3d, 2d, anime, fantasy, sci-fi, fighting,
// action-rpg, action, military, martial-arts, flight, low-spec,
// tower-defense, horror, mmorts
