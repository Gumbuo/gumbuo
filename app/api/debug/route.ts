import { NextResponse } from "next/server";

// Debug endpoint to check what's deployed
export async function GET() {
  return NextResponse.json({
    status: "API is working!",
    timestamp: new Date().toISOString(),
    env: {
      hasKvUrl: !!process.env.KV_REST_API_URL,
      hasKvToken: !!process.env.KV_REST_API_TOKEN,
      kvUrlPrefix: process.env.KV_REST_API_URL?.substring(0, 30) + '...',
      nodeEnv: process.env.NODE_ENV,
    },
  });
}
