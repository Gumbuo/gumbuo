import { kv } from "@vercel/kv";

// Types
export interface Referral {
  referrerWallet: string; // Who shared the link
  referredWallet: string; // Who signed up via the link
  timestamp: number;
  ipAddress?: string; // For fraud detection
  status: "pending" | "eligible"; // pending = hasn't reached 25k AP, eligible = has reached 25k AP
  eligibleAt?: number; // Timestamp when they became eligible
}

export interface ReferralReward {
  id: string;
  referrerWallet: string;
  amount: string; // ETH amount as string to avoid precision issues
  status: "pending" | "paid";
  createdAt: number;
  paidAt?: number;
  txHash?: string; // Transaction hash when paid
  note?: string; // Admin note
}

// Constants
const MIN_ALIEN_POINTS_FOR_ELIGIBILITY = 25000;

// Keys
const REFERRAL_KEY = (referrerWallet: string) => `referral:by:${referrerWallet.toLowerCase()}`;
const REFERRAL_DATA_KEY = (referredWallet: string) => `referral:data:${referredWallet.toLowerCase()}`;
const REFERRER_OF_KEY = (referredWallet: string) => `referral:referrer:${referredWallet.toLowerCase()}`;
const ALL_REFERRALS_KEY = "referral:all";
const REWARD_KEY = (id: string) => `referral:reward:${id}`;
const REWARDS_BY_WALLET_KEY = (wallet: string) => `referral:rewards:${wallet.toLowerCase()}`;
const PENDING_REWARDS_KEY = "referral:rewards:pending";

// Record a referral
export async function recordReferral(
  referrerWallet: string,
  referredWallet: string,
  ipAddress?: string
): Promise<boolean> {
  const referrer = referrerWallet.toLowerCase();
  const referred = referredWallet.toLowerCase();

  // Can't refer yourself
  if (referrer === referred) {
    return false;
  }

  // Check if already has a referrer
  const existingReferrer = await kv.get(REFERRER_OF_KEY(referred));
  if (existingReferrer) {
    return false; // Already referred by someone
  }

  const referral: Referral = {
    referrerWallet: referrer,
    referredWallet: referred,
    timestamp: Date.now(),
    ipAddress,
    status: "pending", // Starts as pending until they reach 25k AP
  };

  // Store referral relationship
  await kv.set(REFERRER_OF_KEY(referred), referrer);
  await kv.set(REFERRAL_DATA_KEY(referred), referral); // Store full referral data
  await kv.sadd(REFERRAL_KEY(referrer), referred);
  await kv.lpush(ALL_REFERRALS_KEY, JSON.stringify(referral));

  return true;
}

// Get referrals by a wallet
export async function getReferrals(referrerWallet: string): Promise<string[]> {
  const referrer = referrerWallet.toLowerCase();
  return (await kv.smembers(REFERRAL_KEY(referrer))) as string[];
}

// Get referral count (only eligible referrals)
export async function getReferralCount(referrerWallet: string): Promise<number> {
  const referrer = referrerWallet.toLowerCase();
  const referredWallets = (await kv.smembers(REFERRAL_KEY(referrer))) as string[];

  // Count only eligible referrals
  let eligibleCount = 0;
  for (const wallet of referredWallets) {
    const referralData = await kv.get<Referral>(REFERRAL_DATA_KEY(wallet));
    if (referralData && referralData.status === "eligible") {
      eligibleCount++;
    }
  }

  return eligibleCount;
}

// Check and update referral eligibility when user reaches 25k AP
export async function checkAndUpdateReferralEligibility(
  walletAddress: string,
  alienPoints: number
): Promise<boolean> {
  const wallet = walletAddress.toLowerCase();

  // Get referral data for this wallet
  const referralData = await kv.get<Referral>(REFERRAL_DATA_KEY(wallet));

  // If not referred or already eligible, return
  if (!referralData || referralData.status === "eligible") {
    return false;
  }

  // Check if they've reached the minimum
  if (alienPoints >= MIN_ALIEN_POINTS_FOR_ELIGIBILITY) {
    referralData.status = "eligible";
    referralData.eligibleAt = Date.now();

    // Update the referral data
    await kv.set(REFERRAL_DATA_KEY(wallet), referralData);

    return true; // Became eligible
  }

  return false;
}

// Get who referred a wallet
export async function getReferrer(referredWallet: string): Promise<string | null> {
  const referred = referredWallet.toLowerCase();
  return await kv.get(REFERRER_OF_KEY(referred));
}

// Get all referrals (admin)
export async function getAllReferrals(limit: number = 100): Promise<Referral[]> {
  const data = await kv.lrange(ALL_REFERRALS_KEY, 0, limit - 1);
  return data.map((item) => JSON.parse(item as string)) as Referral[];
}

// Create a reward (admin only)
export async function createReward(
  referrerWallet: string,
  amount: string,
  note?: string
): Promise<ReferralReward> {
  const referrer = referrerWallet.toLowerCase();
  const id = `reward-${referrer}-${Date.now()}`;

  const reward: ReferralReward = {
    id,
    referrerWallet: referrer,
    amount,
    status: "pending",
    createdAt: Date.now(),
    note,
  };

  await kv.set(REWARD_KEY(id), reward);
  await kv.sadd(REWARDS_BY_WALLET_KEY(referrer), id);
  await kv.sadd(PENDING_REWARDS_KEY, id);

  return reward;
}

// Mark reward as paid (admin only)
export async function markRewardPaid(
  rewardId: string,
  txHash: string
): Promise<boolean> {
  const reward = await kv.get<ReferralReward>(REWARD_KEY(rewardId));

  if (!reward) {
    return false;
  }

  reward.status = "paid";
  reward.paidAt = Date.now();
  reward.txHash = txHash;

  await kv.set(REWARD_KEY(rewardId), reward);
  await kv.srem(PENDING_REWARDS_KEY, rewardId);

  return true;
}

// Get rewards for a wallet
export async function getRewardsByWallet(
  walletAddress: string
): Promise<ReferralReward[]> {
  const wallet = walletAddress.toLowerCase();
  const rewardIds = (await kv.smembers(REWARDS_BY_WALLET_KEY(wallet))) as string[];

  const rewards: ReferralReward[] = [];
  for (const id of rewardIds) {
    const reward = await kv.get<ReferralReward>(REWARD_KEY(id));
    if (reward) {
      rewards.push(reward);
    }
  }

  return rewards.sort((a, b) => b.createdAt - a.createdAt);
}

// Get pending rewards total
export async function getPendingRewardsTotal(walletAddress: string): Promise<string> {
  const wallet = walletAddress.toLowerCase();
  const rewards = await getRewardsByWallet(wallet);

  const pendingTotal = rewards
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + parseFloat(r.amount), 0);

  return pendingTotal.toFixed(4);
}

// Get all pending rewards (admin)
export async function getAllPendingRewards(): Promise<ReferralReward[]> {
  const rewardIds = (await kv.smembers(PENDING_REWARDS_KEY)) as string[];

  const rewards: ReferralReward[] = [];
  for (const id of rewardIds) {
    const reward = await kv.get<ReferralReward>(REWARD_KEY(id));
    if (reward && reward.status === "pending") {
      rewards.push(reward);
    }
  }

  return rewards.sort((a, b) => b.createdAt - a.createdAt);
}

// Get detailed referrals (with status)
export async function getDetailedReferrals(referrerWallet: string) {
  const referrer = referrerWallet.toLowerCase();
  const referredWallets = (await kv.smembers(REFERRAL_KEY(referrer))) as string[];

  const detailedReferrals = [];
  for (const wallet of referredWallets) {
    const referralData = await kv.get<Referral>(REFERRAL_DATA_KEY(wallet));
    if (referralData) {
      detailedReferrals.push(referralData);
    }
  }

  return detailedReferrals.sort((a, b) => b.timestamp - a.timestamp);
}

// Get referral stats for a wallet
export async function getReferralStats(walletAddress: string) {
  const wallet = walletAddress.toLowerCase();

  const [referralCount, rewards, detailedReferrals] = await Promise.all([
    getReferralCount(wallet),
    getRewardsByWallet(wallet),
    getDetailedReferrals(wallet),
  ]);

  const pendingRewards = rewards.filter((r) => r.status === "pending");
  const paidRewards = rewards.filter((r) => r.status === "paid");

  const pendingTotal = pendingRewards.reduce(
    (sum, r) => sum + parseFloat(r.amount),
    0
  );
  const paidTotal = paidRewards.reduce((sum, r) => sum + parseFloat(r.amount), 0);

  // Separate eligible and pending referrals
  const eligibleReferrals = detailedReferrals.filter(r => r.status === "eligible");
  const pendingReferrals = detailedReferrals.filter(r => r.status === "pending");

  return {
    totalReferrals: referralCount, // Only counts eligible
    eligibleReferrals,
    pendingReferrals,
    pendingRewards: pendingTotal.toFixed(4),
    paidRewards: paidTotal.toFixed(4),
    recentRewards: rewards.slice(0, 10), // Last 10 rewards
  };
}
