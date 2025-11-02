"use client";

import React, { useState } from 'react';
import ChessLobby from './ChessLobby';
import ChessGame from './ChessGame';

const ChessWrapper = () => {
  const [activeGame, setActiveGame] = useState<{ gameId: number; isPlayer1: boolean } | null>(null);

  const handleGameStart = (gameId: number, isPlayer1: boolean) => {
    setActiveGame({ gameId, isPlayer1 });
  };

  const handleBackToLobby = () => {
    setActiveGame(null);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {activeGame ? (
        <ChessGame
          gameId={activeGame.gameId}
          isPlayer1={activeGame.isPlayer1}
          onBackToLobby={handleBackToLobby}
        />
      ) : (
        <ChessLobby onGameStart={handleGameStart} />
      )}
    </div>
  );
};

export default ChessWrapper;
