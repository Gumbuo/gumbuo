import { Redis } from "@upstash/redis";

// Lazy initialization to avoid build-time errors
let _redis: Redis | null = null;

export function getRedis(): Redis {
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

const BALANCE_PREFIX = "gumbuo:points:balance:";
const LEGACY_BALANCES_KEY = "gumbuo:points:balances";

// Helper to get user balance key
export function getBalanceKey(wallet: string): string {
  return `${BALANCE_PREFIX}${wallet.toLowerCase()}`;
}

// Get user balance with migration support
export async function getUserBalance(wallet: string): Promise<number> {
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
export async function setUserBalance(wallet: string, balance: number): Promise<void> {
  const redis = getRedis();
  const balanceKey = getBalanceKey(wallet.toLowerCase());
  await redis.set(balanceKey, balance);
}

// Add points to user balance (returns new balance)
export async function addUserPoints(wallet: string, points: number): Promise<number> {
  const currentBalance = await getUserBalance(wallet);
  const newBalance = currentBalance + points;
  await setUserBalance(wallet, newBalance);
  return newBalance;
}

// Deduct points from user balance (returns new balance, throws if insufficient)
export async function deductUserPoints(wallet: string, points: number): Promise<number> {
  const currentBalance = await getUserBalance(wallet);
  if (currentBalance < points) {
    throw new Error("Insufficient points balance");
  }
  const newBalance = currentBalance - points;
  await setUserBalance(wallet, newBalance);
  return newBalance;
}
