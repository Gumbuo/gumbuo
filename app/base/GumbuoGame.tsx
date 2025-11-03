'use client';

import { useState, useEffect } from 'react';

export default function GumbuoGame() {
  const [gameReady, setGameReady] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the game files exist
    const checkGameFiles = async () => {
      try {
        const response = await fetch('/games/gumbuo-fighters/index.html', { method: 'HEAD' });
        setGameReady(response.ok);
      } catch (err) {
        setGameReady(false);
      }
    };

    checkGameFiles();
  }, []);

  if (gameReady === null) {
    // Loading state
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mb-4"></div>
          <p className="text-cyan-400 text-xl font-bold">Checking game files...</p>
        </div>
      </div>
    );
  }

  if (!gameReady) {
    // Game files not found - show instructions
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-900 via-purple-900 to-black p-8 overflow-auto">
        <div className="bg-black/40 border-2 border-yellow-400/40 rounded-lg p-8 max-w-2xl backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-yellow-400 mb-4">🎮 Gumbuo Fighters Setup</h2>
          <p className="text-gray-300 mb-6">
            Your fighting game is ready to be exported! Follow these steps to get it running:
          </p>

          <div className="bg-gray-800/50 border border-cyan-400/30 rounded p-4 mb-6">
            <p className="text-cyan-300 font-bold mb-3">📋 Export Instructions:</p>
            <ol className="text-gray-300 space-y-2 list-decimal list-inside text-sm">
              <li>
                Open <span className="text-yellow-400 font-mono bg-gray-900 px-2 py-1 rounded">IDEAS ONLY/game.json</span> in GDevelop 5
              </li>
              <li>
                Click <span className="text-yellow-400 font-bold">File → Export → Web (HTML5)</span>
              </li>
              <li>
                Choose export location (any temporary folder)
              </li>
              <li>
                Wait for export to complete
              </li>
              <li>
                Copy <span className="text-yellow-400 font-bold">ALL exported files</span> to:
                <div className="mt-2 bg-gray-900 p-2 rounded font-mono text-xs text-green-400">
                  public/games/gumbuo-fighters/
                </div>
              </li>
              <li>
                Refresh this page
              </li>
            </ol>
          </div>

          <div className="bg-purple-900/20 border border-purple-400/30 rounded p-3">
            <p className="text-purple-300 text-sm">
              <span className="font-bold">💡 Tip:</span> Make sure to copy the entire export folder contents, including index.html and all .js files
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Game is ready - load it in an iframe
  return (
    <div className="w-full h-full bg-black">
      <iframe
        src="/games/gumbuo-fighters/index.html"
        className="w-full h-full border-none"
        title="Gumbuo Fighters - FoxHole"
        allow="fullscreen; gamepad; autoplay"
      />
    </div>
  );
}
