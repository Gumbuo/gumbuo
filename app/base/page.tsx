"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import BackToMothershipButton from "../components/BackToMothershipButton";
import { useAlienPoints } from "../context/AlienPointContext";
import { useAlienPoints as useAlienPointsEconomy } from "../context/AlienPointsEconomy";
import { useAccount } from "wagmi";

const Home = dynamic(() => import("@lib/Home"), { ssr: false });
const GumbuoBoss = dynamic(() => import("../components/GumbuoBoss"), { ssr: false });
const ChessWrapper = dynamic(() => import("./components/ChessWrapper"), { ssr: false });
const GumbuoFighters = dynamic(() => import("./GumbuoGame"), { ssr: false });

export default function BasePage() {
  const [selectedGame, setSelectedGame] = useState("arena");
  const alienPointContext = useAlienPoints();
  const { addPoints } = useAlienPointsEconomy();
  const { address } = useAccount();

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

              // Send success message to iframe
              iframe.contentWindow.postMessage({
                type: 'INVASION_CLAIM_SUCCESS',
                alienPoints: pointsToAward
              }, '*');

              // Force reload the page to refresh the HUD
              setTimeout(() => {
                console.log('🔄 Reloading page...');
                window.location.reload();
              }, 2000);
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

              // Send success message to iframe
              iframe.contentWindow.postMessage({
                type: 'DUNGEON_CLAIM_SUCCESS',
                alienPoints: pointsToAward
              }, '*');

              // Force reload the page to refresh the HUD
              setTimeout(() => {
                console.log('🔄 Reloading page...');
                window.location.reload();
              }, 2000);
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

  const games = {
    arena: { title: "AP Arena", component: <Home chainType="base" hideConnectButton={true} /> },
    boss: { title: "Gumbuo Boss", component: <GumbuoBoss /> },
    fighters: { title: "Gumbuo Fighters", component: <GumbuoFighters /> },
    chess: { title: "PvP Chess", component: <ChessWrapper /> },
    invasion: { title: "Gumbuo Invasion", src: "/gumbuo-invasion.html" },
    dungeon: { title: "Dungeon Crawler", src: "/gumbuo-dungeon-crawler.html" },
    maze: { title: "Maze Game", src: "/maze" },
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#000' }}>
      <BackToMothershipButton />
      {/* Game Selector */}
      <div style={{
        display: 'flex',
        gap: '10px',
        padding: '15px',
        background: 'linear-gradient(to bottom, #1a1a2e, #0f0f1e)',
        borderBottom: '2px solid #00d4ff',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {Object.entries(games).map(([key, game]) => (
          <button
            key={key}
            onClick={() => setSelectedGame(key)}
            style={{
              padding: '12px 24px',
              background: selectedGame === key
                ? 'linear-gradient(135deg, #00d4ff, #0099cc)'
                : 'rgba(0, 212, 255, 0.1)',
              color: selectedGame === key ? '#000' : '#00d4ff',
              border: `2px solid ${selectedGame === key ? '#00d4ff' : '#00d4ff44'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
              fontSize: '14px',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              boxShadow: selectedGame === key
                ? '0 0 20px rgba(0, 212, 255, 0.5)'
                : 'none',
            }}
            onMouseEnter={(e) => {
              if (selectedGame !== key) {
                e.currentTarget.style.background = 'rgba(0, 212, 255, 0.2)';
                e.currentTarget.style.borderColor = '#00d4ff';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedGame !== key) {
                e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
                e.currentTarget.style.borderColor = '#00d4ff44';
              }
            }}
          >
            {game.title}
          </button>
        ))}
      </div>

      {/* Game Display */}
      <div style={{
        width: '100%',
        height: 'calc(100vh - 70px)',
        overflow: 'hidden'
      }}>
        {(selectedGame === "arena" || selectedGame === "boss" || selectedGame === "chess" || selectedGame === "fighters") ? (
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
            {selectedGame === "arena" ? games.arena.component : selectedGame === "boss" ? games.boss.component : selectedGame === "fighters" ? games.fighters.component : games.chess.component}
          </div>
        ) : (
          <iframe
            key={selectedGame}
            src={selectedGame === "invasion" ? games.invasion.src : selectedGame === "dungeon" ? games.dungeon.src : games.maze.src}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title={selectedGame === "invasion" ? games.invasion.title : selectedGame === "dungeon" ? games.dungeon.title : games.maze.title}
          />
        )}
      </div>
    </div>
  );
}
