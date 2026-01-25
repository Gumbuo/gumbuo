"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AlienPointsPool {
  totalSupply: number;
  wheelPool: number;
  faucetPool: number;
  reservePool: number;
  marketplacePool: number;
  bossPool: number;
  stakingPool: number;
  totalDistributed: number;
}

interface AlienPointsContextType {
  pool: AlienPointsPool;
  userBalances: Record<string, number>;
  getUserBalance: (address: string) => number;
  addPoints: (address: string, points: number, source: 'wheel' | 'faucet' | 'arena' | 'boss' | 'staking') => Promise<boolean>;
  spendPoints: (address: string, points: number, itemName: string) => Promise<boolean>;
  getPoolRemaining: (source: 'wheel' | 'faucet' | 'boss' | 'staking') => number;
  refreshPool: () => Promise<void>;
}

const AlienPointsContext = createContext<AlienPointsContextType | undefined>(undefined);

const INITIAL_POOL: AlienPointsPool = {
  totalSupply: 550_000_000,
  wheelPool: 100_000_000,
  faucetPool: 100_000_000,
  reservePool: 150_000_000,
  marketplacePool: 0,
  bossPool: 100_000_000,
  stakingPool: 100_000_000,
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
    // Refresh pool every 5 minutes (reduced from 60s to save Redis requests)
    const interval = setInterval(refreshPool, 300000);
    return () => clearInterval(interval);
  }, []);

  const getUserBalance = (address: string): number => {
    const balance = userBalances[address.toLowerCase()];

    // If balance not loaded yet, fetch it from API
    if (balance === undefined && address) {
      fetchUserBalance(address);
      return 0; // Return 0 temporarily while fetching
    }

    return balance || 0;
  };

  const fetchUserBalance = async (address: string) => {
    try {
      const response = await fetch(`/api/points?wallet=${address}`);
      const data = await response.json();
      if (data.success) {
        setUserBalances(prev => ({
          ...prev,
          [address.toLowerCase()]: data.userBalance,
        }));
      }
    } catch (error) {
      console.error("Error fetching user balance:", error);
    }
  };

  const addPoints = async (address: string, points: number, source: 'wheel' | 'faucet' | 'arena' | 'boss' | 'staking'): Promise<boolean> => {
    try {
      console.log('💰 [AlienPointsEconomy] addPoints called:', { address, points, source });

      const response = await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address, points, source }),
      });

      const data = await response.json();
      console.log('📦 [AlienPointsEconomy] API response:', data);

      if (data.success) {
        console.log('✅ [AlienPointsEconomy] Updating userBalances:', {
          address: address.toLowerCase(),
          newBalance: data.userBalance,
          previousBalance: userBalances[address.toLowerCase()]
        });

        // Update local state
        setPool(data.pool);
        setUserBalances(prev => {
          const updated = {
            ...prev,
            [address.toLowerCase()]: data.userBalance,
          };
          console.log('🔄 [AlienPointsEconomy] UserBalances updated from', prev, 'to', updated);
          return updated;
        });
        return true;
      } else {
        console.error("❌ Failed to add points:", data.error);
        return false;
      }
    } catch (error) {
      console.error("❌ Error adding points:", error);
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

  const getPoolRemaining = (source: 'wheel' | 'faucet' | 'boss' | 'staking'): number => {
    if (source === 'wheel') return pool.wheelPool;
    if (source === 'faucet') return pool.faucetPool;
    if (source === 'staking') return pool.stakingPool;
    return pool.bossPool;
  };

  return (
    <AlienPointsContext.Provider value={{ pool, userBalances, getUserBalance, addPoints, spendPoints, getPoolRemaining, refreshPool }}>
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
