"use client";

import { useEffect, useRef } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { usePathname } from 'next/navigation';
import { base } from 'wagmi/chains';

// Route to Chain ID mapping
const ROUTE_CHAIN_MAP: Record<string, number> = {
  '/base': base.id,
};

export default function AutoChainSwitcher() {
  const pathname = usePathname();
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const lastSwitchAttempt = useRef<string>('');

  useEffect(() => {
    // Only proceed if wallet is connected
    if (!isConnected || !switchChain) return;

    // Get the target chain ID for current route
    const targetChainId = ROUTE_CHAIN_MAP[pathname];

    // If no specific chain for this route, don't switch
    if (!targetChainId) return;

    // If already on correct chain, do nothing
    if (chain?.id === targetChainId) return;

    // Prevent duplicate switch attempts for the same route
    const switchKey = `${pathname}-${targetChainId}`;
    if (lastSwitchAttempt.current === switchKey) return;

    // Attempt to switch chain
    console.log(`🔄 Auto-switching from ${chain?.name} (${chain?.id}) to chain ${targetChainId} for route ${pathname}`);

    lastSwitchAttempt.current = switchKey;

    switchChain(
      { chainId: targetChainId },
      {
        onError: (error) => {
          console.error('Failed to auto-switch chain:', error);
          // Reset so user can try again
          lastSwitchAttempt.current = '';
        },
        onSuccess: () => {
          console.log(`✅ Successfully switched to chain ${targetChainId}`);
        }
      }
    );
  }, [pathname, chain, isConnected, switchChain]);

  // This component doesn't render anything
  return null;
}
