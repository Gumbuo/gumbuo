import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const BUY_IN_AMOUNTS = ['0.001', '0.005', '0.01'];

export async function POST(request: NextRequest) {
  try {
    const { wallet, buyInTier } = await request.json();

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address required' },
        { status: 400 }
      );
    }

    if (buyInTier < -1 || buyInTier > 2) {
      return NextResponse.json(
        { success: false, error: 'Invalid buy-in tier' },
        { status: 400 }
      );
    }

    const buyIn = buyInTier === -1 ? '0' : BUY_IN_AMOUNTS[buyInTier];

    // Get all games and generate new ID
    const allGames = await kv.get<any[]>('chess:games') || [];
    const gameId = allGames.length + 1;

    // Create new game
    const newGame = {
      id: gameId,
      player1: wallet,
      player2: null,
      buyIn,
      pot: buyIn,
      currentTurn: null, // Will be set when player2 joins
      lastMoveTime: null,
      winner: null,
      completed: false,
      claimed: false,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Starting position
      moveHistory: [],
      createdAt: Date.now(),
    };

    // Add to games list
    allGames.push(newGame);
    await kv.set('chess:games', allGames);

    // Also store by game ID for quick lookup
    await kv.set(`chess:game:${gameId}`, newGame);

    return NextResponse.json({
      success: true,
      gameId,
      game: newGame,
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create game' },
      { status: 500 }
    );
  }
}
