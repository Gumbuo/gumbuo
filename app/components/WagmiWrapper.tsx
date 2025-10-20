"use client";
import { WagmiProvider } from "wagmi";
import { config } from "../wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { AlienPointProvider } from "../context/AlienPointContext";


const queryClient = new QueryClient();

export default function WagmiWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider>
          <AlienPointProvider>
            
            {children}
          </AlienPointProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
