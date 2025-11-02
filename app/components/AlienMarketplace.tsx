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

// Alien pics for Gumbuo Fighters - Nyx, Zorb, Baob, Apelian, J3D1, and Zit
const ALIEN_PICS: AlienPic[] = [
  { id: "nyx", name: "Nyx", price: 100, image: "/nyx.png", description: "Master of shadows and the void, Nyx walks between dimensions" },
  { id: "zorb", name: "Zorb", price: 100, image: "/zorb.png", description: "Ancient cosmic entity with infinite wisdom and power" },
  { id: "baob", name: "Baob", price: 100, image: "/baob.png", description: "Wise protector of the ancient realms, Baob defends cosmic balance" },
  { id: "apelian", name: "Apelian", price: 100, image: "/apelian.jpg", description: "Fierce warrior from the primal cosmos, Apelian brings raw strength and cunning" },
  { id: "j3d1", name: "J3D1", price: 100, image: "/j3d1.jpg", description: "Legendary mech warrior from distant galaxies, J3D1 combines advanced technology with unmatched combat prowess" },
  { id: "zit", name: "Zit", price: 100, image: "/zit.png", description: "Chaotic trickster from the cosmic void, Zit strikes with unpredictable fury" },
  { id: "comingsoon", name: "Coming Soon", price: 999999, image: "/alien.mp4", description: "A new warrior is arriving soon from the depths of space..." },
];

export default function AlienMarketplace() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { getUserBalance, spendPoints, pool } = useAlienPoints();
  const { playSound } = useCosmicSound();
  const [userPoints, setUserPoints] = useState(0);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [ownedAliens, setOwnedAliens] = useState<OwnedAlien[]>([]);
  const [totalSales, setTotalSales] = useState<Record<string, number>>({
    nyx: 0,
    zorb: 0,
    baob: 0,
    apelian: 0,
    j3d1: 0,
    zit: 0,
    comingsoon: 0,
  });

  // Migration: Clear old localStorage data (v5 - global staking & drip data)
  useEffect(() => {
    const CURRENT_VERSION = "5";
    const versionKey = "alienData_version";
    const storedVersion = localStorage.getItem(versionKey);

    if (storedVersion !== CURRENT_VERSION) {
      console.log("Migrating to version", CURRENT_VERSION, "- Moving all game data to global backend storage");
      // Clear all old localStorage game data
      Object.keys(localStorage).forEach(key => {
        if (
          key.startsWith("ownedAliens_") ||
          key.startsWith("attackLevels_") ||
          key.startsWith("bossRewardClaimed_") ||
          key.startsWith("powerAttackTime_") ||
          key.startsWith("ultimateAttackTime_") ||
          key.startsWith("staking_") ||
          key.startsWith("lastDrip_")
        ) {
          localStorage.removeItem(key);
          console.log("Cleared:", key);
        }
      });
      // Set new version
      localStorage.setItem(versionKey, CURRENT_VERSION);
    }
  }, []);

  // Fetch total sales on mount
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch('/api/alien-sales');
        const data = await response.json();
        if (data.success) {
          setTotalSales(data.sales);
        }
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    };
    fetchSales();
  }, []);

  useEffect(() => {
    if (!address) {
      setOwnedAliens([]);
      setUserPoints(0);
      return;
    }

    // Load user's owned aliens from backend API
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user-data?wallet=${address}`);
        const data = await response.json();
        if (data.success && data.userData) {
          setOwnedAliens(data.userData.ownedAliens || []);
        } else {
          setOwnedAliens([]);
        }
      } catch (error) {
        console.error('Failed to load owned aliens:', error);
        setOwnedAliens([]);
      }
    };

    fetchUserData();

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

        let updatedAliens: OwnedAlien[] = [];

        // Fetch latest aliens from backend to avoid race condition
        try {
          const response = await fetch(`/api/user-data?wallet=${address}`);
          const data = await response.json();
          const currentAliens = data.success && data.userData ? data.userData.ownedAliens || [] : [];

          // Add new alien to latest backend data
          updatedAliens = [...currentAliens, newAlien];
          setOwnedAliens(updatedAliens);

          // Save to backend API
          await fetch('/api/user-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet: address, ownedAliens: updatedAliens }),
          });
        } catch (error) {
          console.error('Failed to save owned aliens:', error);
        }

        // Update user balance
        setUserPoints(getUserBalance(address));

        // Track game stats: alien purchase
        try {
          await fetch('/api/user-data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wallet: address,
              statUpdates: {
                aliensPurchased: 1,
                apSpentOnAliens: pic.price,
              },
            }),
          });
        } catch (error) {
          console.error('Failed to track alien purchase stats:', error);
        }

        // Increment global sales counter
        try {
          const salesResponse = await fetch('/api/alien-sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alienId: pic.id }),
          });
          const salesData = await salesResponse.json();
          if (salesData.success) {
            setTotalSales(salesData.sales);
          }
        } catch (error) {
          console.error("Error updating sales counter:", error);
        }

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
    <div className="flex flex-col items-center space-y-6 w-full">
      {/* Info Section */}
      <div className="w-full text-orange-400 text-center">
        <p className="font-bold text-lg">
          Use your Alien Points to purchase Gumbuo Fighters aliens!
        </p>
      </div>

      {/* Alien Pics - Side by Side */}
      <div className="w-full flex justify-center gap-12">
        {ALIEN_PICS.map((pic) => {
          const ownedCount = ownedAliens.filter(a => a.picId === pic.id).length;
          const isPurchasing = purchasing === pic.id;

          return (
            <div
              key={pic.id}
              className="flex flex-col items-center"
            >
              {/* Sales Counter above name */}
              <div className="text-sm text-green-400 mb-1">
                <span className="font-bold">{totalSales[pic.id] || 0}</span> sold
              </div>

              {/* Name */}
              <h3 className="text-xl font-bold text-orange-400 mb-3 font-alien">{pic.name}</h3>

              {/* Image */}
              <div className="relative mb-4 flex justify-center items-center bg-black/60 p-6 rounded-xl">
                <img
                  src={pic.image}
                  alt={pic.name}
                  className="w-[128px] h-[128px] object-cover rounded-lg"
                  style={{ width: '128px', height: '128px', objectFit: 'cover' }}
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
