import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    // Get all chess games
    const allGames = await kv.get<any[]>('chess:games') || [];

    // Filter open games (waiting for player2)
    const openGames = allGames
      .filter(game => !game.player2 && !game.completed)
      .map(game => ({
        id: game.id,
        player1: game.player1,
        buyIn: game.buyIn,
        pot: game.pot,
        status: 'waiting',
      }));

    // Get user's games
    let myGames: any[] = [];
    if (wallet) {
      myGames = allGames
        .filter(game =>
          (game.player1.toLowerCase() === wallet.toLowerCase() ||
           game.player2?.toLowerCase() === wallet.toLowerCase()) &&
          !game.completed
        )
        .map(game => ({
          id: game.id,
          player1: game.player1,
          player2: game.player2,
          buyIn: game.buyIn,
          pot: game.pot,
          status: game.player2 ? 'active' : 'waiting',
        }));
    }

    return NextResponse.json({
      success: true,
      openGames,
      myGames,
    });
  } catch (error) {
    console.error('Error fetching lobby:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lobby' },
      { status: 500 }
    );
  }
}
