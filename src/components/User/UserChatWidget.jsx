import { useState, useEffect, useRef } from "react";
import { X, Send, MessageSquare, Loader, Clipboard } from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import { useUser } from "../../context/UserContext";
import api from "../../services/api";

const UserChatWidget = ({ isOpen, onClose, isDropdown = false }) => {
  const { user, token, triggerAuthModal } = useUser();
  const {
    messages,
    sendMessage,
    sendTypingStatus,
    isTyping,
    fetchHistory,
    markAsRead,
    setActiveChatUserId,
  } = useSocket();

  const [inputMessage, setInputMessage] = useState("");
  const [adminUser, setAdminUser] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get Admin profile details
  const fetchAdminDetails = async () => {
    try {
      const res = await api.get("/auth/all-users");
      const admin = res.data?.find((u) => u.role === "admin");
      if (admin) {
        setAdminUser(admin);
      }
    } catch (err) {
      console.error("Error fetching admin details:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    if (isOpen && token) {
      setLoadingHistory(true);
      fetchAdminDetails();
      
      // Look up admin user to fetch history
      api.get("/auth/all-users")
        .then((res) => {
          const admin = res.data?.find((u) => u.role === "admin");
          if (admin) {
            setAdminUser(admin);
            setActiveChatUserId(admin.id);
            fetchHistory(admin.id).finally(() => setLoadingHistory(false));
          } else {
            setLoadingHistory(false);
          }
        })
        .catch(() => setLoadingHistory(false));
    } else {
      setActiveChatUserId(null);
    }
  }, [isOpen, token]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !adminUser) return;

    sendMessage(adminUser.id, inputMessage.trim());
    setInputMessage("");

    // Clear typing status
    sendTypingStatus(adminUser.id, false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    if (!adminUser) return;

    // Send typing notification
    sendTypingStatus(adminUser.id, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(adminUser.id, false);
    }, 2000);
  };

  const handleSignInClick = () => {
    triggerAuthModal(() => {
      // Callback after successful login
      isOpen && fetchHistory("admin");
    }, "Please sign in to chat with our support team.");
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`${
        isDropdown 
          ? "absolute right-0 mt-2 w-96 h-[480px]" 
          : "fixed bottom-20 right-6 w-96 h-[520px]"
      } z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden select-none animate-in fade-in duration-200 ${
        isDropdown ? "slide-in-from-top-2 origin-top-right" : "slide-in-from-bottom-5 origin-bottom-right"
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-white/10 p-2 rounded-full border border-white/20">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide">Customer Support</h3>
            <p className="text-[10px] text-blue-100 flex items-center gap-1 font-semibold">
              Online • Ask us anything
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body / Message list */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3 min-h-0">
        {!token ? (
          // Guest Fallback
          <div className="my-auto text-center px-6 py-8 flex flex-col items-center justify-center gap-4">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-full border border-blue-100">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div>
              <h4 className="font-extrabold text-gray-800 text-sm">Need Help? Chat with Us!</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">
                Sign in to your account to send direct messages to our support team and see replies in real time.
              </p>
            </div>
            <button
              onClick={handleSignInClick}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              Sign In to Chat
            </button>
          </div>
        ) : loadingHistory ? (
          // Loading history state
          <div className="my-auto flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">Loading conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          // Empty State
          <div className="my-auto text-center px-6 py-8 flex flex-col items-center justify-center gap-2 text-gray-400">
            <p className="text-xs font-semibold text-gray-500">No messages yet.</p>
            <p className="text-[10px] text-gray-400 max-w-[180px]">
              Type a message below to start chatting with our Support Admin.
            </p>
          </div>
        ) : (
          // Messages Render
          <>
            {messages.map((m) => {
              const isMe = m.senderId === user?.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[75%] ${isMe ? "self-end items-end ml-auto" : "self-start items-start mr-auto"}`}
                >
                  <div
                    className={`px-3.5 py-2 rounded-2xl text-sm shadow-sm ${
                      isMe
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    <p className="break-words leading-relaxed whitespace-pre-wrap">{m.message}</p>
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 font-semibold px-1">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {isMe && (
                      <span className="ml-1 text-blue-600">
                        {m.isRead ? "• Read" : "• Sent"}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}

            {/* Other user typing indicator */}
            {isTyping && (
              <div className="self-start flex flex-col items-start max-w-[75%]">
                <div className="px-3.5 py-2.5 rounded-2xl bg-white border border-gray-100 text-gray-500 rounded-tl-none flex items-center gap-1.5 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">Admin typing</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      {token && adminUser && (
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center"
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={handleInputChange}
            className="flex-1 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm py-2 px-4 rounded-full transition-all focus:outline-none text-gray-800"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white p-2 rounded-full transition-colors disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
};

export default UserChatWidget;
