"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/lib/store";
import { chatWithAiAction } from "@/app/actions";
import { X, PaperPlaneRight, Sparkle, MagicWand } from "@phosphor-icons/react";

export default function AiSidebar() {
  const { isAiSidebarOpen, toggleAiSidebar, chatHistory, setChatHistory, session, user } = useAuthStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <div className="w-80 border border-[#e4e3e0] bg-[#eeeae6] flex flex-col shadow-sm rounded-2xl m-2 relative z-20 transition-all duration-300">
      <div className="h-14 border-b border-[#e4e3e0] flex items-center justify-between px-4 sticky top-0 bg-[#eeeae6]/90 backdrop-blur-sm z-10 rounded-t-2xl">
        <div className="flex items-center gap-2 text-gray-900 font-medium">
          <Sparkle size={18} className="text-gray-900" weight="fill" />
          Vela Agent
        </div>
        <button 
          onClick={toggleAiSidebar}
          className="p-1.5 text-gray-500 hover:text-gray-900 transition rounded-md hover:bg-black/5"
        >
          <X size={16} weight="bold" />
        </button>
      </div>

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
                    ? "bg-black text-white rounded-tr-sm" 
                    : "bg-white text-gray-900 rounded-tl-sm shadow-sm"
                }`}
              >
                {msg.content}
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

      <div className="p-4 bg-[#eeeae6] rounded-b-2xl">
        <div className="relative flex items-center">
          <input 
            type="text" 
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="w-full bg-white text-[14px] text-gray-900 placeholder-gray-500 rounded-full pl-4 pr-10 py-2.5 outline-none shadow-sm transition"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 p-1.5 bg-gray-900 hover:bg-black text-white rounded-full transition disabled:opacity-50 disabled:hover:bg-gray-900"
          >
            <PaperPlaneRight size={14} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}
