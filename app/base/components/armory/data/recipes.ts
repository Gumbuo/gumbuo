import { Recipe } from '../types';

export const RECIPES: Recipe[] = [
  // ============== MATERIAL RECIPES ==============
  {
    id: 'refined-plasma',
    name: 'Refined Plasma',
    description: 'Process raw plasma ore into refined form',
    station: 'plasmaRefinery',
    inputs: [{ resource: 'plasmaOre', quantity: 3 }],
    output: { resource: 'refinedPlasma', quantity: 1 },
    craftTimeSeconds: 30,
    requiredLevel: 1,
    requiredStationLevel: 1,
    xpReward: 10,
    category: 'material',
  },
  {
    id: 'void-shard',
    name: 'Void Shard',
    description: 'Compress void crystals into concentrated shards',
    station: 'voidForge',
    inputs: [{ resource: 'voidCrystal', quantity: 2 }],
    output: { resource: 'voidShard', quantity: 1 },
    craftTimeSeconds: 60,
    requiredLevel: 2,
    requiredStationLevel: 1,
    xpReward: 20,
    category: 'material',
  },
  {
    id: 'bio-alloy',
    name: 'Bio-Alloy',
    description: 'Synthesize organic metal from bio compounds',
    station: 'bioLab',
    inputs: [
      { resource: 'bioMetal', quantity: 2 },
      { resource: 'plasmaOre', quantity: 1 },
    ],
    output: { resource: 'bioAlloy', quantity: 1 },
    craftTimeSeconds: 45,
    requiredLevel: 3,
    requiredStationLevel: 1,
    xpReward: 25,
    category: 'material',
  },
  {
    id: 'quantum-core',
    name: 'Quantum Core',
    description: 'Stabilize quantum particles into a power core',
    station: 'quantumChamber',
    inputs: [
      { resource: 'quantumDust', quantity: 3 },
      { resource: 'voidCrystal', quantity: 1 },
    ],
    output: { resource: 'quantumCore', quantity: 1 },
    craftTimeSeconds: 120,
    requiredLevel: 5,
    requiredStationLevel: 1,
    xpReward: 50,
    category: 'material',
  },

  // ============== TIER 1 WEAPON RECIPES ==============
  {
    id: 'craft-plasma-pistol',
    name: 'Plasma Pistol',
    description: 'Assemble a standard plasma sidearm',
    station: 'assemblyBay',
    inputs: [{ resource: 'refinedPlasma', quantity: 2 }],
    output: { itemId: 'plasma-pistol', quantity: 1 },
    craftTimeSeconds: 60,
    requiredLevel: 1,
    requiredStationLevel: 1,
    xpReward: 15,
    category: 'weapon',
  },
  {
    id: 'craft-bio-blade',
    name: 'Bio-Blade',
    description: 'Grow a living blade from organic matter',
    station: 'assemblyBay',
    inputs: [{ resource: 'bioAlloy', quantity: 1 }],
    output: { itemId: 'bio-blade', quantity: 1 },
    craftTimeSeconds: 45,
    requiredLevel: 3,
    requiredStationLevel: 1,
    xpReward: 12,
    category: 'weapon',
  },

  // ============== TIER 1 ARMOR RECIPES ==============
  {
    id: 'craft-plasma-shield',
    name: 'Plasma Shield',
    description: 'Construct an energy barrier device',
    station: 'assemblyBay',
    inputs: [{ resource: 'refinedPlasma', quantity: 3 }],
    output: { itemId: 'plasma-shield', quantity: 1 },
    craftTimeSeconds: 60,
    requiredLevel: 1,
    requiredStationLevel: 1,
    xpReward: 18,
    category: 'armor',
  },
  {
    id: 'craft-bio-vest',
    name: 'Bio-Vest',
    description: 'Cultivate a living armor vest',
    station: 'assemblyBay',
    inputs: [{ resource: 'bioAlloy', quantity: 2 }],
    output: { itemId: 'bio-vest', quantity: 1 },
    craftTimeSeconds: 75,
    requiredLevel: 3,
    requiredStationLevel: 1,
    xpReward: 22,
    category: 'armor',
  },

  // ============== TIER 2 WEAPON RECIPES ==============
  {
    id: 'craft-void-rifle',
    name: 'Void Rifle',
    description: 'Engineer a dimensional energy weapon',
    station: 'assemblyBay',
    inputs: [
      { resource: 'voidShard', quantity: 2 },
      { resource: 'refinedPlasma', quantity: 1 },
    ],
    output: { itemId: 'void-rifle', quantity: 1 },
    craftTimeSeconds: 120,
    requiredLevel: 4,
    requiredStationLevel: 2,
    xpReward: 35,
    category: 'weapon',
  },
  {
    id: 'craft-quantum-dagger',
    name: 'Quantum Dagger',
    description: 'Forge a phase-shifting blade',
    station: 'assemblyBay',
    inputs: [{ resource: 'quantumCore', quantity: 1 }],
    output: { itemId: 'quantum-dagger', quantity: 1 },
    craftTimeSeconds: 90,
    requiredLevel: 5,
    requiredStationLevel: 2,
    xpReward: 30,
    category: 'weapon',
  },

  // ============== TIER 2 ARMOR RECIPES ==============
  {
    id: 'craft-void-helm',
    name: 'Void Helm',
    description: 'Craft a helmet infused with void energy',
    station: 'assemblyBay',
    inputs: [
      { resource: 'voidShard', quantity: 2 },
      { resource: 'bioAlloy', quantity: 1 },
    ],
    output: { itemId: 'void-helm', quantity: 1 },
    craftTimeSeconds: 120,
    requiredLevel: 4,
    requiredStationLevel: 2,
    xpReward: 40,
    category: 'armor',
  },

  // ============== TIER 3 WEAPON RECIPES ==============
  {
    id: 'craft-plasma-cannon',
    name: 'Plasma Cannon',
    description: 'Build a devastating heavy weapon',
    station: 'assemblyBay',
    inputs: [
      { resource: 'refinedPlasma', quantity: 5 },
      { resource: 'voidShard', quantity: 2 },
    ],
    output: { itemId: 'plasma-cannon', quantity: 1 },
    craftTimeSeconds: 180,
    requiredLevel: 6,
    requiredStationLevel: 3,
    xpReward: 60,
    category: 'weapon',
  },
  {
    id: 'craft-nebula-blade',
    name: 'Nebula Blade',
    description: 'Forge a legendary stellar sword',
    station: 'assemblyBay',
    inputs: [
      { resource: 'quantumCore', quantity: 1 },
      { resource: 'nebulaEssence', quantity: 1 },
    ],
    output: { itemId: 'nebula-blade', quantity: 1 },
    craftTimeSeconds: 240,
    requiredLevel: 6,
    requiredStationLevel: 3,
    xpReward: 85,
    category: 'weapon',
  },

  // ============== TIER 3 ARMOR RECIPES ==============
  {
    id: 'craft-quantum-armor',
    name: 'Quantum Armor',
    description: 'Construct phase-shifting full body armor',
    station: 'assemblyBay',
    inputs: [
      { resource: 'quantumCore', quantity: 2 },
      { resource: 'bioAlloy', quantity: 3 },
    ],
    output: { itemId: 'quantum-armor', quantity: 1 },
    craftTimeSeconds: 240,
    requiredLevel: 6,
    requiredStationLevel: 3,
    xpReward: 95,
    category: 'armor',
  },

  // ============== TIER 4 WEAPON RECIPES ==============
  {
    id: 'craft-void-annihilator',
    name: 'Void Annihilator',
    description: 'Create the ultimate weapon of destruction',
    station: 'assemblyBay',
    inputs: [
      { resource: 'voidShard', quantity: 3 },
      { resource: 'quantumCore', quantity: 2 },
      { resource: 'nebulaEssence', quantity: 1 },
    ],
    output: { itemId: 'void-annihilator', quantity: 1 },
    craftTimeSeconds: 360,
    requiredLevel: 7,
    requiredStationLevel: 4,
    xpReward: 180,
    category: 'weapon',
  },

  // ============== TIER 4 ARMOR RECIPES ==============
  {
    id: 'craft-nebula-exosuit',
    name: 'Nebula Exosuit',
    description: 'Build legendary powered armor',
    station: 'assemblyBay',
    inputs: [
      { resource: 'quantumCore', quantity: 2 },
      { resource: 'nebulaEssence', quantity: 2 },
      { resource: 'bioAlloy', quantity: 5 },
    ],
    output: { itemId: 'nebula-exosuit', quantity: 1 },
    craftTimeSeconds: 480,
    requiredLevel: 7,
    requiredStationLevel: 4,
    xpReward: 240,
    category: 'armor',
  },
];

// Get recipes by station
export function getRecipesByStation(stationId: string): Recipe[] {
  return RECIPES.filter(recipe => recipe.station === stationId);
}

// Get recipe by ID
export function getRecipe(recipeId: string): Recipe | undefined {
  return RECIPES.find(recipe => recipe.id === recipeId);
}

// Get available recipes for a station at given player/station levels
export function getAvailableRecipes(
  stationId: string,
  playerLevel: number,
  stationLevel: number
): Recipe[] {
  return RECIPES.filter(
    recipe =>
      recipe.station === stationId &&
      recipe.requiredLevel <= playerLevel &&
      recipe.requiredStationLevel <= stationLevel
  );
}

// Check if player has enough resources for a recipe
export function canCraftRecipe(
  recipe: Recipe,
  resources: Record<string, number>
): boolean {
  return recipe.inputs.every(
    input => (resources[input.resource] || 0) >= input.quantity
  );
}
