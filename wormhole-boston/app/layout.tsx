import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wormhole Boston — Internet Bully Exposure",
  description:
    "Documenting adults who target and harass children online. Public record of verified incidents.",
  openGraph: {
    title: "Wormhole Boston — Internet Bully Exposure",
    description: "Documenting adults who target and harass children online.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
