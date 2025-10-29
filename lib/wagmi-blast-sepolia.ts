import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { blastSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Gumbuo Blast Sepolia",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "daa01cf96f2a5031c4b1fa193752d48d",
  chains: [blastSepolia],
});
