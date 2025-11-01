import "../../globals.css";
import "../alien-animations.css";
import type { ReactNode } from "react";
import { Providers } from "../providers";

// Custom layout for maze route - excludes GlobalChat and GlobalMusicPlayer
// This prevents duplicate chat when loaded in iframe from /base
export default function MazeLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}
