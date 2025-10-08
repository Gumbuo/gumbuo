"use client";

import { ThirdwebProvider } from "@thirdweb-dev/react";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider
      activeChain="base"
      clientId="YOUR_CLIENT_ID"
    >
      {children}
    </ThirdwebProvider>
  );
}

