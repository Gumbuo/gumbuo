import dynamic from "next/dynamic";
import { Providers } from "./providers";
import type { ReactNode } from "react";

const HUDBar = dynamic(() => import("./client/HUDBar"), { ssr: false });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="min-h-screen">
      <body className="min-h-screen overflow-hidden bg-black">
        <Providers>
          <HUDBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
