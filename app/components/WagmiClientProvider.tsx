'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { base } from 'wagmi/chains'

const queryClient = new QueryClient()

const chains = [base] as const

const { connectors } = getDefaultWallets({
  appName: 'Gumbuo',
  projectId: 'daa01cf96f2a5031c4b1fa193752d48d', // 🔥 Hardcoded to bypass env injection issues
})

const config = createConfig({
  chains,
  connectors,
  transports: {
    [base.id]: http(),
  },
})

export default function WagmiClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
