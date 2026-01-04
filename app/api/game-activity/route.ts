import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const ACTIVITY_KEY_PREFIX = "gumbuo:arcade_activity:";
const BALANCES_KEY = "gumbuo:points:balances";

// Reward constants
const PLAY_REWARD = 100; // AP per game launch
const PLAY_COOLDOWN = 5 * 60 * 1000; // 5 minutes in ms
const TIME_REWARD = 20; // AP per minute
const TIME_CAP = 200; // Max AP from time per day
const VARIETY_REWARD = 500; // AP for playing 5+ unique games
const VARIETY_THRESHOLD = 5; // Games needed for variety bonus

interface ArcadeActivity {
  lastGamePlays: { [gameId: string]: number }; // gameId -> timestamp
  todayGamesPlayed: string[]; // Unique game IDs today
  todayTimeSpent: number; // Minutes on arcade today
  todayAPEarned: number; // AP earned today
  lastActivityDate: string; // "2026-01-03" format
  totalGamesPlayed: number; // Lifetime
  totalAPEarned: number; // Lifetime
  varietyBonusClaimed: boolean; // If 500 AP bonus claimed today
}

const EMPTY_ACTIVITY: ArcadeActivity = {
  lastGamePlays: {},
  todayGamesPlayed: [],
  todayTimeSpent: 0,
  todayAPEarned: 0,
  lastActivityDate: "",
  totalGamesPlayed: 0,
  totalAPEarned: 0,
  varietyBonusClaimed: false,
};

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function resetDailyIfNeeded(activity: ArcadeActivity): ArcadeActivity {
  const today = getTodayString();
  if (activity.lastActivityDate !== today) {
    return {
      ...activity,
      lastGamePlays: {}, // Reset cooldowns too
      todayGamesPlayed: [],
      todayTimeSpent: 0,
      todayAPEarned: 0,
      lastActivityDate: today,
      varietyBonusClaimed: false,
    };
  }
  return activity;
}

// Helper to award points
async function awardPoints(wallet: string, points: number): Promise<boolean> {
  try {
    const normalizedWallet = wallet.toLowerCase();
    const balances = await redis.get<{ [address: string]: number }>(BALANCES_KEY) || {};
    balances[normalizedWallet] = (balances[normalizedWallet] || 0) + points;
    await redis.set(BALANCES_KEY, balances);
    return true;
  } catch (error) {
    console.error("Error awarding points:", error);
    return false;
  }
}

// GET /api/game-activity - Get user's arcade stats
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

    const normalizedWallet = wallet.toLowerCase();
    const key = `${ACTIVITY_KEY_PREFIX}${normalizedWallet}`;

    let activity = await redis.get<ArcadeActivity>(key) || EMPTY_ACTIVITY;
    activity = resetDailyIfNeeded(activity);

    // Calculate progress
    const timeAPEarned = Math.min(activity.todayTimeSpent * TIME_REWARD, TIME_CAP);
    const timeAPRemaining = TIME_CAP - timeAPEarned;
    const varietyProgress = activity.todayGamesPlayed.length;
    const canClaimVariety = varietyProgress >= VARIETY_THRESHOLD && !activity.varietyBonusClaimed;

    return NextResponse.json({
      success: true,
      activity: {
        gamesPlayedToday: activity.todayGamesPlayed.length,
        timeSpentToday: activity.todayTimeSpent,
        apEarnedToday: activity.todayAPEarned,
        totalGamesPlayed: activity.totalGamesPlayed,
        totalAPEarned: activity.totalAPEarned,
        varietyProgress,
        varietyThreshold: VARIETY_THRESHOLD,
        varietyBonusClaimed: activity.varietyBonusClaimed,
        canClaimVariety,
        timeAPEarned,
        timeAPRemaining,
        timeCap: TIME_CAP,
      },
    });
  } catch (error) {
    console.error("Error fetching game activity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

// POST /api/game-activity - Log game play and award points
export async function POST(request: NextRequest) {
  try {
    const { wallet, gameId, gameTitle } = await request.json();

    if (!wallet || !gameId) {
      return NextResponse.json(
        { success: false, error: "Wallet and gameId required" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const key = `${ACTIVITY_KEY_PREFIX}${normalizedWallet}`;

    let activity = await redis.get<ArcadeActivity>(key) || EMPTY_ACTIVITY;
    activity = resetDailyIfNeeded(activity);

    const now = Date.now();
    const gameIdStr = gameId.toString();
    let apAwarded = 0;
    let varietyBonusAwarded = false;
    let onCooldown = false;

    // Check cooldown for this specific game
    const lastPlayed = activity.lastGamePlays[gameIdStr] || 0;
    const timeSincePlay = now - lastPlayed;

    if (timeSincePlay >= PLAY_COOLDOWN) {
      // Award play points
      await awardPoints(normalizedWallet, PLAY_REWARD);
      apAwarded += PLAY_REWARD;

      // Track game play
      activity.lastGamePlays[gameIdStr] = now;
      activity.totalGamesPlayed += 1;

      // Add to today's unique games if new
      if (!activity.todayGamesPlayed.includes(gameIdStr)) {
        activity.todayGamesPlayed.push(gameIdStr);

        // Check variety bonus
        if (
          activity.todayGamesPlayed.length >= VARIETY_THRESHOLD &&
          !activity.varietyBonusClaimed
        ) {
          await awardPoints(normalizedWallet, VARIETY_REWARD);
          apAwarded += VARIETY_REWARD;
          activity.varietyBonusClaimed = true;
          varietyBonusAwarded = true;
        }
      }

      activity.todayAPEarned += apAwarded;
      activity.totalAPEarned += apAwarded;
      activity.lastActivityDate = getTodayString();

      // Save activity
      await redis.set(key, activity);
    } else {
      onCooldown = true;
    }

    const cooldownRemaining = onCooldown
      ? Math.ceil((PLAY_COOLDOWN - timeSincePlay) / 1000)
      : 0;

    return NextResponse.json({
      success: true,
      apAwarded,
      varietyBonusAwarded,
      onCooldown,
      cooldownRemaining, // seconds
      gamesPlayedToday: activity.todayGamesPlayed.length,
      varietyProgress: activity.todayGamesPlayed.length,
      varietyThreshold: VARIETY_THRESHOLD,
    });
  } catch (error) {
    console.error("Error logging game activity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log activity" },
      { status: 500 }
    );
  }
}

// PATCH /api/game-activity - Track time spent (called every minute)
export async function PATCH(request: NextRequest) {
  try {
    const { wallet } = await request.json();

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet required" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const key = `${ACTIVITY_KEY_PREFIX}${normalizedWallet}`;

    let activity = await redis.get<ArcadeActivity>(key) || EMPTY_ACTIVITY;
    activity = resetDailyIfNeeded(activity);

    let apAwarded = 0;
    const currentTimeAP = activity.todayTimeSpent * TIME_REWARD;

    // Check if under daily cap
    if (currentTimeAP < TIME_CAP) {
      await awardPoints(normalizedWallet, TIME_REWARD);
      apAwarded = TIME_REWARD;
      activity.todayTimeSpent += 1;
      activity.todayAPEarned += TIME_REWARD;
      activity.totalAPEarned += TIME_REWARD;
      activity.lastActivityDate = getTodayString();

      await redis.set(key, activity);
    }

    const timeAPEarned = activity.todayTimeSpent * TIME_REWARD;
    const cappedOut = timeAPEarned >= TIME_CAP;

    return NextResponse.json({
      success: true,
      apAwarded,
      timeSpentToday: activity.todayTimeSpent,
      timeAPEarned: Math.min(timeAPEarned, TIME_CAP),
      timeAPRemaining: Math.max(TIME_CAP - timeAPEarned, 0),
      cappedOut,
    });
  } catch (error) {
    console.error("Error tracking time:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track time" },
      { status: 500 }
    );
  }
}
