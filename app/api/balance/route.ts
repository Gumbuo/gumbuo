import { NextResponse } from "next/server";
import { contract } from "@lib/contract";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ balance: "0", error: "Missing wallet address" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const balance = await contract.read.balanceOf([wallet], {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return NextResponse.json({ balance });
  } catch (err: any) {
    clearTimeout(timeout);
    console.error("Balance fetch failed:", err);
    return NextResponse.json({ balance: "0", error: err.message });
  }
}
