import "../globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Gumbuo - Alien Points Economy",
  description: "Join the Gumbuo alien community! Spin the wheel, claim from the drip station, and earn Alien Points!",
  icons: {
    icon: "/gumbuo.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="min-h-screen">
      <body className="min-h-screen bg-black">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
