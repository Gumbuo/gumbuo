"use client";
import { useEffect, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { usePathname } from "next/navigation";
import { base, blast, arbitrum } from "wagmi/chains";
import { abstractMainnet } from "../wagmi";

// Map routes to their required chain IDs
const ROUTE_CHAIN_MAP: Record<string, { chainId: number; name: string }> = {
  "/base": { chainId: base.id, name: "Base" },
  "/abstract": { chainId: abstractMainnet.id, name: "Abstract" },
  "/blast": { chainId: blast.id, name: "Blast" },
  "/arbitrum": { chainId: arbitrum.id, name: "Arbitrum" },
};

export default function RouteNetworkGuard() {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    if (!isConnected || !chain || !pathname) {
      setShowPrompt(false);
      return;
    }

    const routeConfig = ROUTE_CHAIN_MAP[pathname];
    if (routeConfig && chain.id !== routeConfig.chainId) {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [chain, isConnected, pathname]);

  const handleSwitchNetwork = async () => {
    const routeConfig = ROUTE_CHAIN_MAP[pathname];
    if (!routeConfig || !switchChain) return;

    setIsSwitching(true);
    try {
      await switchChain({ chainId: routeConfig.chainId });
      console.log(`Switched to ${routeConfig.name}`);
    } catch (error) {
      console.error('Failed to switch network:', error);
      alert(`Failed to switch network. Please manually switch to ${routeConfig.name} in your wallet.`);
    } finally {
      setIsSwitching(false);
    }
  };

  if (!showPrompt || !pathname) return null;

  const routeConfig = ROUTE_CHAIN_MAP[pathname];
  if (!routeConfig) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        width: '90%',
        maxWidth: '500px'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.98), rgba(255, 69, 0, 0.98))',
          border: '4px solid #ff8c00',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 0 50px rgba(255, 140, 0, 1), inset 0 0 20px rgba(255, 255, 255, 0.2)',
          animation: 'pulse 2s ease-in-out infinite',
          textAlign: 'center'
        }}
      >
        <div style={{
          fontSize: '3rem',
          marginBottom: '16px',
          animation: 'bounce 1s ease-in-out infinite'
        }}>
          ⚠️
        </div>

        <div style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '16px',
          fontFamily: 'Orbitron, sans-serif',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
        }}>
          WRONG NETWORK!
        </div>

        <div style={{
          fontSize: '18px',
          color: '#000',
          marginBottom: '24px',
          fontFamily: 'Orbitron, sans-serif',
          lineHeight: '1.6'
        }}>
          This portal requires <strong>{routeConfig.name}</strong> network
          <br />
          <span style={{ fontSize: '14px', opacity: 0.8 }}>
            Current: {chain?.name}
          </span>
        </div>

        <button
          onClick={handleSwitchNetwork}
          disabled={isSwitching}
          style={{
            padding: '16px 32px',
            background: isSwitching
              ? 'linear-gradient(135deg, #555, #777)'
              : 'linear-gradient(135deg, #000, #333)',
            color: '#ff8c00',
            border: '3px solid #000',
            borderRadius: '12px',
            cursor: isSwitching ? 'not-allowed' : 'pointer',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 'bold',
            fontSize: '18px',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
            width: '100%',
            opacity: isSwitching ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!isSwitching) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #333, #555)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSwitching) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #000, #333)';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          {isSwitching ? '⏳ Switching...' : `🔄 Switch to ${routeConfig.name}`}
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.02);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
