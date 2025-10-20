"use client";
import { createContext, useContext, useState } from "react";

export type AlienPointContextType = {
  alienPoints: number;
  setAlienPoints: (value: number) => void;
};

const AlienPointContext = createContext<AlienPointContextType | null>(null);

export function AlienPointProvider({ children }: { children: React.ReactNode }) {
  const [alienPoints, setAlienPoints] = useState(100);

  return (
    <AlienPointContext.Provider value={{ alienPoints, setAlienPoints }}>
      {children}
    </AlienPointContext.Provider>
  );
}

export function useAlienPoints(): AlienPointContextType | null {
  const context = useContext(AlienPointContext);
  if (!context) {
    if (typeof window !== "undefined") {
      console.warn("AlienPointContext not found");
    }
    return null;
  }
  return context;
}
