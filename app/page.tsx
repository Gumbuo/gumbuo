"use client";

import {
  ThirdwebProvider,
  ConnectWallet,
  useAddress,
  useDisconnect,
} from "@thirdweb-dev/react";
import { wallets } from "../src/wallets";

export default function Page() {
  return (
    <ThirdwebProvider clientId="gumbuo-dev" supportedWallets={wallets}>
      <WalletGate />
    </ThirdwebProvider>
  );
}

function WalletGate() {
  const address = useAddress();
  const disconnect = useDisconnect();

  return (
    <main className="p-4 pb-10 min-h-screen flex items-center justify-center container max-w-screen-lg mx-auto relative">
      <video
        autoPlay
        muted
        loop
        playsInline
        id="gumbuo-bg"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/alien.mp4" type="video/mp4" />
      </video>

      <div className="py-20 z-10 relative w-full">
        <Header />
        <div className="flex justify-center mb-10">
          <ConnectWallet />
        </div>
        <div className="text-center text-zinc-300">
          {address ? (
            <>
              <p>?? Connected as <span className="text-green-400 font-mono">{address}</span></p>
              <button
                onClick={disconnect}
                className="mt-4 px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700"
              >
                Disconnect
              </button>
            </>
          ) : (
            "Connect your wallet to enter."
          )}
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20">
      <img
        src="/gumbuo.svg"
        alt="Gumbuo Logo"
        className="size-[150px]"
        style={{ filter: "drop-shadow(0px 0px 24px #a726a9a8)" }}
      />
      <h1 className="text-4xl md:text-6xl font-bold text-green-400 tracking-tight text-center">
        Welcome to Gumbuo
      </h1>
      <p className="text-zinc-300 text-base text-center max-w-xl mt-4">
        Alien-powered token battles, staking, and modular NFT utilities. Connect your wallet and enter the mothership.
      </p>
    </header>
  );
}
