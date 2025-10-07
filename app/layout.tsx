import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "../globals.css";
import { Providers } from "./providers"; // ✅ named import

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gumbuo.io",
  description: "Alien-powered token battles, staking, and modular NFT utilities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={`${inter.variable} antialiased`} style={{ fontFamily: "monospace" }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

