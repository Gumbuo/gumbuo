import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const REFERRAL_DATA_KEY = (referredWallet: string) => `referral:data:${referredWallet.toLowerCase()}`;

/**
 * GET /api/referral/my-status?wallet=0x...
 * Check if the current user was referred by someone and get their referral status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: "wallet is required" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const referralData = await kv.get<any>(REFERRAL_DATA_KEY(normalizedWallet));

    if (!referralData) {
      return NextResponse.json({
        success: true,
        wasReferred: false,
        referralData: null,
      });
    }

    return NextResponse.json({
      success: true,
      wasReferred: true,
      referralData,
    });
  } catch (error) {
    console.error("Error checking referral status:", error);
    return NextResponse.json(
      { error: "Failed to check referral status", details: (error as Error).message },
      { status: 500 }
    );
  }
}
