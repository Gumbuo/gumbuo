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
    <div className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg">
      <ConnectButton />
      {address && (
        <>
          <p>Wallet: {address}</p>
          <p>ETH: {ethBalance?.formatted ?? "0"} {ethBalance?.symbol ?? ""}</p>
          <p>WETH: {wethBalance?.formatted ?? "0"} {wethBalance?.symbol ?? ""}</p>
        </>
      )}
    </div>
  );
}
