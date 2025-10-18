
"use client";
import { triggerClaim } from "@/api/triggerClaim";
import { useAlienPoints } from "@/context/AlienPointContext";

export default function WheelClient() {
  const context = useAlienPoints();

  const handleSpinComplete = async () => {
    const reward = await triggerClaim();
    if (context && context.setAlienPoints) {
      context.setAlienPoints(reward);
    }
  };

  return (
    <div>
      <button onClick={handleSpinComplete} className="bg-green-500 text-black px-4 py-2 rounded">
        ?? Spin the Wheel
      </button>
    </div>
  );
}
