import { NextResponse } from "next/server";

let wheelPoolRemaining = 100_000_000;
const walletClaims: Record<string, { balance: number; gmb: number; lastSpin?: number }> = {};

export async function POST(req: Request) {
  const { amount, walletAddress } = await req.json();

  if (!walletAddress || typeof walletAddress !== "string") {
    return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
  }

  if (!walletClaims[walletAddress]) {
    walletClaims[walletAddress] = { balance: 100, gmb: 42069 };
  }

  const now = Date.now();
  const last = walletClaims[walletAddress].lastSpin || 0;
  if (now - last < 86400000) {
    return NextResponse.json({ error: "Cooldown active" }, { status: 403 });
  }

  walletClaims[walletAddress].balance += amount;
  walletClaims[walletAddress].lastSpin = now;
  wheelPoolRemaining -= amount;

  return NextResponse.json({
    success: true,
    claimed: amount,
    wallet: walletAddress,
    walletTotal: walletClaims[walletAddress].balance,
    remaining: wheelPoolRemaining,
    total: 100_000_000
  });
}
