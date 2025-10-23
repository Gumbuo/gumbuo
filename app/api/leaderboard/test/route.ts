import { NextResponse } from "next/server";

// Simple test endpoint to check if KV environment variables are set
export async function GET() {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  return NextResponse.json({
    kvConfigured: !!(kvUrl && kvToken),
    hasUrl: !!kvUrl,
    hasToken: !!kvToken,
    kvUrl: kvUrl ? kvUrl.substring(0, 30) + '...' : 'NOT SET',
    message: kvUrl && kvToken
      ? "KV is configured correctly!"
      : "KV is NOT configured - check environment variables",
  });
}
