"use client";

import React, { useState } from "react";
import { RECIPES } from "./data/recipes";
import { getItem } from "./data/items";
import { STATIONS } from "./data/stations";
import {
  MATERIAL_NAMES,
  MATERIAL_ICONS,
  PROCESSED_NAMES,
  PROCESSED_ICONS,
  THEME,
} from "./constants";

type FilterCategory = "all" | "material" | "weapon" | "armor";

// Get resource display name
function getResourceName(key: string): string {
  return MATERIAL_NAMES[key as keyof typeof MATERIAL_NAMES] ||
    PROCESSED_NAMES[key as keyof typeof PROCESSED_NAMES] ||
    key;
}

// Get resource icon
function getResourceIcon(key: string): string {
  return MATERIAL_ICONS[key as keyof typeof MATERIAL_ICONS] ||
    PROCESSED_ICONS[key as keyof typeof PROCESSED_ICONS] ||
    "📦";
}

// Tier colors
const TIER_COLORS = {
  1: { bg: "rgba(156,163,175,0.2)", border: "#9ca3af", label: "Common" },
  2: { bg: "rgba(96,165,250,0.2)", border: "#60a5fa", label: "Uncommon" },
  3: { bg: "rgba(167,139,250,0.2)", border: "#a78bfa", label: "Rare" },
  4: { bg: "rgba(251,191,36,0.2)", border: "#fbbf24", label: "Legendary" },
};

// Category icons
const CATEGORY_ICONS = {
  material: "⚗️",
  weapon: "⚔️",
  armor: "🛡️",
};

interface RecipeChartProps {
  onClose: () => void;
  playerLevel?: number;
}

export default function RecipeChart({ onClose, playerLevel = 1 }: RecipeChartProps) {
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [showUnlockable, setShowUnlockable] = useState(true);

  // Sort recipes by tier and level requirement
  const sortedRecipes = [...RECIPES].sort((a, b) => {
    // First by required level
    if (a.requiredLevel !== b.requiredLevel) return a.requiredLevel - b.requiredLevel;
    // Then by craft time (complexity)
    return a.craftTimeSeconds - b.craftTimeSeconds;
  });

  // Filter recipes
  const filteredRecipes = sortedRecipes.filter((recipe) => {
    if (filter !== "all" && recipe.category !== filter) return false;
    if (!showUnlockable && recipe.requiredLevel > playerLevel) return false;
    return true;
  });

  // Group by category for display
  const materialRecipes = filteredRecipes.filter((r) => r.category === "material");
  const weaponRecipes = filteredRecipes.filter((r) => r.category === "weapon");
  const armorRecipes = filteredRecipes.filter((r) => r.category === "armor");

  // Get tier for item recipes
  const getRecipeTier = (recipe: typeof RECIPES[0]): number => {
    if (recipe.output.itemId) {
      const item = getItem(recipe.output.itemId);
      return item?.tier || 1;
    }
    // Materials based on level requirement
    if (recipe.requiredLevel >= 5) return 3;
    if (recipe.requiredLevel >= 3) return 2;
    return 1;
  };

  const renderRecipeCard = (recipe: typeof RECIPES[0]) => {
    const tier = getRecipeTier(recipe);
    const tierStyle = TIER_COLORS[tier as keyof typeof TIER_COLORS];
    const station = STATIONS[recipe.station];
    const isLocked = recipe.requiredLevel > playerLevel;
    const outputItem = recipe.output.itemId ? getItem(recipe.output.itemId) : null;

    return (
      <div
        key={recipe.id}
        style={{
          background: isLocked ? "rgba(31, 40, 51, 0.5)" : tierStyle.bg,
          border: `1px solid ${isLocked ? "#333" : tierStyle.border}`,
          borderRadius: "8px",
          padding: "12px",
          opacity: isLocked ? 0.6 : 1,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>
                {outputItem ? outputItem.icon : CATEGORY_ICONS[recipe.category]}
              </span>
              <span style={{ color: isLocked ? THEME.colors.locked : THEME.colors.textBright, fontWeight: "bold", fontSize: "14px" }}>
                {recipe.name}
              </span>
            </div>
            <div style={{ fontSize: "10px", color: THEME.colors.text, marginTop: "2px" }}>
              {recipe.description}
            </div>
          </div>
          <div style={{
            background: "rgba(0,0,0,0.5)",
            borderRadius: "4px",
            padding: "2px 6px",
            fontSize: "9px",
            color: tierStyle.border,
          }}>
            {tierStyle.label}
          </div>
        </div>

        {/* Requirements */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: "6px",
          padding: "8px",
          marginBottom: "8px",
        }}>
          <div style={{ fontSize: "10px", color: THEME.colors.secondary, marginBottom: "4px" }}>
            REQUIRES:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {recipe.inputs.map((input, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "rgba(102, 252, 241, 0.1)",
                  borderRadius: "4px",
                  padding: "4px 8px",
                }}
              >
                {getResourceIcon(input.resource).startsWith("/") ? (
                  <img
                    src={getResourceIcon(input.resource)}
                    alt=""
                    style={{ width: "16px", height: "16px", imageRendering: "pixelated" }}
                  />
                ) : (
                  <span style={{ fontSize: "14px" }}>{getResourceIcon(input.resource)}</span>
                )}
                <span style={{ color: THEME.colors.textBright, fontSize: "11px" }}>
                  {input.quantity}x {getResourceName(input.resource)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Output Stats (for items) */}
        {outputItem && (
          <div style={{ marginBottom: "8px", fontSize: "11px" }}>
            {outputItem.stats.attack && (
              <span style={{ color: "#ff6b6b", marginRight: "12px" }}>
                ATK: +{outputItem.stats.attack}
              </span>
            )}
            {outputItem.stats.defense && (
              <span style={{ color: "#4ecdc4", marginRight: "12px" }}>
                DEF: +{outputItem.stats.defense}
              </span>
            )}
            {outputItem.stats.special && (
              <span style={{ color: "#fbbf24", fontSize: "10px" }}>
                {outputItem.stats.special}
              </span>
            )}
          </div>
        )}

        {/* Footer - Station, Time, Level */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "10px",
          color: THEME.colors.text,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "8px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span>{station?.icon}</span>
            <span>{station?.name}</span>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <span style={{ color: THEME.colors.warning }}>
              ⏱️ {recipe.craftTimeSeconds}s
            </span>
            <span style={{ color: isLocked ? "#ff6b6b" : THEME.colors.success }}>
              Lv.{recipe.requiredLevel}
            </span>
            <span style={{ color: THEME.colors.primary }}>
              +{recipe.xpReward} XP
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (title: string, icon: string, recipes: typeof RECIPES) => {
    if (recipes.length === 0) return null;
    return (
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{
          color: THEME.colors.primary,
          margin: "0 0 12px 0",
          fontSize: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span>{icon}</span> {title}
          <span style={{ color: THEME.colors.secondary, fontSize: "12px" }}>
            ({recipes.length})
          </span>
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "12px",
        }}>
          {recipes.map(renderRecipeCard)}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.9)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: "20px",
    }}>
      <div style={{
        background: THEME.colors.panel,
        border: THEME.borders.active,
        borderRadius: "12px",
        width: "100%",
        maxWidth: "1000px",
        maxHeight: "90vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px",
          borderBottom: `1px solid ${THEME.colors.secondary}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <h2 style={{ color: THEME.colors.primary, margin: 0, fontSize: "24px" }}>
              📜 RECIPE GUIDE
            </h2>
            <p style={{ color: THEME.colors.text, margin: "4px 0 0 0", fontSize: "12px" }}>
              All craftable items and their requirements
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: THEME.colors.text,
              fontSize: "28px",
              cursor: "pointer",
              padding: "0 8px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div style={{
          padding: "12px 20px",
          borderBottom: `1px solid rgba(255,255,255,0.1)`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {(["all", "material", "weapon", "armor"] as FilterCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  background: filter === cat ? THEME.gradients.button : "rgba(0,0,0,0.3)",
                  border: filter === cat ? "none" : `1px solid ${THEME.colors.secondary}`,
                  borderRadius: "6px",
                  padding: "8px 16px",
                  color: filter === cat ? "#000" : THEME.colors.text,
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "11px",
                  textTransform: "uppercase",
                }}
              >
                {cat === "all" ? "All" : `${CATEGORY_ICONS[cat]} ${cat}`}
              </button>
            ))}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={showUnlockable}
              onChange={(e) => setShowUnlockable(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <span style={{ color: THEME.colors.text, fontSize: "12px" }}>
              Show locked recipes
            </span>
          </label>
        </div>

        {/* Content */}
        <div style={{
          padding: "20px",
          overflowY: "auto",
          flex: 1,
        }}>
          {filter === "all" ? (
            <>
              {renderSection("Materials", "⚗️", materialRecipes)}
              {renderSection("Weapons", "⚔️", weaponRecipes)}
              {renderSection("Armor", "🛡️", armorRecipes)}
            </>
          ) : (
            renderSection(
              filter.charAt(0).toUpperCase() + filter.slice(1) + "s",
              CATEGORY_ICONS[filter as keyof typeof CATEGORY_ICONS] || "📦",
              filteredRecipes
            )
          )}

          {filteredRecipes.length === 0 && (
            <div style={{
              textAlign: "center",
              color: THEME.colors.text,
              padding: "40px",
            }}>
              No recipes found with current filters
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{
          padding: "12px 20px",
          borderTop: `1px solid rgba(255,255,255,0.1)`,
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          fontSize: "10px",
        }}>
          {Object.entries(TIER_COLORS).map(([tier, style]) => (
            <div key={tier} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "12px",
                height: "12px",
                background: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: "2px",
              }} />
              <span style={{ color: style.border }}>{style.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
