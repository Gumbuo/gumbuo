import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "../../lib/points";

const EVENT_STREAK_PREFIX = "gumbuo:event:streak:";

interface EventStreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  activityDates: string[];
  createdAt: number;
  lastUpdated: number;
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

function getStreakKey(wallet: string): string {
  return `${EVENT_STREAK_PREFIX}${wallet.toLowerCase()}`;
}

function getDefaultStreakData(): EventStreakData {
  const now = Date.now();
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: "",
    activityDates: [],
    createdAt: now,
    lastUpdated: now,
  };
}

// GET /api/event/streak?wallet=0x... - Get player's streak data
export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get("wallet");
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Missing wallet" },
        { status: 400 }
      );
    }

    const redis = getRedis();
    const key = getStreakKey(wallet);
    let streakData = await redis.get<EventStreakData>(key);

    if (!streakData) {
      streakData = getDefaultStreakData();
    }

    // Check if streak has broken (more than 1 day since last activity)
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    if (
      streakData.lastActivityDate &&
      streakData.lastActivityDate !== today &&
      streakData.lastActivityDate !== yesterday
    ) {
      // Streak broken - reset current streak but keep longest
      streakData.currentStreak = 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        lastActivityDate: streakData.lastActivityDate,
        activityDates: streakData.activityDates.slice(-30), // Return last 30 days
        todayRecorded: streakData.lastActivityDate === today,
      },
    });
  } catch (error) {
    console.error("Error in streak GET:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch streak data" },
      { status: 500 }
    );
  }
}

// POST /api/event/streak - Record daily activity
export async function POST(request: NextRequest) {
  try {
    const { wallet } = await request.json();
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Missing wallet" },
        { status: 400 }
      );
    }

    const redis = getRedis();
    const key = getStreakKey(wallet);
    let streakData = await redis.get<EventStreakData>(key);

    if (!streakData) {
      streakData = getDefaultStreakData();
    }

    const today = getTodayDate();
    const yesterday = getYesterdayDate();

    // Check if already recorded today
    if (streakData.lastActivityDate === today) {
      return NextResponse.json({
        success: true,
        data: {
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          lastActivityDate: streakData.lastActivityDate,
          alreadyRecorded: true,
        },
        message: "Activity already recorded today",
      });
    }

    // Calculate new streak
    if (streakData.lastActivityDate === yesterday) {
      // Continuing streak
      streakData.currentStreak += 1;
    } else if (streakData.lastActivityDate === "") {
      // First activity ever
      streakData.currentStreak = 1;
    } else {
      // Streak broken - start fresh
      streakData.currentStreak = 1;
    }

    // Update longest streak if current exceeds it
    if (streakData.currentStreak > streakData.longestStreak) {
      streakData.longestStreak = streakData.currentStreak;
    }

    // Update last activity date
    streakData.lastActivityDate = today;

    // Add to activity dates (keep last 60 days for historical tracking)
    if (!streakData.activityDates.includes(today)) {
      streakData.activityDates.push(today);
      if (streakData.activityDates.length > 60) {
        streakData.activityDates = streakData.activityDates.slice(-60);
      }
    }

    streakData.lastUpdated = Date.now();

    await redis.set(key, streakData);

    return NextResponse.json({
      success: true,
      data: {
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        lastActivityDate: streakData.lastActivityDate,
        newStreak: true,
      },
    });
  } catch (error) {
    console.error("Error in streak POST:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record streak" },
      { status: 500 }
    );
  }
}
