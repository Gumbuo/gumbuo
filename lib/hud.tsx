"use client";
import { useAccount, useBalance } from "wagmi";
import { useAlienPoints } from "../app/context/AlienPointsEconomy";
import { useEffect, useState } from "react";
import { base } from "wagmi/chains";

const GMB_TOKEN_ADDRESS_BASE = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";
const GMB_TOKEN_ADDRESS_ABSTRACT = "0x1660AA473D936029C7659e7d047F05EcF28D40c9";
const ABSTRACT_CHAIN_ID = 2741;

export function AlienHUD() {
  const { address, isConnected } = useAccount();

  // Fetch ETH balance from Base chain
  const { data: ethBalanceBase } = useBalance({
    address,
    chainId: base.id
  });

  // Fetch ETH balance from Abstract chain
  const { data: ethBalanceAbstract } = useBalance({
    address,
    chainId: ABSTRACT_CHAIN_ID
  });

  // Fetch GMB balance from Base chain
  const { data: gmbBalanceBase } = useBalance({
    address,
    chainId: base.id,
    token: GMB_TOKEN_ADDRESS_BASE as `0x${string}`
  });

  // Fetch GMB balance from Abstract chain
  const { data: gmbBalanceAbstract } = useBalance({
    address,
    chainId: ABSTRACT_CHAIN_ID,
    token: GMB_TOKEN_ADDRESS_ABSTRACT as `0x${string}`
  });

  const { getUserBalance } = useAlienPoints();
  const [alienPoints, setAlienPoints] = useState(0);

  // Update Alien Points when address changes
  useEffect(() => {
    if (address) {
      setAlienPoints(getUserBalance(address));
    }
  }, [address, getUserBalance]);

  return (
    <div className="text-green-400 text-sm border border-green-400 p-6 max-w-md">
      <h2 className="text-lg mb-2 flex items-center space-x-2">
        <img src="/zorb.png" alt="Zorb" style={{width: '24px', height: '24px', maxWidth: '24px', maxHeight: '24px', objectFit: 'cover'}} />
        <span>Alien HUD</span>
      </h2>
      {isConnected ? (
        <>
          <p className="mb-2"><strong>Wallet:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}</p>

          {/* ETH Balances */}
          <div className="mb-2">
            <p className="text-xs opacity-75 mb-1">💎 ETH Holdings:</p>
            <p className="ml-2 text-blue-300">
              <strong>Base:</strong> {ethBalanceBase?.formatted ? parseFloat(ethBalanceBase.formatted).toFixed(4) : '0.0000'} ETH
            </p>
            <p className="ml-2 text-purple-300">
              <strong>Abstract:</strong> {ethBalanceAbstract?.formatted ? parseFloat(ethBalanceAbstract.formatted).toFixed(4) : '0.0000'} ETH
            </p>
          </div>

          {/* GMB Balances */}
          <div className="mb-2">
            <p className="text-xs opacity-75 mb-1">🪙 GMB Holdings:</p>
            <p className="ml-2 text-blue-300">
              <strong>Base:</strong> {gmbBalanceBase?.formatted ? parseFloat(gmbBalanceBase.formatted).toFixed(2) : '0.00'} GMB
            </p>
            <p className="ml-2 text-purple-300">
              <strong>Abstract:</strong> {gmbBalanceAbstract?.formatted ? parseFloat(gmbBalanceAbstract.formatted).toFixed(2) : '0.00'} GMB
            </p>
          </div>

          {/* Alien Points */}
          <div className="mt-3 pt-2 border-t border-green-400/30">
            <p><strong>AlienPoints:</strong> <span className="text-2xl font-bold text-cyan-300">{alienPoints.toLocaleString()}</span> AP 👽</p>
          </div>
        </>
      ) : (
        <p className="flex items-center space-x-2">
          <img src="/zorb.png" alt="Zorb" style={{width: '20px', height: '20px', maxWidth: '20px', maxHeight: '20px', objectFit: 'cover'}} />
          <span>Wallet not connected</span>
        </p>
      )}
    </div>
  );
}
