"use client";

export default function GumbuoMarketplace() {
  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-br from-black via-purple-900/30 to-black bg-opacity-95 rounded-xl max-w-4xl w-full relative overflow-hidden shadow-2xl shadow-purple-500/50">
      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 animate-pulse"></div>

      {/* Scan line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-400/5 to-transparent animate-scan pointer-events-none"></div>

      <h2 className="text-3xl font-bold holographic-text tracking-wider flex items-center justify-center space-x-2 drop-shadow-lg relative z-10">
        <span className="animate-glow">💎 GMB Token Marketplace 💎</span>
      </h2>

      {/* Coming Soon Banner */}
      <div className="w-full bg-gradient-to-r from-yellow-400/20 via-yellow-400/30 to-yellow-400/20 border-2 border-yellow-400 rounded-lg p-8 relative overflow-hidden shadow-lg shadow-yellow-400/50 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-shimmer pointer-events-none"></div>
        <div className="text-center relative z-10">
          <p className="text-yellow-400 text-4xl font-bold mb-3">🚧 COMING SOON! 🚧</p>
          <p className="text-yellow-400 text-xl mb-2">
            Premium Fighters - GMB Tokens Only
          </p>
          <p className="text-yellow-300 text-sm opacity-75">
            Smart contract in development. Exclusive premium fighters will only be available for GMB token holders.
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="w-full text-purple-400 text-xs text-center bg-purple-400 bg-opacity-10 p-4 rounded-lg">
        <p className="font-bold mb-1">ℹ️ GMB Marketplace Info</p>
        <p className="opacity-75">
          The GMB marketplace will feature exclusive premium fighters only available to GMB token holders.
          Prices are 1:1 with Alien Points value, but purchases require GMB tokens via smart contract. Stay tuned! 🚀
        </p>
      </div>
    </div>
  );
}
