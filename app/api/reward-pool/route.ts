import { NextResponse } from "next/server";
import { createPublicClient, http, formatEther } from "viem";
import { base } from "viem/chains";

// Reward pool wallet address on Base chain
const REWARD_POOL_WALLET = "0xEd6f38abbc7433Bc2184c18eBC416aDa53731f4B";

// Base chain RPC - use public endpoint or env variable
const BASE_RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";

const baseClient = createPublicClient({
  chain: base,
  transport: http(BASE_RPC_URL),
});

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const balance = await baseClient.getBalance({
      address: REWARD_POOL_WALLET as `0x${string}`,
    });
    clearTimeout(timeout);

    // Convert from wei to ETH
    const ethBalance = formatEther(balance);

    return NextResponse.json({
      success: true,
      balance: ethBalance,
      balanceWei: balance.toString(),
      wallet: REWARD_POOL_WALLET,
    });
  } catch (err: any) {
    clearTimeout(timeout);
    console.error("Reward pool balance fetch failed:", err);
    return NextResponse.json({
      success: false,
      balance: "0",
      error: err.message
    });
  }
}
