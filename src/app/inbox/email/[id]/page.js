"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/lib/store";
import { fetchEmailDetails, sendEmail } from "@/lib/gmail";
import { parseEmailContent } from "@/lib/emailParser";
import { summarizeEmailAction, draftReplyAction } from "@/app/actions";
import { ArrowLeft, Sparkle, PaperPlaneRight, CaretDown } from "@phosphor-icons/react";
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
  
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    async function load() {
      let token = session?.providerAccessToken;

      if (!token && user) {
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
      } finally {
        setLoading(false);
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
      <div className="flex h-full items-center justify-center bg-[#f4f3f0] rounded-2xl">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-gray-800"></div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="p-8">Email not found.</div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#eeeae6] rounded-2xl relative overflow-y-auto">
      {/* Top Bar */}
      <div className="h-14 flex items-center px-4 sticky top-0 z-10 rounded-t-2xl">
        <button 
          onClick={() => router.back()} 
          className="p-2 text-gray-500 hover:text-gray-900 transition rounded-md hover:bg-black/5"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full px-8 pb-12 pt-4">
        <h1 className="text-2xl font-medium text-gray-900 mb-8 text-center">{email.subject}</h1>
        
        {/* Thread History (Collapsed) */}
        {threadMessages.map((msg, idx) => {
          if (msg.id === email.id) {
            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">


          {/* Card Header */}
          <div className="px-8 py-6 flex items-start justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#f0f0f0] flex items-center justify-center text-sm font-medium text-gray-700">
                {email.senderName ? email.senderName[0].toUpperCase() : "U"}
              </div>
              <div>
                <div className="font-medium text-[15px] text-gray-900 flex items-center gap-2">
                  {email.senderName}
                  <span className="text-[13px] font-normal text-gray-400">{email.senderEmail}</span>
                </div>
                <div className="text-[13px] text-gray-400">
                  to me <CaretDown size={12} className="inline" />
                </div>
              </div>
            </div>
            <div className="text-[13px] text-gray-400 pt-1">
              {email.date ? format(new Date(email.date), "MMM d, yyyy, h:mm a") : ""}
            </div>
          </div>

          {/* AI Toolbar within Card */}
          <div className="px-8 py-4 bg-[#fbfbfc] border-b border-gray-100 flex flex-col gap-3">
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
                  className="bg-gray-800 hover:bg-black text-white rounded px-3 py-1 text-[13px] font-medium transition disabled:opacity-50"
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
              <div className="text-[14px] text-gray-600 whitespace-pre-wrap leading-relaxed prose prose-sm prose-gray max-w-none">
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
                srcDoc={email.htmlBody}
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                className="w-full border-none min-h-[300px]"
                title="Email Content"
                style={{ overflow: 'hidden' }}
              />
            ) : (
              <div className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-wrap font-sans">
                {email.body}
              </div>
            )}
          </div>
        </div>
            );
          } else {
            return (
              <div key={idx} className="bg-[#f0ece9] rounded-xl shadow-sm border border-[#e4e3e0] overflow-hidden mb-4 p-4 flex items-center justify-between opacity-80 hover:opacity-100 transition cursor-pointer" onClick={() => router.push(`/inbox/email/${msg.id}`)}>
                <div className="flex items-center gap-3">
                  <div className="font-medium text-[14px] text-gray-900">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-black/5 focus-within:border-gray-400 transition mb-12">
          <div className="px-4 py-3 bg-[#fbfbfc] border-b border-gray-100 flex items-center gap-2 text-[13px] text-gray-600 font-medium">
            <span className="icon-reply"></span>
            Reply to {email.senderName}
          </div>
          <div className="flex-1 w-full min-h-[150px] overflow-hidden">
            <AiEditor 
              value={replyText}
              onChange={(html, text) => {
                setReplyHtml(html);
                setReplyText(text);
              }}
              placeholder="Write your reply..."
            />
          </div>
          <div className="px-4 py-3 bg-[#fbfbfc] border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-400">
              <button className="hover:text-gray-600"><span className="icon-text-b"></span></button>
              <button className="hover:text-gray-600"><span className="icon-paperclip"></span></button>
            </div>
            <button 
              onClick={handleSend}
              disabled={!replyText || isSending}
              className="flex items-center gap-2 bg-gray-900 hover:bg-black transition text-white px-4 py-1.5 rounded-md text-[13px] font-medium disabled:opacity-50"
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
