import React, { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { useNavigate, useLocation } from "react-router-dom";
import {
  startChatThread,
  sendMessage,
  getChatThreadByUserId,
  getChatThreadById,
} from "../../apis/message-api";
import { viewConsultantByUserId } from "../../apis/consultant-api";
import { getCurrentUser } from "../../apis/authentication-api";
import { getAllClinics } from "../../apis/clinic-api";
import MainLayout from "../../layouts/MainLayout";
import "./ConsultationChat.css";
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
} from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";
import { HiPaperAirplane } from "react-icons/hi2";
import LoadingOverlay from "../popup/LoadingOverlay";
import { useMessages } from "../../utils/useMessages";

const ConsultationChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const { connection, messages, addMessage } = useMessages();
  const {
    selectedConsultant: preSelectedConsultant,
    currentUserId: passedUserId,
  } = location.state || {};

  const [currentUserId, setCurrentUserId] = useState(passedUserId || "");
  const [loading, setLoading] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [consultants, setConsultants] = useState([]);
  const [chatThreads, setChatThreads] = useState({});
  const [selectedConsultant, setSelectedConsultant] = useState(
    preSelectedConsultant || null
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

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

  // Size formatter
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

  // Map mime/extension to icon
  const getFileIcon = (fileName, fileType) => {
    const name = (fileName || "").toLowerCase();
    const type = (fileType || "").toLowerCase();
    if (type.includes("pdf") || name.endsWith(".pdf")) return "pdf";
    if (
      type.includes("word") ||
      name.endsWith(".doc") ||
      name.endsWith(".docx")
    )
      return "doc";
    if (
      type.includes("excel") ||
      name.endsWith(".xls") ||
      name.endsWith(".xlsx")
    )
      return "xls";
    if (
      type.startsWith("text/") ||
      name.endsWith(".txt") ||
      name.endsWith(".log")
    )
      return "txt";
    return "file";
  };

  // Supported file extensions
  const supportedImageTypes = [".jpg", ".jpeg", ".png"];
  const supportedDocTypes = [".docx", ".xls", ".xlsx", ".pdf"];
  const allSupportedTypes = [...supportedImageTypes, ...supportedDocTypes];

  useEffect(() => {
    console.log("=== DEBUG: chatThreads ===", chatThreads);
  }, [chatThreads]);

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      let userId = passedUserId;
      if (!userId) {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/signin");
          return;
        }
        const userRes = await getCurrentUser(token);
        userId =
          userRes?.data?.data?.id || userRes?.data?.id || userRes?.id || "";
        if (!userId) {
          navigate("/signin");
          return;
        }
      }
      setCurrentUserId(userId);

      await loadAllConsultants();
      await loadExistingThreads(userId);
    } catch (error) {
      console.error("Failed to initialize consultation chat:", error);
      navigate("/signin");
    } finally {
      setLoading(false);
    }
  };

  const loadExistingThreads = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      console.log("Loading threads for userId:", userId);
      const threadsResponse = await getChatThreadByUserId(userId, token);

      console.log("API response:", threadsResponse);

      // Handle different response structures
      let threads = [];

      if (Array.isArray(threadsResponse)) {
        threads = threadsResponse;
      } else if (threadsResponse?.data && Array.isArray(threadsResponse.data)) {
        threads = threadsResponse.data;
      } else if (threadsResponse?.id && threadsResponse?.consultantId) {
        threads = [threadsResponse];
      }

      console.log("Number of threads:", threads.length);

      if (threads.length > 0) {
        const threadsMap = {};

        for (const thread of threads) {
          const consultantId = thread.consultantId;
          console.log("Processing thread for consultantId:", consultantId);

          if (!consultantId) continue;

          try {
            const consultantRes = await viewConsultantByUserId(
              consultantId,
              token
            );
            console.log(
              `Consultant response for ${consultantId}:`,
              consultantRes
            );

            const consultantData = consultantRes?.data || null;

            // Process messages to include attachment data
            const processedMessages =
              thread.messages?.map((msg) => {
                // Handle existing attachment data
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

                // Handle media array - ADD THIS PART
                if (
                  msg.media &&
                  Array.isArray(msg.media) &&
                  msg.media.length > 0
                ) {
                  const firstMedia = msg.media[0];
                  return {
                    ...msg,
                    attachment: {
                      fileName: firstMedia.fileName || "Attachment",
                      fileSize: firstMedia.fileSize,
                      fileType: firstMedia.fileType,
                      isImage: isImageFile(firstMedia.fileName || ""),
                      url: firstMedia.fileUrl || firstMedia.url,
                    },
                  };
                }

                return msg;
              }) || [];

            threadsMap[consultantId] = {
              thread,
              messages: processedMessages,
              consultant: consultantData,
            };
          } catch (err) {
            console.error(`Failed to fetch consultant ${consultantId}:`, err);
          }
        }

        setChatThreads(threadsMap);
      }
    } catch (error) {
      console.error("Failed to load existing threads:", error);
    }
  };

  const loadAllConsultants = async () => {
    try {
      const clinicsData = await getAllClinics();
      const allClinics = clinicsData.data || clinicsData;

      const allConsultants = [];
      allClinics.forEach((clinic) => {
        if (clinic.consultants && clinic.consultants.length > 0) {
          clinic.consultants.forEach((consultant) => {
            allConsultants.push({
              ...consultant,
              clinic: {
                id: clinic.id,
                name: clinic.user?.userName || clinic.name,
                address: clinic.address,
              },
            });
          });
        }
      });

      setConsultants(allConsultants);
    } catch (error) {
      console.error("Failed to load consultants:", error);
    }
  };

  const handleSelectConsultant = async (consultant) => {
    const consultantId = consultant.user.id;
    setSelectedConsultant(consultant);

    if (chatThreads[consultantId]) {
      return;
    }

    setChatThreads((prevThreads) => ({
      ...prevThreads,
      [consultantId]: { thread: null, messages: [], consultant: consultant },
    }));

    setNewMessage("");
  };

  const handleStartChat = async () => {
    if (!selectedConsultant) return;

    const consultantId = selectedConsultant.user.id;
    if (chatThreads[consultantId]?.thread) {
      return;
    }

    try {
      setStartingChat(true);
      const token = localStorage.getItem("token");

      const threadData = { userId: currentUserId, consultantId };
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
        [consultantId]: {
          thread: threadWithMessages?.data || {
            id: threadId,
            consultantId,
            userId: currentUserId,
          },
          messages: threadWithMessages?.data?.messages || [],
          consultant: selectedConsultant,
        },
      }));
    } catch (error) {
      console.error("Failed to start chat thread:", error);
    } finally {
      setStartingChat(false);
    }
  };

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

  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const extension = "." + fileName.toLowerCase().split(".").pop();
    return supportedImageTypes.includes(extension);
  };

  const refreshCurrentThread = async () => {
    if (!selectedConsultant?.user?.id) return;
    const consultantId = selectedConsultant.user.id;
    const token = localStorage.getItem("token");
    const threadsResponse = await getChatThreadByUserId(currentUserId, token);
    let threads = [];
    if (Array.isArray(threadsResponse)) threads = threadsResponse;
    else if (threadsResponse?.data && Array.isArray(threadsResponse.data))
      threads = threadsResponse.data;
    const active = threads.find((t) => t.consultantId === consultantId);
    if (active) {
      setChatThreads((prev) => ({
        ...prev,
        [consultantId]: {
          ...(prev[consultantId] || {}),
          thread: active,
          messages: active.messages || [],
          consultant: (prev[consultantId] || {}).consultant,
        },
      }));
    }
  };

  // Enhanced send message function with file support
  const handleSendMessage = async () => {
    if (
      !connection ||
      connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.error("SignalR connection not established");
      alert("Connection lost. Please refresh the page.");
      return;
    }
    const consultantId = selectedConsultant?.user?.id;
    const activeThread =
      consultantId && chatThreads[consultantId]
        ? chatThreads[consultantId].thread
        : null;

    if (
      (!newMessage.trim() && !selectedFile) ||
      !activeThread ||
      sendingMessage
    )
      return;
    // if (!selectedFile) {
    //   alert("Please attach a file to send");
    //   return;
    // }

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
        // Also append metadata to help backend process
        formData.append("AttachmentFileName", selectedFile.name);
        formData.append("AttachmentFileType", selectedFile.type);
        formData.append("AttachmentFileSize", selectedFile.size.toString());
      }

      const response = await sendMessage(formData, token);
      console.log("Send message response:", response);

      if (response.error === 0) {
        // Extract attachment URL from response
        const attachmentUrl =
          response.data?.attachmentUrl ||
          response.data?.attachmentPath ||
          response.data?.attachment?.url;

        const newMsg = {
          id: response.data?.id || Date.now().toString(),
          senderId: currentUserId,
          receiverId: consultantId,
          messageText: newMessage.trim() || "",
          createdAt: response.data?.sentAt || new Date().toISOString(),
          messageType: selectedFile ? "attachment" : "text",
          isRead: false,
          // Store attachment data from backend response
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
                // Use backend URL if available, otherwise use local preview temporarily
                url: attachmentUrl || filePreview,
              }
            : null,
        };

        setChatThreads((prevThreads) => ({
          ...prevThreads,
          [consultantId]: {
            ...prevThreads[consultantId],
            messages: [...(prevThreads[consultantId]?.messages || []), newMsg],
          },
        }));

        setNewMessage("");
        clearSelectedFile();

        // Optionally refresh the thread to get the latest data from backend
        // This ensures the attachment URL is properly stored
        setTimeout(async () => {
          try {
            const updatedThread = await getChatThreadById(
              activeThread.id,
              token
            );
            if (updatedThread?.data?.messages) {
              const processedMessages = updatedThread.data.messages.map(
                (msg) => {
                  if (
                    msg.attachmentUrl ||
                    msg.attachmentPath ||
                    msg.attachment
                  ) {
                    return {
                      ...msg,
                      attachment: {
                        fileName:
                          msg.attachmentFileName ||
                          msg.fileName ||
                          "Attachment",
                        fileSize: msg.attachmentFileSize || msg.fileSize,
                        fileType: msg.attachmentFileType || msg.fileType,
                        isImage: isImageFile(
                          msg.attachmentFileName || msg.fileName || ""
                        ),
                        url:
                          msg.attachmentUrl ||
                          msg.attachmentPath ||
                          msg.attachment?.url,
                      },
                    };
                  }
                  return msg;
                }
              );

              setChatThreads((prevThreads) => ({
                ...prevThreads,
                [consultantId]: {
                  ...prevThreads[consultantId],
                  messages: processedMessages,
                },
              }));
              scrollToBottom();
            }
          } catch (error) {
            console.error("Error refreshing thread:", error);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  // Enhanced message rendering
  const renderMessage = (msg, idx) => {
    const isSent = msg.senderId === currentUserId;
    const messageClass = isSent ? "sent" : "received";
    const media = Array.isArray(msg.media) ? msg.media : [];
    const hasAttachment = msg.attachment;

    // Prioritize attachment object over media array to prevent duplicates
    const shouldRenderMedia = !hasAttachment && media.length > 0;

    return (
      <div key={idx} className={`consultation-chat-message ${messageClass}`}>
        <div className="consultation-chat-message-content">
          {(msg.messageText || msg.message) && (
            <p>{msg.messageText || msg.message}</p>
          )}

          {/* Handle attachment object (priority) */}
          {hasAttachment &&
            (msg.attachment.isImage ? (
              <img
                src={msg.attachment.url}
                alt={msg.attachment.fileName}
                className="consultation-chat-attachment-image"
                onClick={() => window.open(msg.attachment.url, "_blank")}
              />
            ) : (
              <div className="consultation-chat-attachment-document">
                <a
                  href={msg.attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="consultation-chat-attachment-link"
                >
                  <div className="consultation-chat-attachment-info">
                    <FaFileAlt className="consultation-chat-document-file-icon" />
                    <div className="consultation-chat-attachment-details">
                      <span className="consultation-chat-attachment-name">
                        {msg.attachment.fileName}
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
                  className="consultation-chat-attachment-image"
                  onClick={() => window.open(url, "_blank")}
                />
              ) : (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="consultation-chat-attachment-document"
                >
                  <FaFileAlt className="consultation-chat-document-file-icon" />
                  <span className="consultation-chat-attachment-name">
                    {m.fileName} - Download file
                  </span>
                </a>
              );
            })}

          <span
            className="consultation-chat-message-time"
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
    // console.log("timestamp", timestamp);
    if (!timestamp) return "";

    try {
      let utcDate;

      // Handle different timestamp formats
      if (typeof timestamp === "string") {
        // If string doesn't end with 'Z', assume it's UTC and add 'Z'
        // if (
        //   !timestamp.endsWith("Z") &&
        //   !timestamp.includes("+") &&
        //   !timestamp.includes("-")
        // ) {
        if (!timestamp.endsWith("Z")) {
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
      // console.log("log utcDate", utcDate);

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

  let filteredConsultants = [];

  if (preSelectedConsultant) {
    filteredConsultants = consultants.filter(
      (consultant) => consultant.user.id === preSelectedConsultant.user.id
    );
  } else {
    const consultantsWithThreads = consultants.filter((c) => {
      const consultantId = c.user?.id || c.id;
      return chatThreads[consultantId];
    });

    const searchFilter = (consultant) => {
      if (!searchTerm) return true;
      return (
        consultant.user.userName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        consultant.clinic.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    };
    filteredConsultants = consultantsWithThreads.filter(searchFilter);
  }

  const activeThread =
    selectedConsultant && chatThreads[selectedConsultant.user.id]
      ? chatThreads[selectedConsultant.user.id].thread
      : null;

  const activeMessages =
    selectedConsultant && chatThreads[selectedConsultant.user.id]
      ? chatThreads[selectedConsultant.user.id].messages
      : [];

  const consultantProfile =
    selectedConsultant && chatThreads[selectedConsultant.user.id]
      ? chatThreads[selectedConsultant.user.id].consultant
      : null;

  useEffect(() => {
    if (connection && activeThread?.id) {
      connection
        .invoke("JoinThread", activeThread.id)
        .catch((err) => console.error("JoinThread failed:", err));
    }
  }, [connection, activeThread]);

  //handle message in realtime
  // Add a ref to track processed message IDs for ConsultationChat
  const processedMessageIds = useRef(new Set());

  // Updated useEffect for handling incoming messages
  useEffect(() => {
    if (messages.length === 0) return;

    const latest = messages[messages.length - 1];
    console.log("Processing incoming message in ConsultationChat:", latest);

    // *** ADD EARLY DUPLICATE CHECK ***
    if (!latest.id || processedMessageIds.current.has(latest.id)) {
      console.log("Message already processed, skipping:", latest.id);
      return;
    }

    // Mark message as processed immediately
    processedMessageIds.current.add(latest.id);

    if (selectedConsultant?.user?.id) {
      const consultantId = selectedConsultant.user.id;

      setChatThreads((prev) => {
        const existingMessages = prev[consultantId]?.messages || [];

        // Secondary check at state level
        const messageExists = existingMessages.some((m) => m.id === latest.id);
        if (messageExists) {
          console.log("Message already exists in thread, skipping:", latest.id);
          return prev;
        }

        console.log(
          "Adding new message to thread for consultant:",
          consultantId
        );

        // Process the message for attachments
        // In the useEffect that handles incoming messages, update the message processing:
        const processedMessage = {
          ...latest,
          // this somehow fix duplicate real-time mesage
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
            isImage: isImageFile(firstMedia.fileName || ""),
            url: firstMedia.fileUrl || firstMedia.url,
          };
        }

        return {
          ...prev,
          [consultantId]: {
            ...prev[consultantId],
            messages: [...existingMessages, processedMessage],
          },
        };
      });

      // Auto scroll
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages, selectedConsultant?.user?.id, currentUserId]);

  // Add cleanup for processed message IDs
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (processedMessageIds.current.size > 1000) {
        console.log("Cleaning up processed message IDs");
        processedMessageIds.current.clear();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(cleanup);
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <LoadingOverlay show={loading} />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="consultation-chat">
        <div className="consultation-chat-content">
          {/* Sidebar */}
          <div className="consultation-chat-sidebar">
            <div className="consultation-chat-sidebar-header">
              <h3>Available Consultants</h3>
            </div>

            {!preSelectedConsultant && (
              <div className="consultation-chat-search-section">
                <div className="consultation-chat-search-bar">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search consultants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="consultation-chat-consultants-list">
              {filteredConsultants.length > 0 ? (
                filteredConsultants.map((consultant) => {
                  const profile =
                    chatThreads[consultant.user.id]?.consultant || consultant;
                  return (
                    <div
                      key={consultant.user.id}
                      className={`consultation-chat-consultant-item ${
                        selectedConsultant?.user.id === consultant.user.id
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleSelectConsultant(consultant)}
                    >
                      <div className="consultation-chat-consultant-avatar">
                        <img
                          src={
                            profile?.user?.avatar?.fileUrl ||
                            "https://www.placeholderimage.online/placeholder/420/310/ffffff/ededed?text=image&font=Lato.png"
                          }
                          alt={profile?.user?.userName}
                        />
                      </div>

                      <div className="consultation-chat-consultant-info">
                        <h4>{profile?.user?.userName}</h4>
                        <p className="consultation-chat-specialization">
                          {profile?.specialization}
                        </p>
                        <div className="consultation-chat-consultant-clinic">
                          <FaHospital />
                          <span>
                            {profile?.clinic?.user?.userName ||
                              profile?.clinic?.name}
                          </span>
                        </div>
                      </div>

                      {chatThreads[consultant.user.id] && (
                        <div
                          className="consultation-chat-status-indicator active"
                          title="You have an ongoing conversation"
                        />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="consultation-chat-empty-thread-list">
                  <FaComments />
                  <h3>No Chat History</h3>
                  <p>
                    {searchTerm
                      ? "No consultants match your search criteria."
                      : "You haven't started any consultations yet. Visit a clinic's page and click 'Start Consultation' with a consultant to begin."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main chat */}
          <div className="consultation-chat-main">
            {selectedConsultant ? (
              <>
                <div className="consultation-chat-consultant-header">
                  <div className="consultation-chat-consultant-details">
                    <div className="consultation-chat-consultant-avatar-large">
                      <img
                        src={
                          consultantProfile?.user?.avatar?.fileUrl ||
                          "https://www.placeholderimage.online/placeholder/420/310/ffffff/ededed?text=image&font=Lato.png"
                        }
                        alt={consultantProfile?.user?.userName}
                      />
                    </div>
                    <div className="consultation-chat-consultant-meta">
                      <h2>{consultantProfile?.user?.userName}</h2>
                      <p>{consultantProfile?.specialization}</p>
                      <div className="consultation-chat-clinic-info">
                        <FaHospital />
                        <span>
                          {consultantProfile?.clinic?.user?.userName ||
                            consultantProfile?.clinic?.name}
                        </span>
                      </div>
                      <p>{consultantProfile?.clinic?.address}</p>
                    </div>
                  </div>

                  <div className="consultation-chat-actions">
                    {!activeThread ? (
                      <button
                        className="consultation-chat-start-btn"
                        onClick={handleStartChat}
                        disabled={startingChat}
                      >
                        {startingChat
                          ? "Starting Chat..."
                          : "Start Consultation"}
                      </button>
                    ) : (
                      <div className="consultation-chat-call-actions">
                        {/* Voice/Video call buttons can be added here */}
                      </div>
                    )}
                  </div>
                </div>

                {activeThread ? (
                  <>
                    <div className="consultation-chat-messages">
                      {activeMessages.length === 0 ? (
                        <div className="consultation-chat-empty-messages">
                          <FaComments />
                          <h3>Start your conversation</h3>
                          <p>
                            Send a message to begin your consultation with{" "}
                            {consultantProfile?.user?.userName}
                          </p>
                        </div>
                      ) : (
                        activeMessages.map((msg, idx) =>
                          renderMessage(msg, idx)
                        )
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="consultation-chat-input-area">
                      <div className="consultation-chat-input-container">
                        {/* File preview section - now inside input container */}
                        {selectedFile && (
                          <div className="consultation-chat-file-preview">
                            <div className="consultation-chat-file-preview-content">
                              {filePreview ? (
                                <img
                                  src={filePreview}
                                  alt="Preview"
                                  className="consultation-chat-file-preview-image"
                                />
                              ) : (
                                <div className="consultation-chat-file-preview-document">
                                  <FaFile />
                                  <span>{selectedFile.name}</span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={clearSelectedFile}
                                className="consultation-chat-file-preview-remove"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Input row with controls */}
                        <div className="consultation-chat-input-row">
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
                            className="consultation-chat-attachment-btn"
                            title="Attach file"
                          >
                            <FaPaperclip />
                          </button>
                          <textarea
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={
                              (!newMessage.trim() && !selectedFile) ||
                              sendingMessage
                            }
                            className="consultation-chat-send-btn"
                          >
                            <HiPaperAirplane />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="consultation-chat-no-thread">
                    <FaUser />
                    <h3>No Active Thread</h3>
                    <p>
                      Start a consultation to begin messaging this consultant.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="consultation-chat-no-selection">
                <FaUser />
                <h3>Select a Consultant</h3>
                <p>
                  Choose a consultant from the list to view or start a
                  consultation chat.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ConsultationChat;
