import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAIChatResponse } from '../../apis/aiadvise-api';
import './ChatBoxPage.css';

const ChatBoxPage = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatAreaRef = useRef(null);
  const [selectedChatId, setSelectedChatId] = useState(null);

  // Load chat history from localStorage
  useEffect(() => {
    // Data retrieval: Loading chat history from localStorage
    const storedHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    if (selectedChatId !== null) {
      const chat = storedHistory.find((ch) => ch.id === selectedChatId);
      if (chat) {
        setMessages(chat.messages || []);
      }
    } else if (storedHistory.length === 0) {
      // Data storage: Creating new chat in localStorage if no history exists
      const newChat = { id: Date.now(), question: '', messages: [] };
      storedHistory.push(newChat);
      localStorage.setItem('chatHistory', JSON.stringify(storedHistory));
      setMessages([]);
      setSelectedChatId(newChat.id);
    }

    // Scroll to first visible message on initial load
    if (chatAreaRef.current && messages.length > 0) {
      const firstMessage = chatAreaRef.current.querySelector('.chatbox-message');
      if (firstMessage) {
        firstMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedChatId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    let currentChatId = selectedChatId;
    let storedHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');

    // If no chat is selected, create a new chat
    if (currentChatId === null) {
      currentChatId = Date.now();
      const newChat = { id: currentChatId, question: newMessage, messages: [] };
      storedHistory.push(newChat);
      // Data storage: Saving new chat to localStorage
      localStorage.setItem('chatHistory', JSON.stringify(storedHistory));
      setSelectedChatId(currentChatId);
    }

    const userMsg = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      time: new Date().toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setNewMessage('');
    // Scroll to the newly added user message
    setTimeout(() => {
      if (chatAreaRef.current) {
        const latestMessage = chatAreaRef.current.querySelector(`.chatbox-message:nth-child(${updatedMessages.length})`);
        if (latestMessage) {
          latestMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
    setIsTyping(true);

    try {
      // Call the AI chat API
      const response = await getAIChatResponse(newMessage);
      const systemMsg = {
        id: messages.length + 2,
        text: response.reply || 'Sorry, I could not process your request.',
        sender: 'system',
        time: new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      };
      const finalMessages = [...updatedMessages, systemMsg];
      setMessages(finalMessages);
      // Scroll to the AI response or typing indicator
      setTimeout(() => {
        if (chatAreaRef.current) {
          const latestElement = isTyping 
            ? chatAreaRef.current.querySelector('.chatbox-message.typing')
            : chatAreaRef.current.querySelector(`.chatbox-message:nth-child(${finalMessages.length})`);
          if (latestElement) {
            latestElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);

      // Data storage: Updating chat history in localStorage
      storedHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      const updatedHistory = storedHistory.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, question: chat.question || newMessage, messages: finalMessages }
          : chat
      );
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error sending message:', error.message);
      const errorMsg = {
        id: messages.length + 2,
        text: 'Error: Could not get a response from the server.',
        sender: 'system',
        time: new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      // Scroll to the error message
      setTimeout(() => {
        if (chatAreaRef.current) {
          const latestMessage = chatAreaRef.current.querySelector(`.chatbox-message:nth-child(${finalMessages.length})`);
          if (latestMessage) {
            latestMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);
      // Data storage: Updating chat history with error message in localStorage
      storedHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      const updatedHistory = storedHistory.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, question: chat.question || newMessage, messages: finalMessages }
          : chat
      );
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(Number(chatId));
  };

  // Data retrieval: Loading stored chat history from localStorage
  const storedHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="chatbox-container"
    >
      <div className="chatbox-header">
        <div className="chatbox-avatar"></div>
        <div className="chatbox-info">
          <h3>Pregnancy Support</h3>
          {/* <span className="chatbox-status">Online</span> */}
        </div>
        <button className="chatbox-close" onClick={onClose} aria-label="Close chat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
      {storedHistory.length > 0 && (
        <div className="chatbox-chat-select">
          <select
            className="chatbox-chat-dropdown"
            onChange={(e) => handleSelectChat(e.target.value)}
            value={selectedChatId || ''}
          >
            <option value="" disabled>Select a chat</option>
            {storedHistory.map((chat) => (
              <option key={chat.id} value={chat.id}>
                {chat.question || 'New Chat'} -{' '}
                {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text.slice(0, 20) + '...' : 'No messages'}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="chatbox-area" ref={chatAreaRef}>
        {messages.length === 0 && selectedChatId === null && storedHistory.length === 0 && (
          <div className="chatbox-welcome">
            <p>Hello! Welcome to Pregnancy Support. Send a message to start.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`chatbox-message ${msg.sender}`}>
            <div className="chatbox-bubble">
              {msg.text}
              <span className="chatbox-time">{msg.time}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chatbox-message system typing">
            <div className="chatbox-bubble typing">
              <div className="chatbox-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="chatbox-input-area">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="chatbox-input-form"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="chatbox-input"
            aria-label="Type a message"
            required
          />
          <motion.button
            type="submit"
            className="chatbox-send-button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            disabled={!newMessage.trim()}
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </motion.button>
        </form>
      </div>
      <p className="chatbox-footer-note">
        More Function? Try our <Link to="/advice" className="chatbox-link">Advice Chat</Link> page.
      </p>
    </motion.div>
  );
};

export default ChatBoxPage;