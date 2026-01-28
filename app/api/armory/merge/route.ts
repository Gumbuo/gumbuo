import { NextRequest, NextResponse } from "next/server";
import {
  ArmorySaveState,
  RarityTier,
} from "../../../base/components/armory/types";
import { getItem } from "../../../base/components/armory/data/items";
import {
  RARITY_UPGRADE_PATH,
  MERGE_COST,
  MERGE_XP_REWARD,
  XP_REQUIREMENTS,
} from "../../../base/components/armory/constants";
import { getRedis, deductUserPoints, getUserBalance } from "../../lib/points";

const SAVE_KEY_PREFIX = "armory:save:";

function getSaveKey(wallet: string): string {
  return `${SAVE_KEY_PREFIX}${wallet.toLowerCase()}`;
}

// POST /api/armory/merge - Merge 2x items of same rarity into 1x next rarity
export async function POST(request: NextRequest) {
  try {
    const { wallet, itemId, rarity } = await request.json();

    if (!wallet || !itemId || !rarity) {
      return NextResponse.json(
        { success: false, error: "Wallet, itemId, and rarity required" },
        { status: 400 }
      );
    }

    const validRarities: RarityTier[] = ["common", "uncommon", "rare", "epic"];
    if (!validRarities.includes(rarity)) {
      return NextResponse.json(
        { success: false, error: "Invalid rarity tier" },
        { status: 400 }
      );
    }

    const nextRarity = RARITY_UPGRADE_PATH[rarity as RarityTier];
    if (!nextRarity) {
      return NextResponse.json(
        { success: false, error: "Cannot merge Epic items - already max rarity" },
        { status: 400 }
      );
    }

    const item = getItem(itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
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

    // Find inventory slot matching itemId AND rarity
    const inventorySlot = saveState.inventory.find(
      (slot) => slot.itemId === itemId && (slot.rarity || "common") === rarity
    );

    if (!inventorySlot || inventorySlot.quantity < 2) {
      return NextResponse.json({
        success: false,
        error: `Need at least 2x ${item.name} at ${rarity} rarity to merge. Have ${inventorySlot?.quantity || 0}`,
      });
    }

    // Check AP balance
    const currentBalance = await getUserBalance(normalizedWallet);
    if (currentBalance < MERGE_COST) {
      return NextResponse.json({
        success: false,
        error: `Insufficient AP. Need ${MERGE_COST} AP, have ${currentBalance}`,
      });
    }

    // Deduct 2 items from current rarity
    inventorySlot.quantity -= 2;
    if (inventorySlot.quantity <= 0) {
      saveState.inventory = saveState.inventory.filter(
        (slot) => !(slot.itemId === itemId && (slot.rarity || "common") === rarity) || slot.quantity > 0
      );
    }

    // Add 1 item at next rarity
    const existingUpgraded = saveState.inventory.find(
      (slot) => slot.itemId === itemId && (slot.rarity || "common") === nextRarity
    );
    if (existingUpgraded) {
      existingUpgraded.quantity += 1;
    } else {
      saveState.inventory.push({
        itemId,
        quantity: 1,
        rarity: nextRarity,
      });
    }

    // Clean up empty slots
    saveState.inventory = saveState.inventory.filter((slot) => slot.quantity > 0);

    // Deduct AP
    const newBalance = await deductUserPoints(normalizedWallet, MERGE_COST);

    // Award XP
    saveState.progress.xp += MERGE_XP_REWARD;

    // Level up logic
    let leveledUp = false;
    while (
      saveState.progress.level < 10 &&
      saveState.progress.xp >= XP_REQUIREMENTS[saveState.progress.level]
    ) {
      saveState.progress.level++;
      leveledUp = true;

      if (saveState.progress.level >= 2 && saveState.stationLevels.voidForge === 0) {
        saveState.stationLevels.voidForge = 1;
      }
      if (saveState.progress.level >= 3 && saveState.stationLevels.bioLab === 0) {
        saveState.stationLevels.bioLab = 1;
      }
      if (saveState.progress.level >= 5 && saveState.stationLevels.quantumChamber === 0) {
        saveState.stationLevels.quantumChamber = 1;
      }
    }

    if (saveState.progress.level < 10) {
      saveState.progress.xpToNextLevel = XP_REQUIREMENTS[saveState.progress.level];
    } else {
      saveState.progress.xpToNextLevel = 0;
    }

    saveState.lastUpdated = Date.now();
    await redis.set(saveKey, saveState);

    return NextResponse.json({
      success: true,
      data: {
        merged: {
          itemId,
          fromRarity: rarity,
          toRarity: nextRarity,
          itemName: item.name,
        },
        apSpent: MERGE_COST,
        xpGained: MERGE_XP_REWARD,
        newAPBalance: newBalance,
        newLevel: saveState.progress.level,
        newXP: saveState.progress.xp,
        xpToNextLevel: saveState.progress.xpToNextLevel,
        leveledUp,
        inventory: saveState.inventory,
      },
    });
  } catch (error) {
    console.error("Error merging items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to merge items", details: String(error) },
      { status: 500 }
    );
  }
}
