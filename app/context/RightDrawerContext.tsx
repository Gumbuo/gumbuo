"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface RightDrawerContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleDrawer: () => void;
}

const RightDrawerContext = createContext<RightDrawerContextType | undefined>(undefined);

export function RightDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => setIsOpen(!isOpen);

  return (
    <RightDrawerContext.Provider value={{ isOpen, setIsOpen, toggleDrawer }}>
      {children}
    </RightDrawerContext.Provider>
  );
}

export function useRightDrawer() {
  const context = useContext(RightDrawerContext);
  if (context === undefined) {
    throw new Error("useRightDrawer must be used within a RightDrawerProvider");
  }
  return context;
}
