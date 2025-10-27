"use client";
import { useState } from "react";
import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { parseEther, formatEther } from "viem";
import { abstract } from "@lib/wagmi-abstract";

export default function AbstractBridge() {
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [amount, setAmount] = useState("");
  const [bridging, setBridging] = useState(false);

  const { data: ethBalance } = useBalance({
    address: address,
  });

  const openOfficialBridge = () => {
    // Open Abstract's official bridge portal
    window.open("https://portal.mainnet.abs.xyz/bridge/", "_blank");
  };

  const handleBridgeToAbstract = () => {
    // Since bridging requires L1->L2 interaction, we'll direct users to official bridge
    // This ensures proper XP tracking through Abstract's official portal
    openOfficialBridge();
  };

  const handleSwitchToAbstract = async () => {
    try {
      await switchChain({ chainId: abstract.id });
    } catch (error) {
      console.error("Failed to switch to Abstract:", error);
    }
  };

  const isOnAbstract = chain?.id === abstract.id;

  return (
    <div className="holographic-panel glass-panel p-8 rounded-2xl max-w-md mx-auto">
      {/* Corner glows */}
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-cyan-400 mb-2 font-electro holographic-text">
          🌉 Bridge to Abstract
        </h2>
        <p className="text-green-400 text-sm mb-6">
          Earn XP by bridging ETH to Abstract! 🚀
        </p>

        {/* Current Chain Status */}
        <div className="mb-6 p-4 bg-black/30 rounded-lg border border-cyan-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyan-400 text-sm">Current Chain:</span>
            <span className="text-white font-bold">
              {chain?.name || "Not Connected"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 text-sm">ETH Balance:</span>
            <span className="text-green-400 font-mono">
              {ethBalance ? formatEther(ethBalance.value) : "0"} ETH
            </span>
          </div>
        </div>

        {/* Bridge Info */}
        <div className="mb-6 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
          <h3 className="text-purple-400 font-bold mb-2 flex items-center gap-2">
            ⚡ Bridge Benefits
          </h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>✅ Earn Abstract XP</li>
            <li>✅ Unlock badges</li>
            <li>✅ Qualify for airdrop</li>
            <li>✅ ~15 min deposit time</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isOnAbstract && (
            <button
              onClick={handleSwitchToAbstract}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
            >
              Switch to Abstract Chain
            </button>
          )}

          <button
            onClick={openOfficialBridge}
            disabled={!address}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            🌉 Open Official Bridge Portal
          </button>

          {isOnAbstract && (
            <div className="text-center text-green-400 text-sm p-3 bg-green-900/20 rounded-lg border border-green-500/30">
              ✅ You're on Abstract! Start using dApps to earn more XP
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-black/40 rounded-lg border border-yellow-500/30">
          <p className="text-yellow-400 text-xs">
            💡 <strong>Tip:</strong> Bridge from Ethereum Mainnet to Abstract to maximize XP earnings.
            The official bridge ensures your XP is properly tracked!
          </p>
        </div>
      </div>
    </div>
  );
}
