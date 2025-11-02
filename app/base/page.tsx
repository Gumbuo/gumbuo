"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import BackToMothershipButton from "../components/BackToMothershipButton";
import { useAlienPoints } from "../context/AlienPointContext";

const GumbuoBoss = dynamic(() => import("../components/GumbuoBoss"), { ssr: false });
const ChessWrapper = dynamic(() => import("./components/ChessWrapper"), { ssr: false });

export default function BasePage() {
  const [selectedGame, setSelectedGame] = useState("boss");
  const alienPointContext = useAlienPoints();

  // Listen for alien points updates from maze iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Handle alien points claimed in iframe
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
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [alienPointContext]);

  const games = {
    boss: { title: "Gumbuo Boss", component: <GumbuoBoss /> },
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
        borderBottom: '2px solid #00ff99',
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
                ? 'linear-gradient(135deg, #00ff99, #00cc7a)'
                : 'rgba(0, 255, 153, 0.1)',
              color: selectedGame === key ? '#000' : '#00ff99',
              border: `2px solid ${selectedGame === key ? '#00ff99' : '#00ff9944'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
              fontSize: '14px',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              boxShadow: selectedGame === key
                ? '0 0 20px rgba(0, 255, 153, 0.5)'
                : 'none',
            }}
            onMouseEnter={(e) => {
              if (selectedGame !== key) {
                e.currentTarget.style.background = 'rgba(0, 255, 153, 0.2)';
                e.currentTarget.style.borderColor = '#00ff99';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedGame !== key) {
                e.currentTarget.style.background = 'rgba(0, 255, 153, 0.1)';
                e.currentTarget.style.borderColor = '#00ff9944';
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
        {(selectedGame === "boss" || selectedGame === "chess") ? (
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
            {selectedGame === "boss" ? games.boss.component : games.chess.component}
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
