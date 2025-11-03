"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import './GlobalChat.css';

interface Message {
  id: number;
  username: string;
  displayName?: string;
  text: string;
  timestamp: number;
}

interface OnlineUser {
  address: string;
  displayName?: string;
}

// Global connection manager to prevent duplicate connections
const globalConnections = new Map<string, WebSocket>();

const GlobalChat = () => {
  // Hide chat if we're in an iframe to prevent duplicates
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);

  const { address, isConnected } = useAccount();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 20, y: 20 }); // Position from bottom-right
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Helper function to shorten wallet address
  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Load display name from localStorage on mount
  useEffect(() => {
    if (address) {
      const savedName = localStorage.getItem(`chat_displayname_${address}`);
      if (savedName) {
        setDisplayName(savedName);
      }
    }
  }, [address]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection - ONLY depends on isConnected and address
  useEffect(() => {
    console.log('🔌 WebSocket useEffect triggered', { isConnected, address, nodeEnv: process.env.NODE_ENV });

    if (!isConnected || !address) {
      console.log('⚠️ Not connecting: isConnected=', isConnected, 'address=', address);
      return;
    }

    // Check if there's already a global connection for this address
    const existingConnection = globalConnections.get(address);
    if (existingConnection?.readyState === WebSocket.OPEN || existingConnection?.readyState === WebSocket.CONNECTING) {
      console.log('⚠️ Global connection already exists for this address, reusing...');
      wsRef.current = existingConnection;
      setConnectionStatus('connected');
      return;
    }

    // WebSocket server URL - Railway production or local dev
    const WS_URL = process.env.NODE_ENV === 'production'
      ? (process.env.NEXT_PUBLIC_WS_URL || 'wss://gumbuo-production.up.railway.app')
      : 'ws://localhost:3001';

    console.log('🚀 Attempting to connect to WebSocket:', WS_URL, 'NODE_ENV:', process.env.NODE_ENV);
    setConnectionStatus('connecting');

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    globalConnections.set(address, ws); // Store in global map

    ws.onopen = () => {
      console.log('✅ Connected to chat server');
      setConnectionStatus('connected');
      ws.send(JSON.stringify({
        type: 'join',
        username: address,
        displayName: displayName || undefined
      }));
    };

    ws.onmessage = (event) => {
      console.log('📩 Received message:', event.data);
      const data = JSON.parse(event.data);

      switch(data.type) {
        case 'message':
          setMessages(prev => [...prev, {
            id: Date.now(),
            username: data.username,
            displayName: data.displayName,
            text: data.text,
            timestamp: data.timestamp
          }]);
          break;
        case 'users':
          setOnlineUsers(data.users || []);
          console.log('👥 Online users updated:', data.users);
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
      console.error('❌ WebSocket error:', error);
      setConnectionStatus('disconnected');
    };

    ws.onclose = () => {
      console.log('🔌 Disconnected from chat server');
      setConnectionStatus('disconnected');
    };

    return () => {
      console.log('🧹 [Chat] Cleaning up WebSocket connection');
      // Only close if this is the current global connection
      if (address && globalConnections.get(address) === ws) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        globalConnections.delete(address);
        console.log('🗑️ Removed global connection for', address);
      }
      wsRef.current = null;
    };
  }, [isConnected, address]); // Removed displayName from dependencies

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 Attempting to send message:', inputMessage);
    console.log('WebSocket state:', wsRef.current?.readyState, '(OPEN=1)');

    if (inputMessage.trim() && wsRef.current?.readyState === WebSocket.OPEN && address) {
      const message = {
        type: 'message',
        text: inputMessage,
        username: address,
        displayName: displayName || undefined
      };
      console.log('Sending message:', message);
      wsRef.current.send(JSON.stringify(message));
      setInputMessage('');
    } else {
      console.warn('⚠️ Cannot send message. Message empty or WebSocket not open.');
      console.log('Message empty?', !inputMessage.trim());
      console.log('WebSocket ready state:', wsRef.current?.readyState);
      console.log('Address:', address);
    }
  };

  const handleSaveDisplayName = () => {
    if (tempDisplayName.trim() && address) {
      const newName = tempDisplayName.trim();
      setDisplayName(newName);
      localStorage.setItem(`chat_displayname_${address}`, newName);
      setIsEditingName(false);

      // Notify server of display name change
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'update-displayname',
          username: address,
          displayName: newName
        }));
      }
    }
  };

  const handleEditDisplayName = () => {
    setTempDisplayName(displayName);
    setIsEditingName(true);
  };

  const handleGameInvite = (targetUser: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && address) {
      wsRef.current.send(JSON.stringify({
        type: 'game-invite',
        to: targetUser,
        from: address
      }));
      alert(`Game invite sent to ${shortenAddress(targetUser)}!`);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isConnected || !address) {
    return (
      <div
        ref={chatRef}
        className={`global-chat ${isMinimized ? 'minimized' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{ right: `${position.x}px`, bottom: `${position.y}px` }}
      >
        <div className="chat-header" onMouseDown={handleMouseDown} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
          <h3>Global Chat</h3>
        </div>
        <div className="chat-body username-prompt">
          <div style={{ textAlign: 'center', color: '#00ffff' }}>
            <p style={{ marginBottom: '10px' }}>🔌 Connect your wallet to join the chat</p>
            <p style={{ fontSize: '12px', color: '#888' }}>Use the wallet button in the top right</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render chat if we're in an iframe (prevents duplicates when loaded in /base)
  if (isInIframe) {
    return null;
  }

  return (
    <div
      ref={chatRef}
      className={`global-chat ${isCollapsed ? 'collapsed' : ''} ${isMinimized ? 'minimized' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{ right: `${position.x}px`, bottom: `${position.y}px` }}
    >
      <div className="chat-header" onMouseDown={handleMouseDown} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
        <div className="chat-title">
          <span className={`online-indicator ${connectionStatus}`}></span>
          <h3>Global Chat</h3>
          <span className="user-count">({onlineUsers.length} online)</span>
        </div>
        <div className="chat-controls">
          <button
            className="edit-name-btn"
            onClick={(e) => { e.stopPropagation(); handleEditDisplayName(); }}
            title="Edit display name"
          >
            ✏️
          </button>
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
          {isEditingName && (
            <div className="display-name-editor">
              <input
                type="text"
                placeholder="Enter display name..."
                value={tempDisplayName}
                onChange={(e) => setTempDisplayName(e.target.value)}
                maxLength={20}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveDisplayName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
              />
              <div className="name-editor-buttons">
                <button onClick={handleSaveDisplayName}>Save</button>
                <button onClick={() => setIsEditingName(false)}>Cancel</button>
              </div>
            </div>
          )}
          <div className="chat-body">
            <div className="messages-container">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.username === address ? 'own-message' : ''}`}
                >
                  <div className="message-header">
                    <span className="message-username">
                      {msg.displayName || shortenAddress(msg.username)}
                    </span>
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
                {onlineUsers.filter(u => u.address !== address).map((user, index) => (
                  <div key={index} className="user-item">
                    <span className="user-name">
                      {user.displayName || shortenAddress(user.address)}
                    </span>
                    <button
                      className="invite-btn"
                      onClick={() => handleGameInvite(user.address)}
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
