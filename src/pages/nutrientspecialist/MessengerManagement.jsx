import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as signalR from "@microsoft/signalr";
import { getCurrentUser, logout } from "../../apis/authentication-api";
import {
  startChatThread,
  sendMessage,
  getChatThreadByUserId,
  getChatThreadById,
} from "../../apis/message-api";
import { getUserById } from "../../apis/user-api";
import { useMessages } from "../../utils/useMessages";
import "../../styles/MessengerManagement.css";
import {
  FaComments,
  FaSearch,
  FaUser,
  FaPhone,
  FaVideo,
  FaFile,
  FaPaperclip,
  FaTimes,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import { HiPaperAirplane } from "react-icons/hi2";

const LoaderIcon = () => (
  <svg
    className="icon loader"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 12a8 8 0 1116 0 8 8 0 01-16 0zm8-8v2m0 12v2m8-8h-2m-12 0H4m15.364 4.364l-1.414-1.414M6.05 6.05l1.414 1.414"
    />
  </svg>
);

const Notification = ({ message, type }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      document.dispatchEvent(new CustomEvent("closeNotification"));
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <motion.div
      className={`notification ${type}`}
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="notification-content">
        <h4>{type === "success" ? "Success" : "Error"}</h4>
        <p>{message}</p>
      </div>
    </motion.div>
  );
};

const MessengerManagement = () => {
  // Original states
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentSidebarPage, setCurrentSidebarPage] = useState(2);
  const [isFoodDropdownOpen, setIsFoodDropdownOpen] = useState(false);
  const [isNutrientDropdownOpen, setIsNutrientDropdownOpen] = useState(false);

  // Use same pattern as AdvicePage/ConsultationManagement
  const messagesEndRef = useRef(null);
  const {
    connection,
    messages,
    addMessage,
    connectionStatus,
    isReconnecting,
    isConnected,
  } = useMessages();

  // Add processedMessageIds pattern (same as AdvicePage)
  const processedMessageIds = useRef(new Set());

  // New consultation states (adapted from ConsultationManagement)
  const [currentStaffId, setCurrentStaffId] = useState(null);
  const [currentStaffData, setCurrentStaffData] = useState(null);
  const [chatThreads, setChatThreads] = useState({});
  const [selectedThread, setSelectedThread] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // File handling utilities (same as original)
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    return n.toFixed(n >= 10 || i === 0 ? 0 : 1) + " " + units[i];
  };

  const supportedImageTypes = [".jpg", ".jpeg", ".png"];
  const supportedDocTypes = [".docx", ".xls", ".xlsx", ".pdf"];
  const allSupportedTypes = [...supportedImageTypes, ...supportedDocTypes];

  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const extension = "." + fileName.toLowerCase().split(".").pop();
    return supportedImageTypes.includes(extension);
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        const messagesContainer = messagesEndRef.current.closest(
          ".messenger-management-messages"
        );
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } else {
          messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          });
        }
      }
    });
  };

  // Initialize staff user (same as original)
  useEffect(() => {
    const fetchUser = () => {
      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }
      getCurrentUser(token)
        .then((response) => {
          const userData = response.data?.data || response.data;
          if (userData && Number(userData.roleId) === 4) {
            setUser(userData);
            setCurrentStaffId(userData.id);
            setCurrentStaffData(userData);
            loadStaffThreads(userData.id);
          } else {
            localStorage.removeItem("token");
            setUser(null);
            navigate("/signin", { replace: true });
          }
        })
        .catch((error) => {
          console.error("Error fetching user:", error.message);
          localStorage.removeItem("token");
          setUser(null);
          navigate("/signin", { replace: true });
        })
        .finally(() => {
          setLoading(false);
        });
    };
    fetchUser();
  }, [navigate, token]);

  // Load staff threads (same as original but with UTC timestamp fix)
  const loadStaffThreads = async (staffUserId) => {
    try {
      const threadsResponse = await getChatThreadByUserId(staffUserId, token);

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

        for (const thread of threads) {
          let patientUserId = null;

          if (thread.userId && thread.consultantId) {
            if (thread.consultantId === staffUserId) {
              patientUserId = thread.userId;
            } else if (thread.userId === staffUserId) {
              patientUserId = thread.consultantId;
            }
          } else if (thread.userId && thread.userId !== staffUserId) {
            patientUserId = thread.userId;
          }

          if (!patientUserId) continue;

          try {
            const patientRes = await getUserById(patientUserId, token);
            const patientData = patientRes?.data || patientRes || null;

            const processedMessages =
              thread.messages?.map((msg) => {
                // Fix UTC timestamp by adding Z if missing (same as AdvicePage)
                let createdAt =
                  msg.createdAt || msg.sentAt || new Date().toISOString();
                if (typeof createdAt === "string" && !createdAt.includes("Z")) {
                  createdAt = createdAt + "Z";
                }

                const processedMsg = {
                  ...msg,
                  createdAt: createdAt,
                  messageText: msg.messageText || msg.message || msg.text || "",
                };

                // Handle attachments (same as original)
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

                // Handle media array (same as AdvicePage)
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

            const unreadCount = processedMessages.filter(
              (msg) => !msg.isRead && msg.senderId === patientUserId
            ).length;

            threadsMap[patientUserId] = {
              thread,
              messages: processedMessages,
              patient: patientData,
              lastActivity: thread.updatedAt || thread.createdAt,
              unreadCount: unreadCount,
            };
          } catch (err) {
            console.error(`Failed to fetch patient ${patientUserId}:`, err);
          }
        }

        setChatThreads(threadsMap);
      }
    } catch (error) {
      console.error("Failed to load staff threads:", error);
    }
  };

  // Real-time message handling - DEBUG VERSION
  useEffect(() => {
    // console.log("=== MESSAGE EFFECT TRIGGERED ===");
    // console.log("messages.length:", messages.length);
    // console.log("currentStaffId:", currentStaffId);
    // console.log(
    //   "selectedThread?.patientUserId:",
    //   selectedThread?.patientUserId
    // );

    if (messages.length === 0) {
      console.log("No messages, returning early");
      return;
    }

    const latest = messages[messages.length - 1];
    console.log("=== PROCESSING NEW MESSAGE ===");
    // console.log("Latest message:", JSON.stringify(latest, null, 2));

    // Early duplicate check
    if (!latest.id || processedMessageIds.current.has(latest.id)) {
      console.log("Message already processed, skipping:", latest.id);
      return;
    }

    // Mark message as processed immediately
    processedMessageIds.current.add(latest.id);
    console.log("Message marked as processed:", latest.id);

    const senderId = latest.senderId;
    console.log("=== MESSAGE ROUTING BASED ON CHAT THREADS ===");
    console.log("senderId:", senderId);
    console.log("currentStaffId:", currentStaffId);

    // Check if the sender is a patient we have a conversation with
    // OR if the sender is the current staff (but we probably don't want to process our own messages in real-time)
    setChatThreads((prev) => {
      console.log("=== CHECKING CHAT THREADS ===");
      console.log("Available threads:", Object.keys(prev));

      // Find if this message is from a patient we have a thread with
      const patientUserId = Object.keys(prev).find((userId) => {
        const thread = prev[userId];
        // Check if message sender is the patient (userId) and current staff is the consultant
        return (
          senderId === userId && thread.thread.consultantId === currentStaffId
        );
      });

      if (!patientUserId) {
        // console.log("Message not from any patient in our threads");
        // console.log("Sender ID:", senderId);
        // console.log("Expected patients:", Object.keys(prev));
        return prev;
      }

      // console.log("Message from patient:", patientUserId);

      const existingMessages = prev[patientUserId]?.messages || [];
      console.log("Existing messages count:", existingMessages.length);

      // Secondary check at state level
      const messageExists = existingMessages.some((m) => m.id === latest.id);
      if (messageExists) {
        // console.log(
        //   "Message already exists in thread, skipping:",
        //   latest.id
        // );
        return prev;
      }

      // console.log(
      //   "Adding new message to thread for patient:",
      //   patientUserId
      // );

      // Process the message
      const processedMessage = {
        ...latest,
        messageText: latest.messageText || latest.message || latest.text,
        createdAt: (() => {
          // Fix UTC timestamp by adding Z if missing
          let timestamp = latest.createdAt || new Date().toISOString();
          if (typeof timestamp === "string" && !timestamp.includes("Z")) {
            timestamp = timestamp + "Z";
          }
          return timestamp;
        })(),
      };

      console.log(
        "Processed message:",
        JSON.stringify(processedMessage, null, 2)
      );

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
        console.log("Added attachment to message");
      }

      const updatedMessages = [...existingMessages, processedMessage];
      console.log("Updated messages count:", updatedMessages.length);

      // Update selected thread if this is the active conversation
      if (selectedThread && selectedThread.patientUserId === patientUserId) {
        console.log("Updating selected thread for active conversation");
        setTimeout(() => {
          setSelectedThread((prevSelected) => ({
            ...prevSelected,
            messages: updatedMessages,
          }));
          console.log("Selected thread updated");
          scrollToBottom();
          console.log("Scrolled to bottom");
        }, 100);
      }

      const updatedThreadData = {
        ...prev,
        [patientUserId]: {
          ...prev[patientUserId],
          messages: updatedMessages,
          unreadCount:
            selectedThread?.patientUserId === patientUserId
              ? 0
              : (prev[patientUserId]?.unreadCount || 0) + 1,
        },
      };

      console.log("=== THREAD UPDATE COMPLETE ===");
      console.log("Updated thread for patient:", patientUserId);
      return updatedThreadData;
    });
  }, [messages, selectedThread?.patientUserId, currentStaffId]);

  useEffect(() => {
    if (connection && selectedThread?.thread?.id && isConnected) {
      const threadId = selectedThread.thread.id;
      console.log("=== JOINING THREAD ===");
      console.log("Joining thread:", threadId);

      connection
        .invoke("JoinThread", threadId)
        .then(() => {
          console.log("Successfully joined thread:", threadId);
        })
        .catch((err) => {
          console.error("JoinThread failed:", err);
        });
    }
  }, [connection, selectedThread?.thread?.id, isConnected]);

  // Cleanup for processed message IDs (same as AdvicePage)
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (processedMessageIds.current.size > 1000) {
        console.log("Cleaning up processed message IDs");
        processedMessageIds.current.clear();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(cleanup);
  }, []);

  // Handle selecting a chat thread (same as original)
  const handleSelectThread = (patientUserId) => {
    const threadData = chatThreads[patientUserId];
    if (threadData) {
      setSelectedThread({
        ...threadData,
        patientUserId: patientUserId,
      });

      setChatThreads((prevThreads) => ({
        ...prevThreads,
        [patientUserId]: {
          ...prevThreads[patientUserId],
          unreadCount: 0,
          messages: prevThreads[patientUserId].messages.map((msg) => ({
            ...msg,
            isRead: msg.senderId === patientUserId ? true : msg.isRead,
          })),
        },
      }));
    }
  };

  // Send message (same as original but with UTC timestamp fix)
  const handleSendMessage = async () => {
    if (!connection || !isConnected) {
      console.error("SignalR connection not established");
      if (isReconnecting) {
        showNotification(
          "Reconnecting... Please try again in a moment.",
          "error"
        );
      } else {
        showNotification(
          "Connection lost. Please wait while we reconnect...",
          "error"
        );
      }
      return;
    }

    if (connection.state !== signalR.HubConnectionState.Connected) {
      console.error(
        "SignalR connection not ready. Current state:",
        connection.state
      );
      showNotification(
        "Connection not ready. Please wait a moment and try again.",
        "error"
      );
      return;
    }

    const patientUserId = selectedThread?.patientUserId;
    const activeThread = selectedThread?.thread;

    if (
      (!newMessage.trim() && !selectedFile) ||
      !activeThread ||
      sendingMessage
    ) {
      return;
    }

    try {
      setSendingMessage(true);
      const formData = new FormData();

      formData.append("ChatThreadId", activeThread.id);
      formData.append("SenderId", currentStaffId);

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
        const attachmentUrl =
          response.data?.attachmentUrl ||
          response.data?.attachmentPath ||
          response.data?.attachment?.url;

        const newMsg = {
          id: response.data?.id || Date.now().toString(),
          senderId: currentStaffId,
          receiverId: patientUserId,
          messageText: newMessage.trim(),
          createdAt: (() => {
            // Fix UTC timestamp by adding Z if missing
            let timestamp =
              response.data?.sentAt ||
              response.data?.createdAt ||
              new Date().toISOString();
            if (typeof timestamp === "string" && !timestamp.includes("Z")) {
              timestamp = timestamp + "Z";
            }
            return timestamp;
          })(),
          messageType: selectedFile ? "attachment" : "text",
          isRead: false,
          attachmentUrl: attachmentUrl,
          attachmentFileName: selectedFile?.name,
          attachmentFileType: selectedFile?.type,
          attachmentFileSize: selectedFile?.size,
          attachment: selectedFile
            ? {
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                fileType: selectedFile.type,
                isImage: isImageFile(selectedFile.name),
                url: attachmentUrl || filePreview,
              }
            : null,
        };

        // Update chat threads
        setChatThreads((prevThreads) => ({
          ...prevThreads,
          [patientUserId]: {
            ...prevThreads[patientUserId],
            messages: [...(prevThreads[patientUserId]?.messages || []), newMsg],
            lastActivity: newMsg.createdAt,
          },
        }));

        setSelectedThread((prev) => ({
          ...prev,
          messages: [...(prev?.messages || []), newMsg],
        }));

        setNewMessage("");
        clearSelectedFile();
        scrollToBottom();
        showNotification("Message sent successfully", "success");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showNotification("Failed to send message", "error");
    } finally {
      setSendingMessage(false);
    }
  };

  // Keep all your original file handling functions, sidebar functions, etc.
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

  const showNotification = (message, type) => {
    setNotification({ message, type });
    const closeListener = () => {
      setNotification(null);
      document.removeEventListener("closeNotification", closeListener);
    };
    document.addEventListener("closeNotification", closeListener);
  };

  // Keep all your original sidebar functions (toggleSidebar, handleLogout, etc.)
  // ... (I'll keep this collapsed to focus on the real-time messaging changes)

  // Helper functions
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "Just now";

    try {
      // Add Z to UTC timestamp if missing
      if (typeof timestamp === "string" && !timestamp.includes("Z")) {
        timestamp = timestamp + "Z";
      }

      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid";
      }

      const now = new Date();
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting message time:", error);
      return "Unknown";
    }
  };

  // Filter threads
  const filteredThreads = Object.entries(chatThreads).filter(
    ([userId, thread]) => {
      const searchMatch =
        !searchTerm ||
        thread.patient?.userName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        thread.patient?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch =
        filterStatus === "all" ||
        (filterStatus === "unread" && thread.unreadCount > 0) ||
        (filterStatus === "active" && thread.messages?.length > 0);

      return searchMatch && statusMatch;
    }
  );

  const totalUnreadCount = Object.values(chatThreads).reduce(
    (sum, thread) => sum + thread.unreadCount,
    0
  );

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    try {
      if (user?.userId) await logout(user.userId, token);
    } catch (error) {
      console.error("Error logging out:", error.message);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsSidebarOpen(true);
      navigate("/signin", { replace: true });
    }
  };

  useEffect(() => {
    if (!connection || !isConnected) return;

    const messageListener = (message) => {
      console.log("Staff received message:", message);

      // Find which user conversation this message belongs to
      const senderId = message.senderId;
      const receiverId = message.receiverId || currentStaffId;

      // Check if this message is for a conversation we have open
      Object.keys(chatThreads).forEach((patientUserId) => {
        const thread = chatThreads[patientUserId];

        // If message is from a user to this staff member
        if (senderId === patientUserId && receiverId === currentStaffId) {
          // Process the incoming message
          const incomingMsg = {
            id: message.id || Date.now(),
            senderId: message.senderId,
            receiverId: message.receiverId || currentStaffId,
            messageText: message.messageText || message.message || message.text,
            createdAt: message.createdAt || new Date().toISOString(),
            attachment: message.attachment || null,
          };

          // Update chat threads
          setChatThreads((prev) => ({
            ...prev,
            [patientUserId]: {
              ...prev[patientUserId],
              messages: prev[patientUserId]?.messages.some(
                (msg) => msg.id === incomingMsg.id
              )
                ? prev[patientUserId].messages
                : [...(prev[patientUserId]?.messages || []), incomingMsg],
              unreadCount:
                selectedThread?.patientUserId === patientUserId
                  ? 0
                  : (prev[patientUserId]?.unreadCount || 0) + 1,
            },
          }));

          // Update selected thread if this is the active conversation
          if (
            selectedThread &&
            selectedThread.patientUserId === patientUserId
          ) {
            setSelectedThread((prev) => ({
              ...prev,
              messages: prev.messages.some((msg) => msg.id === incomingMsg.id)
                ? prev.messages
                : [...prev.messages, incomingMsg],
            }));
          }

          // Auto-scroll to bottom if this conversation is active
          if (selectedThread?.patientUserId === patientUserId) {
            setTimeout(() => scrollToBottom(), 100);
          }
        }
      });
    };

    // Add message listener
    connection.on("ReceiveMessage", messageListener);

    // Cleanup
    return () => {
      if (connection) {
        connection.off("ReceiveMessage", messageListener);
      }
    };
  }, [connection, isConnected, chatThreads, selectedThread, currentStaffId]);

  const ConnectionStatusIndicator = () => {
    if (isConnected && !isReconnecting) {
      return null; // Don't show anything when connected
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
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          background: getStatusColor(),
          color: "white",
          padding: "8px 16px",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: "500",
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        {getStatusMessage()}
      </div>
    );
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedThread?.messages]);

  // Animation variants (keep original)
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
  };

  const logoVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.8,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
      },
    },
    hover: {
      scale: 1.1,
      filter: "brightness(1.15)",
      transition: { duration: 0.3 },
    },
  };

  const sidebarVariants = {
    open: {
      width: "280px",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    closed: {
      width: "60px",
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const navItemVariants = {
    initial: { opacity: 0, x: -20, backgroundColor: "rgba(0, 0, 0, 0)" },
    animate: {
      opacity: 1,
      x: 0,
      backgroundColor: "rgba(0, 0, 0, 0)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    hover: {
      backgroundColor: "#4caf50",
      transform: "translateY(-2px)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="messenger-management">
      <ConnectionStatusIndicator />
      <AnimatePresence>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
          />
        )}
      </AnimatePresence>
      <motion.aside
        className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        initial={window.innerWidth > 768 ? "open" : "closed"}
      >
        <div className="sidebar-header">
          <Link
            to="/nutrient-specialist"
            className="logo"
            onClick={() => setIsSidebarOpen(true)}
          >
            <motion.div
              variants={logoVariants}
              animate="animate"
              whileHover="hover"
              className="logo-svg-container"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Leaf icon for nutrient specialist panel"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12c0 3.5 2.5 6.5 5.5 8C6 21 5 22 5 22s2-2 4-2c2 0 3 1 3 1s1-1 3-1c2 0 4 2 4 2s-1-1-2.5-2C17.5 18.5 20 15.5 20 12c0-5.52-4.48-10-10-10zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                  fill="#ffca28"
                  stroke="#2e7d32"
                  strokeWidth="1.5"
                />
              </svg>
            </motion.div>
            {isSidebarOpen && <span className="logo-text">Nutrient Panel</span>}
          </Link>
          <motion.button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  isSidebarOpen
                    ? "M13 18L7 12L13 6M18 18L12 12L18 6"
                    : "M6 18L12 12L6 6M11 18L17 12L11 6"
                }
              />
            </svg>
          </motion.button>
        </div>
        <motion.nav
          className="sidebar-nav"
          aria-label="Sidebar navigation"
          initial="initial"
          animate="animate"
          variants={containerVariants}
        >
          {currentSidebarPage === 1 && (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <button
                  onClick={handleHomepageNavigation}
                  title="Homepage"
                  aria-label="Navigate to homepage"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Home icon"
                  >
                    <path
                      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 22V12h6v10"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Homepage</span>}
                </button>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <Link
                  to="/blog-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Blog Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Blog icon"
                  >
                    <path
                      d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Blog Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <button
                  onClick={toggleFoodDropdown}
                  className="food-dropdown-toggle"
                  aria-label={
                    isFoodDropdownOpen
                      ? "Collapse food menu"
                      : "Expand food menu"
                  }
                  title="Food"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Food icon"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 4l2 6-6 2 6 2 2-6-2-6z"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Food</span>}
                  {isSidebarOpen && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`dropdown-icon ${
                        isFoodDropdownOpen ? "open" : ""
                      }`}
                    >
                      <path
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={
                          isFoodDropdownOpen ? "M6 9l6 6 6-6" : "M6 15l6-6 6 6"
                        }
                      />
                    </svg>
                  )}
                </button>
              </motion.div>
              <motion.div
                className="food-dropdown"
                variants={dropdownVariants}
                animate={
                  isSidebarOpen && isFoodDropdownOpen ? "open" : "closed"
                }
                initial="closed"
              >
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item food-dropdown-item"
                   >
                  <Link
                    to="/nutrient-specialist/food-category-management"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Food Category Management"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Category icon"
                    >
                      <path
                        d="M4 4h16v2H4V4zm0 7h16v2H4v-2zm0 7h16v2H4v-2z"
                        fill="#4caf50"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Food Category Management</span>}
                  </Link>
                </motion.div>
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item food-dropdown-item"
                   >
                  <Link
                    to="/nutrient-specialist/food-management"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Food Management"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Food item icon"
                    >
                      <path
                        d="M12 2c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8zm0 2c-3 0-5 2-5 6s2 6 5 6 5-2 5-6-2-6-5-6zm-2 2h4v8h-4V6z"
                        fill="#a5d6a7"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Food Management</span>}
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <button
                  onClick={toggleNutrientDropdown}
                  className="nutrient-dropdown-toggle"
                  aria-label={
                    isNutrientDropdownOpen
                      ? "Collapse nutrient menu"
                      : "Expand nutrient menu"
                  }
                  title="Nutrient"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Nutrient icon"
                  >
                    <path
                      d="M12 2c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8zm0 2c-3 0-5 2-5 6s2 6 5 6 5-2 5-6-2-6-5-6zm-2 2h4v8h-4V6z"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient</span>}
                  {isSidebarOpen && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`dropdown-icon ${
                        isNutrientDropdownOpen ? "open" : ""
                      }`}
                    >
                      <path
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={
                          isNutrientDropdownOpen
                            ? "M6 9l6 6 6-6"
                            : "M6 15l6-6 6 6"
                        }
                      />
                    </svg>
                  )}
                </button>
              </motion.div>
              <motion.div
                className="nutrient-dropdown"
                variants={dropdownVariants}
                animate={
                  isSidebarOpen && isNutrientDropdownOpen ? "open" : "closed"
                }
                initial="closed"
              >
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item nutrient-dropdown-item"
                   >
                  <Link
                    to="/nutrient-specialist/nutrient-category-management"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Nutrient Category Management"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Category icon"
                    >
                      <path
                        d="M4 4h16v2H4V4zm0 7h16v2H4v-2zm0 7h16v2H4v-2z"
                        fill="#4caf50"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Nutrient Category Management</span>}
                  </Link>
                </motion.div>
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item nutrient-dropdown-item"
                   >
                  <Link
                    to="/nutrient-specialist/nutrient-management"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Nutrient Management"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Nutrient item icon"
                    >
                      <path
                        d="M12 2c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8zm0 2c-3 0-5 2-5 6s2 6 5 6 5-2 5-6-2-6-5-6zm-2 2h4v8h-4V6z"
                        fill="#a5d6a7"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Nutrient Management</span>}
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <Link
                  to="/nutrient-specialist/nutrient-in-food-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Nutrient in Food Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 23"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Nutrient in food icon"
                  >
                    <path
                      d="M12 2c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8zm0 2c-3 0-5 2-5 6s2 6 5 6 5-2 5-6-2-6-5-6zm-3 2h6v2H9v-2zm0 4h6v2H9v-2z"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient in Food Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <Link
                  to="/nutrient-specialist/age-group-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Age Group Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Users icon"
                  >
                    <path
                      d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2m14-10a4 4 0 010-8m-6 4a4 4 0 11-8 0 4 4 0 018 0zm10 13v-2a4 4 0 00-3-3.87"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Age Group Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <Link
                  to="/nutrient-specialist/dish-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Dish Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Plate icon"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm-4 8a4 4 0 014-4 4 4 0 014 4"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Dish Management</span>}
                </Link>
              </motion.div>
            </>
          )}
          {currentSidebarPage === 2 && (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <Link
                  to="/nutrient-specialist/allergy-category-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Allergy Category Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Category icon"
                  >
                    <path
                      d="M4 4h16v2H4V4zm0 7h16v2H4v-2zm0 7h16v2H4v-2z"
                      fill="#4caf50"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Allergy Category Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <Link
                  to="/nutrient-specialist/allergy-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Allergy Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Allergy icon"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 4v4m0 4v2"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Allergy Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <Link
                  to="/nutrient-specialist/disease-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Disease Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Medical icon"
                  >
                    <path
                      d="M19 7h-3V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3H5a2 2 0 00-2 2v6a2 2 0 002 2h3v3a2 2 0 002 2h4a2 2 0 002-2v-3h3a2 2 0 002-2V9a2 2 0 00-2-2zm-7 10v3h-2v-3H7v-2h3V9h2v3h3v2h-3z"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Disease Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <Link
                  to="/nutrient-specialist/warning-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Warning Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Warning icon"
                  >
                    <path
                      d="M12 2l10 20H2L12 2zm0 4v8m0 4v2"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Warning Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <Link
                  to="/nutrient-specialist/meal-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Meal Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Meal icon"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm-4 4h8v2H8v-2zm0 4h8v2H8v-2z"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Meal Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <Link
                  to="/nutrient-specialist/energy-suggestion"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Energy Suggestion"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Energy icon"
                  >
                    <path
                      d="M12 2l-6 9h4v7l6-9h-4V2zm-2 9h4m-4-7v3m4 3v3"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Energy Suggestion</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <Link
                  to="/nutrient-specialist/nutrient-suggestion"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Nutrient Suggestion"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Nutrient suggestion icon"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 4v4h4m-4 2v2"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient Suggestion</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item active"
               >
                <Link
                  to="/nutrient-specialist/messenger-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Messenger Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Messenger icon"
                  >
                    <path
                      d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Messenger Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <Link
                  to="/nutrient-specialist/nutrient-policy"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Nutrient Policy"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Document icon"
                  >
                    <path
                      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient Policy</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <Link
                  to="/nutrient-specialist/nutrient-tutorial"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Nutrient Tutorial"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Book icon"
                  >
                    <path
                      d="M4 19.5A2.5 2.5 0 016.5 17H20m-16 0V5a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6.5"
                      fill="#a5d6a7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient Tutorial</span>}
                </Link>
              </motion.div>
            </>
          )}
          <motion.div
            variants={navItemVariants}
            className="sidebar-nav-item page-switcher"
          >
            <button
              onClick={() => setCurrentSidebarPage(1)}
              className={currentSidebarPage === 1 ? "active" : ""}
              aria-label="Switch to sidebar page 1"
              title="<<"
            >
              {isSidebarOpen ? "<<" : "<<"}
            </button>
            <button
              onClick={() => setCurrentSidebarPage(2)}
              className={currentSidebarPage === 2 ? "active" : ""}
              aria-label="Switch to sidebar page 2"
              title=">>"
            >
              {isSidebarOpen ? ">>" : ">>"}
            </button>
          </motion.div>
          {user ? (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item profile-section"
               >
                <Link
                  to="/profile"
                  className="profile-info"
                  title={isSidebarOpen ? user.email : "Profile"}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="User icon"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      fill="#ffffff"
                    />
                  </svg>
                  {isSidebarOpen && (
                    <span className="profile-email">{user.email}</span>
                  )}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
               >
                <button
                  className="logout-button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  title="Sign Out"
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-label="Logout icon"
                  >
                    <path
                      stroke="#d32f2f"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l6-6-6-6m0 12h8"
                    />
                  </svg>
                  {isSidebarOpen && <span>Sign Out</span>}
                </button>
              </motion.div>
            </>
          ) : (
            <motion.div
              variants={navItemVariants}
              className="sidebar-nav-item"
              whileHover="hover"
            >
              <Link
                to="/signin"
                onClick={() => setIsSidebarOpen(true)}
                title="Sign In"
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-label="Login icon"
                >
                  <path
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l6-6-6-6m0 12h8"
                  />
                </svg>
                {isSidebarOpen && <span>Sign In</span>}
              </Link>
            </motion.div>
          )}
        </motion.nav>
      </motion.aside>
      <motion.main
        className={`content ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="management-header">
          <div className="header-content">
            <h1>User Consultation Management</h1>
            <p>Connect with users for nutrition guidance and consultation</p>
          </div>
        </div>

        {/* NEW: Refactored management-container with consultation functionality */}
        <div className="management-container">
          {loading ? (
            <div className="loading-state">
              <LoaderIcon />
              <p>Loading conversations...</p>
            </div>
          ) : (
            <div className="consultation-layout">
              {/* Conversations Sidebar */}
              <div className="conversations-sidebar">
                <div className="conversations-header">
                  <h3>
                    <FaComments />
                    Conversations
                    {totalUnreadCount > 0 && (
                      <span className="unread-badge">{totalUnreadCount}</span>
                    )}
                  </h3>

                  <div className="search-section">
                    <div className="search-input-wrapper">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                      />
                    </div>
                  </div>

                  <div className="filter-tabs">
                    <button
                      className={`filter-tab ${
                        filterStatus === "all" ? "active" : ""
                      }`}
                      onClick={() => setFilterStatus("all")}
                    >
                      All
                    </button>
                    <button
                      className={`filter-tab ${
                        filterStatus === "unread" ? "active" : ""
                      }`}
                      onClick={() => setFilterStatus("unread")}
                    >
                      Unread
                    </button>
                    {/* <button
                      className={`filter-tab ${
                        filterStatus === "active" ? "active" : ""
                      }`}
                      onClick={() => setFilterStatus("active")}
                    >
                      Active
                    </button> */}
                  </div>
                </div>

                <div className="conversations-list">
                  {filteredThreads.length === 0 ? (
                    <div className="no-conversations">
                      <FaComments className="no-conversations-icon" />
                      <p>
                        {searchTerm || filterStatus !== "all"
                          ? "No conversations match your criteria."
                          : "You don't have any user conversations yet."}
                      </p>
                    </div>
                  ) : (
                    filteredThreads.map(([userId, thread]) => (
                      <div
                        key={userId}
                        className={`conversation-item ${
                          selectedThread?.patientUserId === userId
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleSelectThread(userId)}
                      >
                        <div className="conversation-avatar">
                          <FaUser />
                        </div>

                        <div className="conversation-info">
                          <div className="conversation-header">
                            <h5 className="patient-name">
                              {thread.patient?.userName || `User ${userId}`}
                            </h5>
                            {thread.unreadCount > 0 && (
                              <span className="unread-count">
                                {thread.unreadCount}
                              </span>
                            )}
                          </div>

                          <p className="last-message">
                            {thread.messages?.length > 0
                              ? thread.messages[thread.messages.length - 1]
                                  .messageText || "Attachment"
                              : "No messages yet"}
                          </p>

                          <div className="conversation-meta">
                            <span className="last-activity">
                              {formatMessageTime(thread.lastActivity)}
                            </span>
                            {thread.patient?.email && (
                              <span className="patient-email">
                                {thread.patient.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="chat-area">
                {selectedThread ? (
                  <>
                    {/* Chat Header */}
                    <div className="chat-header">
                      <div className="patient-info">
                        <div className="patient-avatar">
                          <FaUser />
                        </div>
                        <div className="patient-details">
                          <h3>{selectedThread.patient?.userName || "User"}</h3>
                          <p className="patient-status">
                            {selectedThread.patient?.email || "Consultation"}
                          </p>
                        </div>
                      </div>

                      {/* <div className="chat-actions">
                        <button className="action-btn" title="User Profile">
                          <FaUser />
                        </button>
                        <button className="action-btn" title="Call">
                          <FaPhone />
                        </button>
                        <button className="action-btn" title="Video Call">
                          <FaVideo />
                        </button>
                      </div> */}
                    </div>

                    {/* Messages Area */}
                    <div className="messenger-management-messages">
                      {selectedThread.messages?.length === 0 ? (
                        <div className="no-messages">
                          <FaComments className="no-messages-icon" />
                          <p>Send a message to begin the consultation.</p>
                        </div>
                      ) : (
                        <>
                          {selectedThread.messages?.map((msg, idx) => {
                            const isSent = msg.senderId === currentStaffId;
                            const messageClass = isSent ? "sent" : "received";
                            const hasAttachment = msg.attachment;

                            return (
                              <motion.div
                                key={idx}
                                className={`message ${messageClass}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="message-content">
                                  {msg.messageText && (
                                    <div className="message-text">
                                      {msg.messageText}
                                    </div>
                                  )}

                                  {hasAttachment && (
                                    <div className="message-attachment">
                                      {msg.attachment.isImage ? (
                                        <img
                                          src={msg.attachment.url}
                                          alt="Attachment"
                                          className="attachment-image"
                                          onClick={() =>
                                            window.open(
                                              msg.attachment.url,
                                              "_blank"
                                            )
                                          }
                                        />
                                      ) : (
                                        <div className="attachment-file">
                                          <FaFileAlt className="file-icon" />
                                          <div className="file-info">
                                            <span className="file-name">
                                              {msg.attachment.fileName}
                                            </span>
                                            <span className="file-size">
                                              {formatBytes(
                                                msg.attachment.fileSize
                                              )}
                                            </span>
                                          </div>
                                          <button
                                            onClick={() =>
                                              window.open(
                                                msg.attachment.url,
                                                "_blank"
                                              )
                                            }
                                            className="download-btn"
                                          >
                                            <FaFile />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div className="message-time">
                                    {(() => {
                                      try {
                                        let timestamp =
                                          msg.createdAt ||
                                          msg.sentAt ||
                                          Date.now();

                                        // Add Z to UTC timestamp if missing
                                        if (
                                          typeof timestamp === "string" &&
                                          !timestamp.includes("Z")
                                          // !timestamp.includes("+") &&
                                          // !timestamp.includes("-")
                                        ) {
                                          timestamp = timestamp + "Z";
                                        }

                                        const date = new Date(timestamp);

                                        // Check if date is valid
                                        if (isNaN(date.getTime())) {
                                          return "Now";
                                        }

                                        return date.toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        });
                                      } catch (error) {
                                        console.error(
                                          "Error formatting message time:",
                                          error
                                        );
                                        return "Now";
                                      }
                                    })()}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="message-input-area">
                      {selectedFile && (
                        <div className="file-preview">
                          {filePreview ? (
                            <img
                              src={filePreview}
                              alt="Preview"
                              className="preview-image"
                            />
                          ) : (
                            <div className="file-info">
                              <FaFileAlt className="file-icon" />
                              <span>{selectedFile.name}</span>
                              <span className="file-size">
                                ({formatBytes(selectedFile.size)})
                              </span>
                            </div>
                          )}
                          <button
                            onClick={clearSelectedFile}
                            className="remove-file"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )}

                      <div className="input-container">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept={allSupportedTypes.join(",")}
                          style={{ display: "none" }}
                        />

                        {/* <button
                          onClick={() => fileInputRef.current?.click()}
                          className="attach-btn"
                          title="Attach file"
                        >
                          <FaPaperclip />
                        </button> */}

                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          disabled={sendingMessage}
                          className="message-input"
                        />

                        <button
                          onClick={handleSendMessage}
                          disabled={
                            (!newMessage.trim() && !selectedFile) ||
                            sendingMessage
                          }
                          className="send-btn"
                        >
                          {sendingMessage ? (
                            <div className="loading-spinner" />
                          ) : (
                            <HiPaperAirplane />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-selection">
                    <div className="no-selection-content">
                      <FaComments className="no-selection-icon" />
                      <h3>Nutrition Staff Dashboard</h3>
                      <p>
                        Choose a user conversation from the list to view and
                        respond to messages.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.main>
    </div>
  );
};

export default MessengerManagement;
