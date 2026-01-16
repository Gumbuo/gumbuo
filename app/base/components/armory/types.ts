// ============== RESOURCES ==============
export interface ArmoryResources {
  // Raw materials (purchased with AP)
  plasmaOre: number;
  voidCrystal: number;
  bioMetal: number;
  quantumDust: number;
  nebulaEssence: number;
  // Processed materials (crafted)
  refinedPlasma: number;
  voidShard: number;
  bioAlloy: number;
  quantumCore: number;
}

export type RawResourceKey = 'plasmaOre' | 'voidCrystal' | 'bioMetal' | 'quantumDust' | 'nebulaEssence';
export type ProcessedResourceKey = 'refinedPlasma' | 'voidShard' | 'bioAlloy' | 'quantumCore';
export type ResourceKey = keyof ArmoryResources;

// ============== STATIONS ==============
export type StationId = 'plasmaRefinery' | 'voidForge' | 'bioLab' | 'quantumChamber' | 'assemblyBay';

export interface StationLevels {
  plasmaRefinery: number;  // 1-5 (starts at 1)
  voidForge: number;       // 0 = locked, 1-5
  bioLab: number;          // 0 = locked, 1-5
  quantumChamber: number;  // 0 = locked, 1-5
  assemblyBay: number;     // 1-5 (starts at 1)
}

export interface StationDefinition {
  id: StationId;
  name: string;
  description: string;
  icon: string;
  unlockLevel: number;     // Player level required to unlock
  maxLevel: number;
  baseQueueSize: number;
  upgradeCosts: number[];  // AP cost per level [0, level2, level3, level4, level5]
  speedBonusPerLevel: number; // % reduction per level
}

// ============== CRAFTING ==============
export interface CraftingJob {
  id: string;              // UUID
  recipeId: string;        // Reference to recipe
  stationId: StationId;    // Which station is crafting
  startTime: number;       // Unix timestamp (ms)
  endTime: number;         // Unix timestamp (ms)
  speedUpApplied: number;  // AP spent to speed up (for tracking)
}

export interface CraftingQueue {
  plasmaRefinery: CraftingJob[];
  voidForge: CraftingJob[];
  bioLab: CraftingJob[];
  quantumChamber: CraftingJob[];
  assemblyBay: CraftingJob[];
}

// ============== RECIPES ==============
export interface RecipeInput {
  resource: ResourceKey;
  quantity: number;
}

export type RecipeCategory = 'material' | 'weapon' | 'armor';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  station: StationId;
  inputs: RecipeInput[];
  output: {
    resource?: ResourceKey;  // For material recipes
    itemId?: string;         // For item recipes
    quantity: number;
  };
  craftTimeSeconds: number;
  requiredLevel: number;        // Player level required
  requiredStationLevel: number; // Station level required
  xpReward: number;
  category: RecipeCategory;
}

// ============== ITEMS ==============
export type ItemTier = 1 | 2 | 3 | 4;
export type ItemType = 'weapon' | 'armor';

export interface ArmoryItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  tier: ItemTier;
  icon: string;            // Emoji placeholder
  sellValue: number;       // AP earned when sold
  stats: {
    attack?: number;
    defense?: number;
    special?: string;
  };
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

// ============== PLAYER PROGRESS ==============
export interface ArmoryProgress {
  level: number;             // 1-10
  xp: number;                // Current XP
  xpToNextLevel: number;     // XP needed for next level
  totalItemsCrafted: number;
  totalAPSpent: number;
  totalAPEarned: number;     // From selling items
  firstCrafts: string[];     // Array of itemIds crafted for first time (bonus XP)
  dailyLoginStreak: number;
  lastLoginDate: string;     // YYYY-MM-DD format
}

// ============== MAIN SAVE STATE ==============
export interface ArmorySaveState {
  wallet: string;
  resources: ArmoryResources;
  craftingQueues: CraftingQueue;
  stationLevels: StationLevels;
  inventory: InventoryItem[];
  progress: ArmoryProgress;
  lastUpdated: number;       // Unix timestamp (ms)
  createdAt: number;         // Unix timestamp (ms)
}

// ============== API TYPES ==============
export interface ArmoryAPIResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface ShopPurchaseRequest {
  wallet: string;
  resourceId: RawResourceKey;
  quantity: number;
}

export interface CraftStartRequest {
  wallet: string;
  recipeId: string;
  stationId: StationId;
}

export interface CraftSpeedUpRequest {
  wallet: string;
  jobId: string;
  speedUpType: 'half' | 'instant';
}

export interface SellItemRequest {
  wallet: string;
  itemId: string;
  quantity: number;
}

export interface UpgradeStationRequest {
  wallet: string;
  stationId: StationId;
}

// ============== UI STATE ==============
export interface ModalState {
  shop: boolean;
  inventory: boolean;
  crafting: boolean;
  stationUpgrade: boolean;
}

export interface SelectedStation {
  id: StationId;
  definition: StationDefinition;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
