import { NextRequest, NextResponse } from "next/server";
import {
  getPlayerLevel,
  addPlayerXP,
  getXPForLevel,
  getXPToNextLevel,
  getXPProgress,
  getPlayerLevelTitle,
} from "../lib/playerLevel";

// GET /api/player-level?wallet=0x...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 400 }
      );
    }

    const levelData = await getPlayerLevel(wallet);
    const title = getPlayerLevelTitle(levelData.level);
    const xpToNext = getXPToNextLevel(levelData.level);
    const xpCurrent = getXPForLevel(levelData.level);
    const progress = getXPProgress(levelData.level, levelData.xp);

    return NextResponse.json({
      success: true,
      data: {
        level: levelData.level,
        title,
        xp: levelData.xp,
        totalXpEarned: levelData.totalXpEarned,
        xpForCurrentLevel: xpCurrent,
        xpForNextLevel: xpToNext,
        progressPercent: Math.round(progress * 100) / 100,
        lastUpdated: levelData.lastUpdated,
      },
    });
  } catch (error) {
    console.error("Error fetching player level:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch player level" },
      { status: 500 }
    );
  }
}

// POST /api/player-level - Add XP from an activity
export async function POST(request: NextRequest) {
  try {
    const { wallet, xp, source } = await request.json();

    if (!wallet || typeof xp !== "number" || !source) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    if (xp <= 0) {
      return NextResponse.json(
        { success: false, error: "XP must be positive" },
        { status: 400 }
      );
    }

    const result = await addPlayerXP(wallet, xp, source);
    const title = getPlayerLevelTitle(result.levelData.level);
    const xpToNext = getXPToNextLevel(result.levelData.level);
    const xpCurrent = getXPForLevel(result.levelData.level);
    const progress = getXPProgress(result.levelData.level, result.levelData.xp);

    return NextResponse.json({
      success: true,
      data: {
        level: result.levelData.level,
        title,
        xp: result.levelData.xp,
        totalXpEarned: result.levelData.totalXpEarned,
        xpForCurrentLevel: xpCurrent,
        xpForNextLevel: xpToNext,
        progressPercent: Math.round(progress * 100) / 100,
        xpAdded: result.xpAdded,
        levelsGained: result.levelsGained,
        apRewarded: result.apRewarded,
      },
    });
  } catch (error) {
    console.error("Error adding player XP:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add player XP" },
      { status: 500 }
    );
  }
}
