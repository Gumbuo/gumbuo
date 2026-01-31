import { getRedis, addUserPoints } from "./points";

const LEVEL_KEY_PREFIX = "gumbuo:player:level:";
const MAX_LEVEL = 50;

export interface PlayerLevelData {
  level: number;
  xp: number;
  totalXpEarned: number;
  lastUpdated: number;
}

export interface AddXPResult {
  levelData: PlayerLevelData;
  levelsGained: number;
  apRewarded: number;
  xpAdded: number;
}

function getLevelKey(wallet: string): string {
  return `${LEVEL_KEY_PREFIX}${wallet.toLowerCase()}`;
}

// XP curve: floor(100 * (n-1)^1.8)
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.8));
}

export function getXPToNextLevel(level: number): number {
  if (level >= MAX_LEVEL) return 0;
  return getXPForLevel(level + 1);
}

export function getXPProgress(level: number, xp: number): number {
  if (level >= MAX_LEVEL) return 100;
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const range = nextLevelXP - currentLevelXP;
  if (range <= 0) return 100;
  const progress = xp - currentLevelXP;
  return Math.min(100, Math.max(0, (progress / range) * 100));
}

const LEVEL_TITLES: string[] = [
  "Recruit",          // 1
  "Scout",            // 2
  "Operative",        // 3
  "Specialist",       // 4
  "Agent",            // 5
  "Field Agent",      // 6
  "Senior Agent",     // 7
  "Commander",        // 8
  "Elite",            // 9
  "Veteran",          // 10
  "Warden",           // 11
  "Sentinel",         // 12
  "Guardian",         // 13
  "Enforcer",         // 14
  "Champion",         // 15
  "Hero",             // 16
  "Legend",           // 17
  "Mythic",           // 18
  "Ascended",         // 19
  "Transcendent",     // 20
  "Void Walker",      // 21
  "Star Forger",      // 22
  "Nebula Lord",      // 23
  "Galactic",         // 24
  "Cosmic",           // 25
  "Eternal",          // 26
  "Infinite",         // 27
  "Omega",            // 28
  "Apex",             // 29
  "Supreme",          // 30
  "Astral King",      // 31
  "Dimension Lord",   // 32
  "Reality Bender",   // 33
  "Time Weaver",      // 34
  "Space Warden",     // 35
  "Multiverse",       // 36
  "Omniscient",       // 37
  "Celestial",        // 38
  "Divine",           // 39
  "Immortal",         // 40
  "Alien Overlord",   // 41
  "Void Emperor",     // 42
  "Cosmic Titan",     // 43
  "Nebula God",       // 44
  "Star Breaker",     // 45
  "Galaxy Devourer",  // 46
  "Universe Shaper",  // 47
  "Reality King",     // 48
  "Infinite One",     // 49
  "ALIEN MASTER",     // 50
];

export function getPlayerLevelTitle(level: number): string {
  if (level < 1) return LEVEL_TITLES[0];
  if (level > MAX_LEVEL) return LEVEL_TITLES[MAX_LEVEL - 1];
  return LEVEL_TITLES[level - 1];
}

function calculateLevelUpReward(level: number): number {
  let reward = 100; // Every level gets +100 AP
  if (level === 5) reward += 500;
  if (level === 10) reward += 1000;
  if (level === 25) reward += 5000;
  if (level === 50) reward += 25000;
  return reward;
}

const DEFAULT_LEVEL_DATA: PlayerLevelData = {
  level: 1,
  xp: 0,
  totalXpEarned: 0,
  lastUpdated: Date.now(),
};

export async function getPlayerLevel(wallet: string): Promise<PlayerLevelData> {
  const redis = getRedis();
  const key = getLevelKey(wallet);
  const data = await redis.get<PlayerLevelData>(key);
  if (data) return data;

  // New player - create at level 1
  const newData = { ...DEFAULT_LEVEL_DATA, lastUpdated: Date.now() };
  await redis.set(key, newData);
  return newData;
}

export async function addPlayerXP(
  wallet: string,
  xp: number,
  source: string
): Promise<AddXPResult> {
  if (xp <= 0) {
    const levelData = await getPlayerLevel(wallet);
    return { levelData, levelsGained: 0, apRewarded: 0, xpAdded: 0 };
  }

  const redis = getRedis();
  const key = getLevelKey(wallet);
  const levelData = await getPlayerLevel(wallet);

  const oldLevel = levelData.level;
  levelData.xp += xp;
  levelData.totalXpEarned += xp;

  // Check for level ups
  let totalApReward = 0;
  while (levelData.level < MAX_LEVEL) {
    const xpNeeded = getXPForLevel(levelData.level + 1);
    if (levelData.xp >= xpNeeded) {
      levelData.level++;
      totalApReward += calculateLevelUpReward(levelData.level);
    } else {
      break;
    }
  }

  levelData.lastUpdated = Date.now();
  await redis.set(key, levelData);

  // Award AP for level ups
  if (totalApReward > 0) {
    await addUserPoints(wallet, totalApReward);
  }

  return {
    levelData,
    levelsGained: levelData.level - oldLevel,
    apRewarded: totalApReward,
    xpAdded: xp,
  };
}
