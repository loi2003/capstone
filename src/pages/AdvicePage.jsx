import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import { getCurrentUser } from '../apis/authentication-api';
import { getAIChatResponse } from '../apis/aiadvise-api';
import '../styles/AdvicePage.css';

const AdvicePage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [activeMode, setActiveMode] = useState('ai'); // 'ai' or 'staff'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showStaffTypePrompt, setShowStaffTypePrompt] = useState(false);
  const [selectedStaffType, setSelectedStaffType] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [aiComparison, setAiComparison] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const chatsPerPage = 3;
  const chatContainerRef = useRef(null);
  const staffPromptRef = useRef(null);
  const inputFormRef = useRef(null);

  // Check authentication status and load chat history
  useEffect(() => {
    // Data retrieval: Loading chat history from localStorage
    const storedHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    setChatHistory(storedHistory);

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

  // Auto-scroll to the latest message in chat container
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      const latestMessage = chatContainerRef.current.querySelector(`.advice-message:nth-child(${messages.length})`);
      if (latestMessage) {
        latestMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }, [messages]);

  // Disable scrolling and trap focus when staff type prompt is shown
  useEffect(() => {
    if (showStaffTypePrompt) {
      document.body.style.overflow = 'hidden';
      staffPromptRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
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

    let currentChatId = selectedChatId;
    let storedHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');

    // If no chat is selected, create a new chat
    if (currentChatId === null) {
      currentChatId = Date.now();
      const newChat = { id: currentChatId, question: input, messages: [] };
      storedHistory.push(newChat);
      // Data storage: Saving new chat to localStorage
      localStorage.setItem('chatHistory', JSON.stringify(storedHistory));
      setChatHistory(storedHistory);
      setSelectedChatId(currentChatId);
      // Adjust current page to show the new chat
      setCurrentPage(Math.ceil(storedHistory.length / chatsPerPage));
    }

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      time: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setAiComparison(null);

    // Update chat history in state and localStorage
    const updatedHistory = storedHistory.map((chat) =>
      chat.id === currentChatId
        ? { ...chat, question: chat.question || input, messages: updatedMessages }
        : chat
    );
    setChatHistory(updatedHistory);
    // Data storage: Updating chat history in localStorage
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));

    if (activeMode === 'ai') {
      try {
        // Call the AI chat API
        const response = await getAIChatResponse(input);
        const aiMessage = {
          id: messages.length + 2,
          text: response.reply || 'Sorry, I could not process your request.',
          sender: 'ai',
          time: new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);

        // Update chat history
        const newHistory = updatedHistory.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: finalMessages }
            : chat
        );
        setChatHistory(newHistory);
        // Data storage: Updating chat history with AI response in localStorage
        localStorage.setItem('chatHistory', JSON.stringify(newHistory));
        setIsLoading(false);
      } catch (error) {
        console.error('Error sending message:', error.message);
        const errorMessage = {
          id: messages.length + 2,
          text: 'Error: Could not get a response from the server.',
          sender: 'ai',
          time: new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        const finalMessages = [...updatedMessages, errorMessage];
        setMessages(finalMessages);

        // Update chat history with error
        const newHistory = updatedHistory.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: finalMessages }
            : chat
        );
        setChatHistory(newHistory);
        // Data storage: Updating chat history with error message in localStorage
        localStorage.setItem('chatHistory', JSON.stringify(newHistory));
        setIsLoading(false);
      }
    } else {
      try {
        setTimeout(() => {
          const staffLabel = selectedStaffType === 'nutrition' ? 'Nutrition Staff' : 'Health Staff';
          const responseText = `${staffLabel} Response: Your question has been submitted to our team. Expect a reply soon!`;
          const staffMessage = {
            id: messages.length + 2,
            text: responseText,
            sender: 'staff',
            time: new Date().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            staffType: selectedStaffType,
          };
          const finalMessages = [...updatedMessages, staffMessage];
          setMessages(finalMessages);

          // Update chat history
          const newHistory = updatedHistory.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: finalMessages }
              : chat
          );
          setChatHistory(newHistory);
          // Data storage: Updating chat history with staff response in localStorage
          localStorage.setItem('chatHistory', JSON.stringify(newHistory));
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error submitting to staff:', error);
        const errorMessage = {
          id: messages.length + 2,
          text: 'Error: Could not submit your question. Please try again.',
          sender: 'staff',
          time: new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          staffType: selectedStaffType,
        };
        const finalMessages = [...updatedMessages, errorMessage];
        setMessages(finalMessages);

        // Update chat history with error
        const newHistory = updatedHistory.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: finalMessages }
            : chat
        );
        setChatHistory(newHistory);
        // Data storage: Updating chat history with error message in localStorage
        localStorage.setItem('chatHistory', JSON.stringify(newHistory));
        setIsLoading(false);
      }
    }
  };

  // Compare to AI Chat
  const compareToAiChat = async () => {
    const lastUserMessage = messages.filter((msg) => msg.sender === 'user').slice(-1)[0];
    const lastStaffResponse = messages.filter((msg) => msg.sender === 'staff').slice(-1)[0];
    if (!lastUserMessage) return;

    setIsLoading(true);
    try {
      const response = await getAIChatResponse(lastUserMessage.text);
      setAiComparison({
        userMessage: lastUserMessage.text,
        aiResponse: response.reply || 'Sorry, I could not process your request.',
        staffResponse: lastStaffResponse ? lastStaffResponse.text : 'No staff response yet.',
        staffType: lastStaffResponse ? lastStaffResponse.staffType : selectedStaffType,
        time: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error comparing to AI:', error.message);
      setAiComparison({
        userMessage: lastUserMessage.text,
        aiResponse: 'Error: Could not get AI response.',
        staffResponse: lastStaffResponse ? lastStaffResponse.text : 'No staff response yet.',
        staffType: lastStaffResponse ? lastStaffResponse.staffType : selectedStaffType,
        time: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
      setIsLoading(false);
    }
  };

  // Switch between AI and Staff modes
  const switchMode = (mode) => {
    if (mode === 'staff') {
      if (!isLoggedIn) {
        setShowLoginPrompt(true);
        return;
      }
      setShowStaffTypePrompt(true);
      return;
    }
    setActiveMode(mode);
    setMessages([]);
    setInput('');
    setAiComparison(null);
    setShowLoginPrompt(false);
    setShowStaffTypePrompt(false);
    setSelectedStaffType(null);
    setSelectedChatId(null);
    setCurrentPage(1); // Reset to first page when switching modes
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
    setSelectedChatId(null);
    setCurrentPage(1); // Reset to first page
  };

  // Start new chat
  const startNewChat = () => {
    const newChat = { id: Date.now(), question: '', messages: [] };
    setMessages([]);
    setInput('');
    setAiComparison(null);
    setSelectedStaffType(null);
    setSelectedChatId(newChat.id);
    setChatHistory((prev) => {
      const newHistory = [...prev, newChat];
      // Data storage: Saving new chat to localStorage
      localStorage.setItem('chatHistory', JSON.stringify(newHistory));
      // Set page to show the new chat
      setCurrentPage(Math.ceil(newHistory.length / chatsPerPage));
      return newHistory;
    });
    // Scroll page to bottom (input form)
    setTimeout(() => {
      inputFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 0);
  };

  // Load chat history
  const loadChatHistory = (chatId) => {
    const chat = chatHistory.find((ch) => ch.id === chatId);
    if (chat) {
      setMessages(chat.messages || []);
      setSelectedChatId(chatId);
      setAiComparison(null);
      const lastStaffMessage = chat.messages.filter((msg) => msg.sender === 'staff').slice(-1)[0];
      setSelectedStaffType(lastStaffMessage ? lastStaffMessage.staffType : null);
      setActiveMode(lastStaffMessage ? 'staff' : 'ai');
      // Scroll chat container to bottom smoothly
      setTimeout(() => {
        if (chatContainerRef.current && chat.messages.length > 0) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  };

  // Delete chat
  const deleteChat = (chatId) => {
    // Save current scroll position of the history container
    const historyContainer = document.querySelector('.advice-history-container');
    const currentScrollTop = historyContainer?.scrollTop || 0;

    // Filter out the chat to be deleted
    const updatedHistory = chatHistory.filter((chat) => chat.id !== chatId);

    // Update state and localStorage
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));

    // If the deleted chat is currently selected, clear the chat container
    if (selectedChatId === chatId) {
      setMessages([]);
      setSelectedChatId(null);
      setAiComparison(null);
      setSelectedStaffType(null);
      setActiveMode('ai');
    }

    // Adjust pagination if necessary
    const newTotalPages = Math.ceil(updatedHistory.length / chatsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (updatedHistory.length === 0) {
      setCurrentPage(1);
    }

    // Restore scroll position after animation completes
    setTimeout(() => {
      if (historyContainer) {
        historyContainer.scrollTop = currentScrollTop;
      }
    }, 300); // Match the exit animation duration (0.3s)
  };

  // Pagination controls
  const totalPages = Math.ceil(chatHistory.length / chatsPerPage);
  const startIndex = (currentPage - 1) * chatsPerPage;
  const endIndex = startIndex + chatsPerPage;
  const currentChats = chatHistory.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
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
            <div className="advice-history-container">
              {chatHistory.length === 0 ? (
                <p className="advice-empty-message">No history yet.</p>
              ) : (
                <AnimatePresence mode="wait">
                  {currentChats.map((chat) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
                      transition={{ duration: 0.3 }}
                      className={`advice-history-item ${selectedChatId === chat.id ? 'selected' : ''}`}
                    >
                      <div className="advice-history-content" onClick={() => loadChatHistory(chat.id)}>
                        <span className="advice-history-sender">
                          {chat.question || 'New Chat'}:
                        </span>
                        <span className="advice-history-text">
                          {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text.slice(0, 50) + '...' : 'No messages yet'}
                        </span>
                        <span className="advice-history-timestamp">
                          {chat.messages.length > 0
                            ? chat.messages[chat.messages.length - 1].time
                            : new Date(chat.id).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                        </span>
                      </div>
                      <motion.button
                        className="advice-delete-button"
                        onClick={() => deleteChat(chat.id)}
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Delete chat: ${chat.question || 'New Chat'}`}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="advice-delete-icon"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M4 7h16"
                          />
                        </svg>
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
            {totalPages > 1 && (
              <div className="advice-pagination">
                <motion.button
                  className="advice-pagination-button advice-pagination-previous"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  whileHover={{ scale: 1.1, boxShadow: '0 0 8px rgba(255, 77, 79, 0.5)' }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  aria-label="Go to previous page"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="advice-pagination-icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Prev
                </motion.button>
                <span className="advice-pagination-info">
                  {currentPage}/{totalPages}
                </span>
                <motion.button
                  className="advice-pagination-button advice-pagination-next"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  whileHover={{ scale: 1.1, boxShadow: '0 0 8px rgba(255, 77, 79, 0.5)' }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  aria-label="Go to next page"
                >
                  Next
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="advice-pagination-icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.button>
              </div>
            )}
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
                {activeMode === 'ai' ? (
                  <>
                    <span className="advice-avatar" /> AI Advice Chat
                  </>
                ) : (
                  `${selectedStaffType === 'nutrition' ? 'Nutrition' : 'Health'} Staff Advice Chat`
                )}
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
                <motion.button
                  className="advice-popup-close"
                  onClick={() => setShowLoginPrompt(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Close login prompt"
                >
                  Close
                </motion.button>
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
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`advice-message ${msg.sender === 'user' ? 'message-user' : msg.sender === 'ai' ? 'message-ai' : 'message-staff'}`}
                >
                  {msg.sender === 'ai' && <span className="advice-avatar" />}
                  <div
                    className={`advice-message-content ${
                      msg.sender === 'user' ? 'bg-user' : msg.sender === 'ai' ? 'bg-ai' : 'bg-staff'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="advice-message-timestamp">{msg.time}</span>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`advice-message ${activeMode === 'ai' ? 'message-ai' : 'message-staff'}`}
                >
                  {activeMode === 'ai' && <span className="advice-avatar" />}
                  <div className="advice-message-content typing">
                    <div className="advice-typing">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Form */}
            {(activeMode === 'ai' || (activeMode === 'staff' && isLoggedIn)) && (
              <form ref={inputFormRef} onSubmit={handleSendMessage} className="advice-input-form">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
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
                      d="M22 2L11 13 M22 2L15 22L11 13L2 9L22 2Z"
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
                          <span className="advice-message-timestamp">{aiComparison.time}</span>
                        </div>
                      </td>
                      <td>
                        <div className="advice-message-content bg-ai">
                          <p>{aiComparison.aiResponse}</p>
                          <span className="advice-message-timestamp">{aiComparison.time}</span>
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