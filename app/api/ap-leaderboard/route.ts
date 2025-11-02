import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { Redis } from "@upstash/redis";

const AP_LEADERBOARD_KEY = 'ap_leaderboard';
const USER_DATA_KEY_PREFIX = "gumbuo:user_data:";

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

interface APLeaderboardEntry {
  wallet: string;
  alienPoints: number;
  lastUpdated: number;
}

interface GameStats {
  aliensPurchased?: number;
  apSpentOnAliens?: number;
  arenaBattlesFought?: number;
  arenaBattlesWon?: number;
  arenaBattlesLost?: number;
  bossAttacksTotal?: number;
  bossAPSpent?: number;
  bossDamageDealt?: number;
  normalAttacksUsed?: number;
  powerAttacksUsed?: number;
  ultimateAttacksUsed?: number;
}

interface DetailedLeaderboardEntry extends APLeaderboardEntry {
  rank: number;
  gmbHoldings?: {
    base: number;
    abstract: number;
    arbitrum: number;
    blast: number;
    total: number;
  };
  stakedAmount?: number;
  totalStakingClaims?: number;
  totalFaucetClaims?: number;
  gameStats?: GameStats;
}

// GET - Fetch the AP leaderboard with detailed stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('includeDetails') === 'true';

    const leaderboard = await kv.get<Record<string, APLeaderboardEntry>>(AP_LEADERBOARD_KEY) || {};

    // Convert to array and sort by alienPoints (descending)
    let sortedLeaderboard = Object.values(leaderboard)
      .sort((a, b) => b.alienPoints - a.alienPoints)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

    // If includeDetails is true, fetch user data for each wallet
    if (includeDetails) {
      const detailedLeaderboard: DetailedLeaderboardEntry[] = await Promise.all(
        sortedLeaderboard.map(async (entry) => {
          try {
            const userDataKey = `${USER_DATA_KEY_PREFIX}${entry.wallet.toLowerCase()}`;
            const userData = await redis.get<any>(userDataKey);

            return {
              ...entry,
              gmbHoldings: userData?.gmbHoldings || { base: 0, abstract: 0, arbitrum: 0, blast: 0, total: 0 },
              stakedAmount: userData?.stakingData?.stakedAmount || 0,
              totalStakingClaims: userData?.totalStakingClaims || 0,
              totalFaucetClaims: userData?.totalFaucetClaims || 0,
              gameStats: userData?.gameStats || {
                aliensPurchased: 0,
                apSpentOnAliens: 0,
                arenaBattlesFought: 0,
                arenaBattlesWon: 0,
                arenaBattlesLost: 0,
                bossAttacksTotal: 0,
                bossAPSpent: 0,
                bossDamageDealt: 0,
                normalAttacksUsed: 0,
                powerAttacksUsed: 0,
                ultimateAttacksUsed: 0,
              },
            };
          } catch (error) {
            console.error(`Error fetching user data for ${entry.wallet}:`, error);
            return {
              ...entry,
              gmbHoldings: { base: 0, abstract: 0, arbitrum: 0, blast: 0, total: 0 },
              stakedAmount: 0,
              totalStakingClaims: 0,
              totalFaucetClaims: 0,
              gameStats: {
                aliensPurchased: 0,
                apSpentOnAliens: 0,
                arenaBattlesFought: 0,
                arenaBattlesWon: 0,
                arenaBattlesLost: 0,
                bossAttacksTotal: 0,
                bossAPSpent: 0,
                bossDamageDealt: 0,
                normalAttacksUsed: 0,
                powerAttacksUsed: 0,
                ultimateAttacksUsed: 0,
              },
            };
          }
        })
      );

      return NextResponse.json({
        success: true,
        leaderboard: detailedLeaderboard,
        totalUsers: detailedLeaderboard.length
      });
    }

    return NextResponse.json({
      success: true,
      leaderboard: sortedLeaderboard,
      totalUsers: sortedLeaderboard.length
    });
  } catch (error) {
    console.error('Error fetching AP leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

// POST - Update a user's AP
export async function POST(request: NextRequest) {
  try {
    const { wallet, alienPoints } = await request.json();

    if (!wallet || alienPoints === undefined) {
      return NextResponse.json(
        { success: false, error: 'Wallet and alienPoints are required' },
        { status: 400 }
      );
    }

    // Normalize wallet address to lowercase
    const normalizedWallet = wallet.toLowerCase();

    // Get current leaderboard
    const leaderboard = await kv.get<Record<string, APLeaderboardEntry>>(AP_LEADERBOARD_KEY) || {};

    // Update or add user
    leaderboard[normalizedWallet] = {
      wallet: normalizedWallet,
      alienPoints,
      lastUpdated: Date.now()
    };

    // Save back to KV
    await kv.set(AP_LEADERBOARD_KEY, leaderboard);

    // Get user's rank
    const sortedLeaderboard = Object.values(leaderboard)
      .sort((a, b) => b.alienPoints - a.alienPoints);

    const userRank = sortedLeaderboard.findIndex(
      entry => entry.wallet === normalizedWallet
    ) + 1;

    return NextResponse.json({
      success: true,
      entry: {
        wallet: normalizedWallet,
        alienPoints,
        rank: userRank,
        lastUpdated: Date.now()
      }
    });
  } catch (error) {
    console.error('Error updating AP leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update leaderboard' },
      { status: 500 }
    );
  }
}
