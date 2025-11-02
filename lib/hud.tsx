"use client";
import { useAccount, useBalance } from "wagmi";
import { useAlienPoints as useAlienPointsEconomy } from "../app/context/AlienPointsEconomy";
import { useAlienPoints as useAlienPointsSimple } from "../app/context/AlienPointContext";
import { useEffect, useState } from "react";
import { base, blast, arbitrum } from "wagmi/chains";

const GMB_TOKEN_ADDRESS_BASE = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";
const GMB_TOKEN_ADDRESS_ABSTRACT = "0x1660AA473D936029C7659e7d047F05EcF28D40c9";
// const GMB_TOKEN_ADDRESS_BLAST = "0x..."; // TODO: Add when Blast GMB token is deployed
const ABSTRACT_CHAIN_ID = 2741;
const ABSTRACT_TESTNET_CHAIN_ID = 11124;

export function AlienHUD() {
  const { address, isConnected } = useAccount();
  const [isExpanded, setIsExpanded] = useState(true);

  // Mainnet ETH balances
  const { data: ethBalanceBase } = useBalance({
    address,
    chainId: base.id
  });

  const { data: ethBalanceAbstract } = useBalance({
    address,
    chainId: ABSTRACT_CHAIN_ID
  });

  const { data: ethBalanceAbstractTestnet } = useBalance({
    address,
    chainId: ABSTRACT_TESTNET_CHAIN_ID
  });

  const { data: ethBalanceBlast } = useBalance({
    address,
    chainId: blast.id
  });

  const { data: ethBalanceArbitrum } = useBalance({
    address,
    chainId: arbitrum.id
  });

  const { data: gmbBalanceBase } = useBalance({
    address,
    chainId: base.id,
    token: GMB_TOKEN_ADDRESS_BASE as `0x${string}`
  });

  const { data: gmbBalanceAbstract } = useBalance({
    address,
    chainId: ABSTRACT_CHAIN_ID,
    token: GMB_TOKEN_ADDRESS_ABSTRACT as `0x${string}`
  });

  // TODO: Uncomment when Blast GMB token is deployed
  // const { data: gmbBalanceBlast } = useBalance({
  //   address,
  //   chainId: blast.id,
  //   token: GMB_TOKEN_ADDRESS_BLAST as `0x${string}`
  // });

  const { getUserBalance } = useAlienPointsEconomy();
  const alienPointsSimple = useAlienPointsSimple();
  const [alienPoints, setAlienPoints] = useState(0);

  // Use simple context if available (for maze rewards), otherwise use economy context
  useEffect(() => {
    if (alienPointsSimple && alienPointsSimple.alienPoints !== undefined) {
      console.log("HUD updating from simple context:", alienPointsSimple.alienPoints);
      setAlienPoints(alienPointsSimple.alienPoints);
    } else if (address) {
      const balance = getUserBalance(address);
      console.log("HUD updating from economy context:", balance);
      setAlienPoints(balance);
    }
  }, [address, getUserBalance, alienPointsSimple?.alienPoints]); // Watch the actual value!

  useEffect(() => {
    console.log("Abstract Mainnet Balance:", ethBalanceAbstract);
    console.log("Abstract Testnet Balance:", ethBalanceAbstractTestnet);
  }, [ethBalanceAbstract, ethBalanceAbstractTestnet]);

  // Add token to MetaMask with chain switching
  const addTokenToMetaMask = async (tokenAddress: string, symbol: string, decimals: number, chainName: string, chainId?: number) => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        // Switch to correct chain first if chainId is provided
        if (chainId) {
          try {
            await (window as any).ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${chainId.toString(16)}` }],
            });
          } catch (switchError: any) {
            // Chain not added to wallet, try adding it
            if (switchError.code === 4902) {
              alert(`Please add the ${chainName} network to your wallet first, then try again.`);
              return;
            }
            throw switchError;
          }
        }

        await (window as any).ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: tokenAddress,
              symbol: symbol,
              decimals: decimals,
            },
          },
        });
        alert(`✅ ${symbol} token on ${chainName} added to MetaMask!`);
      } else {
        alert('MetaMask is not installed');
      }
    } catch (error) {
      console.error('Error adding token:', error);
      alert('Failed to add token to MetaMask');
    }
  };

  if (!isConnected) {
    return (
      <div style={{
        borderRadius: '8px',
        border: '2px solid #00ff9944'
      }} className="holographic-panel glass-panel p-4 shadow-2xl max-w-md relative">
        <div className="corner-glow corner-glow-tl"></div>
        <div className="corner-glow corner-glow-tr"></div>
        <div className="corner-glow corner-glow-bl"></div>
        <div className="corner-glow corner-glow-br"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-400">
              <img src="/zorb.png" alt="Zorb" style={{width: '20px', height: '20px'}} className="rounded-full" />
              <span>Wallet not connected</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: '8px',
      border: '2px solid #00ff9944'
    }} className="holographic-panel glass-panel p-4 shadow-2xl max-w-md relative">
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg flex items-center space-x-2 font-electro">
            <img src="/zorb.png" alt="Zorb" style={{width: '24px', height: '24px'}} className="rounded-full alien-float" />
            <span className="holographic-text">Alien HUD</span>
          </h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-bold px-3 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30"
          >
            {isExpanded ? '▲ Hide' : '▼ Show'}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-3 text-sm">
            <p className="text-gray-400">
              <strong className="text-cyan-400">Wallet:</strong>{" "}
              <span className="font-mono alien-code">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </p>

            {/* Mainnet Balances - Only show chains with balance > 0 */}
            {(parseFloat(ethBalanceBase?.formatted || '0') > 0 ||
              parseFloat(ethBalanceAbstract?.formatted || '0') > 0 ||
              parseFloat(ethBalanceBlast?.formatted || '0') > 0 ||
              parseFloat(ethBalanceArbitrum?.formatted || '0') > 0) && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">💎 MAINNET BALANCES:</p>
                <div className="ml-3 space-y-1">
                  {parseFloat(ethBalanceBase?.formatted || '0') > 0 && (
                    <p className="text-blue-400 alien-code">
                      <strong>Base:</strong> {parseFloat(ethBalanceBase.formatted).toFixed(4)} ETH
                    </p>
                  )}
                  {parseFloat(ethBalanceAbstract?.formatted || '0') > 0 && (
                    <p className="text-purple-400 alien-code">
                      <strong>Abstract:</strong> {parseFloat(ethBalanceAbstract.formatted).toFixed(4)} ETH
                    </p>
                  )}
                  {parseFloat(ethBalanceBlast?.formatted || '0') > 0 && (
                    <p className="text-yellow-400 alien-code">
                      <strong>Blast:</strong> {parseFloat(ethBalanceBlast.formatted).toFixed(4)} ETH
                    </p>
                  )}
                  {parseFloat(ethBalanceArbitrum?.formatted || '0') > 0 && (
                    <p className="text-orange-400 alien-code">
                      <strong>Arbitrum:</strong> {parseFloat(ethBalanceArbitrum.formatted).toFixed(4)} ETH
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Testnet Balances - Only show chains with balance > 0 */}
            {parseFloat(ethBalanceAbstractTestnet?.formatted || '0') > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">🧪 TESTNET BALANCES:</p>
                <div className="ml-3 space-y-1">
                  <p className="text-pink-400 alien-code">
                    <strong>Abstract Testnet:</strong> {parseFloat(ethBalanceAbstractTestnet.formatted).toFixed(4)} ETH
                  </p>
                </div>
              </div>
            )}

            {/* GMB Holdings - Only show chains with balance > 0 */}
            {(parseFloat(gmbBalanceBase?.formatted || '0') > 0 ||
              parseFloat(gmbBalanceAbstract?.formatted || '0') > 0) && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">🪙 GMB Holdings:</p>
                <div className="ml-3 space-y-1">
                  {parseFloat(gmbBalanceBase?.formatted || '0') > 0 && (
                    <p className="text-blue-400 alien-code">
                      <strong>Base:</strong> {parseFloat(gmbBalanceBase.formatted).toFixed(2)} GMB
                    </p>
                  )}
                  {parseFloat(gmbBalanceAbstract?.formatted || '0') > 0 && (
                    <p className="text-purple-400 alien-code">
                      <strong>Abstract:</strong> {parseFloat(gmbBalanceAbstract.formatted).toFixed(2)} GMB
                    </p>
                  )}
                  {/* TODO: Uncomment when Blast GMB token is deployed */}
                  {/* <p className="text-yellow-400 alien-code">
                    <strong>Blast:</strong> {gmbBalanceBlast?.formatted ? parseFloat(gmbBalanceBlast.formatted).toFixed(2) : '0.00'} GMB
                  </p> */}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-cyan-500/30">
              <p className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold">AlienPoints:</span>
                <span className="text-3xl font-bold holographic-text font-alien">{alienPoints.toLocaleString()}</span>
              </p>
              <p className="text-xs text-gray-500 text-right mt-1">AP 👽</p>
            </div>

            {/* Add Token Buttons */}
            <div className="mt-4 pt-3 border-t border-cyan-500/30 flex flex-col items-center space-y-2">
              <button
                onClick={() => addTokenToMetaMask(GMB_TOKEN_ADDRESS_BASE, 'GMB', 18, 'Base', base.id)}
                className="w-full px-4 py-2 text-sm font-bold tracking-wider alien-button alien-button-purple text-white rounded-lg transition-all duration-300 hover:scale-105"
              >
                + Add GMB (Base)
              </button>
              <button
                onClick={() => addTokenToMetaMask(GMB_TOKEN_ADDRESS_ABSTRACT, 'GMB', 18, 'Abstract', ABSTRACT_CHAIN_ID)}
                className="w-full px-4 py-2 text-sm font-bold tracking-wider alien-button alien-button-gold text-black rounded-lg transition-all duration-300 hover:scale-105"
              >
                + Add GMB (Abstract)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
