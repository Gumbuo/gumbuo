import { createConfig, http } from "wagmi";
import { injected } from "@wagmi/connectors";
import { base } from "wagmi/chains";

export const config = createConfig({
  connectors: [injected()],
  chains: [base],
  transports: {
    [base.id]: http("https://mainnet.infura.io/v3/5bb5eb93701b41c198a129689a145cde")
  },
  ssr: true,
});
