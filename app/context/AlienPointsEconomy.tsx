"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AlienPointsPool {
  totalSupply: number;
  wheelPool: number;
  faucetPool: number;
  reservePool: number;
}

interface UserBalance {
  [address: string]: number;
}

interface AlienPointsContextType {
  pool: AlienPointsPool;
  getUserBalance: (address: string) => number;
  addPoints: (address: string, points: number, source: 'wheel' | 'faucet') => boolean;
  getPoolRemaining: (source: 'wheel' | 'faucet') => number;
}

const AlienPointsContext = createContext<AlienPointsContextType | undefined>(undefined);

const INITIAL_POOL: AlienPointsPool = {
  totalSupply: 350_000_000,
  wheelPool: 100_000_000,
  faucetPool: 100_000_000,
  reservePool: 150_000_000,
};

export function AlienPointsProvider({ children }: { children: ReactNode }) {
  const [pool, setPool] = useState<AlienPointsPool>(INITIAL_POOL);
  const [userBalances, setUserBalances] = useState<UserBalance>({});

  // Load from localStorage on mount
  useEffect(() => {
    const savedPool = localStorage.getItem('alienPointsPool');
    const savedBalances = localStorage.getItem('alienPointsBalances');

    if (savedPool) {
      setPool(JSON.parse(savedPool));
    }
    if (savedBalances) {
      setUserBalances(JSON.parse(savedBalances));
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('alienPointsPool', JSON.stringify(pool));
  }, [pool]);

  useEffect(() => {
    localStorage.setItem('alienPointsBalances', JSON.stringify(userBalances));
  }, [userBalances]);

  const getUserBalance = (address: string): number => {
    return userBalances[address] || 0;
  };

  const addPoints = (address: string, points: number, source: 'wheel' | 'faucet'): boolean => {
    const poolKey = source === 'wheel' ? 'wheelPool' : 'faucetPool';

    // Check if pool has enough points
    if (pool[poolKey] < points) {
      console.error(`Insufficient ${source} pool balance`);
      return false;
    }

    // Deduct from pool
    setPool(prev => ({
      ...prev,
      [poolKey]: prev[poolKey] - points,
    }));

    // Add to user balance
    setUserBalances(prev => ({
      ...prev,
      [address]: (prev[address] || 0) + points,
    }));

    return true;
  };

  const getPoolRemaining = (source: 'wheel' | 'faucet'): number => {
    return source === 'wheel' ? pool.wheelPool : pool.faucetPool;
  };

  return (
    <AlienPointsContext.Provider value={{ pool, getUserBalance, addPoints, getPoolRemaining }}>
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
