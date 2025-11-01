# Gumbuo.io Global Chat - Setup Guide

## 🎮 Features
- ✅ Persistent chat across all routes
- ✅ Collapsible UI for better screen space
- ✅ Real-time messaging with WebSocket
- ✅ Online user list
- ✅ 2-player game invites
- ✅ Minimizable chat window
- ✅ Mobile responsive

## 📦 Installation

### Backend Setup (Chat Server)

1. **Install dependencies:**
```bash
cd your-project-folder
npm install ws
# or
npm install
```

2. **Start the WebSocket server:**
```bash
node chat-server.js
# or for development with auto-restart:
npm install -g nodemon
nodemon chat-server.js
```

The server will run on port 3001 by default.

3. **For production deployment (optional):**
   - Deploy to Heroku, Railway, or any Node.js hosting
   - Or use Socket.io with your existing backend
   - Update the WebSocket URL in GlobalChat.jsx

### Frontend Setup (React)

1. **Copy the files to your React project:**
```
src/
  components/
    GlobalChat.jsx
    GlobalChat.css
```

2. **Import and add to your App.jsx (or main layout component):**
```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GlobalChat from './components/GlobalChat';
import Home from './pages/Home';
import Game from './pages/Game';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* Your routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          {/* ... other routes */}
        </Routes>

        {/* Global Chat - stays on all routes */}
        <GlobalChat />
      </div>
    </BrowserRouter>
  );
}

export default App;
```

3. **Update WebSocket URL:**
   - In `GlobalChat.jsx`, line 32, replace:
   ```javascript
   const ws = new WebSocket('ws://localhost:3001');
   ```
   
   With your production URL:
   ```javascript
   const ws = new WebSocket('wss://your-domain.com');
   // or
   const ws = new WebSocket(`wss://${window.location.host}`);
   ```

## 🎨 Customization

### Change Colors
In `GlobalChat.css`, modify the CSS variables:
```css
/* Change primary color from cyan to your brand color */
border: 2px solid #your-color;
color: #your-color;
```

### Adjust Chat Position
```css
.global-chat {
  bottom: 20px;  /* Distance from bottom */
  right: 20px;   /* Distance from right */
  /* Change to left: 20px; for left side */
}
```

### Change Chat Size
```css
.global-chat {
  width: 350px;  /* Chat width */
  height: 500px; /* Chat height */
}
```

## 🎮 Game Integration

### Handling Game Invites

Update your game logic to handle invites:

```jsx
// In your Game component or routing logic
useEffect(() => {
  // Listen for game invitations
  window.addEventListener('game-invite-accepted', (event) => {
    const { gameId, opponent } = event.detail;
    
    // Navigate to game room
    navigate(`/game/${gameId}`, {
      state: { opponent }
    });
  });
}, []);
```

### Sending Game Results Back to Chat

```jsx
// After game ends
const notifyGameResult = (winner) => {
  // Emit custom event
  window.dispatchEvent(new CustomEvent('game-completed', {
    detail: { winner }
  }));
};
```

## 🔒 Security Considerations

**For Production:**

1. **Add authentication:**
```javascript
// In chat-server.js
const authenticateUser = (token) => {
  // Verify JWT token
  // Return user data
};
```

2. **Sanitize messages:**
```javascript
const sanitize = require('sanitize-html');

case 'message':
  const cleanText = sanitize(data.text, {
    allowedTags: [],
    allowedAttributes: {}
  });
```

3. **Rate limiting:**
```javascript
const rateLimit = new Map(); // user -> last message time

// Prevent spam
if (Date.now() - rateLimit.get(username) < 1000) {
  return; // Too fast
}
```

4. **CORS configuration:**
```javascript
const wss = new WebSocket.Server({
  server,
  verifyClient: (info) => {
    const origin = info.origin;
    return origin === 'https://gumbuo.io'; // Allow only your domain
  }
});
```

## 🌐 Alternative Backend Options

### Option 1: Firebase Realtime Database (No server needed)

```jsx
import { getDatabase, ref, onValue, push } from 'firebase/database';

const db = getDatabase();
const messagesRef = ref(db, 'messages');

// Send message
push(messagesRef, {
  username,
  text,
  timestamp: Date.now()
});

// Listen for messages
onValue(messagesRef, (snapshot) => {
  const data = snapshot.val();
  setMessages(Object.values(data));
});
```

### Option 2: Socket.io (More features)

**Server:**
```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: "https://gumbuo.io"
  }
});
```

**Client:**
```javascript
import io from 'socket.io-client';
const socket = io('https://your-server.com');
```

### Option 3: Supabase Realtime

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(URL, KEY);

supabase
  .channel('chat')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => setMessages(prev => [...prev, payload.new])
  )
  .subscribe();
```

## 📱 Mobile Optimization

The chat is already responsive. For better mobile UX:

```css
@media (max-width: 768px) {
  .global-chat {
    width: 100%;
    height: 60vh;
    bottom: 0;
    left: 0;
    border-radius: 12px 12px 0 0;
  }
}
```

## 🐛 Troubleshooting

**WebSocket connection fails:**
- Check if server is running: `curl http://localhost:3001`
- Verify firewall allows port 3001
- For production, ensure SSL certificate for wss://

**Messages not appearing:**
- Open browser console (F12) and check for errors
- Verify WebSocket connection status
- Check server logs

**Chat not staying across routes:**
- Ensure `<GlobalChat />` is in App.jsx, not in individual route components
- Verify it's outside the `<Routes>` component

## 🚀 Deployment

### Backend (Chat Server)
```bash
# Deploy to Railway.app
railway up

# Or Heroku
heroku create gumbuo-chat-server
git push heroku main

# Or use a managed WebSocket service like Pusher or Ably
```

### Update Frontend URLs
```javascript
// In GlobalChat.jsx
const WS_URL = process.env.NODE_ENV === 'production' 
  ? 'wss://your-production-server.com'
  : 'ws://localhost:3001';

const ws = new WebSocket(WS_URL);
```

## 📧 Support

Need help? Common issues:
- CORS errors: Update server CORS settings
- Connection drops: Implement reconnection logic
- Scaling: Consider Redis for multi-server deployments

---

**Made for Gumbuo.io 🎮** | [View on GitHub](#) | [Report Issues](#)
