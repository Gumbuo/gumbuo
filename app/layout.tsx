"use client";
import "../globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { ReactNode } from "react";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlienPointsProvider } from "./context/AlienPointsEconomy";
import { config } from "../lib/wagmi";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en" className="min-h-screen">
      <body className="min-h-screen bg-black">
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={config}>
            <RainbowKitProvider>
              <AlienPointsProvider>
                {children}
              </AlienPointsProvider>
            </RainbowKitProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
