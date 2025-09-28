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
} from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import { HiPaperAirplane } from "react-icons/hi2";

const AdvicePage = () => {
  // Separate message states for AI and Staff
  const [aiMessages, setAiMessages] = useState([]);
  const [staffMessages, setStaffMessages] = useState([]);

  // Original AdvicePage states
  const [input, setInput] = useState("");
  const [activeMode, setActiveMode] = useState("ai");
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

  // Staff chat functionality states
  const [currentUserId, setCurrentUserId] = useState("");
  const [staffMembers, setStaffMembers] = useState([]);
  const [chatThreads, setChatThreads] = useState({});
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [randomStaffSelected, setRandomStaffSelected] = useState(false);
  const [staffChatHistory, setStaffChatHistory] = useState([]);

  const chatContainerRef = useRef(null);
  const staffPromptRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // SignalR connection for staff chat
  const {
    connection,
    addMessage,
    connectionStatus,
    isReconnecting,
    isConnected,
  } = useMessages();

  // File handling utilities
  const supportedImageTypes = [".jpg", ".jpeg", ".png"];
  const supportedDocTypes = [".docx", ".xls", ".xlsx", ".pdf"];
  const allSupportedTypes = [...supportedImageTypes, ...supportedDocTypes];

  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const extension = "." + fileName.toLowerCase().split(".").pop();
    return supportedImageTypes.includes(extension);
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

  useEffect(() => {
    checkAuthAndInitialize();
  }, []);

  useEffect(() => {
    if (activeMode === "staff" && isLoggedIn && currentUserId) {
      loadAllStaff();
      loadExistingStaffThreads();
    }
  }, [activeMode, isLoggedIn, currentUserId]);

  const checkAuthAndInitialize = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const userRes = await getCurrentUser(token);
      const userId =
        userRes?.data?.data?.id || userRes?.data?.id || userRes?.id || "";

      if (userId) {
        setCurrentUserId(userId);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsLoggedIn(false);
    }
  };

  const loadAllStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const usersResponse = await getAllUsers(token);
      const allUsers = usersResponse?.data || usersResponse || [];

      // Filter for staff members (roleId 3 = health, roleId 4 = nutrition)
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

  const loadExistingStaffThreads = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const threadsResponse = await getChatThreadByUserId(currentUserId, token);
      let threads = [];

      if (Array.isArray(threadsResponse)) {
        threads = threadsResponse;
      } else if (threadsResponse?.data && Array.isArray(threadsResponse.data)) {
        threads = threadsResponse.data;
      }

      if (threads.length > 0) {
        const threadsMap = {};
        const history = [];

        for (const thread of threads) {
          const staffId = thread.consultantId;
          if (!staffId) continue;

          try {
            const staffMember = staffMembers.find(
              (staff) => staff.id === staffId
            );

            const processedMessages =
              thread.messages?.map((msg) => ({
                ...msg,
                text: msg.messageText || msg.message || msg.text,
                time: msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }),
                isUser: msg.senderId === currentUserId,
                attachment:
                  msg.attachmentUrl || msg.attachmentPath
                    ? {
                        fileName:
                          msg.attachmentFileName ||
                          msg.fileName ||
                          "Attachment",
                        fileSize: msg.attachmentFileSize || msg.fileSize,
                        fileType: msg.attachmentFileType || msg.fileType,
                        isImage: isImageFile(
                          msg.attachmentFileName || msg.fileName
                        ),
                        url: msg.attachmentUrl || msg.attachmentPath,
                      }
                    : null,
              })) || [];

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

            // Add to chat history for sidebar
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
            console.error(
              `Failed to process thread for staff ${staffId}:`,
              err
            );
          }
        }

        setChatThreads(threadsMap);
        setStaffChatHistory(history);
      }
    } catch (error) {
      console.error("Failed to load existing threads:", error);
    }
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
    }
  };

  const handleStartStaffChat = async () => {
    if (!selectedStaff) return;

    const staffId = selectedStaff.id;
    if (chatThreads[staffId]?.thread) {
      return;
    }

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

      setChatThreads((prevThreads) => ({
        ...prevThreads,
        [staffId]: {
          thread: threadWithMessages?.data || {
            id: threadId,
            consultantId: staffId,
            userId: currentUserId,
          },
          messages: [],
          staff: selectedStaff,
        },
      }));
    } catch (error) {
      console.error("Failed to start chat thread:", error);
    } finally {
      setStartingChat(false);
    }
  };

  const handleSendStaffMessage = async () => {
    if (!connection || !isConnected) {
      console.error("SignalR connection not established");
      return;
    }

    const staffId = selectedStaff?.id;
    const activeThread =
      staffId && chatThreads[staffId] ? chatThreads[staffId].thread : null;

    if (
      (!newMessage.trim() && !selectedFile) ||
      !activeThread ||
      sendingMessage
    )
      return;

    const userMessage = {
      text: newMessage.trim(),
      isUser: true,
      time: new Date().toLocaleTimeString(),
      id: Date.now(),
    };

    // Add message to staff messages immediately
    const updatedMessages = [...staffMessages, userMessage];
    setStaffMessages(updatedMessages);

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

      const response = await sendMessage(formData, token);

      if (response.error === 0) {
        // Update thread messages
        setChatThreads((prevThreads) => ({
          ...prevThreads,
          [staffId]: {
            ...prevThreads[staffId],
            messages: updatedMessages,
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
              lastMessage: userMessage.text,
              timestamp: userMessage.time,
              messages: updatedMessages,
            };
            return updated;
          } else {
            return [
              {
                id: activeThread.id,
                staffId: staffId,
                staffName: selectedStaff.userName,
                staffType: selectedStaff.staffType,
                lastMessage: userMessage.text,
                timestamp: userMessage.time,
                messages: updatedMessages,
              },
              ...prev,
            ];
          }
        });

        setNewMessage("");
        clearSelectedFile();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  // File handling
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

  // Chat history management
  const handleNewChat = () => {
    if (activeMode === "ai") {
      setAiMessages([]);
      setSelectedChatId(null);
    } else if (activeMode === "staff") {
      setStaffMessages([]);
      setSelectedStaff(null);
      setRandomStaffSelected(false);
      setSelectedStaffType(null);
    }
  };

  const handleSelectChat = (chat) => {
    if (activeMode === "ai") {
      setAiMessages(chat.messages);
      setSelectedChatId(chat.id);
    } else if (activeMode === "staff") {
      const staff = staffMembers.find((s) => s.id === chat.staffId);
      if (staff) {
        setSelectedStaff(staff);
        setSelectedStaffType(staff.staffType);
        setRandomStaffSelected(true);
        setStaffMessages(chat.messages);
      }
    }
  };

  const handleDeleteChat = (chatId) => {
    if (activeMode === "ai") {
      setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
      if (selectedChatId === chatId) {
        setAiMessages([]);
        setSelectedChatId(null);
      }
    } else if (activeMode === "staff") {
      setStaffChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
      const chatToDelete = staffChatHistory.find((chat) => chat.id === chatId);
      if (chatToDelete && selectedStaff?.id === chatToDelete.staffId) {
        setStaffMessages([]);
        setSelectedStaff(null);
        setRandomStaffSelected(false);
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
  const currentChats = currentChatHistory.slice(startIndex, endIndex);

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
              {currentChats.length === 0 ? (
                <div className="advice-empty-message">No history yet.</div>
              ) : (
                currentChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`advice-history-item ${
                      (activeMode === "ai" && selectedChatId === chat.id) ||
                      (activeMode === "staff" &&
                        selectedStaff?.id === chat.staffId)
                        ? "selected"
                        : ""
                    }`}
                  >
                    <div
                      className="advice-history-content"
                      onClick={() => handleSelectChat(chat)}
                    >
                      <div className="advice-history-sender">
                        {activeMode === "ai"
                          ? "AI Assistant"
                          : `${chat.staffName} (${
                              chat.staffType === "health"
                                ? "Health Expert"
                                : "Nutrition Specialist"
                            })`}
                      </div>
                      <div className="advice-history-text">
                        {chat.lastMessage ||
                          chat.messages?.[0]?.text ||
                          "New conversation"}
                      </div>
                      <div className="advice-history-timestamp">
                        {chat.timestamp}
                      </div>
                    </div>
                    <button
                      className="advice-delete-button"
                      onClick={() => handleDeleteChat(chat.id)}
                      title="Delete chat"
                    >
                      <FaTrash className="advice-delete-icon" />
                    </button>
                  </div>
                ))
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
                  : `Get personalized guidance from our ${
                      selectedStaffType === "nutrition" ? "nutrition" : "health"
                    } staff.`}
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
                    <h3>Welcome to AI Pregnancy Advice</h3>
                    <p>Start chatting by typing your question below!</p>
                  </div>
                ) : (
                  <>
                    {aiMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`advice-message ${
                          msg.isUser ? "message-user" : "message-ai"
                        }`}
                      >
                        {!msg.isUser && <div className="advice-avatar"></div>}
                        <div
                          className={`advice-message-content ${
                            msg.isUser ? "bg-user" : "bg-ai"
                          }`}
                        >
                          {msg.text}
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
                        backgroundColor: "#0084ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
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
                              backgroundColor: "#0084ff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
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
                value={activeMode === "ai" ? input : newMessage}
                onChange={(e) => {
                  if (activeMode === "ai") {
                    setInput(e.target.value);
                  } else {
                    setNewMessage(e.target.value);
                  }
                }}
                placeholder={
                  activeMode === "ai"
                    ? "Ask me anything about pregnancy..."
                    : selectedStaff && chatThreads[selectedStaff.id]?.thread
                    ? "Type your message..."
                    : "Please start consultation first..."
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    if (activeMode === "ai") {
                      handleAISubmit();
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
                onClick={
                  activeMode === "ai" ? handleAISubmit : handleSendStaffMessage
                }
                disabled={
                  (activeMode === "ai" && (!input.trim() || isLoading)) ||
                  (activeMode === "staff" &&
                    ((!newMessage.trim() && !selectedFile) ||
                      sendingMessage ||
                      !selectedStaff ||
                      !chatThreads[selectedStaff.id]?.thread))
                }
              >
                {(activeMode === "ai" && isLoading) ||
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
