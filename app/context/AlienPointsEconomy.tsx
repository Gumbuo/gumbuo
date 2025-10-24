"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AlienPointsPool {
  totalSupply: number;
  wheelPool: number;
  faucetPool: number;
  reservePool: number;
  marketplacePool: number;
  totalDistributed: number;
}

interface AlienPointsContextType {
  pool: AlienPointsPool;
  getUserBalance: (address: string) => number;
  addPoints: (address: string, points: number, source: 'wheel' | 'faucet' | 'arena') => Promise<boolean>;
  spendPoints: (address: string, points: number, itemName: string) => Promise<boolean>;
  getPoolRemaining: (source: 'wheel' | 'faucet') => number;
  refreshPool: () => Promise<void>;
}

const AlienPointsContext = createContext<AlienPointsContextType | undefined>(undefined);

const INITIAL_POOL: AlienPointsPool = {
  totalSupply: 350_000_000,
  wheelPool: 100_000_000,
  faucetPool: 100_000_000,
  reservePool: 150_000_000,
  marketplacePool: 0,
  totalDistributed: 0,
};

export function AlienPointsProvider({ children }: { children: ReactNode }) {
  const [pool, setPool] = useState<AlienPointsPool>(INITIAL_POOL);
  const [userBalances, setUserBalances] = useState<Record<string, number>>({});

  // Fetch pool from API on mount
  const refreshPool = async () => {
    try {
      const response = await fetch('/api/points');
      const data = await response.json();
      if (data.success) {
        setPool(data.pool);
      }
    } catch (error) {
      console.error("Error fetching pool:", error);
    }
  };

  useEffect(() => {
    refreshPool();
    // Refresh pool every 30 seconds to stay in sync
    const interval = setInterval(refreshPool, 30000);
    return () => clearInterval(interval);
  }, []);

  const getUserBalance = (address: string): number => {
    return userBalances[address.toLowerCase()] || 0;
  };

  const addPoints = async (address: string, points: number, source: 'wheel' | 'faucet' | 'arena'): Promise<boolean> => {
    try {
      const response = await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address, points, source }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setPool(data.pool);
        setUserBalances(prev => ({
          ...prev,
          [address.toLowerCase()]: data.userBalance,
        }));
        return true;
      } else {
        console.error("Failed to add points:", data.error);
        return false;
      }
    } catch (error) {
      console.error("Error adding points:", error);
      return false;
    }
  };

  const spendPoints = async (address: string, points: number, itemName: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/points', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address, points, itemName }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setPool(data.pool);
        setUserBalances(prev => ({
          ...prev,
          [address.toLowerCase()]: data.userBalance,
        }));
        return true;
      } else {
        console.error("Failed to spend points:", data.error);
        return false;
      }
    } catch (error) {
      console.error("Error spending points:", error);
      return false;
    }
  };

  const getPoolRemaining = (source: 'wheel' | 'faucet'): number => {
    return source === 'wheel' ? pool.wheelPool : pool.faucetPool;
  };

  return (
    <AlienPointsContext.Provider value={{ pool, getUserBalance, addPoints, spendPoints, getPoolRemaining, refreshPool }}>
      {children}
    </AlienPointsContext.Provider>
  );
}

export function useAlienPoints() {
  const context = useContext(AlienPointsContext);
  if (!context) {
    throw new Error('useAlienPoints must be used within AlienPointsProvider');
  }
  return context;
}
