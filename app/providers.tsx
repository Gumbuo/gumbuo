"use client";
import "@rainbow-me/rainbowkit/styles.css";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlienPointsProvider } from "./context/AlienPointsEconomy";
import { AlienPointProvider } from "./context/AlienPointContext";
import { config } from "./wagmi";
import AlienLoader from "./components/AlienLoader";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loader for at least 1.5 seconds for the effect
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider showRecentTransactions={true}>
          <AlienPointsProvider>
            <AlienPointProvider>
              {isLoading && <AlienLoader />}
              {children}
            </AlienPointProvider>
          </AlienPointsProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
