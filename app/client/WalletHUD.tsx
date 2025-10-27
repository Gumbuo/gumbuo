"use client";
import { useAccount, useBalance } from "wagmi";
import { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function WalletHUD() {
  const { address } = useAccount();

  const ethBalance = address
    ? useBalance({ address }).data
    : undefined;

  const wethBalance = address
    ? useBalance({
        address,
        token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      }).data
    : undefined;

  useEffect(() => {
    console.log("WalletHUD mounted, address:", address);
    console.log("ETH balance:", ethBalance);
    console.log("WETH balance:", wethBalance);
  }, [address, ethBalance, wethBalance]);

  return (
    <div className="holographic-panel glass-panel px-6 py-4 rounded-xl shadow-2xl relative">
      {/* Corner glows */}
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <div className="relative z-10 space-y-3">
        {/* Connect Button */}
        <div className="flex justify-end">
          <ConnectButton />
        </div>

        {/* Wallet Info */}
        {address && (
          <div className="space-y-2 text-right font-electro text-sm">
            <div className="flex items-center justify-end gap-2">
              <span className="text-gray-400">Wallet:</span>
              <span className="text-cyan-400 font-mono alien-code">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-gray-400">ETH:</span>
              <span className="text-green-400 font-bold alien-code">
                {ethBalance?.formatted ? parseFloat(ethBalance.formatted).toFixed(4) : "0"} {ethBalance?.symbol ?? ""}
              </span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-gray-400">WETH:</span>
              <span className="text-purple-400 font-bold alien-code">
                {wethBalance?.formatted ? parseFloat(wethBalance.formatted).toFixed(4) : "0"} {wethBalance?.symbol ?? ""}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
