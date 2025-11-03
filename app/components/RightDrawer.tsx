"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "./RightDrawer.css";

const GlobalMusicPlayer = dynamic(() => import("./GlobalMusicPlayer"), { ssr: false });
const GlobalChat = dynamic(() => import("./GlobalChat"), { ssr: false });
const GlobalWalletHUD = dynamic(() => import("./GlobalWalletHUD"), { ssr: false });

type TabType = "music" | "hud" | "chat";

export default function RightDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("hud");

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`drawer-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close drawer" : "Open drawer"}
      >
        <span className="toggle-icon">{isOpen ? "▶" : "◀"}</span>
      </button>

      {/* Drawer */}
      <div className={`right-drawer ${isOpen ? "open" : ""}`}>
        {/* Tabs */}
        <div className="drawer-tabs">
          <button
            className={`tab-button ${activeTab === "music" ? "active" : ""}`}
            onClick={() => setActiveTab("music")}
          >
            <span className="tab-icon">🎵</span>
            <span className="tab-label">Music</span>
          </button>
          <button
            className={`tab-button ${activeTab === "hud" ? "active" : ""}`}
            onClick={() => setActiveTab("hud")}
          >
            <span className="tab-icon">👽</span>
            <span className="tab-label">HUD</span>
          </button>
          <button
            className={`tab-button ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            <span className="tab-icon">💬</span>
            <span className="tab-label">Chat</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="drawer-content">
          {activeTab === "music" && (
            <div className="tab-panel">
              <GlobalMusicPlayer />
            </div>
          )}
          {activeTab === "hud" && (
            <div className="tab-panel">
              <GlobalWalletHUD />
            </div>
          )}
          {activeTab === "chat" && (
            <div className="tab-panel">
              <GlobalChat />
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="drawer-overlay" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
