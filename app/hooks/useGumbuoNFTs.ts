"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

// NFT Contract ABI (minimal - just what we need)
const NFT_ABI = [
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "owner", type: "address" }, { name: "index", type: "uint256" }],
    name: "tokenOfOwnerByIndex",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "alienType",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  }
];

// Placeholder contract address - replace with actual deployed address
const NFT_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

export interface GumbuoNFT {
  tokenId: string;
  alienType: string; // "nyx", "zorb", "baob", "apelian", "j3d1", "zit"
  imageUrl?: string;
}

export function useGumbuoNFTs() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState<GumbuoNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<GumbuoNFT | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      fetchUserNFTs();
    } else {
      setNfts([]);
      setSelectedNFT(null);
    }
  }, [address, isConnected]);

  const fetchUserNFTs = async () => {
    if (!address) return;

    setLoading(true);
    try {
      // For now, return mock data since we don't have a deployed contract yet
      // In production, this would query the blockchain
      const mockNFTs: GumbuoNFT[] = [
        { tokenId: "1", alienType: "nyx" },
        { tokenId: "2", alienType: "zorb" },
        { tokenId: "3", alienType: "baob" },
        { tokenId: "4", alienType: "apelian" },
        { tokenId: "5", alienType: "j3d1" },
        { tokenId: "6", alienType: "zit" }
      ];

      setNfts(mockNFTs);

      // Auto-select first NFT if none selected
      if (mockNFTs.length > 0 && !selectedNFT) {
        setSelectedNFT(mockNFTs[0]);
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      setNfts([]);
    } finally {
      setLoading(false);
    }
  };

  const selectNFT = (nft: GumbuoNFT) => {
    setSelectedNFT(nft);
  };

  return {
    nfts,
    loading,
    selectedNFT,
    selectNFT,
    hasNFTs: nfts.length > 0
  };
}
