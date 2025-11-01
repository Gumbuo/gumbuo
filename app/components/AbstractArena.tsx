"use client";
import { useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useCosmicSound } from "../hooks/useCosmicSound";
import { useArenaContract, ALIEN_TYPES, MINT_FEE, ENTRY_FEE, type AlienType } from "../hooks/useArenaContract";
import NFTCollection from "./NFTCollection";

export default function AbstractArena() {
  const { address, isConnected, chain } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { playSound } = useCosmicSound();

  // Debug logging (commented out to prevent infinite loop)
  // console.log('🔍 AbstractArena - Chain Info:', {
  //   chainId,
  //   chainFromAccount: chain?.id,
  //   chainName: chain?.name,
  //   isConnected,
  //   address
  // });

  const {
    NFT_CONTRACT,
    ARENA_CONTRACT,
    totalBattles,
    hasQueuedFighter,
    queuedFighter,
    nftBalance,
    mintFighter,
    enterArena,
    cancelQueue,
    refetchBalance,
    refetchQueue,
  } = useArenaContract();

  const [selectedAlienType, setSelectedAlienType] = useState<AlienType>('nyx');
  const [isMinting, setIsMinting] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [selectedNFTTokenId, setSelectedNFTTokenId] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Check if on Abstract network (testnet OR mainnet)
  // Note: Arena contracts are deployed on TESTNET (11124), so only testnet will work for minting/battles
  const isOnAbstract = chainId === 11124 || chainId === 2741;
  const isCorrectNetwork = chainId === 11124; // Contracts on testnet
  const networkName = chainId === 11124 ? 'Abstract Testnet' : chainId === 2741 ? 'Abstract Mainnet' : 'Unknown';

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: 11124 }); // Switch to Abstract testnet
      playSound('success');
    } catch (error: any) {
      console.error('Failed to switch network:', error);

      // If network doesn't exist in MetaMask, add it
      if (error.code === 4902 || error.message?.includes('Unrecognized chain')) {
        try {
          await window.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2B74', // 11124 in hex
              chainName: 'Abstract Testnet',
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://api.testnet.abs.xyz'],
              blockExplorerUrls: ['https://explorer.testnet.abs.xyz'],
            }],
          });
          playSound('success');
        } catch (addError) {
          console.error('Failed to add network:', addError);
          playSound('error');
          alert('Failed to add Abstract Testnet to MetaMask. Please add it manually.');
        }
      } else {
        playSound('error');
        alert('Failed to switch network. Please try again.');
      }
    }
  };

  const handleMint = async () => {
    console.log('=== MINT DEBUG START ===');
    console.log('Connected:', isConnected);
    console.log('Address:', address);
    console.log('Chain ID:', chainId);
    console.log('Correct Network:', isCorrectNetwork);
    console.log('Selected Alien:', selectedAlienType);

    if (!isConnected) {
      alert('❌ Please connect your wallet first');
      return;
    }

    if (!isCorrectNetwork) {
      alert(`❌ Wrong Network!\n\nYou are on chain ${chainId}\nPlease switch to Abstract Testnet (chain 11124)`);
      return;
    }

    setIsMinting(true);
    playSound('click');

    try {
      console.log('Calling mintFighter with:', selectedAlienType);
      const result = await mintFighter(selectedAlienType);
      console.log('Mint result:', result);

      if (result.success) {
        playSound('success');
        const explorerUrl = chainId === 11124
          ? `https://explorer.testnet.abs.xyz/tx/${result.hash}`
          : `https://explorer.abs.xyz/tx/${result.hash}`;

        alert(`✅ ${selectedAlienType.toUpperCase()} fighter minted!\n\nTransaction: ${result.hash}\n\nView on explorer: ${explorerUrl}\n\nRefreshing balance...`);

        console.log('Transaction hash:', result.hash);
        console.log('Explorer URL:', explorerUrl);

        // Refetch balance multiple times to ensure it updates
        setTimeout(() => {
          console.log('Refetching balance (1s)');
          refetchBalance();
        }, 1000);
        setTimeout(() => {
          console.log('Refetching balance (3s)');
          refetchBalance();
        }, 3000);
        setTimeout(() => {
          console.log('Refetching balance (5s)');
          refetchBalance();
        }, 5000);
        setTimeout(() => {
          console.log('Refetching balance (10s)');
          refetchBalance();
        }, 10000);
      } else {
        playSound('error');
        console.error('❌ MINT FAILED:', result.error);
        alert(`❌ Mint failed: ${result.error}`);
      }
    } catch (error: any) {
      playSound('error');
      console.error('❌ MINT ERROR:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        data: error.data,
        reason: error.reason,
      });
      alert(`❌ Mint failed: ${error.message || error.reason || 'Unknown error'}`);
    } finally {
      console.log('=== MINT DEBUG END ===');
      setIsMinting(false);
    }
  };

  const handleEnterArena = async (tokenIdOverride?: number) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!isCorrectNetwork) {
      alert('Please switch to Abstract network');
      return;
    }

    if (nftBalance === 0) {
      alert('You need to mint a fighter first!');
      return;
    }

    // Use the selected NFT token ID, or fallback to 0
    const tokenId = tokenIdOverride ?? selectedNFTTokenId ?? 0;

    if (selectedNFTTokenId === null && tokenIdOverride === undefined) {
      alert('⚠️ Please select a fighter from your collection first!\n\nClick on a fighter or drag & drop it into the arena.');
      return;
    }

    setIsEntering(true);
    playSound('click');

    try {
      const result = await enterArena(tokenId);
      if (result.success) {
        playSound('success');
        alert(`⚔️ Entered arena! Transaction: ${result.hash}\n\nWaiting for opponent...`);
        setTimeout(() => refetchQueue(), 2000);
      } else {
        playSound('error');
        alert(`❌ Arena entry failed: ${result.error}`);
      }
    } catch (error: any) {
      playSound('error');
      alert(`❌ Arena entry failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsEntering(false);
    }
  };

  const handleCancelQueue = async () => {
    if (!queuedFighter || queuedFighter.player.toLowerCase() !== address?.toLowerCase()) {
      alert('You are not in the queue');
      return;
    }

    playSound('click');

    try {
      const result = await cancelQueue();
      if (result.success) {
        playSound('success');
        alert(`✅ Queue cancelled! Transaction: ${result.hash}`);
        setTimeout(() => refetchQueue(), 2000);
      } else {
        playSound('error');
        alert(`❌ Cancel failed: ${result.error}`);
      }
    } catch (error: any) {
      playSound('error');
      alert(`❌ Cancel failed: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const tokenId = parseInt(e.dataTransfer.getData("tokenId"));
    if (!isNaN(tokenId)) {
      setSelectedNFTTokenId(tokenId);
      playSound('success');
      // Optionally auto-enter arena with dropped NFT
      // handleEnterArena(tokenId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Calculate queue timeout (10 minutes)
  const canCancelQueue = queuedFighter &&
    queuedFighter.player.toLowerCase() === address?.toLowerCase() &&
    Date.now() / 1000 > queuedFighter.timestamp + 600; // 10 minutes

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="w-full text-center">
        <h2 className="text-5xl font-bold text-purple-400 mb-4 font-alien holographic-text">
          ⚔️ Abstract Arena - Winner Takes All ⚔️
        </h2>
        <p className="text-xl text-gray-300 mb-2">
          Real NFT battles on {networkName}! Mint fee: {MINT_FEE} ETH | Entry fee: {ENTRY_FEE} ETH
        </p>
        <p className="text-lg text-green-400 font-bold">
          🏆 Winner receives {(parseFloat(ENTRY_FEE) * 2).toFixed(7)} ETH (100% of prize pool)
        </p>
      </div>

      {/* Network Warning */}
      {!isOnAbstract && (
        <div className="w-full p-6 bg-red-900/30 border border-red-500 rounded-lg text-center">
          <p className="text-red-400 font-bold text-xl mb-4">⚠️ Wrong Network</p>
          <p className="text-gray-300 mb-4">
            Please switch to an Abstract network. Use the network switcher in your wallet (top right) to select Abstract or Abstract Testnet.
          </p>
        </div>
      )}

      {/* Testnet Warning for Mainnet Users */}
      {isOnAbstract && !isCorrectNetwork && (
        <div className="w-full p-6 bg-yellow-900/30 border border-yellow-500 rounded-lg text-center">
          <p className="text-yellow-400 font-bold text-xl mb-4">⚠️ Arena on Testnet Only</p>
          <p className="text-gray-300 mb-4">
            You're on Abstract Mainnet, but the arena contracts are deployed on Abstract Testnet. Switch to testnet to play!
          </p>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={async () => {
                try {
                  await (window as any).ethereum?.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                      chainId: '0x2B74', // 11124 in hex
                      chainName: 'Abstract Testnet',
                      nativeCurrency: {
                        name: 'Ether',
                        symbol: 'ETH',
                        decimals: 18,
                      },
                      rpcUrls: ['https://api.testnet.abs.xyz'],
                      blockExplorerUrls: ['https://explorer.testnet.abs.xyz'],
                    }],
                  });
                  playSound('success');
                } catch (error) {
                  console.error('Failed to add network:', error);
                  playSound('error');
                }
              }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all"
            >
              ➕ Add Abstract Testnet to MetaMask
            </button>
            <button
              onClick={handleSwitchNetwork}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all"
            >
              🔄 Switch to Abstract Testnet
            </button>
          </div>
        </div>
      )}

      {/* Contract Info */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/40 p-4 rounded-lg border border-cyan-500/30">
          <p className="text-cyan-400 font-bold mb-2">🎮 Total Battles</p>
          <p className="text-white text-3xl font-bold">{totalBattles}</p>
        </div>
        <div className="bg-black/40 p-4 rounded-lg border border-purple-500/30">
          <p className="text-purple-400 font-bold mb-2">👽 Your Fighters</p>
          <p className="text-white text-3xl font-bold">{nftBalance}</p>
          {nftBalance > 0 && (
            <p className="text-green-400 text-sm mt-1">✓ Ready to battle!</p>
          )}
          {nftBalance === 0 && (
            <p className="text-gray-400 text-sm mt-1">Mint fighters below</p>
          )}
          <button
            onClick={() => {
              refetchBalance();
              playSound('click');
            }}
            className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded transition-all"
          >
            🔄 Refresh
          </button>
        </div>
        <div className="bg-black/40 p-4 rounded-lg border border-orange-500/30">
          <p className="text-orange-400 font-bold mb-2">⏳ Queue Status</p>
          <p className="text-white text-xl font-bold">
            {hasQueuedFighter ? '🔴 Fighter Waiting' : '🟢 Empty'}
          </p>
        </div>
      </div>

      {/* Mint Section */}
      <div style={{borderRadius: '24px', border: '2px solid #00ff9944'}} className="w-full holographic-panel glass-panel p-8">
        <div className="corner-glow corner-glow-tl"></div>
        <div className="corner-glow corner-glow-br"></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-bold text-cyan-400 mb-6 font-alien text-center">
            👽 Mint a Fighter 👽
          </h3>

          {/* Alien Type Selection */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
            {ALIEN_TYPES.map((alienType) => (
              <button
                key={alienType}
                onClick={() => setSelectedAlienType(alienType)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  selectedAlienType === alienType
                    ? 'border-cyan-400 bg-cyan-900/50 scale-105 shadow-lg shadow-cyan-500/50'
                    : 'border-gray-600 bg-black/40 hover:border-gray-400'
                }`}
              >
                <div className="text-center flex flex-col items-center">
                  <div className="w-20 h-20 mb-1 overflow-hidden rounded-lg flex items-center justify-center bg-black/20">
                    <img
                      src={`/${alienType}.${alienType === 'j3d1' ? 'jpg' : 'png'}`}
                      alt={alienType}
                      className="max-w-full max-h-full object-contain"
                      style={{ width: '80px', height: '80px' }}
                    />
                  </div>
                  <p className="text-xs font-bold uppercase text-gray-400">{alienType}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={(e) => {
                console.log('BUTTON CLICKED!', e);
                handleMint();
              }}
              disabled={isMinting || !isConnected || !isCorrectNetwork}
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xl rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50"
            >
              {isMinting ? '⏳ Minting...' : `🎲 Mint ${selectedAlienType.toUpperCase()} (${MINT_FEE} ETH)`}
            </button>
          </div>

          {/* Debug Info */}
          <div className="mt-4 p-4 bg-black/50 rounded text-xs text-gray-400 font-mono">
            <p>Connected: {isConnected ? '✅' : '❌'}</p>
            <p>Address: {address || 'Not connected'}</p>
            <p>Chain ID (useChainId): {chainId} {chainId === 11124 ? '(Testnet ✅)' : chainId === 2741 ? '(Mainnet ⚠️ WRONG!)' : '(Unknown)'}</p>
            <p>Chain ID (useAccount): {chain?.id || 'N/A'}</p>
            <p>Chain Name: {chain?.name || 'N/A'}</p>
            <p>Correct Network: {isCorrectNetwork ? '✅' : '❌'}</p>
            <p>Minting: {isMinting ? 'Yes' : 'No'}</p>
            <p>Button Disabled: {(isMinting || !isConnected || !isCorrectNetwork) ? 'YES' : 'NO'}</p>
            {chainId === 2741 && (
              <div className="mt-3 p-2 bg-red-900/50 border border-red-500 rounded">
                <p className="text-red-400 font-bold mb-2">⚠️ WRONG NETWORK!</p>
                <p className="text-white mb-2">You're on Abstract Mainnet but contracts are on Testnet!</p>
                <button
                  onClick={handleSwitchNetwork}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded transition-all"
                >
                  🔄 Switch to Abstract Testnet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NFT Collection */}
      <div style={{borderRadius: '24px', border: '2px solid #00ff9944'}} className="w-full holographic-panel glass-panel p-8">
        <div className="corner-glow corner-glow-tl"></div>
        <div className="corner-glow corner-glow-br"></div>
        <div className="relative z-10">
          <NFTCollection onSelectNFT={setSelectedNFTTokenId} />
        </div>
      </div>

      {/* Arena Queue */}
      <div
        style={{borderRadius: '24px', border: '2px solid #00ff9944'}}
        className="w-full holographic-panel glass-panel p-8"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="corner-glow corner-glow-tl"></div>
        <div className="corner-glow corner-glow-br"></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-bold text-purple-400 mb-6 font-alien text-center">
            ⚔️ Battle Arena ⚔️
          </h3>

          {selectedNFTTokenId !== null && (
            <div className="mb-4 p-3 bg-cyan-900/30 border border-cyan-500/50 rounded-lg text-center">
              <p className="text-cyan-400 font-bold">
                ✅ Selected Fighter: Token #{selectedNFTTokenId}
              </p>
            </div>
          )}

          {hasQueuedFighter && queuedFighter ? (
            <div className={`bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg p-6 border-4 ${
              isDragOver ? 'border-cyan-400 shadow-lg shadow-cyan-500/50' : 'border-purple-400'
            }`}>
              <p className="text-purple-400 font-bold text-xl mb-4 text-center">
                🔴 Fighter in Queue
              </p>
              <div className="text-center">
                <p className="text-white font-mono text-sm mb-2">
                  Player: {queuedFighter.player.slice(0, 6)}...{queuedFighter.player.slice(-4)}
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Token ID: #{queuedFighter.tokenId}
                </p>
                <p className="text-gray-400 text-sm">
                  Queued at: {new Date(queuedFighter.timestamp * 1000).toLocaleTimeString()}
                </p>
              </div>

              {queuedFighter.player.toLowerCase() === address?.toLowerCase() ? (
                <div className="mt-4 text-center">
                  <p className="text-yellow-400 font-bold mb-2">⏳ Waiting for opponent...</p>
                  {canCancelQueue && (
                    <button
                      onClick={handleCancelQueue}
                      className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all"
                    >
                      Cancel Queue (Timeout Expired)
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => handleEnterArena()}
                    disabled={isEntering || nftBalance === 0}
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xl rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isEntering ? '⏳ Entering...' : `⚔️ Join Battle (${ENTRY_FEE} ETH)`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={`bg-black/40 rounded-lg p-8 border-4 border-dashed ${
              isDragOver ? 'border-cyan-400 bg-cyan-900/20' : 'border-gray-600'
            } text-center transition-all`}>
              <p className="text-gray-400 text-xl mb-6">
                {isDragOver ? '🎯 Drop fighter here!' : '🟢 Arena is empty'}
              </p>
              {isDragOver && (
                <p className="text-cyan-400 text-sm mb-4">
                  Release to select this fighter for battle
                </p>
              )}
              <button
                onClick={() => handleEnterArena()}
                disabled={isEntering || nftBalance === 0 || !isConnected || !isCorrectNetwork || selectedNFTTokenId === null}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xl rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50"
              >
                {isEntering ? '⏳ Entering...' : nftBalance === 0 ? '❌ Mint a fighter first' : selectedNFTTokenId === null ? '⚠️ Select a fighter' : `⚔️ Enter Arena (${ENTRY_FEE} ETH)`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="w-full bg-black/40 p-6 rounded-lg border border-cyan-500/30">
        <h3 className="text-2xl font-bold text-cyan-400 mb-4 text-center">📖 How It Works</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-bold text-white mb-2">1️⃣ Mint a Fighter</h4>
            <p className="text-gray-400 text-sm">
              Choose an alien type and mint an NFT for {MINT_FEE} ETH. Each fighter is unique and ready for battle!
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-2">2️⃣ Enter the Arena</h4>
            <p className="text-gray-400 text-sm">
              Pay {ENTRY_FEE} ETH to queue your fighter. If someone is waiting, battle starts instantly!
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-2">3️⃣ Battle!</h4>
            <p className="text-gray-400 text-sm">
              Winner is determined by deterministic randomness (50/50 odds). Fair and transparent!
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-2">4️⃣ Winner Takes All</h4>
            <p className="text-gray-400 text-sm">
              Both NFTs are burned. Winner receives {(parseFloat(ENTRY_FEE) * 2).toFixed(7)} ETH!
            </p>
          </div>
        </div>
      </div>

      {/* Contract Addresses */}
      <div className="w-full bg-black/40 p-4 rounded-lg border border-gray-600 text-center">
        <p className="text-gray-400 text-xs mb-2">Smart Contract Addresses</p>
        <div className="space-y-1">
          <p className="text-cyan-400 text-xs font-mono">NFT: {NFT_CONTRACT}</p>
          <p className="text-purple-400 text-xs font-mono">Arena: {ARENA_CONTRACT}</p>
          {address && (
            <p className="text-gray-400 text-xs font-mono mt-2">Your Wallet: {address.slice(0, 6)}...{address.slice(-4)}</p>
          )}
          <p className="text-gray-400 text-xs mt-2">Network: {networkName} ({chainId})</p>
        </div>
      </div>
    </div>
  );
}
