"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuthStore } from "@/lib/store";
import { chatWithAiAction } from "@/app/actions";
import { X, PaperPlaneRight, Sparkle, MagicWand, Plus, ClockCounterClockwise } from "@phosphor-icons/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AiSidebar() {
  const { 
    isAiSidebarOpen, toggleAiSidebar, chatHistory, setChatHistory, 
    session, user, aiSidebarWidth, setAiSidebarWidth,
    clearChat, saveCurrentChat, savedChats, loadChat
  } = useAuthStore();
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  
  const [resolvedToken, setResolvedToken] = useState(null);

  useEffect(() => {
    async function initToken() {
      if (session?.providerAccessToken) {
        setResolvedToken(session.providerAccessToken);
      } else if (user) {
        const { checkComposioStatus, getComposioAccessToken } = await import("@/app/composioActions");
        const status = await checkComposioStatus(user.$id);
        if (status.connected) {
          const compData = await getComposioAccessToken(user.$id);
          if (compData.connectionId) {
            setResolvedToken(compData.connectionId);
          }
        }
      }
    }
    initToken();
  }, [session, user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleAiSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleAiSidebar]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isAiSidebarOpen]);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = aiSidebarWidth;

    const handleMouseMove = (moveEvent) => {
      const deltaX = startX - moveEvent.clientX;
      const newWidth = Math.max(280, Math.min(600, startWidth + deltaX));
      setAiSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = 'default';
    };

    document.body.style.cursor = 'col-resize';
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [aiSidebarWidth, setAiSidebarWidth]);

  if (!isAiSidebarOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      let context = "";
      if (user?.prefs) {
        context = `Job Title: ${user.prefs.jobName || 'Unknown'}, Company: ${user.prefs.company || 'Unknown'}`;
      }
      
      const responseContent = await chatWithAiAction(newHistory, resolvedToken, context);
      setChatHistory([...newHistory, { role: "assistant", content: responseContent }]);
    } catch (error) {
      setChatHistory([...newHistory, { role: "assistant", content: "Sorry, I encountered an error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    if (chatHistory.length > 0) {
      saveCurrentChat();
    } else {
      clearChat();
    }
    setShowHistory(false);
  };

  return (
    <div 
      className="border border-[#dddcdc] bg-[#eceae6] flex flex-col shadow-sm rounded-2xl m-2 relative z-20 transition-transform duration-300 flex-shrink-0"
      style={{ width: `${aiSidebarWidth}px` }}
    >
      {/* Resizer Handle */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#2b323b]/10 transition-colors rounded-l-2xl z-30"
        onMouseDown={startResizing}
      />

      <div className="h-14 border-b border-[#dddcdc] flex items-center justify-between px-4 sticky top-0 bg-[#eceae6]/90 backdrop-blur-sm z-10 rounded-t-2xl">
        <div className="flex items-center gap-2 text-[#2b323b] font-medium">
          <Sparkle size={18} className="text-[#2b323b]" weight="fill" />
          Vela Agent
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-1.5 text-gray-500 hover:text-[#2b323b] transition rounded-md hover:bg-[#2b323b]/5"
            title="Chat History"
          >
            <ClockCounterClockwise size={16} weight="bold" />
          </button>
          <button 
            onClick={handleNewChat}
            className="p-1.5 text-gray-500 hover:text-[#2b323b] transition rounded-md hover:bg-[#2b323b]/5"
            title="New Chat"
          >
            <Plus size={16} weight="bold" />
          </button>
          <button 
            onClick={toggleAiSidebar}
            className="p-1.5 text-gray-500 hover:text-[#2b323b] transition rounded-md hover:bg-[#2b323b]/5 ml-1"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
      </div>

      {showHistory ? (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Saved Chats</h3>
          {savedChats.length === 0 ? (
            <div className="text-sm text-gray-500 text-center mt-4">No saved chats yet.</div>
          ) : (
            savedChats.map((chat) => (
              <button 
                key={chat.id}
                onClick={() => {
                  if (chatHistory.length > 0) saveCurrentChat();
                  loadChat(chat.id);
                  setShowHistory(false);
                }}
                className="text-left bg-white p-3 rounded-xl shadow-sm text-sm text-gray-800 hover:bg-gray-50 transition border border-gray-100 truncate"
              >
                {chat.title}
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <MagicWand size={48} className="mb-4 text-gray-400" weight="duotone" />
              <p className="text-sm px-4">I'm your Vela Agent. I can help you search your inbox and find insights.</p>
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-[#2b323b] text-white rounded-tr-sm" 
                      : "bg-white text-[#2b323b] rounded-tl-sm shadow-sm prose prose-sm prose-gray max-w-none"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {!showHistory && (
        <div className="p-4 bg-[#eceae6] rounded-b-2xl z-10 relative">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="w-full bg-white text-[14px] text-[#2b323b] placeholder-gray-500 rounded-full pl-4 pr-10 py-2.5 outline-none shadow-sm transition"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-1.5 p-1.5 bg-[#2b323b] hover:bg-[#2b323b] text-white rounded-full transition disabled:opacity-50 disabled:hover:bg-[#2b323b]"
            >
              <PaperPlaneRight size={14} weight="fill" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
