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

  // Load leaderboard from localStorage
  useEffect(() => {
    const savedLeaderboard = localStorage.getItem('alienLeaderboard');
    if (savedLeaderboard) {
      const parsed = JSON.parse(savedLeaderboard);
      setLeaderboard(parsed);
      setSpotsRemaining(MAX_FIRST_TIMERS - parsed.length);
    }
  }, []);

  // Check if user is registered and update their points
  useEffect(() => {
    if (!address) return;

    const userEntry = leaderboard.find(entry => entry.wallet.toLowerCase() === address.toLowerCase());

    if (userEntry) {
      setIsRegistered(true);
      setUserRank(userEntry.rank);

      // Update user's alien points in leaderboard
      const updatedLeaderboard = leaderboard.map(entry => {
        if (entry.wallet.toLowerCase() === address.toLowerCase()) {
          return { ...entry, alienPoints: getUserBalance(address) };
        }
        return entry;
      });

      setLeaderboard(updatedLeaderboard);
      localStorage.setItem('alienLeaderboard', JSON.stringify(updatedLeaderboard));
    } else {
      setIsRegistered(false);
      setUserRank(null);
    }
  }, [address, leaderboard.length, getUserBalance]);

  const handleRegister = () => {
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

    // Add user to leaderboard
    const newEntry: LeaderboardEntry = {
      wallet: address,
      joinedAt: Date.now(),
      alienPoints: getUserBalance(address),
      rank: leaderboard.length + 1,
    };

    const updatedLeaderboard = [...leaderboard, newEntry];
    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('alienLeaderboard', JSON.stringify(updatedLeaderboard));

    setIsRegistered(true);
    setUserRank(newEntry.rank);
    setSpotsRemaining(MAX_FIRST_TIMERS - updatedLeaderboard.length);

    alert(`🎉 Congratulations! You're #${newEntry.rank} on the First Timer Leaderboard! You'll receive a GMB airdrop when we hit 50 members! 👽`);
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

  return (
    <div className="flex flex-col items-center space-y-6 p-8 bg-black bg-opacity-80 border-2 border-green-400 rounded-xl max-w-4xl w-full">
      <h2 className="text-4xl font-bold text-green-400 tracking-wider flex items-center space-x-3">
        <img src="/nyx.png" alt="Nyx" style={{width: '48px', height: '48px', objectFit: 'cover'}} />
        <span>First Timer Leaderboard</span>
        <img src="/zorb.png" alt="Zorb" style={{width: '48px', height: '48px', objectFit: 'cover'}} />
      </h2>

      <div className="text-center text-green-400">
        <p className="text-xl mb-2">🎁 First 50 Wallets Get GMB Airdrop! 🎁</p>
        <p className="text-sm opacity-75">Register now to secure your spot for the exclusive airdrop!</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-green-400 bg-opacity-10 border border-green-400 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-green-400 text-lg">
            📊 Progress: <span className="font-bold">{leaderboard.length}</span> / {MAX_FIRST_TIMERS}
          </p>
          <p className={`text-lg font-bold ${spotsRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
            {spotsRemaining} spots left!
          </p>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-4">
          <div
            className="bg-green-400 h-4 rounded-full transition-all duration-500"
            style={{width: `${getProgressPercentage()}%`}}
          />
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
          className={`px-12 py-4 text-2xl font-bold rounded-xl tracking-wider transition-all duration-200 ${
            !isConnected || leaderboard.length >= MAX_FIRST_TIMERS
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-green-400 text-black hover:bg-green-500 hover:scale-105"
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
