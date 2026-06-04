import { useState, useEffect, useRef } from "react";
import { X, Send, ArrowLeft, MessageSquare, ChevronRight, Loader, UserCircle } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { CATEGORY_API } from "../repo/Apis";

const AdminChatDrawer = ({ isOpen, onClose }) => {
  const {
    conversations,
    messages,
    activeChatUserId,
    setActiveChatUserId,
    isTyping,
    fetchConversations,
    fetchHistory,
    sendMessage,
    sendTypingStatus,
    markAsRead,
  } = useSocket();

  const [inputMessage, setInputMessage] = useState("");
  const [activeUser, setActiveUser] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeChatUserId) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const handleUserSelect = (convo) => {
    setActiveUser(convo.user);
    setActiveChatUserId(convo.user.id);
    setLoadingHistory(true);
    fetchHistory(convo.user.id).finally(() => setLoadingHistory(false));
  };

  const handleBack = () => {
    setActiveChatUserId(null);
    setActiveUser(null);
    fetchConversations();
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeUser) return;

    sendMessage(activeUser.id, inputMessage.trim());
    setInputMessage("");

    // Clear typing status
    sendTypingStatus(activeUser.id, false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    if (!activeUser) return;

    // Send typing notification
    sendTypingStatus(activeUser.id, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(activeUser.id, false);
    }, 2000);
  };

  const getUserImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `${CATEGORY_API}${image.startsWith("/") ? image : `/${image}`}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 animate-fade-in"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-[420px] bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-350 select-none">
        
        {/* Active Chat Mode */}
        {activeUser ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="p-1.5 hover:bg-gray-50 rounded-full text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2.5">
                  {activeUser.image ? (
                    <img
                      src={getUserImageUrl(activeUser.image)}
                      alt={activeUser.username}
                      className="w-9 h-9 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <UserCircle className="w-9 h-9 text-gray-400" />
                  )}
                  <div>
                    <h3 className="font-bold text-sm text-gray-800 tracking-wide">
                      {activeUser.username}
                    </h3>
                    <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      Support Session Active
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-50 rounded-full text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3 min-h-0">
              {loadingHistory ? (
                <div className="my-auto flex flex-col items-center justify-center gap-2 text-gray-400">
                  <Loader className="h-6 w-6 animate-spin text-indigo-600" />
                  <span className="text-xs font-semibold">Loading history...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="my-auto text-center text-gray-400 text-xs">
                  No messages yet. Send a message to start.
                </div>
              ) : (
                <>
                  {messages.map((m) => {
                    const isMe = m.senderId !== activeUser.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col max-w-[75%] ${isMe ? "self-end items-end ml-auto" : "self-start items-start mr-auto"}`}
                      >
                        <div
                          className={`px-3.5 py-2 rounded-2xl text-sm shadow-xs ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-tr-none"
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
                            <span className="ml-1 text-indigo-600">
                              {m.isRead ? "• Read" : "• Sent"}
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                  
                  {isTyping && (
                    <div className="self-start flex flex-col items-start max-w-[75%]">
                      <div className="px-3.5 py-2.5 rounded-2xl bg-white border border-gray-100 text-gray-500 rounded-tl-none flex items-center gap-1.5 shadow-sm">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">User typing</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center"
            >
              <input
                type="text"
                placeholder="Type reply..."
                value={inputMessage}
                onChange={handleInputChange}
                className="flex-1 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm py-2 px-4 rounded-full transition-all focus:outline-none text-gray-800"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white p-2 rounded-full transition-colors disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          /* List Mode */
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                <h2 className="font-extrabold text-base text-gray-800 tracking-wide">
                  Recent Messages
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-50 rounded-full text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50/30">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                  <MessageSquare className="h-10 w-10 text-gray-300" />
                  <p className="text-xs font-semibold">No conversations yet</p>
                  <p className="text-[10px] text-gray-400">
                    User chats will show up here when they message.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {conversations.map((convo) => (
                    <div
                      key={convo.user.id}
                      onClick={() => handleUserSelect(convo)}
                      className="flex items-center justify-between p-4 hover:bg-white transition-all cursor-pointer border-l-4 border-transparent hover:border-indigo-600"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {convo.user.image ? (
                          <img
                            src={getUserImageUrl(convo.user.image)}
                            alt={convo.user.username}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <UserCircle className="w-10 h-10 text-gray-300 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-gray-800 truncate">
                              {convo.user.username}
                            </span>
                            <span className="text-[9px] text-gray-400 font-semibold shrink-0">
                              {new Date(convo.lastMessageAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              {new Date(convo.lastMessageAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1 truncate max-w-[240px]">
                            {convo.lastMessage}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        {convo.unreadCount > 0 && (
                          <span className="bg-indigo-600 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {convo.unreadCount}
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminChatDrawer;
