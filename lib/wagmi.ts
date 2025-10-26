import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base } from "wagmi/chains";
import { defineChain } from "viem";

export const abstract = defineChain({
  id: 2741,
  name: "Abstract",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.mainnet.abs.xyz"] },
    public: { http: ["https://api.mainnet.abs.xyz"] },
  },
  blockExplorers: {
    default: { name: "Abstract Explorer", url: "https://explorer.abs.xyz" },
  },
});

export const config = getDefaultConfig({
  appName: "Gumbuo",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "daa01cf96f2a5031c4b1fa193752d48d",
  chains: [base, abstract],
});
