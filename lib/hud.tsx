"use client";
import { useAccount, useBalance } from "wagmi";
import { useAlienPoints } from "../app/context/AlienPointsEconomy";
import { useEffect, useState } from "react";

const GMB_TOKEN_ADDRESS = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";

export function AlienHUD() {
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { data: gmbBalance } = useBalance({
    address,
    token: GMB_TOKEN_ADDRESS as `0x${string}`
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
          <p><strong>Wallet:</strong> {address}</p>
          <p><strong>ETH:</strong> {ethBalance?.formatted} {ethBalance?.symbol}</p>
          <p><strong>GMB:</strong> {gmbBalance?.formatted ? `${parseFloat(gmbBalance.formatted).toFixed(2)} ${gmbBalance.symbol}` : 'Loading...'}</p>
          <p><strong>AlienPoints:</strong> <span className="text-2xl font-bold">{alienPoints.toLocaleString()}</span> AP 👽</p>
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
