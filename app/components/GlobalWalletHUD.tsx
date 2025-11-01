"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";
import dynamic from "next/dynamic";

const AlienHUD = dynamic(() => import("@lib/hud").then(mod => mod.AlienHUD), { ssr: false });

export default function GlobalWalletHUD() {
  const { chain } = useAccount();
  const { chains, switchChain } = useSwitchChain();

  const handleNetworkChange = async (chainId: number) => {
    console.log('Attempting to switch to chain:', chainId);
    if (!switchChain) {
      console.error('switchChain is not available');
      return;
    }

    try {
      console.log('Calling switchChain...');
      const result = await switchChain({ chainId });
      console.log('Switch successful:', result);
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
