"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BackToMothershipButton from "../components/BackToMothershipButton";
import { useAlienPoints } from "../context/AlienPointContext";
import { useAlienPoints as useAlienPointsEconomy } from "../context/AlienPointsEconomy";
import { useAccount } from "wagmi";
import { useCosmicSound } from "../hooks/useCosmicSound";

const Home = dynamic(() => import("@lib/Home"), { ssr: false });
const GumbuoBoss = dynamic(() => import("../components/GumbuoBoss"), { ssr: false });
const ChessWrapper = dynamic(() => import("./components/ChessWrapper"), { ssr: false });
const GumbuoFighters = dynamic(() => import("./GumbuoGame"), { ssr: false });
const ArcadeGames = dynamic(() => import("./components/ArcadeGames"), { ssr: false });

export default function BasePage() {
  const searchParams = useSearchParams();
  const gameParam = searchParams?.get('game');

  const [selectedGame, setSelectedGame] = useState(gameParam || "catacombs");
  const [selectedOldGame, setSelectedOldGame] = useState("arena");
  const alienPointContext = useAlienPoints();
  const { addPoints } = useAlienPointsEconomy();
  const { address } = useAccount();
  const { playSound } = useCosmicSound();

  // Update selected game when URL parameter changes
  useEffect(() => {
    if (gameParam) {
      setSelectedGame(gameParam);
    }
  }, [gameParam]);

  // Listen for alien points updates from maze iframe and invasion game
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {

      // Handle alien points claimed in iframe (maze game)
      if (event.data.type === 'ALIEN_POINTS_CLAIMED' && alienPointContext) {
        console.log('Iframe claimed alien points:', event.data.claimed, 'New total:', event.data.alienPoints);
        alienPointContext.setAlienPoints(event.data.alienPoints);
      }

      // Handle alien points request from iframe
      if (event.data.type === 'REQUEST_ALIEN_POINTS' && alienPointContext) {
        console.log('Iframe requested alien points, sending:', alienPointContext.alienPoints);
        // Find the iframe and send it the current alien points
        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'ALIEN_POINTS_UPDATE',
            alienPoints: alienPointContext.alienPoints
          }, '*');
        }
      }

      // Handle alien points claim from Gumbuo Invasion game
      if (event.data.type === 'INVASION_CLAIM_AP') {
        console.log('📨 Received INVASION_CLAIM_AP message:', event.data);
        const pointsToAward = event.data.alienPoints || 0;
        const enemiesKilled = event.data.enemiesKilled || 0;

        // Check if wallet is connected
        if (!address) {
          console.error('❌ No wallet connected! Address:', address);
          // Send failure message back to iframe
          const iframe = document.querySelector('iframe');
          console.log('Found iframe:', iframe);
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'INVASION_CLAIM_FAILED',
              error: 'Please connect your wallet first!'
            }, '*');
          }
          return;
        }

        console.log('🎮 Gumbuo Invasion claim! Awarding', pointsToAward, 'AP to', address, '| Enemies killed:', enemiesKilled);
        console.log('addPoints function available?', typeof addPoints === 'function');

        try {
          console.log('⏳ Calling addPoints...');
          // Use 'arena' as source - API only accepts: wheel, faucet, arena, boss, staking
          const success = await addPoints(address, pointsToAward, 'arena');
          console.log('addPoints result:', success);

          const iframe = document.querySelector('iframe');
          console.log('Found iframe for response:', iframe);

          if (iframe && iframe.contentWindow) {
            if (success) {
              console.log('✅ Successfully awarded', pointsToAward, 'AP from', enemiesKilled, 'enemy kills');

              // Track Invasion game stats
              try {
                // First, get current high score before updating
                const userDataResponse = await fetch(`/api/user-data?wallet=${address}`);
                const userData = await userDataResponse.json();
                const currentHighScore = userData.success && userData.userData?.gameStats?.invasionHighScore || 0;

                // Determine if this is a new high score
                const isNewHighScore = enemiesKilled > currentHighScore;
                const highScoreIncrement = isNewHighScore ? (enemiesKilled - currentHighScore) : 0;

                // Update all stats in one call
                const statUpdateResponse = await fetch('/api/user-data', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    wallet: address,
                    statUpdates: {
                      invasionGamesPlayed: 1,
                      invasionTotalKills: enemiesKilled,
                      invasionAPEarned: pointsToAward,
                      invasionHighScore: highScoreIncrement,
                    },
                  }),
                });

                const statUpdateResult = await statUpdateResponse.json();
                if (!statUpdateResult.success) {
                  console.error('Failed to update invasion stats:', statUpdateResult);
                }
              } catch (error) {
                console.error('Failed to track invasion stats:', error);
              }

              // Send success message to iframe
              iframe.contentWindow.postMessage({
                type: 'INVASION_CLAIM_SUCCESS',
                alienPoints: pointsToAward
              }, '*');
            } else {
              console.error('❌ Failed to award points - addPoints returned false');
              // Send failure message to iframe
              iframe.contentWindow.postMessage({
                type: 'INVASION_CLAIM_FAILED',
                error: 'Failed to add points. Please try again.'
              }, '*');
            }
          } else {
            console.error('❌ Could not find iframe to send response');
          }
        } catch (error) {
          console.error('❌ Exception in addPoints:', error);
          // Send failure message to iframe
          const iframe = document.querySelector('iframe');
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'INVASION_CLAIM_FAILED',
              error: String(error)
            }, '*');
          }
        }
      }

      // Handle alien points claim from Dungeon Crawler game
      if (event.data.type === 'DUNGEON_CLAIM_AP') {
        console.log('📨 Received DUNGEON_CLAIM_AP message:', event.data);
        const pointsToAward = event.data.alienPoints || 0;
        const killsCount = event.data.kills || 0;
        const currentFloor = event.data.floor || 1;
        const goldCollected = event.data.gold || 0;

        // Check if wallet is connected
        if (!address) {
          console.error('❌ No wallet connected! Address:', address);
          // Send failure message back to iframe
          const iframe = document.querySelector('iframe');
          console.log('Found iframe:', iframe);
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'DUNGEON_CLAIM_FAILED',
              error: 'Please connect your wallet first!'
            }, '*');
          }
          return;
        }

        console.log('🎮 Dungeon Crawler claim! Awarding', pointsToAward, 'AP to', address, '| Kills:', killsCount);
        console.log('addPoints function available?', typeof addPoints === 'function');

        try {
          console.log('⏳ Calling addPoints...');
          // Use 'arena' as source - API only accepts: wheel, faucet, arena, boss, staking
          const success = await addPoints(address, pointsToAward, 'arena');
          console.log('addPoints result:', success);

          const iframe = document.querySelector('iframe');
          console.log('Found iframe for response:', iframe);

          if (iframe && iframe.contentWindow) {
            if (success) {
              console.log('✅ Successfully awarded', pointsToAward, 'AP from', killsCount, 'kills');

              // Track Dungeon Crawler game stats
              try {
                // First, get current highest floor before updating
                const userDataResponse = await fetch(`/api/user-data?wallet=${address}`);
                const userData = await userDataResponse.json();
                const currentHighestFloor = userData.success && userData.userData?.gameStats?.dungeonHighestFloor || 0;

                // Determine if this is a new highest floor
                const isNewHighestFloor = currentFloor > currentHighestFloor;
                const highestFloorIncrement = isNewHighestFloor ? (currentFloor - currentHighestFloor) : 0;

                // Update all stats in one call
                const statUpdateResponse = await fetch('/api/user-data', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    wallet: address,
                    statUpdates: {
                      dungeonGamesPlayed: 1,
                      dungeonTotalKills: killsCount,
                      dungeonAPEarned: pointsToAward,
                      dungeonTotalGold: goldCollected,
                      dungeonHighestFloor: highestFloorIncrement,
                    },
                  }),
                });

                const statUpdateResult = await statUpdateResponse.json();
                if (!statUpdateResult.success) {
                  console.error('Failed to update dungeon stats:', statUpdateResult);
                }
              } catch (error) {
                console.error('Failed to track dungeon stats:', error);
              }

              // Send success message to iframe
              iframe.contentWindow.postMessage({
                type: 'DUNGEON_CLAIM_SUCCESS',
                alienPoints: pointsToAward
              }, '*');
            } else {
              console.error('❌ Failed to award points - addPoints returned false');
              // Send failure message to iframe
              iframe.contentWindow.postMessage({
                type: 'DUNGEON_CLAIM_FAILED',
                error: 'Failed to add points. Please try again.'
              }, '*');
            }
          } else {
            console.error('❌ Could not find iframe to send response');
          }
        } catch (error) {
          console.error('❌ Exception in addPoints:', error);
          // Send failure message to iframe
          const iframe = document.querySelector('iframe');
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'DUNGEON_CLAIM_FAILED',
              error: String(error)
            }, '*');
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [alienPointContext, address, addPoints]);

  const oldGames = {
    arena: { title: "AP Arena", component: <Home chainType="base" hideConnectButton={true} /> },
    boss: { title: "Gumbuo Boss", component: <GumbuoBoss /> },
    chess: { title: "PvP Chess", component: <ChessWrapper /> },
    maze: { title: "Maze Game", src: "/maze" },
  };

  const games = {
    fighters: { title: "Gumbuo Fighters", component: <GumbuoFighters />, hidden: true },
    invasion: { title: "Gumbuo Invasion", src: "/gumbuo-invasion.html" },
    dungeon: { title: "Dungeon Crawler", src: "/gumbuo-dungeon-crawler.html" },
    catacombs: { title: "Alien Catacombs", src: "/alien-catacombs.html" },
    arcade: { title: "Free Arcade", component: <ArcadeGames /> },
    oldGames: { title: "Old Games", isCategory: true, hidden: true },
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#000' }}>
      <BackToMothershipButton />
      {/* Main Game Selector */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(to bottom, #1f2833, #0b0c10)',
        borderBottom: '2px solid #45a29e',
      }}>
        {/* Main Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          padding: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {Object.entries(games).filter(([, game]) => !('hidden' in game && game.hidden)).map(([key, game]) => (
            <button
              key={key}
              onClick={() => setSelectedGame(key)}
              style={{
                padding: '12px 24px',
                background: selectedGame === key
                  ? 'linear-gradient(135deg, #66fcf1, #45a29e)'
                  : 'rgba(102, 252, 241, 0.1)',
                color: selectedGame === key ? '#000' : '#66fcf1',
                border: `2px solid ${selectedGame === key ? '#66fcf1' : '#66fcf144'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                fontSize: '14px',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                boxShadow: selectedGame === key
                  ? '0 0 20px rgba(102, 252, 241, 0.5)'
                  : 'none',
              }}
              onMouseEnter={(e) => {
                playSound('hover');
                if (selectedGame !== key) {
                  e.currentTarget.style.background = 'rgba(102, 252, 241, 0.2)';
                  e.currentTarget.style.borderColor = '#66fcf1';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedGame !== key) {
                  e.currentTarget.style.background = 'rgba(102, 252, 241, 0.1)';
                  e.currentTarget.style.borderColor = '#66fcf144';
                }
              }}
            >
              {game.title}
            </button>
          ))}
        </div>

        {/* Old Games Sub-Tabs */}
        {selectedGame === "oldGames" && (
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 15px',
            paddingTop: '0',
            justifyContent: 'center',
            flexWrap: 'wrap',
            borderTop: '1px solid rgba(102, 252, 241, 0.3)',
          }}>
            {Object.entries(oldGames).map(([key, game]) => (
              <button
                key={key}
                onClick={() => setSelectedOldGame(key)}
                style={{
                  padding: '8px 16px',
                  background: selectedOldGame === key
                    ? 'linear-gradient(135deg, #45a29e, #1f2833)'
                    : 'rgba(69, 162, 158, 0.1)',
                  color: selectedOldGame === key ? '#000' : '#45a29e',
                  border: `2px solid ${selectedOldGame === key ? '#45a29e' : '#45a29e44'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedOldGame === key
                    ? '0 0 15px rgba(69, 162, 158, 0.4)'
                    : 'none',
                }}
                onMouseEnter={(e) => {
                  playSound('hover');
                  if (selectedOldGame !== key) {
                    e.currentTarget.style.background = 'rgba(69, 162, 158, 0.2)';
                    e.currentTarget.style.borderColor = '#45a29e';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedOldGame !== key) {
                    e.currentTarget.style.background = 'rgba(69, 162, 158, 0.1)';
                    e.currentTarget.style.borderColor = '#45a29e44';
                  }
                }}
              >
                {game.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Game Display */}
      <div style={{
        width: '100%',
        height: 'calc(100vh - 70px)',
        overflow: 'hidden'
      }}>
        {(() => {
          // Handle Old Games category
          if (selectedGame === "oldGames") {
            const game = oldGames[selectedOldGame as keyof typeof oldGames];

            // Old games with components (arena, boss)
            if ('component' in game && game.component) {
              return (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  background: '#000',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  padding: '20px 0'
                }}>
                  {game.component}
                </div>
              );
            }

            // Old games with iframes (maze)
            if ('src' in game && game.src) {
              return (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <iframe
                    key={selectedOldGame}
                    src={game.src}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                    title={game.title}
                  />
                </div>
              );
            }
          }

          // Handle current games
          const game = games[selectedGame as keyof typeof games];
          if (!game || ('isCategory' in game && game.isCategory)) {
            return null;
          }

          // Games with components (fighters, chess)
          if ('component' in game && game.component) {
            return (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* Alpha Build Notice for Gumbuo Fighters */}
                {selectedGame === "fighters" && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 1000,
                    background: 'linear-gradient(135deg, rgba(102, 252, 241, 0.95), rgba(69, 162, 158, 0.95))',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    border: '2px solid #66fcf1',
                    boxShadow: '0 0 20px rgba(102, 252, 241, 0.6)',
                    fontFamily: 'Orbitron, sans-serif',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    textAlign: 'center',
                    lineHeight: '1.4',
                    maxWidth: '250px'
                  }}>
                    <div style={{ fontSize: '16px', marginBottom: '4px' }}>⚠️ ALPHA BUILD</div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>This build changes daily</div>
                  </div>
                )}
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  background: '#000',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  padding: '20px 0'
                }}>
                  {game.component}
                </div>
              </div>
            );
          }

          // Games with iframes (invasion, dungeon, catacombs)
          if ('src' in game && game.src) {
            return (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* Alpha Build Notice for Catacombs */}
                {selectedGame === "catacombs" && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 1000,
                    background: 'linear-gradient(135deg, rgba(102, 252, 241, 0.95), rgba(69, 162, 158, 0.95))',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    border: '2px solid #66fcf1',
                    boxShadow: '0 0 20px rgba(102, 252, 241, 0.6)',
                    fontFamily: 'Orbitron, sans-serif',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    textAlign: 'center',
                    lineHeight: '1.4',
                    maxWidth: '250px'
                  }}>
                    <div style={{ fontSize: '16px', marginBottom: '4px' }}>⚠️ ALPHA BUILD</div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>This build changes daily</div>
                  </div>
                )}
                {/* User Request Notice for Invasion and Dungeon Crawler */}
                {(selectedGame === "invasion" || selectedGame === "dungeon") && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 1000,
                    background: 'linear-gradient(135deg, rgba(69, 162, 158, 0.95), rgba(31, 40, 51, 0.95))',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    border: '2px solid #45a29e',
                    boxShadow: '0 0 20px rgba(69, 162, 158, 0.6)',
                    fontFamily: 'Orbitron, sans-serif',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    textAlign: 'center',
                    lineHeight: '1.4',
                    maxWidth: '280px'
                  }}>
                    <div style={{ fontSize: '16px', marginBottom: '4px' }}>💬 COMMUNITY DRIVEN</div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Updates upon user requests</div>
                    <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '4px' }}>Make requests in Discord!</div>
                  </div>
                )}
                <iframe
                  key={selectedGame}
                  src={game.src}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  title={game.title}
                />
              </div>
            );
          }

          return null;
        })()}
      </div>
    </div>
  );
}
