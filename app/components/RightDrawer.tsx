"use client";

import dynamic from "next/dynamic";
import { useRightDrawer } from "../context/RightDrawerContext";
import "./RightDrawer.css";

const GlobalMusicPlayer = dynamic(() => import("./GlobalMusicPlayer"), { ssr: false });
const GlobalChat = dynamic(() => import("./GlobalChat"), { ssr: false });
const GlobalWalletHUD = dynamic(() => import("./GlobalWalletHUD"), { ssr: false });

export default function RightDrawer() {
  const { isOpen, setIsOpen } = useRightDrawer();

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
        {/* Stacked Content */}
        <div className="drawer-content-stacked">
          {/* Wallet Connect & HUD */}
          <div className="drawer-section drawer-section-hud">
            <GlobalWalletHUD />
          </div>

          {/* Chat */}
          <div className="drawer-section drawer-section-chat">
            <GlobalChat />
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="drawer-overlay" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
