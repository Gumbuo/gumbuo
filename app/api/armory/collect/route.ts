import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import {
  ArmorySaveState,
  CraftingJob,
  StationId,
  InventoryItem,
} from "../../../base/components/armory/types";
import { getRecipe } from "../../../base/components/armory/data/recipes";
import { getItem } from "../../../base/components/armory/data/items";
import {
  XP_REQUIREMENTS,
  FIRST_CRAFT_BONUS_XP,
} from "../../../base/components/armory/constants";
import { addPlayerXP } from "../../lib/playerLevel";

const redis = Redis.fromEnv();

const SAVE_KEY_PREFIX = "armory:save:";

function getSaveKey(wallet: string): string {
  return `${SAVE_KEY_PREFIX}${wallet.toLowerCase()}`;
}

interface CollectedItem {
  recipeId: string;
  recipeName: string;
  output: {
    type: "resource" | "item";
    id: string;
    name: string;
    quantity: number;
  };
  xpGained: number;
  isFirstCraft: boolean;
}

// POST /api/armory/collect - Collect all completed crafting jobs
export async function POST(request: NextRequest) {
  try {
    const { wallet } = await request.json();

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet address required" },
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

    const now = Date.now();
    const collectedItems: CollectedItem[] = [];
    let totalXP = 0;

    // Process each station's queue
    for (const stationId of Object.keys(saveState.craftingQueues) as StationId[]) {
      const queue = saveState.craftingQueues[stationId];
      const completedJobs: CraftingJob[] = [];
      const pendingJobs: CraftingJob[] = [];

      // Separate completed from pending
      for (const job of queue) {
        if (job.endTime <= now) {
          completedJobs.push(job);
        } else {
          pendingJobs.push(job);
        }
      }

      // Process completed jobs
      for (const job of completedJobs) {
        const recipe = getRecipe(job.recipeId);
        if (!recipe) continue;

        let xpGained = recipe.xpReward;
        let isFirstCraft = false;

        // Check for first craft bonus
        const outputId = recipe.output.itemId || recipe.output.resource;
        if (outputId && !saveState.progress.firstCrafts.includes(outputId)) {
          xpGained += FIRST_CRAFT_BONUS_XP;
          isFirstCraft = true;
          saveState.progress.firstCrafts.push(outputId);
        }

        // Add output to inventory/resources
        if (recipe.output.resource) {
          // Material output goes to resources
          saveState.resources[recipe.output.resource] += recipe.output.quantity;

          collectedItems.push({
            recipeId: recipe.id,
            recipeName: recipe.name,
            output: {
              type: "resource",
              id: recipe.output.resource,
              name: recipe.name,
              quantity: recipe.output.quantity,
            },
            xpGained,
            isFirstCraft,
          });
        } else if (recipe.output.itemId) {
          // Item output goes to inventory
          const item = getItem(recipe.output.itemId);
          if (item) {
            // Determine rarity based on item tier
            const tierToRarity: Record<number, 'common' | 'uncommon' | 'rare' | 'epic'> = {
              1: 'common',
              2: 'uncommon',
              3: 'rare',
              4: 'epic',
            };
            const rarity = tierToRarity[item.tier] || 'common';

            const existingSlot = saveState.inventory.find(
              (slot) => slot.itemId === recipe.output.itemId && slot.rarity === rarity
            );
            if (existingSlot) {
              existingSlot.quantity += recipe.output.quantity;
            } else {
              saveState.inventory.push({
                itemId: recipe.output.itemId!,
                quantity: recipe.output.quantity,
                rarity,
              });
            }

            collectedItems.push({
              recipeId: recipe.id,
              recipeName: recipe.name,
              output: {
                type: "item",
                id: item.id,
                name: item.name,
                quantity: recipe.output.quantity,
              },
              xpGained,
              isFirstCraft,
            });
          }
        }

        totalXP += xpGained;
        saveState.progress.totalItemsCrafted += recipe.output.quantity;
      }

      // Update queue with only pending jobs
      saveState.craftingQueues[stationId] = pendingJobs;
    }

    // Add XP and check for level up
    saveState.progress.xp += totalXP;

    // Level up logic
    let leveledUp = false;
    while (
      saveState.progress.level < 10 &&
      saveState.progress.xp >= XP_REQUIREMENTS[saveState.progress.level]
    ) {
      saveState.progress.level++;
      leveledUp = true;

      // Unlock stations based on new level
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

    // Update XP to next level display
    if (saveState.progress.level < 10) {
      saveState.progress.xpToNextLevel = XP_REQUIREMENTS[saveState.progress.level];
    } else {
      saveState.progress.xpToNextLevel = 0; // Max level
    }

    saveState.lastUpdated = Date.now();
    await redis.set(saveKey, saveState);

    // Award player XP for crafting (5 XP per item crafted)
    let playerXPResult = null;
    if (collectedItems.length > 0) {
      const totalItemsCrafted = collectedItems.reduce((sum, ci) => sum + ci.output.quantity, 0);
      const playerXP = totalItemsCrafted * 5;
      if (playerXP > 0) {
        playerXPResult = await addPlayerXP(wallet, playerXP, "craft");
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        collected: collectedItems,
        totalXP,
        newLevel: saveState.progress.level,
        newXP: saveState.progress.xp,
        xpToNextLevel: saveState.progress.xpToNextLevel,
        leveledUp,
        resources: saveState.resources,
        inventory: saveState.inventory,
        stationLevels: saveState.stationLevels,
        playerLevel: playerXPResult ? {
          level: playerXPResult.levelData.level,
          xp: playerXPResult.levelData.xp,
          xpAdded: playerXPResult.xpAdded,
          levelsGained: playerXPResult.levelsGained,
          apRewarded: playerXPResult.apRewarded,
        } : undefined,
      },
    });
  } catch (error) {
    console.error("Error collecting crafts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to collect crafts" },
      { status: 500 }
    );
  }
}
