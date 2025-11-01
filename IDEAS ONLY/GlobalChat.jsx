import React, { useState, useEffect, useRef } from 'react';
import './GlobalChat.css';

const GlobalChat = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection (you'll need to replace with your actual WebSocket server URL)
  useEffect(() => {
    if (!isUsernameSet) return;

    // Replace with your actual WebSocket server URL
    const ws = new WebSocket('ws://localhost:3001');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to chat server');
      ws.send(JSON.stringify({
        type: 'join',
        username: username
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'message':
          setMessages(prev => [...prev, {
            id: Date.now(),
            username: data.username,
            text: data.text,
            timestamp: data.timestamp
          }]);
          break;
        case 'users':
          setOnlineUsers(data.users);
          break;
        case 'game-invite':
          // Handle game invite notification
          alert(`${data.from} invited you to play!`);
          break;
        default:
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from chat server');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [isUsernameSet, username]);

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        text: inputMessage,
        username: username
      }));
      setInputMessage('');
    }
  };

  const handleGameInvite = (targetUser) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'game-invite',
        to: targetUser,
        from: username
      }));
      alert(`Game invite sent to ${targetUser}!`);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isUsernameSet) {
    return (
      <div className={`global-chat ${isMinimized ? 'minimized' : ''}`}>
        <div className="chat-header">
          <h3>Enter Chat</h3>
        </div>
        <div className="chat-body username-prompt">
          <form onSubmit={handleUsernameSubmit}>
            <input
              type="text"
              placeholder="Enter your username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <button type="submit">Join Chat</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`global-chat ${isCollapsed ? 'collapsed' : ''} ${isMinimized ? 'minimized' : ''}`}>
      <div className="chat-header">
        <div className="chat-title">
          <span className="online-indicator"></span>
          <h3>Global Chat</h3>
          <span className="user-count">({onlineUsers.length} online)</span>
        </div>
        <div className="chat-controls">
          <button 
            className="minimize-btn" 
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? '□' : '_'}
          </button>
          <button 
            className="collapse-btn" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Chat" : "Collapse Chat"}
          >
            {isCollapsed ? '◀' : '▶'}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="chat-body">
            <div className="messages-container">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`message ${msg.username === username ? 'own-message' : ''}`}
                >
                  <div className="message-header">
                    <span className="message-username">{msg.username}</span>
                    <span className="message-time">{formatTimestamp(msg.timestamp)}</span>
                  </div>
                  <div className="message-text">{msg.text}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="online-users">
              <h4>Online Players</h4>
              <div className="users-list">
                {onlineUsers.filter(u => u !== username).map((user, index) => (
                  <div key={index} className="user-item">
                    <span className="user-name">{user}</span>
                    <button 
                      className="invite-btn"
                      onClick={() => handleGameInvite(user)}
                      title="Invite to game"
                    >
                      🎮
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="chat-footer">
            <form onSubmit={handleSendMessage} className="message-form">
              <input
                type="text"
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                maxLength={500}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalChat;
