import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, keccak256, toBytes } from 'viem';

// Deployed contract addresses from .env.local
const ARENA_ADDRESS = (process.env.NEXT_PUBLIC_GUMBUO_ARENA || '0x08605178447b6E87bC6999c3DCf25Bf413E3277d') as `0x${string}`;
const NFT_ADDRESS = (process.env.NEXT_PUBLIC_GUMBUO_FIGHTER_NFT || '0x03772362A12686eC103b6B413299D04DEbfb77Af') as `0x${string}`;

// Debug: Log addresses to ensure they're loaded
if (typeof window !== 'undefined') {
  console.log('Arena Contract Address:', ARENA_ADDRESS);
  console.log('NFT Contract Address:', NFT_ADDRESS);
}

// Contract constants
export const MINT_FEE = '0.0000001'; // ETH
export const ENTRY_FEE = '0.0000002'; // ETH
export const ALIEN_TYPES = ['nyx', 'zorb', 'baob', 'apelian', 'j3d1', 'zit'] as const;
export type AlienType = typeof ALIEN_TYPES[number];

const ARENA_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"internalType": "bytes32", "name": "moveHash", "type": "bytes32"}],
    "name": "queueFighter",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cancelQueue",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getQueuedFighter",
    "outputs": [{"internalType": "address", "name": "player", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"internalType": "uint256", "name": "timestamp", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalBattles",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const NFT_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "_alienType", "type": "string"}],
    "name": "mintFighter",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export function useArenaContract() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [queueTxHash, setQueueTxHash] = useState<`0x${string}` | undefined>();
  const [cancelTxHash, setCancelTxHash] = useState<`0x${string}` | undefined>();
  const [mintTxHash, setMintTxHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isQueueConfirming } = useWaitForTransactionReceipt({ hash: queueTxHash });
  const { isLoading: isCancelConfirming } = useWaitForTransactionReceipt({ hash: cancelTxHash });
  const { isLoading: isMintConfirming } = useWaitForTransactionReceipt({ hash: mintTxHash });

  // Read queued fighter
  const { data: queuedFighterData, refetch: refetchQueue } = useReadContract({
    address: ARENA_ADDRESS,
    abi: ARENA_ABI,
    functionName: 'getQueuedFighter',
  });

  // Read user's NFT balance
  const { data: nftBalanceData, refetch: refetchBalance } = useReadContract({
    address: NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 3000, // Refetch every 3 seconds
    },
  });

  // Read total battles
  const { data: totalBattlesData } = useReadContract({
    address: ARENA_ADDRESS,
    abi: ARENA_ABI,
    functionName: 'totalBattles',
  });

  // Generate random move hash
  const generateMoveHash = useCallback(() => {
    const randomMove = Math.floor(Math.random() * 256);
    const salt = Math.floor(Math.random() * 1e18);
    const packed = toBytes(`${randomMove}-${salt}-${address}`);
    return keccak256(packed);
  }, [address]);

  // Mint fighter
  const mintFighter = useCallback(async (alienType: AlienType) => {
    try {
      console.log('Minting fighter:', {
        alienType,
        nftAddress: NFT_ADDRESS,
        mintFee: MINT_FEE,
      });

      if (!NFT_ADDRESS || NFT_ADDRESS === '0x') {
        throw new Error('NFT contract address not configured');
      }

      const hash = await writeContractAsync({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'mintFighter',
        args: [alienType],
        value: parseEther(MINT_FEE),
      });

      console.log('Mint transaction submitted:', hash);
      setMintTxHash(hash);
      return { success: true, hash };
    } catch (error: any) {
      console.error('Mint error:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }, [writeContractAsync]);

  // Enter arena
  const enterArena = useCallback(async (tokenId: number) => {
    try {
      const moveHash = generateMoveHash();
      const hash = await writeContractAsync({
        address: ARENA_ADDRESS,
        abi: ARENA_ABI,
        functionName: 'queueFighter',
        args: [BigInt(tokenId), moveHash],
        value: parseEther(ENTRY_FEE),
      });
      setQueueTxHash(hash);
      return { success: true, hash };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }, [writeContractAsync, generateMoveHash]);

  // Cancel queue
  const cancelQueue = useCallback(async () => {
    try {
      const hash = await writeContractAsync({
        address: ARENA_ADDRESS,
        abi: ARENA_ABI,
        functionName: 'cancelQueue',
      });
      setCancelTxHash(hash);
      return { success: true, hash };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }, [writeContractAsync]);

  // Process queued fighter data
  const hasQueuedFighter = queuedFighterData && queuedFighterData[0] !== '0x0000000000000000000000000000000000000000';
  const queuedFighter = hasQueuedFighter && queuedFighterData ? {
    player: queuedFighterData[0],
    tokenId: Number(queuedFighterData[1]),
    timestamp: Number(queuedFighterData[2]),
  } : null;

  return {
    // Contract addresses
    NFT_CONTRACT: NFT_ADDRESS,
    ARENA_CONTRACT: ARENA_ADDRESS,

    // Actions
    mintFighter,
    enterArena,
    cancelQueue,

    // State
    queuedFighter,
    nftBalance: nftBalanceData ? Number(nftBalanceData) : 0,
    totalBattles: totalBattlesData ? Number(totalBattlesData) : 0,
    hasQueuedFighter: !!hasQueuedFighter,

    // Loading states
    isQueueConfirming,
    isCancelConfirming,
    isMintConfirming,

    // Transaction hashes
    queueTxHash,
    cancelTxHash,
    mintTxHash,

    // Utilities
    refetchBalance,
    refetchQueue,
  };
}
