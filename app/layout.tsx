import "../globals.css";
import "./alien-animations.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Gumbuo Abstract - Alien XP Economy",
  description: "Join Gumbuo on Abstract! Battle bosses, fight aliens in the arena, and earn Abstract XP on the fastest chain!",
  icons: {
    icon: "/gumbuo.svg",
  },
  openGraph: {
    title: "Gumbuo Abstract - Alien XP Economy",
    description: "Join Gumbuo on Abstract! Battle bosses, fight aliens in the arena, and earn Abstract XP on the fastest chain!",
    url: "https://www.gumbuo.io",
    siteName: "Gumbuo Abstract Edition",
    images: [
      {
        url: "https://www.gumbuo.io/logo.png",
        width: 1024,
        height: 1536,
        alt: "Gumbuo Abstract Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gumbuo Abstract - Alien XP Economy",
    description: "Join Gumbuo on Abstract! Battle bosses, fight aliens in the arena, and earn Abstract XP on the fastest chain!",
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
          {children}
        </Providers>
      </body>
    </html>
  );
}
