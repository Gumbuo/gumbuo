import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "TWC Guild",
  description: "Together We Can — TWC Guild. NomStead guild activity, events, and community.",
  openGraph: {
    title: "TWC Guild — Together We Can",
    description: "NomStead guild activity, events, and community.",
    url: "https://twcguild.xyz",
    siteName: "TWC Guild",
    images: [
      {
        url: "https://twcguild.xyz/images/hero.png",
        width: 600,
        height: 400,
        alt: "TWC Guild — Together We Can",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TWC Guild — Together We Can",
    description: "NomStead guild activity, events, and community.",
    images: ["https://twcguild.xyz/images/hero.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
