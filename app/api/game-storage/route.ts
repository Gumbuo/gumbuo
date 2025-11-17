import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const GAME_STORAGE_KEY_PREFIX = "gumbuo:game_storage:";

// Initialize Redis client with Vercel KV environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

interface GameStorageData {
  [key: string]: any;
}

// GET /api/game-storage?userId=username&file=filename - Fetch game storage file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const file = searchParams.get('file');

    if (!userId || !file) {
      return NextResponse.json(
        { success: false, error: "userId and file are required" },
        { status: 400 }
      );
    }

    const storageKey = `${GAME_STORAGE_KEY_PREFIX}${userId}:${file}`;
    const data = await redis.get<GameStorageData>(storageKey);

    return NextResponse.json({
      success: true,
      data: data || {},
      exists: !!data,
    });
  } catch (error) {
    console.error("Error fetching game storage:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch game storage" },
      { status: 500 }
    );
  }
}

// POST /api/game-storage - Save game storage file
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, file, data } = body;

    if (!userId || !file || !data) {
      return NextResponse.json(
        { success: false, error: "userId, file, and data are required" },
        { status: 400 }
      );
    }

    const storageKey = `${GAME_STORAGE_KEY_PREFIX}${userId}:${file}`;

    // Save to Redis
    await redis.set(storageKey, data);

    return NextResponse.json({
      success: true,
      message: "Game data saved successfully",
    });
  } catch (error) {
    console.error("Error saving game storage:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save game storage" },
      { status: 500 }
    );
  }
}

// PATCH /api/game-storage - Update specific keys in game storage file
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, file, updates } = body;

    if (!userId || !file || !updates) {
      return NextResponse.json(
        { success: false, error: "userId, file, and updates are required" },
        { status: 400 }
      );
    }

    const storageKey = `${GAME_STORAGE_KEY_PREFIX}${userId}:${file}`;

    // Fetch current data
    const currentData = await redis.get<GameStorageData>(storageKey) || {};

    // Deep merge updates
    const updatedData = deepMerge(currentData, updates);

    // Save to Redis
    await redis.set(storageKey, updatedData);

    return NextResponse.json({
      success: true,
      data: updatedData,
    });
  } catch (error) {
    console.error("Error updating game storage:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update game storage" },
      { status: 500 }
    );
  }
}

// DELETE /api/game-storage?userId=username&file=filename - Clear game storage file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const file = searchParams.get('file');

    if (!userId || !file) {
      return NextResponse.json(
        { success: false, error: "userId and file are required" },
        { status: 400 }
      );
    }

    const storageKey = `${GAME_STORAGE_KEY_PREFIX}${userId}:${file}`;
    await redis.del(storageKey);

    return NextResponse.json({
      success: true,
      message: "Game storage cleared",
    });
  } catch (error) {
    console.error("Error deleting game storage:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete game storage" },
      { status: 500 }
    );
  }
}

// Helper function to deep merge objects
function deepMerge(target: any, source: any): any {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }

  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}
