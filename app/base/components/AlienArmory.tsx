"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import {
  ArmorySaveState,
  StationId,
  CraftingJob,
  RawResourceKey,
  Recipe,
  InventoryItem,
  EquipmentSlot,
  RarityTier,
} from "./armory/types";
import { STATIONS, STATION_ORDER, getStationQueueSize } from "./armory/data/stations";
import { RECIPES, getAvailableRecipes, canCraftRecipe, getRecipe } from "./armory/data/recipes";
import { ITEMS, getItem, getItemWithRarity } from "./armory/data/items";
import ArmoryMap from "./armory/ArmoryMap";
import RecipeChart from "./armory/RecipeChart";
import {
  MATERIAL_COSTS,
  MATERIAL_NAMES,
  MATERIAL_ICONS,
  PROCESSED_NAMES,
  PROCESSED_ICONS,
  THEME,
  getLevelTitle,
  formatTime,
  calculateSpeedUpCost,
  RARITY_NAMES,
  RARITY_COLORS,
  RARITY_UPGRADE_PATH,
  RARITY_SELL_MULTIPLIERS,
  MERGE_COST,
} from "./armory/constants";

type ModalType = "shop" | "inventory" | "crafting" | "none";

export default function AlienArmory() {
  const { address, isConnected } = useAccount();
  const [saveState, setSaveState] = useState<ArmorySaveState | null>(null);
  const [apBalance, setApBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>("none");
  const [selectedStation, setSelectedStation] = useState<StationId | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [completedJobsReady, setCompletedJobsReady] = useState(0);
  const [showRecipeChart, setShowRecipeChart] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [, setTick] = useState(0); // Force re-render for timers

  // Timer to update crafting progress
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Load save state
  const loadSaveState = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/armory?wallet=${address}`);
      const data = await response.json();
      if (data.success) {
        setSaveState(data.data);
        setCompletedJobsReady(data.completedJobsReady || 0);
      }

      // Also fetch AP balance
      const apResponse = await fetch(`/api/points?wallet=${address}`);
      const apData = await apResponse.json();
      if (apData.success) {
        setApBalance(apData.userBalance);
      }
    } catch (error) {
      console.error("Failed to load save:", error);
      showNotification("Failed to load game data", "error");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      loadSaveState();
    }
  }, [isConnected, address, loadSaveState]);

  const showNotification = (message: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Shop: Buy materials
  const buyMaterial = async (resourceId: RawResourceKey, quantity: number) => {
    if (!address) return;
    const cost = MATERIAL_COSTS[resourceId] * quantity;
    if (apBalance < cost) {
      showNotification(`Insufficient AP! Need ${cost} AP`, "error");
      return;
    }

    try {
      const response = await fetch("/api/armory/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, resourceId, quantity }),
      });
      const data = await response.json();
      if (data.success) {
        setSaveState((prev) => prev ? { ...prev, resources: data.data.resources } : null);
        setApBalance(data.data.newAPBalance);
        showNotification(`Purchased ${quantity}x ${MATERIAL_NAMES[resourceId]}!`, "success");
      } else {
        showNotification(data.error || "Purchase failed", "error");
      }
    } catch (error) {
      showNotification("Failed to purchase", "error");
    }
  };

  // Start crafting
  const startCraft = async (recipeId: string) => {
    if (!address || !selectedStation) return;

    try {
      const response = await fetch("/api/armory/craft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, recipeId, stationId: selectedStation }),
      });
      const data = await response.json();
      if (data.success) {
        setSaveState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            resources: data.data.resources,
            craftingQueues: {
              ...prev.craftingQueues,
              [selectedStation]: [...prev.craftingQueues[selectedStation], data.data.job],
            },
          };
        });
        showNotification(`Started crafting!`, "success");
        setActiveModal("none");
      } else {
        showNotification(data.error || "Failed to start craft", "error");
      }
    } catch (error) {
      showNotification("Failed to start craft", "error");
    }
  };

  // Speed up crafting
  const speedUpCraft = async (jobId: string, type: "half" | "instant") => {
    if (!address) return;

    try {
      const response = await fetch("/api/armory/craft", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, jobId, speedUpType: type }),
      });
      const data = await response.json();
      if (data.success) {
        setApBalance(data.data.newAPBalance);
        // Reload to get updated queues
        loadSaveState();
        showNotification(`Sped up! -${data.data.apSpent} AP`, "success");
      } else {
        showNotification(data.error || "Failed to speed up", "error");
      }
    } catch (error) {
      showNotification("Failed to speed up", "error");
    }
  };

  // Collect completed crafts
  const collectCrafts = async () => {
    if (!address) return;

    try {
      const response = await fetch("/api/armory/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address }),
      });
      const data = await response.json();
      if (data.success && data.data.collected.length > 0) {
        loadSaveState();
        const itemNames = data.data.collected.map((c: { recipeName: string }) => c.recipeName).join(", ");
        showNotification(`Collected: ${itemNames}! +${data.data.totalXP} XP`, "success");
      } else if (data.data.collected.length === 0) {
        showNotification("No completed crafts to collect", "info");
      } else {
        showNotification(data.error || "Failed to collect", "error");
      }
    } catch (error) {
      showNotification("Failed to collect", "error");
    }
  };

  // Sell item
  const sellItem = async (itemId: string, quantity: number, rarity: RarityTier = 'common') => {
    if (!address) return;

    try {
      const response = await fetch("/api/armory/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, itemId, quantity, rarity }),
      });
      const data = await response.json();
      if (data.success) {
        setSaveState((prev) => prev ? { ...prev, inventory: data.data.inventory } : null);
        setApBalance(data.data.newAPBalance);
        showNotification(`Sold! +${data.data.apEarned} AP`, "success");
      } else {
        showNotification(data.error || "Failed to sell", "error");
      }
    } catch (error) {
      showNotification("Failed to sell", "error");
    }
  };

  // Merge items
  const mergeItem = async (itemId: string, rarity: RarityTier) => {
    if (!address) return;

    try {
      const response = await fetch("/api/armory/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, itemId, rarity }),
      });
      const data = await response.json();
      if (data.success) {
        setSaveState((prev) => prev ? { ...prev, inventory: data.data.inventory } : null);
        setApBalance(data.data.newAPBalance);
        const nextRarity = RARITY_UPGRADE_PATH[rarity];
        showNotification(
          `Merged! ${data.data.merged.itemName} is now ${RARITY_NAMES[nextRarity!]}! +${data.data.xpGained} XP`,
          "success"
        );
        if (data.data.leveledUp) {
          showNotification(`Level Up! Now level ${data.data.newLevel}!`, "success");
        }
      } else {
        showNotification(data.error || "Failed to merge", "error");
      }
    } catch (error) {
      showNotification("Failed to merge", "error");
    }
  };

  // Upgrade station
  const upgradeStation = async (stationId: StationId) => {
    if (!address) return;

    try {
      const response = await fetch("/api/armory/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, stationId }),
      });
      const data = await response.json();
      if (data.success) {
        setSaveState((prev) => prev ? { ...prev, stationLevels: data.data.stationLevels } : null);
        setApBalance(data.data.newAPBalance);
        showNotification(`Upgraded ${STATIONS[stationId].name} to Level ${data.data.newLevel}!`, "success");
      } else {
        showNotification(data.error || "Failed to upgrade", "error");
      }
    } catch (error) {
      showNotification("Failed to upgrade", "error");
    }
  };

  // Equip item
  const equipItem = async (itemId: string, slot: EquipmentSlot, rarity: RarityTier = 'common') => {
    if (!address) return;

    try {
      const response = await fetch("/api/armory/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, itemId, slot, rarity }),
      });
      const data = await response.json();
      if (data.success) {
        setSaveState((prev) => prev ? {
          ...prev,
          equipped: data.data.equipped,
          inventory: data.data.inventory,
        } : null);
        showNotification(`Equipped ${data.data.equippedItem.name}!`, "success");
      } else {
        showNotification(data.error || "Failed to equip", "error");
      }
    } catch (error) {
      showNotification("Failed to equip", "error");
    }
  };

  // Unequip item
  const unequipItem = async (slot: EquipmentSlot) => {
    if (!address) return;

    try {
      const response = await fetch("/api/armory/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, slot, unequip: true }),
      });
      const data = await response.json();
      if (data.success) {
        setSaveState((prev) => prev ? {
          ...prev,
          equipped: data.data.equipped,
          inventory: data.data.inventory,
        } : null);
        showNotification("Item unequipped", "info");
      } else {
        showNotification(data.error || "Failed to unequip", "error");
      }
    } catch (error) {
      showNotification("Failed to unequip", "error");
    }
  };

  // Update player position on map
  const updatePlayerPosition = async (position: { x: number; currentStation: StationId | null }) => {
    if (!address) return;

    try {
      await fetch("/api/armory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, updates: { playerPosition: position } }),
      });
      setSaveState((prev) => prev ? { ...prev, playerPosition: position } : null);
    } catch (error) {
      console.error("Failed to update position:", error);
    }
  };

  // Handle station select from map click
  const handleMapStationSelect = (stationId: StationId) => {
    const stationLevel = saveState?.stationLevels[stationId] || 0;
    const station = STATIONS[stationId];
    const isUnlocked = stationLevel > 0 || (saveState && saveState.progress.level >= station.unlockLevel);

    if (isUnlocked && stationLevel > 0) {
      setSelectedStation(stationId);
      setActiveModal("crafting");
    }
  };

  // Get remaining time for a job
  const getRemainingSeconds = (job: CraftingJob): number => {
    const now = Date.now();
    return Math.max(0, Math.ceil((job.endTime - now) / 1000));
  };

  // Count completed jobs
  const countCompletedJobs = (): number => {
    if (!saveState) return 0;
    let count = 0;
    const now = Date.now();
    for (const stationId of Object.keys(saveState.craftingQueues) as StationId[]) {
      for (const job of saveState.craftingQueues[stationId]) {
        if (job.endTime <= now) count++;
      }
    }
    return count;
  };

  if (!isConnected) {
    return (
      <div style={{
        minHeight: "100vh",
        background: THEME.colors.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Orbitron, sans-serif",
      }}>
        <div style={{
          background: THEME.colors.panel,
          border: THEME.borders.panel,
          borderRadius: "12px",
          padding: "40px",
          textAlign: "center",
        }}>
          <h2 style={{ color: THEME.colors.primary, marginBottom: "16px" }}>
            ALIEN ARMORY
          </h2>
          <p style={{ color: THEME.colors.text }}>
            Connect your wallet to enter the forge
          </p>
        </div>
      </div>
    );
  }

  if (loading || !saveState) {
    return (
      <div style={{
        minHeight: "100vh",
        background: THEME.colors.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Orbitron, sans-serif",
      }}>
        <div style={{ color: THEME.colors.primary, fontSize: "24px" }}>
          Loading Armory...
        </div>
      </div>
    );
  }

  const completedCount = countCompletedJobs();

  return (
    <div style={{
      minHeight: "100vh",
      background: THEME.colors.background,
      fontFamily: "Orbitron, sans-serif",
      padding: "20px",
      color: THEME.colors.text,
    }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          background: notification.type === "success" ? THEME.colors.success :
            notification.type === "error" ? THEME.colors.error : THEME.colors.primary,
          color: "#000",
          padding: "12px 24px",
          borderRadius: "8px",
          fontWeight: "bold",
          boxShadow: THEME.shadows.glow,
        }}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "16px",
      }}>
        <div>
          <h1 style={{
            color: THEME.colors.primary,
            margin: 0,
            fontSize: "28px",
            textShadow: "0 0 10px rgba(102, 252, 241, 0.5)",
          }}>
            ALIEN ARMORY
          </h1>
          <div style={{ color: THEME.colors.secondary, fontSize: "14px" }}>
            Level {saveState.progress.level} - {getLevelTitle(saveState.progress.level)}
          </div>
          {/* XP Bar */}
          <div style={{
            width: "200px",
            height: "8px",
            background: THEME.colors.panel,
            borderRadius: "4px",
            marginTop: "8px",
            overflow: "hidden",
          }}>
            <div style={{
              width: `${saveState.progress.xpToNextLevel > 0 ?
                (saveState.progress.xp / saveState.progress.xpToNextLevel) * 100 : 100}%`,
              height: "100%",
              background: THEME.gradients.button,
              transition: "width 0.3s ease",
            }} />
          </div>
          <div style={{ fontSize: "12px", color: THEME.colors.text, marginTop: "4px" }}>
            {saveState.progress.xp} / {saveState.progress.xpToNextLevel} XP
          </div>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}>
          <div style={{
            background: THEME.colors.panel,
            border: THEME.borders.panel,
            borderRadius: "8px",
            padding: "12px 20px",
          }}>
            <span style={{ color: THEME.colors.text, fontSize: "12px" }}>ALIEN POINTS</span>
            <div style={{ color: THEME.colors.primary, fontSize: "20px", fontWeight: "bold" }}>
              {apBalance.toLocaleString()} AP
            </div>
          </div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div style={{
        display: "flex",
        gap: "12px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}>
        <button
          onClick={() => setActiveModal("shop")}
          style={{
            background: THEME.gradients.button,
            border: "none",
            borderRadius: "8px",
            padding: "12px 24px",
            color: "#000",
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "Orbitron, sans-serif",
          }}
        >
          SHOP
        </button>
        <button
          onClick={() => setActiveModal("inventory")}
          style={{
            background: THEME.colors.panel,
            border: THEME.borders.panel,
            borderRadius: "8px",
            padding: "12px 24px",
            color: THEME.colors.primary,
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "Orbitron, sans-serif",
          }}
        >
          INVENTORY ({saveState.inventory.reduce((sum, i) => sum + i.quantity, 0)})
        </button>
        <button
          onClick={() => setShowRecipeChart(true)}
          style={{
            background: THEME.colors.panel,
            border: THEME.borders.panel,
            borderRadius: "8px",
            padding: "12px 24px",
            color: THEME.colors.secondary,
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "Orbitron, sans-serif",
          }}
        >
          📜 RECIPES
        </button>
        {completedCount > 0 && (
          <button
            onClick={collectCrafts}
            style={{
              background: THEME.colors.success,
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              color: "#000",
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "Orbitron, sans-serif",
              animation: "pulse 1s infinite",
            }}
          >
            COLLECT ({completedCount})
          </button>
        )}
      </div>

      {/* Resources Panel */}
      <div style={{
        background: THEME.colors.panel,
        border: THEME.borders.panel,
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "20px",
      }}>
        <h3 style={{ color: THEME.colors.primary, margin: "0 0 12px 0", fontSize: "14px" }}>
          RESOURCES
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "12px",
        }}>
          {/* Raw Materials */}
          {(Object.keys(MATERIAL_COSTS) as RawResourceKey[]).map((key) => (
            <div key={key} style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: "8px",
              padding: "8px",
              textAlign: "center",
            }}>
              <span style={{ fontSize: "32px", fontFamily: "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif" }}>{MATERIAL_ICONS[key]}</span>
              <div style={{ fontSize: "11px", color: THEME.colors.text }}>{MATERIAL_NAMES[key]}</div>
              <div style={{ color: THEME.colors.primary, fontWeight: "bold" }}>
                {saveState.resources[key]}
              </div>
            </div>
          ))}
          {/* Processed Materials */}
          {(Object.keys(PROCESSED_NAMES) as string[]).map((key) => (
            <div key={key} style={{
              background: "rgba(102, 252, 241, 0.1)",
              borderRadius: "8px",
              padding: "8px",
              textAlign: "center",
            }}>
              <span style={{ fontSize: "32px", fontFamily: "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif" }}>{PROCESSED_ICONS[key]}</span>
              <div style={{ fontSize: "11px", color: THEME.colors.text }}>{PROCESSED_NAMES[key]}</div>
              <div style={{ color: THEME.colors.primary, fontWeight: "bold" }}>
                {saveState.resources[key as keyof typeof saveState.resources] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Armory Map */}
      <div style={{
        background: THEME.colors.panel,
        border: THEME.borders.panel,
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "20px",
      }}>
        <h3 style={{ color: THEME.colors.primary, margin: "0 0 12px 0", fontSize: "14px" }}>
          ARMORY MAP
        </h3>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ArmoryMap
            saveState={saveState}
            onStationSelect={handleMapStationSelect}
            onUpdatePosition={updatePlayerPosition}
          />
        </div>
      </div>

      {/* Crafting Stations Grid */}
      <h3 style={{ color: THEME.colors.primary, margin: "0 0 16px 0" }}>
        CRAFTING STATIONS
      </h3>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "16px",
      }}>
        {STATION_ORDER.map((stationId) => {
          const station = STATIONS[stationId];
          const level = saveState.stationLevels[stationId];
          const isLocked = level === 0;
          const queue = saveState.craftingQueues[stationId];
          const maxQueue = isLocked ? 0 : getStationQueueSize(stationId, level);
          const canUnlock = saveState.progress.level >= station.unlockLevel;

          return (
            <div
              key={stationId}
              style={{
                background: isLocked ? "rgba(31, 40, 51, 0.5)" : THEME.colors.panel,
                border: isLocked ? THEME.borders.locked : THEME.borders.panel,
                borderRadius: "12px",
                padding: "16px",
                opacity: isLocked && !canUnlock ? 0.5 : 1,
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: "28px", marginRight: "8px", fontFamily: "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif" }}>{station.icon}</span>
                  <span style={{ color: isLocked ? THEME.colors.locked : THEME.colors.primary, fontWeight: "bold" }}>
                    {station.name}
                  </span>
                </div>
                {!isLocked && (
                  <span style={{ color: THEME.colors.secondary, fontSize: "12px" }}>
                    Lvl {level}/{station.maxLevel}
                  </span>
                )}
              </div>

              {isLocked ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔒</div>
                  <div style={{ color: THEME.colors.locked, fontSize: "12px" }}>
                    {canUnlock ? "Ready to unlock!" : `Unlocks at Level ${station.unlockLevel}`}
                  </div>
                  {canUnlock && (
                    <button
                      onClick={() => upgradeStation(stationId)}
                      style={{
                        marginTop: "12px",
                        background: THEME.gradients.button,
                        border: "none",
                        borderRadius: "6px",
                        padding: "8px 16px",
                        color: "#000",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontFamily: "Orbitron, sans-serif",
                        fontSize: "12px",
                      }}
                    >
                      UNLOCK
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div style={{ fontSize: "11px", color: THEME.colors.text, marginBottom: "12px" }}>
                    {station.description}
                  </div>

                  {/* Queue Display */}
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "11px", color: THEME.colors.secondary, marginBottom: "4px" }}>
                      Queue: {queue.length}/{maxQueue}
                    </div>
                    {queue.map((job) => {
                      const recipe = getRecipe(job.recipeId);
                      const remaining = getRemainingSeconds(job);
                      const isComplete = remaining <= 0;
                      return (
                        <div
                          key={job.id}
                          style={{
                            background: isComplete ? "rgba(74, 222, 128, 0.2)" : "rgba(0,0,0,0.3)",
                            borderRadius: "6px",
                            padding: "8px",
                            marginBottom: "4px",
                          }}
                        >
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}>
                            <span style={{ fontSize: "12px", color: THEME.colors.textBright }}>
                              {recipe?.name || "Unknown"}
                            </span>
                            <span style={{
                              fontSize: "12px",
                              color: isComplete ? THEME.colors.success : THEME.colors.warning,
                              fontWeight: "bold",
                            }}>
                              {isComplete ? "READY!" : formatTime(remaining)}
                            </span>
                          </div>
                          {!isComplete && (
                            <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                              <button
                                onClick={() => speedUpCraft(job.id, "half")}
                                style={{
                                  flex: 1,
                                  background: "rgba(102, 252, 241, 0.2)",
                                  border: "1px solid " + THEME.colors.secondary,
                                  borderRadius: "4px",
                                  padding: "4px",
                                  color: THEME.colors.primary,
                                  fontSize: "10px",
                                  cursor: "pointer",
                                  fontFamily: "Orbitron, sans-serif",
                                }}
                              >
                                ½ Time ({calculateSpeedUpCost(remaining, "half")} AP)
                              </button>
                              <button
                                onClick={() => speedUpCraft(job.id, "instant")}
                                style={{
                                  flex: 1,
                                  background: THEME.colors.warning,
                                  border: "none",
                                  borderRadius: "4px",
                                  padding: "4px",
                                  color: "#000",
                                  fontSize: "10px",
                                  cursor: "pointer",
                                  fontFamily: "Orbitron, sans-serif",
                                }}
                              >
                                Instant ({calculateSpeedUpCost(remaining, "instant")} AP)
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Station Actions */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        setSelectedStation(stationId);
                        setActiveModal("crafting");
                      }}
                      disabled={queue.length >= maxQueue}
                      style={{
                        flex: 1,
                        background: queue.length >= maxQueue ? THEME.colors.locked : THEME.gradients.button,
                        border: "none",
                        borderRadius: "6px",
                        padding: "10px",
                        color: queue.length >= maxQueue ? THEME.colors.text : "#000",
                        fontWeight: "bold",
                        cursor: queue.length >= maxQueue ? "not-allowed" : "pointer",
                        fontFamily: "Orbitron, sans-serif",
                        fontSize: "12px",
                      }}
                    >
                      CRAFT
                    </button>
                    {level < station.maxLevel && (
                      <button
                        onClick={() => upgradeStation(stationId)}
                        style={{
                          background: THEME.colors.panel,
                          border: THEME.borders.panel,
                          borderRadius: "6px",
                          padding: "10px",
                          color: THEME.colors.secondary,
                          cursor: "pointer",
                          fontFamily: "Orbitron, sans-serif",
                          fontSize: "10px",
                        }}
                      >
                        ⬆️ {station.upgradeCosts[level]} AP
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Shop Modal */}
      {activeModal === "shop" && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
        }}>
          <div style={{
            background: THEME.colors.panel,
            border: THEME.borders.active,
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}>
              <h2 style={{ color: THEME.colors.primary, margin: 0 }}>MATERIAL SHOP</h2>
              <button
                onClick={() => setActiveModal("none")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: THEME.colors.text,
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "16px", color: THEME.colors.secondary }}>
              Your AP: {apBalance.toLocaleString()}
            </div>

            {(Object.keys(MATERIAL_COSTS) as RawResourceKey[]).map((resourceId) => (
              <div
                key={resourceId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "36px", fontFamily: "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif" }}>{MATERIAL_ICONS[resourceId]}</span>
                  <div>
                    <div style={{ color: THEME.colors.textBright }}>{MATERIAL_NAMES[resourceId]}</div>
                    <div style={{ color: THEME.colors.secondary, fontSize: "12px" }}>
                      {MATERIAL_COSTS[resourceId]} AP each
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1, 5, 10].map((qty) => (
                    <button
                      key={qty}
                      onClick={() => buyMaterial(resourceId, qty)}
                      disabled={apBalance < MATERIAL_COSTS[resourceId] * qty}
                      style={{
                        background: apBalance >= MATERIAL_COSTS[resourceId] * qty
                          ? THEME.gradients.button
                          : THEME.colors.locked,
                        border: "none",
                        borderRadius: "4px",
                        padding: "6px 12px",
                        color: "#000",
                        fontWeight: "bold",
                        cursor: apBalance >= MATERIAL_COSTS[resourceId] * qty ? "pointer" : "not-allowed",
                        fontFamily: "Orbitron, sans-serif",
                        fontSize: "11px",
                      }}
                    >
                      x{qty}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {activeModal === "inventory" && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
        }}>
          <div style={{
            background: THEME.colors.panel,
            border: THEME.borders.active,
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}>
              <h2 style={{ color: THEME.colors.primary, margin: 0 }}>INVENTORY</h2>
              <button
                onClick={() => setActiveModal("none")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: THEME.colors.text,
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {saveState.inventory.length === 0 ? (
              <div style={{ textAlign: "center", color: THEME.colors.text, padding: "40px" }}>
                No items yet. Start crafting!
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
              }}>
                {saveState.inventory.map((slot) => {
                  const rarity: RarityTier = slot.rarity || 'common';
                  const rarityItem = getItemWithRarity(slot.itemId, rarity);
                  const baseItem = getItem(slot.itemId);
                  if (!rarityItem || !baseItem) return null;
                  const rarityColor = RARITY_COLORS[rarity];
                  const canMerge = slot.quantity >= 2 && RARITY_UPGRADE_PATH[rarity] !== null;
                  const nextRarity = RARITY_UPGRADE_PATH[rarity];
                  return (
                    <div
                      key={`${slot.itemId}-${rarity}`}
                      style={{
                        background: `linear-gradient(135deg, rgba(0,0,0,0.5), ${rarityColor}22)`,
                        borderRadius: "8px",
                        padding: "12px",
                        border: `2px solid ${rarityColor}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <div>
                          <span style={{ fontSize: "32px", fontFamily: "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif" }}>{baseItem.icon}</span>
                          <div style={{ color: THEME.colors.textBright, fontWeight: "bold", marginTop: "4px" }}>
                            {rarityItem.name}
                          </div>
                          <div style={{
                            display: "inline-block",
                            fontSize: "9px",
                            fontWeight: "bold",
                            color: rarityColor,
                            background: `${rarityColor}22`,
                            border: `1px solid ${rarityColor}`,
                            borderRadius: "3px",
                            padding: "1px 6px",
                            marginTop: "2px",
                          }}>
                            {RARITY_NAMES[rarity]}
                          </div>
                          <div style={{ fontSize: "11px", color: THEME.colors.text, marginTop: "4px" }}>
                            {baseItem.description}
                          </div>
                        </div>
                        <div style={{
                          background: "rgba(0,0,0,0.5)",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          fontWeight: "bold",
                          color: THEME.colors.primary,
                        }}>
                          x{slot.quantity}
                        </div>
                      </div>
                      <div style={{
                        fontSize: "11px", color: THEME.colors.secondary, marginTop: "6px",
                      }}>
                        {rarityItem.stats.attack ? `ATK: ${rarityItem.stats.attack}` : ""}
                        {rarityItem.stats.defense ? ` DEF: ${rarityItem.stats.defense}` : ""}
                        {rarityItem.stats.special ? ` | ${rarityItem.stats.special}` : ""}
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "8px",
                        gap: "4px",
                        flexWrap: "wrap",
                      }}>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            onClick={() => equipItem(slot.itemId, baseItem.type as EquipmentSlot, rarity)}
                            style={{
                              background: THEME.gradients.button,
                              border: "none",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              color: "#000",
                              fontWeight: "bold",
                              cursor: "pointer",
                              fontFamily: "Orbitron, sans-serif",
                              fontSize: "10px",
                            }}
                          >
                            EQUIP
                          </button>
                          <button
                            onClick={() => sellItem(slot.itemId, 1, rarity)}
                            style={{
                              background: THEME.colors.warning,
                              border: "none",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              color: "#000",
                              fontWeight: "bold",
                              cursor: "pointer",
                              fontFamily: "Orbitron, sans-serif",
                              fontSize: "10px",
                            }}
                          >
                            SELL (+{rarityItem.sellValue} AP)
                          </button>
                        </div>
                        {canMerge && (
                          <button
                            onClick={() => mergeItem(slot.itemId, rarity)}
                            disabled={apBalance < MERGE_COST}
                            title={nextRarity ? `Merge 2x into 1x ${RARITY_NAMES[nextRarity]} (${MERGE_COST} AP)` : ""}
                            style={{
                              background: apBalance >= MERGE_COST
                                ? `linear-gradient(135deg, ${rarityColor}, ${RARITY_COLORS[nextRarity!]})`
                                : THEME.colors.locked,
                              border: "none",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              color: "#000",
                              fontWeight: "bold",
                              cursor: apBalance >= MERGE_COST ? "pointer" : "not-allowed",
                              fontFamily: "Orbitron, sans-serif",
                              fontSize: "10px",
                            }}
                          >
                            MERGE ({MERGE_COST} AP)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Currently Equipped Section */}
            <div style={{ marginTop: "20px", borderTop: `1px solid ${THEME.colors.secondary}`, paddingTop: "16px" }}>
              <h3 style={{ color: THEME.colors.primary, margin: "0 0 12px 0", fontSize: "14px" }}>
                EQUIPPED ITEMS
              </h3>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {/* Weapon Slot */}
                {(() => {
                  const weaponRarity: RarityTier = (saveState.equipped?.weaponRarity as RarityTier) || 'common';
                  const weaponColor = saveState.equipped?.weapon ? RARITY_COLORS[weaponRarity] : THEME.colors.locked;
                  return (
                    <div style={{
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: "8px",
                      padding: "12px",
                      minWidth: "150px",
                      border: `2px solid ${weaponColor}`,
                    }}>
                      <div style={{ fontSize: "10px", color: THEME.colors.secondary, marginBottom: "4px" }}>WEAPON</div>
                      {saveState.equipped?.weapon ? (() => {
                        const weapon = getItemWithRarity(saveState.equipped.weapon, weaponRarity);
                        const baseWeapon = getItem(saveState.equipped.weapon);
                        return weapon && baseWeapon ? (
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "20px" }}>{baseWeapon.icon}</span>
                              <span style={{ color: THEME.colors.textBright, fontSize: "12px" }}>{weapon.name}</span>
                            </div>
                            <div style={{
                              display: "inline-block",
                              fontSize: "8px",
                              fontWeight: "bold",
                              color: weaponColor,
                              background: `${weaponColor}22`,
                              border: `1px solid ${weaponColor}`,
                              borderRadius: "3px",
                              padding: "1px 4px",
                              marginTop: "2px",
                            }}>
                              {RARITY_NAMES[weaponRarity]}
                            </div>
                            <div style={{ fontSize: "10px", color: "#ff6b6b", marginTop: "4px" }}>
                              ATK: +{weapon.stats.attack || 0}
                            </div>
                            <button
                              onClick={() => unequipItem("weapon")}
                              style={{
                                marginTop: "8px",
                                background: "rgba(255,107,107,0.2)",
                                border: "1px solid #ff6b6b",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                color: "#ff6b6b",
                                cursor: "pointer",
                                fontFamily: "Orbitron, sans-serif",
                                fontSize: "9px",
                              }}
                            >
                              UNEQUIP
                            </button>
                          </div>
                        ) : null;
                      })() : (
                        <div style={{ color: THEME.colors.locked, fontSize: "11px" }}>Empty</div>
                      )}
                    </div>
                  );
                })()}

                {/* Armor Slot */}
                {(() => {
                  const armorRarity: RarityTier = (saveState.equipped?.armorRarity as RarityTier) || 'common';
                  const armorColor = saveState.equipped?.armor ? RARITY_COLORS[armorRarity] : THEME.colors.locked;
                  return (
                    <div style={{
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: "8px",
                      padding: "12px",
                      minWidth: "150px",
                      border: `2px solid ${armorColor}`,
                    }}>
                      <div style={{ fontSize: "10px", color: THEME.colors.secondary, marginBottom: "4px" }}>ARMOR</div>
                      {saveState.equipped?.armor ? (() => {
                        const armor = getItemWithRarity(saveState.equipped.armor, armorRarity);
                        const baseArmor = getItem(saveState.equipped.armor);
                        return armor && baseArmor ? (
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "20px" }}>{baseArmor.icon}</span>
                              <span style={{ color: THEME.colors.textBright, fontSize: "12px" }}>{armor.name}</span>
                            </div>
                            <div style={{
                              display: "inline-block",
                              fontSize: "8px",
                              fontWeight: "bold",
                              color: armorColor,
                              background: `${armorColor}22`,
                              border: `1px solid ${armorColor}`,
                              borderRadius: "3px",
                              padding: "1px 4px",
                              marginTop: "2px",
                            }}>
                              {RARITY_NAMES[armorRarity]}
                            </div>
                            <div style={{ fontSize: "10px", color: "#4ecdc4", marginTop: "4px" }}>
                              DEF: +{armor.stats.defense || 0}
                            </div>
                            <button
                              onClick={() => unequipItem("armor")}
                              style={{
                                marginTop: "8px",
                                background: "rgba(78,205,196,0.2)",
                                border: "1px solid #4ecdc4",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                color: "#4ecdc4",
                                cursor: "pointer",
                                fontFamily: "Orbitron, sans-serif",
                                fontSize: "9px",
                              }}
                            >
                              UNEQUIP
                            </button>
                          </div>
                        ) : null;
                      })() : (
                        <div style={{ color: THEME.colors.locked, fontSize: "11px" }}>Empty</div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crafting Modal */}
      {activeModal === "crafting" && selectedStation && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
        }}>
          <div style={{
            background: THEME.colors.panel,
            border: THEME.borders.active,
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}>
              <h2 style={{ color: THEME.colors.primary, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "28px", fontFamily: "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif" }}>{STATIONS[selectedStation].icon}</span>
                {STATIONS[selectedStation].name} RECIPES
              </h2>
              <button
                onClick={() => setActiveModal("none")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: THEME.colors.text,
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {(() => {
              const stationLevel = saveState.stationLevels[selectedStation];
              const recipes = getAvailableRecipes(selectedStation, saveState.progress.level, stationLevel);

              if (recipes.length === 0) {
                return (
                  <div style={{ textAlign: "center", color: THEME.colors.text, padding: "40px" }}>
                    No recipes available. Level up to unlock more!
                  </div>
                );
              }

              return recipes.map((recipe) => {
                const canCraft = canCraftRecipe(recipe, saveState.resources as unknown as Record<string, number>);
                return (
                  <div
                    key={recipe.id}
                    style={{
                      background: canCraft ? "rgba(102, 252, 241, 0.1)" : "rgba(0,0,0,0.3)",
                      borderRadius: "8px",
                      padding: "12px",
                      marginBottom: "8px",
                      border: canCraft ? `1px solid ${THEME.colors.secondary}` : "1px solid transparent",
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <div>
                        <div style={{ color: THEME.colors.textBright, fontWeight: "bold" }}>
                          {recipe.name}
                        </div>
                        <div style={{ fontSize: "11px", color: THEME.colors.text, marginTop: "2px" }}>
                          {recipe.description}
                        </div>
                        <div style={{ fontSize: "11px", color: THEME.colors.secondary, marginTop: "4px" }}>
                          Requires: {recipe.inputs.map((i) =>
                            `${i.quantity}x ${MATERIAL_NAMES[i.resource as RawResourceKey] || PROCESSED_NAMES[i.resource] || i.resource}`
                          ).join(", ")}
                        </div>
                        <div style={{ fontSize: "11px", color: THEME.colors.warning, marginTop: "2px" }}>
                          Time: {recipe.craftTimeSeconds}s | XP: +{recipe.xpReward}
                        </div>
                      </div>
                      <button
                        onClick={() => startCraft(recipe.id)}
                        disabled={!canCraft}
                        style={{
                          background: canCraft ? THEME.gradients.button : THEME.colors.locked,
                          border: "none",
                          borderRadius: "6px",
                          padding: "10px 20px",
                          color: canCraft ? "#000" : THEME.colors.text,
                          fontWeight: "bold",
                          cursor: canCraft ? "pointer" : "not-allowed",
                          fontFamily: "Orbitron, sans-serif",
                          fontSize: "12px",
                        }}
                      >
                        CRAFT
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Recipe Chart Modal */}
      {showRecipeChart && (
        <RecipeChart
          onClose={() => setShowRecipeChart(false)}
          playerLevel={saveState.progress.level}
        />
      )}

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
