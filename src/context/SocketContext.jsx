import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useUser } from "./UserContext";
import api from "../services/api";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const SocketProvider = ({ children }) => {
  const { token, user } = useUser();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeChatUserId, setActiveChatUserId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const activeChatUserIdRef = useRef(activeChatUserId);

  useEffect(() => {
    activeChatUserIdRef.current = activeChatUserId;
  }, [activeChatUserId]);

  // Fetch active conversations list (Admin only)
  const fetchConversations = async () => {
    if (!token || user?.role !== "admin") return;
    try {
      const res = await api.get("/chat/conversations");
      setConversations(res.data || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  // Fetch chat history between current user and selected user
  const fetchHistory = async (targetUserId) => {
    if (!token) return;
    try {
      const res = await api.get(`/chat/history/${targetUserId}`);
      setMessages(res.data || []);
      // If there are unread messages, we should mark them as read
      markAsRead(targetUserId);
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }
  };

  // Mark messages from target user as read
  const markAsRead = async (targetUserId) => {
    if (!token) return;
    try {
      await api.post(`/chat/read/${targetUserId}`);
      
      // Update local unread counts in conversations list
      if (user?.role === "admin") {
        setConversations((prev) =>
          prev.map((c) =>
            c.user.id === targetUserId ? { ...c, unreadCount: 0 } : c
          )
        );
      } else {
        setUnreadCount(0);
      }

      // Emit read status to socket
      if (socket) {
        socket.emit("read_messages", { senderId: targetUserId });
      }
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  // Calculate unread count for user or admin
  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      if (user?.role === "admin") {
        // Admin's unread count is sum of unread counts in all conversations
        const res = await api.get("/chat/conversations");
        const list = res.data || [];
        const sum = list.reduce((acc, curr) => acc + curr.unreadCount, 0);
        setUnreadCount(sum);
      } else {
        // For regular user, fetch history and see if there are unread messages from admin
        const res = await api.get("/chat/history/admin");
        const list = res.data || [];
        const unread = list.filter(
          (m) => m.senderId !== user.id && !m.isRead
        ).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUnreadCount();
      if (user?.role === "admin") {
        fetchConversations();
      }
    } else {
      setUnreadCount(0);
      setConversations([]);
      setMessages([]);
    }
  }, [token, user]);

  // Connect / Disconnect socket based on auth token
  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketConn = io(SOCKET_SERVER_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketConn.on("connect", () => {
      console.log("Connected to Chat Socket");
    });

    // Listen for new messages
    socketConn.on("new_message", (message) => {
      const activeId = activeChatUserIdRef.current;
      const isSenderMe = message.senderId === user?.id;
      const isPartnerActive =
        message.senderId === activeId || message.receiverId === activeId;

      if (isPartnerActive) {
        setMessages((prev) => [...prev, message]);
        // If we are currently viewing the chat with the sender, mark it as read immediately
        if (!isSenderMe) {
          markAsRead(message.senderId);
        }
      } else {
        // Increment unread count globally if it's not our active chat
        if (!isSenderMe) {
          setUnreadCount((prev) => prev + 1);
        }
      }

      // Update conversations list for admin
      if (user?.role === "admin") {
        setConversations((prev) => {
          const partnerId = isSenderMe ? message.receiverId : message.senderId;
          const partnerUser = isSenderMe ? message.receiver : message.sender;

          const existingIdx = prev.findIndex((c) => c.user.id === partnerId);
          const updatedConversations = [...prev];

          const isUnread = !isSenderMe && partnerId !== activeId;

          if (existingIdx > -1) {
            // Update existing conversation
            updatedConversations[existingIdx] = {
              ...updatedConversations[existingIdx],
              lastMessage: message.message,
              lastMessageAt: message.createdAt,
              unreadCount: isUnread
                ? updatedConversations[existingIdx].unreadCount + 1
                : updatedConversations[existingIdx].unreadCount,
            };
          } else {
            // Add new conversation to list
            updatedConversations.push({
              user: partnerUser,
              lastMessage: message.message,
              lastMessageAt: message.createdAt,
              unreadCount: isUnread ? 1 : 0,
            });
          }

          // Sort by last message date descending
          return updatedConversations.sort(
            (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
          );
        });
      }
    });

    // Listen to typing events
    socketConn.on("typing_status", (data) => {
      if (data.senderId === activeChatUserIdRef.current) {
        setIsTyping(data.isTyping);
      }
    });

    // Listen for messages read notification
    socketConn.on("messages_read", (data) => {
      if (data.readerId === activeChatUserIdRef.current) {
        setMessages((prev) =>
          prev.map((m) => (m.receiverId === data.readerId ? { ...m, isRead: true } : m))
        );
      }
    });

    setSocket(socketConn);

    return () => {
      socketConn.disconnect();
    };
  }, [token]);

  // Send message
  const sendMessage = (receiverId, messageText) => {
    if (!socket) return;
    socket.emit("send_message", { receiverId, message: messageText }, (response) => {
      if (response && response.status === "ok") {
        // Local state gets updated through the "new_message" broadcast to sender's room
      } else {
        console.error("Failed to send message via socket callback:", response);
      }
    });
  };

  // Emit typing indicator
  const sendTypingStatus = (receiverId, typingState) => {
    if (!socket) return;
    socket.emit("typing", { receiverId, isTyping: typingState });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        messages,
        conversations,
        activeChatUserId,
        setActiveChatUserId,
        isTyping,
        unreadCount,
        fetchConversations,
        fetchHistory,
        sendMessage,
        sendTypingStatus,
        markAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
