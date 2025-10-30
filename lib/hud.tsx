"use client";
import { useAccount, useBalance } from "wagmi";
import { useAlienPoints } from "../app/context/AlienPointsEconomy";
import { useEffect, useState } from "react";
import { base, blast, arbitrum } from "wagmi/chains";

const GMB_TOKEN_ADDRESS_BASE = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";
const GMB_TOKEN_ADDRESS_ABSTRACT = "0x1660AA473D936029C7659e7d047F05EcF28D40c9";
// const GMB_TOKEN_ADDRESS_BLAST = "0x..."; // TODO: Add when Blast GMB token is deployed
const ABSTRACT_CHAIN_ID = 2741;
const ABSTRACT_TESTNET_CHAIN_ID = 11124;

export function AlienHUD() {
  const { address, isConnected } = useAccount();
  const [isExpanded, setIsExpanded] = useState(true);

  // Mainnet ETH balances
  const { data: ethBalanceBase } = useBalance({
    address,
    chainId: base.id
  });

  const { data: ethBalanceAbstract } = useBalance({
    address,
    chainId: ABSTRACT_CHAIN_ID
  });

  const { data: ethBalanceBlast } = useBalance({
    address,
    chainId: blast.id
  });

  const { data: ethBalanceArbitrum } = useBalance({
    address,
    chainId: arbitrum.id
  });

  const { data: gmbBalanceBase } = useBalance({
    address,
    chainId: base.id,
    token: GMB_TOKEN_ADDRESS_BASE as `0x${string}`
  });

  const { data: gmbBalanceAbstract } = useBalance({
    address,
    chainId: ABSTRACT_CHAIN_ID,
    token: GMB_TOKEN_ADDRESS_ABSTRACT as `0x${string}`
  });

  // TODO: Uncomment when Blast GMB token is deployed
  // const { data: gmbBalanceBlast } = useBalance({
  //   address,
  //   chainId: blast.id,
  //   token: GMB_TOKEN_ADDRESS_BLAST as `0x${string}`
  // });

  const { getUserBalance } = useAlienPoints();
  const [alienPoints, setAlienPoints] = useState(0);

  useEffect(() => {
    if (address) {
      setAlienPoints(getUserBalance(address));
    }
  }, [address, getUserBalance]);

  if (!isConnected) {
    return (
      <div className="holographic-panel glass-panel p-4 rounded-xl shadow-2xl max-w-md relative">
        <div className="corner-glow corner-glow-tl"></div>
        <div className="corner-glow corner-glow-tr"></div>
        <div className="corner-glow corner-glow-bl"></div>
        <div className="corner-glow corner-glow-br"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-400">
              <img src="/zorb.png" alt="Zorb" style={{width: '20px', height: '20px'}} className="rounded-full" />
              <span>Wallet not connected</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="holographic-panel glass-panel p-4 rounded-xl shadow-2xl max-w-md relative">
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg flex items-center space-x-2 font-electro">
            <img src="/zorb.png" alt="Zorb" style={{width: '24px', height: '24px'}} className="rounded-full alien-float" />
            <span className="holographic-text">Alien HUD</span>
          </h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-bold px-3 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30"
          >
            {isExpanded ? '▲ Hide' : '▼ Show'}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-3 text-sm">
            <p className="text-gray-400">
              <strong className="text-cyan-400">Wallet:</strong>{" "}
              <span className="font-mono alien-code">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </p>

            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">💎 MAINNET BALANCES:</p>
              <div className="ml-3 space-y-1">
                <p className="text-blue-400 alien-code">
                  <strong>Base:</strong> {ethBalanceBase?.formatted ? parseFloat(ethBalanceBase.formatted).toFixed(4) : '0.0000'} ETH
                </p>
                <p className="text-purple-400 alien-code">
                  <strong>Abstract:</strong> {ethBalanceAbstract?.formatted ? parseFloat(ethBalanceAbstract.formatted).toFixed(4) : '0.0000'} ETH
                </p>
                <p className="text-yellow-400 alien-code">
                  <strong>Blast:</strong> {ethBalanceBlast?.formatted ? parseFloat(ethBalanceBlast.formatted).toFixed(4) : '0.0000'} ETH
                </p>
                <p className="text-orange-400 alien-code">
                  <strong>Arbitrum:</strong> {ethBalanceArbitrum?.formatted ? parseFloat(ethBalanceArbitrum.formatted).toFixed(4) : '0.0000'} ETH
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">🪙 GMB Holdings:</p>
              <div className="ml-3 space-y-1">
                <p className="text-blue-400 alien-code">
                  <strong>Base:</strong> {gmbBalanceBase?.formatted ? parseFloat(gmbBalanceBase.formatted).toFixed(2) : '0.00'} GMB
                </p>
                <p className="text-purple-400 alien-code">
                  <strong>Abstract:</strong> {gmbBalanceAbstract?.formatted ? parseFloat(gmbBalanceAbstract.formatted).toFixed(2) : '0.00'} GMB
                </p>
                {/* TODO: Uncomment when Blast GMB token is deployed */}
                {/* <p className="text-yellow-400 alien-code">
                  <strong>Blast:</strong> {gmbBalanceBlast?.formatted ? parseFloat(gmbBalanceBlast.formatted).toFixed(2) : '0.00'} GMB
                </p> */}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-cyan-500/30">
              <p className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold">AlienPoints:</span>
                <span className="text-3xl font-bold holographic-text font-alien">{alienPoints.toLocaleString()}</span>
              </p>
              <p className="text-xs text-gray-500 text-right mt-1">AP 👽</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
