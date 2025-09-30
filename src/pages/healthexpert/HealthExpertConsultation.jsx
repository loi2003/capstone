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
import "../../styles/HealthExpertConsultation.css";
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
  FaHeartbeat,
  FaStethoscope,
  FaPills,
  FaClipboardCheck,
  FaNotesMedical,
  FaUserMd,
  FaSignOutAlt,
  FaBars,
  FaClipboardList,
  FaChevronRight,
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

const HealthExpertConsultation = () => {
  // Original states
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentSidebarPage, setCurrentSidebarPage] = useState(2);
  const [isHealthDropdownOpen, setIsHealthDropdownOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);

  // Use same pattern as MessengerManagement
  const messagesEndRef = useRef(null);
  const {
    connection,
    messages,
    addMessage,
    connectionStatus,
    isReconnecting,
    isConnected,
  } = useMessages();

  // Add processedMessageIds pattern (same as MessengerManagement)
  const processedMessageIds = useRef(new Set());

  // Consultation states (adapted from MessengerManagement)
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

  // File handling utilities (same as MessengerManagement)
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
          ".health-expert-messages"
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

  // Initialize health expert user (roleId = 3)
  useEffect(() => {
    const fetchUser = () => {
      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }
      getCurrentUser(token)
        .then((response) => {
          const userData = response.data?.data || response.data;
          if (userData && Number(userData.roleId) === 3) {
            // Health Expert roleId
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

  // Load health expert threads (same logic as MessengerManagement)
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
                // Fix UTC timestamp by adding Z if missing
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

                // Handle media array
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
      console.error("Failed to load health expert threads:", error);
    }
  };

  // Real-time message handling (EXACT same as MessengerManagement)
  useEffect(() => {
    console.log("=== MESSAGE EFFECT TRIGGERED ===");
    console.log("messages.length:", messages.length);
    console.log("currentStaffId:", currentStaffId);
    console.log(
      "selectedThread?.patientUserId:",
      selectedThread?.patientUserId
    );

    if (messages.length === 0) {
      console.log("No messages, returning early");
      return;
    }

    const latest = messages[messages.length - 1];
    console.log("=== PROCESSING NEW MESSAGE ===");
    console.log("Latest message:", JSON.stringify(latest, null, 2));

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

      //   console.log("Message from patient:", patientUserId);

      const existingMessages = prev[patientUserId]?.messages || [];
      console.log("Existing messages count:", existingMessages.length);

      // Secondary check at state level
      const messageExists = existingMessages.some((m) => m.id === latest.id);
      if (messageExists) {
        console.log("Message already exists in thread, skipping:", latest.id);
        return prev;
      }

      console.log("Adding new message to thread for patient:", patientUserId);

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

  // Cleanup for processed message IDs (same as MessengerManagement)
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (processedMessageIds.current.size > 1000) {
        console.log("Cleaning up processed message IDs");
        processedMessageIds.current.clear();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(cleanup);
  }, []);

  // Join thread when selected (same as MessengerManagement)
  useEffect(() => {
    if (connection && selectedThread?.thread?.id && isConnected) {
      const threadId = selectedThread.thread.id;
      console.log("=== JOINING THREAD ===");
      console.log("Joining thread:", threadId);

      connection
        .invoke("JoinThread", threadId)
        .then(() => {
          console.log("✅ Successfully joined thread:", threadId);
        })
        .catch((err) => {
          console.error("❌ JoinThread failed:", err);
        });
    }
  }, [connection, selectedThread?.thread?.id, isConnected]);

  // Handle selecting a chat thread (same as MessengerManagement)
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

  // Send message (same as MessengerManagement with UTC timestamp fix)
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

  // Keep all file handling functions from MessengerManagement
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

  // Sidebar functions
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;

    try {
      if (user?.userId) await logout(user.userId);
    } catch (error) {
      console.error("Error logging out:", error.message);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsSidebarOpen(true);
      navigate("/signin", { replace: true });
    }
  };

  // Helper functions
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "Unknown";

    try {
      // Add Z to UTC timestamp if missing
      if (typeof timestamp === "string" && !timestamp.includes("Z")) {
        timestamp = timestamp + "Z";
      }

      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Unknown";
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

  const containerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
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
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="health-expert-homepage">
      <motion.aside
        className={`health-expert-sidebar ${isSidebarOpen ? "open" : "closed"}`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        initial="open"
      >
        <div className="sidebar-header">
          <Link
            to="/health-expert"
            className="logo"
            onClick={() => setIsSidebarOpen(true)}
          >
            <motion.div
              variants={logoVariants}
              animate="animate"
              whileHover="hover"
              className="logo-svg-container"
            >
              <FaHeartbeat className="heart-logo"/>
            </motion.div>
            {isSidebarOpen && (
              <span className="logo-text">Health Expert Panel</span>
            )}
          </Link>
          <motion.button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              aria-label="Toggle sidebar icon"
            >
              <path
                stroke="var(--health-expert-background)"
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
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/health-expert/tutorial"
              onClick={() => setIsSidebarOpen(true)}
              title="Tutorial"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Tutorial icon"
              >
                <path
                  d="M12 3v18m9-9H3"
                  fill="var(--health-expert-color1)"
                  stroke="var(--health-expert-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Tutorial</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/health-expert/policy"
              onClick={() => setIsSidebarOpen(true)}
              title="Policy"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Policy icon"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16.5V18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2v.5"
                  fill="var(--health-expert-color2)"
                  stroke="var(--health-expert-text)"
                  strokeWidth="1.5"
                />
              </svg>
              {isSidebarOpen && <span>Policy</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
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
                aria-label="Book icon for blog management"
              >
                <path
                  d="M4 19.5A2.5 2.5 0 016.5 17H20m-16 0V5a2 2 0 012-2h12a2 2 0 012 2v12.5m-16 0H20a2 2 0 002-2V7.5L16.5 3"
                  fill="var(--health-expert-color3)"
                  stroke="var(--health-expert-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Blog Management</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/health-expert/consultation"
              onClick={() => setIsSidebarOpen(true)}
              title="Consultation"
            >
              <FaClipboardList size={20} />
              {isSidebarOpen && <span>Staff Advice</span>}
            </Link>
          </motion.div>
          {user ? (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item health-expert-profile-section"
              >
                <Link
                  to="/profile"
                  className="health-expert-profile-info"
                  title={isSidebarOpen ? user.email : ""}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="User icon for profile"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 
        10 10 10-4.48 10-10S17.52 2 12 2zm0 
        3c1.66 0 3 1.34 3 3s-1.34 
        3-3 3-3-1.34-3-3 1.34-3 
        3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 
        4-3.08 6-3.08 1.99 0 5.97 1.09 
        6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      fill="var(--health-expert-background)"
                    />
                  </svg>
                  {isSidebarOpen && (
                    <span className="health-expert-profile-email">
                      {user.email}
                    </span>
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
                      stroke="var(--health-expert-logout)"
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
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
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
                  aria-label="Sign in icon"
                >
                  <path
                    stroke="var(--health-expert-background)"
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
      {/* Main content */}
      <motion.main
        className="health-expert-content"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="management-header">
          <div className="header-content">
            <h1>Health Expert Consultation Management</h1>
            <p>
              Connect with patients for health guidance and medical consultation
            </p>
          </div>
        </div>

        <div className="management-container">
          {loading ? (
            <div className="loading-state">
              <LoaderIcon />
              <p>Loading consultations...</p>
            </div>
          ) : (
            <div className="consultation-layout">
              {/* Conversations Sidebar */}
              <div className="conversations-sidebar">
                <div className="conversations-header">
                  <h3>
                    <FaComments />
                    Staff Advice
                    {totalUnreadCount > 0 && (
                      <span className="unread-badge">{totalUnreadCount}</span>
                    )}
                  </h3>

                  <div className="search-section">
                    <div className="search-input-wrapper">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search patients..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                  </div>
                </div>

                <div className="conversations-list">
                  {filteredThreads.length === 0 ? (
                    <div className="no-conversations">
                      <FaComments className="no-conversations-icon" />
                      <p>
                        {searchTerm || filterStatus !== "all"
                          ? "No consultations match your criteria."
                          : "You don't have any patient consultations yet."}
                      </p>
                    </div>
                  ) : (
                    filteredThreads.map(([patientUserId, thread]) => (
                      <motion.div
                        key={patientUserId}
                        className={`conversation-item ${
                          selectedThread?.patientUserId === patientUserId
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleSelectThread(patientUserId)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="conversation-avatar">
                          <FaUser />
                        </div>
                        <div className="conversation-info">
                          <div className="conversation-header">
                            <h4 className="patient-name">
                              {thread.patient?.userName ||
                                `Patient ${patientUserId.slice(0, 8)}`}
                            </h4>
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
                            <span className="patient-email">
                              {thread.patient?.email || "Medical Consultation"}
                            </span>
                            <span className="last-activity">
                              {formatMessageTime(thread.lastActivity)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="chat-area">
                {selectedThread ? (
                  <>
                    <div className="chat-header">
                      <div className="patient-info">
                        <div className="patient-avatar">
                          <FaUser />
                        </div>
                        <div className="patient-details">
                          <h3>
                            {selectedThread.patient?.userName ||
                              `Patient ${selectedThread.patientUserId?.slice(
                                0,
                                8
                              )}`}
                          </h3>
                          <p className="patient-status">
                            {selectedThread.patient?.email ||
                              "Medical Consultation"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="health-expert-messages">
                      {selectedThread.messages?.length === 0 ? (
                        <div className="no-messages">
                          <FaComments className="no-messages-icon" />
                          <p>
                            Send a message to begin the medical consultation.
                          </p>
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
                                      // Fix UTC timestamp by adding Z if missing
                                      let timestamp =
                                        msg.createdAt ||
                                        new Date().toISOString();
                                      if (
                                        typeof timestamp === "string" &&
                                        !timestamp.includes("Z")
                                      ) {
                                        timestamp = timestamp + "Z";
                                      }
                                      return new Date(
                                        timestamp
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      });
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

                    {/* Message Input Area */}
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
                            <FaFileAlt className="file-icon" />
                          )}
                          <div className="file-info">
                            <span className="file-name">
                              {selectedFile.name}
                            </span>
                            <span className="file-size">
                              {formatBytes(selectedFile.size)}
                            </span>
                          </div>
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

                        <textarea
                          className="message-input"
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          disabled={sendingMessage}
                          rows="1"
                        />

                        <button
                          className="send-btn"
                          onClick={handleSendMessage}
                          disabled={
                            sendingMessage ||
                            (!newMessage.trim() && !selectedFile)
                          }
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
                      <h3>Health Expert Dashboard</h3>
                      <p>
                        Choose a patient consultation from the list to view and
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

export default HealthExpertConsultation;
