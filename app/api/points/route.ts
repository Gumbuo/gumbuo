import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const POOL_KEY = "gumbuo:points:pool";
const BALANCES_KEY = "gumbuo:points:balances";

interface AlienPointsPool {
  totalSupply: number;
  wheelPool: number;
  faucetPool: number;
  reservePool: number;
  marketplacePool: number; // Points collected from alien pic purchases
  totalDistributed: number;
}

interface UserBalances {
  [address: string]: number;
}

const INITIAL_POOL: AlienPointsPool = {
  totalSupply: 350_000_000,
  wheelPool: 100_000_000,
  faucetPool: 100_000_000,
  reservePool: 150_000_000,
  marketplacePool: 0, // Grows as users spend points on alien pics
  totalDistributed: 0,
};

// GET /api/points - Get pool status and user balance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    // Get pool data
    let pool = await redis.get<AlienPointsPool>(POOL_KEY);
    if (!pool) {
      pool = INITIAL_POOL;
      await redis.set(POOL_KEY, pool);
    }

    // Get user balance if wallet provided
    let userBalance = 0;
    if (wallet) {
      const balances = await redis.get<UserBalances>(BALANCES_KEY) || {};
      userBalance = balances[wallet.toLowerCase()] || 0;
    }

    return NextResponse.json({
      success: true,
      pool,
      userBalance,
    });
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch points" },
      { status: 500 }
    );
  }
}

// POST /api/points - Award points to user (wheel spin or faucet claim)
export async function POST(request: NextRequest) {
  try {
    const { wallet, points, source } = await request.json();

    if (!wallet || typeof points !== 'number' || !source) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    if (source !== 'wheel' && source !== 'faucet' && source !== 'arena') {
      return NextResponse.json(
        { success: false, error: "Invalid source" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();

    // Get current pool and balances
    let pool = await redis.get<AlienPointsPool>(POOL_KEY) || INITIAL_POOL;
    let balances = await redis.get<UserBalances>(BALANCES_KEY) || {};

    // Check if pool has enough points (arena awards from reserve pool)
    let poolAmount;
    if (source === 'wheel') {
      poolAmount = pool.wheelPool;
    } else if (source === 'faucet') {
      poolAmount = pool.faucetPool;
    } else if (source === 'arena') {
      poolAmount = pool.reservePool; // Arena prizes come from reserve
    }

    if (poolAmount && poolAmount < points) {
      return NextResponse.json({
        success: false,
        error: `Insufficient ${source} pool balance`,
      });
    }

    // Safety check: Don't exceed total supply
    if (pool.totalDistributed + points > pool.totalSupply) {
      return NextResponse.json({
        success: false,
        error: "Total supply limit reached",
      });
    }

    // Update pool
    if (source === 'wheel') {
      pool.wheelPool -= points;
    } else if (source === 'faucet') {
      pool.faucetPool -= points;
    } else if (source === 'arena') {
      pool.reservePool -= points; // Arena prizes come from reserve
    }
    pool.totalDistributed += points;

    // Update user balance
    balances[normalizedWallet] = (balances[normalizedWallet] || 0) + points;

    // Save to database
    await redis.set(POOL_KEY, pool);
    await redis.set(BALANCES_KEY, balances);

    return NextResponse.json({
      success: true,
      pool,
      userBalance: balances[normalizedWallet],
      awarded: points,
    });
  } catch (error) {
    console.error("Error awarding points:", error);
    return NextResponse.json(
      { success: false, error: "Failed to award points" },
      { status: 500 }
    );
  }
}

// PATCH /api/points - Spend points (marketplace purchases)
export async function PATCH(request: NextRequest) {
  try {
    const { wallet, points, itemName } = await request.json();

    if (!wallet || typeof points !== 'number' || !itemName) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();

    // Get current pool and balances
    let pool = await redis.get<AlienPointsPool>(POOL_KEY) || INITIAL_POOL;
    let balances = await redis.get<UserBalances>(BALANCES_KEY) || {};

    // Check if user has enough points
    const userBalance = balances[normalizedWallet] || 0;
    if (userBalance < points) {
      return NextResponse.json({
        success: false,
        error: "Insufficient points balance",
      });
    }

    // Deduct points from user
    balances[normalizedWallet] = userBalance - points;

    // Add to appropriate pool based on item type
    if (itemName.includes("Arena Entry Fee")) {
      // Arena entry fees: 500 AP per player, but only 200 AP house fee goes to burn pool
      // The rest is paid out to winner (800 AP), so we only add the house fee (200 AP) to marketplace pool
      // We need to track this per fight, not per entry
      // For now, don't add anything to marketplace pool on entry - it will be added when fight completes
    } else {
      // Marketplace purchases go fully to marketplace pool
      pool.marketplacePool += points;
    }

    // Save to database
    await redis.set(POOL_KEY, pool);
    await redis.set(BALANCES_KEY, balances);

    return NextResponse.json({
      success: true,
      pool,
      userBalance: balances[normalizedWallet],
      spent: points,
      item: itemName,
    });
  } catch (error) {
    console.error("Error spending points:", error);
    return NextResponse.json(
      { success: false, error: "Failed to spend points" },
      { status: 500 }
    );
  }
}

// PUT /api/points - Add to burn pool (arena house fee)
export async function PUT(request: NextRequest) {
  try {
    const { amount } = await request.json();

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Get current pool
    let pool = await redis.get<AlienPointsPool>(POOL_KEY) || INITIAL_POOL;

    // Add to marketplace/burn pool
    pool.marketplacePool += amount;

    // Save to database
    await redis.set(POOL_KEY, pool);

    return NextResponse.json({
      success: true,
      pool,
      added: amount,
    });
  } catch (error) {
    console.error("Error adding to burn pool:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to burn pool" },
      { status: 500 }
    );
  }
}

// DELETE /api/points - Reset pools (admin only, for testing)
export async function DELETE() {
  try {
    await redis.set(POOL_KEY, INITIAL_POOL);
    await redis.set(BALANCES_KEY, {});

    return NextResponse.json({
      success: true,
      message: "Pools reset to initial state",
    });
  } catch (error) {
    console.error("Error resetting pools:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset pools" },
      { status: 500 }
    );
  }
}
