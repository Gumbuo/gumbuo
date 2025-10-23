import { NextResponse } from "next/server";

// Debug endpoint to check what's deployed
export async function GET() {
  return NextResponse.json({
    status: "API is working!",
    timestamp: new Date().toISOString(),
    env: {
      hasUpstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
      hasUpstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      nodeEnv: process.env.NODE_ENV,
    },
  });
}
