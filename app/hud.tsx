"use client";
import React, { useState, useEffect } from 'react';
import WalletHUD from "./client/WalletHUD";
import AlienBalance from "./client/AlienBalance";
import HUDBar from "./client/HUDBar";
import HealthBar from "./client/HealthBar"; // Import the new HealthBar component

export default function HUDPage() {
  const [currentHealth, setCurrentHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Ensure the message is from a trusted source if possible, and that it has the expected format
      if (event.data && event.data.type === 'ALIEN_CATACOMBS_HEALTH') {
        const { currentHealth, maxHealth } = event.data;
        setCurrentHealth(currentHealth);
        setMaxHealth(maxHealth);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <>
      <HUDBar />
      <HealthBar current={currentHealth} max={maxHealth} /> {/* Render the HealthBar component with props */}
      <WalletHUD />
      {/* Pass wallet address here if AlienBalance requires it */}
      {/* <AlienBalance wallet={address} /> */}
    </>
  );
}
