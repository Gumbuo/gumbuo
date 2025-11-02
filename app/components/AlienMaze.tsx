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
  const [isInIframe, setIsInIframe] = useState(false);

  // Check if we're in an iframe
  useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);

  // Sync alien points with parent window when in iframe
  useEffect(() => {
    if (!isInIframe || !alienPointContext) return;

    // Request current alien points from parent on mount
    window.parent.postMessage({ type: 'REQUEST_ALIEN_POINTS' }, '*');

    // Listen for alien points updates from parent
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ALIEN_POINTS_UPDATE') {
        console.log('Received alien points from parent:', event.data.alienPoints);
        alienPointContext.setAlienPoints(event.data.alienPoints);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isInIframe, alienPointContext]);

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      console.log("📥 Load effect triggered");
      console.log("📥 Wallet address:", address);
      console.log("📥 isConnected:", isConnected);

      if (!address) {
        console.log("📥 ❌ No wallet address, skipping progress load");
        return;
      }

      console.log("📥 ✅ Loading maze progress for wallet:", address);
      try {
        const response = await fetch(`/api/user-data?wallet=${address}`);
        const data = await response.json();

        console.log("📥 User data response:", data);

        if (data.success && data.userData.mazeProgress) {
          const progress = data.userData.mazeProgress;
          console.log("📥 ✅ Found maze progress:", progress);
          console.log("📥 Progress details - Level:", progress.currentLevel, "SessionScore:", progress.sessionScore, "LastPlayed:", progress.lastPlayed);

          // Only offer to continue if they have progress and played recently (within 48 hours)
          const hoursSinceLastPlay = (Date.now() - progress.lastPlayed) / (1000 * 60 * 60);
          console.log("📥 Hours since last play:", hoursSinceLastPlay);

          // Show continue prompt if they have ANY progress at all
          if (progress.lastPlayed > 0 && hoursSinceLastPlay < 48) {
            console.log("📥 ✅✅✅ Showing continue prompt with level:", progress.currentLevel);
            console.log("📥 Setting savedProgress state...");
            setSavedProgress({
              currentLevel: progress.currentLevel,
              sessionScore: progress.sessionScore,
              levelsCompletedThisSession: progress.levelsCompletedThisSession
            });
            setUnclaimedAP(progress.sessionScore); // Load unclaimed AP
            setShowContinuePrompt(true);
            console.log("📥 showContinuePrompt should now be TRUE");
          } else {
            console.log("📥 ❌ Progress too old or empty:", {
              lastPlayed: progress.lastPlayed,
              hoursSinceLastPlay,
              tooOld: hoursSinceLastPlay >= 48
            });
          }
        } else {
          console.log("📥 ❌ No maze progress found in response");
        }
      } catch (error) {
        console.error("📥 ❌ Error loading maze progress:", error);
      }
    };

    loadProgress();
  }, [address, isConnected]);

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
  const [currentLevel, setCurrentLevel] = useState(1);
  const [sessionScore, setSessionScore] = useState(0);
  const [levelsCompletedThisSession, setLevelsCompletedThisSession] = useState(0);
  const [unclaimedAP, setUnclaimedAP] = useState(0);
  const [savedProgress, setSavedProgress] = useState<{ currentLevel: number; sessionScore: number; levelsCompletedThisSession: number } | null>(null);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
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

  const initGame = useCallback(async (
    isNewSession: boolean = true,
    startLevel?: number,
    startSessionScore?: number,
    startLevelsCompleted?: number
  ) => {
    console.log("🎮 initGame called");
    console.log("🎮 isNewSession:", isNewSession);
    console.log("🎮 startLevel:", startLevel);
    console.log("🎮 startSessionScore:", startSessionScore);
    console.log("🎮 currentLevel before init:", currentLevel);
    console.log("🎮 sessionScore before init:", sessionScore);

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

    // Set session stats based on parameters or state
    if (isNewSession) {
      console.log("🎮 Resetting to level 1 (new session)");
      setCurrentLevel(1);
      setSessionScore(0);
      setLevelsCompletedThisSession(0);
    } else if (startLevel !== undefined) {
      // Use provided values (for continuing saved progress)
      console.log("🎮 Continuing from saved level:", startLevel);
      setCurrentLevel(startLevel);
      setSessionScore(startSessionScore || 0);
      setLevelsCompletedThisSession(startLevelsCompleted || 0);
    } else {
      console.log("🎮 Keeping current progress - level:", currentLevel);
    }

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

  const saveProgress = async (level: number, sessScore: number, levelsComp: number) => {
    if (!address) {
      console.log("💾 Cannot save - no wallet address");
      return;
    }

    console.log("💾 Saving progress to database:", {
      wallet: address,
      level,
      sessScore,
      levelsComp
    });

    try {
      const response = await fetch("/api/user-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          mazeProgress: {
            currentLevel: level,
            sessionScore: sessScore,
            levelsCompletedThisSession: levelsComp,
            lastPlayed: Date.now()
          }
        })
      });

      const data = await response.json();
      console.log("💾 Save response:", data);

      if (data.success) {
        console.log("✅ Progress saved successfully!");
      } else {
        console.error("❌ Failed to save progress:", data);
      }
    } catch (error) {
      console.error("❌ Error saving maze progress:", error);
    }
  };

  const handleWin = async () => {
    console.log("🏆 Level complete! Current level:", currentLevel);
    console.log("🏆 Wallet connected?", isConnected, "Address:", address);
    setGameWon(true);
    setIsGameActive(false);

    // Update session totals - just score, no bonus
    const newSessionScore = sessionScore + score;
    const newLevelsCompleted = levelsCompletedThisSession + 1;
    const nextLevel = currentLevel + 1;
    console.log("🏆 New session score:", newSessionScore, "Levels completed:", newLevelsCompleted);

    setSessionScore(newSessionScore);
    setLevelsCompletedThisSession(newLevelsCompleted);
    setUnclaimedAP(newSessionScore); // Unclaimed AP = total session score
    setScore(0); // Reset current level score since it's been added to session

    // IMPORTANT: Update currentLevel in React state to match what we save to database
    // This prevents handleClaimRewards from overwriting progress with old level
    setCurrentLevel(nextLevel);

    // Save progress for next level
    console.log("🏆 Saving progress for next level:", nextLevel);
    if (isConnected && address) {
      await saveProgress(nextLevel, newSessionScore, newLevelsCompleted);
    } else {
      console.log("⚠️ Progress not saved - wallet not connected");
    }

    // Submit score to leaderboard if wallet is connected
    if (isConnected && address) {
      try {
        // Submit to leaderboard
        await fetch("/api/maze-leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet: address,
            nftCharacter: selectedNFT?.alienType,
            score: score,
            timeElapsed,
            collectedItems: collectibles.filter(c => c.clicked).length,
            totalItems: collectibles.length
          })
        });

        // Update maze stats in user data
        await fetch("/api/user-data", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet: address,
            statUpdates: {
              mazeLevelsCompleted: 1,
              mazeHighestLevel: currentLevel,
              mazeTotalScore: score,
              mazeAPEarned: 0 // No AP awarded yet, only on claim
            }
          })
        });
      } catch (error) {
        console.error("Error updating stats:", error);
      }
    }

    playSound('click');
  };

  const handleClaimRewards = async () => {
    if (!alienPointContext) {
      console.error("Alien point context not available");
      return;
    }

    // Calculate total claimable AP (session score + current level score)
    const totalClaimable = sessionScore + score;

    console.log("Claiming rewards:", {
      sessionScore,
      currentScore: score,
      totalClaimable,
      currentAP: alienPointContext.alienPoints
    });

    if (totalClaimable === 0) {
      console.log("No points to claim");
      return;
    }

    // Award the AP
    const newTotal = alienPointContext.alienPoints + totalClaimable;
    console.log("Updating alien points from", alienPointContext.alienPoints, "to", newTotal);
    alienPointContext.setAlienPoints(newTotal);

    // Notify parent window if we're in an iframe
    if (isInIframe && window.parent) {
      window.parent.postMessage({
        type: 'ALIEN_POINTS_CLAIMED',
        alienPoints: newTotal,
        claimed: totalClaimable
      }, '*');
    }

    console.log("Successfully claimed", totalClaimable, "AP! New total:", newTotal);

    // Play success sound
    playSound('click');

    // Update maze stats and leaderboard if wallet connected
    if (isConnected && address) {
      try {
        await fetch("/api/user-data", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet: address,
            statUpdates: {
              mazeAPEarned: totalClaimable
            }
          })
        });

        // Update alien points in leaderboard
        await fetch("/api/leaderboard", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet: address,
            alienPoints: newTotal
          })
        });

        // Also update via points API
        await fetch("/api/points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet: address,
            points: totalClaimable,
            source: "arena"
          })
        });
      } catch (error) {
        console.error("Error updating stats:", error);
      }
    }

    // Reset only the claimed amounts, keep game progress
    setUnclaimedAP(0);
    setSessionScore(0);
    setScore(0); // Reset current level score since we claimed it
    // Keep currentLevel, levelsCompletedThisSession, gameWon, and isGameActive
    // This allows users to continue progressing without restarting

    // Save current progress (with claimed points reset)
    if (address) {
      await saveProgress(currentLevel, 0, levelsCompletedThisSession);
    }

    console.log("Claim complete! Game continues at level", currentLevel);
  };

  const handleSaveAndExit = async () => {
    console.log("💾 SAVE & EXIT clicked");
    console.log("💾 Wallet connected?", isConnected, "Address:", address);
    console.log("💾 Current state - Level:", currentLevel, "Score:", score, "Session Score:", sessionScore);

    if (!isConnected || !address) {
      alert("⚠️ Connect your wallet to save progress!");
      console.log("❌ Cannot save - wallet not connected");
      setIsGameActive(false);
      setGameWon(false);
      return;
    }

    // Add current level's score to unclaimed AP before saving
    const totalUnclaimed = sessionScore + score;
    setUnclaimedAP(totalUnclaimed);
    setSessionScore(totalUnclaimed); // Update session score to include current level

    console.log("💾 Saving progress:", {
      currentLevel,
      totalUnclaimed,
      levelsCompletedThisSession
    });

    // Save current progress including unclaimed AP
    await saveProgress(currentLevel, totalUnclaimed, levelsCompletedThisSession);

    // Reset game state
    setIsGameActive(false);
    setGameWon(false);
    setScore(0); // Reset current level score
    playSound('click');
    console.log("💾 Game state reset, progress saved");
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
    <div className="flex flex-col items-center justify-center p-4 bg-black/80 border-2 border-cyan-400 holographic-panel" style={{ borderRadius: '40px' }}>
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
        <div className="relative z-10 mb-4 bg-purple-900/40 border-2 border-purple-400 rounded-3xl px-6 py-4">
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
                  className={`p-2 rounded-2xl border-2 transition-all hover:scale-110 ${
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
        <div className="relative z-10 mb-4 bg-yellow-900/40 border-2 border-yellow-400 rounded-3xl px-6 py-3 text-center max-w-md">
          <div className="text-yellow-400 text-sm">
            💡 Connect your wallet to use your Gumbuo Fighter NFTs and save your scores to the leaderboard!
          </div>
        </div>
      )}

      {/* Game Stats */}
      <div className="relative z-10 flex gap-6 mb-4 text-center flex-wrap justify-center">
        <div className="bg-yellow-900/40 border-2 border-yellow-400 rounded-2xl px-6 py-2">
          <div className="text-yellow-400 text-sm font-bold">LEVEL</div>
          <div className="text-yellow-300 text-2xl font-alien">{currentLevel}</div>
        </div>
        <div className="bg-cyan-900/40 border-2 border-cyan-400 rounded-2xl px-6 py-2">
          <div className="text-cyan-400 text-sm font-bold">SCORE</div>
          <div className="text-cyan-300 text-2xl font-alien">{score}</div>
        </div>
        <div className="bg-purple-900/40 border-2 border-purple-400 rounded-2xl px-6 py-2">
          <div className="text-purple-400 text-sm font-bold">TIME</div>
          <div className="text-purple-300 text-2xl font-alien">{timeElapsed}s</div>
        </div>
        <div className="bg-green-900/40 border-2 border-green-400 rounded-2xl px-6 py-2">
          <div className="text-green-400 text-sm font-bold">COLLECTED</div>
          <div className="text-green-300 text-2xl font-alien">
            {collectibles.filter(c => c.clicked).length}/{collectibles.length}
          </div>
        </div>
        {isGameActive && roomId && (
          <div className="bg-orange-900/40 border-2 border-orange-400 rounded-2xl px-6 py-2">
            <div className="text-orange-400 text-sm font-bold">PLAYERS</div>
            <div className="text-orange-300 text-2xl font-alien">
              {Object.keys(otherPlayers).length + 1}
            </div>
          </div>
        )}
      </div>

      {/* Session Stats (shown when there's progress) */}
      {(levelsCompletedThisSession > 0 || sessionScore > 0 || score > 0) && (
        <div className="relative z-10 mb-4 bg-purple-900/30 border-2 border-purple-400 rounded-2xl px-6 py-3">
          <div className="text-purple-400 text-xs font-bold mb-1">SESSION PROGRESS</div>
          <div className="text-purple-300 text-sm">
            Levels: {levelsCompletedThisSession} | Session Score: {sessionScore} | Current Level: {score} | Total Claimable: {sessionScore + score} AP
          </div>
        </div>
      )}

      {/* Claim Rewards Button - Show anytime there are claimable points */}
      {(sessionScore > 0 || score > 0 || unclaimedAP > 0) && (
        <div className="relative z-10 mb-4">
          <button
            onClick={handleClaimRewards}
            className="px-12 py-5 text-white font-alien text-2xl rounded-3xl transition-all hover:scale-110 shadow-lg animate-pulse"
            style={{
              backgroundColor: '#10b981',
              boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.5)'
            }}
            onMouseEnter={(e) => {
              playSound('hover');
              e.currentTarget.style.backgroundColor = '#059669';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981';
            }}
          >
            💰 CLAIM {sessionScore + score} ALIEN POINTS 💰
          </button>
        </div>
      )}

      {/* Continue Saved Progress Prompt */}
      {(() => {
        console.log("🎨 Render check - showContinuePrompt:", showContinuePrompt, "savedProgress:", savedProgress, "isGameActive:", isGameActive, "gameWon:", gameWon);
        const shouldShow = showContinuePrompt && savedProgress && !isGameActive && !gameWon;
        console.log("🎨 Should show Continue prompt?", shouldShow);
        return null;
      })()}
      {showContinuePrompt && savedProgress && !isGameActive && !gameWon && (
        <div className="relative z-10 mb-4 bg-purple-900/60 border-2 border-purple-400 rounded-3xl px-8 py-6 max-w-2xl">
          <div className="text-purple-400 font-alien text-2xl mb-4 text-center">
            📜 SAVED PROGRESS FOUND 📜
          </div>
          <div className="text-purple-300 text-center mb-4">
            <div className="text-2xl font-bold mb-2">Continue from Level {savedProgress.currentLevel}?</div>
            <div className="text-base mt-3 bg-purple-800/40 rounded-xl p-3">
              <div>📊 Unclaimed Points: {savedProgress.sessionScore}</div>
              <div>🏆 Levels Completed: {savedProgress.levelsCompletedThisSession}</div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                // Load saved progress and start game immediately
                console.log("🔵 CONTINUE clicked. Saved progress:", savedProgress);
                console.log("🔵 Starting game at level:", savedProgress.currentLevel);

                // Set states for UI display
                setCurrentLevel(savedProgress.currentLevel);
                setSessionScore(savedProgress.sessionScore);
                setLevelsCompletedThisSession(savedProgress.levelsCompletedThisSession);
                setUnclaimedAP(savedProgress.sessionScore);
                setShowContinuePrompt(false);
                setSavedProgress(null);

                // Start game immediately with saved progress (bypass state delay)
                initGame(false, savedProgress.currentLevel, savedProgress.sessionScore, savedProgress.levelsCompletedThisSession);
              }}
              className="px-8 py-3 text-white font-alien text-lg rounded-3xl transition-all hover:scale-105 shadow-lg"
              style={{
                backgroundColor: '#3b82f6',
                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }}
            >
              ▶️ CONTINUE
            </button>
            <button
              onClick={async () => {
                setShowContinuePrompt(false);
                setSavedProgress(null);
                // Clear saved progress from database
                if (address) {
                  await saveProgress(1, 0, 0);
                }
                // Reset all progress
                setCurrentLevel(1);
                setSessionScore(0);
                setLevelsCompletedThisSession(0);
                setUnclaimedAP(0);
                // Start fresh game
                initGame(true);
              }}
              className="px-8 py-3 text-white font-alien text-lg rounded-3xl transition-all hover:scale-105 shadow-lg"
              style={{
                backgroundColor: '#22c55e',
                boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#16a34a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#22c55e';
              }}
            >
              🆕 START NEW
            </button>
          </div>
        </div>
      )}

      {/* Start/Reset Button */}
      {(() => {
        console.log("🎨 Start button check - isGameActive:", isGameActive, "showContinuePrompt:", showContinuePrompt);
        const shouldShowStart = !isGameActive && !showContinuePrompt;
        console.log("🎨 Should show START button?", shouldShowStart);
        return null;
      })()}
      {!isGameActive && !showContinuePrompt && (
        <div className="relative z-10 mb-4 flex gap-4">
          <button
            onClick={() => {
              console.log("🟢 START button clicked");
              console.log("🟢 gameWon:", gameWon);
              console.log("🟢 currentLevel:", currentLevel);
              console.log("🟢 sessionScore:", sessionScore);

              if (gameWon) {
                // Continue to next level (currentLevel was already incremented in handleWin)
                console.log("🟢 Game won, starting next level:", currentLevel);
                initGame(false, currentLevel, sessionScore, levelsCompletedThisSession);
              } else {
                // Start new session
                console.log("🟢 Starting fresh game");
                initGame(true);
              }
            }}
            className="px-10 py-4 text-white font-alien text-2xl rounded-3xl transition-all hover:scale-105 shadow-lg"
            style={{
              backgroundColor: gameWon ? '#3b82f6' : '#22c55e',
              boxShadow: gameWon ? '0 10px 15px -3px rgba(59, 130, 246, 0.5)' : '0 10px 15px -3px rgba(34, 197, 94, 0.5)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = gameWon ? '#2563eb' : '#16a34a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = gameWon ? '#3b82f6' : '#22c55e';
            }}
          >
            {gameWon ? `🎉 START LEVEL ${currentLevel} 🎉` : 'START GAME'}
          </button>

          {gameWon && (
            <button
              onClick={() => initGame(true)}
              className="px-8 py-4 text-white font-alien text-xl rounded-3xl transition-all hover:scale-105 shadow-lg"
              style={{
                backgroundColor: '#dc2626',
                boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }}
            >
              🔄 RESTART
            </button>
          )}
        </div>
      )}

      {/* Save & Exit Button (during active game) */}
      {isGameActive && !gameWon && (
        <div className="relative z-10 mb-4 flex gap-4">
          <button
            onClick={handleSaveAndExit}
            className="px-8 py-3 text-white font-alien text-lg rounded-3xl transition-all hover:scale-105 shadow-lg"
            style={{
              backgroundColor: '#f59e0b',
              boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.5)'
            }}
            onMouseEnter={(e) => {
              playSound('hover');
              e.currentTarget.style.backgroundColor = '#d97706';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f59e0b';
            }}
          >
            💾 SAVE & EXIT
          </button>
          <button
            onClick={() => {
              // Restart current level if stuck
              if (window.confirm('Restart this level? Your current progress will be lost.')) {
                initGame(false); // Restart without resetting session progress
                playSound('click');
              }
            }}
            className="px-6 py-3 text-white font-alien text-sm rounded-3xl transition-all hover:scale-105 shadow-lg"
            style={{
              backgroundColor: '#ef4444',
              boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.5)'
            }}
            onMouseEnter={(e) => {
              playSound('hover');
              e.currentTarget.style.backgroundColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
            }}
          >
            🔄 RESTART LEVEL
          </button>
        </div>
      )}

      {/* Win Message */}
      {gameWon && (
        <div className="relative z-10 mb-4 bg-green-900/60 border-2 border-green-400 rounded-3xl px-8 py-4 text-center animate-pulse">
          <div className="text-green-400 font-alien text-3xl mb-2">🏆 LEVEL {currentLevel} COMPLETE! 🏆</div>
          <div className="text-green-300 text-lg">
            Score: {score} | Time: {timeElapsed}s
          </div>
          <div className="text-cyan-400 text-xl font-bold mt-2">
            Session Total: {sessionScore} points
          </div>
          <div className="text-purple-400 text-sm mt-2">
            Levels Completed: {levelsCompletedThisSession} | Unclaimed AP: {unclaimedAP}
          </div>
        </div>
      )}

      {/* Maze Grid */}
      <div
        className="relative z-10 inline-block p-4 bg-black/60 rounded-3xl border-2 border-cyan-500/50"
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
                  borderRadius: '4px'
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
