import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: NextRequest) {
  try {
    const { wallet, gameId } = await request.json();

    if (!wallet || !gameId) {
      return NextResponse.json(
        { success: false, error: 'Wallet and gameId required' },
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

    if (game.player2) {
      return NextResponse.json(
        { success: false, error: 'Game already has two players' },
        { status: 400 }
      );
    }

    if (game.player1.toLowerCase() === wallet.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Cannot play against yourself' },
        { status: 400 }
      );
    }

    if (game.completed) {
      return NextResponse.json(
        { success: false, error: 'Game already completed' },
        { status: 400 }
      );
    }

    // Update game
    game.player2 = wallet;
    game.pot = (parseFloat(game.pot) * 2).toString();
    game.currentTurn = game.player1; // White moves first
    game.lastMoveTime = Date.now();

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
    });
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to join game' },
      { status: 500 }
    );
  }
}
