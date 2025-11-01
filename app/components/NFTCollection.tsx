"use client";
import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { useReadContract } from "wagmi";
import { useCosmicSound } from "../hooks/useCosmicSound";
import { createPublicClient, http } from 'viem';

const NFT_CONTRACT = (process.env.NEXT_PUBLIC_GUMBUO_FIGHTER_NFT || "0x03772362A12686eC103b6B413299D04DEbfb77Af") as `0x${string}`;

const NFT_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "tokenOfOwnerByIndex",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" }
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "tokenURI",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "string" }],
  },
] as const;

interface NFT {
  tokenId: number;
  alienType: string;
  imageUrl: string;
}

// Create Abstract Testnet client
const abstractTestnetClient = createPublicClient({
  chain: {
    id: 11124,
    name: 'Abstract Testnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://api.testnet.abs.xyz'] },
      public: { http: ['https://api.testnet.abs.xyz'] },
    },
  } as any,
  transport: http('https://api.testnet.abs.xyz'),
});

export default function NFTCollection({ onSelectNFT }: { onSelectNFT?: (tokenId: number) => void }) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { playSound } = useCosmicSound();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log('NFTCollection - NFT Contract:', NFT_CONTRACT);
  console.log('NFTCollection - User Address:', address);
  console.log('NFTCollection - Current Chain:', chainId);

  // Get NFT balance - make sure to use Abstract Testnet chain
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: NFT_CONTRACT,
    abi: NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: 11124, // Abstract Testnet
  });

  console.log('NFTCollection - Balance:', balance);

  // Fetch all NFTs owned by user
  useEffect(() => {
    if (!address || !balance) {
      console.log('NFTCollection - Skipping fetch:', { address, balance: balance?.toString() });
      return;
    }

    const fetchNFTs = async () => {
      setIsLoading(true);
      const nftCount = Number(balance);
      const fetchedNFTs: NFT[] = [];

      console.log('Fetching NFTs for user:', address);
      console.log('NFT Count:', nftCount);

      // For each NFT, get the actual token ID
      for (let i = 0; i < nftCount; i++) {
        try {
          // Get the token ID at this index - use Abstract Testnet client
          const tokenId = await abstractTestnetClient.readContract({
            address: NFT_CONTRACT,
            abi: NFT_ABI,
            functionName: "tokenOfOwnerByIndex",
            args: [address, BigInt(i)],
          }) as bigint;

          const tokenIdNum = Number(tokenId);
          console.log(`Token ${i}: ID = ${tokenIdNum}`);

          // Try to get token URI to determine alien type
          let alienType = 'nyx'; // default
          try {
            const tokenURI = await abstractTestnetClient.readContract({
              address: NFT_CONTRACT,
              abi: NFT_ABI,
              functionName: "tokenURI",
              args: [tokenId],
            }) as string;

            console.log(`Token URI for ${tokenIdNum}:`, tokenURI);

            // Extract alien type from metadata
            // Token URI might be IPFS or direct JSON
            if (tokenURI.includes('ipfs://')) {
              const ipfsHash = tokenURI.replace('ipfs://', '');
              // Fetch metadata from IPFS
              const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
              const metadata = await response.json();
              alienType = metadata.attributes?.find((attr: any) => attr.trait_type === 'Type')?.value || 'nyx';
            } else if (tokenURI.startsWith('data:application/json')) {
              const jsonData = tokenURI.split(',')[1];
              const metadata = JSON.parse(atob(jsonData));
              alienType = metadata.attributes?.find((attr: any) => attr.trait_type === 'Type')?.value || 'nyx';
            }
          } catch (error) {
            console.error(`Failed to get metadata for token ${tokenIdNum}:`, error);
            // Use token ID to determine type based on order
            const alienTypes = ['nyx', 'zorb', 'baob', 'apelian', 'j3d1', 'zit'];
            alienType = alienTypes[tokenIdNum % alienTypes.length];
          }

          fetchedNFTs.push({
            tokenId: tokenIdNum,
            alienType: alienType.toLowerCase(),
            imageUrl: `/${alienType.toLowerCase()}.${alienType.toLowerCase() === 'j3d1' ? 'jpg' : 'png'}`,
          });
        } catch (error) {
          console.error(`Failed to fetch NFT ${i}:`, error);
        }
      }

      setNfts(fetchedNFTs);
      setIsLoading(false);
    };

    fetchNFTs();
  }, [address, balance]);

  const handleDragStart = (e: React.DragEvent, tokenId: number) => {
    e.dataTransfer.setData("tokenId", tokenId.toString());
    e.dataTransfer.effectAllowed = "move";
    playSound('click');
  };

  const handleClick = (tokenId: number) => {
    setSelectedTokenId(tokenId);
    if (onSelectNFT) {
      onSelectNFT(tokenId);
      playSound('success');
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-cyan-400 font-alien">
          👽 Your Fighters ({nfts.length})
        </h3>
        <button
          onClick={() => {
            refetchBalance();
            playSound('click');
          }}
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: '#fff',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 'bold',
            fontSize: '12px',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.5)';
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="bg-black/40 rounded-3xl p-8 border-2 border-dashed border-cyan-600 text-center">
          <p className="text-cyan-400 text-lg animate-pulse">⏳ Loading your fighters...</p>
        </div>
      ) : nfts.length === 0 ? (
        <div className="bg-black/40 rounded-3xl p-8 border-2 border-dashed border-gray-600 text-center">
          <p className="text-gray-400 text-lg">No fighters yet!</p>
          <p className="text-gray-500 text-sm mt-2">Mint some fighters to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {nfts.map((nft) => (
            <div
              key={nft.tokenId}
              draggable
              onDragStart={(e) => handleDragStart(e, nft.tokenId)}
              onClick={() => handleClick(nft.tokenId)}
              className={`cursor-grab active:cursor-grabbing p-3 rounded-3xl border-2 transition-all hover:scale-105 ${
                selectedTokenId === nft.tokenId
                  ? 'border-cyan-400 bg-cyan-900/50 shadow-lg shadow-cyan-500/50'
                  : 'border-purple-500/50 bg-black/40 hover:border-purple-400'
              }`}
            >
              <div className="aspect-square rounded-3xl overflow-hidden mb-2 bg-black/30">
                <img
                  src={nft.imageUrl}
                  alt={`${nft.alienType} #${nft.tokenId}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              <p className="text-center text-xs font-bold text-purple-400 uppercase mb-1">
                {nft.alienType}
              </p>
              <p className="text-center text-xs text-gray-400">
                Token #{nft.tokenId}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-3xl text-center">
        <p className="text-sm text-purple-300">
          💡 <strong>Tip:</strong> Drag & drop a fighter into the battle arena, or click to select!
        </p>
      </div>
    </div>
  );
}
