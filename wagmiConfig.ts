import { createConfig } from "wagmi";
import { injected } from "@wagmi/connectors";
import { http } from "viem";
import { mainnet } from "wagmi/chains";

export const config = createConfig({
  chains: [mainnet],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [mainnet.id]: http("https://mainnet.infura.io/v3/YOUR_INFURA_KEY")
  }
});
