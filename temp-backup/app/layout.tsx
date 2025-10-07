import type { Metadata } from "next";
  const safeChildren = typeof children === "bigint" ? String(children) : children as React.ReactNode;

import type { Metadata } from "next";

import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

import "../globals.css";
import Providers from "./providers"; // ✅ shared client wrapper

export const metadata: Metadata = {
  title: "Gumbuo.io",
  description: "Alien-powered token battles, staking, and modular NFT utilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased`}>
        <Providers>
          {safeChildren}
        </Providers>
      </body>
    </html>
  );
}

