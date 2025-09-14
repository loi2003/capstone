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
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token'); // Updated to match SignIn.jsx
        console.log('AdvicePage: Retrieved token:', token);
        console.log('AdvicePage: localStorage contents:', JSON.stringify(localStorage));
        if (!token) {
          console.log('AdvicePage: No token found, setting isLoggedIn to false');
          setIsLoggedIn(false);
          return;
        }
        const response = await getCurrentUser(token);
        console.log('AdvicePage: getCurrentUser response:', response);
        if (response.status === 200 && response.data?.data) {
          console.log('AdvicePage: User authenticated, setting isLoggedIn to true');
          setIsLoggedIn(true);
        } else {
          console.log('AdvicePage: Invalid response, clearing token');
          setIsLoggedIn(false);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('AdvicePage: Auth check error:', error.response?.data || error.message);
        setIsLoggedIn(false);
        localStorage.removeItem('token');
      }
    };
    checkAuthStatus();
  }, []); // Removed location.pathname dependency

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle message submission
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { text: input, sender: 'user', timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (activeMode === 'ai') {
      // Simulate AI response
      setTimeout(() => {
        const responseText = `AI Response: Here's advice for your question: "${input}". This is a simulated response for demonstration.`;
        setMessages((prev) => [
          ...prev,
          { text: responseText, sender: 'ai', timestamp: new Date() },
        ]);
        setIsLoading(false);
      }, 1000);
    } else {
      // Staff mode: Indicate message sent (replace with actual API call)
      try {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              text: 'Staff Response: Your question has been submitted to our team. Expect a reply soon!',
              sender: 'staff',
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error submitting to staff:', error);
        setMessages((prev) => [
          ...prev,
          {
            text: 'Error: Could not submit your question. Please try again.',
            sender: 'staff',
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
      }
    }
  };

  // Switch between AI and Staff modes
  const switchMode = (mode) => {
    console.log('Switching mode:', mode, 'isLoggedIn:', isLoggedIn);
    if (mode === 'staff' && !isLoggedIn) {
      console.log('Blocked: User not logged in, showing login prompt');
      setShowLoginPrompt(true);
      return;
    }
    setActiveMode(mode);
    setMessages([]);
    setInput('');
    setShowLoginPrompt(false);
  };

  return (
    <MainLayout>
      <div className="advice-page">
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
    </MainLayout>
  );
};

export default AdvicePage;