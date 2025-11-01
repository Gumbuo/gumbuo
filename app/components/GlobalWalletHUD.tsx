"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";
import { useEffect } from "react";
import dynamic from "next/dynamic";

const AlienHUD = dynamic(() => import("@lib/hud").then(mod => mod.AlienHUD), { ssr: false });

export default function GlobalWalletHUD() {
  const { chain } = useAccount();
  const { chains, switchChain } = useSwitchChain();

  useEffect(() => {
    console.log('🔗 Chain changed:', chain?.id, chain?.name);
  }, [chain]);

  const handleNetworkChange = async (chainId: number) => {
    console.log('=== Network Switch Requested ===');
    console.log('Current chain (wagmi):', chain?.id, chain?.name);
    console.log('Target chain:', chainId);

    // Don't switch if already on this chain
    if (chain?.id === chainId) {
      console.log('Already on this chain, skipping switch');
      return;
    }

    const targetChain = chains.find(c => c.id === chainId);
    if (!targetChain) {
      console.error('Chain not found:', chainId);
      return;
    }

    console.log('Target chain details:', targetChain);

    try {
      // Use wallet's native method to switch networks
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        console.log('Using wallet_switchEthereumChain...');

        const chainIdHex = `0x${chainId.toString(16)}`;

        try {
          // Try to switch to the network
          console.log(`Calling wallet_switchEthereumChain with chainId: ${chainIdHex}`);
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainIdHex }],
          });
          console.log('✅ Successfully switched to chain:', chainId);
        } catch (switchError: any) {
          console.error('Switch error:', switchError);
          console.log('Error code:', switchError.code);

          // This error code indicates that the chain has not been added to the wallet
          if (switchError.code === 4902) {
            console.log('⚠️ Chain not in wallet, adding it...');
            try {
              const addParams = {
                chainId: chainIdHex,
                chainName: targetChain.name,
                nativeCurrency: targetChain.nativeCurrency,
                rpcUrls: [targetChain.rpcUrls.default.http[0]],
                blockExplorerUrls: targetChain.blockExplorers
                  ? [targetChain.blockExplorers.default.url]
                  : undefined,
              };
              console.log('Adding chain with params:', addParams);

              await (window as any).ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [addParams],
              });
              console.log('✅ Successfully added and switched to chain:', chainId);
            } catch (addError) {
              console.error('❌ Failed to add network:', addError);
              throw addError;
            }
          } else {
            console.error('❌ Unhandled switch error:', switchError);
            throw switchError;
          }
        }
      } else {
        console.error('window.ethereum is not available');
        alert('Please install a Web3 wallet like MetaMask');
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
      alert(`Failed to switch network: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div style={{position: 'fixed', top: '24px', right: '24px', zIndex: 1000}} className="flex flex-col items-end space-y-4">
      {/* Wallet Connect Button with Alien Styling */}
      <div style={{
        borderRadius: '8px',
        border: '2px solid #00ff9944'
      }} className="holographic-panel glass-panel p-4">
        <div className="corner-glow corner-glow-tl"></div>
        <div className="corner-glow corner-glow-tr"></div>
        <div className="corner-glow corner-glow-bl"></div>
        <div className="corner-glow corner-glow-br"></div>
        <div className="relative z-10 flex gap-2">
          <ConnectButton showBalance={false} chainStatus="none" />

          {/* Custom Network Switcher */}
          {chain && (
            <select
              value={chain.id}
              onChange={(e) => handleNetworkChange(Number(e.target.value))}
              style={{
                padding: '8px 12px',
                background: '#000',
                color: '#00ff99',
                border: '2px solid #00ff99',
                borderRadius: '8px',
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {chains.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Alien HUD */}
      <AlienHUD />
    </div>
  );
}
