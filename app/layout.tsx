
import "./globals.css";
import dynamic from "next/dynamic";
import { AlienPointProvider } from "@/context/AlienPointContext";
import HUD from "@/components/HUD";

const WagmiClientProvider = dynamic(() => import("@/components/WagmiClientProvider"), { ssr: false });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative overflow-hidden">
        <video autoPlay muted loop playsInline className="fixed top-0 left-0 w-full h-full object-cover z-0">
          <source src="/alien.mp4" type="video/mp4" />
        </video>
        <WagmiClientProvider>
          <AlienPointProvider>
            <HUD />
            <main className="relative z-10">{children}</main>
          </AlienPointProvider>
        </WagmiClientProvider>
      </body>
    </html>
  );
}
