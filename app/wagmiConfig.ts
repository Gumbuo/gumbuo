import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base } from "wagmi/chains";
import { http } from "viem";

export const config = getDefaultConfig({
  appName: "Gumbuo.io",
  projectId: "gumbuo-presale",
  chains: [base],
  transports: {
    [base.id]: http("https://mainnet.infura.io/v3/YOUR_INFURA_KEY")
  }
});
