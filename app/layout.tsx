import "../globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="min-h-screen">
      <body className="min-h-screen bg-black">
        {children}
      </body>
    </html>
  );
}
