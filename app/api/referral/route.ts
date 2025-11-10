import { NextRequest, NextResponse } from "next/server";
import {
  recordReferral,
  getReferralStats,
  getReferrals,
} from "@lib/kv-referrals";

/**
 * POST /api/referral
 * Record a new referral when someone connects wallet via referral link
 */
export async function POST(req: NextRequest) {
  try {
    const { referrerWallet, referredWallet } = await req.json();

    if (!referrerWallet || !referredWallet) {
      return NextResponse.json(
        { error: "Both referrerWallet and referredWallet are required" },
        { status: 400 }
      );
    }

    // Get IP address for fraud detection
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    const success = await recordReferral(referrerWallet, referredWallet, ipAddress);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to record referral. User may already be referred or trying to self-refer." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully recorded referral from ${referrerWallet}`,
    });
  } catch (error) {
    console.error("Error recording referral:", error);
    return NextResponse.json(
      { error: "Failed to record referral", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/referral?wallet=0x...
 * Get referral stats for a wallet
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const stats = await getReferralStats(wallet);
    const referrals = await getReferrals(wallet);

    return NextResponse.json({
      success: true,
      ...stats,
      referredWallets: referrals,
    });
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral stats", details: (error as Error).message },
      { status: 500 }
    );
  }
}
