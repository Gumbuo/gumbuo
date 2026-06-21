"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { motion, AnimatePresence } from "framer-motion";

interface ChessBoardProps {
  fen?: string;
  orientation?: "white" | "black";
  isMyTurn?: boolean;
  onMove?: (from: string, to: string, promotion?: string) => boolean | void;
  lastMove?: { from: string; to: string };
  disabled?: boolean;
  showHints?: boolean;
}

// Sound effects using Web Audio API
const playSound = (type: "move" | "capture" | "check" | "gameOver") => {
  if (typeof window === "undefined") return;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case "move":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.08);
        break;
      case "capture":
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
      case "check":
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case "gameOver":
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
    }
  } catch (e) {
    // Audio not supported
  }
};

export function ChessBoard({
  fen: externalFen,
  orientation = "white",
  isMyTurn = true,
  onMove,
  lastMove,
  disabled = false,
  showHints = true,
}: ChessBoardProps) {
  const [game, setGame] = useState(() => new Chess(externalFen));
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
  const [rightClickedSquares, setRightClickedSquares] = useState<Record<string, React.CSSProperties>>({});
  const [internalLastMove, setInternalLastMove] = useState<{ from: string; to: string } | null>(null);
  const [captureFlash, setCaptureFlash] = useState(false);
  const [checkFlash, setCheckFlash] = useState(false);

  // Sync external FEN with internal game state
  useEffect(() => {
    if (externalFen && externalFen !== game.fen()) {
      setGame(new Chess(externalFen));
    }
  }, [externalFen]);

  // Calculate legal moves for selected piece
  const getMoveOptions = useCallback(
    (square: Square) => {
      const moves = game.moves({ square, verbose: true });
      if (moves.length === 0) return {};

      const options: Record<string, React.CSSProperties> = {};
      moves.forEach((move) => {
        const isCapture = game.get(move.to as Square);
        options[move.to] = {
          background: isCapture
            ? "radial-gradient(circle, rgba(255, 100, 100, 0.4) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0, 255, 153, 0.4) 25%, transparent 25%)",
          borderRadius: "50%",
        };
      });
      options[square] = { background: "rgba(0, 255, 153, 0.5)" };
      return options;
    },
    [game]
  );

  // Make a move
  const makeAMove = useCallback(
    (from: Square, to: Square, promotion?: string): boolean => {
      try {
        const gameCopy = new Chess(game.fen());
        const move = gameCopy.move({
          from,
          to,
          promotion: promotion || "q",
        });

        if (move === null) return false;

        // Play sound
        if (move.captured) {
          playSound("capture");
          setCaptureFlash(true);
          setTimeout(() => setCaptureFlash(false), 300);
        } else {
          playSound("move");
        }

        if (gameCopy.isCheck()) {
          setTimeout(() => playSound("check"), 100);
          setCheckFlash(true);
          setTimeout(() => setCheckFlash(false), 400);
        }

        if (gameCopy.isGameOver()) {
          setTimeout(() => playSound("gameOver"), 200);
        }

        setGame(gameCopy);
        setInternalLastMove({ from, to });

        // Call external handler
        if (onMove) {
          return onMove(from, to, move.promotion) !== false;
        }

        return true;
      } catch (e) {
        return false;
      }
    },
    [game, onMove]
  );

  // Handle piece drop (drag & drop) - new v5 API
  const onDrop = useCallback(
    ({ sourceSquare, targetSquare }: { piece: any; sourceSquare: string; targetSquare: string | null }): boolean => {
      if (disabled || !isMyTurn || !targetSquare) return false;
      const success = makeAMove(sourceSquare as Square, targetSquare as Square);
      setMoveFrom(null);
      setOptionSquares({});
      return success;
    },
    [disabled, isMyTurn, makeAMove]
  );

  // Handle square click (tap to move) - new v5 API
  const onSquareClick = useCallback(
    ({ square }: { piece: any; square: string }) => {
      if (disabled) return;

      const sq = square as Square;

      // If no piece selected, try to select one
      if (!moveFrom) {
        const piece = game.get(sq);
        if (piece && ((isMyTurn && piece.color === game.turn()) || !isMyTurn)) {
          setMoveFrom(sq);
          if (showHints) {
            setOptionSquares(getMoveOptions(sq));
          }
        }
        return;
      }

      // Try to make a move
      if (isMyTurn) {
        const success = makeAMove(moveFrom, sq);
        if (!success) {
          // Maybe selecting a different piece
          const piece = game.get(sq);
          if (piece && piece.color === game.turn()) {
            setMoveFrom(sq);
            if (showHints) {
              setOptionSquares(getMoveOptions(sq));
            }
            return;
          }
        }
      }

      setMoveFrom(null);
      setOptionSquares({});
    },
    [moveFrom, game, isMyTurn, disabled, showHints, getMoveOptions, makeAMove]
  );

  // Right-click for annotations - new v5 API
  const onSquareRightClick = useCallback(({ square }: { piece: any; square: string }) => {
    const color = "rgba(255, 165, 0, 0.5)";
    setRightClickedSquares((prev) => {
      const newSquares = { ...prev };
      if (newSquares[square]) {
        delete newSquares[square];
      } else {
        newSquares[square] = { background: color };
      }
      return newSquares;
    });
  }, []);

  // Build custom square styles
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {
      ...optionSquares,
      ...rightClickedSquares,
    };

    // Highlight last move
    const currentLastMove = lastMove || internalLastMove;
    if (currentLastMove) {
      styles[currentLastMove.from] = {
        ...styles[currentLastMove.from],
        background: "rgba(255, 255, 0, 0.3)",
      };
      styles[currentLastMove.to] = {
        ...styles[currentLastMove.to],
        background: "rgba(255, 255, 0, 0.3)",
      };
    }

    // Highlight king in check
    if (game.isCheck()) {
      const kingSquare = findKingSquare(game, game.turn());
      if (kingSquare) {
        styles[kingSquare] = {
          ...styles[kingSquare],
          background: "radial-gradient(circle, rgba(255, 0, 0, 0.6) 60%, transparent 60%)",
        };
      }
    }

    return styles;
  }, [optionSquares, rightClickedSquares, lastMove, internalLastMove, game]);

  // Get game status
  const gameStatus = useMemo(() => {
    if (game.isCheckmate()) {
      return { type: "checkmate", message: `Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins!` };
    }
    if (game.isStalemate()) {
      return { type: "draw", message: "Stalemate - Draw!" };
    }
    if (game.isDraw()) {
      return { type: "draw", message: "Draw!" };
    }
    if (game.isCheck()) {
      return { type: "check", message: "Check!" };
    }
    return { type: "playing", message: `${game.turn() === "w" ? "White" : "Black"} to move` };
  }, [game]);

  return (
    <div className="relative">
      {/* Game status overlay */}
      <AnimatePresence>
        {(gameStatus.type === "checkmate" || gameStatus.type === "draw") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 rounded-lg"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-cyan-400 mb-2" style={{ fontFamily: "Orbitron, sans-serif" }}>
                {gameStatus.type === "checkmate" ? "CHECKMATE" : "DRAW"}
              </h2>
              <p className="text-white text-lg">{gameStatus.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status bar */}
      <div className="mb-2 px-3 py-2 bg-black/50 rounded-lg border border-cyan-400/30">
        <div className="flex justify-between items-center">
          <span
            className={`text-sm font-medium ${
              gameStatus.type === "check" ? "text-red-400" : "text-cyan-400"
            }`}
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            {gameStatus.message}
          </span>
          {!disabled && (
            <span className={`text-xs ${isMyTurn ? "text-green-400" : "text-gray-400"}`}>
              {isMyTurn ? "Your turn" : "Waiting..."}
            </span>
          )}
        </div>
      </div>

      {/* Chess board */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg overflow-hidden"
        style={{
          boxShadow: captureFlash ? "0 0 60px rgba(255, 50, 50, 0.8)" : checkFlash ? "0 0 60px rgba(255, 165, 0, 0.8)" : "0 0 30px rgba(0, 255, 153, 0.3)",
          transition: "box-shadow 0.15s ease-out",
        }}
      >
        <Chessboard
          options={{
            position: game.fen(),
            onPieceDrop: onDrop,
            onSquareClick: onSquareClick,
            onSquareRightClick: onSquareRightClick,
            boardOrientation: orientation,
            allowDragging: isMyTurn && !disabled && !game.isGameOver(),
            squareStyles: customSquareStyles,
            boardStyle: {
              borderRadius: "8px",
            },
            darkSquareStyle: {
              backgroundColor: "#1a3a1a",
            },
            lightSquareStyle: {
              backgroundColor: "#2d5a2d",
            },
          }}
        />
      </motion.div>
    </div>
  );
}

// Helper to find king square
function findKingSquare(game: Chess, color: "w" | "b"): Square | null {
  const board = game.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === "k" && piece.color === color) {
        const files = "abcdefgh";
        const ranks = "87654321";
        return (files[col] + ranks[row]) as Square;
      }
    }
  }
  return null;
}

export default ChessBoard;
