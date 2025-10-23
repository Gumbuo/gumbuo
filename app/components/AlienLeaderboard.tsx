"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useAlienPoints } from "../context/AlienPointsEconomy";

interface LeaderboardEntry {
  wallet: string;
  joinedAt: number;
  alienPoints: number;
  rank: number;
}

const MAX_FIRST_TIMERS = 50;

export default function AlienLeaderboard() {
  const { address, isConnected } = useAccount();
  const { getUserBalance } = useAlienPoints();
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
      alert("Please connect your wallet first!");
      return;
    }

    // Check if already registered
    const alreadyRegistered = leaderboard.some(
      entry => entry.wallet.toLowerCase() === address.toLowerCase()
    );

    if (alreadyRegistered) {
      alert("You're already registered! 👽");
      return;
    }

    // Check if spots are full
    if (leaderboard.length >= MAX_FIRST_TIMERS) {
      alert("Sorry! All 50 spots have been claimed! 😢");
      return;
    }

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
        setIsRegistered(true);
        setUserRank(data.entry.rank);
        setSpotsRemaining(data.spotsRemaining);

        alert(`🎉 Congratulations! You're #${data.entry.rank} on the First Timer Leaderboard! You'll receive a GMB airdrop when we hit 50 members! 👽`);

        // Refresh leaderboard
        fetchLeaderboard();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
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
      <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-black bg-opacity-80 border-2 border-green-400 rounded-xl max-w-4xl w-full min-h-96">
        <div className="text-green-400 text-2xl animate-pulse">Loading Leaderboard...</div>
        <div className="text-green-400 text-lg">Fetching galactic data 🛸</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-8 bg-gradient-to-br from-black via-gray-900 to-black bg-opacity-95 border-2 border-green-400 rounded-xl max-w-4xl w-full relative overflow-hidden shadow-2xl shadow-green-400/50">
      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 animate-pulse"></div>

      {/* Scan line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/5 to-transparent animate-scan pointer-events-none"></div>

      <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-green-300 to-green-400 bg-clip-text text-transparent tracking-wider flex items-center space-x-3 drop-shadow-lg relative z-10">
        <img src="/nyx.png" alt="Nyx" className="w-12 h-12 rounded-full border-2 border-green-400 shadow-lg shadow-green-400/50 animate-float" />
        <span className="animate-glow">First Timer Leaderboard</span>
        <img src="/zorb.png" alt="Zorb" className="w-12 h-12 rounded-full border-2 border-green-400 shadow-lg shadow-green-400/50 animate-float-delayed" />
      </h2>

      <div className="text-center text-green-400">
        <p className="text-xl mb-2">🎁 First 50 Wallets Get GMB Airdrop! 🎁</p>
        <p className="text-sm opacity-75">Register now to secure your spot for the exclusive airdrop!</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gradient-to-r from-green-400/10 via-green-400/20 to-green-400/10 border-2 border-green-400/50 rounded-lg p-4 relative overflow-hidden shadow-lg shadow-green-400/30 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent animate-shimmer pointer-events-none"></div>
        <div className="flex justify-between items-center mb-2 relative z-10">
          <p className="text-green-400 text-lg drop-shadow-glow">
            📊 Progress: <span className="font-bold text-xl">{leaderboard.length}</span> / {MAX_FIRST_TIMERS}
          </p>
          <p className={`text-lg font-bold ${spotsRemaining <= 10 ? 'text-red-400 animate-pulse drop-shadow-lg' : 'text-yellow-400 drop-shadow-glow'}`}>
            {spotsRemaining} spots left!
          </p>
        </div>
        <div className="w-full bg-gray-900 rounded-full h-6 border-2 border-gray-700 shadow-inner relative overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 via-green-400 to-green-500 h-full rounded-full transition-all duration-500 shadow-lg shadow-green-400/50 relative overflow-hidden"
            style={{width: `${getProgressPercentage()}%`}}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* User Status */}
      {isConnected && address && (
        <div className={`w-full border rounded-lg p-4 ${
          isRegistered
            ? 'bg-green-400 bg-opacity-20 border-green-400'
            : 'bg-yellow-500 bg-opacity-20 border-yellow-500'
        }`}>
          {isRegistered ? (
            <div className="text-center">
              <p className="text-green-400 text-xl font-bold">✅ You're Registered!</p>
              <p className="text-green-400 text-lg mt-1">Your Rank: <span className="text-3xl font-bold">#{userRank}</span></p>
              <p className="text-green-400 text-sm mt-2">You'll receive a GMB airdrop when we reach 50 members! 🎉</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-yellow-400 text-xl font-bold">⚠️ Not Registered Yet!</p>
              <p className="text-yellow-400 text-sm mt-1">Click the button below to join the leaderboard!</p>
            </div>
          )}
        </div>
      )}

      {/* Register Button */}
      {!isRegistered && (
        <button
          onClick={handleRegister}
          disabled={!isConnected || leaderboard.length >= MAX_FIRST_TIMERS}
          className={`px-12 py-4 text-2xl font-bold rounded-xl tracking-wider transition-all duration-200 relative overflow-hidden z-10 ${
            !isConnected || leaderboard.length >= MAX_FIRST_TIMERS
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-400 via-green-500 to-green-400 text-black hover:scale-110 hover:shadow-2xl hover:shadow-green-400/80 animate-pulse-glow"
          }`}
        >
          {!isConnected || leaderboard.length >= MAX_FIRST_TIMERS ? null : (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          )}
          <span className="relative z-10">
            {!isConnected
              ? "Connect Wallet to Register"
              : leaderboard.length >= MAX_FIRST_TIMERS
              ? "All Spots Claimed! 😢"
              : "REGISTER NOW! 🚀"}
          </span>
        </button>
      )}

      {/* Leaderboard Table */}
      <div className="w-full bg-black bg-opacity-50 border border-green-400 rounded-lg overflow-hidden">
        <div className="bg-green-400 bg-opacity-20 p-3 grid grid-cols-4 gap-4 font-bold text-green-400 border-b border-green-400">
          <div className="text-center">Rank</div>
          <div className="text-center">Wallet</div>
          <div className="text-center">Alien Points</div>
          <div className="text-center">Joined</div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-green-400 opacity-50">
              <p className="text-xl">👽 No one registered yet! Be the first! 👽</p>
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <div
                key={entry.wallet}
                className={`grid grid-cols-4 gap-4 p-3 border-b border-green-400 border-opacity-30 transition-colors ${
                  address && entry.wallet.toLowerCase() === address.toLowerCase()
                    ? 'bg-green-400 bg-opacity-30'
                    : 'hover:bg-green-400 hover:bg-opacity-10'
                } ${
                  index < 3 ? 'text-yellow-400 font-bold' : 'text-green-400'
                }`}
              >
                <div className="text-center flex items-center justify-center">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${entry.rank}`}
                </div>
                <div className="text-center font-mono text-sm flex items-center justify-center">
                  {formatWallet(entry.wallet)}
                </div>
                <div className="text-center flex items-center justify-center">
                  {entry.alienPoints.toLocaleString()} AP
                </div>
                <div className="text-center text-xs flex items-center justify-center opacity-75">
                  {formatDate(entry.joinedAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Goal Reached Banner */}
      {leaderboard.length >= MAX_FIRST_TIMERS && (
        <div className="w-full bg-yellow-400 bg-opacity-20 border-2 border-yellow-400 rounded-lg p-6 text-center animate-pulse">
          <p className="text-yellow-400 text-3xl font-bold">🎉 GOAL REACHED! 🎉</p>
          <p className="text-yellow-400 text-lg mt-2">All 50 spots filled! Airdrops will be distributed soon! 👽</p>
        </div>
      )}

      {/* Info Section */}
      <div className="w-full text-green-400 text-xs text-center max-w-2xl bg-green-400 bg-opacity-10 p-4 rounded-lg">
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
