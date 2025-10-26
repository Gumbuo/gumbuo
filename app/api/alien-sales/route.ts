import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const SALES_KEY = "gumbuo:alien_sales";

// Initialize Redis client with Vercel KV environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

interface AlienSales {
  nyx: number;
  zorb: number;
  baob: number;
  apelian: number;
}

// GET /api/alien-sales - Fetch sales counts
export async function GET() {
  try {
    const sales = await redis.get<AlienSales>(SALES_KEY) || {
      nyx: 0,
      zorb: 0,
      baob: 0,
      apelian: 0,
    };

    return NextResponse.json({
      success: true,
      sales,
    });
  } catch (error) {
    console.error("Error fetching alien sales:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

// POST /api/alien-sales - Increment sales count for an alien
export async function POST(request: NextRequest) {
  try {
    const { alienId } = await request.json();

    if (!alienId || !["nyx", "zorb", "baob", "apelian"].includes(alienId)) {
      return NextResponse.json(
        { success: false, error: "Invalid alien ID" },
        { status: 400 }
      );
    }

    // Fetch current sales
    const sales = await redis.get<AlienSales>(SALES_KEY) || {
      nyx: 0,
      zorb: 0,
      baob: 0,
      apelian: 0,
    };

    // Increment the count
    sales[alienId as keyof AlienSales]++;

    // Save back to Redis
    await redis.set(SALES_KEY, sales);

    return NextResponse.json({
      success: true,
      sales,
    });
  } catch (error) {
    console.error("Error incrementing alien sales:", error);
    return NextResponse.json(
      { success: false, error: "Failed to increment sales" },
      { status: 500 }
    );
  }
}
