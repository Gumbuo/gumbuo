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
  j3d1: number;
  zit: number;
  comingsoon: number;
}

// GET /api/alien-sales - Fetch sales counts
export async function GET() {
  try {
    const storedSales = await redis.get<Partial<AlienSales>>(SALES_KEY);

    // Merge with defaults to ensure all aliens have a count
    const sales: AlienSales = {
      nyx: storedSales?.nyx || 0,
      zorb: storedSales?.zorb || 0,
      baob: storedSales?.baob || 0,
      apelian: storedSales?.apelian || 0,
      j3d1: storedSales?.j3d1 || 0,
      zit: storedSales?.zit || 0,
      comingsoon: storedSales?.comingsoon || 0,
    };

    // Update Redis with complete data if any fields were missing
    if (!storedSales || Object.keys(storedSales).length < 7) {
      await redis.set(SALES_KEY, sales);
    }

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

    if (!alienId || !["nyx", "zorb", "baob", "apelian", "j3d1", "zit", "comingsoon"].includes(alienId)) {
      return NextResponse.json(
        { success: false, error: "Invalid alien ID" },
        { status: 400 }
      );
    }

    // Fetch current sales
    const storedSales = await redis.get<Partial<AlienSales>>(SALES_KEY);

    // Merge with defaults to ensure all aliens have a count
    const sales: AlienSales = {
      nyx: storedSales?.nyx || 0,
      zorb: storedSales?.zorb || 0,
      baob: storedSales?.baob || 0,
      apelian: storedSales?.apelian || 0,
      j3d1: storedSales?.j3d1 || 0,
      zit: storedSales?.zit || 0,
      comingsoon: storedSales?.comingsoon || 0,
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
