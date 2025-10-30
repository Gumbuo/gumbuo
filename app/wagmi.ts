import { createConfig, http } from "wagmi";
import { mainnet, polygon, polygonAmoy, base, baseSepolia, blast, blastSepolia, arbitrum, arbitrumSepolia, avalanche, avalancheFuji } from "wagmi/chains";
import { defineChain } from "viem";
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Define Abstract Testnet
export const abstractTestnet = defineChain({
  id: 11124,
  name: 'Abstract Testnet',
  network: 'abstract-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://api.testnet.abs.xyz'],
    },
    public: {
      http: ['https://api.testnet.abs.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.testnet.abs.xyz' },
  },
  testnet: true,
});

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
    baseSepolia,
    abstractMainnet,
    abstractTestnet,
    blast,
    blastSepolia,
    arbitrum,
    arbitrumSepolia,
    polygon,
    polygonAmoy,
    avalanche,
    avalancheFuji,
    mainnet,
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [blast.id]: http(),
    [blastSepolia.id]: http(),
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
    [avalanche.id]: http(),
    [avalancheFuji.id]: http(),
    [abstractTestnet.id]: http('https://api.testnet.abs.xyz'),
    [abstractMainnet.id]: http('https://api.mainnet.abs.xyz'),
  },
  ssr: false,
});
