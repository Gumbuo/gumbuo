"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import { useCosmicSound } from "../hooks/useCosmicSound";
import { useAlienPoints } from "../context/AlienPointContext";
import { useGumbuoNFTs } from "../hooks/useGumbuoNFTs";

// Maze cell types
type CellType = 'wall' | 'path' | 'player' | 'coin' | 'portal' | 'powerup' | 'mystery';

interface Position {
  x: number;
  y: number;
}

interface Collectible {
  id: string;
  position: Position;
  type: 'coin' | 'powerup' | 'mystery' | 'ufo' | 'crystal' | 'egg' | 'toxic';
  value: number;
  clicked?: boolean;
}

interface OtherPlayer {
  wallet: string;
  nftCharacter?: string;
  x: number;
  y: number;
}

const GRID_SIZE = 50; // 50x50 maze - EPIC!
const CELL_SIZE = 16; // pixels - smaller cells for huge maze
const VISIBILITY_RADIUS = 2; // How many squares player can see in each direction
const SYNC_INTERVAL = 500; // Sync every 500ms

export default function AlienMaze() {
  const { playSound } = useCosmicSound();
  const alienPointContext = useAlienPoints();
  const { address, isConnected } = useAccount();
  const { nfts, selectedNFT, selectNFT, hasNFTs } = useGumbuoNFTs();

  const [playerPos, setPlayerPos] = useState<Position>({ x: 1, y: 1 });
  const [maze, setMaze] = useState<CellType[][]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [roomId, setRoomId] = useState<string | null>(null);
  const [otherPlayers, setOtherPlayers] = useState<Record<string, OtherPlayer>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a simple maze using a basic algorithm
  const generateMaze = useCallback(() => {
    const newMaze: CellType[][] = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill('wall' as CellType)
    );

    // Create paths using recursive backtracking
    const carvePassage = (x: number, y: number) => {
      const directions = [
        [0, -2], [2, 0], [0, 2], [-2, 0]
      ].sort(() => Math.random() - 0.5);

      newMaze[y][x] = 'path';

      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx > 0 && nx < GRID_SIZE - 1 && ny > 0 && ny < GRID_SIZE - 1 && newMaze[ny][nx] === 'wall') {
          newMaze[y + dy / 2][x + dx / 2] = 'path';
          carvePassage(nx, ny);
        }
      }
    };

    carvePassage(1, 1);

    // Find a valid path cell for the exit portal (far from start)
    // Search from bottom-right corner for a path
    let portalPlaced = false;
    for (let distance = 0; distance < GRID_SIZE && !portalPlaced; distance++) {
      for (let dy = -distance; dy <= distance && !portalPlaced; dy++) {
        for (let dx = -distance; dx <= distance && !portalPlaced; dx++) {
          const x = GRID_SIZE - 2 + dx;
          const y = GRID_SIZE - 2 + dy;

          if (x > 0 && x < GRID_SIZE - 1 && y > 0 && y < GRID_SIZE - 1 && newMaze[y][x] === 'path') {
            newMaze[y][x] = 'portal';
            portalPlaced = true;
          }
        }
      }
    }

    // Fallback: if no portal placed, find ANY path cell
    if (!portalPlaced) {
      for (let y = GRID_SIZE - 1; y >= 0; y--) {
        for (let x = GRID_SIZE - 1; x >= 0; x--) {
          if (newMaze[y][x] === 'path') {
            newMaze[y][x] = 'portal';
            portalPlaced = true;
            break;
          }
        }
        if (portalPlaced) break;
      }
    }

    return newMaze;
  }, []);

  // Generate collectibles
  const generateCollectibles = useCallback((mazeGrid: CellType[][]) => {
    const newCollectibles: Collectible[] = [];
    let id = 0;

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (mazeGrid[y][x] === 'path' && Math.random() < 0.15) {
          const types: ('coin' | 'powerup' | 'mystery' | 'ufo' | 'crystal' | 'egg' | 'toxic')[] = [
            'coin', 'coin', 'crystal', 'crystal', // Common
            'powerup', 'egg', 'egg', // Uncommon
            'mystery', 'ufo', 'toxic' // Rare
          ];
          const type = types[Math.floor(Math.random() * types.length)];

          // Alien-themed values
          const valueMap = {
            coin: 10,      // 💎 Diamond
            crystal: 15,   // 🔮 Alien Crystal
            egg: 20,       // 🥚 Alien Egg
            powerup: 25,   // ⚡ Energy Cell
            toxic: 30,     // ☢️ Radioactive Waste
            ufo: 40,       // 🛸 Mini UFO
            mystery: 50    // ❓ Mystery Box
          };

          newCollectibles.push({
            id: `collectible-${id++}`,
            position: { x, y },
            type,
            value: valueMap[type],
            clicked: false
          });
        }
      }
    }

    return newCollectibles;
  }, []);

  // Initialize game
  // Multiplayer: Create or join game room
  const createGameRoom = useCallback(async (mazeData: CellType[][], collectiblesData: Collectible[]) => {
    try {
      const response = await fetch('/api/maze-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          maze: JSON.stringify(mazeData),
          collectibles: JSON.stringify(collectiblesData)
        })
      });

      const data = await response.json();
      if (data.success) {
        setRoomId(data.roomId);
        return data.roomId;
      }
    } catch (error) {
      console.error('Failed to create game room:', error);
    }
    return null;
  }, []);

  // Multiplayer: Sync player position
  const syncPlayerPosition = useCallback(async () => {
    if (!roomId || !address) return;

    try {
      await fetch('/api/maze-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          roomId,
          wallet: address,
          nftCharacter: selectedNFT?.alienType,
          x: playerPos.x,
          y: playerPos.y
        })
      });
    } catch (error) {
      console.error('Failed to sync player position:', error);
    }
  }, [roomId, address, playerPos, selectedNFT]);

  // Multiplayer: Fetch other players
  const fetchOtherPlayers = useCallback(async () => {
    if (!roomId || !address) return;

    try {
      const response = await fetch(`/api/maze-game?roomId=${roomId}`);
      const data = await response.json();

      if (data.success && data.room) {
        console.log('Room state:', data.room.players);

        // Filter out current player
        const others = Object.entries(data.room.players).reduce((acc, [wallet, player]) => {
          if (wallet.toLowerCase() !== address.toLowerCase()) {
            acc[wallet] = player as OtherPlayer;
          }
          return acc;
        }, {} as Record<string, OtherPlayer>);

        console.log('Other players:', others);
        setOtherPlayers(others);

        // Update collectibles if they changed
        const serverCollectibles = JSON.parse(data.room.collectibles);
        if (serverCollectibles.length !== collectibles.length) {
          setCollectibles(serverCollectibles);
        }
      }
    } catch (error) {
      console.error('Failed to fetch other players:', error);
    }
  }, [roomId, address, collectibles.length]);

  // Multiplayer: Sync collectibles when collected
  const syncCollectibles = useCallback(async (newCollectibles: Collectible[]) => {
    if (!roomId) return;

    try {
      await fetch('/api/maze-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'collect',
          roomId,
          collectibles: JSON.stringify(newCollectibles)
        })
      });
    } catch (error) {
      console.error('Failed to sync collectibles:', error);
    }
  }, [roomId]);

  const initGame = useCallback(async () => {
    const newMaze = generateMaze();
    const newCollectibles = generateCollectibles(newMaze);

    setMaze(newMaze);
    setCollectibles(newCollectibles);
    setPlayerPos({ x: 1, y: 1 });
    setScore(0);
    setTimeElapsed(0);
    setIsGameActive(true);
    setGameWon(false);
    setRevealedCells(new Set());
    setOtherPlayers({});

    // Use a global room for multiplayer (everyone joins the same room)
    const globalRoomId = 'global-maze-room';

    // Try to join existing global room first
    try {
      const checkResponse = await fetch(`/api/maze-game?roomId=${globalRoomId}`);
      const checkData = await checkResponse.json();

      if (checkData.success && checkData.room) {
        // Room exists, use existing maze and collectibles
        const existingMaze = JSON.parse(checkData.room.maze);
        const existingCollectibles = JSON.parse(checkData.room.collectibles);
        setMaze(existingMaze);
        setCollectibles(existingCollectibles);
        setRoomId(globalRoomId);
        console.log('Joined existing global room');

        // Immediately announce our presence
        if (address) {
          await fetch('/api/maze-game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'join',
              roomId: globalRoomId,
              wallet: address,
              nftCharacter: selectedNFT?.alienType,
              x: 1,
              y: 1
            })
          });
        }
      } else {
        // Room doesn't exist, create it
        const response = await fetch('/api/maze-game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            roomId: globalRoomId,
            maze: JSON.stringify(newMaze),
            collectibles: JSON.stringify(newCollectibles)
          })
        });
        const data = await response.json();
        if (data.success) {
          setRoomId(globalRoomId);
          console.log('Created global room');

          // Immediately announce our presence
          if (address) {
            await fetch('/api/maze-game', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'join',
                roomId: globalRoomId,
                wallet: address,
                nftCharacter: selectedNFT?.alienType,
                x: 1,
                y: 1
              })
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to setup multiplayer room:', error);
    }
  }, [generateMaze, generateCollectibles, address, selectedNFT]);

  // Reveal cells around player when they move
  useEffect(() => {
    if (!isGameActive) return;

    const newRevealed = new Set(revealedCells);

    // Reveal all cells within visibility range
    for (let dy = -VISIBILITY_RADIUS; dy <= VISIBILITY_RADIUS; dy++) {
      for (let dx = -VISIBILITY_RADIUS; dx <= VISIBILITY_RADIUS; dx++) {
        const x = playerPos.x + dx;
        const y = playerPos.y + dy;
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
          newRevealed.add(`${x},${y}`);
        }
      }
    }

    setRevealedCells(newRevealed);
  }, [playerPos, isGameActive]);

  // Start timer
  useEffect(() => {
    if (isGameActive && !gameWon) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isGameActive, gameWon]);

  // Multiplayer: Sync player position when it changes
  useEffect(() => {
    if (isGameActive && roomId) {
      syncPlayerPosition();
    }
  }, [playerPos, isGameActive, roomId, syncPlayerPosition]);

  // Multiplayer: Periodically fetch other players
  useEffect(() => {
    if (isGameActive && roomId) {
      syncIntervalRef.current = setInterval(() => {
        fetchOtherPlayers();
      }, SYNC_INTERVAL);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [isGameActive, roomId, fetchOtherPlayers]);

  // Multiplayer: Leave room when game ends or component unmounts
  useEffect(() => {
    return () => {
      if (roomId && address) {
        fetch(`/api/maze-game?roomId=${roomId}&wallet=${address}`, {
          method: 'DELETE'
        }).catch(console.error);
      }
    };
  }, [roomId, address]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isGameActive || gameWon) return;

      let newX = playerPos.x;
      let newY = playerPos.y;

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          newY = playerPos.y - 1;
          break;
        case 's':
        case 'arrowdown':
          newY = playerPos.y + 1;
          break;
        case 'a':
        case 'arrowleft':
          newX = playerPos.x - 1;
          break;
        case 'd':
        case 'arrowright':
          newX = playerPos.x + 1;
          break;
        default:
          return;
      }

      // Check collision with walls
      if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
        const targetCell = maze[newY]?.[newX];

        if (targetCell !== 'wall') {
          setPlayerPos({ x: newX, y: newY });
          playSound('hover');

          // Check for collectibles at new position
          const collectible = collectibles.find(
            c => c.position.x === newX && c.position.y === newY && !c.clicked
          );

          if (collectible) {
            handleCollectiblePickup(collectible);
          }

          // Check for portal (win condition)
          if (targetCell === 'portal') {
            handleWin();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPos, maze, isGameActive, gameWon, collectibles, playSound]);

  const handleCollectiblePickup = (collectible: Collectible) => {
    const newCollectibles = collectibles.map(c => c.id === collectible.id ? { ...c, clicked: true } : c);
    setCollectibles(newCollectibles);
    setScore(prev => prev + collectible.value);
    playSound('click');

    // Sync collectibles to multiplayer room
    syncCollectibles(newCollectibles);
  };

  const handleCollectibleClick = (collectible: Collectible) => {
    if (!collectible.clicked && isGameActive && !gameWon) {
      // Only allow clicking collectibles adjacent to player or on same spot
      const distance = Math.abs(collectible.position.x - playerPos.x) +
                      Math.abs(collectible.position.y - playerPos.y);

      if (distance <= 1) {
        handleCollectiblePickup(collectible);
      }
    }
  };

  const handleWin = async () => {
    setGameWon(true);
    setIsGameActive(false);

    // Award alien points based on performance
    const timeBonus = Math.max(0, 300 - timeElapsed);
    const finalPoints = score + timeBonus;

    if (alienPointContext) {
      alienPointContext.setAlienPoints(alienPointContext.alienPoints + finalPoints);
    }

    // Submit score to leaderboard if wallet is connected
    if (isConnected && address) {
      try {
        await fetch("/api/maze-leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet: address,
            nftCharacter: selectedNFT?.alienType,
            score: finalPoints,
            timeElapsed,
            collectedItems: collectibles.filter(c => c.clicked).length,
            totalItems: collectibles.length
          })
        });
      } catch (error) {
        console.error("Error submitting score:", error);
      }
    }

    playSound('click');
  };

  const getCharacterEmoji = () => {
    if (selectedNFT) {
      const emojiMap: Record<string, string> = {
        nyx: "👾",
        zorb: "🛸",
        baob: "👽",
        apelian: "🦍",
        j3d1: "🤖",
        zit: "⚡"
      };
      return emojiMap[selectedNFT.alienType] || "👽";
    }
    return "👽";
  };

  const getCharacterImageUrl = () => {
    if (selectedNFT) {
      return `/gumbuo-fighters-images/${selectedNFT.alienType}.png`;
    }
    return `/gumbuo-fighters-images/nyx.png`; // default
  };

  const getCellContent = (x: number, y: number) => {
    // Don't show content if not visible (fog of war)
    if (!isCellVisible(x, y)) {
      return '';
    }

    // Check if current player is here
    if (playerPos.x === x && playerPos.y === y) {
      return (
        <img
          src={getCharacterImageUrl()}
          alt="character"
          style={{
            width: '14px',
            height: '14px',
            imageRendering: 'pixelated',
            objectFit: 'contain'
          }}
        />
      );
    }

    // Check if another player is here (multiplayer)
    const otherPlayer = Object.values(otherPlayers).find(p => p.x === x && p.y === y);
    if (otherPlayer) {
      const otherImageUrl = otherPlayer.nftCharacter
        ? `/gumbuo-fighters-images/${otherPlayer.nftCharacter}.png`
        : `/gumbuo-fighters-images/nyx.png`;

      return (
        <img
          src={otherImageUrl}
          alt="other player"
          style={{
            width: '14px',
            height: '14px',
            imageRendering: 'pixelated',
            objectFit: 'contain',
            opacity: 0.7 // Slightly transparent to distinguish from your character
          }}
        />
      );
    }

    // Check for collectibles
    const collectible = collectibles.find(
      c => c.position.x === x && c.position.y === y && !c.clicked
    );
    if (collectible) {
      switch (collectible.type) {
        case 'coin': return '💎';
        case 'crystal': return '🔮';
        case 'egg': return '🥚';
        case 'powerup': return '⚡';
        case 'toxic': return '☢️';
        case 'ufo': return '🛸';
        case 'mystery': return '❓';
      }
    }

    // Check maze cell type
    const cell = maze[y]?.[x];
    if (cell === 'portal') return '🌀';
    if (cell === 'wall') return '';

    return '';
  };

  // Check if a cell is visible (currently in view OR previously revealed)
  const isCellVisible = (x: number, y: number): boolean => {
    return revealedCells.has(`${x},${y}`);
  };

  // Check if cell is currently in player's immediate view
  const isInCurrentView = (x: number, y: number): boolean => {
    const distance = Math.max(
      Math.abs(x - playerPos.x),
      Math.abs(y - playerPos.y)
    );
    return distance <= VISIBILITY_RADIUS;
  };

  const getCellStyle = (x: number, y: number): React.CSSProperties => {
    const cell = maze[y]?.[x];
    const isPlayer = playerPos.x === x && playerPos.y === y;
    const isVisible = isCellVisible(x, y);
    const inCurrentView = isInCurrentView(x, y);

    // Fog of war - hide cells that haven't been revealed
    if (!isVisible) {
      return {
        backgroundColor: '#000000',
        border: '1px solid #111111',
        opacity: 0.3
      };
    }

    if (isPlayer) {
      return {
        backgroundColor: '#00ff99',
        border: '2px solid #00ff99',
        boxShadow: '0 0 20px #00ff99'
      };
    }

    if (cell === 'wall') {
      return {
        backgroundColor: '#0066ff', // Blue walls
        border: '1px solid #0088ff',
        opacity: inCurrentView ? 1 : 0.5 // Dimmer if not in current view
      };
    }

    if (cell === 'portal') {
      return {
        backgroundColor: '#8e44ad',
        border: '2px solid #9b59b6',
        boxShadow: inCurrentView ? '0 0 15px #8e44ad' : 'none',
        opacity: inCurrentView ? 1 : 0.6
      };
    }

    // Path cells - green
    return {
      backgroundColor: '#00aa00', // Green paths
      border: '1px solid #00cc00',
      opacity: inCurrentView ? 1 : 0.5 // Dimmer if not in current view
    };
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-black/80 rounded-3xl border-2 border-cyan-400 holographic-panel">
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      {/* Game Header */}
      <div className="relative z-10 mb-6 text-center">
        <h2 className="font-alien text-4xl text-cyan-400 holographic-text mb-2">
          👽 ALIEN MAZE 👽
        </h2>
        <p className="text-cyan-300 text-sm">Use WASD or Arrow Keys to navigate • Limited visibility - explore carefully!</p>
      </div>

      {/* NFT Character Selector */}
      {!isGameActive && isConnected && hasNFTs && (
        <div className="relative z-10 mb-4 bg-purple-900/40 border-2 border-purple-400 rounded-xl px-6 py-4">
          <div className="text-purple-400 text-sm font-bold mb-3 text-center">SELECT YOUR CHARACTER</div>
          <div className="flex gap-3 justify-center">
            {nfts.map((nft) => {
              return (
                <button
                  key={nft.tokenId}
                  onClick={() => {
                    selectNFT(nft);
                    playSound("click");
                  }}
                  onMouseEnter={() => playSound("hover")}
                  className={`p-2 rounded-xl border-2 transition-all hover:scale-110 ${
                    selectedNFT?.tokenId === nft.tokenId
                      ? "bg-cyan-500/40 border-cyan-400 shadow-lg shadow-cyan-500/50"
                      : "bg-gray-800/40 border-gray-600 hover:border-purple-400"
                  }`}
                >
                  <img
                    src={`/gumbuo-fighters-images/${nft.alienType}.png`}
                    alt={nft.alienType}
                    style={{
                      width: '64px',
                      height: '64px',
                      imageRendering: 'pixelated',
                      objectFit: 'contain'
                    }}
                  />
                </button>
              );
            })}
          </div>
          <div className="text-purple-300 text-xs mt-2 text-center">
            Playing as: <span className="font-bold">{selectedNFT?.alienType.toUpperCase() || "DEFAULT"}</span>
          </div>
        </div>
      )}

      {/* Wallet Connection Prompt */}
      {!isConnected && !isGameActive && (
        <div className="relative z-10 mb-4 bg-yellow-900/40 border-2 border-yellow-400 rounded-xl px-6 py-3 text-center max-w-md">
          <div className="text-yellow-400 text-sm">
            💡 Connect your wallet to use your Gumbuo Fighter NFTs and save your scores to the leaderboard!
          </div>
        </div>
      )}

      {/* Game Stats */}
      <div className="relative z-10 flex gap-6 mb-4 text-center">
        <div className="bg-cyan-900/40 border-2 border-cyan-400 rounded-xl px-6 py-2">
          <div className="text-cyan-400 text-sm font-bold">SCORE</div>
          <div className="text-cyan-300 text-2xl font-alien">{score}</div>
        </div>
        <div className="bg-purple-900/40 border-2 border-purple-400 rounded-xl px-6 py-2">
          <div className="text-purple-400 text-sm font-bold">TIME</div>
          <div className="text-purple-300 text-2xl font-alien">{timeElapsed}s</div>
        </div>
        <div className="bg-green-900/40 border-2 border-green-400 rounded-xl px-6 py-2">
          <div className="text-green-400 text-sm font-bold">COLLECTED</div>
          <div className="text-green-300 text-2xl font-alien">
            {collectibles.filter(c => c.clicked).length}/{collectibles.length}
          </div>
        </div>
        {isGameActive && roomId && (
          <div className="bg-orange-900/40 border-2 border-orange-400 rounded-xl px-6 py-2">
            <div className="text-orange-400 text-sm font-bold">PLAYERS</div>
            <div className="text-orange-300 text-2xl font-alien">
              {Object.keys(otherPlayers).length + 1}
            </div>
          </div>
        )}
      </div>

      {/* Start/Reset Button */}
      {!isGameActive && (
        <button
          onClick={initGame}
          className="relative z-10 mb-4 px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-alien text-xl rounded-xl transition-all hover:scale-105 shadow-lg shadow-cyan-500/50"
        >
          {gameWon ? '🎉 PLAY AGAIN 🎉' : 'START GAME'}
        </button>
      )}

      {/* Win Message */}
      {gameWon && (
        <div className="relative z-10 mb-4 bg-green-900/60 border-2 border-green-400 rounded-xl px-8 py-4 text-center animate-pulse">
          <div className="text-green-400 font-alien text-3xl mb-2">🏆 YOU WIN! 🏆</div>
          <div className="text-green-300 text-lg">
            Score: {score} | Time: {timeElapsed}s
          </div>
          <div className="text-cyan-400 text-xl font-bold mt-2">
            +{score + Math.max(0, 300 - timeElapsed)} Alien Points!
          </div>
        </div>
      )}

      {/* Maze Grid */}
      <div
        className="relative z-10 inline-block p-4 bg-black/60 rounded-xl border-2 border-cyan-500/50"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gap: '1px'
        }}
      >
        {maze.map((row, y) =>
          row.map((_, x) => {
            const collectible = collectibles.find(
              c => c.position.x === x && c.position.y === y && !c.clicked
            );

            return (
              <div
                key={`${x}-${y}`}
                onClick={() => collectible && handleCollectibleClick(collectible)}
                className={`flex items-center justify-center text-2xl ${
                  collectible ? 'cursor-pointer hover:scale-110' : ''
                } transition-all`}
                style={{
                  ...getCellStyle(x, y),
                  width: `${CELL_SIZE}px`,
                  height: `${CELL_SIZE}px`,
                  borderRadius: '2px'
                }}
              >
                {getCellContent(x, y)}
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="relative z-10 mt-4 text-center text-sm text-cyan-300">
        <div className="text-cyan-400 font-alien mb-2">COLLECTIBLES</div>
        <div className="flex gap-3 justify-center flex-wrap">
          <span>💎 +10</span>
          <span>🔮 +15</span>
          <span>🥚 +20</span>
          <span>⚡ +25</span>
          <span>☢️ +30</span>
          <span>🛸 +40</span>
          <span>❓ +50</span>
          <span className="text-purple-400">🌀 = EXIT</span>
        </div>
      </div>
    </div>
  );
}
