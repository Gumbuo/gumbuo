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
    <div className="flex flex-col items-center space-y-6 p-6 bg-gradient-to-br from-black via-gray-900 to-black bg-opacity-95 rounded-xl max-w-6xl w-full relative overflow-hidden shadow-2xl shadow-orange-400/50">
      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-400 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-400 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-400 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-400 animate-pulse"></div>

      {/* Scan line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-400/5 to-transparent animate-scan pointer-events-none"></div>

      <h2 className="font-bold holographic-text tracking-wider flex items-center justify-center space-x-2 drop-shadow-lg relative z-10" style={{fontSize: '4rem'}}>
        <span className="animate-glow">👽 Alien Marketplace 🛸</span>
      </h2>

      {/* Info Section */}
      <div className="w-full text-orange-400 text-xs text-center max-w-2xl bg-orange-400 bg-opacity-10 p-3 rounded-lg">
        <p className="font-bold mb-1">ℹ️ Marketplace Info</p>
        <p className="opacity-75">
          Use your Alien Points to purchase exclusive Gumbuo Fighters alien pics!
          Each purchase is permanent and unique to your wallet. More pics coming soon! 🚀
        </p>
      </div>

      {/* Alien Pics - Side by Side */}
      <div className="w-full flex justify-center gap-8">
        {ALIEN_PICS.map((pic) => {
          const ownedCount = ownedAliens.filter(a => a.picId === pic.id).length;
          const isPurchasing = purchasing === pic.id;

          return (
            <div
              key={pic.id}
              className="flex flex-col items-center"
            >
              {/* Name above */}
              <h3 className="text-xl font-bold text-orange-400 mb-2">{pic.name}</h3>

              {/* Image */}
              <div className="relative mb-2 flex justify-center items-center">
                <img
                  src={pic.image}
                  alt={pic.name}
                  className="max-w-[64px] max-h-[64px] w-auto h-auto object-contain rounded-lg border-2 border-orange-400/30"
                  style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                />
                {ownedCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-orange-400 text-black font-bold px-2 py-1 rounded-full text-xs">
                    x{ownedCount}
                  </div>
                )}
              </div>

              {/* Small animated buy button below */}
              <button
                onClick={() => handlePurchase(pic)}
                disabled={!isConnected || isPurchasing}
                className={`px-4 py-1 text-xs font-bold rounded-lg tracking-wider transition-all duration-200 relative overflow-hidden ${
                  !isConnected || isPurchasing
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 text-black hover:scale-110 hover:shadow-xl hover:shadow-orange-400/80 animate-pulse-glow"
                }`}
              >
                {!isConnected || isPurchasing ? null : (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                )}
                <span className="relative z-10">
                  {!isConnected
                    ? "Connect"
                    : isPurchasing
                    ? "Buying..."
                    : `BUY ${pic.price.toLocaleString()} AP`}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
