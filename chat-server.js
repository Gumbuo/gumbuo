const WebSocket = require('ws');
const http = require('http');

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected users
const users = new Map(); // socket -> { address, displayName }
const userSockets = new Map(); // address -> socket

// Store chess game rooms
const chessGames = new Map(); // gameId -> Set of sockets

// Broadcast to all connected clients
function broadcast(data, excludeSocket = null) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== excludeSocket) {
      client.send(JSON.stringify(data));
    }
  });
}

// Send updated user list to all clients
function broadcastUserList() {
  const userList = Array.from(users.values());
  broadcast({
    type: 'users',
    users: userList
  });
}

// Broadcast to all players in a chess game
function broadcastToGame(gameId, data) {
  const gameSockets = chessGames.get(gameId);
  if (gameSockets) {
    gameSockets.forEach((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
      }
    });
  }
}

// Handle new connections
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'join':
          // User joining the chat
          const username = data.username;
          const displayName = data.displayName;

          // Check if wallet address is already connected
          if (Array.from(users.values()).some(u => u.address === username)) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Wallet already connected'
            }));
            return;
          }

          const userInfo = { address: username, displayName };
          users.set(ws, userInfo);
          userSockets.set(username, ws);

          console.log(`${displayName || username} joined the chat`);

          // Notify all users
          broadcast({
            type: 'message',
            username: 'System',
            text: `${displayName || username} joined the chat`,
            timestamp: Date.now()
          });

          // Send updated user list
          broadcastUserList();

          // Send welcome message to new user
          ws.send(JSON.stringify({
            type: 'message',
            username: 'System',
            text: 'Welcome to Gumbuo Global Chat!',
            timestamp: Date.now()
          }));
          break;

        case 'message':
          // Regular chat message
          const sender = users.get(ws);
          if (sender) {
            broadcast({
              type: 'message',
              username: sender.address,
              displayName: sender.displayName,
              text: data.text,
              timestamp: Date.now()
            });
            console.log(`${sender.displayName || sender.address}: ${data.text}`);
          }
          break;

        case 'update-displayname':
          // Update user's display name
          const user = users.get(ws);
          if (user) {
            user.displayName = data.displayName;
            users.set(ws, user);
            console.log(`${user.address} changed display name to ${data.displayName}`);

            // Broadcast updated user list
            broadcastUserList();
          }
          break;

        case 'game-invite':
          // Game invitation
          const inviter = users.get(ws);
          const invitee = data.to;
          const inviteeSocket = userSockets.get(invitee);

          if (inviteeSocket && inviteeSocket.readyState === WebSocket.OPEN) {
            inviteeSocket.send(JSON.stringify({
              type: 'game-invite',
              from: inviter.address,
              fromDisplayName: inviter.displayName,
              timestamp: Date.now()
            }));

            // Notify the inviter that invite was sent
            ws.send(JSON.stringify({
              type: 'message',
              username: 'System',
              text: `Game invite sent to ${invitee}`,
              timestamp: Date.now()
            }));

            console.log(`${inviter.displayName || inviter.address} invited ${invitee} to a game`);
          }
          break;

        case 'game-accept':
          // Handle game acceptance (you can extend this)
          const accepter = users.get(ws);
          const inviterUsername = data.from;
          const inviterSocket = userSockets.get(inviterUsername);

          if (inviterSocket && inviterSocket.readyState === WebSocket.OPEN) {
            inviterSocket.send(JSON.stringify({
              type: 'game-accepted',
              from: accepter.address,
              fromDisplayName: accepter.displayName,
              gameId: data.gameId,
              timestamp: Date.now()
            }));
          }
          break;

        case 'chess-join':
          // Player joins a chess game room
          const gameId = data.gameId;
          const player = data.wallet;

          if (!chessGames.has(gameId)) {
            chessGames.set(gameId, new Set());
          }

          chessGames.get(gameId).add(ws);
          console.log(`${player} joined chess game ${gameId}`);

          // Notify player they joined
          ws.send(JSON.stringify({
            type: 'chess-joined',
            gameId,
            timestamp: Date.now()
          }));
          break;

        case 'chess-move':
          // Player makes a move
          const moveGameId = data.gameId;
          const movePlayer = data.wallet;
          const move = data.move;
          const fen = data.fen;

          console.log(`Chess move in game ${moveGameId} by ${movePlayer}: ${JSON.stringify(move)}`);

          // Broadcast move to all players in this game (including sender for confirmation)
          broadcastToGame(moveGameId, {
            type: 'chess-move',
            gameId: moveGameId,
            move,
            fen,
            player: movePlayer,
            timestamp: Date.now()
          });
          break;

        case 'chess-game-over':
          // Game over notification
          const endGameId = data.gameId;
          const winner = data.winner;

          console.log(`Chess game ${endGameId} ended. Winner: ${winner || 'Draw'}`);

          // Broadcast game over to all players
          broadcastToGame(endGameId, {
            type: 'chess-game-over',
            gameId: endGameId,
            winner,
            timestamp: Date.now()
          });

          // Clean up game room
          chessGames.delete(endGameId);
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    const userInfo = users.get(ws);

    if (userInfo) {
      console.log(`${userInfo.displayName || userInfo.address} disconnected`);
      users.delete(ws);
      userSockets.delete(userInfo.address);

      // Notify all users
      broadcast({
        type: 'message',
        username: 'System',
        text: `${userInfo.displayName || userInfo.address} left the chat`,
        timestamp: Date.now()
      });

      // Send updated user list
      broadcastUserList();
    }

    // Remove from all chess game rooms
    chessGames.forEach((sockets, gameId) => {
      if (sockets.has(ws)) {
        sockets.delete(ws);
        console.log(`Player removed from chess game ${gameId}`);

        // If game room is empty, remove it
        if (sockets.size === 0) {
          chessGames.delete(gameId);
        }
      }
    });
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
