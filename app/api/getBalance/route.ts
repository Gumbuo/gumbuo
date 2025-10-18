import { NextResponse } from "next/server";

const walletClaims: Record<string, { balance: number; gmb: number; lastSpin?: number }> = {};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");

  if (!wallet || typeof wallet !== "string") {
    return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
  }

  if (!walletClaims[wallet]) {
    walletClaims[wallet] = { balance: 100, gmb: 42069 };
  }

  return NextResponse.json(walletClaims[wallet]);
}
