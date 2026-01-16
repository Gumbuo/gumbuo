import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import {
  ArmorySaveState,
  ArmoryResources,
  CraftingQueue,
  StationLevels,
  ArmoryProgress,
} from "../../base/components/armory/types";
import {
  DEFAULT_RESOURCES,
  DEFAULT_STATION_LEVELS,
  DEFAULT_PROGRESS,
  XP_REQUIREMENTS,
} from "../../base/components/armory/constants";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const SAVE_KEY_PREFIX = "armory:save:";

function getSaveKey(wallet: string): string {
  return `${SAVE_KEY_PREFIX}${wallet.toLowerCase()}`;
}

function createNewSave(wallet: string): ArmorySaveState {
  const now = Date.now();
  return {
    wallet: wallet.toLowerCase(),
    resources: { ...DEFAULT_RESOURCES },
    craftingQueues: {
      plasmaRefinery: [],
      voidForge: [],
      bioLab: [],
      quantumChamber: [],
      assemblyBay: [],
    },
    stationLevels: { ...DEFAULT_STATION_LEVELS },
    inventory: [],
    progress: { ...DEFAULT_PROGRESS },
    lastUpdated: now,
    createdAt: now,
  };
}

// Process any completed crafting jobs
function processCompletedJobs(saveState: ArmorySaveState): {
  saveState: ArmorySaveState;
  completedCount: number;
} {
  const now = Date.now();
  let completedCount = 0;

  // We'll process completed jobs when the collect endpoint is called
  // This function just counts how many are ready
  for (const stationId of Object.keys(saveState.craftingQueues) as (keyof CraftingQueue)[]) {
    const queue = saveState.craftingQueues[stationId];
    for (const job of queue) {
      if (job.endTime <= now) {
        completedCount++;
      }
    }
  }

  return { saveState, completedCount };
}

// GET /api/armory?wallet=0x... - Load save state
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 400 }
      );
    }

    const saveKey = getSaveKey(wallet);
    let saveState = await redis.get<ArmorySaveState>(saveKey);

    // Create new save if doesn't exist
    if (!saveState) {
      saveState = createNewSave(wallet);
      await redis.set(saveKey, saveState);
    }

    // Check for completed crafting jobs
    const { completedCount } = processCompletedJobs(saveState);

    // Update last login for daily bonus
    const today = new Date().toISOString().split("T")[0];
    if (saveState.progress.lastLoginDate !== today) {
      // Award daily login XP
      const wasYesterday =
        saveState.progress.lastLoginDate ===
        new Date(Date.now() - 86400000).toISOString().split("T")[0];

      saveState.progress.dailyLoginStreak = wasYesterday
        ? saveState.progress.dailyLoginStreak + 1
        : 1;
      saveState.progress.lastLoginDate = today;
      saveState.lastUpdated = Date.now();
      await redis.set(saveKey, saveState);
    }

    return NextResponse.json({
      success: true,
      data: saveState,
      completedJobsReady: completedCount,
    });
  } catch (error) {
    console.error("Error loading armory save:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load save" },
      { status: 500 }
    );
  }
}

// POST /api/armory - Create new save (reset)
export async function POST(request: NextRequest) {
  try {
    const { wallet, reset } = await request.json();

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
        { status: 400 }
      );
    }

    const saveKey = getSaveKey(wallet);

    // Check if save already exists
    const existingSave = await redis.get<ArmorySaveState>(saveKey);
    if (existingSave && !reset) {
      return NextResponse.json({
        success: true,
        data: existingSave,
        message: "Save already exists",
      });
    }

    // Create new save
    const saveState = createNewSave(wallet);
    await redis.set(saveKey, saveState);

    return NextResponse.json({
      success: true,
      data: saveState,
      message: reset ? "Save reset successfully" : "New save created",
    });
  } catch (error) {
    console.error("Error creating armory save:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create save" },
      { status: 500 }
    );
  }
}

// PATCH /api/armory - Update save state (generic update)
export async function PATCH(request: NextRequest) {
  try {
    const { wallet, updates } = await request.json();

    if (!wallet || !updates) {
      return NextResponse.json(
        { success: false, error: "Wallet and updates required" },
        { status: 400 }
      );
    }

    const saveKey = getSaveKey(wallet);
    let saveState = await redis.get<ArmorySaveState>(saveKey);

    if (!saveState) {
      return NextResponse.json(
        { success: false, error: "Save not found" },
        { status: 404 }
      );
    }

    // Apply updates (shallow merge for top-level properties)
    if (updates.resources) {
      saveState.resources = { ...saveState.resources, ...updates.resources };
    }
    if (updates.stationLevels) {
      saveState.stationLevels = {
        ...saveState.stationLevels,
        ...updates.stationLevels,
      };
    }
    if (updates.inventory) {
      saveState.inventory = updates.inventory;
    }
    if (updates.progress) {
      saveState.progress = { ...saveState.progress, ...updates.progress };
    }
    if (updates.craftingQueues) {
      saveState.craftingQueues = {
        ...saveState.craftingQueues,
        ...updates.craftingQueues,
      };
    }

    saveState.lastUpdated = Date.now();
    await redis.set(saveKey, saveState);

    return NextResponse.json({
      success: true,
      data: saveState,
    });
  } catch (error) {
    console.error("Error updating armory save:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update save" },
      { status: 500 }
    );
  }
}
