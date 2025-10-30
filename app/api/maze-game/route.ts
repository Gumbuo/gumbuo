import { NextRequest, NextResponse } from "next/server";

// Type definitions
interface PlayerPosition {
  wallet: string;
  nftCharacter?: string;
  x: number;
  y: number;
  lastUpdate: number;
}

interface GameRoom {
  roomId: string;
  maze: string; // JSON stringified maze data
  collectibles: string; // JSON stringified collectibles data
  players: Record<string, PlayerPosition>;
  createdAt: number;
}

// In-memory storage for active game rooms
const gameRooms: Record<string, GameRoom> = {};
const ROOM_EXPIRY = 30 * 60 * 1000; // 30 minutes
const PLAYER_TIMEOUT = 10000; // 10 seconds - remove inactive players

// Clean up expired rooms and inactive players
function cleanupRooms() {
  const now = Date.now();

  Object.keys(gameRooms).forEach(roomId => {
    const room = gameRooms[roomId];

    // Remove inactive players
    Object.keys(room.players).forEach(wallet => {
      if (now - room.players[wallet].lastUpdate > PLAYER_TIMEOUT) {
        delete room.players[wallet];
      }
    });

    // Remove empty or expired rooms
    if (Object.keys(room.players).length === 0 || now - room.createdAt > ROOM_EXPIRY) {
      delete gameRooms[roomId];
    }
  });
}

// GET - Get game room state
export async function GET(req: NextRequest) {
  try {
    cleanupRooms();

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: "Room ID required" },
        { status: 400 }
      );
    }

    const room = gameRooms[roomId];

    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      room: {
        roomId: room.roomId,
        maze: room.maze,
        collectibles: room.collectibles,
        players: room.players
      }
    });
  } catch (error) {
    console.error("Error fetching game room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch game room" },
      { status: 500 }
    );
  }
}

// POST - Create or join game room / Update player position
export async function POST(req: NextRequest) {
  try {
    cleanupRooms();

    const body = await req.json();
    const { action, roomId, wallet, nftCharacter, x, y, maze, collectibles } = body;

    if (action === "create") {
      // Create new room (with optional custom roomId)
      const newRoomId = roomId || `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Check if room already exists
      if (gameRooms[newRoomId]) {
        return NextResponse.json({
          success: false,
          error: "Room already exists"
        }, { status: 409 });
      }

      gameRooms[newRoomId] = {
        roomId: newRoomId,
        maze: maze || "[]",
        collectibles: collectibles || "[]",
        players: {},
        createdAt: Date.now()
      };

      return NextResponse.json({
        success: true,
        roomId: newRoomId
      });
    }

    if (action === "join" || action === "update") {
      // Join existing room or update player position
      if (!roomId || !wallet) {
        return NextResponse.json(
          { success: false, error: "Room ID and wallet required" },
          { status: 400 }
        );
      }

      const room = gameRooms[roomId];
      if (!room) {
        return NextResponse.json(
          { success: false, error: "Room not found" },
          { status: 404 }
        );
      }

      // Normalize wallet address to lowercase
      const normalizedWallet = wallet.toLowerCase();

      // Update player position
      room.players[normalizedWallet] = {
        wallet: normalizedWallet,
        nftCharacter,
        x: x ?? 1,
        y: y ?? 1,
        lastUpdate: Date.now()
      };

      console.log(`Player ${normalizedWallet} updated in room ${roomId}. Total players:`, Object.keys(room.players).length);

      return NextResponse.json({
        success: true,
        players: room.players
      });
    }

    if (action === "collect") {
      // Update collectibles when a player collects one
      if (!roomId || !collectibles) {
        return NextResponse.json(
          { success: false, error: "Room ID and collectibles required" },
          { status: 400 }
        );
      }

      const room = gameRooms[roomId];
      if (!room) {
        return NextResponse.json(
          { success: false, error: "Room not found" },
          { status: 404 }
        );
      }

      room.collectibles = collectibles;

      return NextResponse.json({
        success: true,
        collectibles: room.collectibles
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in game room operation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// DELETE - Leave room
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const wallet = searchParams.get("wallet");

    if (!roomId || !wallet) {
      return NextResponse.json(
        { success: false, error: "Room ID and wallet required" },
        { status: 400 }
      );
    }

    const room = gameRooms[roomId];
    if (room && room.players[wallet]) {
      delete room.players[wallet];
    }

    return NextResponse.json({
      success: true,
      message: "Left room successfully"
    });
  } catch (error) {
    console.error("Error leaving room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to leave room" },
      { status: 500 }
    );
  }
}
