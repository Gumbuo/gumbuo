
"use client";
import { createContext, useContext, useState } from "react";

export type AlienPointContextType = {
  alienPoints: number;
  setAlienPoints: (value: number) => void;
};

const AlienPointContext = createContext<AlienPointContextType | null>(null);

export function AlienPointProvider({ children }: { children: React.ReactNode }) {
  const [alienPoints, setAlienPoints] = useState(0);

  return (
    <AlienPointContext.Provider value={{ alienPoints, setAlienPoints }}>
      {children}
    </AlienPointContext.Provider>
  );
}
export function useAlienPoints(): AlienPointContextType {
  const context = useContext(AlienPointContext);
  if (!context) throw new Error("AlienPointContext not found");
  return context;
}
