import { NextResponse } from "next/server";

// Simple test endpoint to check if Upstash Redis environment variables are set
export async function GET() {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  return NextResponse.json({
    kvConfigured: !!(upstashUrl && upstashToken),
    hasUrl: !!upstashUrl,
    hasToken: !!upstashToken,
    upstashUrl: upstashUrl ? upstashUrl.substring(0, 30) + '...' : 'NOT SET',
    message: upstashUrl && upstashToken
      ? "Upstash Redis is configured correctly!"
      : "Upstash Redis is NOT configured - check environment variables",
  });
}
