"use client";
import { useEffect, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { base, blast, arbitrum } from "wagmi/chains";
import { abstractMainnet } from "../wagmi";

interface NetworkSwitcherProps {
  requiredChainId: number;
  chainName: string;
}

export default function NetworkSwitcher({ requiredChainId, chainName }: NetworkSwitcherProps) {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (isConnected && chain && chain.id !== requiredChainId) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, [chain, isConnected, requiredChainId]);

  const handleSwitchNetwork = () => {
    if (switchChain) {
      switchChain({ chainId: requiredChainId });
    }
  };

  if (!showBanner || !isConnected) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: '90%',
        maxWidth: '600px'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.95), rgba(255, 69, 0, 0.95))',
          border: '3px solid #ff8c00',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 0 30px rgba(255, 140, 0, 0.8)',
          animation: 'pulse 2s ease-in-out infinite'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#000',
              marginBottom: '8px',
              fontFamily: 'Orbitron, sans-serif'
            }}>
              ⚠️ Wrong Network Detected
            </div>
            <div style={{
              fontSize: '16px',
              color: '#000',
              fontFamily: 'Orbitron, sans-serif'
            }}>
              Please switch to <strong>{chainName}</strong> to use this portal
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(0, 0, 0, 0.7)',
              marginTop: '4px',
              fontFamily: 'Orbitron, sans-serif'
            }}>
              Current network: {chain?.name}
            </div>
          </div>
          <button
            onClick={handleSwitchNetwork}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #000, #333)',
              color: '#ff8c00',
              border: '2px solid #000',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
              fontSize: '14px',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
              marginLeft: '16px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #333, #555)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 140, 0, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #000, #333)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.5)';
            }}
          >
            Switch Network
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: translateX(-50%) scale(1);
          }
          50% {
            transform: translateX(-50%) scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}

// Export chain IDs for easy import
export const CHAIN_IDS = {
  BASE: base.id,
  ABSTRACT: abstractMainnet.id,
  BLAST: blast.id,
  ARBITRUM: arbitrum.id,
} as const;

export const CHAIN_NAMES = {
  [base.id]: "Base Chain",
  [abstractMainnet.id]: "Abstract Chain",
  [blast.id]: "Blast Chain",
  [arbitrum.id]: "Arbitrum Chain",
} as const;
