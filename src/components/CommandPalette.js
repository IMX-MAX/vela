"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { chatWithAiAction } from "@/app/actions";
import { ArrowLeft, MagnifyingGlass, Sparkle, Envelope, ArrowRight, Gear, Tray, Star, PaperPlaneRight, FileText, CheckCircle, WarningOctagon, Trash, PencilSimple, Prohibit } from "@phosphor-icons/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

export default function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    session, user, 
    isCommandPaletteOpen, toggleCommandPalette, closeCommandPalette,
    chatHistory, setChatHistory, clearChat,
    savedChats, loadChat, saveCurrentChat
  } = useAuthStore();
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("search"); // "search" | "ai"
  const [resolvedToken, setResolvedToken] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const emailIdMatch = pathname?.match(/^\/inbox\/email\/(.+)$/);
  const currentEmailId = emailIdMatch ? emailIdMatch[1] : null;

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Resolve token
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

  // Ctrl+K toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        e.preventDefault();
        closeCommandPalette();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCommandPalette, closeCommandPalette, isCommandPaletteOpen]);

  // Auto-focus input on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      // Reset mode when closing
      setMode("search");
      setInput("");
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [input, mode]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Click outside to close
  useEffect(() => {
    if (!isCommandPaletteOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeCommandPalette();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCommandPaletteOpen, closeCommandPalette]);

  if (!isCommandPaletteOpen) return null;

  let options = [];
  if (mode === "search") {
    if (!input.trim()) {
      options.push({ type: 'nav', label: 'Compose message', href: '/inbox/compose' });
      options.push({ type: 'nav', label: 'Go to inbox', href: '/inbox' });
      if (currentEmailId) {
        options.push({ type: 'action', label: 'Mark thread done', actionType: 'done' });
      }
      savedChats.slice(0, 5).forEach(chat => {
        options.push({ type: 'ai_chat', chat, label: chat.title });
      });
    } else {
      const q = input.trim().toLowerCase();
      
      const addNav = (label, href) => {
        if (label.toLowerCase().includes(q)) options.push({ type: 'nav', label, href });
      };
      
      const addAction = (label, actionType) => {
        if (label.toLowerCase().includes(q)) options.push({ type: 'action', label, actionType });
      };

      if ("search settings".includes(q)) {
        options.push({ type: 'settings', label: 'Search Settings' });
      }
      if ("settings".includes(q)) {
        options.push({ type: 'settings', label: 'Settings' });
      }

      addNav("Compose message", "/inbox/compose");
      addNav("Go to inbox", "/inbox");
      addNav("Go to starred", "/inbox?filter=starred");
      addNav("Go to sent", "/inbox?filter=sent");
      addNav("Go to drafts", "/inbox?filter=drafts");
      addNav("Go to done", "/inbox?filter=done");
      addNav("Go to spam", "/inbox?filter=spam");
      addNav("Go to trash", "/inbox?filter=trash");

      if (currentEmailId) {
        addAction("Mark thread done", "done");
        addAction("Star thread", "star");
        addAction("Block sender", "block_sender");
        addAction("Block domain", "block_domain");
        addAction("Mark thread trash", "trash");
        addAction("Mark thread spam", "spam");
      }
      
      options.push({ type: 'search_emails', label: `Search emails for "${input}"` });

      const matchedChats = savedChats.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.messages?.some(m => m.content?.toLowerCase().includes(q))
      );
      matchedChats.slice(0, 5).forEach(chat => {
        options.push({ type: 'ai_chat', chat, label: chat.title });
      });
    }
  }

  const executeOption = async (option) => {
    if (option.type === 'search_emails') {
      router.push(`/inbox?search=${encodeURIComponent(input.trim())}`);
      closeCommandPalette();
    } else if (option.type === 'settings') {
      router.push(`/inbox/settings`);
      closeCommandPalette();
    } else if (option.type === 'nav') {
      router.push(option.href);
      closeCommandPalette();
    } else if (option.type === 'action') {
      setIsLoading(true);
      const { trashEmail, doneEmail, starEmail, spamEmail } = await import("@/lib/gmail");
      
      if (option.actionType === 'trash') {
        await trashEmail(resolvedToken, currentEmailId);
        router.push("/inbox");
      } else if (option.actionType === 'done') {
        await doneEmail(resolvedToken, currentEmailId);
        router.push("/inbox");
      } else if (option.actionType === 'star') {
        await starEmail(resolvedToken, currentEmailId);
      } else if (option.actionType === 'spam') {
        await spamEmail(resolvedToken, currentEmailId);
        router.push("/inbox");
      } else {
        console.log("Mocked action:", option.actionType);
      }
      setIsLoading(false);
      closeCommandPalette();
    } else if (option.type === 'ai_chat') {
      if (chatHistory.length > 0) saveCurrentChat();
      loadChat(option.chat.id);
      setMode("ai");
      setInput("");
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    if (mode === "search") {
      // Regular search: navigate to inbox with search query
      router.push(`/inbox?search=${encodeURIComponent(input.trim())}`);
      closeCommandPalette();
      return;
    }

    // AI mode
    if (isLoading) return;
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

  const handleKeyDown = (e) => {
    if (mode === "search") {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, options.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (options[selectedIndex]) {
          executeOption(options[selectedIndex]);
        } else if (input.trim()) {
          router.push(`/inbox?search=${encodeURIComponent(input.trim())}`);
          closeCommandPalette();
        }
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        setMode("ai");
        return;
      }
    } else {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
        return;
      }
    }
  };

  const handleBack = () => {
    if (chatHistory.length > 0) {
      clearChat();
    }
    setMode("search");
    setInput("");
  };

  // Custom renderer to turn email references into clickable links
  const renderAiContent = (content) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            // Check if it's an internal email link
            if (href && href.startsWith("/inbox/email/")) {
              return (
                <button
                  onClick={() => {
                    closeCommandPalette();
                    router.push(href);
                  }}
                  className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 m-0 text-inherit font-inherit"
                >
                  <Envelope size={14} className="inline" />
                  {children}
                </button>
              );
            }
            return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline" {...props}>{children}</a>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
      style={{ animation: "fadeIn 0.15s ease-out" }}
    >
      <div 
        ref={containerRef}
        className="w-full max-w-[680px] bg-[#f7f7f6] rounded-2xl shadow-2xl border border-[#d0cfcb] overflow-hidden flex flex-col"
        style={{ 
          maxHeight: chatHistory.length > 0 ? '70vh' : 'auto',
          animation: "slideDown 0.15s ease-out" 
        }}
      >
        {/* Input Area */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e4e3e0]">
          {mode === "ai" && (
            <button 
              onClick={handleBack}
              className="p-1 text-gray-400 hover:text-gray-700 transition rounded-md hover:bg-black/5 flex-shrink-0"
            >
              <ArrowLeft size={18} weight="bold" />
            </button>
          )}
          
          {mode === "ai" && (
            <div className="flex items-center text-gray-400 flex-shrink-0">
              <Sparkle size={18} className="text-gray-400" weight="fill" />
            </div>
          )}
          
          <input
            ref={inputRef}
            type="text"
            placeholder={mode === "ai" ? (chatHistory.length > 0 ? "Ask follow-up..." : "Ask AI anything...") : "Search emails..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[16px] text-gray-900 placeholder-gray-400 outline-none font-medium"
          />

          {mode === "search" && input.trim() && (
            <div className="flex items-center gap-1 text-[11px] text-gray-400 flex-shrink-0 bg-[#e4e3e0] px-2 py-1 rounded-md">
              <span className="font-mono">Tab</span>
              <span>for AI</span>
            </div>
          )}
          {mode === "ai" && input.trim() && (
            <div className="flex items-center gap-1 text-[11px] text-gray-400 flex-shrink-0 bg-[#e4e3e0] px-2 py-1 rounded-md">
              <span className="font-mono">Tab</span>
              <span>or</span>
              <span className="font-mono">↵</span>
              <span>to send</span>
            </div>
          )}
        </div>

        {/* Chat Messages Area (AI mode only) */}
        {mode === "ai" && chatHistory.length > 0 && (
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-0">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`px-5 py-4 ${idx > 0 ? 'border-t border-[#e4e3e0]/50' : ''}`}>
                  {msg.role === "user" ? (
                    <div className="text-[14px] text-gray-500 font-medium">{msg.content}</div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="prose prose-sm prose-gray max-w-none text-[14px] leading-relaxed text-gray-800">
                        {renderAiContent(msg.content)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="px-5 py-4 border-t border-[#e4e3e0]/50">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Footer hints */}
        {mode === "search" && !input.trim() && options.length === 0 && (
          <div className="px-5 py-3 border-t border-[#e4e3e0]/50 flex items-center gap-4 text-[12px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <MagnifyingGlass size={13} />
              <span>Search your inbox</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] bg-[#e4e3e0] px-1.5 py-0.5 rounded">Tab</span>
              <span>Switch to AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] bg-[#e4e3e0] px-1.5 py-0.5 rounded">Esc</span>
              <span>Close</span>
            </div>
          </div>
        )}

        {/* Search Options Area */}
        {mode === "search" && options.length > 0 && (
          <div className="border-t border-[#e4e3e0]/50 px-5 py-3">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {!input.trim() ? "Recent AI Chats" : "Suggestions"}
            </div>
            <div className="flex flex-col gap-1">
              {options.map((option, idx) => {
                let Icon = null;
                if (option.type === 'ai_chat') Icon = Sparkle;
                else if (option.type === 'search_emails') Icon = MagnifyingGlass;
                else if (option.type === 'settings') Icon = Gear;
                else if (option.type === 'nav') {
                  if (option.label.includes('inbox')) Icon = Tray;
                  else if (option.label.includes('starred')) Icon = Star;
                  else if (option.label.includes('sent')) Icon = PaperPlaneRight;
                  else if (option.label.includes('drafts')) Icon = FileText;
                  else if (option.label.includes('done')) Icon = CheckCircle;
                  else if (option.label.includes('spam')) Icon = WarningOctagon;
                  else if (option.label.includes('trash')) Icon = Trash;
                  else if (option.label.includes('Compose')) Icon = PencilSimple;
                  else Icon = ArrowRight;
                } else if (option.type === 'action') {
                  if (option.actionType === 'done') Icon = CheckCircle;
                  else if (option.actionType === 'star') Icon = Star;
                  else if (option.actionType === 'trash') Icon = Trash;
                  else if (option.actionType === 'spam') Icon = WarningOctagon;
                  else if (option.actionType.includes('block')) Icon = Prohibit;
                  else Icon = Sparkle;
                }

                return (
                  <button
                    key={idx}
                    onClick={() => executeOption(option)}
                    className={`text-left px-3 py-2 rounded-lg transition flex items-center gap-3 text-[13px] ${
                      idx === selectedIndex ? 'bg-[#e4e3e0] text-gray-900' : 'hover:bg-[#e4e3e0]/50 text-gray-700'
                    }`}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    {Icon && <Icon size={14} className="text-gray-500 flex-shrink-0" />}
                    <span className="truncate flex-1">{option.label}</span>
                    
                    {/* Add keyboard shortcuts to UI if applicable */}
                    {option.type === 'nav' && option.label.includes('inbox') && <span className="text-[10px] bg-[#e4e3e0] text-gray-500 px-1.5 py-0.5 rounded font-mono">G then I</span>}
                    {option.type === 'nav' && option.label.includes('starred') && <span className="text-[10px] bg-[#e4e3e0] text-gray-500 px-1.5 py-0.5 rounded font-mono">G then S</span>}
                    {option.type === 'nav' && option.label.includes('sent') && <span className="text-[10px] bg-[#e4e3e0] text-gray-500 px-1.5 py-0.5 rounded font-mono">G then N</span>}
                    {option.type === 'nav' && option.label.includes('drafts') && <span className="text-[10px] bg-[#e4e3e0] text-gray-500 px-1.5 py-0.5 rounded font-mono">G then D</span>}
                    {option.type === 'nav' && option.label.includes('Compose') && <span className="text-[10px] bg-[#e4e3e0] text-gray-500 px-1.5 py-0.5 rounded font-mono">C</span>}
                    
                    {option.type === 'action' && option.actionType === 'done' && <span className="text-[10px] bg-[#e4e3e0] text-gray-500 px-1.5 py-0.5 rounded font-mono">E</span>}
                    {option.type === 'action' && option.actionType === 'star' && <span className="text-[10px] bg-[#e4e3e0] text-gray-500 px-1.5 py-0.5 rounded font-mono">S</span>}
                    {option.type === 'action' && option.actionType === 'trash' && <span className="text-[10px] bg-[#e4e3e0] text-gray-500 px-1.5 py-0.5 rounded font-mono">#</span>}
                    {option.type === 'action' && option.actionType === 'spam' && <span className="text-[10px] bg-[#e4e3e0] text-gray-500 px-1.5 py-0.5 rounded font-mono">!</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
