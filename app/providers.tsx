import { WagmiProvider } from "wagmi";
import { config } from "../wagmiConfig"; // or wherever your config lives

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  );
}
