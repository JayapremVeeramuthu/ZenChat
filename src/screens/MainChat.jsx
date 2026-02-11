import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChat, LANGUAGES } from '../context/ChatContext';
import {
  Search, MoreVertical, Send, Globe,
  Settings as SettingsIcon, LogOut, CheckCheck,
  ChevronLeft, User, MessageCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MainChatScreen = () => {
  const {
    user, chats, currentChat, setCurrentChat,
    messages, sendMessage, logout, selectedLanguage,
    typingStatus
  } = useChat();
  const [showSettings, setShowSettings] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showOriginal, setShowOriginal] = useState({}); // { msgId: true }
  const messagesEndRef = useRef(null);

  const activeMessages = useMemo(() => {
    return currentChat ? (messages[currentChat.id] || []) : [];
  }, [messages, currentChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, typingStatus]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const toggleOriginal = (msgId) => {
    setShowOriginal(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  // Helper to group messages by day
  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDate = null;

    activeMessages.forEach(msg => {
      const msgDate = new Date(msg.timestamp).toLocaleDateString();
      if (msgDate !== lastDate) {
        let label = msgDate;
        const today = new Date().toLocaleDateString();
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

        if (msgDate === today) label = 'Today';
        else if (msgDate === yesterday) label = 'Yesterday';

        groups.push({ type: 'day', label });
        lastDate = msgDate;
      }
      groups.push({ type: 'msg', ...msg });
    });
    return groups;
  }, [activeMessages]);

  const getLanguageName = (id) => {
    return LANGUAGES.find(l => l.id === id)?.name || id;
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${currentChat ? 'hidden-mobile' : ''}`}>
        <header className="sidebar-header">
          <div className="user-profile">
            <div className="avatar-small">
              <User size={20} />
            </div>
            <div className="user-info">
              <span className="name">{user?.name}</span>
              <div className="lang-badge">
                <Globe size={10} />
                <span>{selectedLanguage?.native}</span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={() => setShowSettings(true)} className="icon-btn">
              <SettingsIcon size={20} />
            </button>
          </div>
        </header>

        <div className="search-bar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search conversations..." />
          </div>
        </div>

        <div className="chat-list">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${currentChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => setCurrentChat(chat)}
            >
              <div className="avatar-wrapper">
                <img src={chat.avatar} alt={chat.name} />
                <span className={`status-dot ${typingStatus[chat.id] ? 'typing' : chat.status}`}></span>
              </div>
              <div className="chat-info">
                <div className="chat-top">
                  <span className="chat-name">{chat.name}</span>
                  <span className="chat-time">12:45 PM</span>
                </div>
                <div className="chat-bottom">
                  <p className="last-msg">
                    {typingStatus[chat.id] ? `Typing in ${getLanguageName(typingStatus[chat.id].language)}...` : chat.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`chat-area ${!currentChat ? 'empty hidden-mobile' : ''}`}>
        {!currentChat ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Globe size={64} />
            </div>
            <h2>Universal Connection</h2>
            <p>Select a contact to start translating in real-time.</p>
          </div>
        ) : (
          <>
            <header className="chat-header">
              <button
                className="mobile-back"
                onClick={() => setCurrentChat(null)}
              >
                <ChevronLeft size={24} />
              </button>
              <div className="chat-partner">
                <div className="avatar-wrapper">
                  <img src={currentChat.avatar} alt={currentChat.name} />
                  <span className={`status-dot ${typingStatus[currentChat.id] ? 'typing' : currentChat.status}`}></span>
                </div>
                <div className="partner-info">
                  <h3>{currentChat.name}</h3>
                  <span className="status-text">
                    {typingStatus[currentChat.id]
                      ? `Typing in ${getLanguageName(typingStatus[currentChat.id].language)}...`
                      : (currentChat.status === 'online' ? 'Online' : `Last seen ${currentChat.lastSeen}`)}
                  </span>
                </div>
              </div>
              <div className="header-actions">
                <div className="translation-indicator">
                  <Globe size={14} />
                  <span>Always Translating</span>
                </div>
                <button className="icon-btn"><MoreVertical size={20} /></button>
              </div>
            </header>

            <div className="messages-container">
              <div className="welcome-msg">
                <div className="encryption-notice">
                  Messages are end-to-end encrypted and translated instantly.
                </div>
              </div>

              {groupedMessages.map((item, idx) => (
                item.type === 'day' ? (
                  <div key={item.label} className="day-separator">
                    {item.label}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    key={item.id}
                    className={`message-bubble-wrapper ${item.senderId === 'me' ? 'sent' : 'received'}`}
                  >
                    <div
                      className="message-bubble"
                      onClick={() => toggleOriginal(item.id)}
                      title="Click to view original / translated"
                    >
                      <p>{showOriginal[item.id] ? item.originalText : item.translatedText}</p>

                      {showOriginal[item.id] && (
                        <div className="original-text-reveal">
                          Original: {item.originalText} ({getLanguageName(item.sourceLanguage)})
                        </div>
                      )}

                      <div className="message-meta">
                        <span className="msg-time">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {item.senderId === 'me' && (
                          <div className={`tick-icon ${item.status === 'read' ? 'read' : ''}`}>
                            <CheckCheck size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                    {item.senderId !== 'me' && !activeMessages.slice(0, activeMessages.indexOf(item)).find(m => m.senderId !== 'me') && (
                      <div className="translation-hint">✨ Translated automatically to {selectedLanguage.name}</div>
                    )}
                  </motion.div>
                )
              ))}

              <AnimatePresence>
                {typingStatus[currentChat.id] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="typing-indicator-chat"
                  >
                    <div className="typing-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <span>{currentChat.name} is typing in {getLanguageName(typingStatus[currentChat.id].language)}...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            <footer className="input-area">
              <form onSubmit={handleSend} className="input-form">
                <input
                  type="text"
                  placeholder={`Type in ${selectedLanguage?.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button type="submit" className="send-btn" disabled={!inputText.trim()}>
                  <Send size={20} />
                </button>
              </form>
            </footer>
          </>
        )}
      </main>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="settings-modal glass"
              onClick={e => e.stopPropagation()}
            >
              <div className="settings-header">
                <h2>Account Settings</h2>
                <button onClick={() => setShowSettings(false)} className="close-btn">&times;</button>
              </div>
              <div className="settings-content">
                <div className="profile-preview">
                  <div className="avatar-large">
                    <User size={40} />
                  </div>
                  <h3>{user?.name}</h3>
                </div>

                <div className="setting-section">
                  <label>Your Language</label>
                  <div className="current-lang-item">
                    <div className="lang-info">
                      <span className="lang-native">{selectedLanguage?.native}</span>
                      <span className="lang-name">{selectedLanguage?.name}</span>
                    </div>
                    <button className="text-btn">Change</button>
                  </div>
                </div>

                <div className="setting-section">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    <Info size={14} />
                    <span>Translation is active for all chats.</span>
                  </div>
                </div>

                <button className="logout-btn" onClick={logout}>
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
