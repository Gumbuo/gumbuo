import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "../lib/points";

const PLAYS_KEY_PREFIX = "gumbuo:daily_plays:";
const MAX_PLAYS_PER_DAY = 10;

interface DailyPlays {
  invasion: number;
  dungeon: number;
  date: string;
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getPlaysKey(wallet: string): string {
  return `${PLAYS_KEY_PREFIX}${wallet.toLowerCase()}`;
}

function getDefaultPlays(): DailyPlays {
  return { invasion: 0, dungeon: 0, date: getTodayDate() };
}

function checkDailyReset(plays: DailyPlays): DailyPlays {
  const today = getTodayDate();
  if (plays.date !== today) {
    return getDefaultPlays();
  }
  return plays;
}

// GET /api/game-plays?wallet=0x...&game=invasion|dungeon
export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get("wallet");
    const game = request.nextUrl.searchParams.get("game");
    if (!wallet || !game) {
      return NextResponse.json({ success: false, error: "Missing wallet or game" }, { status: 400 });
    }
    if (game !== "invasion" && game !== "dungeon") {
      return NextResponse.json({ success: false, error: "Invalid game" }, { status: 400 });
    }

    const gameKey = game as keyof Pick<DailyPlays, "invasion" | "dungeon">;
    const redis = getRedis();
    let plays = await redis.get<DailyPlays>(getPlaysKey(wallet));
    if (!plays) {
      plays = getDefaultPlays();
    } else {
      plays = checkDailyReset(plays);
    }

    const used = plays[gameKey];
    return NextResponse.json({
      success: true,
      playsUsed: used,
      playsRemaining: Math.max(0, MAX_PLAYS_PER_DAY - used),
      maxPlays: MAX_PLAYS_PER_DAY,
    });
  } catch (error) {
    console.error("Error in game-plays GET:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch play count" }, { status: 500 });
  }
}

// POST /api/game-plays — record a play, returns whether it's allowed
export async function POST(request: NextRequest) {
  try {
    const { wallet, game } = await request.json();
    if (!wallet || !game) {
      return NextResponse.json({ success: false, error: "Missing wallet or game" }, { status: 400 });
    }
    if (game !== "invasion" && game !== "dungeon") {
      return NextResponse.json({ success: false, error: "Invalid game" }, { status: 400 });
    }

    const gameKey = game as keyof Pick<DailyPlays, "invasion" | "dungeon">;
    const redis = getRedis();
    const key = getPlaysKey(wallet);
    let plays = await redis.get<DailyPlays>(key);
    if (!plays) {
      plays = getDefaultPlays();
    } else {
      plays = checkDailyReset(plays);
    }

    if (plays[gameKey] >= MAX_PLAYS_PER_DAY) {
      return NextResponse.json({
        success: false,
        error: `Daily limit reached (${MAX_PLAYS_PER_DAY}/${MAX_PLAYS_PER_DAY}). Come back tomorrow!`,
        playsUsed: plays[gameKey],
        playsRemaining: 0,
        maxPlays: MAX_PLAYS_PER_DAY,
      });
    }

    plays[gameKey]++;
    await redis.set(key, plays);

    return NextResponse.json({
      success: true,
      playsUsed: plays[gameKey],
      playsRemaining: MAX_PLAYS_PER_DAY - plays[gameKey],
      maxPlays: MAX_PLAYS_PER_DAY,
    });
  } catch (error) {
    console.error("Error in game-plays POST:", error);
    return NextResponse.json({ success: false, error: "Failed to record play" }, { status: 500 });
  }
}
