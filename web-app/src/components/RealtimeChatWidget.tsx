import React, { useState, useEffect, useRef } from 'react';
import { getSocket, sendSocketMessage } from '../socketService';

interface User {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
}

interface RealtimeChatWidgetProps {
  currentUser: User | null;
}

const RealtimeChatWidget: React.FC<RealtimeChatWidgetProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<User[]>([]);
  const [activeContact, setActiveContact] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Load contacts
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;
    if (currentUser.role === 'owner') {
      fetch('/api/tenants')
        .then(res => res.json())
        .then(data => {
          if (!isMounted) return;
          if (Array.isArray(data)) {
            const virtualAiBot: User = { id: 'ai-bot', name: 'RentApp AI Assistant', role: 'ai-bot' };
            setContacts([virtualAiBot, ...data]);
          }
          setLoadingContacts(false);
        })
        .catch(err => {
          console.error('Error fetching tenants:', err);
          if (isMounted) setLoadingContacts(false);
        });
    } else {
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          if (!isMounted) return;
          if (Array.isArray(data)) {
            const owners = data.filter((u: User) => u.role === 'owner');
            const virtualAiBot: User = { id: 'ai-bot', name: 'RentApp AI Assistant', role: 'ai-bot' };
            setContacts([virtualAiBot, ...owners]);
            setActiveContact(virtualAiBot);
          }
          setLoadingContacts(false);
        })
        .catch(err => {
          console.error('Error fetching owner:', err);
          if (isMounted) setLoadingContacts(false);
        });
    }
    return () => { isMounted = false; };
  }, [currentUser]);

  // Load message history when active contact changes
  useEffect(() => {
    if (!currentUser || !activeContact) return;

    if (activeContact.id === 'ai-bot') {
      Promise.resolve().then(() => {
        setMessages([
          {
            id: 'welcome-ai',
            text: "Hello! I am your RentApp AI Assistant. Ask me anything about paying rent, security deposits, lease agreements, or maintenance complaints! 🤖",
            senderId: 'ai-bot',
            receiverId: currentUser.id,
            createdAt: new Date().toISOString()
          }
        ]);
      });
      return;
    }

    fetch(`/api/chat?user1=${currentUser.id}&user2=${activeContact.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch(err => console.error('Error loading chat history:', err));
  }, [currentUser, activeContact]);

  // Listen to incoming messages
  useEffect(() => {
    if (!currentUser) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      // Check if message belongs to current active conversation
      const isFromActive = activeContact && 
        (msg.senderId === activeContact.id || msg.receiverId === activeContact.id);

      if (isFromActive) {
        setMessages(prev => [...prev, msg]);
      } else {
        // Only trigger unread count if it's not the active contact
        setUnreadCount(prev => prev + 1);
      }
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [currentUser, activeContact]);

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser || !activeContact) return;

    const userText = inputText.trim();
    setInputText('');

    if (activeContact.id === 'ai-bot') {
      const tenantMsg: Message = {
        id: Math.random().toString(),
        text: userText,
        senderId: currentUser.id,
        receiverId: 'ai-bot',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, tenantMsg]);

      // Fetch AI response
      try {
        const res = await fetch('/api/ai/faq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: userText })
        });
        const data = await res.json();
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Math.random().toString(),
            text: data.answer,
            senderId: 'ai-bot',
            receiverId: currentUser.id,
            createdAt: new Date().toISOString()
          }]);
        }, 500);
      } catch (err) {
        console.error(err);
      }
    } else {
      sendSocketMessage(currentUser.id, activeContact.id, userText);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="realtime-chat-widget">
      {/* Floating Chat Button */}
      <button 
        className={`chat-trigger-btn ${isOpen ? 'active' : ''}`} 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0); // Clear unread on open
        }}
      >
        {isOpen ? (
          <span className="close-icon">&times;</span>
        ) : (
          <>
            <span className="chat-icon">💬</span>
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Chat Window Header */}
          <div className="chat-header">
            {activeContact && (
              <button className="back-to-contacts-btn" onClick={() => setActiveContact(null)}>
                &larr;
              </button>
            )}
            <div className="chat-header-info">
              {activeContact ? (
                <>
                  <div className="chat-avatar">{activeContact.name.charAt(0)}</div>
                  <div>
                    <h4 className="chat-header-title">{activeContact.name}</h4>
                    <span className="chat-header-subtitle">
                      {activeContact.role === 'ai-bot' ? 'Assistant' : activeContact.role === 'owner' ? 'Property Owner' : 'Tenant'}
                    </span>
                  </div>
                </>
              ) : (
                <h4 className="chat-header-title">Select a Contact</h4>
              )}
            </div>
          </div>

          {/* Chat Body */}
          <div className="chat-body">
            {!activeContact ? (
              // Contact List
              <div className="contacts-list">
                <p className="section-title">Conversations</p>
                {loadingContacts ? (
                  <p className="empty-chat-msg">Loading conversations...</p>
                ) : contacts.length === 0 ? (
                  <p className="empty-chat-msg">No contacts found</p>
                ) : (
                  contacts.map(c => (
                    <div 
                      key={c.id} 
                      className="contact-item" 
                      onClick={() => setActiveContact(c)}
                    >
                      <div className="chat-avatar">{c.name.charAt(0)}</div>
                      <div className="contact-info">
                        <div className="contact-name">{c.name}</div>
                        <div className="contact-role">
                          {c.role === 'ai-bot' ? 'Assistant' : c.role === 'owner' ? 'Owner' : 'Tenant'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : activeContact ? (
              // Messages view
              <div className="messages-container">
                {messages.length === 0 ? (
                  <p className="empty-chat-msg">No messages yet. Say hello! 👋</p>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.senderId === currentUser.id;
                    const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={msg.id} className={`message-bubble-row ${isMe ? 'me' : 'them'}`}>
                        <div className="message-bubble">
                          <p className="message-text">{msg.text}</p>
                          <span className="message-time">{time}</span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <p className="empty-chat-msg">Select a contact to start chatting</p>
            )}
          </div>

          {/* Chat Footer / Input */}
          {activeContact && (
            <form onSubmit={handleSendMessage} className="chat-footer">
              <input 
                type="text" 
                placeholder="Type your message..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="chat-input"
                required
              />
              <button type="submit" className="chat-send-btn">
                Send
              </button>
            </form>
          )}
        </div>
      )}

      <style>{`
        .realtime-chat-widget {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
          font-family: 'Inter', sans-serif;
        }

        .chat-trigger-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .chat-trigger-btn:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 6px 24px rgba(37, 99, 235, 0.5);
        }
        .chat-trigger-btn.active {
          transform: rotate(90deg);
          background: #334155;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .close-icon {
          font-size: 28px;
          line-height: 1;
        }

        .unread-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #ef4444;
          color: white;
          font-size: 11px;
          font-weight: 800;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .chat-window {
          position: absolute;
          bottom: 75px;
          right: 0;
          width: 360px;
          height: 480px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid #f1f5f9;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .chat-header {
          background: #0f172a;
          color: white;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .back-to-contacts-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .back-to-contacts-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        .chat-header-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .chat-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
        }
        .chat-header-title {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: white;
        }
        .chat-header-subtitle {
          font-size: 11px;
          color: #94a3b8;
          display: block;
        }

        .chat-body {
          flex: 1;
          overflow-y: auto;
          background: #f8fafc;
          padding: 1.25rem;
        }

        .contacts-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .section-title {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: white;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #f1f5f9;
        }
        .contact-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          border-color: #e2e8f0;
        }
        .contact-info {
          flex: 1;
        }
        .contact-name {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
        }
        .contact-role {
          font-size: 11px;
          color: #94a3b8;
        }

        .messages-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .empty-chat-msg {
          text-align: center;
          color: #94a3b8;
          font-size: 13px;
          margin-top: 3rem;
          padding: 0 1rem;
        }

        .message-bubble-row {
          display: flex;
          width: 100%;
        }
        .message-bubble-row.me {
          justify-content: flex-end;
        }
        .message-bubble-row.them {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 75%;
          padding: 0.75rem 1rem;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .me .message-bubble {
          background: #2563eb;
          color: white;
          border-bottom-right-radius: 4px;
        }
        .them .message-bubble {
          background: white;
          color: #0f172a;
          border-bottom-left-radius: 4px;
          border: 1px solid #e2e8f0;
        }

        .message-text {
          margin: 0;
          font-size: 13px;
          line-height: 1.4;
          word-break: break-word;
        }
        .message-time {
          font-size: 9px;
          display: block;
          text-align: right;
          margin-top: 4px;
          opacity: 0.7;
        }
        .them .message-time {
          color: #64748b;
        }

        .chat-footer {
          padding: 1rem;
          background: white;
          border-top: 1px solid #f1f5f9;
          display: flex;
          gap: 0.5rem;
        }
        .chat-input {
          flex: 1;
          border: 1px solid #e2e8f0;
          border-radius: 99px;
          padding: 0.6rem 1rem;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }
        .chat-input:focus {
          border-color: #2563eb;
        }
        .chat-send-btn {
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 99px;
          padding: 0.6rem 1.25rem;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .chat-send-btn:hover {
          background: #1d4ed8;
        }
      `}</style>
    </div>
  );
};

export default RealtimeChatWidget;
