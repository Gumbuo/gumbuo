import { StationDefinition, StationId } from '../types';

export const STATIONS: Record<StationId, StationDefinition> = {
  plasmaRefinery: {
    id: 'plasmaRefinery',
    name: 'Plasma Refinery',
    description: 'Processes raw plasma ore into refined plasma for weapon cores',
    icon: '/images/armory/stations/plasma-refinery.png',
    unlockLevel: 1,
    maxLevel: 5,
    baseQueueSize: 1,
    upgradeCosts: [0, 500, 1000, 2000, 4000],
    speedBonusPerLevel: 10,
  },
  voidForge: {
    id: 'voidForge',
    name: 'Void Forge',
    description: 'Harnesses void energy to create dimensional weapons',
    icon: '/images/armory/stations/void-forge.png',
    unlockLevel: 2,
    maxLevel: 5,
    baseQueueSize: 1,
    upgradeCosts: [0, 750, 1500, 3000, 6000],
    speedBonusPerLevel: 10,
  },
  bioLab: {
    id: 'bioLab',
    name: 'Bio-Lab',
    description: 'Synthesizes organic alien compounds for living armor',
    icon: '/images/armory/stations/bio-lab.png',
    unlockLevel: 3,
    maxLevel: 5,
    baseQueueSize: 1,
    upgradeCosts: [0, 1000, 2000, 4000, 8000],
    speedBonusPerLevel: 10,
  },
  quantumChamber: {
    id: 'quantumChamber',
    name: 'Quantum Chamber',
    description: 'Manipulates quantum particles for legendary gear',
    icon: '/images/armory/stations/quantum-chamber.png',
    unlockLevel: 5,
    maxLevel: 5,
    baseQueueSize: 1,
    upgradeCosts: [0, 2000, 4000, 8000, 16000],
    speedBonusPerLevel: 10,
  },
  assemblyBay: {
    id: 'assemblyBay',
    name: 'Assembly Bay',
    description: 'Final assembly station for weapons and armor',
    icon: '/images/armory/stations/assembly-bay.png',
    unlockLevel: 1,
    maxLevel: 5,
    baseQueueSize: 1,
    upgradeCosts: [0, 300, 600, 1200, 2400],
    speedBonusPerLevel: 10,
  },
};

export const STATION_ORDER: StationId[] = [
  'plasmaRefinery',
  'voidForge',
  'bioLab',
  'quantumChamber',
  'assemblyBay',
];

// Get max queue size for a station at a given level
export function getStationQueueSize(stationId: StationId, level: number): number {
  const station = STATIONS[stationId];
  return station.baseQueueSize + level;
}

// Get crafting speed multiplier for a station at a given level
export function getStationSpeedMultiplier(stationId: StationId, level: number): number {
  const station = STATIONS[stationId];
  const reduction = station.speedBonusPerLevel * (level - 1);
  return 1 - (reduction / 100);
}

// Get upgrade cost for next level
export function getUpgradeCost(stationId: StationId, currentLevel: number): number | null {
  const station = STATIONS[stationId];
  if (currentLevel >= station.maxLevel) return null;
  return station.upgradeCosts[currentLevel];
}

// Check if station is unlocked at player level
export function isStationUnlocked(stationId: StationId, playerLevel: number): boolean {
  return playerLevel >= STATIONS[stationId].unlockLevel;
}
