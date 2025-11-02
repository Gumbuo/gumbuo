"use client";
import { useAccount, useBalance } from "wagmi";
import { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function WalletHUD() {
  const { address, chain } = useAccount();

  // Abstract Mainnet ETH (chain ID 2741)
  const abstractMainnetBalance = address
    ? useBalance({ address, chainId: 2741 }).data
    : undefined;

  // Abstract Testnet ETH (chain ID 11124)
  const abstractTestnetBalance = address
    ? useBalance({ address, chainId: 11124 }).data
    : undefined;

  const wethBalance = address
    ? useBalance({
        address,
        token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      }).data
    : undefined;

  useEffect(() => {
    console.log("WalletHUD mounted, address:", address);
    console.log("Chain:", chain?.name, "ID:", chain?.id);
    console.log("Abstract Mainnet balance:", abstractMainnetBalance);
    console.log("Abstract Testnet balance:", abstractTestnetBalance);
    console.log("WETH balance:", wethBalance);
  }, [address, chain, abstractMainnetBalance, abstractTestnetBalance, wethBalance]);

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
              <span className="text-gray-400">Abstract Mainnet:</span>
              <span className="text-green-400 font-bold alien-code">
                {abstractMainnetBalance?.formatted ? parseFloat(abstractMainnetBalance.formatted).toFixed(4) : "0"} ETH
              </span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-gray-400">Abstract Testnet:</span>
              <span className="text-yellow-400 font-bold alien-code">
                {abstractTestnetBalance?.formatted ? parseFloat(abstractTestnetBalance.formatted).toFixed(4) : "0"} ETH
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
