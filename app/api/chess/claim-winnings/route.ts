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

    if (!game.completed) {
      return NextResponse.json(
        { success: false, error: 'Game not completed' },
        { status: 400 }
      );
    }

    if (game.winner?.toLowerCase() !== wallet.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Only winner can claim' },
        { status: 400 }
      );
    }

    if (game.claimed) {
      return NextResponse.json(
        { success: false, error: 'Winnings already claimed' },
        { status: 400 }
      );
    }

    // Mark as claimed
    game.claimed = true;
    game.claimedAt = Date.now();

    // Save updated game
    await kv.set(`chess:game:${gameId}`, game);

    // Update games list
    const allGames = await kv.get<any[]>('chess:games') || [];
    const gameIndex = allGames.findIndex(g => g.id === gameId);
    if (gameIndex !== -1) {
      allGames[gameIndex] = game;
      await kv.set('chess:games', allGames);
    }

    // Track chess stats
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user-data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet,
          statUpdates: {
            chessGamesWon: 1,
            chessEthWon: parseFloat(game.pot),
          },
        }),
      });
    } catch (error) {
      console.error('Failed to track chess stats:', error);
    }

    // TODO: In a real implementation, this would trigger a smart contract
    // transaction to transfer the ETH to the winner. For now, we're just
    // simulating the payout.

    return NextResponse.json({
      success: true,
      payout: game.pot,
      message: 'Winnings claimed successfully! (Note: This is a demo - no real ETH transferred)',
    });
  } catch (error) {
    console.error('Error claiming winnings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to claim winnings' },
      { status: 500 }
    );
  }
}
