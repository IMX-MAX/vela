"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { chatWithAiAction, chatStepAction } from "@/app/actions";
import { ArrowLeft, MagnifyingGlass, Sparkle, Envelope, ArrowRight, Gear, Tray, Star, PaperPlaneRight, FileText, CheckCircle, WarningOctagon, Trash, PencilSimple, Prohibit, CaretDown, CaretRight, Users } from "@phosphor-icons/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import AiComposeBox from "./AiComposeBox";

export default function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    session, user, 
    isCommandPaletteOpen, toggleCommandPalette, closeCommandPalette,
    chatHistory, setChatHistory, clearChat,
    savedChats, loadChat, saveCurrentChat, initSavedChats, checkAuth
  } = useAuthStore();

  useEffect(() => {
    initSavedChats();
  }, [initSavedChats]);
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("search"); // "search" | "ai"
  const [resolvedToken, setResolvedToken] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedSteps, setExpandedSteps] = useState({});
  const toggleSteps = (idx) => setExpandedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  const [expandedThoughts, setExpandedThoughts] = useState({});
  const toggleThought = (id) => setExpandedThoughts(prev => ({ ...prev, [id]: !prev[id] }));
  
  const emailIdMatch = pathname?.match(/^\/inbox\/email\/(.+)$/);
  const currentEmailId = emailIdMatch ? emailIdMatch[1] : null;

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Resolve token
  useEffect(() => {
    async function loadToken() {
      if (session?.providerAccessToken) {
        setResolvedToken(session.providerAccessToken);
      }
    }
    loadToken();
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
      // Save chat if exists, then reset mode when closing
      if (useAuthStore.getState().chatHistory.length > 0) {
        saveCurrentChat();
      }
      setMode("search");
      setInput("");
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen, saveCurrentChat]);

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
  } else if (mode === "ai" && chatHistory.length === 0 && !input.trim()) {
    savedChats.forEach(chat => {
      options.push({ type: 'ai_chat', chat, label: chat.title });
    });
  }

  const executeOption = async (option) => {
    if (option.type === 'search_emails') {
      router.push(`/inbox?search=${encodeURIComponent(input.trim())}`);
      closeCommandPalette();
    } else if (option.type === 'settings') {
      router.push(`/inbox/settings/profile`);
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
      if (user?.name) {
        context += `Name: ${user.name}. `;
      }
      if (user?.prefs) {
        context += `Job Title: ${user.prefs.jobName || 'Unknown'}, Company: ${user.prefs.company || 'Unknown'}. `;
        if (user.prefs.writingStyle) {
          context += `Writing Style: ${user.prefs.writingStyle}`;
        }
      }
      
      try {
        const { incrementAiUsage } = await import("@/lib/usage");
        await incrementAiUsage(user, checkAuth);
      } catch (usageError) {
        if (!usageError.message?.includes("limit reached")) {
          setChatHistory([...newHistory, { role: "assistant", content: `Error: ${usageError.message}` }]);
        } else {
          setChatHistory(newHistory);
        }
        setIsLoading(false);
        return;
      }
      
      let isDone = false;
      let loopCount = 0;
      let currentMessages = newHistory.map(m => ({ role: m.role, content: m.content }));
      
      const assistantMsg = { role: "assistant", content: "", steps: [], startTime: Date.now() };
      setChatHistory([...newHistory, assistantMsg]);

      while (!isDone && loopCount < 15) {
        loopCount++;
        const stepResponse = await chatStepAction(currentMessages, resolvedToken, context);
        
        if (stepResponse.type === 'tool') {
          assistantMsg.steps.push({
            name: stepResponse.name,
            result: stepResponse.result,
            thought: stepResponse.thought,
            args: stepResponse.args,
            time: Date.now()
          });
          
          currentMessages.push(stepResponse.message);
          currentMessages.push({
            role: "tool",
            name: stepResponse.name,
            content: stepResponse.result,
            toolCallId: stepResponse.toolCallId
          });
          
          setChatHistory([...newHistory, { ...assistantMsg }]);
        } else if (stepResponse.type === 'text') {
          assistantMsg.content = stepResponse.content;
          assistantMsg.endTime = Date.now();
          currentMessages.push(stepResponse.message);
          
          setChatHistory([...newHistory, { ...assistantMsg }]);
          isDone = true;
        } else {
          assistantMsg.content = stepResponse.content || "An error occurred.";
          assistantMsg.endTime = Date.now();
          setChatHistory([...newHistory, { ...assistantMsg }]);
          isDone = true;
        }
      }
    } catch (error) {
      setChatHistory([...newHistory, { role: "assistant", content: "Sorry, I encountered an error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    const isShowingOptions = mode === "search" || (mode === "ai" && chatHistory.length === 0 && !input.trim());
    
    if (isShowingOptions) {
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
        } else if (input.trim() && mode === "search") {
          router.push(`/inbox?search=${encodeURIComponent(input.trim())}`);
          closeCommandPalette();
        }
        return;
      }
      if (e.key === 'Tab' && mode === "search") {
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
      saveCurrentChat();
    }
    setMode("search");
    setInput("");
  };

  // Custom renderer to turn email references into clickable links and render draft emails
  const renderAiContent = (content, msgIdx) => {
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
          },
          pre: ({ node, children, ...props }) => {
            // Check if the pre contains our draft-email
            const hasDraft = node.children && node.children.some(child => 
              child.tagName === 'code' && child.properties?.className?.includes('language-draft-email')
            );
            if (hasDraft) {
              return <div className="not-prose my-2">{children}</div>;
            }
            return <pre {...props}>{children}</pre>;
          },
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-([\w-]+)/.exec(className || '');
            if (!inline && match && match[1] === 'draft-email') {
              try {
                const draftData = JSON.parse(String(children).replace(/\n$/, ''));
                return (
                  <AiComposeBox
                    initialTo={draftData.to}
                    initialSubject={draftData.subject}
                    initialBody={draftData.body}
                    resolvedToken={resolvedToken}
                    onDiscard={() => {
                      const updatedHistory = [...chatHistory];
                      const msg = updatedHistory[msgIdx];
                      msg.content = msg.content.replace(new RegExp(`\`\`\`draft-email[\\s\\S]*?\`\`\``), "_Draft discarded._");
                      setChatHistory(updatedHistory);
                    }}
                    onSent={(to) => {
                      const updatedHistory = [...chatHistory];
                      const msg = updatedHistory[msgIdx];
                      msg.content = msg.content.replace(new RegExp(`\`\`\`draft-email[\\s\\S]*?\`\`\``), `**✅ Email sent successfully to ${to}!**`);
                      setChatHistory(updatedHistory);
                    }}
                  />
                );
              } catch (e) {
                return <code className={className} {...props}>{children}</code>;
              }
            }
            return <code className={className} {...props}>{children}</code>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const isOpen = isCommandPaletteOpen;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[90] bg-[#2b323b]/20 backdrop-blur-sm transition-opacity"
          onClick={closeCommandPalette}
          style={{ animation: "fadeIn 0.15s ease-out" }}
        />
      )}

      <div 
        ref={containerRef}
        className={`fixed z-[100] bottom-4 left-4 right-4 md:bottom-auto md:top-[15vh] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-[680px] 
          bg-white/70 md:bg-[#eceae6] backdrop-blur-2xl md:backdrop-blur-none border border-white/50 md:border-[#d0cfcb] shadow-2xl overflow-hidden flex flex-col-reverse md:flex-col transition-all duration-300 ease-out
          ${!isOpen ? "flex md:hidden" : "flex"}
          ${isOpen ? "rounded-3xl md:rounded-2xl" : "rounded-[28px] md:rounded-2xl"}
        `}
        style={{ 
          maxHeight: isOpen ? '75vh' : '56px',
          boxShadow: isOpen ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Input Area */}
        <div className={`h-[56px] flex-shrink-0 flex items-center gap-3 px-5 transition-colors duration-300 ${isOpen ? "bg-white/50 md:bg-transparent border-t md:border-t-0 md:border-b border-white/40 md:border-[#dddcdc]" : "bg-transparent"}`}>
          {mode === "ai" && (
            <button 
              onClick={handleBack}
              className="p-1 text-gray-500 hover:text-gray-800 transition rounded-md hover:bg-black/5 flex-shrink-0"
            >
              <ArrowLeft size={18} weight="bold" />
            </button>
          )}
          
          {mode === "ai" && (
            <div className="flex items-center text-gray-500 flex-shrink-0">
              <Sparkle size={18} weight="fill" />
            </div>
          )}
          
          <input
            ref={inputRef}
            type="text"
            placeholder={mode === "ai" ? (chatHistory.length > 0 ? "Ask follow-up..." : "Ask AI anything...") : "Search emails or execute AI..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (!isCommandPaletteOpen) toggleCommandPalette();
            }}
            className="flex-1 bg-transparent text-[15px] text-[#2b323b] placeholder-gray-500/80 outline-none font-medium h-full"
          />

          {mode === "search" && (
            <button
              onClick={() => {
                setMode("ai");
                inputRef.current?.focus();
              }}
              className="md:hidden flex items-center justify-center p-1.5 rounded-md text-gray-500 hover:text-gray-800 hover:bg-black/5 transition"
            >
              <Sparkle size={18} weight="fill" />
            </button>
          )}
          {mode === "ai" && input.trim() && (
            <button
              onClick={handleSubmit}
              className="md:hidden flex items-center justify-center p-1.5 rounded-md text-gray-500 hover:text-gray-800 hover:bg-black/5 transition"
            >
              <PaperPlaneRight size={18} weight="fill" />
            </button>
          )}

          {mode === "search" && (
            <div className="hidden md:flex items-center gap-1 text-[11px] text-gray-500 flex-shrink-0 bg-white/50 px-2 py-1 rounded-md shadow-sm border border-white/60">
              <span className="font-mono">Tab</span>
              <span>for AI</span>
            </div>
          )}
          {mode === "ai" && input.trim() && (
            <div className="hidden md:flex items-center gap-1 text-[11px] text-gray-500 flex-shrink-0 bg-white/50 px-2 py-1 rounded-md shadow-sm border border-white/60">
              <span className="font-mono">Tab</span>
              <span>or</span>
              <span className="font-mono">↵</span>
              <span>to send</span>
            </div>
          )}
        </div>

        {/* Chat / Options Area */}
        <div className={`flex-1 overflow-y-auto flex flex-col ${!isOpen ? "hidden" : "flex"}`}>
          {/* Chat Messages Area (AI mode only) */}
          {mode === "ai" && chatHistory.length > 0 && (
            <div className="flex flex-col gap-0">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`px-5 py-4 ${idx > 0 ? 'border-t border-black/5' : ''}`}>
                  {msg.role === "user" ? (
                    <div className="text-[14px] text-gray-600 font-medium">{msg.content}</div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {msg.steps && msg.steps.length > 0 && (
                        <div className="mb-2">
                          <button 
                            onClick={() => toggleSteps(idx)} 
                            className="flex items-center gap-2 text-[16px] font-medium text-slate-500 hover:text-slate-800 transition"
                          >
                            <span>{msg.endTime ? `Worked for ${Math.max(1, Math.round((msg.endTime - msg.startTime)/1000))}s` : `Working...`}</span>
                            {expandedSteps[idx] ? <CaretDown size={14} weight="bold" /> : <CaretRight size={14} weight="bold" />}
                          </button>
                          {expandedSteps[idx] && (
                            <div className="mt-4 pl-4 border-l-2 border-slate-400/80 flex flex-col gap-3">
                               {msg.steps.map((step, sIdx) => {
                                 const description = step.name === 'search_inbox' ? `Searched inbox for "${step.args?.query || ''}"` :
                                                     step.name === 'search_contacts' ? `Searched contacts for "${step.args?.query || ''}"` :
                                                     `Used tool ${step.name}`;
                                 return (
                                   <div key={sIdx} className="text-[15px] text-slate-500">
                                      {description}
                                   </div>
                                 );
                               })}
                               {!msg.endTime && (
                                 <div className="text-[15px] text-slate-500">thinking...</div>
                               )}
                            </div>
                          )}
                        </div>
                      )}
                      {msg.content && (
                        <div className="prose prose-sm prose-gray max-w-none text-[14px] leading-relaxed text-gray-800">
                          {renderAiContent(msg.content, idx)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="px-5 py-4 border-t border-black/5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Footer hints */}
          {mode === "search" && !input.trim() && options.length === 0 && (
            <div className="px-5 py-3 border-b border-black/5 flex items-center gap-4 text-[12px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <MagnifyingGlass size={13} />
                <span>Search your inbox</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5">
                <span className="font-mono text-[11px] bg-white/50 px-1.5 py-0.5 rounded border border-white/60">Tab</span>
                <span>Switch to AI</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5">
                <span className="font-mono text-[11px] bg-white/50 px-1.5 py-0.5 rounded border border-white/60">Esc</span>
                <span>Close</span>
              </div>
            </div>
          )}

          {/* Search Options Area */}
          {(mode === "search" || (mode === "ai" && chatHistory.length === 0)) && options.length > 0 && (
            <div className="px-3 py-3">
              {options[0]?.type !== 'ai_chat' && (
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                  Suggestions
                </div>
              )}
              <div className="flex flex-col gap-1">
                {options.map((option, idx) => {
                  const isFirstAiChat = option.type === 'ai_chat' && (idx === 0 || options[idx-1].type !== 'ai_chat');
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
                    <div key={idx}>
                      {isFirstAiChat && (
                        <div className={`text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 px-2 ${idx > 0 ? 'mt-3' : ''}`}>
                          Recent AI Chats
                        </div>
                      )}
                      <button
                        onClick={() => executeOption(option)}
                        className={`text-left px-3 py-2 rounded-xl transition flex items-center gap-3 text-[13px] w-full ${
                          idx === selectedIndex ? 'bg-white/60 shadow-sm text-[#2b323b]' : 'hover:bg-white/40 text-gray-700'
                        }`}
                        onMouseEnter={() => setSelectedIndex(idx)}
                      >
                        {Icon && <Icon size={15} className="text-gray-500 flex-shrink-0" />}
                        <span className="truncate flex-1 font-medium">{option.label}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
