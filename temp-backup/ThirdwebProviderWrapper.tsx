import { ReactNode } from "react";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface WrapperProps {
  children: Exclude<ReactNode, bigint>;
}

const queryClient = new QueryClient();

export default function ThirdwebProviderWrapper({ children }: WrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}>
        {children}
      </ThirdwebProvider>
    </QueryClientProvider>
  );
}
