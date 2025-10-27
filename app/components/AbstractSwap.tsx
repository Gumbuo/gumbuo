"use client";
import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { formatEther, parseEther } from "viem";
import { abstract } from "@lib/wagmi-abstract";

// Uniswap V3 SwapRouter02 on Abstract Mainnet
const SWAP_ROUTER_ADDRESS = "0x7712FA47387542819d4E35A23f8116C90C18767C";

// Common token addresses on Abstract
const TOKENS = {
  ETH: {
    symbol: "ETH",
    name: "Ether",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
  },
  WETH: {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0x4200000000000000000000000000000000000006",
    decimals: 18,
  },
  GMB: {
    symbol: "GMB",
    name: "Gumbuo Token",
    address: "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0",
    decimals: 18,
  },
};

export default function AbstractSwap() {
  const { address, chain } = useAccount();
  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("GMB");
  const [amount, setAmount] = useState("");
  const [swapping, setSwapping] = useState(false);

  const { data: ethBalance } = useBalance({
    address: address,
  });

  const isOnAbstract = chain?.id === abstract.id;

  const handleSwap = async () => {
    if (!address || !isOnAbstract || !amount) return;

    setSwapping(true);

    // For now, redirect to a DEX aggregator with pre-filled values
    // In production, you'd implement actual Uniswap V3 contract calls
    const dexUrl = `https://app.uniswap.org/#/swap?chain=abstract&inputCurrency=${TOKENS[fromToken as keyof typeof TOKENS].address}&outputCurrency=${TOKENS[toToken as keyof typeof TOKENS].address}`;

    window.open(dexUrl, "_blank");

    setTimeout(() => setSwapping(false), 2000);
  };

  const openUniswap = () => {
    window.open("https://app.uniswap.org/#/swap?chain=abstract", "_blank");
  };

  const tokenList = Object.keys(TOKENS).filter(token => token !== fromToken);

  return (
    <div className="holographic-panel glass-panel p-8 rounded-2xl max-w-md mx-auto">
      {/* Corner glows */}
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-cyan-400 mb-2 font-electro holographic-text">
          🔄 Swap on Abstract
        </h2>
        <p className="text-green-400 text-sm mb-6">
          Earn XP with every swap! Powered by Uniswap V3 🦄
        </p>

        {!isOnAbstract ? (
          <div className="text-center p-6 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
            <p className="text-yellow-400 mb-4">
              ⚠️ Please switch to Abstract Chain to use the swap feature
            </p>
            <p className="text-gray-400 text-sm">
              Current chain: {chain?.name || "Not connected"}
            </p>
          </div>
        ) : (
          <>
            {/* From Token */}
            <div className="mb-4 p-4 bg-black/30 rounded-lg border border-cyan-500/30">
              <label className="text-cyan-400 text-sm mb-2 block">From</label>
              <div className="flex gap-2">
                <select
                  value={fromToken}
                  onChange={(e) => {
                    setFromToken(e.target.value);
                    if (e.target.value === toToken) {
                      setToToken(tokenList[0]);
                    }
                  }}
                  className="flex-1 bg-black/50 text-white p-3 rounded-lg border border-cyan-500/50 focus:border-cyan-400 focus:outline-none"
                >
                  {Object.entries(TOKENS).map(([key, token]) => (
                    <option key={key} value={key}>
                      {token.symbol} - {token.name}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full mt-2 bg-black/50 text-white text-2xl p-3 rounded-lg border border-cyan-500/50 focus:border-cyan-400 focus:outline-none font-mono"
              />
              {fromToken === "ETH" && ethBalance && (
                <p className="text-gray-400 text-xs mt-2">
                  Balance: {parseFloat(formatEther(ethBalance.value)).toFixed(4)} ETH
                </p>
              )}
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center my-2">
              <button
                onClick={() => {
                  const temp = fromToken;
                  setFromToken(toToken);
                  setToToken(temp);
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-full transition-all duration-300 transform hover:rotate-180"
              >
                🔄
              </button>
            </div>

            {/* To Token */}
            <div className="mb-6 p-4 bg-black/30 rounded-lg border border-purple-500/30">
              <label className="text-purple-400 text-sm mb-2 block">To</label>
              <select
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
                className="w-full bg-black/50 text-white p-3 rounded-lg border border-purple-500/50 focus:border-purple-400 focus:outline-none"
              >
                {tokenList.map((key) => {
                  const token = TOKENS[key as keyof typeof TOKENS];
                  return (
                    <option key={key} value={key}>
                      {token.symbol} - {token.name}
                    </option>
                  );
                })}
              </select>
              <div className="mt-2 text-green-400 text-2xl p-3 rounded-lg bg-green-900/20 border border-green-500/30 font-mono">
                ~{amount || "0.0"}
              </div>
            </div>

            {/* XP Info */}
            <div className="mb-4 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
              <p className="text-green-400 text-sm">
                ✨ <strong>Each swap earns Abstract XP!</strong> More swaps = more XP = bigger airdrop
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={openUniswap}
                disabled={!address || !isOnAbstract}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                🦄 Swap on Uniswap
              </button>

              <button
                onClick={() => window.open("https://app.symbiosis.finance/swap?chainIn=Abstract&chainOut=Abstract", "_blank")}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
              >
                🌊 Swap on Symbiosis
              </button>
            </div>

            {/* Contract Info */}
            <div className="mt-4 p-3 bg-black/40 rounded-lg border border-cyan-500/20">
              <p className="text-gray-400 text-xs">
                💡 Swaps are executed through verified DEX aggregators on Abstract Chain.
                Your XP is tracked automatically!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
