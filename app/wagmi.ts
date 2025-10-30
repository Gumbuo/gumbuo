import { createConfig, http } from "wagmi";
import { mainnet, base, blast, arbitrum } from "wagmi/chains";
import { defineChain } from "viem";
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Define Abstract Mainnet
export const abstractMainnet = defineChain({
  id: 2741,
  name: 'Abstract',
  network: 'abstract',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://api.mainnet.abs.xyz'],
    },
    public: {
      http: ['https://api.mainnet.abs.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.abs.xyz' },
  },
});

export const config = getDefaultConfig({
  appName: 'Gumbuo',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'daa01cf96f2a5031c4b1fa193752d48d',
  chains: [
    base,
    abstractMainnet,
    blast,
    arbitrum,
    mainnet,
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [blast.id]: http(),
    [arbitrum.id]: http(),
    [abstractMainnet.id]: http('https://api.mainnet.abs.xyz'),
  },
  ssr: false,
});
