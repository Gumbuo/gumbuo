"use client";

import React, { useState, useEffect, useRef } from 'react';
import './GlobalChat.css';

interface Message {
  id: number;
  username: string;
  text: string;
  timestamp: number;
}

const GlobalChat = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 20, y: 20 }); // Position from bottom-right
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection
  useEffect(() => {
    if (!isUsernameSet) return;

    // WebSocket server URL - Railway production or local dev
    const WS_URL = process.env.NODE_ENV === 'production'
      ? 'wss://gumbuo-production.up.railway.app'
      : 'ws://localhost:3001';

    const ws = new WebSocket(WS_URL);
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

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the header, not from buttons
    if ((e.target as HTMLElement).closest('.chat-controls')) {
      return;
    }

    setIsDragging(true);
    const chatElement = chatRef.current;
    if (chatElement) {
      const rect = chatElement.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = window.innerWidth - e.clientX - dragOffset.x;
      const newY = window.innerHeight - e.clientY - dragOffset.y;

      // Keep chat within bounds
      const chatElement = chatRef.current;
      if (chatElement) {
        const rect = chatElement.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width - 10;
        const maxY = window.innerHeight - rect.height - 10;

        setPosition({
          x: Math.max(10, Math.min(newX, maxX)),
          y: Math.max(10, Math.min(newY, maxY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
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

  const handleGameInvite = (targetUser: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'game-invite',
        to: targetUser,
        from: username
      }));
      alert(`Game invite sent to ${targetUser}!`);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isUsernameSet) {
    return (
      <div
        ref={chatRef}
        className={`global-chat ${isMinimized ? 'minimized' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{ right: `${position.x}px`, bottom: `${position.y}px` }}
      >
        <div className="chat-header" onMouseDown={handleMouseDown} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
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
    <div
      ref={chatRef}
      className={`global-chat ${isCollapsed ? 'collapsed' : ''} ${isMinimized ? 'minimized' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{ right: `${position.x}px`, bottom: `${position.y}px` }}
    >
      <div className="chat-header" onMouseDown={handleMouseDown} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
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
