"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAlienPoints } from "../context/AlienPointsEconomy";
import { useCosmicSound } from "../hooks/useCosmicSound";

interface LeaderboardEntry {
  wallet: string;
  joinedAt: number;
  alienPoints: number;
  rank: number;
}

interface GameStats {
  aliensPurchased?: number;
  apSpentOnAliens?: number;
  arenaBattlesFought?: number;
  arenaBattlesWon?: number;
  arenaBattlesLost?: number;
  bossAttacksTotal?: number;
  bossAPSpent?: number;
  bossDamageDealt?: number;
  normalAttacksUsed?: number;
  powerAttacksUsed?: number;
  ultimateAttacksUsed?: number;
}

interface APLeaderboardEntry {
  wallet: string;
  alienPoints: number;
  lastUpdated: number;
  rank: number;
  gmbHoldings?: {
    base: number;
    abstract: number;
    total: number;
  };
  stakedAmount?: number;
  totalStakingClaims?: number;
  totalFaucetClaims?: number;
  gameStats?: GameStats;
}

const MAX_FIRST_TIMERS = 50;

export default function AlienLeaderboard() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { getUserBalance } = useAlienPoints();
  const { playSound } = useCosmicSound();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState(MAX_FIRST_TIMERS);
  const [isLoading, setIsLoading] = useState(true);
  const [isOGExpanded, setIsOGExpanded] = useState(false); // Collapsed by default

  // New AP Leaderboard state
  const [apLeaderboard, setAPLeaderboard] = useState<APLeaderboardEntry[]>([]);
  const [apUserRank, setAPUserRank] = useState<number | null>(null);
  const [apIsLoading, setAPIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [expandedWallet, setExpandedWallet] = useState<string | null>(null);

  // Fetch leaderboard from API
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
        setSpotsRemaining(data.spotsRemaining);
      } else {
        console.error("API returned error:", data.error);
        // Start with empty leaderboard if API fails
        setLeaderboard([]);
        setSpotsRemaining(MAX_FIRST_TIMERS);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      // Start with empty leaderboard if fetch fails
      setLeaderboard([]);
      setSpotsRemaining(MAX_FIRST_TIMERS);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch AP Leaderboard from API with detailed stats
  const fetchAPLeaderboard = async () => {
    try {
      const response = await fetch('/api/ap-leaderboard?includeDetails=true');
      const data = await response.json();

      if (data.success) {
        setAPLeaderboard(data.leaderboard);
        setTotalUsers(data.totalUsers);
      } else {
        console.error("API returned error:", data.error);
        setAPLeaderboard([]);
        setTotalUsers(0);
      }
    } catch (error) {
      console.error("Error fetching AP leaderboard:", error);
      setAPLeaderboard([]);
      setTotalUsers(0);
    } finally {
      setAPIsLoading(false);
    }
  };

  // Update user's AP on the leaderboard
  const updateUserAP = async (wallet: string, alienPoints: number) => {
    try {
      const response = await fetch('/api/ap-leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, alienPoints }),
      });

      const data = await response.json();

      if (data.success) {
        setAPUserRank(data.entry.rank);
        // Refresh leaderboard after update
        fetchAPLeaderboard();
      }
    } catch (error) {
      console.error("Error updating AP leaderboard:", error);
    }
  };

  // Load leaderboard on mount and clear old localStorage
  useEffect(() => {
    // Clear old localStorage data (migration)
    if (localStorage.getItem('alienLeaderboard')) {
      console.log('Clearing old localStorage leaderboard data...');
      localStorage.removeItem('alienLeaderboard');
    }

    fetchLeaderboard();
    fetchAPLeaderboard();
  }, []);

  // Check if user is registered and update their points (OG Leaderboard)
  useEffect(() => {
    if (!address) return;

    const userEntry = leaderboard.find(entry => entry.wallet.toLowerCase() === address.toLowerCase());

    if (userEntry) {
      setIsRegistered(true);
      setUserRank(userEntry.rank);

      // Update user's alien points in the backend
      const currentPoints = getUserBalance(address);
      if (currentPoints !== userEntry.alienPoints) {
        updateUserPoints(address, currentPoints);
      }
    } else {
      setIsRegistered(false);
      setUserRank(null);
    }
  }, [address, leaderboard.length, getUserBalance]);

  // Auto-update user's AP in the new leaderboard
  useEffect(() => {
    if (!address || apIsLoading) return;

    const currentPoints = getUserBalance(address);

    // Update user's AP on the leaderboard
    updateUserAP(address, currentPoints);

    // Also check user's rank from current leaderboard
    const userEntry = apLeaderboard.find(entry => entry.wallet.toLowerCase() === address.toLowerCase());
    if (userEntry) {
      setAPUserRank(userEntry.rank);
    }
  }, [address, getUserBalance, apIsLoading]);

  const updateUserPoints = async (wallet: string, points: number) => {
    try {
      await fetch('/api/leaderboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, alienPoints: points }),
      });
      // Refresh leaderboard after update
      fetchLeaderboard();
    } catch (error) {
      console.error("Error updating points:", error);
    }
  };

  const handleRegister = async () => {
    if (!isConnected || !address) {
      playSound('click');
      openConnectModal?.();
      return;
    }

    // Check if already registered
    const alreadyRegistered = leaderboard.some(
      entry => entry.wallet.toLowerCase() === address.toLowerCase()
    );

    if (alreadyRegistered) {
      playSound('error');
      alert("You're already registered! 👽");
      return;
    }

    // Check if spots are full
    if (leaderboard.length >= MAX_FIRST_TIMERS) {
      playSound('error');
      alert("Sorry! All 50 spots have been claimed! 😢");
      return;
    }

    playSound('click');

    try {
      // Register via API
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: address,
          alienPoints: getUserBalance(address),
        }),
      });

      const data = await response.json();

      if (data.success) {
        playSound('success');
        setIsRegistered(true);
        setUserRank(data.entry.rank);
        setSpotsRemaining(data.spotsRemaining);

        alert(`🎉 Congratulations! You're #${data.entry.rank} on the First Timer Leaderboard! You'll receive a GMB airdrop when we hit 50 members! 👽`);

        // Refresh leaderboard
        fetchLeaderboard();
      } else {
        playSound('error');
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      playSound('error');
      console.error("Error registering:", error);
      alert("Failed to register. Please try again.");
    }
  };

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getProgressPercentage = () => {
    return (leaderboard.length / MAX_FIRST_TIMERS) * 100;
  };

  if (isLoading) {
    return (
      <div style={{
        borderRadius: '8px'
      }} className="flex flex-col items-center justify-center space-y-4 p-8 bg-black/40 backdrop-blur-sm max-w-4xl w-full min-h-96 holographic-panel">
        <div className="text-purple-400 text-xl">Loading Leaderboard...</div>
        <div className="text-purple-400 text-base">Fetching galactic data 🛸</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 max-w-6xl w-full">
      {/* First 50 OGs - Collapsible Memorial Section */}
      <div style={{
        borderRadius: '8px'
      }} className="w-full bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-sm holographic-panel">
        <button
          onClick={() => {
            setIsOGExpanded(!isOGExpanded);
            playSound('click');
          }}
          className="w-full p-4 flex items-center justify-between hover:bg-yellow-400/10 transition-all"
        >
          <h3 className="font-alien font-bold text-yellow-400 tracking-wider flex items-center gap-3" style={{fontSize: '2rem'}}>
            <span>👑</span>
            <span>First 50 OGs - LEGENDARY STATUS</span>
            <span>👑</span>
          </h3>
          <span className="text-yellow-400 text-3xl transition-transform" style={{
            transform: isOGExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </button>

        {isOGExpanded && (
          <div className="p-6 space-y-6">
            <p className="text-center text-yellow-300 text-lg">
              🏆 The legendary first 50 wallets - Forever remembered in Gumbuo history! 🏆
            </p>

      {/* Progress Bar */}
      <div style={{
        borderRadius: '8px'
      }} className="w-full bg-black/60 p-4 holographic-panel">
        <div className="flex justify-between items-center mb-2">
          <p className="text-purple-400 text-lg">
            📊 Progress: <span className="font-bold text-xl">{leaderboard.length}</span> / {MAX_FIRST_TIMERS}
          </p>
          <p className={`text-lg font-bold ${spotsRemaining <= 10 ? 'text-red-400' : 'text-pink-400'}`}>
            {spotsRemaining} spots left!
          </p>
        </div>
        <div className="w-full bg-gray-900 rounded-full h-6">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-400 h-full rounded-full transition-all duration-500"
            style={{width: `${getProgressPercentage()}%`}}
          ></div>
        </div>
      </div>

      {/* User Status - Only show if registered */}
      {isConnected && address && isRegistered && (
        <div style={{
          borderRadius: '8px'
        }} className="w-full bg-black/60 p-4 holographic-panel">
          <div className="text-center">
            <p className="text-purple-400 text-lg font-bold">✅ You're Registered!</p>
            <p className="text-purple-400 text-base mt-1">Your Rank: <span className="text-2xl font-bold">#{userRank}</span></p>
            <p className="text-purple-400 text-sm mt-2">You'll receive a GMB airdrop when we reach 50 members! 🎉</p>
          </div>
        </div>
      )}

      {/* Register Button */}
      {!isRegistered && (
        <button
          onClick={handleRegister}
          onMouseEnter={() => leaderboard.length < MAX_FIRST_TIMERS && playSound('hover')}
          disabled={leaderboard.length >= MAX_FIRST_TIMERS}
          style={{
            borderRadius: '8px'
          }}
          className={`px-12 py-4 text-xl font-bold tracking-wider transition-all duration-200 holographic-panel ${
            leaderboard.length >= MAX_FIRST_TIMERS
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
        >
          {!isConnected
            ? "Connect Wallet to Register"
            : leaderboard.length >= MAX_FIRST_TIMERS
            ? "All Spots Claimed! 😢"
            : "REGISTER NOW! 🚀"}
        </button>
      )}

      {/* Leaderboard Table */}
      <div style={{
        borderRadius: '8px'
      }} className="w-full bg-black/60 overflow-hidden holographic-panel">
        <div className="bg-purple-400 bg-opacity-20 p-3 grid grid-cols-5 gap-2 font-bold text-purple-400">
          <div className="text-center">Rank</div>
          <div className="text-center">Wallet</div>
          <div className="text-center">AP</div>
          <div className="text-center">Reward</div>
          <div className="text-center">Joined</div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-purple-400 opacity-50">
              <p className="text-xl">👽 No one registered yet! Be the first! 👽</p>
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <div
                key={entry.wallet}
                className={`grid grid-cols-5 gap-2 p-3 transition-colors ${
                  address && entry.wallet.toLowerCase() === address.toLowerCase()
                    ? 'bg-purple-400 bg-opacity-30'
                    : 'hover:bg-purple-400 hover:bg-opacity-10'
                } ${
                  index < 3 ? 'text-yellow-400 font-bold' : 'text-purple-400'
                }`}
              >
                <div className="text-center flex items-center justify-center">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${entry.rank}`}
                </div>
                <div className="text-center font-mono text-xs flex items-center justify-center">
                  {formatWallet(entry.wallet)}
                </div>
                <div className="text-center flex items-center justify-center text-sm">
                  {entry.alienPoints.toLocaleString()}
                </div>
                <div className="text-center flex items-center justify-center">
                  <div className="text-xs leading-tight">
                    <div className="text-yellow-400 font-bold">2M GMB</div>
                    <div className="text-[10px] text-green-400">1M⛓️ + 1M⚡</div>
                  </div>
                </div>
                <div className="text-center text-[10px] flex items-center justify-center opacity-75">
                  {formatDate(entry.joinedAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Goal Reached Banner with Rewards */}
      {leaderboard.length >= MAX_FIRST_TIMERS && (
        <div className="w-full space-y-4">
          <div style={{
            borderRadius: '8px'
          }} className="w-full bg-black/60 p-6 text-center animate-pulse holographic-panel">
            <p className="text-yellow-400 text-3xl font-bold">🎉 GOAL REACHED! 🎉</p>
            <p className="text-yellow-400 text-lg mt-2">All 50 spots filled! Check your rewards below! 👽</p>
          </div>

          {/* Rewards Section */}
          <div style={{
            borderRadius: '8px'
          }} className="w-full bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-6 holographic-panel">
            <h3 className="text-yellow-400 text-3xl font-bold text-center mb-2">🎁 LEGENDARY AIRDROP REWARDS 🎁</h3>
            <p className="text-center text-purple-300 text-lg mb-6">Each wallet receives LEGENDARY rank status! 👑</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Base Chain Reward */}
              <div className="bg-black/60 rounded-xl p-4 border-2 border-blue-400/50 hover:border-blue-400 transition-all">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl">⛓️</span>
                  <h4 className="text-blue-300 text-xl font-bold">BASE CHAIN</h4>
                </div>
                <p className="text-center text-yellow-400 text-3xl font-bold">1,000,000 GMB</p>
                <p className="text-center text-blue-300 text-base mt-1 font-bold">per wallet</p>
                <p className="text-center text-blue-400 text-sm mt-2">50,000,000 GMB total pool</p>
              </div>

              {/* Abstract Chain Reward */}
              <div className="bg-black/60 rounded-xl p-4 border-2 border-purple-400/50 hover:border-purple-400 transition-all">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl">⚡</span>
                  <h4 className="text-purple-300 text-xl font-bold">ABSTRACT CHAIN</h4>
                </div>
                <p className="text-center text-yellow-400 text-3xl font-bold">1,000,000 GMB</p>
                <p className="text-center text-purple-300 text-base mt-1 font-bold">per wallet</p>
                <p className="text-center text-purple-400 text-sm mt-2">50,000,000 GMB total pool</p>
              </div>
            </div>

            {/* Total Reward Per Wallet */}
            <div className="bg-gradient-to-r from-yellow-900/60 to-orange-600/60 rounded-xl p-6 border-4 border-yellow-400 animate-pulse">
              <p className="text-center text-yellow-300 text-xl font-bold mb-2">YOUR TOTAL REWARD</p>
              <p className="text-center text-yellow-200 text-5xl font-bold mb-2">2,000,000 GMB</p>
              <p className="text-center text-yellow-400 text-lg font-bold">(1M Base + 1M Abstract)</p>
              <div className="mt-4 bg-yellow-400/20 rounded-lg p-3">
                <p className="text-center text-yellow-300 text-xl font-bold">👑 LEGENDARY RANK UNLOCKED 👑</p>
                <p className="text-center text-yellow-400 text-sm mt-1">Maximum faucet benefits on both chains!</p>
              </div>
            </div>

            {/* Grand Total */}
            <div className="mt-4 bg-black/60 rounded-xl p-4 border border-green-400/30">
              <p className="text-center text-green-400 text-lg font-bold mb-1">TOTAL AIRDROP DISTRIBUTION</p>
              <p className="text-center text-green-300 text-3xl font-bold">100,000,000 GMB</p>
              <p className="text-center text-green-400 text-sm mt-1">(50M Base + 50M Abstract across 50 wallets)</p>
            </div>

            {/* Distribution Info */}
            <div className="mt-4 text-center">
              <p className="text-green-400 text-sm font-bold">✅ All 50 wallet addresses secured for distribution</p>
              <p className="text-purple-300 text-xs mt-2">Each wallet will receive 2M GMB total: 1M on Base + 1M on Abstract</p>
            </div>
          </div>
        </div>
      )}

            {/* Info Section */}
            <div style={{
              borderRadius: '8px'
            }} className="w-full text-yellow-400 text-xs text-center max-w-2xl bg-black/60 p-4 holographic-panel">
              <p className="font-bold mb-2">ℹ️ OG Leaderboard Info</p>
              <p className="opacity-75">
                The first 50 wallets to register received an exclusive GMB token airdrop!
                These legendary members are forever remembered in Gumbuo history! 👑
              </p>
            </div>
          </div>
        )}
      </div>

      {/* NEW MAIN LEADERBOARD */}
      <div style={{
        borderRadius: '8px'
      }} className="w-full flex flex-col items-center space-y-6 p-8 bg-black/40 backdrop-blur-sm holographic-panel">
        <h2 className="font-alien font-bold holographic-text tracking-wider text-center" style={{fontSize: '4rem'}}>
          <span className="text-purple-400">🏆 Alien Points Leaderboard 🏆</span>
        </h2>

        <p className="text-center text-purple-300 text-xl max-w-2xl">
          Compete for the top spot! Earn Alien Points through staking, faucet claims, and future challenges!
        </p>

        {apIsLoading ? (
          <div className="w-full bg-purple-900/40 p-8 text-center">
            <p className="text-purple-400 text-2xl font-bold animate-pulse">Loading Live Rankings... 👽</p>
          </div>
        ) : (
          <>
            {/* User Rank Display */}
            {isConnected && address && apUserRank && (
              <div style={{
                borderRadius: '8px'
              }} className="w-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 p-6 text-center holographic-panel">
                <p className="text-purple-300 text-lg font-bold mb-2">Your Current Rank</p>
                <p className="text-6xl font-bold holographic-text mb-2">#{apUserRank}</p>
                <p className="text-purple-400 text-sm">out of {totalUsers} users</p>
                <p className="text-purple-300 text-base mt-2">
                  {getUserBalance(address).toLocaleString()} AP
                </p>
              </div>
            )}

            {/* Stats */}
            <div style={{
              borderRadius: '8px'
            }} className="w-full bg-black/60 p-4 holographic-panel">
              <div className="flex justify-between items-center">
                <p className="text-purple-400 text-lg">
                  📊 Total Users: <span className="font-bold text-xl">{totalUsers}</span>
                </p>
                <p className="text-purple-400 text-sm">
                  🔄 Updates automatically
                </p>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div style={{
              borderRadius: '8px'
            }} className="w-full bg-black/60 overflow-hidden holographic-panel">
              <div className="bg-purple-400 bg-opacity-20 p-3 grid grid-cols-4 gap-4 font-bold text-purple-400">
                <div className="text-center">Rank</div>
                <div className="text-center">Wallet</div>
                <div className="text-center">Alien Points</div>
                <div className="text-center">Details</div>
              </div>

              <div>
                {apLeaderboard.length === 0 ? (
                  <div className="p-12 text-center text-purple-400 opacity-50">
                    <p className="text-2xl mb-4">👽 No users yet! 👽</p>
                    <p className="text-base">Connect your wallet and earn Alien Points to be first!</p>
                  </div>
                ) : (
                  apLeaderboard.slice(0, 100).map((entry, index) => {
                    const isExpanded = expandedWallet === entry.wallet;
                    return (
                      <div key={entry.wallet}>
                        <div
                          onClick={() => {
                            setExpandedWallet(isExpanded ? null : entry.wallet);
                            playSound('click');
                          }}
                          className={`transition-all duration-200 cursor-pointer ${
                            address && entry.wallet.toLowerCase() === address.toLowerCase()
                              ? 'bg-purple-400 bg-opacity-30 border-l-4 border-purple-400'
                              : 'hover:bg-purple-400 hover:bg-opacity-10'
                          } ${
                            index < 3 ? 'text-yellow-400 font-bold' : 'text-purple-400'
                          }`}
                        >
                          <div className="grid grid-cols-4 gap-4 p-4">
                            <div className="text-center flex items-center justify-center text-xl">
                              {index === 0 && '🥇'}
                              {index === 1 && '🥈'}
                              {index === 2 && '🥉'}
                              {index > 2 && `#${entry.rank}`}
                            </div>
                            <div className="text-center font-mono text-sm flex items-center justify-center gap-2">
                              {formatWallet(entry.wallet)}
                              {address && entry.wallet.toLowerCase() === address.toLowerCase() && (
                                <span className="text-xs bg-purple-500 px-2 py-1 rounded">YOU</span>
                              )}
                            </div>
                            <div className="text-center flex items-center justify-center font-bold text-lg">
                              {entry.alienPoints.toLocaleString()}
                            </div>

                            {/* View Details Button as Grid Column */}
                            <div className="text-center flex items-center justify-center">
                              <button
                                style={{
                                  background: isExpanded
                                    ? 'linear-gradient(135deg, #0099ff, #0077cc)'
                                    : 'linear-gradient(135deg, #0077cc, #005599)',
                                  color: isExpanded ? '#fff' : '#00ffff',
                                  textShadow: '0 0 10px rgba(0, 153, 255, 0.8), 0 0 20px rgba(0, 153, 255, 0.5)',
                                  border: '2px solid #0099ff',
                                  borderRadius: '6px',
                                  padding: '8px 12px',
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold',
                                  boxShadow: isExpanded
                                    ? '0 0 20px rgba(0, 153, 255, 0.8), inset 0 2px 5px rgba(255, 255, 255, 0.5)'
                                    : '0 4px 10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                                  transition: 'all 0.3s ease',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {isExpanded ? '📊 Hide' : '📊 Stats'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="bg-black/80 p-6 border-t border-purple-400/30">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* GMB Holdings */}
                              <div className="bg-purple-900/40 rounded-lg p-4 border border-purple-400/30">
                                <p className="text-purple-400 font-bold mb-3 text-center">💎 GMB Holdings</p>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-blue-400">⛓️ Base:</span>
                                    <span className="text-purple-300 font-mono">{(entry.gmbHoldings?.base || 0).toLocaleString()} GMB</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-purple-400">⚡ Abstract:</span>
                                    <span className="text-purple-300 font-mono">{(entry.gmbHoldings?.abstract || 0).toLocaleString()} GMB</span>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t border-purple-400/30">
                                    <span className="text-yellow-400 font-bold">TOTAL:</span>
                                    <span className="text-yellow-400 font-bold font-mono">{(entry.gmbHoldings?.total || 0).toLocaleString()} GMB</span>
                                  </div>
                                </div>
                              </div>

                              {/* Staking & Claims */}
                              <div className="bg-purple-900/40 rounded-lg p-4 border border-purple-400/30">
                                <p className="text-purple-400 font-bold mb-3 text-center">📊 Earnings</p>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-purple-400">🔒 Staked:</span>
                                    <span className="text-purple-300 font-mono">{(entry.stakedAmount || 0).toLocaleString()} GMB</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-green-400">💰 Staking Claims:</span>
                                    <span className="text-green-300 font-mono">{(entry.totalStakingClaims || 0).toLocaleString()} AP</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-cyan-400">💧 Faucet Claims:</span>
                                    <span className="text-cyan-300 font-mono">{(entry.totalFaucetClaims || 0).toLocaleString()} AP</span>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t border-purple-400/30">
                                    <span className="text-yellow-400 font-bold">Total Earned:</span>
                                    <span className="text-yellow-400 font-bold font-mono">
                                      {((entry.totalStakingClaims || 0) + (entry.totalFaucetClaims || 0)).toLocaleString()} AP
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Game Stats */}
                              <div className="bg-purple-900/40 rounded-lg p-4 border border-purple-400/30">
                                <p className="text-purple-400 font-bold mb-3 text-center">🎮 Game Stats</p>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-orange-400">👽 Aliens Bought:</span>
                                    <span className="text-orange-300 font-mono">{entry.gameStats?.aliensPurchased || 0}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-red-400">⚔️ Arena Fights:</span>
                                    <span className="text-red-300 font-mono">{entry.gameStats?.arenaBattlesFought || 0} ({entry.gameStats?.arenaBattlesWon || 0}W/{entry.gameStats?.arenaBattlesLost || 0}L)</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-purple-400">💀 Boss Attacks:</span>
                                    <span className="text-purple-300 font-mono">{entry.gameStats?.bossAttacksTotal || 0}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-yellow-400">💥 Boss Damage:</span>
                                    <span className="text-yellow-300 font-mono">{(entry.gameStats?.bossDamageDealt || 0).toLocaleString()} HP</span>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t border-purple-400/30">
                                    <span className="text-cyan-400 font-bold">Total AP Spent:</span>
                                    <span className="text-cyan-300 font-bold font-mono">
                                      {((entry.gameStats?.apSpentOnAliens || 0) + (entry.gameStats?.bossAPSpent || 0)).toLocaleString()} AP
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Info */}
            {!isConnected && (
              <div style={{
                borderRadius: '8px'
              }} className="w-full bg-purple-900/40 p-6 text-center holographic-panel">
                <p className="text-purple-400 text-lg font-bold mb-2">👋 Connect Your Wallet</p>
                <p className="text-purple-300 text-base">
                  Connect your wallet to see your rank and compete on the leaderboard!
                </p>
              </div>
            )}

            {/* How to earn points */}
            <div style={{
              borderRadius: '8px'
            }} className="w-full bg-black/60 p-6 text-center holographic-panel">
              <p className="text-purple-400 text-xl font-bold mb-4">💎 How to Earn Alien Points</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                <div className="bg-purple-900/40 rounded-lg p-4 border border-purple-400/30">
                  <p className="text-purple-400 font-bold mb-2">🔒 Staking</p>
                  <p className="text-purple-300 text-sm">Stake GMB to earn up to 10,000 AP/day</p>
                </div>
                <div className="bg-purple-900/40 rounded-lg p-4 border border-purple-400/30">
                  <p className="text-purple-400 font-bold mb-2">💧 Faucet Claims</p>
                  <p className="text-purple-300 text-sm">Claim daily rewards based on your GMB holdings</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
