import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Lazy initialization to avoid build-time errors
let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error("Redis environment variables not configured");
    }
    _redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
  return _redis;
}

const POOL_KEY = "gumbuo:points:pool";
const BALANCE_PREFIX = "gumbuo:points:balance:"; // Individual key per user
const LEGACY_BALANCES_KEY = "gumbuo:points:balances"; // Old combined key for migration

// Helper to get user balance key
function getBalanceKey(wallet: string): string {
  return `${BALANCE_PREFIX}${wallet.toLowerCase()}`;
}

// Get user balance with migration support
async function getUserBalance(wallet: string): Promise<number> {
  const redis = getRedis();
  const normalizedWallet = wallet.toLowerCase();
  const balanceKey = getBalanceKey(normalizedWallet);

  // Try new individual key first
  const balance = await redis.get<number>(balanceKey);
  if (balance !== null) {
    return balance;
  }

  // Fall back to legacy combined key and migrate
  const legacyBalances = await redis.get<Record<string, number>>(LEGACY_BALANCES_KEY);
  if (legacyBalances && legacyBalances[normalizedWallet] !== undefined) {
    const userBalance = legacyBalances[normalizedWallet];
    // Migrate to individual key
    await redis.set(balanceKey, userBalance);
    return userBalance;
  }

  // New user - give starting balance
  const startingBalance = 5000;
  await redis.set(balanceKey, startingBalance);
  return startingBalance;
}

// Set user balance
async function setUserBalance(wallet: string, balance: number): Promise<void> {
  const redis = getRedis();
  const balanceKey = getBalanceKey(wallet.toLowerCase());
  await redis.set(balanceKey, balance);
}

interface AlienPointsPool {
  totalSupply: number;
  wheelPool: number;
  faucetPool: number;
  reservePool: number;
  marketplacePool: number; // Points collected from alien pic purchases
  bossPool: number; // Boss battle reward pool
  stakingPool: number; // Staking reward pool
  totalDistributed: number;
  totalAliensBurned: number; // Total aliens burned in arena
}

interface UserBalances {
  [address: string]: number;
}

const INITIAL_POOL: AlienPointsPool = {
  totalSupply: 550_000_000,
  wheelPool: 100_000_000,
  faucetPool: 100_000_000,
  reservePool: 150_000_000,
  marketplacePool: 0, // Grows as users spend points on alien pics
  bossPool: 100_000_000, // Boss battle reward pool
  stakingPool: 100_000_000, // Staking reward pool
  totalDistributed: 0,
  totalAliensBurned: 0, // Total aliens burned in arena
};

// In-memory cache for pool data (10 second TTL - pool changes less often)
let poolCache: { data: AlienPointsPool | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};
const POOL_CACHE_TTL = 10000; // 10 seconds

// GET /api/points - Get pool status and user balance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const now = Date.now();
    const redis = getRedis();

    // Try to use cached pool data
    let pool: AlienPointsPool;
    if (poolCache.data && (now - poolCache.timestamp) < POOL_CACHE_TTL) {
      pool = poolCache.data;
    } else {
      // Fetch from Redis
      const fetchedPool = await redis.get<AlienPointsPool>(POOL_KEY);
      if (!fetchedPool) {
        pool = INITIAL_POOL;
        await redis.set(POOL_KEY, pool);
      } else {
        pool = fetchedPool;
      }
      // Update cache
      poolCache = { data: pool, timestamp: now };
    }

    // Get user balance if wallet provided (individual key lookup - much faster!)
    let userBalance = 0;
    if (wallet) {
      userBalance = await getUserBalance(wallet);
    }

    return NextResponse.json({
      success: true,
      pool,
      userBalance,
    });
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch points", details: String(error) },
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

    if (source !== 'wheel' && source !== 'faucet' && source !== 'arena' && source !== 'boss' && source !== 'staking' && source !== 'arcade') {
      return NextResponse.json(
        { success: false, error: "Invalid source" },
        { status: 400 }
      );
    }

    const redis = getRedis();
    const normalizedWallet = wallet.toLowerCase();

    // Get current pool
    let pool = await redis.get<AlienPointsPool>(POOL_KEY) || INITIAL_POOL;

    // Only check pool limits for GMB token rewards (boss)
    // Alien points (wheel, faucet, staking, arena) are unlimited
    if (source === 'boss') {
      if (pool.bossPool < points) {
        return NextResponse.json({
          success: false,
          error: `Insufficient boss pool balance`,
        });
      }
      pool.bossPool -= points;
    }

    // Track total distributed (for stats only, not enforced)
    pool.totalDistributed += points;

    // Update user balance (individual key)
    const currentBalance = await getUserBalance(normalizedWallet);
    const newBalance = currentBalance + points;
    await setUserBalance(normalizedWallet, newBalance);

    // Save pool to database
    await redis.set(POOL_KEY, pool);

    // Update cache
    poolCache = { data: pool, timestamp: Date.now() };

    return NextResponse.json({
      success: true,
      pool,
      userBalance: newBalance,
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

    const redis = getRedis();
    const normalizedWallet = wallet.toLowerCase();

    // Get current pool
    let pool = await redis.get<AlienPointsPool>(POOL_KEY) || INITIAL_POOL;

    // Check if user has enough points (individual key lookup)
    const userBalance = await getUserBalance(normalizedWallet);
    if (userBalance < points) {
      return NextResponse.json({
        success: false,
        error: "Insufficient points balance",
      });
    }

    // Deduct points from user
    const newBalance = userBalance - points;
    await setUserBalance(normalizedWallet, newBalance);

    // Save pool to database (in case we need to update it later)
    await redis.set(POOL_KEY, pool);

    // Update cache
    poolCache = { data: pool, timestamp: Date.now() };

    return NextResponse.json({
      success: true,
      pool,
      userBalance: newBalance,
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

    const redis = getRedis();

    // Get current pool
    let pool = await redis.get<AlienPointsPool>(POOL_KEY) || INITIAL_POOL;

    // Add to marketplace/burn pool
    pool.marketplacePool += amount;

    // Save to database
    await redis.set(POOL_KEY, pool);

    // Update cache
    poolCache = { data: pool, timestamp: Date.now() };

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

// DELETE endpoint removed for security - data reset should only be done directly in Vercel KV dashboard
