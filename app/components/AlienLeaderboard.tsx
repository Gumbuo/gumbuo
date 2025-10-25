"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
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
      playSound('error');
      alert("Please connect your wallet first!");
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
      <div className="flex flex-col items-center justify-center space-y-4 p-8 holographic-panel glass-panel rounded-3xl max-w-4xl w-full min-h-96 relative overflow-visible">
        <div className="corner-glow corner-glow-tl"></div>
        <div className="corner-glow corner-glow-tr"></div>
        <div className="corner-glow corner-glow-bl"></div>
        <div className="corner-glow corner-glow-br"></div>
        <div className="text-purple-400 text-2xl animate-pulse relative z-10">Loading Leaderboard...</div>
        <div className="text-purple-400 text-lg relative z-10">Fetching galactic data 🛸</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-8 holographic-panel max-w-3xl relative overflow-visible rounded-3xl">
      {/* Corner glow accents */}
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <h2 className="font-alien font-bold holographic-text tracking-wider flex items-center justify-center space-x-2 drop-shadow-lg relative z-10 alien-glyph-text hex-pattern" style={{fontSize: '4rem'}}>
        <span className="animate-glow text-purple-400">👽 First Timer Leaderboard 🛸</span>
      </h2>

      {/* Progress Bar */}
      <div className="w-full glass-panel rounded-xl p-4 relative overflow-hidden shadow-lg shadow-purple-400/30 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent animate-shimmer pointer-events-none"></div>
        <div className="flex justify-between items-center mb-2 relative z-10">
          <p className="text-purple-400 text-xl drop-shadow-glow font-electro">
            📊 Progress: <span className="font-bold text-2xl">{leaderboard.length}</span> / {MAX_FIRST_TIMERS}
          </p>
          <p className={`text-xl font-bold font-iceland ${spotsRemaining <= 10 ? 'text-red-400 animate-pulse drop-shadow-lg' : 'text-pink-400 drop-shadow-glow'}`}>
            {spotsRemaining} spots left!
          </p>
        </div>
        <div className="w-full bg-gray-900 rounded-full h-6 border-2 border-gray-700 shadow-inner relative overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 via-pink-400 to-purple-500 h-full rounded-full transition-all duration-500 shadow-lg shadow-purple-400/50 relative overflow-hidden"
            style={{width: `${getProgressPercentage()}%`}}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* User Status */}
      {isConnected && address && (
        <div className={`w-full glass-panel rounded-xl p-4 border-2 ${
          isRegistered
            ? 'border-purple-400/50'
            : 'border-yellow-500/50'
        }`}>
          {isRegistered ? (
            <div className="text-center">
              <p className="text-purple-400 text-xl font-bold">✅ You're Registered!</p>
              <p className="text-purple-400 text-lg mt-1">Your Rank: <span className="text-3xl font-bold">#{userRank}</span></p>
              <p className="text-purple-400 text-sm mt-2">You'll receive a GMB airdrop when we reach 50 members! 🎉</p>
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
          onMouseEnter={() => isConnected && leaderboard.length < MAX_FIRST_TIMERS && playSound('hover')}
          disabled={!isConnected || leaderboard.length >= MAX_FIRST_TIMERS}
          className={`px-12 py-4 text-2xl font-bold tracking-wider transition-all duration-200 relative overflow-hidden z-10 ${
            !isConnected || leaderboard.length >= MAX_FIRST_TIMERS
              ? "bg-gray-600 text-gray-400 cursor-not-allowed rounded-xl"
              : "holographic-button organic-button text-white hover:scale-105 hover:shadow-2xl hover:shadow-green-400/80 animate-pulse-glow hover-ripple hover-color-shift"
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
      <div className="w-full glass-panel border-2 border-purple-400/50 rounded-xl overflow-hidden">
        <div className="bg-purple-400 bg-opacity-20 p-3 grid grid-cols-4 gap-4 font-bold text-purple-400 border-b border-purple-400">
          <div className="text-center">Rank</div>
          <div className="text-center">Wallet</div>
          <div className="text-center">Alien Points</div>
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
                className={`grid grid-cols-4 gap-4 p-3 border-b border-purple-400 border-opacity-30 transition-colors ${
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
        <div className="w-full glass-panel border-2 border-yellow-400/50 rounded-xl p-6 text-center animate-pulse">
          <p className="text-yellow-400 text-3xl font-bold">🎉 GOAL REACHED! 🎉</p>
          <p className="text-yellow-400 text-lg mt-2">All 50 spots filled! Airdrops will be distributed soon! 👽</p>
        </div>
      )}

      {/* Info Section */}
      <div className="w-full text-purple-400 text-xs text-center max-w-2xl glass-panel p-4 rounded-xl">
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
