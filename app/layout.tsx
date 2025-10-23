import "../globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gumbuo - Alien Points",
  description: "Join the Gumbuo alien community and earn Alien Points!",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="min-h-screen">
      <body className="min-h-screen bg-black">
        {children}
      </body>
    </html>
  );
}
