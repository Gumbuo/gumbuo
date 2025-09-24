"use client";

import { ThirdwebProvider, ConnectWallet } from "@thirdweb-dev/react";
import { wallets } from "../src/wallets"; // ✅ wallets.ts in /src
import { client } from "../client"; // ✅ client.ts in /gumbuo-site

export default function Page() {
  return (
    <ThirdwebProvider client={client} supportedWallets={wallets}>
      <main className="p-4 pb-10 min-h-screen flex items-center justify-center container max-w-screen-lg mx-auto relative">
        {/* 👽 Alien video background */}
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

          {/* 🔌 Wallet Connect */}
          <div className="flex justify-center mb-10">
            <ConnectWallet />
          </div>
        </div>
      </main>
    </ThirdwebProvider>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20">
      <img
        src="/gumbuo.svg"
        alt="Gumbuo Logo"
        className="size-[150px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #a726a9a8)",
        }}
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
