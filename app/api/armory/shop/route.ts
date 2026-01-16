import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { ArmorySaveState, RawResourceKey } from "../../../base/components/armory/types";
import { MATERIAL_COSTS } from "../../../base/components/armory/constants";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const SAVE_KEY_PREFIX = "armory:save:";
const BALANCES_KEY = "gumbuo:points:balances";

function getSaveKey(wallet: string): string {
  return `${SAVE_KEY_PREFIX}${wallet.toLowerCase()}`;
}

// POST /api/armory/shop - Purchase raw materials with AP
export async function POST(request: NextRequest) {
  try {
    const { wallet, resourceId, quantity } = await request.json();

    if (!wallet || !resourceId || !quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Validate resource type
    if (!(resourceId in MATERIAL_COSTS)) {
      return NextResponse.json(
        { success: false, error: "Invalid resource type" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const unitCost = MATERIAL_COSTS[resourceId as RawResourceKey];
    const totalCost = unitCost * quantity;

    // Get user's AP balance
    const balances = (await redis.get<Record<string, number>>(BALANCES_KEY)) || {};
    const userBalance = balances[normalizedWallet] || 0;

    if (userBalance < totalCost) {
      return NextResponse.json({
        success: false,
        error: `Insufficient AP. Need ${totalCost} AP, have ${userBalance} AP`,
      });
    }

    // Get armory save
    const saveKey = getSaveKey(wallet);
    const saveState = await redis.get<ArmorySaveState>(saveKey);

    if (!saveState) {
      return NextResponse.json(
        { success: false, error: "Armory save not found. Start the game first." },
        { status: 404 }
      );
    }

    // Deduct AP
    balances[normalizedWallet] = userBalance - totalCost;
    await redis.set(BALANCES_KEY, balances);

    // Add resources to inventory
    const typedResourceId = resourceId as RawResourceKey;
    saveState.resources[typedResourceId] =
      (saveState.resources[typedResourceId] || 0) + quantity;
    saveState.progress.totalAPSpent += totalCost;
    saveState.lastUpdated = Date.now();

    await redis.set(saveKey, saveState);

    return NextResponse.json({
      success: true,
      data: {
        resources: saveState.resources,
        apSpent: totalCost,
        newAPBalance: balances[normalizedWallet],
        purchased: { resourceId, quantity },
      },
    });
  } catch (error) {
    console.error("Error in armory shop:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}
