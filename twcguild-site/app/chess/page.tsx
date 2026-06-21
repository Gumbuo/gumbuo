"use client";

import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther, parseEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { Chess } from "chess.js";
import Link from "next/link";
import ChessBoard from "../components/chess/ChessBoard";
import MoveHistory from "../components/chess/MoveHistory";
import GameClock, { TIME_CONTROLS } from "../components/chess/GameClock";

type GameMode = "lobby" | "create" | "playing" | "cpu";
type StakeOption = "free" | "micro" | "standard" | "high";

interface GameSettings {
  stake: StakeOption;
  timeControl: keyof typeof TIME_CONTROLS;
  color: "white" | "black" | "random";
}

const STAKE_OPTIONS: Record<StakeOption, { label: string; value: bigint; description: string }> = {
  free:     { label: "Free Play",   value: BigInt(0),              description: "Practice with no stakes" },
  micro:    { label: "0.0001 ETH",  value: parseEther("0.0001"),   description: "Micro stakes" },
  standard: { label: "0.001 ETH",   value: parseEther("0.001"),    description: "Standard game" },
  high:     { label: "0.01 ETH",    value: parseEther("0.01"),     description: "High stakes" },
};

export default function ChessPage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const [gameMode, setGameMode] = useState<GameMode>("lobby");
  const [settings, setSettings] = useState<GameSettings>({
    stake: "free",
    timeControl: "blitz5",
    color: "white",
  });

  const [game, setGame] = useState(() => new Chess());
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [isMyTurn, setIsMyTurn] = useState(true);

  const startGame = (mode: "cpu" | "playing") => {
    const newGame = new Chess();
    setGame(newGame);
    const color = settings.color === "random"
      ? Math.random() > 0.5 ? "white" : "black"
      : settings.color;
    setPlayerColor(color);
    setIsMyTurn(color === "white");
    setGameMode(mode);
  };

  const handleMove = (from: string, to: string, promotion?: string) => {
    const gameCopy = new Chess(game.fen());
    try {
      gameCopy.move({ from, to, promotion: promotion || "q" });
      setGame(gameCopy);
      setIsMyTurn(false);
      if (gameMode === "cpu" && !gameCopy.isGameOver()) {
        setTimeout(() => makeCpuMove(gameCopy), 500 + Math.random() * 1000);
      }
      return true;
    } catch {
      return false;
    }
  };

  const makeCpuMove = (currentGame: Chess) => {
    const moves = currentGame.moves({ verbose: true });
    if (moves.length === 0) return;
    const captures = moves.filter((m) => m.captured);
    const checks = moves.filter((m) => {
      const testGame = new Chess(currentGame.fen());
      testGame.move(m);
      return testGame.isCheck();
    });
    let selectedMove;
    if (checks.length > 0 && Math.random() > 0.3) {
      selectedMove = checks[Math.floor(Math.random() * checks.length)];
    } else if (captures.length > 0 && Math.random() > 0.4) {
      selectedMove = captures[Math.floor(Math.random() * captures.length)];
    } else {
      selectedMove = moves[Math.floor(Math.random() * moves.length)];
    }
    const gameCopy = new Chess(currentGame.fen());
    gameCopy.move(selectedMove);
    setGame(gameCopy);
    setIsMyTurn(true);
  };

  const backToLobby = () => {
    setGameMode("lobby");
    setGame(new Chess());
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "linear-gradient(180deg, #0b0c10 0%, #0d1a1a 50%, #0b0c10 100%)" }}>
        <div className="text-center space-y-6 px-4">
          <div className="text-7xl mb-2">♟</div>
          <h1 className="text-5xl font-bold" style={{ fontFamily: "Orbitron, sans-serif", color: "#66fcf1", textShadow: "0 0 20px #66fcf1" }}>
            TWC CHESS
          </h1>
          <p className="text-gray-400 text-lg" style={{ fontFamily: "Share Tech Mono, monospace" }}>
            Connect your wallet to play
          </p>
          <div className="flex justify-center mt-4">
            <ConnectButton />
          </div>
          <Link href="/" className="block text-sm mt-6" style={{ color: "#45a29e", fontFamily: "Orbitron, sans-serif" }}>
            ← TWC GUILD
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0b0c10 0%, #0d1a1a 50%, #0b0c10 100%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2" style={{ borderColor: "#45a29e", background: "rgba(11,12,16,0.95)", backdropFilter: "blur(10px)" }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold" style={{ fontFamily: "Orbitron, sans-serif", color: "#66fcf1" }}>
              TWC GUILD
            </Link>
            <span style={{ color: "#45a29e", fontFamily: "Orbitron, sans-serif", fontSize: "0.9rem" }}>/ CHESS</span>
          </div>
          <div className="flex items-center gap-4">
            {balance && (
              <div className="text-sm" style={{ fontFamily: "Share Tech Mono, monospace", color: "#45a29e" }}>
                {parseFloat(formatEther(balance.value)).toFixed(4)} ETH
              </div>
            )}
            <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* LOBBY */}
          {gameMode === "lobby" && (
            <motion.div key="lobby" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "Orbitron, sans-serif", color: "#66fcf1", textShadow: "0 0 20px #66fcf155" }}>
                  TWC CHESS
                </h1>
                <p className="text-gray-400 text-lg" style={{ fontFamily: "Share Tech Mono, monospace" }}>
                  Play chess. Win ETH. All on Base.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setGameMode("create")}
                  className="p-6 rounded-xl border-2 text-left transition-all"
                  style={{ borderColor: "#45a29e66", background: "rgba(69,162,158,0.08)" }}
                >
                  <div className="text-4xl mb-3">&#9823;</div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Orbitron, sans-serif", color: "#45a29e" }}>PLAY VS CPU</h3>
                  <p className="text-gray-400 text-sm" style={{ fontFamily: "Share Tech Mono, monospace" }}>Practice against the computer. Free to play.</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setGameMode("create")}
                  className="p-6 rounded-xl border-2 text-left transition-all"
                  style={{ borderColor: "#4ade8066", background: "rgba(74,222,128,0.08)" }}
                >
                  <div className="text-4xl mb-3">&#9812;</div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Orbitron, sans-serif", color: "#4ade80" }}>BET ETH</h3>
                  <p className="text-gray-400 text-sm" style={{ fontFamily: "Share Tech Mono, monospace" }}>Winner takes all. Base chain escrow.</p>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* CREATE */}
          {gameMode === "create" && (
            <motion.div key="create" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-lg mx-auto space-y-6">
              <button onClick={backToLobby} className="flex items-center gap-2" style={{ color: "#45a29e", fontFamily: "Orbitron, sans-serif" }}>
                ← Back to Lobby
              </button>

              <h2 className="text-3xl font-bold text-center" style={{ fontFamily: "Orbitron, sans-serif", color: "#66fcf1" }}>CREATE GAME</h2>

              {/* Stake */}
              <div className="space-y-3">
                <label className="text-sm" style={{ fontFamily: "Orbitron, sans-serif", color: "#888" }}>STAKE</label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.entries(STAKE_OPTIONS) as [StakeOption, typeof STAKE_OPTIONS.free][]).map(([key, option]) => (
                    <button
                      key={key}
                      onClick={() => setSettings({ ...settings, stake: key })}
                      className="p-4 rounded-lg border-2 transition-all text-left"
                      style={{
                        borderColor: settings.stake === key ? "#45a29e" : "#444",
                        background: settings.stake === key ? "rgba(69,162,158,0.15)" : "transparent",
                      }}
                    >
                      <div className="font-bold text-white" style={{ fontFamily: "Orbitron, sans-serif" }}>{option.label}</div>
                      <div className="text-xs text-gray-400" style={{ fontFamily: "Share Tech Mono, monospace" }}>{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Control */}
              <div className="space-y-3">
                <label className="text-sm" style={{ fontFamily: "Orbitron, sans-serif", color: "#888" }}>TIME CONTROL</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(TIME_CONTROLS).slice(0, 6).map(([key, tc]) => (
                    <button
                      key={key}
                      onClick={() => setSettings({ ...settings, timeControl: key as keyof typeof TIME_CONTROLS })}
                      className="p-3 rounded-lg border-2 transition-all"
                      style={{
                        borderColor: settings.timeControl === key ? "#45a29e" : "#444",
                        background: settings.timeControl === key ? "rgba(69,162,158,0.15)" : "transparent",
                      }}
                    >
                      <div className="text-sm text-white" style={{ fontFamily: "Share Tech Mono, monospace" }}>{tc.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="space-y-3">
                <label className="text-sm" style={{ fontFamily: "Orbitron, sans-serif", color: "#888" }}>PLAY AS</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["white", "black", "random"] as const).map((color) => (
                    <button
                      key={color}
                      onClick={() => setSettings({ ...settings, color })}
                      className="p-3 rounded-lg border-2 transition-all"
                      style={{
                        borderColor: settings.color === color ? "#45a29e" : "#444",
                        background: settings.color === color ? "rgba(69,162,158,0.15)" : "transparent",
                      }}
                    >
                      <div className="text-2xl text-center">{color === "white" ? "♔" : color === "black" ? "♚" : "🎲"}</div>
                      <div className="text-xs text-center text-white capitalize" style={{ fontFamily: "Share Tech Mono, monospace" }}>{color}</div>
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => startGame("cpu")}
                className="w-full py-4 rounded-xl font-bold text-lg"
                style={{ fontFamily: "Orbitron, sans-serif", background: "linear-gradient(135deg, #45a29e, #66fcf1)", color: "#0b0c10" }}
              >
                {settings.stake === "free" ? "START PRACTICE GAME" : `STAKE ${STAKE_OPTIONS[settings.stake].label}`}
              </motion.button>
            </motion.div>
          )}

          {/* PLAYING */}
          {(gameMode === "playing" || gameMode === "cpu") && (
            <motion.div key="playing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex justify-between items-center mb-6">
                <button onClick={backToLobby} className="flex items-center gap-2" style={{ color: "#45a29e", fontFamily: "Orbitron, sans-serif" }}>
                  ← Back to Lobby
                </button>
                {settings.stake !== "free" && (
                  <div className="px-4 py-2 rounded-lg border-2" style={{ borderColor: "#4ade80", background: "rgba(74,222,128,0.1)" }}>
                    <span className="font-bold" style={{ fontFamily: "Orbitron, sans-serif", color: "#4ade80" }}>
                      Prize Pool: {STAKE_OPTIONS[settings.stake].label} × 2
                    </span>
                  </div>
                )}
                <div className="text-sm text-gray-400" style={{ fontFamily: "Share Tech Mono, monospace" }}>
                  {gameMode === "cpu" ? "vs CPU" : "vs Player"}
                </div>
              </div>

              <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                <div className="flex justify-center">
                  <div style={{ width: "min(720px, 90vw, calc(100vh - 200px))", margin: "0 auto" }}>
                    <ChessBoard
                      fen={game.fen()}
                      orientation={playerColor}
                      isMyTurn={isMyTurn}
                      onMove={handleMove}
                      disabled={game.isGameOver()}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg border-2" style={{ borderColor: !isMyTurn ? "#45a29e" : "#444", background: !isMyTurn ? "rgba(69,162,158,0.1)" : "transparent" }}>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{playerColor === "black" ? "♔" : "♚"}</span>
                        <span className="text-white" style={{ fontFamily: "Share Tech Mono, monospace" }}>
                          {gameMode === "cpu" ? "CPU" : "Opponent"}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border-2" style={{ borderColor: isMyTurn ? "#45a29e" : "#444", background: isMyTurn ? "rgba(69,162,158,0.1)" : "transparent" }}>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{playerColor === "white" ? "♔" : "♚"}</span>
                        <span className="text-white" style={{ fontFamily: "Share Tech Mono, monospace" }}>
                          You {address && `(${address.slice(0, 6)}...)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <MoveHistory moves={game.history()} />

                  {game.isGameOver() && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <button
                        onClick={() => startGame(gameMode)}
                        className="w-full py-3 rounded-lg font-bold"
                        style={{ fontFamily: "Orbitron, sans-serif", background: "linear-gradient(135deg, #45a29e, #66fcf1)", color: "#0b0c10" }}
                      >
                        PLAY AGAIN
                      </button>
                      <button
                        onClick={backToLobby}
                        className="w-full py-3 rounded-lg font-bold border-2"
                        style={{ fontFamily: "Orbitron, sans-serif", borderColor: "#45a29e", color: "#45a29e" }}
                      >
                        BACK TO LOBBY
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
