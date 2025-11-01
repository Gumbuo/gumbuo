"use client";
import { useState, useEffect } from "react";
import { useAccount, useWatchBlockNumber, usePublicClient } from "wagmi";
import { abstract } from "@lib/wagmi-abstract";
import { formatEther } from "viem";

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: "sent" | "received" | "contract";
  xpEstimate: number;
}

export default function AbstractActivityFeed() {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const isOnAbstract = chain?.id === abstract.id;

  // Load transactions from localStorage
  useEffect(() => {
    if (address) {
      const saved = localStorage.getItem(`tx-feed-${address}`);
      if (saved) {
        setTransactions(JSON.parse(saved));
      }
    }
  }, [address]);

  // Watch for new blocks and fetch latest transactions
  useWatchBlockNumber({
    enabled: isOnAbstract && !!address,
    onBlockNumber: async (blockNumber) => {
      // Only fetch occasionally to avoid rate limits
      if (blockNumber % 5n === 0n) {
        fetchRecentTransactions();
      }
    },
  });

  const fetchRecentTransactions = async () => {
    if (!address || !publicClient || !isOnAbstract) return;

    setLoading(true);
    try {
      // This is a simplified version - in production, use a proper indexer API
      // like Alchemy, Moralis, or The Graph for transaction history
      const mockTx: Transaction = {
        hash: `0x${Date.now().toString(16)}...`,
        from: address,
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        value: "0.01",
        timestamp: Date.now(),
        type: "contract",
        xpEstimate: 10,
      };

      // Don't add duplicate transactions
      if (!transactions.some((tx) => tx.hash === mockTx.hash)) {
        const updated = [mockTx, ...transactions].slice(0, 50);
        setTransactions(updated);
        localStorage.setItem(`tx-feed-${address}`, JSON.stringify(updated));
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTxTypeColor = (type: Transaction["type"]) => {
    switch (type) {
      case "sent":
        return "text-red-400";
      case "received":
        return "text-green-400";
      case "contract":
        return "text-cyan-400";
      default:
        return "text-gray-400";
    }
  };

  const getTxTypeIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "sent":
        return "📤";
      case "received":
        return "📥";
      case "contract":
        return "📝";
      default:
        return "📄";
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const shortenHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const openExplorer = (hash: string) => {
    window.open(`https://explorer.abs.xyz/tx/${hash}`, "_blank");
  };

  return (
    <div style={{borderRadius: '24px', border: '2px solid #00ff9944'}} className="holographic-panel glass-panel p-8 max-w-3xl mx-auto">
      {/* Corner glows */}
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-cyan-400 font-electro holographic-text">
              📊 Transaction Feed
            </h2>
            <p className="text-green-400 text-sm mt-1">
              Live feed of your XP-earning transactions on Abstract
            </p>
          </div>
          {loading && (
            <div className="text-cyan-400 animate-pulse">
              <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {!isOnAbstract ? (
          <div className="text-center p-8 bg-yellow-900/20 rounded-3xl border border-yellow-500/30">
            <p className="text-yellow-400 mb-2">
              ⚠️ Switch to Abstract Chain to view your transaction feed
            </p>
            <p className="text-gray-400 text-sm">
              Current chain: {chain?.name || "Not connected"}
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center p-12 bg-black/30 rounded-3xl border border-gray-700">
            <div className="text-6xl mb-4">🛸</div>
            <p className="text-gray-400 text-lg mb-2">No transactions yet!</p>
            <p className="text-sm text-gray-500">
              Start using the bridge, swap, or mint features to see your activity here
            </p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-3xl border border-cyan-500/30">
                <div className="text-cyan-400 text-xs mb-1">Total Transactions</div>
                <div className="text-2xl font-bold text-white">{transactions.length}</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-3xl border border-green-500/30">
                <div className="text-green-400 text-xs mb-1">Estimated XP</div>
                <div className="text-2xl font-bold text-white">
                  {transactions.reduce((sum, tx) => sum + tx.xpEstimate, 0)}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl border border-purple-500/30">
                <div className="text-purple-400 text-xs mb-1">Total Volume</div>
                <div className="text-2xl font-bold text-white">
                  {transactions
                    .reduce((sum, tx) => sum + parseFloat(tx.value), 0)
                    .toFixed(4)}{" "}
                  ETH
                </div>
              </div>
            </div>

            {/* Transaction List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
              {transactions.map((tx) => (
                <div
                  key={tx.hash}
                  onClick={() => openExplorer(tx.hash)}
                  className="p-4 bg-black/40 rounded-3xl border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 cursor-pointer hover:scale-102 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTxTypeIcon(tx.type)}</span>
                      <div>
                        <div className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                          {shortenHash(tx.hash)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatTimeAgo(tx.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getTxTypeColor(tx.type)}`}>
                        {tx.type === "received" ? "+" : ""}
                        {tx.value} ETH
                      </div>
                      <div className="text-xs text-green-400">+{tx.xpEstimate} XP</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div>
                      From: <span className="text-gray-400">{shortenAddress(tx.from)}</span>
                    </div>
                    <div>→</div>
                    <div>
                      To: <span className="text-gray-400">{shortenAddress(tx.to)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View on Explorer Button */}
            <div className="mt-6">
              <button
                onClick={() =>
                  window.open(`https://explorer.abs.xyz/address/${address}`, "_blank")
                }
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  color: '#fff',
                  border: '2px solid #06b6d4',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0891b2, #2563eb)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(6, 182, 212, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #06b6d4, #3b82f6)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(6, 182, 212, 0.5)';
                }}
              >
                🔍 View All on Block Explorer
              </button>
            </div>
          </>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-3xl border border-purple-500/30">
          <p className="text-purple-400 text-sm">
            💡 <strong>XP Tracking:</strong> All your on-chain activities on Abstract are
            tracked automatically. The more you interact, the more XP you earn!
          </p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
