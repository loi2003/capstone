import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  const [showStaffTypePrompt, setShowStaffTypePrompt] = useState(false); // State for staff type prompt
  const [selectedStaffType, setSelectedStaffType] = useState(null); // State for selected staff type
  const [chatHistory, setChatHistory] = useState([]);
  const [aiComparison, setAiComparison] = useState(null); // State for AI comparison response
  const chatContainerRef = useRef(null);
  const historyContainerRef = useRef(null);
  const staffPromptRef = useRef(null); // Ref for focus trapping

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

  // Disable scrolling and trap focus when staff type prompt is shown
  useEffect(() => {
    if (showStaffTypePrompt) {
      document.body.style.overflow = 'hidden'; // Disable page scrolling
      staffPromptRef.current?.focus(); // Set initial focus to prompt
    } else {
      document.body.style.overflow = ''; // Restore scrolling
    }
    return () => {
      document.body.style.overflow = ''; // Cleanup on unmount
    };
  }, [showStaffTypePrompt]);

  // Handle focus trapping for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showStaffTypePrompt) return;
      if (e.key === 'Tab') {
        const focusableElements = staffPromptRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showStaffTypePrompt]);

  // Handle message submission
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { text: input, sender: 'user', timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setAiComparison(null); // Clear comparison when sending a new message

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
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        setIsLoading(false);
      }, 1000);
    } else {
      try {
        setTimeout(() => {
          const staffLabel = selectedStaffType === 'nutrition' ? 'Nutrition Staff' : 'Health Staff';
          const responseText = `${staffLabel} Response: Your question has been submitted to our team. Expect a reply soon!`;
          const newMessage = { text: responseText, sender: 'staff', timestamp: new Date(), staffType: selectedStaffType };
          setMessages((prev) => [...prev, newMessage]);
          setChatHistory((prev) =>
            prev.map((chat) =>
              chat.id === (prev.length ? prev[prev.length - 1].id : null)
                ? { ...chat, messages: [...chat.messages, newMessage] }
                : chat
            )
          );
          localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error submitting to staff:', error);
        setMessages((prev) => [
          ...prev,
          { text: 'Error: Could not submit your question. Please try again.', sender: 'staff', timestamp: new Date(), staffType: selectedStaffType },
        ]);
        setIsLoading(false);
      }
    }
  };

  // Compare to AI Chat
  const compareToAiChat = () => {
    const lastUserMessage = messages.filter((msg) => msg.sender === 'user').slice(-1)[0];
    const lastStaffResponse = messages.filter((msg) => msg.sender === 'staff').slice(-1)[0];
    if (!lastUserMessage) return;

    setIsLoading(true);
    setTimeout(() => {
      const aiResponseText = `AI Comparison Response: Here's how AI would answer "${lastUserMessage.text}": This is a simulated AI response for comparison.`;
      setAiComparison({
        userMessage: lastUserMessage.text,
        aiResponse: aiResponseText,
        staffResponse: lastStaffResponse ? lastStaffResponse.text : 'No staff response yet.',
        staffType: lastStaffResponse ? lastStaffResponse.staffType : selectedStaffType,
        timestamp: new Date(),
      });
      setIsLoading(false);
    }, 1000);
  };

  // Switch between AI and Staff modes
  const switchMode = (mode) => {
    if (mode === 'staff') {
      if (!isLoggedIn) {
        setShowLoginPrompt(true);
        return;
      }
      setShowStaffTypePrompt(true); // Show staff type prompt
      return;
    }
    setActiveMode(mode);
    setMessages([]);
    setInput('');
    setAiComparison(null); // Clear comparison when switching modes
    setShowLoginPrompt(false);
    setShowStaffTypePrompt(false);
    setSelectedStaffType(null);
  };

  // Handle staff type selection
  const handleStaffTypeSelect = (staffType) => {
    setSelectedStaffType(staffType);
    setActiveMode('staff');
    setMessages([]);
    setInput('');
    setAiComparison(null);
    setShowStaffTypePrompt(false);
    setShowLoginPrompt(false);
  };

  // Start new chat
  const startNewChat = () => {
    setMessages([]);
    setInput('');
    setAiComparison(null); // Clear comparison when starting new chat
    setSelectedStaffType(null); // Clear staff type
    const newChat = { id: Date.now(), question: '', messages: [] };
    setChatHistory((prev) => [...prev, newChat]);
    localStorage.setItem('chatHistory', JSON.stringify([...chatHistory, newChat]));
  };

  // Load chat history
  const loadChatHistory = (chatId) => {
    const chat = chatHistory.find((ch) => ch.id === chatId);
    if (chat) {
      setMessages(chat.messages || []);
      setAiComparison(null); // Clear comparison when loading history
      // Set staff type based on the last staff message in the chat
      const lastStaffMessage = chat.messages.filter((msg) => msg.sender === 'staff').slice(-1)[0];
      setSelectedStaffType(lastStaffMessage ? lastStaffMessage.staffType : null);
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
                {activeMode === 'ai' ? 'AI Advice Chat' : `${selectedStaffType === 'nutrition' ? 'Nutrition' : 'Health'} Staff Advice Chat`}
              </h1>
              <p className="advice-description">
                {activeMode === 'ai'
                  ? 'Chat with our AI for instant pregnancy-related advice.'
                  : `Get personalized guidance from our ${selectedStaffType === 'nutrition' ? 'nutrition' : 'health'} staff.`}
              </p>
            </motion.div>

            {/* Mode Toggle */}
            <div className="advice-mode-nav">
              <motion.button
                className={`advice-mode-button ${activeMode === 'ai' ? 'active' : ''}`}
                onClick={() => switchMode('ai')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Switch to AI Advice"
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
                aria-label="Switch to Staff Advice"
              >
                Staff Advice
              </motion.button>
            </div>

            {/* Overlay for Staff Type Prompt */}
            {showStaffTypePrompt && (
              <motion.div
                className="advice-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Login Prompt Popup */}
            {showLoginPrompt && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="advice-login-popup"
                role="dialog"
                aria-label="Login Prompt"
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
                  aria-label="Close login prompt"
                >
                  Close
                </button>
              </motion.div>
            )}

            {/* Staff Type Prompt Popup */}
            {showStaffTypePrompt && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="advice-staff-type-popup"
                role="dialog"
                aria-label="Staff Type Selection"
                ref={staffPromptRef}
                tabIndex={-1}
              >
                <h3 className="advice-staff-type-title">Let's Get Started!</h3>
                <p className="advice-staff-type-message">Who would you like to consult with today?</p>
                <div className="advice-staff-type-buttons">
                  <motion.button
                    className="advice-staff-type-button"
                    onClick={() => handleStaffTypeSelect('nutrition')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Select Nutrition Staff"
                  >
                    Nutrition Staff
                  </motion.button>
                  <motion.button
                    className="advice-staff-type-button"
                    onClick={() => handleStaffTypeSelect('health')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Select Health Staff"
                  >
                    Health Staff
                  </motion.button>
                </div>
                <motion.button
                  className="advice-staff-type-cancel"
                  onClick={() => setShowStaffTypePrompt(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Cancel staff type selection"
                >
                  Cancel
                </motion.button>
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

            {/* Footer Note */}
            <p className="advice-footer-note">
              {activeMode === 'ai'
                ? 'Need a human touch? Try our '
                : 'Want instant answers? Check out our '}
              <Link to="/consultation" className="advice-link">
                Consultant Chat
              </Link>{' '}
              page.
            </p>

            {/* Compare to AI Chat Button (only in staff mode) */}
            {activeMode === 'staff' && messages.length > 0 && (
              <motion.button
                className="advice-compare-button"
                onClick={compareToAiChat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                aria-label="Compare staff response to AI response"
              >
                Compare to AI Chat
              </motion.button>
            )}

            {/* AI Comparison Table */}
            {aiComparison && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="advice-comparison-container"
                role="region"
                aria-label="AI and Staff Response Comparison"
              >
                <h3 className="advice-comparison-title">Response Comparison</h3>
                <p className="advice-comparison-question">
                  <strong>Question:</strong> {aiComparison.userMessage}
                </p>
                <table className="advice-comparison-table">
                  <thead>
                    <tr>
                      <th scope="col">{aiComparison.staffType === 'nutrition' ? 'Nutrition Staff Response' : 'Health Staff Response'}</th>
                      <th scope="col">AI Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="advice-message-content bg-staff">
                          <p>{aiComparison.staffResponse}</p>
                          <span className="advice-message-timestamp">
                            {new Date(aiComparison.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="advice-message-content bg-ai">
                          <p>{aiComparison.aiResponse}</p>
                          <span className="advice-message-timestamp">
                            {new Date(aiComparison.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <motion.button
                  className="advice-popup-close"
                  onClick={() => setAiComparison(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Close comparison view"
                >
                  Close Comparison
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdvicePage;