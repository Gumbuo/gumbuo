import { ArmoryItem, RarityTier } from '../types';
import { RARITY_STAT_MULTIPLIERS, RARITY_SELL_MULTIPLIERS, RARITY_NAMES } from '../constants';

export const ITEMS: Record<string, ArmoryItem> = {
  // ============== TIER 1 WEAPONS ==============
  'plasma-pistol': {
    id: 'plasma-pistol',
    name: 'Plasma Pistol',
    description: 'Standard issue alien sidearm. Reliable and deadly.',
    type: 'weapon',
    tier: 1,
    icon: '🔫',
    sellValue: 100,
    stats: { attack: 15 },
  },
  'bio-blade': {
    id: 'bio-blade',
    name: 'Bio-Blade',
    description: 'Living organic blade that adapts to combat.',
    type: 'weapon',
    tier: 1,
    icon: '🗡️',
    sellValue: 80,
    stats: { attack: 12, special: 'Regenerates 1 HP per hit' },
  },

  // ============== TIER 1 ARMOR ==============
  'plasma-shield': {
    id: 'plasma-shield',
    name: 'Plasma Shield',
    description: 'Energy barrier that absorbs incoming damage.',
    type: 'armor',
    tier: 1,
    icon: '🛡️',
    sellValue: 120,
    stats: { defense: 10 },
  },
  'bio-vest': {
    id: 'bio-vest',
    name: 'Bio-Vest',
    description: 'Living armor that heals minor wounds.',
    type: 'armor',
    tier: 1,
    icon: '🦺',
    sellValue: 150,
    stats: { defense: 8, special: 'Slow health regen' },
  },

  // ============== TIER 2 WEAPONS ==============
  'void-rifle': {
    id: 'void-rifle',
    name: 'Void Rifle',
    description: 'Fires bolts of compressed void energy.',
    type: 'weapon',
    tier: 2,
    icon: '🔮',
    sellValue: 250,
    stats: { attack: 35, special: 'Pierces armor' },
  },
  'quantum-dagger': {
    id: 'quantum-dagger',
    name: 'Quantum Dagger',
    description: 'Phases through reality to strike true.',
    type: 'weapon',
    tier: 2,
    icon: '⚔️',
    sellValue: 200,
    stats: { attack: 25, special: 'Ignores dodge' },
  },

  // ============== TIER 2 ARMOR ==============
  'void-helm': {
    id: 'void-helm',
    name: 'Void Helm',
    description: 'Helmet infused with dimensional energy.',
    type: 'armor',
    tier: 2,
    icon: '⛑️',
    sellValue: 300,
    stats: { defense: 20, special: 'Void sight' },
  },

  // ============== TIER 3 WEAPONS ==============
  'plasma-cannon': {
    id: 'plasma-cannon',
    name: 'Plasma Cannon',
    description: 'Heavy weapon capable of devastating attacks.',
    type: 'weapon',
    tier: 3,
    icon: '💥',
    sellValue: 500,
    stats: { attack: 65, special: 'AOE damage' },
  },
  'nebula-blade': {
    id: 'nebula-blade',
    name: 'Nebula Blade',
    description: 'Sword forged from stellar remnants.',
    type: 'weapon',
    tier: 3,
    icon: '⭐',
    sellValue: 750,
    stats: { attack: 55, special: 'Critical hit +25%' },
  },

  // ============== TIER 3 ARMOR ==============
  'quantum-armor': {
    id: 'quantum-armor',
    name: 'Quantum Armor',
    description: 'Full body armor existing in multiple states.',
    type: 'armor',
    tier: 3,
    icon: '🛸',
    sellValue: 800,
    stats: { defense: 45, special: '10% phase shift' },
  },

  // ============== TIER 4 WEAPONS ==============
  'void-annihilator': {
    id: 'void-annihilator',
    name: 'Void Annihilator',
    description: 'The ultimate weapon. Erases matter from existence.',
    type: 'weapon',
    tier: 4,
    icon: '☄️',
    sellValue: 1500,
    stats: { attack: 120, special: 'Instant kill chance' },
  },

  // ============== TIER 4 ARMOR ==============
  'nebula-exosuit': {
    id: 'nebula-exosuit',
    name: 'Nebula Exosuit',
    description: 'Legendary powered armor from beyond the stars.',
    type: 'armor',
    tier: 4,
    icon: '🚀',
    sellValue: 2000,
    stats: { defense: 80, attack: 30, special: 'Flight capable' },
  },
};

export const ITEMS_BY_TIER: Record<number, ArmoryItem[]> = {
  1: Object.values(ITEMS).filter(item => item.tier === 1),
  2: Object.values(ITEMS).filter(item => item.tier === 2),
  3: Object.values(ITEMS).filter(item => item.tier === 3),
  4: Object.values(ITEMS).filter(item => item.tier === 4),
};

export const WEAPONS = Object.values(ITEMS).filter(item => item.type === 'weapon');
export const ARMOR = Object.values(ITEMS).filter(item => item.type === 'armor');

export function getItem(itemId: string): ArmoryItem | undefined {
  return ITEMS[itemId];
}

export function getItemWithRarity(itemId: string, rarity: RarityTier): ArmoryItem | undefined {
  const base = ITEMS[itemId];
  if (!base) return undefined;

  const statMul = RARITY_STAT_MULTIPLIERS[rarity];
  const sellMul = RARITY_SELL_MULTIPLIERS[rarity];

  return {
    ...base,
    name: rarity === 'common' ? base.name : `${RARITY_NAMES[rarity]} ${base.name}`,
    sellValue: Math.floor(base.sellValue * sellMul),
    stats: {
      attack: base.stats.attack ? Math.floor(base.stats.attack * statMul) : undefined,
      defense: base.stats.defense ? Math.floor(base.stats.defense * statMul) : undefined,
      special: base.stats.special,
    },
  };
}
