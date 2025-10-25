"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useAlienPoints } from "../context/AlienPointsEconomy";
import { useCosmicSound } from "../hooks/useCosmicSound";

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
  const { playSound } = useCosmicSound();
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
      playSound('error');
      alert("Please connect your wallet first!");
      return;
    }

    const currentBalance = getUserBalance(address);
    if (currentBalance < pic.price) {
      playSound('error');
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

    playSound('click');
    setPurchasing(pic.id);

    try {
      const success = await spendPoints(address, pic.price, pic.name);

      if (success) {
        playSound('success');
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
        playSound('error');
        alert("Purchase failed! Please try again.");
      }
    } catch (error) {
      playSound('error');
      console.error("Error purchasing:", error);
      alert("Purchase failed! Please try again.");
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8 holographic-panel max-w-6xl w-full relative overflow-visible rounded-3xl">
      {/* Corner glow accents */}
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <h2 className="font-alien font-bold holographic-text tracking-wider flex items-center justify-center space-x-2 drop-shadow-lg relative z-10 alien-glyph-text hex-pattern" style={{fontSize: '4rem'}}>
        <span className="animate-glow">👽 Alien Marketplace 🛸</span>
      </h2>

      {/* Info Section */}
      <div className="w-full text-orange-400 text-sm text-center max-w-2xl glass-panel p-4 rounded-xl border-2 border-orange-400/50 z-10">
        <p className="font-bold mb-2 text-xl font-iceland circuit-text">ℹ️ Marketplace Info</p>
        <p className="opacity-75 font-electro">
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
              <h3 className="text-2xl font-bold text-orange-400 mb-3 font-alien holographic-text">{pic.name}</h3>

              {/* Image */}
              <div className="relative mb-4 flex justify-center items-center glass-panel p-6 rounded-xl border-2 border-orange-400/50 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-400/50">
                <img
                  src={pic.image}
                  alt={pic.name}
                  className="max-w-[128px] max-h-[128px] w-auto h-auto object-contain"
                  style={{ width: '128px', height: '128px', objectFit: 'contain' }}
                />
                {ownedCount > 0 && (
                  <div className="absolute -top-3 -right-3 bg-orange-400 text-black font-bold px-3 py-2 rounded-full text-sm animate-pulse shadow-lg shadow-orange-400/50 font-alien">
                    x{ownedCount}
                  </div>
                )}
              </div>

              {/* Animated buy button below */}
              <button
                onClick={() => handlePurchase(pic)}
                onMouseEnter={() => !isPurchasing && isConnected && playSound('hover')}
                disabled={!isConnected || isPurchasing}
                className={`px-8 py-3 text-lg font-bold tracking-wider transition-all duration-200 relative overflow-hidden ${
                  !isConnected || isPurchasing
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed rounded-xl"
                    : "holographic-button organic-button text-white hover:scale-110 hover:shadow-2xl hover:shadow-orange-400/80 animate-pulse-glow hover-ripple hover-float"
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
