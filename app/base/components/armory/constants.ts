import { ArmoryResources, StationLevels, ArmoryProgress, RawResourceKey, RarityTier } from './types';

// ============== SHOP PRICES ==============
export const MATERIAL_COSTS: Record<RawResourceKey, number> = {
  plasmaOre: 50,
  voidCrystal: 100,
  bioMetal: 75,
  quantumDust: 150,
  nebulaEssence: 200,
};

export const MATERIAL_NAMES: Record<RawResourceKey, string> = {
  plasmaOre: 'Plasma Ore',
  voidCrystal: 'Void Crystal',
  bioMetal: 'Bio-Metal',
  quantumDust: 'Quantum Dust',
  nebulaEssence: 'Nebula Essence',
};

export const MATERIAL_ICONS: Record<RawResourceKey, string> = {
  plasmaOre: '🟢',
  voidCrystal: '🔮',
  bioMetal: '🧬',
  quantumDust: '✨',
  nebulaEssence: '🌌',
};

export const PROCESSED_NAMES: Record<string, string> = {
  refinedPlasma: 'Refined Plasma',
  voidShard: 'Void Shard',
  bioAlloy: 'Bio-Alloy',
  quantumCore: 'Quantum Core',
};

export const PROCESSED_ICONS: Record<string, string> = {
  refinedPlasma: '💚',
  voidShard: '💎',
  bioAlloy: '🔩',
  quantumCore: '⚛️',
};

// ============== RARITY ==============
export const RARITY_NAMES: Record<RarityTier, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
};

export const RARITY_COLORS: Record<RarityTier, string> = {
  common: '#9ca3af',
  uncommon: '#60a5fa',
  rare: '#a78bfa',
  epic: '#fbbf24',
};

export const RARITY_STAT_MULTIPLIERS: Record<RarityTier, number> = {
  common: 1,
  uncommon: 1.5,
  rare: 2,
  epic: 3,
};

export const RARITY_SELL_MULTIPLIERS: Record<RarityTier, number> = {
  common: 1,
  uncommon: 2,
  rare: 4,
  epic: 8,
};

export const MERGE_COST = 50; // AP cost per merge

export const RARITY_UPGRADE_PATH: Record<RarityTier, RarityTier | null> = {
  common: 'uncommon',
  uncommon: 'rare',
  rare: 'epic',
  epic: null,
};

export const MERGE_XP_REWARD = 25;

// ============== PROGRESSION ==============
export const XP_REQUIREMENTS: number[] = [
  0,      // Level 1 (starting)
  500,    // Level 2
  1500,   // Level 3
  3000,   // Level 4
  6000,   // Level 5
  10000,  // Level 6
  15000,  // Level 7
  22000,  // Level 8
  30000,  // Level 9
  40000,  // Level 10
];

export const LEVEL_TITLES: string[] = [
  'Novice Smith',        // Level 1
  'Apprentice',          // Level 2
  'Journeyman',          // Level 3
  'Craftsman',           // Level 4
  'Expert Forger',       // Level 5
  'Master Smith',        // Level 6
  'Grandmaster',         // Level 7
  'Legendary Forger',    // Level 8
  'Cosmic Artisan',      // Level 9
  'Alien Armory Master', // Level 10
];

export const FIRST_CRAFT_BONUS_XP = 50;
export const DAILY_LOGIN_XP = 100;

// ============== SPEED UP COSTS ==============
export const SPEED_UP_MINIMUM_COST = {
  half: 5,
  instant: 10,
};

// AP cost = remaining seconds / divisor, min = minimum cost
export const SPEED_UP_DIVISOR = {
  half: 4,    // remainingSeconds / 4 = AP cost
  instant: 2, // remainingSeconds / 2 = AP cost
};

// ============== DEFAULT STATE ==============
export const DEFAULT_RESOURCES: ArmoryResources = {
  plasmaOre: 5,      // Start with some materials
  voidCrystal: 0,
  bioMetal: 0,
  quantumDust: 0,
  nebulaEssence: 0,
  refinedPlasma: 0,
  voidShard: 0,
  bioAlloy: 0,
  quantumCore: 0,
};

export const DEFAULT_STATION_LEVELS: StationLevels = {
  plasmaRefinery: 1,   // Starts unlocked
  voidForge: 0,        // Locked
  bioLab: 0,           // Locked
  quantumChamber: 0,   // Locked
  assemblyBay: 1,      // Starts unlocked
};

export const DEFAULT_PROGRESS: ArmoryProgress = {
  level: 1,
  xp: 0,
  xpToNextLevel: XP_REQUIREMENTS[1],
  totalItemsCrafted: 0,
  totalAPSpent: 0,
  totalAPEarned: 0,
  firstCrafts: [],
  dailyLoginStreak: 0,
  lastLoginDate: '',
};

// ============== UI CONSTANTS ==============
export const THEME = {
  colors: {
    primary: '#66fcf1',
    secondary: '#45a29e',
    background: '#0b0c10',
    panel: '#1f2833',
    panelLight: 'rgba(31, 40, 51, 0.95)',
    text: '#c5c6c7',
    textBright: '#ffffff',
    success: '#4ade80',
    warning: '#facc15',
    error: '#ff6464',
    locked: '#6b7280',
  },
  borders: {
    panel: '2px solid #45a29e',
    active: '2px solid #66fcf1',
    locked: '2px solid #4b5563',
  },
  gradients: {
    button: 'linear-gradient(135deg, #66fcf1, #45a29e)',
    header: 'linear-gradient(to bottom, #1f2833, #0b0c10)',
    tier1: 'linear-gradient(135deg, #9ca3af, #6b7280)',
    tier2: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
    tier3: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    tier4: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  },
  shadows: {
    glow: '0 0 20px rgba(102, 252, 241, 0.5)',
    glowStrong: '0 0 30px rgba(102, 252, 241, 0.7)',
  },
};

// ============== HELPER FUNCTIONS ==============
export function getXPForLevel(level: number): number {
  if (level < 1) return 0;
  if (level > 10) return XP_REQUIREMENTS[10];
  return XP_REQUIREMENTS[level - 1];
}

export function getLevelTitle(level: number): string {
  if (level < 1) return LEVEL_TITLES[0];
  if (level > 10) return LEVEL_TITLES[9];
  return LEVEL_TITLES[level - 1];
}

export function calculateSpeedUpCost(
  remainingSeconds: number,
  type: 'half' | 'instant'
): number {
  const cost = Math.ceil(remainingSeconds / SPEED_UP_DIVISOR[type]);
  return Math.max(cost, SPEED_UP_MINIMUM_COST[type]);
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimeVerbose(seconds: number): string {
  if (seconds <= 0) return 'Ready!';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) {
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}
