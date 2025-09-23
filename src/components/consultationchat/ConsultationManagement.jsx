import React, { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { motion } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  startChatThread,
  sendMessage,
  getChatThreadByUserId, // Use this to get consultant's threads
  getChatThreadById,
} from "../../apis/message-api";
import { getCurrentUser } from "../../apis/authentication-api"; // Get current consultant
import { getUserById } from "../../apis/user-api"; // Get patient details
import MainLayout from "../../layouts/MainLayout";
import "./ConsultationManagement.css";
import {
  FaComments,
  FaSearch,
  FaUser,
  FaHospital,
  FaPhone,
  FaVideo,
  FaFile,
  FaPaperclip,
  FaTimes,
  FaClock,
  FaCheckCircle,
  FaQuestion,
  FaChartLine,
  FaCalendarAlt,
  FaUsers,
  FaQuestionCircle,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaClipboardList,
} from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import { HiPaperAirplane } from "react-icons/hi2";
import LoadingOverlay from "../popup/LoadingOverlay";
import { useMessages } from "../../utils/useMessages";

const ConsultationManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const { connection, messages, addMessage } = useMessages();

  // State management
  const [currentConsultantId, setCurrentConsultantId] = useState(null);
  const [currentConsultantData, setCurrentConsultantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatThreads, setChatThreads] = useState({});
  const [selectedThread, setSelectedThread] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, unread, active

  // const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const scrollToBottom = () => {
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }
    });
  };

  // File handling utilities (copied from original)
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

  const getFileIcon = (fileName, fileType) => {
    const name = fileName?.toLowerCase();
    const type = fileType?.toLowerCase();

    if (type?.includes("pdf") || name?.endsWith(".pdf")) return "pdf";
    if (
      type?.includes("word") ||
      name?.endsWith(".doc") ||
      name?.endsWith(".docx")
    )
      return "doc";
    if (
      type?.includes("excel") ||
      name?.endsWith(".xls") ||
      name?.endsWith(".xlsx")
    )
      return "xls";
    if (
      type?.startsWith("text") ||
      name?.endsWith(".txt") ||
      name?.endsWith(".log")
    )
      return "txt";
    return "file";
  };

  const supportedImageTypes = [".jpg", ".jpeg", ".png"];
  const supportedDocTypes = [".docx", ".xls", ".xlsx", ".pdf"];
  const allSupportedTypes = [...supportedImageTypes, ...supportedDocTypes];

  // Initialize page for consultant
  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin");
        return;
      }

      const consultantRes = await getCurrentUser(token);
      const consultantData =
        consultantRes?.data?.data || consultantRes?.data || consultantRes;
      const consultantId = consultantData?.id;

      if (!consultantId) {
        console.error("No consultant ID found");
        navigate("/signin");
        return;
      }

      if (consultantData.roleId !== 6) {
        console.error("User is not a consultant, role:", consultantData.roleId);
        navigate("/");
        return;
      }

      localStorage.setItem("userId", consultantId);

      console.log("Current consultant:", consultantData);
      setCurrentConsultantId(consultantId);
      setCurrentConsultantData(consultantData);

      await loadConsultantThreads(consultantId);
    } catch (error) {
      console.error("Failed to initialize consultation management", error);
      navigate("/signin");
    } finally {
      setLoading(false);
    }
  };

  // Load all chat threads for the consultant
  // Since consultant is a user, we can use getChatThreadByUserId with consultant's userId
  const loadConsultantThreads = async (consultantUserId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      console.log("Loading threads for consultant userId:", consultantUserId);

      // Use getChatThreadByUserId with consultant's userId
      // This will return all threads where the consultant is a participant
      const threadsResponse = await getChatThreadByUserId(
        consultantUserId,
        token
      );

      // Handle different response structures
      let threads = [];
      if (Array.isArray(threadsResponse)) {
        threads = threadsResponse;
      } else if (threadsResponse?.data && Array.isArray(threadsResponse.data)) {
        threads = threadsResponse.data;
      } else if (threadsResponse?.id) {
        threads = [threadsResponse];
      }

      console.log("Number of threads found:", threads.length);

      if (threads.length > 0) {
        const threadsMap = {};

        for (const thread of threads) {
          console.log("Processing thread:", thread);

          // Find the patient userId (the other participant who is not the consultant)
          let patientUserId = null;

          // Method 1: If thread has userId and consultantId fields
          if (thread.userId && thread.consultantId) {
            if (thread.consultantId === consultantUserId) {
              patientUserId = thread.userId; // Patient is the userId
            } else if (thread.userId === consultantUserId) {
              patientUserId = thread.consultantId; // Patient is the consultantId (shouldn't happen but handle it)
            }
          }
          // Method 2: If thread only has userId (less likely but possible)
          else if (thread.userId && thread.userId !== consultantUserId) {
            patientUserId = thread.userId;
          }

          if (!patientUserId) {
            console.log(
              "Could not determine patient userId for thread:",
              thread
            );
            continue;
          }

          console.log("Processing thread for patient userId:", patientUserId);

          try {
            // Get patient details using getUserById
            const patientRes = await getUserById(patientUserId, token);
            console.log(
              "Patient response for userId:",
              patientUserId,
              patientRes
            );

            // Handle response structure from getUserById API
            const patientData = patientRes?.data || patientRes || null;

            // Process messages to include attachment data
            const processedMessages =
              thread.messages?.map((msg) => {
                // Check if message has attachment data from backend
                if (msg.attachmentUrl || msg.attachmentPath || msg.attachment) {
                  return {
                    ...msg,
                    attachment: {
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
                    },
                  };
                }
                return msg;
              }) || [];

            // Calculate unread count - messages from patient that consultant hasn't read
            const unreadCount = processedMessages.filter(
              (msg) => !msg.isRead && msg.senderId === patientUserId
            ).length;

            threadsMap[patientUserId] = {
              thread,
              messages: processedMessages,
              patient: patientData, // Patient data from getUserById
              lastActivity: thread.updatedAt || thread.createdAt,
              unreadCount: unreadCount,
            };
          } catch (err) {
            console.error(`Failed to fetch patient ${patientUserId}:`, err);
            // Continue processing other threads even if one fails
          }
        }

        setChatThreads(threadsMap);
        console.log("Threads processed:", Object.keys(threadsMap).length);
      }
    } catch (error) {
      console.error("Failed to load consultant threads:", error);
    }
  };

  // Handle selecting a chat thread
  const handleSelectThread = (patientUserId) => {
    const threadData = chatThreads[patientUserId];
    if (threadData) {
      setSelectedThread({
        ...threadData,
        patientUserId: patientUserId,
      });

      // Mark messages as read (you might want to call an API here)
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

  // File handling functions (copied from original)
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

    // Create preview for images
    if (supportedImageTypes.includes(fileExtension)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
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

  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const extension = "." + fileName.toLowerCase().split(".").pop();
    return supportedImageTypes.includes(extension);
  };

  // Send message function
  const handleSendMessage = async () => {
    console.log("Connection object:", connection);
    console.log("Connection state:", connection?.state);
    console.log("Expected state:", signalR.HubConnectionState.Connected);

    if (
      !connection ||
      connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.error("SignalR connection not established");
      alert("Connection lost. Please refresh the page.");
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

    if (!selectedFile && !newMessage.trim()) {
      alert("Please enter a message or attach a file to send");
      return;
    }

    try {
      setSendingMessage(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("ChatThreadId", activeThread.id);
      formData.append("SenderId", currentConsultantId);

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
      console.log("Send message response:", response);

      if (response.error === 0) {
        const attachmentUrl =
          response.data?.attachmentUrl ||
          response.data?.attachmentPath ||
          response.data?.attachment?.url;

        const newMsg = {
          id: response.data?.id || Date.now().toString(),
          senderId: currentConsultantId,
          receiverId: patientUserId,
          messageText: newMessage.trim(),
          createdAt: response.data?.sentAt || new Date().toISOString(),
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

        // setTimeout(() => {
        //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        // }, 100);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  // Message rendering
  const renderMessage = (msg, idx) => {
    const isSent = msg.senderId === currentConsultantId;
    const messageClass = isSent ? "sent" : "received";
    const hasAttachment = msg.attachment;
    const media = Array.isArray(msg.media) ? msg.media : [];

    // Prioritize attachment object over media array to prevent duplicates
    const shouldRenderMedia = !hasAttachment && media.length > 0;

    return (
      <div
        key={idx}
        className={`consultation-management-message ${messageClass}`}
      >
        <div className="consultation-management-message-content">
          {msg.messageText && <p>{msg.messageText}</p>}

          {/* Handle attachment object (priority) */}
          {hasAttachment &&
            (msg.attachment.isImage ? (
              <img
                src={msg.attachment.url}
                alt={msg.attachment.fileName}
                className="consultation-management-attachment-image"
                onClick={() => window.open(msg.attachment.url, "_blank")}
              />
            ) : (
              // *** REPLACE AttachmentCard with direct document rendering ***
              <div className="consultation-management-attachment-document">
                <a
                  href={msg.attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="consultation-management-attachment-link"
                >
                  <div className="consultation-management-attachment-info">
                    <FaFileAlt className="consultation-management-document-file-icon" />
                    <div className="consultation-management-attachment-details">
                      <span className="consultation-management-attachment-name">
                        {msg.attachment.fileName}
                      </span>
                      <span
                        className="consultation-management-message-time"
                        style={{
                          fontSize: "11px",
                          opacity: 0.7,
                          fontWeight: 500,
                          marginTop: "8px",
                          display: "block",
                          textAlign: isSent ? "right" : "left",
                          color: isSent
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(30,41,59,0.7)",
                        }}
                      >
                        {formatMessageTime(
                          msg.createdAt ||
                            msg.sentAt ||
                            msg.timestamp ||
                            msg.CreationDate
                        )}
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            ))}

          {/* Handle media array only if no attachment object exists */}
          {shouldRenderMedia &&
            media.map((m, i) => {
              const isImg = m.fileType?.startsWith("image");
              const url = m.fileUrl || m.url;
              if (!url) return null;

              return isImg ? (
                <img
                  key={i}
                  src={url}
                  alt={`attachment-${i}`}
                  className="consultation-management-attachment-image"
                  onClick={() => window.open(url, "_blank")}
                />
              ) : (
                <div
                  key={i}
                  className="consultation-management-attachment-document"
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="consultation-management-attachment-link"
                  >
                    <div className="consultation-management-attachment-info">
                      <FaFileAlt className="consultation-management-document-file-icon" />
                      <div className="consultation-management-attachment-details">
                        <span className="consultation-management-attachment-name">
                          {m.fileName}
                        </span>
                      </div>
                    </div>
                  </a>
                </div>
              );
            })}
          <span
            className="consultation-management-message-time"
            style={{
              fontSize: "11px",
              opacity: 0.7,
              fontWeight: 500,
              marginTop: "8px",
              display: "block",
              textAlign: isSent ? "right" : "left",
              color: isSent ? "rgba(255,255,255,0.7)" : "rgba(30,41,59,0.7)",
            }}
          >
            {formatMessageTime(
              msg.createdAt || msg.sentAt || msg.timestamp || msg.creationDate
            )}
          </span>
        </div>
      </div>
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";

    try {
      let utcDate;

      // Handle different timestamp formats
      if (typeof timestamp === "string") {
        // If string doesn't end with 'Z', assume it's UTC and add 'Z'
        if (
          !timestamp.endsWith("Z") &&
          !timestamp.includes("+") &&
          !timestamp.includes("-")
        ) {
          utcDate = new Date(timestamp + "Z"); // Force UTC parsing
        } else {
          utcDate = new Date(timestamp);
        }
      } else if (typeof timestamp === "number") {
        // Handle Unix timestamp (seconds or milliseconds)
        utcDate =
          timestamp > 1000000000000
            ? new Date(timestamp)
            : new Date(timestamp * 1000);
      } else if (timestamp instanceof Date) {
        utcDate = timestamp;
      } else {
        return "";
      }

      // Check if date is valid
      if (isNaN(utcDate.getTime())) {
        console.warn("Invalid timestamp:", timestamp);
        return "";
      }

      // Convert to local timezone and format
      try {
        return utcDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      } catch (e) {
        // Manual fallback formatting (already in local time)
        const hours = utcDate.getHours().toString().padStart(2, "0");
        const minutes = utcDate.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
      }
    } catch (error) {
      console.warn("Error formatting timestamp:", error);
      return "";
    }
  };

  // Filter threads based on status
  const getFilteredThreads = () => {
    const threadList = Object.entries(chatThreads).map(
      ([patientUserId, data]) => ({
        patientUserId,
        ...data,
      })
    );

    let filtered = threadList;

    if (searchTerm) {
      filtered = filtered.filter(
        (thread) =>
          thread.user?.userName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          thread.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus === "unread") {
      filtered = filtered.filter((thread) => thread.unreadCount > 0);
    } else if (filterStatus === "active") {
      filtered = filtered.filter((thread) => {
        const lastActivity = new Date(thread.lastActivity);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return lastActivity > oneDayAgo;
      });
    }

    filtered.sort(
      (a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)
    );

    return filtered;
  };

  useEffect(() => {
    if (
      connection &&
      connection.state === signalR.HubConnectionState.Connected &&
      selectedThread?.thread?.id
    ) {
      console.log("Joining thread", selectedThread.thread.id);
      console.log("Connection state:", connection.state);

      connection
        .invoke("JoinThread", selectedThread.thread.id)
        .then(() => {
          console.log("Successfully joined thread:", selectedThread.thread.id);
        })
        .catch((err) => {
          console.error("JoinThread failed:", err);
          // Retry after a short delay if connection was lost
          setTimeout(() => {
            if (connection.state === signalR.HubConnectionState.Connected) {
              connection
                .invoke("JoinThread", selectedThread.thread.id)
                .catch((retryErr) =>
                  console.error("Retry JoinThread failed:", retryErr)
                );
            }
          }, 1000);
        });
    } else if (connection && selectedThread?.thread?.id) {
      console.log("Connection not ready, state:", connection.state);
      // Wait for connection to be established
      const checkConnection = setInterval(() => {
        if (connection.state === signalR.HubConnectionState.Connected) {
          clearInterval(checkConnection);
          connection
            .invoke("JoinThread", selectedThread.thread.id)
            .then(() => console.log("Successfully joined thread after waiting"))
            .catch((err) => console.error("Delayed JoinThread failed:", err));
        }
      }, 500);

      // Clear interval after 10 seconds to prevent memory leak
      setTimeout(() => clearInterval(checkConnection), 10000);
    }
  }, [connection, selectedThread]);

  // Add this useEffect to handle incoming real-time messages
  // In ConsultationManagement.jsx, update the useEffect for messages
  useEffect(() => {
    if (messages.length === 0) return;

    const latest = messages[messages.length - 1];
    console.log(
      "Processing incoming message in ConsultationManagement:",
      latest
    );

    if (selectedThread?.patientUserId) {
      const patientUserId = selectedThread.patientUserId;

      // Try to join the thread (if needed)
      if (
        connection &&
        connection.state === signalR.HubConnectionState.Connected
      ) {
        const threadId = selectedThread.thread?.id;
        if (threadId) {
          console.log("Joining thread:", threadId);
          connection
            .invoke("JoinThread", threadId)
            .then(() => console.log("Successfully joined thread"))
            .catch((err) => console.error("Failed to join thread:", err));
        }
      }

      setChatThreads((prev) => {
        const existingMessages = prev[patientUserId]?.messages || [];

        // *** ADD THIS DUPLICATE CHECK ***
        const messageExists = existingMessages.some((m) => m.id === latest.id);
        if (messageExists) {
          console.log("Message already exists in thread, skipping:", latest.id);
          return prev;
        }

        console.log("Adding new message to thread for patient:", patientUserId);

        // Process the message for attachments
        const processedMessage = {
          ...latest,
          messageText: latest.messageText?.trim(),
        };
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
            isImage: isImageFile(firstMedia.fileName),
            url: firstMedia.fileUrl || firstMedia.url,
          };
        }

        return {
          ...prev,
          [patientUserId]: {
            ...prev[patientUserId],
            messages: [...existingMessages, processedMessage],
            lastActivity: latest.createdAt || latest.sentAt,
          },
        };
      });

      // Update selectedThread if this is the active thread
      setSelectedThread((prev) => {
        if (prev?.patientUserId === patientUserId) {
          const existingMessages = prev.messages || [];
          const messageExists = existingMessages.some(
            (m) => m.id === latest.id
          );
          if (!messageExists) {
            const processedMessage = { ...latest };
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
                isImage: isImageFile(firstMedia.fileName),
                url: firstMedia.fileUrl || firstMedia.url,
              };
            }

            return {
              ...prev,
              messages: [...existingMessages, processedMessage],
            };
          }
        }
        return prev;
      });

      // Auto scroll to bottom
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [
    messages,
    selectedThread?.patientUserId,
    currentConsultantId,
    connection,
  ]);

  const filteredThreads = getFilteredThreads();

  if (loading) {
    return (
      <div className="consultation-management-main-page">
        <LoadingOverlay show={loading} />
      </div>
    );
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
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

  const containerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const sidebarVariants = {
    open: {
      width: "250px",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    closed: {
      width: "80px",
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

  const handleLogout = async () => {
    if (!currentConsultantData?.userId) {
      localStorage.removeItem("token");
      setUser(null);
      navigate("/signin", { replace: true });
      return;
    }
    if (window.confirm("Are you sure you want to sign out?")) {
      try {
        await logout(currentConsultantData.userId);
      } catch (error) {
        console.error("Error logging out:", error.message);
      } finally {
        localStorage.removeItem("token");
        setUser(null);
        setIsSidebarOpen(true);
        navigate("/signin", { replace: true });
      }
    }
  };

  return (
    <div className="consultant-homepage">
      <motion.aside
        className={`consultant-sidebar ${isSidebarOpen ? "open" : "closed"}`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        initial="open"
      >
        <div className="sidebar-header">
          <Link
            to="/consultant"
            className="logo"
            onClick={() => setIsSidebarOpen(true)}
          >
            <motion.div
              variants={logoVariants}
              animate="animate"
              whileHover="hover"
              className="logo-svg-container"
            >
              {/* <FaBars className="logo-svg" /> */}
            </motion.div>
            {isSidebarOpen && (
              <span className="logo-text">Consultant Panel</span>
            )}
          </Link>
          {isSidebarOpen && <h2 className="sidebar-title"></h2>}
          <motion.button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSidebarOpen ? (
              <FaChevronLeft size={24} />
            ) : (
              <FaChevronRight size={24} />
            )}
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
              to="/consultant"
              onClick={() => setIsSidebarOpen(true)}
              title="Dashboard"
            >
              <FaChartLine size={20} />
              {isSidebarOpen && <span>Dashboard</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/consultant"
              onClick={() => setIsSidebarOpen(true)}
              title="Schedule"
            >
              <FaCalendarAlt size={20} />
              {isSidebarOpen && <span>Schedule</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/consultant"
              onClick={() => setIsSidebarOpen(true)}
              title="Clients"
            >
              <FaUsers size={20} />
              {isSidebarOpen && <span>Clients</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/consultant/support"
              onClick={() => setIsSidebarOpen(true)}
              title="Support"
            >
              <FaQuestionCircle size={20} />
              {isSidebarOpen && <span>Support</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="sidebar-nav-item active"
          >
            <Link
              to="/consultation/consultation-management"
              onClick={() => setIsSidebarOpen(true)}
              title="Consultation Chat"
              className="active-nav-link"
            >
              <FaUsers size={20} />
              {isSidebarOpen && <span>Patient Consultation</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <button
              className="sidebar-action-button"
              title="Online Consultation"
              onClick={() =>
                navigate("/consultation/online-consultation-management")
              }
            >
              <FaClipboardList size={20} />
              {isSidebarOpen && <span>Online Consultation</span>}
            </button>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <button
              className="sidebar-action-button"
              title="Offline Consultation"
              onClick={() =>
                navigate("/consultation/offline-consultation-management")
              }
            >
              <FaHospital size={20} />
              {isSidebarOpen && <span>Offline Consultation</span>}
            </button>
          </motion.div>
          {currentConsultantData ? (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item consultant-profile-section"
              >
                <Link
                  to="/profile"
                  className="consultant-profile-info"
                  title={isSidebarOpen ? currentConsultantData.email : ""}
                >
                  <FaUser size={20} />
                  {isSidebarOpen && (
                    <span className="consultant-profile-email">
                      {currentConsultantData.email}
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
                >
                  <FaSignOutAlt size={20} />
                  {isSidebarOpen && <span>Sign out</span>}
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
                <FaSignOutAlt size={20} />
                {isSidebarOpen && <span>Sign out</span>}
              </Link>
            </motion.div>
          )}
        </motion.nav>
      </motion.aside>
      <div className="consultation-management-main-page">
        <div className="consultation-management">
          <div className="consultation-management-header">
            <h1 className="consultation-management-title">
              {/* <FaComments /> */}
              Patient Consultation
            </h1>
            {currentConsultantData && (
              <div className="consultation-management-consultant-info">
                <span>{currentConsultantData.userName}</span>
              </div>
            )}
          </div>

          <div className="consultation-management-content">
            {/* Sidebar - Patient list */}
            <div className="consultation-management-sidebar">
              <div className="consultation-management-sidebar-header">
                <h3>
                  Active Conversations ({Object.keys(chatThreads).length})
                </h3>

                <div className="consultation-management-search-section">
                  <div className="consultation-management-search-bar">
                    <FaSearch />
                    <input
                      type="text"
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* <div className="consultation-management-filter">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Chats</option>
                      <option value="unread">Unread</option>
                      <option value="active">Active (24h)</option>
                    </select>
                  </div> */}
                </div>
              </div>

              <div className="consultation-management-threads-list">
                {filteredThreads.length > 0 ? (
                  filteredThreads.map((thread) => (
                    <div
                      key={thread.patientUserId}
                      className={`consultation-management-thread-item ${
                        selectedThread?.patientUserId === thread.patientUserId
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleSelectThread(thread.patientUserId)}
                    >
                      <div className="consultation-management-thread-avatar">
                        <img
                          src={
                            thread.patient?.avatar?.fileUrl ||
                            "https://www.placeholderimage.online/placeholder/420/310/ffffff/ededed?text=image&font=Lato.png"
                          }
                          alt={thread.patient?.userName || "Patient"}
                        />
                        {thread.unreadCount > 0 && (
                          <div className="consultation-management-unread-badge">
                            {thread.unreadCount}
                          </div>
                        )}
                      </div>

                      <div className="consultation-management-thread-info">
                        <h4>{thread.patient?.userName || "Unknown Patient"}</h4>
                        <p className="consultation-management-last-message">
                          {thread.messages?.length > 0
                            ? thread.messages[thread.messages.length - 1]
                                .messageText || "Attachment"
                            : "No messages yet"}
                        </p>
                        <span className="consultation-management-thread-time">
                          {formatMessageTime(thread.lastActivity)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="consultation-management-empty-thread-list">
                    <FaComments />
                    <h3>No Conversations</h3>
                    <p>
                      {searchTerm || filterStatus !== "all"
                        ? "No conversations match your criteria."
                        : "You don't have any patient conversations yet."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Main chat area */}
            <div className="consultation-management-main">
              {selectedThread ? (
                <>
                  {/* Patient header */}
                  <div className="consultation-management-patient-header">
                    <div className="consultation-management-patient-details">
                      <div className="consultation-management-patient-avatar">
                        <img
                          src={
                            selectedThread.patient?.avatar?.fileUrl ||
                            "https://www.placeholderimage.online/placeholder/420/310/ffffff/ededed?text=image&font=Lato.png"
                          }
                          alt={selectedThread.patient?.userName || "Patient"}
                        />
                      </div>
                      <div className="consultation-management-patient-meta">
                        <h2>
                          {selectedThread.patient?.userName ||
                            "Unknown Patient"}
                        </h2>
                        <p>{selectedThread.patient?.email}</p>
                      </div>
                    </div>

                    <div className="consultation-management-actions">
                      {/* <button className="consultation-management-action-btn">
                      <FaPhone />
                      Call
                    </button>
                    <button className="consultation-management-action-btn">
                      <FaVideo />
                      Video
                    </button> */}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="consultation-management-messages">
                    {selectedThread.messages?.length > 0 ? (
                      selectedThread.messages.map((msg, idx) =>
                        renderMessage(msg, idx)
                      )
                    ) : (
                      <div className="consultation-management-empty-messages">
                        <FaComments />
                        <h3>Start the conversation</h3>
                        <p>Send a message to begin the consultation.</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input area */}
                  <div className="consultation-management-input-area">
                    <div className="consultation-management-input-container">
                      {selectedFile && (
                        <div className="consultation-management-file-preview">
                          <div className="consultation-management-file-preview-content">
                            {filePreview ? (
                              <img
                                src={filePreview}
                                alt="Preview"
                                className="consultation-management-file-preview-image"
                              />
                            ) : (
                              <div className="consultation-management-file-preview-document">
                                <FaFile />
                                <span>{selectedFile.name}</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={clearSelectedFile}
                              className="consultation-management-file-preview-remove"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="consultation-management-input-row">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept={allSupportedTypes.join(",")}
                          style={{ display: "none" }}
                        />

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="consultation-management-attachment-btn"
                          title="Attach file"
                        >
                          <FaPaperclip />
                        </button>

                        <textarea
                          placeholder="Type your response..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          rows={1}
                        />

                        <button
                          onClick={handleSendMessage}
                          disabled={
                            (!newMessage.trim() && !selectedFile) ||
                            sendingMessage
                          }
                          className="consultation-management-send-btn"
                        >
                          <HiPaperAirplane />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="consultation-management-no-selection">
                  <FaUser />
                  <h3>Select a Conversation</h3>
                  <p>
                    Choose a patient conversation from the list to view and
                    respond to messages.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationManagement;
