import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { ArmorySaveState, StationId } from "../../../base/components/armory/types";
import { STATIONS, getUpgradeCost, isStationUnlocked } from "../../../base/components/armory/data/stations";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const SAVE_KEY_PREFIX = "armory:save:";
const BALANCES_KEY = "gumbuo:points:balances";

function getSaveKey(wallet: string): string {
  return `${SAVE_KEY_PREFIX}${wallet.toLowerCase()}`;
}

// POST /api/armory/upgrade - Upgrade a station
export async function POST(request: NextRequest) {
  try {
    const { wallet, stationId } = await request.json();

    if (!wallet || !stationId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate station ID
    if (!(stationId in STATIONS)) {
      return NextResponse.json(
        { success: false, error: "Invalid station" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const typedStationId = stationId as StationId;
    const saveKey = getSaveKey(wallet);
    const saveState = await redis.get<ArmorySaveState>(saveKey);

    if (!saveState) {
      return NextResponse.json(
        { success: false, error: "Armory save not found" },
        { status: 404 }
      );
    }

    const station = STATIONS[typedStationId];
    const currentLevel = saveState.stationLevels[typedStationId];

    // Check if station is unlocked
    if (currentLevel === 0) {
      // Check if player level is high enough to unlock
      if (!isStationUnlocked(typedStationId, saveState.progress.level)) {
        return NextResponse.json({
          success: false,
          error: `Station unlocks at level ${station.unlockLevel}`,
        });
      }
      // If player level is high enough but station is still 0, something went wrong
      // Auto-unlock it
      saveState.stationLevels[typedStationId] = 1;
      saveState.lastUpdated = Date.now();
      await redis.set(saveKey, saveState);

      return NextResponse.json({
        success: true,
        data: {
          stationId: typedStationId,
          newLevel: 1,
          stationLevels: saveState.stationLevels,
          message: "Station unlocked!",
        },
      });
    }

    // Check if already max level
    if (currentLevel >= station.maxLevel) {
      return NextResponse.json({
        success: false,
        error: "Station is already max level",
      });
    }

    // Get upgrade cost
    const upgradeCost = getUpgradeCost(typedStationId, currentLevel);
    if (upgradeCost === null) {
      return NextResponse.json({
        success: false,
        error: "Cannot upgrade further",
      });
    }

    // Check AP balance
    const balances = (await redis.get<Record<string, number>>(BALANCES_KEY)) || {};
    const userBalance = balances[normalizedWallet] || 0;

    if (userBalance < upgradeCost) {
      return NextResponse.json({
        success: false,
        error: `Insufficient AP. Need ${upgradeCost} AP, have ${userBalance} AP`,
      });
    }

    // Deduct AP
    balances[normalizedWallet] = userBalance - upgradeCost;
    await redis.set(BALANCES_KEY, balances);

    // Upgrade station
    saveState.stationLevels[typedStationId] = currentLevel + 1;
    saveState.progress.totalAPSpent += upgradeCost;
    saveState.lastUpdated = Date.now();

    await redis.set(saveKey, saveState);

    return NextResponse.json({
      success: true,
      data: {
        stationId: typedStationId,
        newLevel: currentLevel + 1,
        apSpent: upgradeCost,
        newAPBalance: balances[normalizedWallet],
        stationLevels: saveState.stationLevels,
      },
    });
  } catch (error) {
    console.error("Error upgrading station:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upgrade station" },
      { status: 500 }
    );
  }
}
