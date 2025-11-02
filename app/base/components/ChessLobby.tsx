"use client";

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Chessboard } from 'react-chessboard';

interface Game {
  id: number;
  player1: string;
  buyIn: string;
  pot: string;
  status: 'waiting' | 'active' | 'completed';
}

interface ChessLobbyProps {
  onGameStart: (gameId: number, isPlayer1: boolean) => void;
}

const ChessLobby: React.FC<ChessLobbyProps> = ({ onGameStart }) => {
  const { address, isConnected } = useAccount();
  const [openGames, setOpenGames] = useState<Game[]>([]);
  const [myGames, setMyGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  // Fixed buy-in amounts
  const buyInOptions = [
    { tier: 0, amount: '0.001', label: '0.001 ETH' },
    { tier: 1, amount: '0.005', label: '0.005 ETH' },
    { tier: 2, amount: '0.01', label: '0.01 ETH' },
  ];

  // Fetch open games from backend
  const fetchOpenGames = async () => {
    try {
      const response = await fetch('/api/chess/lobby');
      const data = await response.json();

      if (data.success) {
        setOpenGames(data.openGames || []);
        setMyGames(data.myGames || []);
      }
    } catch (error) {
      console.error('Failed to fetch open games:', error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchOpenGames();
      // Refresh every 5 seconds
      const interval = setInterval(fetchOpenGames, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  // Create new game
  const handleCreateGame = async (tier: number, isCpuGame: boolean = false) => {
    if (!address) return;

    setLoading(true);
    try {
      const response = await fetch('/api/chess/create-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: address,
          buyInTier: tier,
          isCpuGame,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Game created! Game ID: ${data.gameId}`);
        fetchOpenGames();
        // Optionally start the game immediately
        onGameStart(data.gameId, true);
      } else {
        alert(`Failed to create game: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Join existing game
  const handleJoinGame = async (gameId: number, buyIn: string) => {
    if (!address) return;

    setLoading(true);
    try {
      const response = await fetch('/api/chess/join-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: address,
          gameId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Joined game ${gameId}!`);
        fetchOpenGames();
        onGameStart(gameId, false);
      } else {
        alert(`Failed to join game: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Failed to join game. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Continue existing game
  const handleContinueGame = (gameId: number, isPlayer1: boolean) => {
    onGameStart(gameId, isPlayer1);
  };

  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-black flex items-center justify-center p-8">
        <div className="bg-purple-900/40 border-2 border-purple-400 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Connect Wallet</h2>
          <p className="text-purple-300">
            Connect your wallet to play PvP chess with ETH buy-ins
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">
            ♟️ Chess Arena
          </h1>
          <p className="text-purple-300">
            PvP Chess with ETH Buy-Ins - Winner Takes All
          </p>
        </div>

        {/* Demo Chessboard */}
        <div className="mb-8 mx-auto" style={{ width: '450px', maxWidth: '90%' }}>
          <div
            className="border-2 border-purple-400 rounded-lg p-4 relative overflow-hidden"
            style={{ background: '#000', width: '100%' }}
          >
            {/* Video Background */}
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0,
                opacity: 0.6,
                filter: 'hue-rotate(30deg) saturate(1.5)',
              }}
            >
              <source src="/alien.mp4" type="video/mp4" />
            </video>

            {/* Demo Board */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Chessboard
                position="start"
                arePiecesDraggable={false}
                boardWidth={400}
                customBoardStyle={{
                  borderRadius: '8px',
                  boxShadow: '0 0 30px rgba(0, 255, 153, 0.5)',
                }}
                customDarkSquareStyle={{
                  backgroundColor: 'rgba(0, 50, 0, 0.5)',
                  border: '2px solid #00ff99',
                }}
                customLightSquareStyle={{
                  backgroundColor: 'rgba(0, 255, 153, 0.2)',
                  border: '2px solid #00ff99',
                }}
              />
            </div>
          </div>
        </div>

        {/* Create Game Section - FREE GAMES */}
        <div className="bg-purple-900/40 border-2 border-cyan-400 rounded-2xl p-6 mb-8 mx-auto w-fit">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center">🎮 Free Games</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {/* 1 Player vs CPU - Blue */}
            <button
              onClick={() => handleCreateGame(-1, true)}
              disabled={loading}
              style={{
                padding: '24px',
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#3b82f6',
                border: '2px solid #3b82f6',
                borderRadius: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.5 : 1,
                minWidth: '200px',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.boxShadow = '0 0 20px #3b82f666';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div className="text-lg">1 PLAYER</div>
              <div className="text-3xl mt-2 text-white">🤖 vs CPU</div>
              <div className="text-sm mt-2" style={{ color: '#3b82f6' }}>Practice Mode</div>
            </button>

            {/* 2 Player PvP - Green */}
            <button
              onClick={() => handleCreateGame(-1, false)}
              disabled={loading}
              style={{
                padding: '24px',
                background: 'rgba(34, 197, 94, 0.2)',
                color: '#22c55e',
                border: '2px solid #22c55e',
                borderRadius: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.5 : 1,
                minWidth: '200px',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)';
                  e.currentTarget.style.boxShadow = '0 0 20px #22c55e66';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div className="text-lg">2 PLAYER</div>
              <div className="text-3xl mt-2 text-white">👥 PvP</div>
              <div className="text-sm mt-2" style={{ color: '#22c55e' }}>Wait for Opponent</div>
            </button>
          </div>
          <p className="text-sm text-purple-300 mt-4 text-center">
            No buy-in required • Practice or play with friends
          </p>
        </div>

        {/* Create Game Section - PAID GAMES */}
        <div className="bg-purple-900/40 border-2 border-purple-400 rounded-2xl p-6 mb-8 mx-auto w-fit">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center">💰 Paid Games (PvP Only)</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {buyInOptions.map((option, index) => {
              // Define colors for each tier
              const colors = [
                { bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6', hover: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' }, // Blue for 0.001
                { bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e', hover: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' }, // Green for 0.005
                { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', hover: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' }, // Red for 0.01
              ];
              const color = colors[index];

              return (
                <button
                  key={option.tier}
                  onClick={() => handleCreateGame(option.tier, false)}
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: color.bg,
                    color: color.text,
                    border: `2px solid ${color.border}`,
                    borderRadius: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'Orbitron, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease',
                    opacity: loading ? 0.5 : 1,
                    minWidth: 'fit-content',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = color.hover;
                      e.currentTarget.style.boxShadow = `0 0 20px ${color.border}66`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = color.bg;
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div className="text-lg">Create Game</div>
                  <div className="text-2xl mt-2">{option.label}</div>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-purple-300 mt-4 text-center">
            ⏱️ 24-hour move timer - Forfeit if you don't move in time • Winner takes all
          </p>
        </div>

        {/* My Active Games */}
        {myGames.length > 0 && (
          <div className="bg-purple-900/40 border-2 border-cyan-400 rounded-2xl p-6 mb-8 mx-auto w-fit min-w-[500px]">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center">My Active Games</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {myGames.map((game) => (
                <div
                  key={game.id}
                  className="bg-black/40 border border-cyan-400/50 rounded-2xl p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="text-white font-bold">Game #{game.id}</div>
                    <div className="text-purple-300 text-sm">
                      {game.status === 'waiting' ? '⏳ Waiting for opponent...' : '⚔️ In Progress'}
                    </div>
                    <div className="text-cyan-400 text-sm">
                      Buy-In: {game.buyIn === '0' ? 'FREE' : `${game.buyIn} ETH`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleContinueGame(game.id, game.player1.toLowerCase() === address?.toLowerCase())}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-2xl transition-all"
                  >
                    {game.status === 'waiting' ? 'View' : 'Continue'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Open Games */}
        <div className="bg-purple-900/40 border-2 border-purple-400 rounded-2xl p-6 mx-auto w-fit min-w-[500px]">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center">Open Games</h2>

          {openGames.length === 0 ? (
            <p className="text-purple-300 text-center py-8">
              No open games available. Create one above!
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {openGames.map((game) => (
                <div
                  key={game.id}
                  className="bg-black/40 border border-purple-400/50 rounded-2xl p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="text-white font-bold">Game #{game.id}</div>
                    <div className="text-purple-300 text-sm">
                      Created by: {shortenAddress(game.player1)}
                    </div>
                    <div className="text-cyan-400 text-sm">
                      Buy-In: {game.buyIn === '0' ? 'FREE' : `${game.buyIn} ETH`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinGame(game.id, game.buyIn)}
                    disabled={loading || game.player1.toLowerCase() === address?.toLowerCase()}
                    className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500
                             text-white font-bold py-2 px-6 rounded-2xl transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {game.player1.toLowerCase() === address?.toLowerCase() ? 'Your Game' : 'Join Game'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChessLobby;
