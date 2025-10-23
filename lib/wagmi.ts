import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Gumbuo",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "daa01cf96f2a5031c4b1fa193752d48d",
  chains: [base],
});
