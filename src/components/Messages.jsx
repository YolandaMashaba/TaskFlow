import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { Send, MessageSquare, User, Clock, Check, CheckCheck } from 'lucide-react';

const Messages = () => {
  const { user, workspaceId } = useApp();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!workspaceId) return;

    // In a real implementation, this would listen to Firestore
    // For now, we'll use localStorage for demo purposes
    const savedMessages = localStorage.getItem(`messages_${workspaceId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [workspaceId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      senderId: user.uid,
      senderName: user.displayName || user.email?.split('@')[0],
      senderPhoto: user.photoURL,
      timestamp: new Date().toISOString(),
      workspaceId,
      delivered: true,
      read: false
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(`messages_${workspaceId}`, JSON.stringify(updatedMessages));
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="messages-sidebar">
      <div className="messages-header">
        <div className="messages-header-icon">
          <MessageSquare size={24} />
        </div>
        <div>
          <h2>Messages</h2>
          <p>Chat with your team</p>
        </div>
      </div>

      <div className="messages-content">
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="messages-empty">
              <MessageSquare size={48} />
              <p>No messages yet</p>
              <small>Start the conversation!</small>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === user?.uid;
              return (
                <div 
                  key={message.id} 
                  className={`message-item ${isOwnMessage ? 'own' : 'other'}`}
                >
                  <div className="message-avatar">
                    {message.senderPhoto ? (
                      <img src={message.senderPhoto} alt={message.senderName} />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">{message.senderName}</span>
                    </div>
                    <p className="message-text">{message.text}</p>
                    <div className="message-footer">
                      <span className="message-time">
                        <Clock size={12} />
                        {formatTime(message.timestamp)}
                      </span>
                      {isOwnMessage && (
                        <span className="message-status">
                          {message.read ? (
                            <CheckCheck size={14} />
                          ) : (
                            <Check size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="messages-input">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={2}
          />
          <button 
            onClick={handleSendMessage} 
            className="send-button"
            disabled={!newMessage.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
