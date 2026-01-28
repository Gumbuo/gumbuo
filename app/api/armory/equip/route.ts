import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { ArmorySaveState, EquipmentSlot, RarityTier } from "../../../base/components/armory/types";
import { getItem } from "../../../base/components/armory/data/items";

const redis = Redis.fromEnv();

const SAVE_KEY_PREFIX = "armory:save:";

function getSaveKey(wallet: string): string {
  return `${SAVE_KEY_PREFIX}${wallet.toLowerCase()}`;
}

// POST /api/armory/equip - Equip or unequip an item
export async function POST(request: NextRequest) {
  try {
    const { wallet, itemId, slot, unequip, rarity: requestRarity } = await request.json();
    const rarity: RarityTier = requestRarity || 'common';

    if (!wallet || !slot) {
      return NextResponse.json(
        { success: false, error: "Wallet and slot required" },
        { status: 400 }
      );
    }

    if (slot !== "weapon" && slot !== "armor") {
      return NextResponse.json(
        { success: false, error: "Invalid slot (must be 'weapon' or 'armor')" },
        { status: 400 }
      );
    }

    const saveKey = getSaveKey(wallet);
    const saveState = await redis.get<ArmorySaveState>(saveKey);

    if (!saveState) {
      return NextResponse.json(
        { success: false, error: "Armory save not found" },
        { status: 404 }
      );
    }

    // Initialize equipped if missing (migration)
    if (!saveState.equipped) {
      saveState.equipped = { weapon: null, armor: null, weaponRarity: null, armorRarity: null };
    }
    // Migrate: add rarity fields if missing
    if (saveState.equipped.weaponRarity === undefined) saveState.equipped.weaponRarity = saveState.equipped.weapon ? 'common' : null;
    if (saveState.equipped.armorRarity === undefined) saveState.equipped.armorRarity = saveState.equipped.armor ? 'common' : null;

    // Handle unequip
    if (unequip) {
      const currentlyEquipped = saveState.equipped[slot as EquipmentSlot];
      const currentRarityKey = (slot === 'weapon' ? 'weaponRarity' : 'armorRarity') as keyof typeof saveState.equipped;
      const currentRarity = (saveState.equipped[currentRarityKey] as RarityTier | null) || 'common';
      if (currentlyEquipped) {
        // Add back to inventory with correct rarity
        const existingSlot = saveState.inventory.find(
          (inv) => inv.itemId === currentlyEquipped && (inv.rarity || 'common') === currentRarity
        );
        if (existingSlot) {
          existingSlot.quantity += 1;
        } else {
          saveState.inventory.push({ itemId: currentlyEquipped, quantity: 1, rarity: currentRarity });
        }
        saveState.equipped[slot as EquipmentSlot] = null;
        saveState.equipped[currentRarityKey as 'weaponRarity' | 'armorRarity'] = null;
      }

      saveState.lastUpdated = Date.now();
      await redis.set(saveKey, saveState);

      return NextResponse.json({
        success: true,
        data: {
          equipped: saveState.equipped,
          inventory: saveState.inventory,
        },
        message: "Item unequipped",
      });
    }

    // Handle equip
    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "itemId required to equip" },
        { status: 400 }
      );
    }

    // Verify item exists and is correct type
    const item = getItem(itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    // Check slot matches item type
    if ((slot === "weapon" && item.type !== "weapon") || (slot === "armor" && item.type !== "armor")) {
      return NextResponse.json(
        { success: false, error: `Cannot equip ${item.type} in ${slot} slot` },
        { status: 400 }
      );
    }

    // Check if player has this item in inventory (match by rarity too)
    const inventorySlot = saveState.inventory.find(
      (inv) => inv.itemId === itemId && (inv.rarity || 'common') === rarity
    );
    if (!inventorySlot || inventorySlot.quantity <= 0) {
      return NextResponse.json(
        { success: false, error: "Item not in inventory" },
        { status: 400 }
      );
    }

    // Unequip current item first (if any)
    const currentlyEquipped = saveState.equipped[slot as EquipmentSlot];
    const rarityKey = (slot === 'weapon' ? 'weaponRarity' : 'armorRarity') as 'weaponRarity' | 'armorRarity';
    const prevRarity = (saveState.equipped[rarityKey] as RarityTier | null) || 'common';
    if (currentlyEquipped) {
      const existingSlot = saveState.inventory.find(
        (inv) => inv.itemId === currentlyEquipped && (inv.rarity || 'common') === prevRarity
      );
      if (existingSlot) {
        existingSlot.quantity += 1;
      } else {
        saveState.inventory.push({ itemId: currentlyEquipped, quantity: 1, rarity: prevRarity });
      }
    }

    // Equip new item with rarity
    saveState.equipped[slot as EquipmentSlot] = itemId;
    saveState.equipped[rarityKey] = rarity;
    inventorySlot.quantity -= 1;

    // Remove from inventory if quantity is 0
    if (inventorySlot.quantity <= 0) {
      saveState.inventory = saveState.inventory.filter((inv) => inv.quantity > 0);
    }

    saveState.lastUpdated = Date.now();
    await redis.set(saveKey, saveState);

    return NextResponse.json({
      success: true,
      data: {
        equipped: saveState.equipped,
        inventory: saveState.inventory,
        equippedItem: item,
      },
      message: `Equipped ${item.name}`,
    });
  } catch (error) {
    console.error("Error equipping item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to equip item" },
      { status: 500 }
    );
  }
}
