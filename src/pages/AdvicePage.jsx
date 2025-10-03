// AdvicePage.jsx - Fixed with separate AI and Staff chat containers
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as signalR from "@microsoft/signalr";
import MainLayout from "../layouts/MainLayout";
import { getCurrentUser } from "../apis/authentication-api";
import { getAIChatResponse } from "../apis/aiadvise-api";
import {
  startChatThread,
  sendMessage,
  getChatThreadByUserId,
  getChatThreadById,
  softDeleteChatThread,
} from "../apis/message-api";
import { getAllUsers } from "../apis/user-api";
import { useMessages } from "../utils/useMessages";
import "../styles/AdvicePage.css";
import {
  FaUser,
  FaHeart,
  FaLeaf,
  FaRandom,
  FaPaperclip,
  FaTimes,
  FaFile,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaRobot,
} from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import { HiPaperAirplane } from "react-icons/hi2";

const AdvicePage = () => {
  // Use the same pattern as ConsultationChat
  const messagesEndRef = useRef(null);
  const {
    connection,
    messages,
    addMessage,
    connectionStatus,
    isReconnecting,
    isConnected,
  } = useMessages();

  // Separate message states for AI and Staff
  const [aiMessages, setAiMessages] = useState([]);
  const [aiChatHistory, setAiChatHistory] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRetryCount, setAiRetryCount] = useState(0);

  // AI chat history management
  const [aiChatSessions, setAiChatSessions] = useState([]);
  const [selectedAiChatId, setSelectedAiChatId] = useState(null);

  const [staffMessages, setStaffMessages] = useState([]);

  // Original AdvicePage states
  const [currentUserId, setCurrentUserId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Staff consultation states
  const [activeMode, setActiveMode] = useState("ai");
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [chatThreads, setChatThreads] = useState({});
  const [staffChatHistory, setStaffChatHistory] = useState([]);

  // Message input and file handling
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Add the same processedMessageIds pattern from ConsultationChat
  const processedMessageIds = useRef(new Set());

  const supportedImageTypes = [".jpg", ".jpeg", ".png"];
  const supportedDocTypes = [".docx", ".xls", ".xlsx", ".pdf"];
  const allSupportedTypes = [...supportedImageTypes, ...supportedDocTypes];

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
  const inputRef = useRef(null);

  // Load AI chat history from localStorage
  const loadAiChatHistory = () => {
    try {
      const savedSessions = localStorage.getItem(
        `ai_chat_sessions_${currentUserId}`
      );
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        setAiChatSessions(parsedSessions);
        // Load the most recent session if no session is selected
        if (parsedSessions.length > 0 && !selectedAiChatId) {
          const latestSession = parsedSessions[0];
          setSelectedAiChatId(latestSession.id);
          setAiMessages(latestSession.messages || []);
        }
      }
    } catch (error) {
      console.error("Failed to load AI chat history:", error);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      loadAiChatHistory();
    }
  }, [currentUserId]);

  // Save AI chat history to localStorage
  const saveAiChatHistory = (messages) => {
    try {
      localStorage.setItem(
        `ai_chat_history_${currentUserId}`,
        JSON.stringify(messages)
      );
    } catch (error) {
      console.error("Failed to save AI chat history:", error);
    }
  };

  const saveAiChatSessions = (sessions) => {
    try {
      // Sanitize sessions to remove any non-serializable data
      const sanitizedSessions = sessions.map((session) => ({
        id: session.id,
        messages: session.messages.map((msg) => ({
          id: msg.id,
          text: String(msg.text || ""),
          sender: msg.sender,
          timestamp: msg.timestamp,
          time: msg.time,
          isError: msg.isError || false,
          canRetry: msg.canRetry || false,
          originalMessage: msg.originalMessage
            ? String(msg.originalMessage)
            : undefined,
        })),
        lastMessage: String(session.lastMessage || ""),
        timestamp: session.timestamp,
        createdAt: session.createdAt,
      }));

      localStorage.setItem(
        `ai_chat_sessions_${currentUserId}`,
        JSON.stringify(sanitizedSessions)
      );
    } catch (error) {
      console.error("Failed to save AI chat sessions:", error);
    }
  };

  // Create new AI chat session
  const handleNewAiChat = () => {
    const newSession = {
      id: Date.now(),
      messages: [],
      lastMessage: "New AI conversation",
      timestamp: new Date().toLocaleString(),
      createdAt: new Date().toISOString(),
    };

    const updatedSessions = [newSession, ...aiChatSessions];
    setAiChatSessions(updatedSessions);
    setSelectedAiChatId(newSession.id);
    setAiMessages([]);
    saveAiChatSessions(updatedSessions);
  };

  // Select AI chat session
  const handleSelectAiChat = (session) => {
    setSelectedAiChatId(session.id);
    setAiMessages(session.messages || []);
    setTimeout(() => scrollToBottom(), 100);
  };

  const handleSelectStaffChat = (chat) => {
    const staff = staffMembers.find((s) => s.id === chat.staffId);
    if (!staff) return;

    setSelectedStaff(staff);

    // Load messages from chatThreads
    if (chatThreads[chat.staffId]) {
      setStaffMessages(chatThreads[chat.staffId].messages || []);
    } else {
      setStaffMessages([]);
    }

    // Update selected chat ID if needed
    setSelectedChatId(chat.id);

    // Scroll to bottom
    setTimeout(() => scrollToBottom(), 100);
  };

  // Delete AI chat session
  const handleDeleteAiChat = (sessionId) => {
    const updatedSessions = aiChatSessions.filter(
      (session) => session.id !== sessionId
    );
    setAiChatSessions(updatedSessions);
    saveAiChatSessions(updatedSessions);

    // If deleting the selected session, switch to the next available one
    if (selectedAiChatId === sessionId) {
      if (updatedSessions.length > 0) {
        const nextSession = updatedSessions[0];
        setSelectedAiChatId(nextSession.id);
        setAiMessages(nextSession.messages || []);
      } else {
        setSelectedAiChatId(null);
        setAiMessages([]);
      }
    }

    // Clear from localStorage if this is the user's last session
    if (updatedSessions.length === 0) {
      localStorage.removeItem(`ai_chat_sessions_${currentUserId}`);
    }
  };

  // Clear all AI chat history
  const clearAllAiChatHistory = () => {
    setAiMessages([]);
    setAiChatSessions([]);
    setSelectedAiChatId(null);
    try {
      localStorage.removeItem(`ai_chat_sessions_${currentUserId}`);
    } catch (error) {
      console.error("Failed to clear AI chat history:", error);
    }
  };

  const handleSendAiMessage = async (messageText = null, retryAttempt = 0) => {
    const messageToSend = messageText || newMessage.trim();
    if (!messageToSend || isAiLoading) return;

    // Create clean user message object
    const userMessage = {
      id: `ai_user_${Date.now()}_${Math.random()}`,
      text: String(messageToSend),
      sender: "user",
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    // Add user message immediately
    const updatedMessages = [...aiMessages, userMessage];
    setAiMessages(updatedMessages);

    // Clear input only if this is a new message (not retry)
    if (!messageText) {
      setNewMessage("");
    }

    setIsAiLoading(true);
    setIsTyping(true);

    try {
      console.log("🤖 Sending message to AI:", messageToSend);
      const response = await getAIChatResponse(messageToSend);
      console.log("🤖 AI Response received:", response);

      // Create AI response message
      const aiMessage = {
        id: `ai_response_${Date.now()}_${Math.random()}`,
        text:
          response.data?.reply ||
          response.reply ||
          "I apologize, but I encountered an issue generating a response. Please try again.",
        sender: "ai",
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };

      // Add AI response
      const finalMessages = [...updatedMessages, aiMessage];
      setAiMessages(finalMessages);

      let currentSessions = [...aiChatSessions];
      let currentSessionId = selectedAiChatId;

      // Create new session if none exists
      if (!currentSessionId) {
        const newSession = {
          id: Date.now(),
          messages: finalMessages,
          lastMessage: messageToSend,
          timestamp: new Date().toLocaleString(),
          createdAt: new Date().toISOString(),
        };
        currentSessions = [newSession, ...currentSessions];
        currentSessionId = newSession.id;
        setSelectedAiChatId(currentSessionId);
        setAiChatSessions(currentSessions); // ADD THIS LINE
      } else {
        // Update existing session
        currentSessions = currentSessions.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                messages: finalMessages,
                lastMessage: messageToSend,
                timestamp: new Date().toLocaleString(),
              }
            : session
        );
        setAiChatSessions(currentSessions); // ADD THIS LINE
      }

      // Save to localStorage
      saveAiChatSessions(currentSessions);

      // Reset retry count on success
      setAiRetryCount(0);

      // Auto-scroll to bottom
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error("🤖 AI Chat Error:", error);

      // Create error message with retry option
      const errorMessage = {
        id: `ai_error_${Date.now()}_${Math.random()}`,
        text:
          retryAttempt < 2
            ? "I encountered an issue. Let me try again..."
            : "I'm having trouble right now. Please try again in a moment or contact our staff for assistance.",
        sender: "ai",
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        isError: true,
        canRetry: retryAttempt < 2,
        originalMessage: messageToSend,
      };

      const messagesWithError = [...updatedMessages, errorMessage];
      setAiMessages(messagesWithError);

      // Auto-retry for network errors (up to 2 times)
      if (
        retryAttempt < 2 &&
        (error.name === "NetworkError" || error.code === "NETWORK_ERROR")
      ) {
        setAiRetryCount(retryAttempt + 1);
        setTimeout(() => {
          handleSendAiMessage(messageToSend, retryAttempt + 1);
        }, 1000 * (retryAttempt + 1));
      }
    } finally {
      setIsAiLoading(false);
      setIsTyping(false);
    }
  };

  // Clear AI chat history
  const clearAiChatHistory = () => {
    setAiMessages([]);
    setAiChatHistory([]);
    try {
      localStorage.removeItem(`ai_chat_history_${currentUserId}`);
    } catch (error) {
      console.error("Failed to clear AI chat history:", error);
    }
  };

  // Retry failed AI message
  const retryAiMessage = (originalMessage) => {
    // Remove the error message
    setAiMessages((prev) => prev.filter((msg) => !msg.isError));
    // Set the original message back and retry
    setNewMessage(originalMessage);
    handleSendAiMessage(originalMessage, 0);
  };

  // Utility functions (keep existing ones)
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        // Try to find the specific messages container in AdvicePage
        const messagesContainer = messagesEndRef.current.closest(
          ".staff-chat-messages, .ai-chat-messages, .chat-messages-area, .messages-container"
        );

        if (messagesContainer) {
          // Scroll only the messages container
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } else {
          // Alternative: Find parent with overflow scroll
          let parent = messagesEndRef.current.parentElement;
          while (parent) {
            const styles = window.getComputedStyle(parent);
            if (styles.overflowY === "auto" || styles.overflowY === "scroll") {
              parent.scrollTop = parent.scrollHeight;
              return;
            }
            parent = parent.parentElement;
          }

          // Last resort: scroll to the element but prevent page scroll
          messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest", // Changed from "end" to "nearest"
            inline: "nearest",
          });
        }
      }
    });
  };

  const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0,
      n = bytes;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
  };

  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const extension = "." + fileName.toLowerCase().split(".").pop();
    return supportedImageTypes.includes(extension);
  };

  // Initialize user
  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const userResponse = await getCurrentUser(token);
      const userData = userResponse?.data?.data || userResponse?.data;

      if (userData?.id) {
        setCurrentUserId(userData.id);
        setIsLoggedIn(true);

        // Load AI chat history after user is set
        setTimeout(() => loadAiChatHistory(), 100);

        await loadAllStaff();
        await loadExistingStaffThreads(userData.id);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Failed to initialize user:", error);
      setIsLoggedIn(false);
    }
  };

  const switchToAiMode = () => {
    setActiveMode("ai");
    // No need to load messages - they're already in aiMessages state
    setTimeout(() => scrollToBottom(), 100);
  };

  // Load staff members
  const loadAllStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const usersResponse = await getAllUsers(token);
      const allUsers = usersResponse?.data || usersResponse || [];

      const staffOnly = allUsers.filter(
        (user) => user.roleId === 3 || user.roleId === 4
      );

      const enhancedStaff = staffOnly.map((staff) => ({
        ...staff,
        staffType: staff.roleId === 3 ? "health" : "nutrition",
        specialization:
          staff.roleId === 3 ? "Health Expert" : "Nutrition Specialist",
      }));

      setStaffMembers(enhancedStaff);
    } catch (error) {
      console.error("Failed to load staff members:", error);
    }
  };

  // AI Message Component
  const AIMessageComponent = ({ message }) => (
    <div
      className={`message ${
        message.sender === "user" ? "user-message" : "ai-message"
      }`}
    >
      <div className="message-content">
        {message.sender === "ai" && (
          <div className="ai-avatar">
            <FaRobot />
          </div>
        )}
        <div className="message-bubble">
          <div className="message-text">{message.text}</div>
          <div className="message-time">
            {message.time}
            {message.sender === "ai" && (
              <span className="ai-label">AI Assistant</span>
            )}
          </div>
          {message.isError && message.canRetry && (
            <button
              className="retry-button"
              onClick={() => retryAiMessage(message.originalMessage)}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const ModeSelector = () => (
    <div className="consultation-mode-selector">
      <button
        className={`mode-btn ${activeMode === "ai" ? "active" : ""}`}
        onClick={switchToAiMode}
      >
        <FaRobot className="mode-icon" />
        <span>AI Assistant</span>
        {aiMessages.length > 0 && (
          <span className="message-count">{aiMessages.length}</span>
        )}
      </button>

      <button
        className={`mode-btn ${activeMode === "staff" ? "active" : ""}`}
        onClick={switchToStaffMode}
      >
        <FaUser className="mode-icon" />
        <span>Staff Consultation</span>
        {selectedStaff && (
          <span className="staff-name">{selectedStaff.userName}</span>
        )}
      </button>
    </div>
  );

  const ChatInterface = () => (
    <div className="chat-interface">
      {activeMode === "ai" ? (
        <div className="ai-chat-container">
          <div className="ai-chat-header">
            <div className="ai-info">
              <FaRobot className="ai-icon" />
              <div>
                <h3>AI Health Assistant</h3>
                <p>Get instant, evidence-based health guidance</p>
              </div>
            </div>
            {aiMessages.length > 0 && (
              <button className="clear-chat-btn" onClick={clearAiChatHistory}>
                <FaTrash /> Clear Chat
              </button>
            )}
          </div>

          <div className="ai-chat-messages">
            {aiMessages.length === 0 ? (
              <div className="welcome-message">
                <FaRobot className="welcome-icon" />
                <h3>Welcome to AI Health Assistant</h3>
                <p>
                  I'm here to provide evidence-based guidance on pregnancy,
                  nutrition, and health. How can I help you today?
                </p>
              </div>
            ) : (
              aiMessages.map((message) => (
                <AIMessageComponent key={message.id} message={message} />
              ))
            )}
            {isAiLoading && (
              <div className="ai-typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      ) : (
        // Keep your existing staff chat interface
        <div className="staff-chat-container">
          {/* Your existing staff chat UI */}
        </div>
      )}
    </div>
  );

  // Enhanced Input Area
  const InputArea = () => (
    <div className="input-area">
      <div className="input-container">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            activeMode === "ai"
              ? "Ask AI about pregnancy, nutrition, or health..."
              : "Type your message to staff..."
          }
          disabled={
            (activeMode === "ai" && isAiLoading) ||
            (activeMode === "staff" && sendingMessage)
          }
          rows={1}
          className="message-input"
        />

        {activeMode === "staff" && (
          <button
            className="attachment-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaPaperclip />
          </button>
        )}

        <button
          className="send-btn"
          onClick={handleSendMessage}
          disabled={
            !newMessage.trim() ||
            (activeMode === "ai" && isAiLoading) ||
            (activeMode === "staff" && sendingMessage)
          }
        >
          {(activeMode === "ai" && isAiLoading) ||
          (activeMode === "staff" && sendingMessage) ? (
            <div className="loading-spinner" />
          ) : (
            <HiPaperAirplane />
          )}
        </button>
      </div>

      {selectedFile && (
        <div className="file-preview">
          <div className="file-info">
            <FaFile />
            <span>{selectedFile.name}</span>
            <button onClick={clearSelectedFile}>
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={allSupportedTypes.join(",")}
        style={{ display: "none" }}
      />
    </div>
  );

  // Load existing staff threads (adapted from ConsultationChat pattern)
  const loadExistingStaffThreads = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const threadsResponse = await getChatThreadByUserId(userId, token);

      let threads = [];
      if (Array.isArray(threadsResponse)) {
        threads = threadsResponse;
      } else if (threadsResponse?.data && Array.isArray(threadsResponse.data)) {
        threads = threadsResponse.data;
      } else if (threadsResponse?.id) {
        threads = [threadsResponse];
      }

      if (threads.length > 0) {
        const threadsMap = {};
        const history = [];

        for (const thread of threads) {
          const staffId = thread.consultantId;
          if (!staffId) continue;

          try {
            // Find staff member data
            const staffMember = staffMembers.find(
              (staff) => staff.id === staffId
            );

            // Process messages with attachments
            const processedMessages =
              thread.messages?.map((msg) => {
                // Fix UTC timestamp by adding Z if missing
                let createdAt =
                  msg.createdAt || msg.sentAt || new Date().toISOString();
                if (
                  typeof createdAt === "string" &&
                  !createdAt.includes("Z")
                  // &&
                  // !createdAt.includes("+") &&
                  // !createdAt.includes("-")
                ) {
                  createdAt = createdAt + "Z";
                }

                const processedMsg = {
                  ...msg,
                  text: msg.messageText || msg.message || msg.text,
                  time: new Date(createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }),
                  isUser: msg.senderId === userId,
                  createdAt: createdAt,
                };

                // Handle attachments
                if (msg.attachmentUrl || msg.attachmentPath || msg.attachment) {
                  processedMsg.attachment = {
                    fileName:
                      msg.attachmentFileName || msg.fileName || "Attachment",
                    fileSize: msg.attachmentFileSize || msg.fileSize,
                    fileType: msg.attachmentFileType || msg.fileType,
                    isImage: isImageFile(
                      msg.attachmentFileName || msg.fileName
                    ),
                    url:
                      msg.attachmentUrl ||
                      msg.attachmentPath ||
                      msg.attachment?.url,
                  };
                }

                // Handle media array (same as ConsultationChat)
                if (
                  msg.media &&
                  Array.isArray(msg.media) &&
                  msg.media.length > 0
                ) {
                  const firstMedia = msg.media[0];
                  processedMsg.attachment = {
                    fileName: firstMedia.fileName || "Attachment",
                    fileSize: firstMedia.fileSize,
                    fileType: firstMedia.fileType,
                    isImage: isImageFile(firstMedia.fileName || ""),
                    url: firstMedia.fileUrl || firstMedia.url,
                  };
                }

                return processedMsg;
              }) || [];

            threadsMap[staffId] = {
              thread,
              messages: processedMessages,
              staff: staffMember || {
                id: staffId,
                userName: "Staff Member",
                staffType: "unknown",
                specialization: "Expert",
              },
            };

            // Add to chat history
            if (processedMessages.length > 0) {
              const lastMessage =
                processedMessages[processedMessages.length - 1];
              history.push({
                id: thread.id,
                staffId: staffId,
                staffName: staffMember?.userName || "Staff Member",
                staffType: staffMember?.staffType || "unknown",
                lastMessage: lastMessage.text || "Chat started",
                timestamp: new Date().toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }),
                messages: processedMessages,
              });
            }
          } catch (err) {
            console.error(`Failed to fetch staff ${staffId}:`, err);
          }
        }

        setChatThreads(threadsMap);
        setStaffChatHistory(history);
      }
    } catch (error) {
      console.error("Failed to load existing staff threads:", error);
    }
  };
  const [randomStaffSelected, setRandomStaffSelected] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  // Handle staff selection
  const handleStaffSelect = async (staff) => {
    setSelectedStaff(staff);
    setActiveMode("staff");

    const staffId = staff.id;

    if (chatThreads[staffId]) {
      // Load existing messages
      setStaffMessages(chatThreads[staffId].messages);
      return;
    }

    // Create empty chat thread for new staff
    setChatThreads((prev) => ({
      ...prev,
      [staffId]: {
        thread: null,
        messages: [],
        staff: staff,
      },
    }));
    setStaffMessages([]);
  };

  // Join thread when staff is selected (same as ConsultationChat)
  useEffect(() => {
    if (
      connection &&
      selectedStaff &&
      chatThreads[selectedStaff.id]?.thread?.id
    ) {
      const threadId = chatThreads[selectedStaff.id].thread.id;
      connection
        .invoke("JoinThread", threadId)
        .catch((err) => console.error("JoinThread failed:", err));
    }
  }, [connection, selectedStaff, chatThreads]);

  // Real-time message handling (exactly like ConsultationChat)
  useEffect(() => {
    if (messages.length === 0) return;

    const latest = messages[messages.length - 1];
    console.log("Processing incoming message in AdvicePage:", latest);

    // Early duplicate check
    if (!latest.id || processedMessageIds.current.has(latest.id)) {
      console.log("Message already processed, skipping:", latest.id);
      return;
    }

    // These are already added immediately in handleSendStaffMessage
    if (latest.senderId === currentUserId) {
      console.log(
        "Skipping user's own message to prevent duplication:",
        latest.id
      );
      processedMessageIds.current.add(latest.id);
      return;
    }

    // Mark message as processed
    processedMessageIds.current.add(latest.id);

    if (selectedStaff?.id && activeMode === "staff") {
      const staffId = selectedStaff.id;

      setChatThreads((prev) => {
        const existingMessages = prev[staffId]?.messages || [];

        // Secondary check at state level
        const messageExists = existingMessages.some((m) => m.id === latest.id);
        if (messageExists) {
          console.log("Message already exists in thread, skipping:", latest.id);
          return prev;
        }

        console.log("Adding new STAFF message to thread:", staffId);

        // Process the message (same as ConsultationChat)
        const processedMessage = {
          ...latest,
          text: latest.messageText || latest.message || latest.text,
          time: (() => {
            // Fix UTC timestamp by adding Z if missing
            let timestamp = latest.createdAt || new Date().toISOString();
            if (typeof timestamp === "string" && !timestamp.includes("Z")) {
              timestamp = timestamp + "Z";
            }
            return new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
          })(),
          isUser: latest.senderId === currentUserId,
          messageText: latest.messageText?.trim(),
        };

        // Handle media attachments
        if (
          latest.media &&
          Array.isArray(latest.media) &&
          latest.media.length > 0
        ) {
          const firstMedia = latest.media[0];
          processedMessage.attachment = {
            fileName: firstMedia.fileName || "Attachment",
            fileSize: firstMedia.fileSize,
            fileType: firstMedia.fileType,
            isImage: isImageFile(firstMedia.fileName || ""),
            url: firstMedia.fileUrl || firstMedia.url,
          };
        }

        const updatedMessages = [...existingMessages, processedMessage];

        // Update staff messages if this is the active conversation
        if (activeMode === "staff" && selectedStaff.id === staffId) {
          setStaffMessages(updatedMessages);
        }

        return {
          ...prev,
          [staffId]: {
            ...prev[staffId],
            messages: updatedMessages,
          },
        };
      });

      // Auto scroll
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages, selectedStaff?.id, currentUserId, activeMode]);

  // Cleanup for processed message IDs (same as ConsultationChat)
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (processedMessageIds.current.size > 1000) {
        console.log("Cleaning up processed message IDs");
        processedMessageIds.current.clear();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(cleanup);
  }, []);

  // Send staff message function (adapted from ConsultationChat)
  const handleSendStaffMessage = async () => {
    if (!connection || !isConnected) {
      console.error("SignalR connection not established");
      if (isReconnecting) {
        alert("Reconnecting... Please try again in a moment.");
      } else {
        alert("Connection lost. Please wait while we reconnect...");
      }
      return;
    }

    if (connection.state !== signalR.HubConnectionState.Connected) {
      console.error(
        "SignalR connection not ready. Current state:",
        connection.state
      );
      alert("Connection not ready. Please wait a moment and try again.");
      return;
    }

    const staffId = selectedStaff?.id;
    const activeThread = chatThreads[staffId]?.thread;

    if (
      (!newMessage.trim() && !selectedFile) ||
      !activeThread ||
      sendingMessage
    ) {
      return;
    }

    try {
      setSendingMessage(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("ChatThreadId", activeThread.id);
      formData.append("SenderId", currentUserId);

      if (newMessage.trim()) {
        formData.append("MessageText", newMessage.trim());
      }

      if (selectedFile) {
        formData.append("Attachments", selectedFile);
        formData.append("AttachmentFileName", selectedFile.name);
        formData.append("AttachmentFileType", selectedFile.type);
        formData.append("AttachmentFileSize", selectedFile.size.toString());
      }

      // ✅ CRITICAL FIX: Create user message with proper ID
      const userMessageId = `user_${Date.now()}_${Math.random()}`;

      const userMessage = {
        id: userMessageId,
        senderId: currentUserId,
        receiverId: staffId,
        text: newMessage.trim(),
        messageText: newMessage.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        isUser: true,
        createdAt: new Date().toISOString(),
        attachment: selectedFile
          ? {
              fileName: selectedFile.name,
              fileSize: selectedFile.size,
              fileType: selectedFile.type,
              isImage: isImageFile(selectedFile.name),
              url: filePreview,
            }
          : null,
      };

      processedMessageIds.current.add(userMessageId);

      // Add user message to UI immediately
      setChatThreads((prevThreads) => ({
        ...prevThreads,
        [staffId]: {
          ...prevThreads[staffId],
          messages: [...(prevThreads[staffId]?.messages || []), userMessage],
        },
      }));
      setStaffMessages((prev) => [...prev, userMessage]);

      // Send to server
      const response = await sendMessage(formData, token);
      console.log("Send message response:", response);

      if (response.error === 0) {
        // but don't add a new message
        const serverMessageId = response.data?.id;

        if (serverMessageId && serverMessageId !== userMessageId) {
          // Map server ID to our message
          processedMessageIds.current.add(serverMessageId);

          // Update existing message with server data
          setChatThreads((prevThreads) => ({
            ...prevThreads,
            [staffId]: {
              ...prevThreads[staffId],
              messages: prevThreads[staffId].messages.map((msg) =>
                msg.id === userMessageId
                  ? { ...msg, id: serverMessageId, ...response.data }
                  : msg
              ),
            },
          }));

          setStaffMessages((prev) =>
            prev.map((msg) =>
              msg.id === userMessageId
                ? { ...msg, id: serverMessageId, ...response.data }
                : msg
            )
          );
        }

        setNewMessage("");
        clearSelectedFile();
        scrollToBottom();
      } else {
        // Remove failed message from UI
        setChatThreads((prevThreads) => ({
          ...prevThreads,
          [staffId]: {
            ...prevThreads[staffId],
            messages: prevThreads[staffId].messages.filter(
              (msg) => msg.id !== userMessageId
            ),
          },
        }));
        setStaffMessages((prev) =>
          prev.filter((msg) => msg.id !== userMessageId)
        );

        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove failed message from UI
      const staffId = selectedStaff?.id;
      setChatThreads((prevThreads) => ({
        ...prevThreads,
        [staffId]: {
          ...prevThreads[staffId],
          messages: prevThreads[staffId].messages.filter(
            (msg) => !msg.id.startsWith("user_")
          ),
        },
      }));
      setStaffMessages((prev) =>
        prev.filter((msg) => !msg.id.startsWith("user_"))
      );

      if (
        !isConnected ||
        connection.state !== signalR.HubConnectionState.Connected
      ) {
        alert(
          "Connection lost while sending message. Your message will be sent when reconnected."
        );
      } else {
        alert("Failed to send message. Please try again.");
      }
    } finally {
      setSendingMessage(false);
    }
  };

  // File handling functions
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const fileExtension = "." + fileName.split(".").pop();

    if (!allSupportedTypes.includes(fileExtension)) {
      alert(
        `Unsupported file type. Supported types: ${allSupportedTypes.join(
          ", "
        )}`
      );
      return;
    }

    setSelectedFile(file);

    if (supportedImageTypes.includes(fileExtension)) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Start chat thread (when user sends first message)
  const handleStartStaffChat = async () => {
    if (!selectedStaff) return;

    const staffId = selectedStaff.id;
    if (chatThreads[staffId]?.thread) return;

    try {
      setStartingChat(true);
      const token = localStorage.getItem("token");

      const threadData = {
        userId: currentUserId,
        consultantId: staffId,
      };

      const createdThread = await startChatThread(threadData, token);
      const threadId =
        createdThread?.data?.id ||
        createdThread?.data?.chatThreadId ||
        createdThread?.chatThreadId;

      if (!threadId) {
        console.error("No threadId found in response:", createdThread);
        return;
      }

      const threadWithMessages = await getChatThreadById(threadId, token);

      // Update chat threads
      setChatThreads((prevThreads) => ({
        ...prevThreads,
        [staffId]: {
          thread: {
            ...threadWithMessages?.data,
            id: threadId,
            consultantId: staffId,
            userId: currentUserId,
          },
          messages: threadWithMessages?.data?.messages || [],
          staff: selectedStaff,
        },
      }));

      // **ADD THIS: Create history entry immediately after starting consultation**
      const newHistoryEntry = {
        id: threadId,
        staffId: staffId,
        staffName: selectedStaff.userName,
        staffType: selectedStaff.staffType,
        lastMessage: "Chat started",
        timestamp: new Date().toLocaleString({
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        messages: [],
      };

      // Add to staff chat history so it appears in the sidebar
      setStaffChatHistory((prev) => [newHistoryEntry, ...prev]);
    } catch (error) {
      console.error("Failed to start staff chat thread:", error);
    } finally {
      setStartingChat(false);
    }
  };

  // Connection status indicator (same as ConsultationChat)
  const ConnectionStatusIndicator = () => {
    if (isConnected && !isReconnecting) {
      return null;
    }

    const getStatusMessage = () => {
      switch (connectionStatus) {
        case "connecting":
          return "Connecting...";
        case "reconnecting":
          return "Reconnecting...";
        case "disconnected":
          return "Connection lost - Attempting to reconnect...";
        default:
          return "Connection status unknown";
      }
    };

    const getStatusColor = () => {
      switch (connectionStatus) {
        case "connecting":
          return "#2196f3";
        case "reconnecting":
          return "#ff9800";
        case "disconnected":
          return "#f44336";
        default:
          return "#9e9e9e";
      }
    };

    return (
      <div
        className="connection-status-indicator"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: getStatusColor(),
          color: "white",
          padding: "8px 16px",
          textAlign: "center",
          zIndex: 1000,
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        {getStatusMessage()}
      </div>
    );
  };
  // AI Chat functionality (keep original)
  const handleAISubmit = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    const newUserMessage = {
      text: userMessage,
      isUser: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    const updatedMessages = [...aiMessages, newUserMessage];
    setAiMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Add to history
    const newChat = {
      id: Date.now(),
      messages: [newUserMessage],
      timestamp: new Date().toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
    setChatHistory((prev) => [newChat, ...prev]);
    setSelectedChatId(newChat.id);

    try {
      const response = await getAIChatResponse(userMessage);
      const aiResponse =
        response.data?.message ||
        response.message ||
        "I'm here to help with your pregnancy questions!";

      const newAIMessage = {
        text: aiResponse,
        isUser: false,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };

      const finalMessages = [...updatedMessages, newAIMessage];
      setAiMessages(finalMessages);

      // Update history
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === newChat.id ? { ...chat, messages: finalMessages } : chat
        )
      );
    } catch (error) {
      console.error("AI response error:", error);
      const errorMessage = {
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
      setAiMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Staff selection and chat functionality
  const handleStaffModeActivation = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    setActiveMode("staff");
    if (!randomStaffSelected) {
      setShowStaffTypePrompt(true);
    }
  };

  useEffect(() => {
    if (!connection || !isConnected) return;

    const messageListener = (message) => {
      console.log("Received message:", message);

      if (activeMode === "staff" && selectedStaff) {
        const staffId = selectedStaff.id;

        // Check if message is for the current staff conversation
        if (
          message.senderId === staffId ||
          message.receiverId === currentUserId
        ) {
          // Process the incoming message
          const incomingMsg = {
            id: message.id || Date.now(),
            senderId: message.senderId,
            receiverId: message.receiverId || currentUserId,
            messageText: message.messageText || message.message || message.text,
            createdAt: message.createdAt || new Date().toISOString(),
            attachment: message.attachment || null,
          };

          // Update staff messages
          setStaffMessages((prev) => {
            // Check if message already exists to prevent duplicates
            if (prev.some((msg) => msg.id === incomingMsg.id)) {
              return prev;
            }
            return [...prev, incomingMsg];
          });

          // Update chat threads
          setChatThreads((prev) => ({
            ...prev,
            [staffId]: {
              ...prev[staffId],
              messages: prev[staffId]?.messages.some(
                (msg) => msg.id === incomingMsg.id
              )
                ? prev[staffId].messages
                : [...(prev[staffId]?.messages || []), incomingMsg],
            },
          }));

          // Update staff chat history
          setStaffChatHistory((prev) => {
            const existingIndex = prev.findIndex(
              (chat) => chat.staffId === staffId
            );
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = {
                ...updated[existingIndex],
                lastMessage: incomingMsg.messageText || "New message",
                timestamp: new Date().toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }),
              };
              return updated;
            }
            return prev;
          });
        }
      }
    };

    // Add message listener
    connection.on("ReceiveMessage", messageListener);

    // Cleanup
    return () => {
      if (connection) {
        connection.off("ReceiveMessage", messageListener);
      }
    };
  }, [connection, isConnected, activeMode, selectedStaff, currentUserId]);

  const handleStaffTypeSelection = (staffType) => {
    setSelectedStaffType(staffType);
    setShowStaffTypePrompt(false);

    const availableStaff = staffMembers.filter(
      (staff) => staff.staffType === staffType
    );

    if (availableStaff.length === 0) {
      alert(`No ${staffType} staff members are currently available.`);
      return;
    }

    // Random selection
    const randomIndex = Math.floor(Math.random() * availableStaff.length);
    const randomStaff = availableStaff[randomIndex];

    setSelectedStaff(randomStaff);
    setRandomStaffSelected(true);

    // Check if we already have a thread with this staff member
    const existingThread = chatThreads[randomStaff.id];
    if (existingThread) {
      setStaffMessages(existingThread.messages);
    } else {
      // Set up new chat thread data
      setChatThreads((prevThreads) => ({
        ...prevThreads,
        [randomStaff.id]: {
          thread: null,
          messages: [],
          staff: randomStaff,
        },
      }));
      setStaffMessages([]);
      scrollToBottom();
    }
  };

  const handleStaffMessageSend = async () => {
    if (!chatThreads[selectedStaff?.id]?.thread) {
      await handleStartStaffChat();
      // Wait a bit for thread creation, then send
      setTimeout(() => handleSendStaffMessage(), 500);
    } else {
      await handleSendStaffMessage();
    }
  };

  // Chat history management
  const handleNewChat = () => {
    if (activeMode === "ai") {
      handleNewAiChat();
    } else {
      // Existing staff chat logic
      setSelectedStaff(null);
      setStaffMessages([]);
      setSelectedChatId(null);
      setChatThreads({});
      setShowStaffTypePrompt(true);
    }
  };

  const handleSelectChat = (chat) => {
    if (activeMode === "ai") {
      handleSelectAiChat(chat);
    } else {
      // Existing staff chat selection logic
      setSelectedChatId(chat.id);
      if (chat.staffId && staffMembers.length > 0) {
        const staff = staffMembers.find((s) => s.id === chat.staffId);
        if (staff) {
          setSelectedStaff(staff);
          setStaffMessages(chat.messages || []);
        }
      }
      scrollToBottom();
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (activeMode === "ai") {
      handleDeleteAiChat(chatId);
    } else {
      // Staff chat deletion with API call
      try {
        const token = localStorage.getItem("token");

        // Find the chat to delete
        const chatToDelete = staffChatHistory.find(
          (chat) => chat.id === chatId
        );
        if (!chatToDelete) return;

        // Call the soft delete API
        await softDeleteChatThread(chatId, token);

        // Remove from local state
        const updatedHistory = staffChatHistory.filter(
          (chat) => chat.id !== chatId
        );
        setStaffChatHistory(updatedHistory);

        // Remove from chatThreads
        if (chatToDelete.staffId) {
          setChatThreads((prev) => {
            const updated = { ...prev };
            delete updated[chatToDelete.staffId];
            return updated;
          });
        }

        // Clear current chat if it's the one being deleted
        if (selectedStaff?.id === chatToDelete.staffId) {
          setSelectedStaff(null);
          setStaffMessages([]);
          setSelectedChatId(null);
        }

        // Optional: Show success message
        console.log(`Successfully deleted chat thread: ${chatId}`);
      } catch (error) {
        console.error("Failed to delete staff chat:", error);
        alert("Failed to delete conversation. Please try again.");
      }
    }
  };

  // Get current messages based on active mode
  const getCurrentMessages = () => {
    return activeMode === "ai" ? aiMessages : staffMessages;
  };

  // Pagination logic
  const currentChatHistory =
    activeMode === "ai" ? chatHistory : staffChatHistory;
  const totalPages = Math.ceil(currentChatHistory.length / chatsPerPage);
  const startIndex = (currentPage - 1) * chatsPerPage;
  const endIndex = startIndex + chatsPerPage;

  const currentChats = activeMode === "ai" ? aiChatSessions : chatHistory;

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <MainLayout>
      <ConnectionStatusIndicator />
      <div className="advice-page">
        {/* Overlay for modals */}
        <AnimatePresence>
          {(showLoginPrompt || showStaffTypePrompt) && (
            <div className="advice-overlay" />
          )}
        </AnimatePresence>

        {/* Staff Type Selection Modal */}
        <AnimatePresence>
          {showStaffTypePrompt && (
            <motion.div
              className="advice-staff-type-popup"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              ref={staffPromptRef}
            >
              <h3 className="advice-staff-type-title">Choose Staff Type</h3>
              <p className="advice-staff-type-message">
                Who would you like to consult with today?
              </p>
              <div className="advice-staff-type-buttons">
                <button
                  className="advice-staff-type-button"
                  onClick={() => handleStaffTypeSelection("health")}
                >
                  <FaHeart /> Health Staff
                </button>
                <button
                  className="advice-staff-type-button"
                  onClick={() => handleStaffTypeSelection("nutrition")}
                >
                  <FaLeaf /> Nutrition Staff
                </button>
              </div>
              <button
                className="advice-staff-type-cancel"
                onClick={() => setShowStaffTypePrompt(false)}
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Prompt Modal */}
        <AnimatePresence>
          {showLoginPrompt && (
            <motion.div
              className="advice-login-popup"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <p>
                Please{" "}
                <Link to="/signin" className="advice-link">
                  log in
                </Link>{" "}
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
        </AnimatePresence>

        <div className="advice-content-wrapper">
          {/* Sidebar - Chat History */}
          <div className="advice-history-sidebar">
            <h3 className="advice-history-title">
              {activeMode === "ai" ? "AI Chat History" : "Staff Conversations"}
            </h3>

            <button className="advice-new-chat-button" onClick={handleNewChat}>
              {activeMode === "ai" ? "New AI Chat" : "New Staff Chat"}
            </button>

            <div className="advice-history-container">
              {(activeMode === "ai" ? aiChatSessions : staffChatHistory)
                .length === 0 ? (
                <div className="advice-empty-message">No history yet.</div>
              ) : (
                (activeMode === "ai" ? aiChatSessions : staffChatHistory).map(
                  (chat) => (
                    <div
                      key={chat.id}
                      className={`advice-history-item ${
                        activeMode === "ai"
                          ? selectedAiChatId === chat.id
                            ? "selected"
                            : ""
                          : selectedStaff?.id === chat.staffId
                          ? "selected"
                          : ""
                      }`}
                    >
                      <div
                        className="advice-history-content"
                        onClick={() => {
                          if (activeMode === "ai") {
                            handleSelectAiChat(chat);
                          } else {
                            // Handle staff chat selection with message loading
                            const staff = staffMembers.find(
                              (s) => s.id === chat.staffId
                            );
                            if (staff) {
                              setSelectedStaff(staff);

                              // Load the messages for this staff
                              if (chatThreads[chat.staffId]) {
                                setStaffMessages(
                                  chatThreads[chat.staffId].messages || []
                                );
                              } else {
                                setStaffMessages([]);
                              }

                              // Optional: Update any other needed state
                              setSelectedChatId(chat.id);

                              // Scroll to bottom after state updates
                              setTimeout(() => scrollToBottom(), 100);
                            }
                          }
                        }}
                      >
                        <div className="advice-history-sender">
                          {activeMode === "ai"
                            ? "AI Assistant"
                            : `${chat.staffName} - ${
                                chat.staffType === "health"
                                  ? "Health Expert"
                                  : "Nutrition Specialist"
                              }`}
                        </div>
                        <div className="advice-history-text">
                          {chat.lastMessage || "New conversation"}
                        </div>
                        <div className="advice-history-timestamp">
                          {chat.timestamp}
                        </div>
                      </div>
                      <button
                        className="advice-delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeMode === "ai") {
                            handleDeleteAiChat(chat.id);
                          } else {
                            const confirmDelete = window.confirm(
                              "Are you sure you want to delete this conversation?"
                            );
                            if (confirmDelete) {
                              handleDeleteChat(chat.id);
                            }
                          }
                        }}
                        title="Delete chat"
                      >
                        <FaTrash className="advice-delete-icon" />
                      </button>
                    </div>
                  )
                )
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="advice-pagination">
                <button
                  className="advice-pagination-button"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft className="advice-pagination-icon" />
                  Prev
                </button>

                <div className="advice-pagination-info">
                  {currentPage} / {totalPages}
                </div>

                <button
                  className="advice-pagination-button"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <FaChevronRight className="advice-pagination-icon" />
                </button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="advice-main-content">
            {/* Header */}
            <div className="advice-header">
              <h1 className="advice-title">
                <div className="advice-avatar"></div>
                Get Expert Advice
              </h1>
              <p className="advice-description">
                {activeMode === "ai"
                  ? "Chat with our AI for instant pregnancy-related advice."
                  : // : `Get personalized guidance from our ${
                    //     selectedStaffType === "nutrition" ? "nutrition" : "health"
                    //   } staff.`}
                    `Get personalized guidance from our specialists`}
              </p>
            </div>

            {/* Mode Navigation */}
            <div className="advice-mode-nav">
              <button
                className={`advice-mode-button ${
                  activeMode === "ai" ? "active" : ""
                }`}
                onClick={() => setActiveMode("ai")}
              >
                AI Chat
              </button>
              <button
                className={`advice-mode-button ${
                  activeMode === "staff" ? "active" : ""
                }`}
                onClick={handleStaffModeActivation}
              >
                Staff Advice
              </button>
            </div>

            {/* AI Chat Container */}
            {activeMode === "ai" && (
              <div className="advice-chat-container" ref={chatContainerRef}>
                {aiMessages.length === 0 ? (
                  <div className="advice-empty-message">
                    <h3>Welcome to AI Health Assistant</h3>
                    <p>
                      I'm here to provide evidence-based guidance on pregnancy,
                      nutrition, and health. Ask me anything!
                    </p>
                  </div>
                ) : (
                  <>
                    {aiMessages.map((msg, index) => (
                      <div
                        key={msg.id || index}
                        className={`advice-message ${
                          msg.sender === "user" ? "message-user" : "message-ai"
                        }`}
                      >
                        {/*
                        {msg.sender !== "user" && (
                          <div className="advice-avatar">
                             {/* <FaRobot style={{ color: "#0084ff" }} /> 
                          </div>
                        )}
                        */}
                        <div
                          className={`advice-message-content ${
                            msg.sender === "user"
                              ? "bg-user"
                              : msg.isError
                              ? "bg-error"
                              : "bg-ai"
                          }`}
                        >
                          {msg.text}
                          {msg.isError && msg.canRetry && (
                            <button
                              className="advice-retry-button"
                              onClick={() =>
                                retryAiMessage(msg.originalMessage)
                              }
                              style={{
                                marginTop: "0.5rem",
                                padding: "0.25rem 0.5rem",
                                background: "#ff4757",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "0.8rem",
                                cursor: "pointer",
                              }}
                            >
                              Retry
                            </button>
                          )}
                          <span className="advice-message-timestamp">
                            {msg.time}
                            {msg.sender === "ai" && !msg.isError && (
                              <span
                                style={{
                                  marginLeft: "0.5rem",
                                  fontSize: "0.7rem",
                                  opacity: 0.7,
                                }}
                              >
                                AI Assistant
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* AI Typing Indicator */}
                    {isAiLoading && (
                      <div className="advice-message message-ai">
                        <div className="advice-message-content bg-ai">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <div
                              style={{
                                width: "20px",
                                height: "20px",
                                border: "2px solid #e0e0e0",
                                borderTop: "2px solid #0084ff",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                              }}
                            />
                            AI is thinking...
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            )}

            {/* Staff Chat Container */}
            {activeMode === "staff" && (
              <div className="advice-chat-container" ref={chatContainerRef}>
                {/* Staff Info Display */}
                {selectedStaff && (
                  <div
                    style={{
                      padding: "1rem",
                      backgroundColor: "#f0f8ff",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        backgroundColor: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "grey",
                      }}
                    >
                      <FaUser />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 0.25rem 0" }}>
                        {selectedStaff.userName}
                      </h4>
                      <p
                        style={{
                          margin: "0",
                          color: "#666",
                          fontSize: "0.9rem",
                        }}
                      >
                        {selectedStaff.specialization}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowStaffTypePrompt(true)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 1rem",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        background: "white",
                        cursor: "pointer",
                        color: "black",
                        width: "200px",
                      }}
                    >
                      <FaRandom /> Change Staff
                    </button>
                  </div>
                )}

                {staffMessages.length === 0 ? (
                  <div className="advice-empty-message">
                    {selectedStaff ? (
                      chatThreads[selectedStaff.id]?.thread ? (
                        <>
                          <h3>Chat with {selectedStaff.userName}</h3>
                          <p>Send a message to begin your consultation.</p>
                        </>
                      ) : (
                        <div style={{ textAlign: "center" }}>
                          <h3>Ready to Start?</h3>
                          <p>
                            Click the button below to begin your consultation
                            with {selectedStaff.userName}.
                          </p>
                          <button
                            onClick={handleStartStaffChat}
                            disabled={startingChat}
                            className="advice-mode-button active"
                            style={{ marginTop: "1rem" }}
                          >
                            {startingChat
                              ? "Starting..."
                              : "Start Consultation"}
                          </button>
                        </div>
                      )
                    ) : (
                      <div style={{ textAlign: "center" }}>
                        <FaRandom
                          style={{
                            fontSize: "3rem",
                            color: "#ccc",
                            marginBottom: "1rem",
                          }}
                        />
                        <h3>Get Random Staff Advice</h3>
                        <p>
                          Click the button below to be randomly connected with
                          available staff members.
                        </p>
                        <button
                          onClick={() => setShowStaffTypePrompt(true)}
                          className="advice-mode-button active"
                          style={{ marginTop: "1rem" }}
                        >
                          <FaRandom style={{ marginRight: "0.5rem" }} />
                          Get Random Staff Advice
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {staffMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`advice-message ${
                          msg.isUser ? "message-user" : "message-staff"
                        }`}
                      >
                        {!msg.isUser && (
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              // backgroundColor: "#0084ff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "grey",
                              marginRight: "0.5rem",
                              flexShrink: 0,
                            }}
                          >
                            <FaUser />
                          </div>
                        )}
                        <div
                          className={`advice-message-content ${
                            msg.isUser ? "bg-user" : "bg-staff"
                          }`}
                        >
                          {msg.text}
                          {msg.attachment && (
                            <div style={{ marginTop: "0.5rem" }}>
                              {msg.attachment.isImage ? (
                                <img
                                  src={msg.attachment.url}
                                  alt="Attachment"
                                  style={{
                                    maxWidth: "200px",
                                    maxHeight: "150px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    window.open(msg.attachment.url, "_blank")
                                  }
                                />
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.5rem",
                                    background: "rgba(0,0,0,0.1)",
                                    borderRadius: "4px",
                                  }}
                                >
                                  <FaFileAlt />
                                  <span>{msg.attachment.fileName}</span>
                                  <button
                                    onClick={() =>
                                      window.open(msg.attachment.url, "_blank")
                                    }
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      color: "inherit",
                                    }}
                                  >
                                    <FaFile />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          <span className="advice-message-timestamp">
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            )}

            {/* Input Form */}
            <div className="advice-input-form">
              {/* File Preview (for staff mode) */}
              {activeMode === "staff" && selectedFile && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "100%",
                    left: "0",
                    right: "0",
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px 8px 0 0",
                    padding: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  ) : (
                    <FaFileAlt style={{ fontSize: "2rem", color: "#666" }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div>{selectedFile.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>
                      {formatBytes(selectedFile.size)}
                    </div>
                  </div>
                  <button
                    onClick={clearSelectedFile}
                    style={{
                      background: "#ff4757",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      cursor: "pointer",
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}

              {/* File input (hidden) */}
              {activeMode === "staff" && (
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept={allSupportedTypes.join(",")}
                  style={{ display: "none" }}
                />
              )}

              <input
                ref={inputRef}
                type="text"
                className="advice-input"
                value={newMessage}
                onChange={(e) => {
                  if (activeMode === "ai") {
                    setNewMessage(e.target.value); // Use newMessage for both modes
                  } else {
                    setNewMessage(e.target.value);
                  }
                }}
                placeholder={
                  activeMode === "ai"
                    ? isAiLoading
                      ? "AI is responding..."
                      : "Ask about pregnancy, nutrition, health..."
                    : selectedStaff && chatThreads[selectedStaff.id]?.thread
                    ? "Type your message..."
                    : "Please start consultation first..."
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault(); // Prevent default Enter behavior
                    if (activeMode === "ai") {
                      handleSendAiMessage(); // Don't pass the event
                    } else if (
                      selectedStaff &&
                      chatThreads[selectedStaff.id]?.thread
                    ) {
                      handleSendStaffMessage();
                    }
                  }
                }}
                disabled={
                  (activeMode === "ai" && isLoading) ||
                  (activeMode === "staff" &&
                    (sendingMessage ||
                      !selectedStaff ||
                      !chatThreads[selectedStaff.id]?.thread))
                }
              />

              <button
                className="advice-send-button"
                onClick={() =>
                  activeMode === "ai"
                    ? handleSendAiMessage()
                    : handleSendStaffMessage()
                }
                disabled={
                  activeMode === "ai"
                    ? !newMessage.trim() || isLoading || isAiLoading
                    : (!newMessage.trim() && !selectedFile) ||
                      sendingMessage ||
                      !selectedStaff ||
                      !chatThreads[selectedStaff.id]?.thread
                }
              >
                {(activeMode === "ai" && (isLoading || isAiLoading)) ||
                (activeMode === "staff" && sendingMessage) ? (
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      border: "2px solid #ffffff",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <HiPaperAirplane className="advice-send-icon" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="advice-footer-note">
          <p>
            {activeMode === "ai"
              ? "Need a human touch? Try our "
              : "Want instant answers? Check out our "}
            <Link to="/consultation-chat" className="advice-link">
              Consultant Chat
            </Link>{" "}
            page.
          </p>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </MainLayout>
  );
};

export default AdvicePage;
