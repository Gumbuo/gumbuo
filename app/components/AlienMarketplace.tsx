"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useAlienPoints } from "../context/AlienPointsEconomy";

interface AlienPic {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

interface OwnedAlien {
  id: string; // unique instance ID
  picId: string; // which alien pic (nyx/zorb)
  name: string;
  image: string;
  purchasedAt: number;
}

// Alien pics for Gumbuo Fighters - Starting with Nyx and Zorb
const ALIEN_PICS: AlienPic[] = [
  { id: "nyx", name: "Nyx the Void Walker", price: 500, image: "/nyx.png", description: "Master of shadows and the void, Nyx walks between dimensions" },
  { id: "zorb", name: "Zorb the Cosmic Orb", price: 500, image: "/zorb.png", description: "Ancient cosmic entity with infinite wisdom and power" },
];

export default function AlienMarketplace() {
  const { address, isConnected } = useAccount();
  const { getUserBalance, spendPoints, pool } = useAlienPoints();
  const [userPoints, setUserPoints] = useState(0);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [ownedAliens, setOwnedAliens] = useState<OwnedAlien[]>([]);

  useEffect(() => {
    if (!address) return;

    // Load user's owned aliens from localStorage
    const owned = localStorage.getItem(`ownedAliens_${address}`);
    if (owned) {
      setOwnedAliens(JSON.parse(owned));
    }

    // Update user balance
    setUserPoints(getUserBalance(address));
  }, [address, getUserBalance]);

  const handlePurchase = async (pic: AlienPic) => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first!");
      return;
    }

    const currentBalance = getUserBalance(address);
    if (currentBalance < pic.price) {
      alert(`Not enough Alien Points! You need ${pic.price.toLocaleString()} AP but only have ${currentBalance.toLocaleString()} AP.`);
      return;
    }

    // Confirmation dialog
    const confirmed = confirm(
      `🛒 CONFIRM PURCHASE\n\n` +
      `Alien: ${pic.name}\n` +
      `Price: ${pic.price.toLocaleString()} AP\n\n` +
      `Your balance: ${currentBalance.toLocaleString()} AP\n` +
      `After purchase: ${(currentBalance - pic.price).toLocaleString()} AP\n\n` +
      `Do you want to proceed with this purchase?`
    );

    if (!confirmed) {
      return;
    }

    setPurchasing(pic.id);

    try {
      const success = await spendPoints(address, pic.price, pic.name);

      if (success) {
        // Create new alien instance with unique ID
        const newAlien: OwnedAlien = {
          id: `${pic.id}_${Date.now()}_${Math.random()}`, // Unique instance ID
          picId: pic.id,
          name: pic.name,
          image: pic.image,
          purchasedAt: Date.now(),
        };

        // Add to owned aliens
        const updatedAliens = [...ownedAliens, newAlien];
        setOwnedAliens(updatedAliens);
        localStorage.setItem(`ownedAliens_${address}`, JSON.stringify(updatedAliens));

        // Update user balance
        setUserPoints(getUserBalance(address));

        const alienCount = updatedAliens.filter(a => a.picId === pic.id).length;
        alert(`🎉 Successfully purchased ${pic.name}! 👽\n\nYou now own ${alienCount} ${pic.name}${alienCount > 1 ? 's' : ''}!\nYour new balance: ${getUserBalance(address).toLocaleString()} AP`);
      } else {
        alert("Purchase failed! Please try again.");
      }
    } catch (error) {
      console.error("Error purchasing:", error);
      alert("Purchase failed! Please try again.");
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-gradient-to-br from-black via-gray-900 to-black bg-opacity-95 rounded-xl max-w-6xl w-full relative overflow-hidden shadow-2xl shadow-green-400/50">
      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 animate-pulse"></div>

      {/* Scan line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/5 to-transparent animate-scan pointer-events-none"></div>

      <h2 className="text-5xl font-bold holographic-text tracking-wider flex items-center justify-center space-x-2 drop-shadow-lg relative z-10">
        <span className="animate-glow">👽 Alien Marketplace 🛸</span>
      </h2>

      <div className="text-center text-green-400">
        <p className="text-xl mb-2">🎨 Gumbuo Fighters - Alien Pics NFTs 🎨</p>
        <p className="text-sm opacity-75">Spend your Alien Points to unlock exclusive fighter pics!</p>
      </div>

      {/* User Balance */}
      {isConnected && address ? (
        <div className="w-full bg-green-400 bg-opacity-20 border border-green-400 rounded-lg p-4 text-center">
          <p className="text-green-400 text-lg">
            👽 Your Alien Points: <span className="font-bold text-3xl">{userPoints.toLocaleString()}</span>
          </p>
        </div>
      ) : (
        <p className="text-yellow-400 text-center">⚠️ Connect your wallet to shop!</p>
      )}

      {/* Marketplace Pool Stats */}
      <div className="w-full bg-gradient-to-r from-purple-400/10 via-purple-400/20 to-purple-400/10 border-2 border-purple-400/50 rounded-lg p-4 relative overflow-hidden shadow-lg shadow-purple-400/30 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent animate-shimmer pointer-events-none"></div>
        <p className="text-purple-400 text-center text-lg drop-shadow-glow relative z-10">
          💰 Marketplace Pool: <span className="font-bold text-xl">{pool.marketplacePool.toLocaleString()}</span> AP Collected
        </p>
        <p className="text-purple-400 text-center text-sm opacity-75 mt-1">
          Points spent by users are collected in the marketplace pool
        </p>
      </div>

      {/* Alien Pics Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALIEN_PICS.map((pic) => {
          const ownedCount = ownedAliens.filter(a => a.picId === pic.id).length;
          const isPurchasing = purchasing === pic.id;

          return (
            <div
              key={pic.id}
              className={`bg-black bg-opacity-50 border rounded-lg p-4 transition-all duration-300 ${
                ownedCount > 0
                  ? 'border-green-400 shadow-lg shadow-green-400/50'
                  : 'border-gray-600 hover:border-green-400 hover:shadow-lg hover:shadow-green-400/30'
              }`}
            >
              {/* Image */}
              <div className="relative mb-3 flex justify-center items-center h-20">
                <img
                  src={pic.image}
                  alt={pic.name}
                  className="max-w-[80px] max-h-[80px] w-auto h-auto object-contain rounded-lg border-2 border-green-400/30"
                  style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                />
                {ownedCount > 0 && (
                  <div className="absolute top-2 right-2 bg-green-400 text-black font-bold px-3 py-1 rounded-lg text-sm">
                    OWNED x{ownedCount}
                  </div>
                )}
              </div>

              {/* Details */}
              <h3 className="text-lg font-bold text-green-400 mb-1">{pic.name}</h3>
              <p className="text-gray-400 text-xs mb-2">{pic.description}</p>

              {/* Price */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-yellow-400 font-bold text-lg">
                  {pic.price.toLocaleString()} AP
                </span>
              </div>

              {/* Purchase Button */}
              <button
                onClick={() => handlePurchase(pic)}
                disabled={!isConnected || isPurchasing}
                className={`w-full px-4 py-2 text-sm font-bold rounded-lg tracking-wider transition-all duration-200 relative overflow-hidden ${
                  !isConnected || isPurchasing
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-400 via-green-500 to-green-400 text-black hover:scale-105 hover:shadow-2xl hover:shadow-green-400/80 animate-pulse-glow"
                }`}
              >
                {!isConnected || isPurchasing ? null : (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                )}
                <span className="relative z-10">
                  {!isConnected
                    ? "Connect Wallet"
                    : isPurchasing
                    ? "Purchasing..."
                    : `BUY ${ownedCount > 0 ? 'ANOTHER' : 'NOW'} - ${pic.price.toLocaleString()} AP`}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="w-full text-green-400 text-xs text-center max-w-2xl bg-green-400 bg-opacity-10 p-4 rounded-lg">
        <p className="font-bold mb-2">ℹ️ Marketplace Info</p>
        <p className="opacity-75">
          Use your Alien Points to purchase exclusive Gumbuo Fighters alien pics!
          Each purchase is permanent and unique to your wallet.
          Points spent go into the marketplace pool. More pics coming soon! 🚀
        </p>
      </div>
    </div>
  );
}
