import "../globals.css";
import "./alien-animations.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Providers } from "./providers";
import dynamic from "next/dynamic";

const IframeAwareGlobals = dynamic(() => import("./components/IframeAwareGlobals"), { ssr: false });

export const metadata: Metadata = {
  title: "Gumbuo - Alien Points Economy",
  description: "Join the Gumbuo alien community! Spin the wheel, claim from the drip station, and earn Alien Points!",
  icons: {
    icon: "/gumbuo.svg",
  },
  openGraph: {
    title: "Gumbuo - Alien Points Economy",
    description: "Join the Gumbuo alien community! Spin the wheel, claim from the drip station, and earn Alien Points!",
    url: "https://www.gumbuo.io",
    siteName: "Gumbuo",
    images: [
      {
        url: "https://www.gumbuo.io/logo.png",
        width: 1024,
        height: 1536,
        alt: "Gumbuo Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gumbuo - Alien Points Economy",
    description: "Join the Gumbuo alien community! Spin the wheel, claim from the drip station, and earn Alien Points!",
    images: ["https://www.gumbuo.io/logo.png"],
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
          <IframeAwareGlobals />
          {children}
        </Providers>
      </body>
    </html>
  );
}
