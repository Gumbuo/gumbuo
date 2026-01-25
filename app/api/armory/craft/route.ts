import { NextRequest, NextResponse } from "next/server";
import { ArmorySaveState, CraftingJob, StationId } from "../../../base/components/armory/types";
import { getRecipe, canCraftRecipe } from "../../../base/components/armory/data/recipes";
import { STATIONS, getStationQueueSize, getStationSpeedMultiplier } from "../../../base/components/armory/data/stations";
import { calculateSpeedUpCost } from "../../../base/components/armory/constants";
import { getRedis, getUserBalance, deductUserPoints } from "../../lib/points";

const SAVE_KEY_PREFIX = "armory:save:";

function getSaveKey(wallet: string): string {
  return `${SAVE_KEY_PREFIX}${wallet.toLowerCase()}`;
}

function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// POST /api/armory/craft - Start a new crafting job
export async function POST(request: NextRequest) {
  try {
    const { wallet, recipeId, stationId } = await request.json();

    if (!wallet || !recipeId || !stationId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const redis = getRedis();
    const saveKey = getSaveKey(wallet);
    const saveState = await redis.get<ArmorySaveState>(saveKey);

    if (!saveState) {
      return NextResponse.json(
        { success: false, error: "Armory save not found" },
        { status: 404 }
      );
    }

    // Validate recipe
    const recipe = getRecipe(recipeId);
    if (!recipe) {
      return NextResponse.json(
        { success: false, error: "Invalid recipe" },
        { status: 400 }
      );
    }

    // Validate station
    if (recipe.station !== stationId) {
      return NextResponse.json(
        { success: false, error: "Recipe cannot be crafted at this station" },
        { status: 400 }
      );
    }

    const typedStationId = stationId as StationId;
    const stationLevel = saveState.stationLevels[typedStationId];

    // Check if station is unlocked
    if (stationLevel === 0) {
      return NextResponse.json(
        { success: false, error: "Station is locked" },
        { status: 400 }
      );
    }

    // Check player level requirement
    if (saveState.progress.level < recipe.requiredLevel) {
      return NextResponse.json({
        success: false,
        error: `Requires level ${recipe.requiredLevel}`,
      });
    }

    // Check station level requirement
    if (stationLevel < recipe.requiredStationLevel) {
      return NextResponse.json({
        success: false,
        error: `Requires station level ${recipe.requiredStationLevel}`,
      });
    }

    // Check queue capacity
    const queue = saveState.craftingQueues[typedStationId];
    const maxQueueSize = getStationQueueSize(typedStationId, stationLevel);
    if (queue.length >= maxQueueSize) {
      return NextResponse.json({
        success: false,
        error: `Queue full. Max ${maxQueueSize} items.`,
      });
    }

    // Check resources
    if (!canCraftRecipe(recipe, saveState.resources as unknown as Record<string, number>)) {
      return NextResponse.json({
        success: false,
        error: "Insufficient resources",
      });
    }

    // Deduct resources
    for (const input of recipe.inputs) {
      saveState.resources[input.resource] -= input.quantity;
    }

    // Calculate craft time with station speed bonus
    const speedMultiplier = getStationSpeedMultiplier(typedStationId, stationLevel);
    const actualCraftTime = Math.ceil(recipe.craftTimeSeconds * speedMultiplier);

    // Determine start time (after any current jobs finish)
    const now = Date.now();
    let startTime = now;
    if (queue.length > 0) {
      const lastJob = queue[queue.length - 1];
      startTime = Math.max(now, lastJob.endTime);
    }

    // Create job
    const job: CraftingJob = {
      id: generateJobId(),
      recipeId,
      stationId: typedStationId,
      startTime,
      endTime: startTime + actualCraftTime * 1000,
      speedUpApplied: 0,
    };

    // Add to queue
    saveState.craftingQueues[typedStationId].push(job);
    saveState.lastUpdated = Date.now();

    await redis.set(saveKey, saveState);

    return NextResponse.json({
      success: true,
      data: {
        job,
        resources: saveState.resources,
        craftTimeSeconds: actualCraftTime,
      },
    });
  } catch (error) {
    console.error("Error starting craft:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start craft", details: String(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/armory/craft - Speed up a crafting job
export async function PATCH(request: NextRequest) {
  try {
    const { wallet, jobId, speedUpType } = await request.json();

    if (!wallet || !jobId || !speedUpType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (speedUpType !== "half" && speedUpType !== "instant") {
      return NextResponse.json(
        { success: false, error: "Invalid speed up type" },
        { status: 400 }
      );
    }

    const redis = getRedis();
    const normalizedWallet = wallet.toLowerCase();
    const saveKey = getSaveKey(wallet);
    const saveState = await redis.get<ArmorySaveState>(saveKey);

    if (!saveState) {
      return NextResponse.json(
        { success: false, error: "Armory save not found" },
        { status: 404 }
      );
    }

    // Find the job
    let foundJob: CraftingJob | null = null;
    let foundStationId: StationId | null = null;
    let jobIndex = -1;

    for (const stationId of Object.keys(saveState.craftingQueues) as StationId[]) {
      const queue = saveState.craftingQueues[stationId];
      const idx = queue.findIndex((j) => j.id === jobId);
      if (idx !== -1) {
        foundJob = queue[idx];
        foundStationId = stationId;
        jobIndex = idx;
        break;
      }
    }

    if (!foundJob || !foundStationId) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    const now = Date.now();
    const remainingMs = Math.max(0, foundJob.endTime - now);
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    if (remainingSeconds <= 0) {
      return NextResponse.json({
        success: false,
        error: "Job already complete",
      });
    }

    // Calculate cost
    const apCost = calculateSpeedUpCost(remainingSeconds, speedUpType);

    // Check AP balance (individual key lookup)
    const userBalance = await getUserBalance(normalizedWallet);

    if (userBalance < apCost) {
      return NextResponse.json({
        success: false,
        error: `Insufficient AP. Need ${apCost} AP, have ${userBalance} AP`,
      });
    }

    // Deduct AP (individual key update)
    const newBalance = await deductUserPoints(normalizedWallet, apCost);

    // Update job time
    if (speedUpType === "instant") {
      foundJob.endTime = now;
    } else {
      // Half time: reduce remaining time by half
      const newRemainingMs = remainingMs / 2;
      foundJob.endTime = now + newRemainingMs;
    }
    foundJob.speedUpApplied += apCost;

    // Update in save state
    saveState.craftingQueues[foundStationId][jobIndex] = foundJob;
    saveState.progress.totalAPSpent += apCost;
    saveState.lastUpdated = Date.now();

    await redis.set(saveKey, saveState);

    return NextResponse.json({
      success: true,
      data: {
        job: foundJob,
        apSpent: apCost,
        newAPBalance: newBalance,
      },
    });
  } catch (error) {
    console.error("Error speeding up craft:", error);
    return NextResponse.json(
      { success: false, error: "Failed to speed up craft", details: String(error) },
      { status: 500 }
    );
  }
}
