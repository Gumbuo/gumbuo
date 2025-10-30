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

  // Load leaderboard on mount and clear old localStorage
  useEffect(() => {
    // Clear old localStorage data (migration)
    if (localStorage.getItem('alienLeaderboard')) {
      console.log('Clearing old localStorage leaderboard data...');
      localStorage.removeItem('alienLeaderboard');
    }

    fetchLeaderboard();
  }, []);

  // Check if user is registered and update their points
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
      <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-black/40 backdrop-blur-sm rounded-3xl max-w-4xl w-full min-h-96">
        <div className="text-purple-400 text-xl">Loading Leaderboard...</div>
        <div className="text-purple-400 text-base">Fetching galactic data 🛸</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-8 bg-black/40 backdrop-blur-sm max-w-6xl rounded-3xl border border-purple-400/30">
      <h2 className="font-alien font-bold holographic-text tracking-wider text-center" style={{fontSize: '4rem'}}>
        <span className="text-purple-400">👽 Free GMB Airdrop 🛸</span>
      </h2>

      {/* Progress Bar */}
      <div className="w-full bg-black/60 rounded-xl p-4">
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
        <div className="w-full bg-black/60 rounded-xl p-4">
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
          className={`px-12 py-4 text-xl font-bold tracking-wider transition-all duration-200 rounded-xl ${
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
      <div className="w-full bg-black/60 rounded-xl overflow-hidden">
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
          <div className="w-full bg-black/60 rounded-xl p-6 text-center animate-pulse">
            <p className="text-yellow-400 text-3xl font-bold">🎉 GOAL REACHED! 🎉</p>
            <p className="text-yellow-400 text-lg mt-2">All 50 spots filled! Check your rewards below! 👽</p>
          </div>

          {/* Rewards Section */}
          <div className="w-full bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-6 border-2 border-yellow-400/50">
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
      <div className="w-full text-purple-400 text-xs text-center max-w-2xl bg-black/60 p-4 rounded-xl">
        <p className="font-bold mb-2">ℹ️ Leaderboard Info</p>
        <p className="opacity-75">
          The first 50 wallets to register will receive an exclusive GMB token airdrop!
          Your Alien Points are tracked and displayed on the leaderboard.
          More features and rewards coming soon! 🚀
        </p>
      </div>
    </div>
  );
}
