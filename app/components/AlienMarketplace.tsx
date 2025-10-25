"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
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

// Alien pics for Gumbuo Fighters - Nyx, Zorb, and Baob
const ALIEN_PICS: AlienPic[] = [
  { id: "nyx", name: "Nyx the Void Walker", price: 500, image: "/nyx.png", description: "Master of shadows and the void, Nyx walks between dimensions" },
  { id: "zorb", name: "Zorb the Cosmic Orb", price: 500, image: "/zorb.png", description: "Ancient cosmic entity with infinite wisdom and power" },
  { id: "baob", name: "Baob the Eternal Guardian", price: 500, image: "/baob.png", description: "Wise protector of the ancient realms, Baob defends cosmic balance" },
];

export default function AlienMarketplace() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
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
      playSound('click');
      openConnectModal?.();
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
    <div className="flex flex-col items-center space-y-6 p-8 bg-black/40 backdrop-blur-sm max-w-6xl rounded-3xl border border-orange-400/30">
      <h2 className="font-alien font-bold holographic-text tracking-wider text-center" style={{fontSize: '4rem'}}>
        <span className="text-orange-400">👽 Alien Marketplace 🛸</span>
      </h2>

      {/* Info Section */}
      <div className="w-full text-orange-400 text-sm text-center max-w-2xl bg-black/60 p-4 rounded-xl border border-orange-400/30">
        <p className="font-bold mb-2 text-lg">ℹ️ Marketplace Info</p>
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
              <h3 className="text-xl font-bold text-orange-400 mb-3 font-alien">{pic.name}</h3>

              {/* Image */}
              <div className="relative mb-4 flex justify-center items-center bg-black/60 p-6 rounded-xl border border-orange-400/30">
                <img
                  src={pic.image}
                  alt={pic.name}
                  className="max-w-[128px] max-h-[128px] w-auto h-auto object-contain"
                  style={{ width: '128px', height: '128px', objectFit: 'contain' }}
                />
                {ownedCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-orange-400 text-black font-bold px-2 py-1 rounded-full text-sm">
                    x{ownedCount}
                  </div>
                )}
              </div>

              {/* Buy button below */}
              <button
                onClick={() => handlePurchase(pic)}
                onMouseEnter={() => !isPurchasing && playSound('hover')}
                disabled={isPurchasing}
                className={`px-8 py-3 text-base font-bold rounded-xl transition-all duration-200 ${
                  isPurchasing
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {!isConnected
                  ? "Connect"
                  : isPurchasing
                  ? "Buying..."
                  : `BUY ${pic.price.toLocaleString()} AP`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
