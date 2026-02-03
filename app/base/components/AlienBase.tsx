"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { THEME } from "./armory/constants";

// Dynamic imports to prevent SSR issues
const AlienArmory = dynamic(() => import("./AlienArmory"), { ssr: false });
const FishingPond = dynamic(() => import("./FishingPond"), { ssr: false });

type Tab = "armory" | "pond";

export default function AlienBase() {
  const [activeTab, setActiveTab] = useState<Tab>("armory");

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "armory", label: "Armory", icon: "\u2694\uFE0F" },
    { id: "pond", label: "Points Pond", icon: "\uD83C\uDFA3" },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1400,
        margin: "0 auto",
        fontFamily: "Orbitron, sans-serif",
      }}
    >
      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 16px",
          background: THEME.colors.panel,
          borderRadius: "12px 12px 0 0",
          borderBottom: `2px solid ${THEME.colors.secondary}`,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px",
              background:
                activeTab === tab.id
                  ? THEME.gradients.button
                  : "rgba(102,252,241,0.1)",
              color: activeTab === tab.id ? "#000" : THEME.colors.primary,
              border:
                activeTab === tab.id
                  ? THEME.borders.active
                  : "1px solid rgba(69,162,158,0.3)",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "Orbitron, sans-serif",
              fontWeight: "bold",
              fontSize: 14,
              textTransform: "uppercase",
              transition: "all 0.3s ease",
              boxShadow:
                activeTab === tab.id ? THEME.shadows.glow : "none",
            }}
          >
            <span style={{ marginRight: 6 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        style={{
          background: "rgba(11,12,16,0.5)",
          borderRadius: "0 0 12px 12px",
          minHeight: 600,
        }}
      >
        {activeTab === "armory" && <AlienArmory />}
        {activeTab === "pond" && <FishingPond />}
      </div>
    </div>
  );
}
