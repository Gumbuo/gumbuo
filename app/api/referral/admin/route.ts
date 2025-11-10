import { NextRequest, NextResponse } from "next/server";
import {
  getAllReferrals,
  getAllPendingRewards,
  createReward,
  markRewardPaid,
  getReferralStats,
} from "@lib/kv-referrals";

// Simple admin check - replace with your actual admin wallet(s)
const ADMIN_WALLETS = [
  process.env.NEXT_PUBLIC_ADMIN_WALLET?.toLowerCase(),
  // Add more admin wallets here
].filter(Boolean);

function isAdmin(wallet: string): boolean {
  return ADMIN_WALLETS.includes(wallet.toLowerCase());
}

/**
 * GET /api/referral/admin?adminWallet=0x...&action=...
 * Admin endpoints for managing referrals and rewards
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminWallet = searchParams.get("adminWallet");
    const action = searchParams.get("action");

    if (!adminWallet || !isAdmin(adminWallet)) {
      return NextResponse.json(
        { error: "Unauthorized: Not an admin" },
        { status: 403 }
      );
    }

    switch (action) {
      case "all-referrals":
        const limit = parseInt(searchParams.get("limit") || "100");
        const referrals = await getAllReferrals(limit);
        return NextResponse.json({ success: true, referrals });

      case "pending-rewards":
        const pendingRewards = await getAllPendingRewards();
        return NextResponse.json({ success: true, pendingRewards });

      case "user-stats":
        const wallet = searchParams.get("wallet");
        if (!wallet) {
          return NextResponse.json(
            { error: "Wallet address is required" },
            { status: 400 }
          );
        }
        const stats = await getReferralStats(wallet);
        return NextResponse.json({ success: true, ...stats });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in admin GET:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin data", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/referral/admin
 * Admin actions: create rewards, mark as paid
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adminWallet, action, referrerWallet, amount, note, rewardId, txHash } = body;

    if (!adminWallet || !isAdmin(adminWallet)) {
      return NextResponse.json(
        { error: "Unauthorized: Not an admin" },
        { status: 403 }
      );
    }

    switch (action) {
      case "create-reward":
        if (!referrerWallet || !amount) {
          return NextResponse.json(
            { error: "referrerWallet and amount are required" },
            { status: 400 }
          );
        }

        const reward = await createReward(referrerWallet, amount, note);

        return NextResponse.json({
          success: true,
          message: `Created ${amount} ETH reward for ${referrerWallet}`,
          reward,
        });

      case "mark-paid":
        if (!rewardId || !txHash) {
          return NextResponse.json(
            { error: "rewardId and txHash are required" },
            { status: 400 }
          );
        }

        const success = await markRewardPaid(rewardId, txHash);

        if (!success) {
          return NextResponse.json(
            { error: "Failed to mark reward as paid. Reward may not exist." },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: `Marked reward ${rewardId} as paid`,
        });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in admin POST:", error);
    return NextResponse.json(
      { error: "Failed to perform admin action", details: (error as Error).message },
      { status: 500 }
    );
  }
}
