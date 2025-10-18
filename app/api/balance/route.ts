import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");

  // Simulated response — replace with actual logic
  const alienPoints = wallet === "0xYourWalletAddress" ? 42 : 0;

  return new Response(JSON.stringify({ alienPoints }), {
    headers: { "Content-Type": "application/json" },
  });
}
