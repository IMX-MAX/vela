"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/lib/store";
import { fetchEmailDetails, sendEmail } from "@/lib/gmail";
import { parseEmailContent } from "@/lib/emailParser";
import { summarizeEmailAction, draftReplyAction } from "@/app/actions";
import { ArrowLeft, Sparkle, PaperPlaneRight, CaretDown, CaretUp, Star, Clock, Check, Trash, DotsThree } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dynamic from "next/dynamic";

const AiEditor = dynamic(() => import("@/components/AiEditor"), { ssr: false });

export default function EmailDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { session, user } = useAuthStore();
  const iframeRef = useRef(null);
  
  const [email, setEmail] = useState(() => {
    const cached = useAuthStore.getState().inboxEmails?.find(e => e.id === id);
    if (cached) {
      return {
        ...cached,
        senderName: cached.sender,
        senderEmail: "",
      };
    }
    return null;
  });
  const [loading, setLoading] = useState(!email);
  
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  const [draft, setDraft] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  
  const [replyText, setReplyText] = useState("");
  const [replyHtml, setReplyHtml] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [resolvedToken, setResolvedToken] = useState(null);

  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiPrompt, setShowAiPrompt] = useState(false);

  const [threadMessages, setThreadMessages] = useState([]);
  const [authError, setAuthError] = useState(null);
  
  const [showDetails, setShowDetails] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Optional: could add a toast here
  };

  useEffect(() => {
    async function load() {
      let token = session?.providerAccessToken;

      if (session?.provider === 'google') {
        if (!token) {
           setAuthError("No Google access token found. Please ensure 'Store access tokens' is enabled in your Appwrite Google Provider settings, then sign out and sign in again.");
           setLoading(false);
           return;
        }
      } else if (!token && user) {
        const { checkComposioStatus, getComposioAccessToken } = await import("@/app/composioActions");
        const status = await checkComposioStatus(user.$id);
        if (status.connected) {
          const compData = await getComposioAccessToken(user.$id);
          if (compData.connectionId) {
            token = compData.connectionId;
          }
        }
      }

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const rawMsg = await fetchEmailDetails(token, id);
        const { fetchThreadDetails, markEmailAsRead } = await import("@/lib/gmail");
        
        // Mark as read if it is unread
        if (rawMsg.labelIds && rawMsg.labelIds.includes("UNREAD")) {
          await markEmailAsRead(token, id);
          // Update global store to reflect this
          const { inboxEmails, setInboxEmails } = useAuthStore.getState();
          if (inboxEmails) {
            setInboxEmails(inboxEmails.map(e => e.id === id ? { ...e, isUnread: false } : e));
          }
        }

        const threadData = await fetchThreadDetails(token, rawMsg.threadId);
        
        const parsedMsgs = (threadData.messages || [rawMsg]).map(msg => {
          const parsed = parseEmailContent(msg);
          let senderName = parsed.from;
          let senderEmail = "";
          if (senderName && senderName.includes("<")) {
            const parts = senderName.split("<");
            senderName = parts[0].replace(/"/g, "").trim();
            senderEmail = parts[1].replace(">", "").trim();
          }
          return {
            ...parsed,
            senderName,
            senderEmail: senderEmail || parsed.from,
            rawTo: parsed.from,
            id: msg.id
          };
        });

        const targetIndex = parsedMsgs.findIndex(m => m.id === id);
        const mainMsg = targetIndex !== -1 ? parsedMsgs[targetIndex] : parsedMsgs[parsedMsgs.length - 1];

        setEmail(mainMsg);
        setThreadMessages(parsedMsgs);
        setResolvedToken(token);
      } catch (error) {
        console.error("Error fetching email:", error);
        setAuthError(`Gmail API Error: ${error.message}. Please ensure you checked all permission boxes during Google sign-in.`);
      } finally {
        if (email === null) {
          setLoading(false);
        }
      }
    }
    if (session) {
      load();
    }
  }, [id, session, user]);

  useEffect(() => {
    // Resize iframe after it loads
    const handleIframeLoad = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          const height = iframeRef.current.contentWindow.document.body.scrollHeight;
          iframeRef.current.style.height = height + 40 + 'px';
        } catch (e) {
          // Ignore cross-origin error if any, though srcDoc shouldn't have it
        }
      }
    };
    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', handleIframeLoad);
      return () => {
        if (iframeRef.current) {
          iframeRef.current.removeEventListener('load', handleIframeLoad);
        }
      };
    }
  }, [email]);

  const handleDone = async () => {
    if (!resolvedToken) return;
    const { doneEmail } = await import("@/lib/gmail");
    await doneEmail(resolvedToken, id);
    
    const { inboxEmails, setInboxEmails } = useAuthStore.getState();
    if (inboxEmails) {
      setInboxEmails(inboxEmails.filter(e => e.id !== id));
    }
    router.push("/inbox");
  };

  const handleTrash = async () => {
    if (!resolvedToken) return;
    const { trashEmail } = await import("@/lib/gmail");
    await trashEmail(resolvedToken, id);
    
    const { inboxEmails, setInboxEmails } = useAuthStore.getState();
    if (inboxEmails) {
      setInboxEmails(inboxEmails.filter(e => e.id !== id));
    }
    router.push("/inbox");
  };

  const handleSummarize = async () => {
    if (!email) return;
    setIsSummarizing(true);
    
    let context = "";
    if (user?.prefs) {
      context = `Job Title: ${user.prefs.jobName || 'Unknown'}, Company: ${user.prefs.company || 'Unknown'}`;
    }
    
    const result = await summarizeEmailAction(email.body || email.snippet, context);
    setSummary(result);
    
    const { saveSummary } = await import("@/lib/db");
    await saveSummary(id, result);
    
    setIsSummarizing(false);
  };

  useEffect(() => {
    async function loadSummary() {
      const { getSummary } = await import("@/lib/db");
      const cached = await getSummary(id);
      if (cached) {
        setSummary(cached);
      }
    }
    loadSummary();
  }, [id]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) {
        return;
      }
      
      const { inboxEmails } = useAuthStore.getState();
      if (!inboxEmails || inboxEmails.length === 0) return;
      
      const currentIndex = inboxEmails.findIndex(e => e.id === id);
      if (currentIndex === -1) return;

      if (e.key === "j") {
        e.preventDefault();
        if (currentIndex < inboxEmails.length - 1) {
          router.push(`/inbox/email/${inboxEmails[currentIndex + 1].id}`);
        }
      } else if (e.key === "k") {
        e.preventDefault();
        if (currentIndex > 0) {
          router.push(`/inbox/email/${inboxEmails[currentIndex - 1].id}`);
        }
      }
    };
    
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [id, router]);

  const handleDraftReply = async () => {
    if (!email) return;
    setIsDrafting(true);
    const promptToUse = aiPrompt.trim() ? aiPrompt : "Reply professionally acknowledging receipt.";
    
    let context = "";
    if (user?.prefs) {
      context = `Job Title: ${user.prefs.jobName || 'Unknown'}, Company: ${user.prefs.company || 'Unknown'}`;
    }
    
    const result = await draftReplyAction(email.body || email.snippet, promptToUse, context);
    setDraft(result);
    setReplyText(result); 
    setIsDrafting(false);
    setShowAiPrompt(false);
    setAiPrompt("");
  };

  const handleSend = async () => {
    if (!email || !replyText || !resolvedToken) return;
    setIsSending(true);
    try {
      const subject = email.subject.toLowerCase().startsWith("re:") ? email.subject : `Re: ${email.subject}`;
      await sendEmail(resolvedToken, email.rawTo, subject, replyText, replyHtml || replyText);
      router.push("/inbox");
    } catch (error) {
      console.error("Failed to send", error);
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#eceae6] rounded-2xl">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-gray-800"></div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#eceae6] rounded-2xl p-8">
        <p className="text-red-500 font-medium max-w-md text-center">{authError}</p>
        <button 
          onClick={async () => { await useAuthStore.getState().logout(); window.location.href = "/login"; }} 
          className="mt-6 px-5 py-2.5 bg-[#2b323b] text-white hover:bg-[#2b323b] transition rounded-lg text-sm font-medium"
        >
          Sign out and re-login
        </button>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="p-8">Email not found.</div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#eceae6] rounded-2xl relative overflow-y-auto">
      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-4 sticky top-0 z-10 rounded-t-2xl bg-[#eceae6] border-b border-[#dddcdc]">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.back()} 
            className="p-2 text-gray-500 hover:text-[#2b323b] transition rounded-md hover:bg-[#2b323b]/5"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-[13px] text-gray-400 font-medium ml-2 select-none flex items-center gap-2">
            <button className="bg-white border border-gray-200 text-gray-500 hover:text-[#2b323b] transition rounded-md h-7 w-7 flex items-center justify-center">
               <CaretUp size={14} weight="bold" />
            </button>
            <button className="bg-white border border-gray-200 text-gray-500 hover:text-[#2b323b] transition rounded-md h-7 w-7 flex items-center justify-center">
               <CaretDown size={14} weight="bold" />
            </button>
            <span className="ml-2 font-medium">1 / 9,370</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-500 pr-2">
          <button className="hover:text-[#2b323b] transition"><Star size={18} /></button>
          <button className="hover:text-[#2b323b] transition"><Clock size={18} /></button>
          <button className="hover:text-[#2b323b] transition" onClick={handleDone}><Check size={18} /></button>
          <button className="hover:text-[#2b323b] transition" onClick={handleTrash}><Trash size={18} /></button>
          <button className="hover:text-[#2b323b] transition"><DotsThree size={18} weight="bold" /></button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-8 pb-12 pt-4">
        <h1 className="text-2xl font-medium text-[#2b323b] mb-8 text-center">{email.subject}</h1>
        
        {/* Thread History (Collapsed) */}
        {threadMessages.map((msg, idx) => {
          if (msg.id === email.id) {
            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">


          {/* Card Header */}
          <div className="px-8 py-6 flex items-start justify-between border-b border-gray-100 relative">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#f0f0f0] flex items-center justify-center text-sm font-medium text-gray-700">
                {email.senderName ? email.senderName[0].toUpperCase() : "U"}
              </div>
              <div>
                <div className="font-medium text-[15px] text-[#2b323b] flex items-center gap-2">
                  {email.senderName}
                  <span className="text-[13px] font-normal text-gray-400">{email.senderEmail}</span>
                </div>
                <div 
                  className="text-[13px] text-gray-400 cursor-pointer inline-flex items-center gap-1 hover:text-gray-600"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  to me <CaretDown size={12} />
                </div>
              </div>
            </div>
            <div className="text-[13px] text-gray-400 pt-1">
              {email.date ? format(new Date(email.date), "MMM d, yyyy, h:mm a") : ""}
            </div>
            
            {showDetails && (
              <div className="absolute top-20 left-8 bg-white border border-gray-200 shadow-lg rounded-xl p-4 z-20 w-[400px] text-[13px]">
                <div 
                  className="grid grid-cols-[60px_1fr] gap-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded px-2 transition-colors"
                  onClick={() => copyToClipboard(`From: ${email.senderName} <${email.senderEmail}>`)}
                >
                  <span className="text-gray-500">From:</span>
                  <span className="text-[#2b323b]">{email.senderName} &lt;{email.senderEmail}&gt;</span>
                </div>
                <div 
                  className="grid grid-cols-[60px_1fr] gap-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded px-2 transition-colors"
                  onClick={() => copyToClipboard(`To: ${email.rawTo || "me"}`)}
                >
                  <span className="text-gray-500">To:</span>
                  <span className="text-[#2b323b]">{email.rawTo || "me"}</span>
                </div>
                <div 
                  className="grid grid-cols-[60px_1fr] gap-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded px-2 transition-colors"
                  onClick={() => copyToClipboard(`Subject: ${email.subject}`)}
                >
                  <span className="text-gray-500">Subject:</span>
                  <span className="text-[#2b323b]">{email.subject}</span>
                </div>
                <div 
                  className="grid grid-cols-[60px_1fr] gap-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded px-2 transition-colors"
                  onClick={() => {
                    const d = email.date ? format(new Date(email.date), "EEEE, MMMM d, yyyy 'at' h:mm a") : "";
                    copyToClipboard(`Date: ${d}`);
                  }}
                >
                  <span className="text-gray-500">Date:</span>
                  <span className="text-[#2b323b]">{email.date ? format(new Date(email.date), "EEEE, MMMM d, yyyy 'at' h:mm a") : ""}</span>
                </div>
              </div>
            )}
          </div>

          {/* AI Toolbar within Card */}
          <div className="px-8 py-4 bg-white border-b border-gray-100 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="flex items-center gap-2 text-[13px] font-medium bg-white border border-gray-200 hover:bg-gray-50 transition px-3 py-1.5 rounded-full text-gray-700 disabled:opacity-50"
              >
                <Sparkle size={14} className="text-gray-600" weight="fill" />
                {isSummarizing ? "Summarizing..." : "Summarize"}
              </button>
              
              <button 
                onClick={() => setShowAiPrompt(!showAiPrompt)}
                disabled={isDrafting}
                className="flex items-center gap-2 text-[13px] font-medium bg-white border border-gray-200 hover:bg-gray-50 transition px-3 py-1.5 rounded-full text-gray-700 disabled:opacity-50"
              >
                <Sparkle size={14} className="text-gray-600" weight="fill" />
                {isDrafting ? "Drafting..." : "Reply with AI"}
              </button>
            </div>
            
            {showAiPrompt && (
              <div className="flex items-center gap-2 mt-1 bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm max-w-md">
                <input
                  type="text"
                  placeholder="e.g. tell him I'll be attending"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && aiPrompt.trim()) {
                      handleDraftReply();
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-[13px] px-2 text-gray-800 placeholder-gray-400"
                  autoFocus
                />
                <button 
                  onClick={handleDraftReply}
                  disabled={!aiPrompt.trim() || isDrafting}
                  className="bg-gray-800 hover:bg-[#2b323b] text-white rounded px-3 py-1 text-[13px] font-medium transition disabled:opacity-50"
                >
                  Draft
                </button>
              </div>
            )}
          </div>

          {/* Summary Block */}
          {summary && (
            <div className="px-8 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-2 text-gray-800 font-medium text-[13px]">
                <Sparkle size={14} weight="fill" className="text-gray-600" />
                AI Summary
              </div>
              <div className="text-[14px] text-gray-600 whitespace-pre-wrap leading-relaxed prose prose-sm prose-gray max-w-none ai-dust">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {summary}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Email Body */}
          <div className="p-8">
            {email.htmlBody ? (
              <iframe
                ref={iframeRef}
                srcDoc={`<base target="_blank" />${email.htmlBody}`}
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                className="w-full border-none min-h-[300px]"
                title="Email Content"
                style={{ overflow: 'hidden' }}
              />
            ) : email.body ? (
              <div className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-wrap font-sans">
                {email.body}
              </div>
            ) : (
              <div className="animate-pulse flex flex-col gap-4 mt-2">
                 <div className="h-4 bg-gray-200 rounded w-full"></div>
                 <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                 <div className="h-4 bg-gray-200 rounded w-10/12"></div>
                 <div className="h-4 bg-gray-200 rounded w-full mt-4"></div>
                 <div className="h-4 bg-gray-200 rounded w-8/12"></div>
              </div>
            )}
          </div>
        </div>
            );
          } else {
            return (
              <div key={idx} className="bg-[#eceae6] rounded-xl shadow-sm border border-[#dddcdc] overflow-hidden mb-4 p-4 flex items-center justify-between opacity-80 hover:opacity-100 transition cursor-pointer" onClick={() => router.push(`/inbox/email/${msg.id}`)}>
                <div className="flex items-center gap-3">
                  <div className="font-medium text-[14px] text-[#2b323b]">
                    {msg.senderName}
                  </div>
                  <div className="text-[13px] text-gray-500 truncate max-w-md">
                    {msg.snippet}
                  </div>
                </div>
                <div className="text-[13px] text-gray-400">
                  {msg.date ? format(new Date(msg.date), "MMM d") : ""}
                </div>
              </div>
            );
          }
        })}

        {/* Reply Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible focus-within:ring-2 focus-within:ring-[#c7d4ce]/50 focus-within:border-[#50686c] transition mb-12">
          <div className="px-4 py-3 bg-[#fbfbfc] border-b border-gray-100 flex items-center gap-2 text-[13px] text-gray-500 font-medium rounded-t-xl">
            <span className="icon-reply"></span>
            Reply to {email.senderName}
          </div>
          <div className="flex-1 w-full min-h-[150px] overflow-visible">
            <AiEditor 
              value={replyText}
              onChange={(html, text) => {
                setReplyHtml(html);
                setReplyText(text);
              }}
              placeholder="Write your reply..."
              borderless={true}
            />
          </div>
          <div className="px-4 py-3 bg-[#fbfbfc] border-t border-gray-100 flex justify-between items-center rounded-b-xl">
            <div className="flex items-center gap-2 text-gray-400">
              <button className="hover:text-[#50686c] transition"><span className="icon-text-b"></span></button>
              <button className="hover:text-[#50686c] transition"><span className="icon-paperclip"></span></button>
            </div>
            <button 
              onClick={handleSend}
              disabled={!replyText || isSending}
              className="flex items-center gap-2 bg-[#50686c] hover:opacity-90 transition text-white px-5 py-2 rounded-lg text-[13px] font-medium disabled:opacity-50 shadow-sm"
            >
              {isSending ? "Sending..." : "Send"}
              <PaperPlaneRight size={14} weight="fill" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
