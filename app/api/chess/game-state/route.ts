import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'Game ID required' },
        { status: 400 }
      );
    }

    // Get game
    const game = await kv.get<any>(`chess:game:${parseInt(gameId)}`);

    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      state: {
        id: game.id,
        player1: game.player1,
        player2: game.player2,
        buyIn: game.buyIn,
        pot: game.pot,
        currentTurn: game.currentTurn,
        lastMoveTime: game.lastMoveTime,
        winner: game.winner,
        completed: game.completed,
        claimed: game.claimed,
        fen: game.fen,
        moveHistory: game.moveHistory,
      },
    });
  } catch (error) {
    console.error('Error fetching game state:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch game state' },
      { status: 500 }
    );
  }
}
