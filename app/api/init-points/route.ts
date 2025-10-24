import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const POOL_KEY = "gumbuo:points:pool";
const BALANCES_KEY = "gumbuo:points:balances";

// Existing users from leaderboard
// Total: 5250 AP distributed (250 from wheel, 5000 from faucet)
const existingUsers = [
  { wallet: "0xb374735CBe89A552421ddb4Aad80380ae40f67a7", points: 5075, wheelPoints: 75, faucetPoints: 5000 },
  { wallet: "0x7092C339B172a0d13f38926EE8fE1C815663cfc9", points: 100, wheelPoints: 100, faucetPoints: 0 },
  { wallet: "0x6D2861098A1D3487C90Ce8F91060E43B0Edbc1f1", points: 75, wheelPoints: 75, faucetPoints: 0 },
];
// Wheel total: 75 + 100 + 75 = 250 AP
// Faucet total: 5000 AP

export async function GET() {
  try {
    // Calculate totals
    const totalWheelPoints = existingUsers.reduce((sum, user) => sum + user.wheelPoints, 0);
    const totalFaucetPoints = existingUsers.reduce((sum, user) => sum + user.faucetPoints, 0);
    const totalPoints = totalWheelPoints + totalFaucetPoints;

    // Create adjusted pool
    const adjustedPool = {
      totalSupply: 350_000_000,
      wheelPool: 100_000_000 - totalWheelPoints,
      faucetPool: 100_000_000 - totalFaucetPoints,
      reservePool: 150_000_000,
      marketplacePool: 0,
      totalDistributed: totalPoints,
    };

    // Create user balances
    const userBalances: Record<string, number> = {};
    existingUsers.forEach(user => {
      userBalances[user.wallet.toLowerCase()] = user.points;
    });

    // Save to database
    await redis.set(POOL_KEY, adjustedPool);
    await redis.set(BALANCES_KEY, userBalances);

    return NextResponse.json({
      success: true,
      message: "Points system initialized with existing leaderboard data",
      pool: adjustedPool,
      userBalances,
      summary: {
        wheelDistributed: totalWheelPoints,
        faucetDistributed: totalFaucetPoints,
        totalDistributed: totalPoints,
        usersInitialized: existingUsers.length,
      }
    });
  } catch (error) {
    console.error("Error initializing points:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize points system" },
      { status: 500 }
    );
  }
}
