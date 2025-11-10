import { NextRequest, NextResponse } from "next/server";
import { checkAndUpdateReferralEligibility } from "@lib/kv-referrals";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

/**
 * POST /api/referral/check-eligibility
 * Check if a user has reached 25k AP AND 3 drip claims and update their referral eligibility
 */
export async function POST(req: NextRequest) {
  try {
    const { wallet, alienPoints } = await req.json();

    if (!wallet || alienPoints === undefined) {
      return NextResponse.json(
        { error: "wallet and alienPoints are required" },
        { status: 400 }
      );
    }

    // Fetch user data to get drip claim count
    const normalizedWallet = wallet.toLowerCase();
    const userDataKey = `gumbuo:user_data:${normalizedWallet}`;
    const userData = await redis.get<any>(userDataKey);

    // Count faucet claims
    let dripClaimCount = 0;
    if (userData && userData.claimHistory) {
      dripClaimCount = userData.claimHistory.filter((claim: any) => claim.type === 'faucet').length;
    }

    const becameEligible = await checkAndUpdateReferralEligibility(wallet, alienPoints, dripClaimCount);

    return NextResponse.json({
      success: true,
      becameEligible,
      dripClaimCount,
      message: becameEligible
        ? "Referral is now eligible!"
        : "Referral eligibility unchanged",
    });
  } catch (error) {
    console.error("Error checking referral eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check eligibility", details: (error as Error).message },
      { status: 500 }
    );
  }
}
