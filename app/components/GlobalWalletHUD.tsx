"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import dynamic from "next/dynamic";

const AlienHUD = dynamic(() => import("@lib/hud").then(mod => mod.AlienHUD), { ssr: false });

export default function GlobalWalletHUD() {

  return (
    <div style={{position: 'fixed', top: '24px', right: '24px', zIndex: 1000}} className="flex flex-col items-end space-y-4">
      {/* Wallet Connect Button with Alien Styling */}
      <div style={{
        borderRadius: '8px',
        border: '2px solid #00ff9944'
      }} className="holographic-panel glass-panel p-4">
        <div className="corner-glow corner-glow-tl"></div>
        <div className="corner-glow corner-glow-tr"></div>
        <div className="corner-glow corner-glow-bl"></div>
        <div className="corner-glow corner-glow-br"></div>
        <div className="relative z-10">
          <ConnectButton showBalance={false} chainStatus="icon" />
        </div>
      </div>

      {/* Alien HUD */}
      <AlienHUD />
    </div>
  );
}
