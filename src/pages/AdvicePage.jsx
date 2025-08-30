import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import { getCurrentUser } from '../apis/authentication-api';
import '../styles/AdvicePage.css';

const AdvicePage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [activeMode, setActiveMode] = useState('ai'); // 'ai' or 'staff'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null);
  const historyContainerRef = useRef(null);
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoggedIn(false);
          return;
        }
        const response = await getCurrentUser(token);
        if (response.status === 200 && response.data?.data) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Auth check error:', error.response?.data || error.message);
        setIsLoggedIn(false);
        localStorage.removeItem('token');
      }
    };
    checkAuthStatus();
  }, []);

  // Auto-scroll to bottom of chat and history
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    if (historyContainerRef.current) {
      historyContainerRef.current.scrollTop = historyContainerRef.current.scrollHeight;
    }
  }, [messages, chatHistory]);

  // Handle message submission
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { text: input, sender: 'user', timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (messages.length === 0 && activeMode === 'ai') {
      setChatHistory((prev) => [
        ...prev,
        { id: Date.now(), question: input, messages: [...messages, userMessage] },
      ]);
    }

    if (activeMode === 'ai') {
      setTimeout(() => {
        const responseText = `AI Response: Here's advice for your question: "${input}". This is a simulated response for demonstration.`;
        const newMessage = { text: responseText, sender: 'ai', timestamp: new Date() };
        setMessages((prev) => [...prev, newMessage]);
        setChatHistory((prev) =>
          prev.map((chat) =>
            chat.id === (prev.length ? prev[prev.length - 1].id : null)
              ? { ...chat, messages: [...chat.messages, newMessage] }
              : chat
          )
        );
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory)); // Sync to localStorage
        setIsLoading(false);
      }, 1000);
    } else {
      try {
        setTimeout(() => {
          const responseText = 'Staff Response: Your question has been submitted to our team. Expect a reply soon!';
          const newMessage = { text: responseText, sender: 'staff', timestamp: new Date() };
          setMessages((prev) => [...prev, newMessage]);
          setChatHistory((prev) =>
            prev.map((chat) =>
              chat.id === (prev.length ? prev[prev.length - 1].id : null)
                ? { ...chat, messages: [...chat.messages, newMessage] }
                : chat
            )
          );
          localStorage.setItem('chatHistory', JSON.stringify(chatHistory)); // Sync to localStorage
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error submitting to staff:', error);
        setMessages((prev) => [
          ...prev,
          { text: 'Error: Could not submit your question. Please try again.', sender: 'staff', timestamp: new Date() },
        ]);
        setIsLoading(false);
      }
    }
  };

  // Switch between AI and Staff modes
  const switchMode = (mode) => {
    if (mode === 'staff' && !isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    setActiveMode(mode);
    setMessages([]);
    setInput('');
    setShowLoginPrompt(false);
  };

  // Start new chat
  const startNewChat = () => {
    setMessages([]);
    setInput('');
    const newChat = { id: Date.now(), question: '', messages: [] };
    setChatHistory((prev) => [...prev, newChat]);
    localStorage.setItem('chatHistory', JSON.stringify([...chatHistory, newChat]));
  };

  // Load chat history
  const loadChatHistory = (chatId) => {
    const chat = chatHistory.find((ch) => ch.id === chatId);
    if (chat) {
      setMessages(chat.messages || []);
    }
  };

  return (
    <MainLayout>
      <div className="advice-page">
        <div className="advice-content-wrapper">
          {/* Sidebar - Advice History */}
          <div className="advice-history-sidebar">
            <h2 className="advice-history-title">Advice History</h2>
            <motion.button
              className="advice-new-chat-button"
              onClick={startNewChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              New Chat
            </motion.button>
            <div className="advice-history-container" ref={historyContainerRef}>
              {chatHistory.length === 0 ? (
                <p className="advice-empty-message">No history yet.</p>
              ) : (
                chatHistory.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="advice-history-item"
                    onClick={() => loadChatHistory(chat.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="advice-history-sender">
                      {chat.question || 'New Chat'}:
                    </span>
                    <span className="advice-history-text">
                      {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text.slice(0, 50) + '...' : 'No messages yet'}
                    </span>
                    <span className="advice-history-timestamp">
                      {chat.messages.length > 0
                        ? new Date(chat.messages[chat.messages.length - 1].timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : new Date(chat.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="advice-main-content">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="advice-header"
            >
              <h1 className="advice-title">
                {activeMode === 'ai' ? 'AI Advice Chat' : 'Staff Advice Chat'}
              </h1>
              <p className="advice-description">
                {activeMode === 'ai'
                  ? 'Chat with our AI for instant pregnancy-related advice.'
                  : 'Get personalized guidance from our expert staff.'}
              </p>
            </motion.div>

            {/* Mode Toggle */}
            <div className="advice-mode-nav">
              <motion.button
                className={`advice-mode-button ${activeMode === 'ai' ? 'active' : ''}`}
                onClick={() => switchMode('ai')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                AI Advice
              </motion.button>
              <motion.button
                className={`advice-mode-button ${activeMode === 'staff' ? 'active' : ''} ${
                  !isLoggedIn ? 'disabled' : ''
                }`}
                onClick={() => switchMode('staff')}
                whileHover={{ scale: isLoggedIn ? 1.05 : 1 }}
                whileTap={{ scale: isLoggedIn ? 0.95 : 1 }}
                disabled={!isLoggedIn}
                title={!isLoggedIn ? 'Please log in to access Staff Advice' : 'Switch to Staff Advice'}
              >
                Staff Advice
              </motion.button>
            </div>

            {/* Login Prompt Popup */}
            {showLoginPrompt && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="advice-login-popup"
              >
                <p>
                  Please{' '}
                  <Link to="/login" className="advice-link">
                    log in
                  </Link>{' '}
                  to access Staff Advice.
                </p>
                <button
                  className="advice-popup-close"
                  onClick={() => setShowLoginPrompt(false)}
                >
                  Close
                </button>
              </motion.div>
            )}

            {/* Chat Container */}
            <div className="advice-chat-container" ref={chatContainerRef}>
              {messages.length === 0 && (
                <p className="advice-empty-message">
                  Start chatting by typing your question below!
                </p>
              )}
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`advice-message ${
                    msg.sender === 'user' ? 'message-user' : 'message-bot'
                  }`}
                >
                  <div
                    className={`advice-message-content ${
                      msg.sender === 'user'
                        ? 'bg-user'
                        : msg.sender === 'ai'
                        ? 'bg-ai'
                        : 'bg-staff'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="advice-message-timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="advice-message message-bot">
                  <div className="advice-message-content bg-ai">
                    <div className="advice-typing">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            {(activeMode === 'ai' || (activeMode === 'staff' && isLoggedIn)) && (
              <form onSubmit={handleSendMessage} className="advice-input-form">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="advice-input"
                  required
                />
                <motion.button
                  type="submit"
                  className="advice-send-button"
                  disabled={isLoading || !input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="advice-send-icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.button>
              </form>
            )}

            {/* Consultation Link */}
            <p className="advice-footer-note">
              {activeMode === 'ai'
                ? 'Need a human touch? Try our '
                : 'Want instant answers? Check out our '}
              <Link to="/consultation" className="advice-link">
                Consultant Chat
              </Link>{' '}
              page.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdvicePage;