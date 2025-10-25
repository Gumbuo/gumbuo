import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const BALANCES_KEY = "gumbuo:points:balances";

interface UserBalances {
  [address: string]: number;
}

// GET /api/migrate-users - Give all existing users 5000 AP minimum
export async function GET() {
  try {
    // Get all current balances
    let balances = await redis.get<UserBalances>(BALANCES_KEY) || {};

    let usersUpdated = 0;
    let usersAlreadyAbove5000 = 0;

    // Update all users who have less than 5000 AP to have 5000 AP
    for (const [wallet, balance] of Object.entries(balances)) {
      if (balance < 5000) {
        balances[wallet] = 5000;
        usersUpdated++;
      } else {
        usersAlreadyAbove5000++;
      }
    }

    // Save updated balances
    if (usersUpdated > 0) {
      await redis.set(BALANCES_KEY, balances);
    }

    return NextResponse.json({
      success: true,
      message: "Migration completed",
      usersUpdated,
      usersAlreadyAbove5000,
      totalUsers: Object.keys(balances).length,
    });
  } catch (error) {
    console.error("Error migrating users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to migrate users" },
      { status: 500 }
    );
  }
}
