"use client";

import dynamic from "next/dynamic";
import "./ReferralDrawer.css";

const ReferralSceneContent = dynamic(() => import("../client/ReferralSceneContent"), { ssr: false });

interface ReferralDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function ReferralDrawer({ isOpen, setIsOpen }: ReferralDrawerProps) {
  return (
    <>
      {/* Toggle Button */}
      <button
        className={`referral-drawer-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close referral drawer" : "Open referral drawer"}
      >
        <span className="toggle-icon">{isOpen ? "▶" : "◀"}</span>
      </button>

      {/* Drawer */}
      <div className={`referral-drawer ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="referral-drawer-header">
          <div className="header-content">
            <span className="header-icon">🎁</span>
            <h2 className="header-title">REFERRAL PROGRAM</h2>
          </div>
        </div>

        {/* Content */}
        <div className="referral-drawer-content">
          <ReferralSceneContent />
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="referral-drawer-overlay" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
