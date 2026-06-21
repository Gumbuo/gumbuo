import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, immutableZkEvm } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "TWC Guild",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  chains: [immutableZkEvm, base],
  ssr: true,
});
