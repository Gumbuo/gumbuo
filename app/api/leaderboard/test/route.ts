import { NextResponse } from "next/server";

// Simple test endpoint to check if Vercel KV environment variables are set
export async function GET() {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  return NextResponse.json({
    kvConfigured: !!(kvUrl && kvToken),
    hasUrl: !!kvUrl,
    hasToken: !!kvToken,
    message: kvUrl && kvToken
      ? "Vercel KV is configured"
      : "Vercel KV is NOT configured - please set up KV database in Vercel dashboard",
  });
}
