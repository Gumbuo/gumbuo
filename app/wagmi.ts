import { createConfig, http } from "wagmi";
import { base, blast, arbitrum } from "wagmi/chains";
import { defineChain } from "viem";
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Define Abstract Mainnet
export const abstractMainnet = defineChain({
  id: 2741,
  name: 'Abstract',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://api.mainnet.abs.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Abstract Explorer', url: 'https://explorer.abs.xyz' },
  },
});

// Define Abstract Testnet
export const abstractTestnet = defineChain({
  id: 11124,
  name: 'Abstract Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://api.testnet.abs.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Abstract Testnet Explorer', url: 'https://explorer.testnet.abs.xyz' },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Gumbuo',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'daa01cf96f2a5031c4b1fa193752d48d',
  chains: [
    base,
    abstractMainnet,
    abstractTestnet,
    blast,
    arbitrum,
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [abstractMainnet.id]: http('https://api.mainnet.abs.xyz'),
    [abstractTestnet.id]: http('https://api.testnet.abs.xyz'),
    [blast.id]: http('https://rpc.blast.io'),
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
  },
  ssr: false,
});
