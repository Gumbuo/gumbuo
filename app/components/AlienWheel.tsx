"use client";
import { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import { useAccount } from "wagmi";
import { useAlienPoints } from "../context/AlienPointsEconomy";

// Wheel segments with weighted probability (lower value = more common)
const wheelData = [
  { option: "50", style: { backgroundColor: "#00ff99", textColor: "#000" }, probability: 30 },
  { option: "75", style: { backgroundColor: "#8e44ad", textColor: "#fff" }, probability: 25 },
  { option: "100", style: { backgroundColor: "#00ff99", textColor: "#000" }, probability: 20 },
  { option: "150", style: { backgroundColor: "#8e44ad", textColor: "#fff" }, probability: 12 },
  { option: "200", style: { backgroundColor: "#00ff99", textColor: "#000" }, probability: 8 },
  { option: "250", style: { backgroundColor: "#8e44ad", textColor: "#fff" }, probability: 3 },
  { option: "300", style: { backgroundColor: "#00ff99", textColor: "#000" }, probability: 1.5 },
  { option: "400", style: { backgroundColor: "#8e44ad", textColor: "#fff" }, probability: 0.4 },
  { option: "500", style: { backgroundColor: "#FFD700", textColor: "#000" }, probability: 0.1 }, // Rare gold!
  { option: "100", style: { backgroundColor: "#00ff99", textColor: "#000" }, probability: 20 }, // Duplicate for balance
];

export default function AlienWheel() {
  const { address, isConnected } = useAccount();
  const { getUserBalance, addPoints, getPoolRemaining } = useAlienPoints();
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [wonPoints, setWonPoints] = useState<number | null>(null);
  const [userPoints, setUserPoints] = useState(0);

  // Check if user has spun today
  useEffect(() => {
    if (!address) return;

    const lastSpinDate = localStorage.getItem(`lastSpin_${address}`);
    const today = new Date().toDateString();

    if (lastSpinDate === today) {
      setHasSpunToday(true);
      const savedPoints = localStorage.getItem(`lastWin_${address}`);
      if (savedPoints) {
        setWonPoints(parseInt(savedPoints));
      }
    } else {
      setHasSpunToday(false);
      setWonPoints(null);
    }

    // Update user balance
    setUserPoints(getUserBalance(address));
  }, [address, getUserBalance]);

  // Weighted random selection
  const getWeightedRandomIndex = () => {
    const totalWeight = wheelData.reduce((sum, item) => sum + item.probability, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < wheelData.length; i++) {
      random -= wheelData[i].probability;
      if (random <= 0) {
        return i;
      }
    }
    return 0;
  };

  const handleSpinClick = () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    if (hasSpunToday) {
      alert("You've already spun today! Come back tomorrow! 👽");
      return;
    }

    const newPrizeNumber = getWeightedRandomIndex();
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  const handleStopSpinning = async () => {
    setMustSpin(false);
    const points = parseInt(wheelData[prizeNumber].option);
    setWonPoints(points);

    if (address) {
      // Add points to user balance from wheel pool
      const success = await addPoints(address, points, 'wheel');

      if (success) {
        // Save to localStorage
        const today = new Date().toDateString();
        localStorage.setItem(`lastSpin_${address}`, today);
        localStorage.setItem(`lastWin_${address}`, points.toString());
        setHasSpunToday(true);
        setUserPoints(getUserBalance(address));

        // Show celebration
        alert(`🎉 Congratulations! You won ${points} Alien Points! 👽`);
      } else {
        alert("Wheel pool depleted! Please try the drip station!");
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-black bg-opacity-80 rounded-xl w-48">
      <h2 className="text-5xl font-bold holographic-text tracking-wider flex items-center space-x-3">
        <img src="/nyx.png" alt="Nyx" style={{width: '48px', height: '48px', objectFit: 'cover'}} />
        <span className="animate-glow">Daily Alien Wheel</span>
        <img src="/zorb.png" alt="Zorb" style={{width: '48px', height: '48px', objectFit: 'cover'}} />
      </h2>

      {/* Pool Status */}
      <div className="w-full bg-green-400 bg-opacity-10 border border-green-400 rounded-lg p-4">
        <p className="text-green-400 text-center text-lg">
          🎰 Wheel Pool: <span className="font-bold">{getPoolRemaining('wheel').toLocaleString()}</span> / 100,000,000 AP
        </p>
        <div className="w-full bg-gray-800 rounded-full h-3 mt-2">
          <div
            className="bg-green-400 h-3 rounded-full transition-all duration-500"
            style={{width: `${(getPoolRemaining('wheel') / 100_000_000) * 100}%`}}
          />
        </div>
      </div>

      {/* User Balance */}
      {isConnected && address && (
        <div className="w-full bg-green-400 bg-opacity-20 border border-green-400 rounded-lg p-4 text-center">
          <p className="text-green-400 text-lg">
            👽 Your Alien Points: <span className="font-bold text-3xl">{userPoints.toLocaleString()}</span>
          </p>
        </div>
      )}

      <div className="relative">
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={wheelData}
          onStopSpinning={handleStopSpinning}
          backgroundColors={["#00ff99", "#8e44ad"]}
          textColors={["#000000", "#ffffff"]}
          outerBorderColor="#00ff99"
          outerBorderWidth={5}
          innerBorderColor="#8e44ad"
          innerBorderWidth={3}
          radiusLineColor="#000000"
          radiusLineWidth={2}
          fontSize={20}
          perpendicularText={false}
          textDistance={60}
        />
      </div>

      {wonPoints !== null && hasSpunToday && (
        <div className="text-center p-4 bg-green-400 bg-opacity-20 border border-green-400 rounded-lg">
          <p className="text-2xl text-green-400 font-bold">
            Today's Win: {wonPoints} Alien Points! 🎉
          </p>
          <p className="text-sm text-green-400 mt-1">Come back tomorrow for another spin!</p>
        </div>
      )}

      <button
        onClick={handleSpinClick}
        disabled={hasSpunToday || mustSpin}
        className={`px-12 py-4 text-2xl font-bold rounded-xl tracking-wider transition-all duration-200 ${
          hasSpunToday || mustSpin
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-green-400 text-black hover:bg-green-500 hover:scale-105"
        }`}
      >
        {hasSpunToday ? "Already Spun Today! 👽" : mustSpin ? "Spinning..." : "SPIN THE WHEEL! 🎰"}
      </button>

      {!isConnected && (
        <p className="text-yellow-400 text-sm">⚠️ Connect your wallet to spin!</p>
      )}

      <div className="text-green-400 text-xs text-center max-w-md">
        <p className="font-bold mb-2">Prize Probabilities:</p>
        <div className="grid grid-cols-2 gap-2">
          <span>50 pts: Common</span>
          <span>75 pts: Common</span>
          <span>100 pts: Common</span>
          <span>150 pts: Uncommon</span>
          <span>200 pts: Uncommon</span>
          <span>250 pts: Rare</span>
          <span>300 pts: Very Rare</span>
          <span>400 pts: Epic</span>
          <span className="col-span-2 text-yellow-400">500 pts: LEGENDARY! 🌟</span>
        </div>
      </div>
    </div>
  );
}
