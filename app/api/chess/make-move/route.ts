import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { Chess } from 'chess.js';

export async function POST(request: NextRequest) {
  try {
    const { wallet, gameId, move, fen } = await request.json();

    if (!wallet || !gameId || !move || !fen) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get game
    const game = await kv.get<any>(`chess:game:${gameId}`);

    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.completed) {
      return NextResponse.json(
        { success: false, error: 'Game already completed' },
        { status: 400 }
      );
    }

    if (!game.player2) {
      return NextResponse.json(
        { success: false, error: 'Game not started - waiting for player 2' },
        { status: 400 }
      );
    }

    if (game.currentTurn.toLowerCase() !== wallet.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Not your turn' },
        { status: 400 }
      );
    }

    // Validate move using chess.js
    const chess = new Chess(game.fen);
    const validMove = chess.move(move);

    if (!validMove) {
      return NextResponse.json(
        { success: false, error: 'Invalid move' },
        { status: 400 }
      );
    }

    // Update game state
    game.fen = fen;
    game.moveHistory.push(move);
    game.currentTurn = game.currentTurn === game.player1 ? game.player2 : game.player1;
    game.lastMoveTime = Date.now();

    // Check if game is over
    if (chess.isGameOver()) {
      game.completed = true;

      if (chess.isCheckmate()) {
        // Current player made the last move, so they win
        game.winner = wallet;

        // Track chess stats for both players
        const loser = wallet === game.player1 ? game.player2 : game.player1;

        // Winner stats
        try {
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user-data`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wallet,
              statUpdates: {
                chessGamesPlayed: 1,
                chessGamesWon: 1,
              },
            }),
          });
        } catch (error) {
          console.error('Failed to track winner chess stats:', error);
        }

        // Loser stats
        try {
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user-data`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wallet: loser,
              statUpdates: {
                chessGamesPlayed: 1,
                chessGamesLost: 1,
              },
            }),
          });
        } catch (error) {
          console.error('Failed to track loser chess stats:', error);
        }
      } else {
        // Draw - both players get a game played
        game.winner = null;

        for (const player of [game.player1, game.player2]) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user-data`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                wallet: player,
                statUpdates: {
                  chessGamesPlayed: 1,
                },
              }),
            });
          } catch (error) {
            console.error('Failed to track chess stats:', error);
          }
        }
      }
    }

    // Save updated game
    await kv.set(`chess:game:${gameId}`, game);

    // Update games list
    const allGames = await kv.get<any[]>('chess:games') || [];
    const gameIndex = allGames.findIndex(g => g.id === gameId);
    if (gameIndex !== -1) {
      allGames[gameIndex] = game;
      await kv.set('chess:games', allGames);
    }

    return NextResponse.json({
      success: true,
      game,
      gameOver: chess.isGameOver(),
      winner: game.winner,
    });
  } catch (error) {
    console.error('Error making move:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to make move' },
      { status: 500 }
    );
  }
}
