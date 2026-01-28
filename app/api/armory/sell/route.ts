import { NextRequest, NextResponse } from "next/server";
import { ArmorySaveState, RarityTier } from "../../../base/components/armory/types";
import { getItem } from "../../../base/components/armory/data/items";
import { RARITY_SELL_MULTIPLIERS } from "../../../base/components/armory/constants";
import { getRedis, addUserPoints } from "../../lib/points";

const SAVE_KEY_PREFIX = "armory:save:";

function getSaveKey(wallet: string): string {
  return `${SAVE_KEY_PREFIX}${wallet.toLowerCase()}`;
}

// POST /api/armory/sell - Sell items for AP
export async function POST(request: NextRequest) {
  try {
    const { wallet, itemId, quantity, rarity: requestRarity } = await request.json();
    const rarity: RarityTier = requestRarity || 'common';

    if (!wallet || !itemId || !quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
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

    // Find item in inventory matching both itemId and rarity
    const inventorySlot = saveState.inventory.find(
      (slot) => slot.itemId === itemId && (slot.rarity || 'common') === rarity
    );

    if (!inventorySlot || inventorySlot.quantity < quantity) {
      return NextResponse.json({
        success: false,
        error: `Insufficient items. Have ${inventorySlot?.quantity || 0}, need ${quantity}`,
      });
    }

    // Get item definition for sell value
    const item = getItem(itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Invalid item" },
        { status: 400 }
      );
    }

    const sellMultiplier = RARITY_SELL_MULTIPLIERS[rarity];
    const totalAPEarned = Math.floor(item.sellValue * sellMultiplier * quantity);

    // Remove items from inventory
    inventorySlot.quantity -= quantity;
    if (inventorySlot.quantity <= 0) {
      saveState.inventory = saveState.inventory.filter(
        (slot) => !(slot.itemId === itemId && (slot.rarity || 'common') === rarity) || slot.quantity > 0
      );
    }

    // Add AP to user balance (individual key)
    const newBalance = await addUserPoints(normalizedWallet, totalAPEarned);

    // Update progress
    saveState.progress.totalAPEarned += totalAPEarned;
    saveState.lastUpdated = Date.now();

    await redis.set(saveKey, saveState);

    return NextResponse.json({
      success: true,
      data: {
        sold: { itemId, itemName: item.name, quantity },
        apEarned: totalAPEarned,
        newAPBalance: newBalance,
        inventory: saveState.inventory,
      },
    });
  } catch (error) {
    console.error("Error selling item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sell item", details: String(error) },
      { status: 500 }
    );
  }
}
