import { NextRequest, NextResponse } from "next/server";
import { checkAndUpdateReferralEligibility } from "@lib/kv-referrals";

/**
 * POST /api/referral/check-eligibility
 * Check if a user has reached 25k AP and update their referral eligibility
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

    const becameEligible = await checkAndUpdateReferralEligibility(wallet, alienPoints);

    return NextResponse.json({
      success: true,
      becameEligible,
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
