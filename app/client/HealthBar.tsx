"use client";

import React from 'react';

// Define the shape of the health stats props
interface HealthBarProps {
  current: number;
  max: number;
}

const HealthBar: React.FC<HealthBarProps> = ({ current, max }) => {
  const healthPercentage = (current / max) * 100;

  // Determine border and text color based on health percentage for thematic effect
  const borderColor = healthPercentage > 50 ? "border-green-500" : healthPercentage > 20 ? "border-yellow-500" : "border-red-500";
  const barColor = healthPercentage > 50 ? "bg-green-500" : healthPercentage > 20 ? "bg-yellow-500" : "bg-red-500";
  const textColor = "text-white"; // Keep text white for readability

  return (
    <div className={`absolute top-4 left-4 w-64 h-7 bg-gray-800 rounded-full ${borderColor} border-2 z-50 shadow-lg`}>
      <div
        className={`h-full ${barColor} rounded-full transition-all duration-300 ease-out`}
        style={{ width: `${healthPercentage}%` }}
      ></div>
      <div className={`absolute inset-0 flex items-center justify-center text-sm font-extrabold ${textColor} text-shadow-glow`}>
        {current} / {max} HP
      </div>
    </div>
  );
};

export default HealthBar;
