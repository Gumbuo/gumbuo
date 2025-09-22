import Image from "next/image";
import { ConnectButton } from "thirdweb/react";
import { client } from "./client";

export default function Page() {
  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 pb-10 container max-w-screen-lg mx-auto">
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

      {/* 🔮 Overlay content */}
      <div className="relative z-10 py-20 w-full text-green-400">
        <Header />

        {/* 🔌 Wallet Connect */}
        <div className="flex justify-center mb-10">
          <ConnectButton
            client={client}
            appMetadata={{
              name: "Gumbuo",
              url: "https://gumbuo.io",
              description: "Alien-powered token battles and staking",
              logoUrl: "/gumbuo.svg",
            }}
          />
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20 text-center text-green-400">
      <Image
        src="/gumbuo.svg"
        alt="Gumbuo Logo"
        width={150}
        height={150}
        style={{
          filter: "drop-shadow(0px 0px 24px #00ff99a8)",
        }}
      />

      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mt-6">
        Welcome to Gumbuo
      </h1>

      <p className="text-green-300 text-base max-w-xl mt-4">
        Alien-powered token battles, staking, and modular NFT utilities. Connect your wallet and enter the mothership.
      </p>
    </header>
  );
}
