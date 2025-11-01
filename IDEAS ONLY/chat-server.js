const WebSocket = require('ws');
const http = require('http');

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected users
const users = new Map(); // socket -> username
const userSockets = new Map(); // username -> socket

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
  const usernames = Array.from(users.values());
  broadcast({
    type: 'users',
    users: usernames
  });
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
          
          // Check if username is already taken
          if (Array.from(users.values()).includes(username)) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Username already taken'
            }));
            return;
          }

          users.set(ws, username);
          userSockets.set(username, ws);
          
          console.log(`${username} joined the chat`);
          
          // Notify all users
          broadcast({
            type: 'message',
            username: 'System',
            text: `${username} joined the chat`,
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
              username: sender,
              text: data.text,
              timestamp: Date.now()
            });
            console.log(`${sender}: ${data.text}`);
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
              from: inviter,
              timestamp: Date.now()
            }));
            
            // Notify the inviter that invite was sent
            ws.send(JSON.stringify({
              type: 'message',
              username: 'System',
              text: `Game invite sent to ${invitee}`,
              timestamp: Date.now()
            }));
            
            console.log(`${inviter} invited ${invitee} to a game`);
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
              from: accepter,
              gameId: data.gameId,
              timestamp: Date.now()
            }));
          }
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    const username = users.get(ws);
    
    if (username) {
      console.log(`${username} disconnected`);
      users.delete(ws);
      userSockets.delete(username);
      
      // Notify all users
      broadcast({
        type: 'message',
        username: 'System',
        text: `${username} left the chat`,
        timestamp: Date.now()
      });
      
      // Send updated user list
      broadcastUserList();
    }
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
