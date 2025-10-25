import "../globals.css";
import "./alien-animations.css";
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Audiowide&family=Share+Tech+Mono&family=Iceland&family=Electrolize&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-black">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
