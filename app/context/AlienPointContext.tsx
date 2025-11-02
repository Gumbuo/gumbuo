"use client";
import { createContext, useContext, useState, useEffect } from "react";

export type AlienPointContextType = {
  alienPoints: number;
  setAlienPoints: (value: number) => void;
};

const AlienPointContext = createContext<AlienPointContextType | null>(null);

export function AlienPointProvider({ children }: { children: React.ReactNode }) {
  // Load initial value from localStorage, default to 100
  const [alienPoints, setAlienPointsState] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("alienPoints");
      return stored ? parseInt(stored, 10) : 100;
    }
    return 100;
  });

  // Wrapper to also save to localStorage when updating
  const setAlienPoints = (value: number) => {
    setAlienPointsState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("alienPoints", value.toString());
      console.log("AlienPoints saved to localStorage:", value);
    }
  };

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
