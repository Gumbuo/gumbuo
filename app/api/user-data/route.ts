import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const USER_DATA_KEY_PREFIX = "gumbuo:user_data:";

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

interface AttackLevels {
  normal: number;
  power: number;
  ultimate: number;
}

interface BossCooldowns {
  powerAttackTime: number;
  ultimateAttackTime: number;
}

interface UserGameData {
  ownedAliens: OwnedAlien[];
  attackLevels: AttackLevels;
  bossRewardClaimed: boolean;
  bossCooldowns: BossCooldowns;
  lastUpdated: number;
}

const EMPTY_USER_DATA: UserGameData = {
  ownedAliens: [],
  attackLevels: { normal: 1, power: 1, ultimate: 1 },
  bossRewardClaimed: false,
  bossCooldowns: { powerAttackTime: 0, ultimateAttackTime: 0 },
  lastUpdated: Date.now(),
};

// GET /api/user-data?wallet=0x... - Fetch user's game data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const userDataKey = `${USER_DATA_KEY_PREFIX}${normalizedWallet}`;

    const userData = await redis.get<UserGameData>(userDataKey) || EMPTY_USER_DATA;

    return NextResponse.json({
      success: true,
      userData,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

// POST /api/user-data - Update user's game data (partial updates supported)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, ...updates } = body;

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const userDataKey = `${USER_DATA_KEY_PREFIX}${normalizedWallet}`;

    // Fetch current data
    const currentData = await redis.get<UserGameData>(userDataKey) || EMPTY_USER_DATA;

    // Merge updates with current data
    const updatedData: UserGameData = {
      ...currentData,
      ...updates,
      lastUpdated: Date.now(),
    };

    // Save to Redis
    await redis.set(userDataKey, updatedData);

    return NextResponse.json({
      success: true,
      userData: updatedData,
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user data" },
      { status: 500 }
    );
  }
}

// DELETE /api/user-data?wallet=0x... - Clear user's game data (for testing/migration)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const userDataKey = `${USER_DATA_KEY_PREFIX}${normalizedWallet}`;

    await redis.set(userDataKey, EMPTY_USER_DATA);

    return NextResponse.json({
      success: true,
      message: "User data reset",
    });
  } catch (error) {
    console.error("Error deleting user data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user data" },
      { status: 500 }
    );
  }
}
