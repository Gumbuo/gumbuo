"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useAccount } from 'wagmi';

interface ChessGameProps {
  gameId: number;
  isPlayer1: boolean;
  onBackToLobby: () => void;
}

const ChessGame: React.FC<ChessGameProps> = ({ gameId, isPlayer1, onBackToLobby }) => {
  const { address } = useAccount();
  const [game, setGame] = useState(new Chess());
  const [gameState, setGameState] = useState<any>(null);
  const [moveFrom, setMoveFrom] = useState('');
  const [rightClickedSquares, setRightClickedSquares] = useState<{ [key: string]: { backgroundColor: string } }>({});
  const [optionSquares, setOptionSquares] = useState({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);

  // Player color - player1 is white, player2 is black
  const playerColor = isPlayer1 ? 'w' : 'b';
  const isMyTurn = game.turn() === playerColor;

  // WebSocket connection for real-time moves
  useEffect(() => {
    const WS_URL = process.env.NODE_ENV === 'production'
      ? (process.env.NEXT_PUBLIC_WS_URL || 'wss://gumbuo-production.up.railway.app')
      : 'ws://localhost:3001';

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ Connected to chess server');
      ws.send(JSON.stringify({
        type: 'chess-join',
        gameId,
        wallet: address,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'chess-move':
          if (data.gameId === gameId) {
            // Apply opponent's move
            const gameCopy = new Chess(game.fen());
            gameCopy.move(data.move);
            setGame(gameCopy);
          }
          break;
        case 'chess-game-state':
          if (data.gameId === gameId) {
            setGameState(data.state);
            if (data.state.fen) {
              const gameCopy = new Chess(data.state.fen);
              setGame(gameCopy);
            }
          }
          break;
        case 'chess-game-over':
          if (data.gameId === gameId) {
            alert(`Game Over! ${data.winner === address ? 'You won!' : 'You lost.'}`);
          }
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('🔌 Disconnected from chess server');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [gameId, address]);

  // Fetch game state periodically
  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const response = await fetch(`/api/chess/game-state?gameId=${gameId}`);
        const data = await response.json();

        if (data.success) {
          setGameState(data.state);

          // Calculate time remaining for current player
          if (data.state.lastMoveTime) {
            const elapsed = Date.now() - data.state.lastMoveTime;
            const remaining = Math.max(0, 24 * 60 * 60 * 1000 - elapsed); // 24 hours in ms
            setTimeRemaining(remaining);
          }

          // Load FEN if available
          if (data.state.fen && data.state.fen !== game.fen()) {
            const gameCopy = new Chess(data.state.fen);
            setGame(gameCopy);
          }
        }
      } catch (error) {
        console.error('Failed to fetch game state:', error);
      }
    };

    fetchGameState();
    const interval = setInterval(fetchGameState, 3000);
    return () => clearInterval(interval);
  }, [gameId]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => Math.max(0, prev - 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  // Format time remaining
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Make a move
  function makeMove(sourceSquare: string, targetSquare: string) {
    const gameCopy = new Chess(game.fen());

    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // Auto-promote to queen
      });

      if (move === null) return false; // Invalid move

      setGame(gameCopy);

      // Send move to server via WebSocket
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'chess-move',
          gameId,
          move: {
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q',
          },
          fen: gameCopy.fen(),
          wallet: address,
        }));
      }

      // Also send to REST API for persistence
      fetch('/api/chess/make-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          move: { from: sourceSquare, to: targetSquare, promotion: 'q' },
          fen: gameCopy.fen(),
          wallet: address,
        }),
      });

      return true;
    } catch (error) {
      console.error('Invalid move:', error);
      return false;
    }
  }

  // Get possible moves for a square
  function getMoveOptions(square: string) {
    const moves = game.moves({
      square: square as any,
      verbose: true,
    });

    if (moves.length === 0) {
      return {};
    }

    const newSquares: any = {};
    moves.map((move: any) => {
      const targetPiece = game.get(move.to as any);
      const sourcePiece = game.get(square as any);
      newSquares[move.to] = {
        background:
          targetPiece && sourcePiece && targetPiece.color !== sourcePiece.color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };
    return newSquares;
  }

  // Handle square click
  function onSquareClick(square: string) {
    if (!isMyTurn) {
      alert("It's not your turn!");
      return;
    }

    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square);
      if (Object.keys(hasMoveOptions).length > 0) {
        setMoveFrom(square);
        setOptionSquares(hasMoveOptions);
      }
      return;
    }

    // Attempt to make move
    const moveSuccessful = makeMove(moveFrom, square);

    if (moveSuccessful) {
      setMoveFrom('');
      setOptionSquares({});
    } else {
      // If move failed, maybe they're selecting a different piece
      const hasMoveOptions = getMoveOptions(square);
      if (Object.keys(hasMoveOptions).length > 0) {
        setMoveFrom(square);
        setOptionSquares(hasMoveOptions);
      }
    }
  }

  // Handle piece drag
  function onPieceDrop(sourceSquare: string, targetSquare: string) {
    if (!isMyTurn) {
      return false;
    }

    const moveSuccessful = makeMove(sourceSquare, targetSquare);
    setMoveFrom('');
    setOptionSquares({});
    return moveSuccessful;
  }

  // Right-click square highlighting
  function onSquareRightClick(square: string) {
    const color = 'rgba(0, 0, 255, 0.4)';
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]: { backgroundColor: color },
    });
  }

  // Claim winnings
  const handleClaimWinnings = async () => {
    try {
      const response = await fetch('/api/chess/claim-winnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          wallet: address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Winnings claimed! You received ${data.payout} ETH`);
        onBackToLobby();
      } else {
        alert(`Failed to claim winnings: ${data.error}`);
      }
    } catch (error) {
      console.error('Error claiming winnings:', error);
      alert('Failed to claim winnings.');
    }
  };

  const isGameOver = game.isGameOver();
  const winner = isGameOver ? (game.isCheckmate() ? (game.turn() === 'w' ? 'Black' : 'White') : 'Draw') : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBackToLobby}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg"
          >
            ← Back to Lobby
          </button>
          <h1 className="text-3xl font-bold text-cyan-400">
            ♟️ Game #{gameId}
          </h1>
          <div className="text-purple-300">
            You are: {isPlayer1 ? '⬜ White' : '⬛ Black'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chessboard */}
          <div className="lg:col-span-2 flex justify-center">
            <div
              className="border-2 border-purple-400 rounded-lg p-4 relative overflow-hidden"
              style={{
                background: '#000',
                width: '550px',
                maxWidth: '100%',
              }}
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

              {/* Chessboard with green grid */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <Chessboard
                  position={game.fen()}
                  onPieceDrop={onPieceDrop}
                  onSquareClick={onSquareClick}
                  onSquareRightClick={onSquareRightClick}
                  boardWidth={500}
                  customSquareStyles={{
                    ...optionSquares,
                    ...rightClickedSquares,
                  }}
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
                  boardOrientation={isPlayer1 ? 'white' : 'black'}
                  arePiecesDraggable={isMyTurn && !isGameOver}
                />
              </div>
            </div>
          </div>

          {/* Game Info */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-purple-900/40 border-2 border-cyan-400 rounded-lg p-6">
              <h2 className="text-xl font-bold text-cyan-400 mb-4">Game Status</h2>
              <div className="space-y-2 text-white">
                {isGameOver ? (
                  <>
                    <div className="text-2xl font-bold text-center text-cyan-400">Game Over!</div>
                    <div className="text-center text-purple-300">{winner}</div>
                    {winner !== 'Draw' && gameState?.winner === address && gameState?.buyIn !== '0' && (
                      <button
                        onClick={handleClaimWinnings}
                        className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500
                                 text-white font-bold py-3 px-6 rounded-lg mt-4"
                      >
                        💰 Claim Winnings
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Turn:</span>
                      <span className={isMyTurn ? 'text-cyan-400 font-bold' : 'text-purple-300'}>
                        {game.turn() === 'w' ? '⬜ White' : '⬛ Black'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Your Turn:</span>
                      <span className={isMyTurn ? 'text-green-400 font-bold' : 'text-red-400'}>
                        {isMyTurn ? 'YES' : 'NO'}
                      </span>
                    </div>
                    {game.isCheck() && (
                      <div className="text-red-400 font-bold text-center mt-2">
                        ⚠️ CHECK!
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Timer */}
            {!isGameOver && timeRemaining > 0 && (
              <div className="bg-purple-900/40 border-2 border-purple-400 rounded-lg p-6">
                <h2 className="text-xl font-bold text-cyan-400 mb-4">⏱️ Time Remaining</h2>
                <div className={`text-2xl font-mono text-center ${timeRemaining < 3600000 ? 'text-red-400' : 'text-cyan-400'}`}>
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-sm text-purple-300 text-center mt-2">
                  {isMyTurn ? 'Your time to move' : "Opponent's time"}
                </p>
              </div>
            )}

            {/* Buy-In Info */}
            {gameState && (
              <div className="bg-purple-900/40 border-2 border-purple-400 rounded-lg p-6">
                <h2 className="text-xl font-bold text-cyan-400 mb-4">
                  {gameState.buyIn === '0' ? '🎮 Free Game' : '💰 Prize Pool'}
                </h2>
                <div className="space-y-2 text-white">
                  <div className="flex justify-between">
                    <span className="text-purple-300">Buy-In:</span>
                    <span className="text-cyan-400">
                      {gameState.buyIn === '0' ? 'FREE' : `${gameState.buyIn} ETH`}
                    </span>
                  </div>
                  {gameState.buyIn !== '0' && (
                    <div className="flex justify-between">
                      <span className="text-purple-300">Total Pot:</span>
                      <span className="text-cyan-400 font-bold">{gameState.pot} ETH</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Move History */}
            <div className="bg-purple-900/40 border-2 border-purple-400 rounded-lg p-6">
              <h2 className="text-xl font-bold text-cyan-400 mb-4">Move History</h2>
              <div className="max-h-48 overflow-y-auto text-sm text-purple-300 font-mono">
                {game.history().length === 0 ? (
                  <p className="text-center">No moves yet</p>
                ) : (
                  game.history().map((move, i) => (
                    <div key={i} className="py-1">
                      {Math.floor(i / 2) + 1}. {move}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;
