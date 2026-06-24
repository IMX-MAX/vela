"use client";

import { useEffect, useState, useRef, startTransition } from "react";
import { useAuthStore } from "@/lib/store";
import { fetchEmailDetails, sendEmail } from "@/lib/gmail";
import { parseEmailContent } from "@/lib/emailParser";
import { summarizeEmailAction, draftReplyAction } from "@/app/actions";
import { ArrowLeft, Sparkle, PaperPlaneRight, CaretDown, CaretUp, Star, Clock, Check, Trash, DotsThree, ArrowBendUpLeft, ArrowBendDoubleUpLeft, ArrowBendUpRight, Command } from "@phosphor-icons/react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dynamic from "next/dynamic";
import { EmailDetailSkeleton } from "@/components/Skeletons";

const AiEditor = dynamic(() => import("@/components/AiEditor"), { ssr: false });

export default function EmailDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { session, user, inboxEmails, checkAuth } = useAuthStore();
  const iframeRef = useRef(null);
  
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewSubject, setPreviewSubject] = useState(() => {
    const cached = useAuthStore.getState().inboxEmails?.find((e) => e.id === id);
    return cached?.subject || "";
  });
  
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  const [draft, setDraft] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  
  const [replyType, setReplyType] = useState(null);
  const [forwardTo, setForwardTo] = useState("");
  
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
    const cached = useAuthStore.getState().inboxEmails?.find((e) => e.id === id);
    setPreviewSubject(cached?.subject || "");
    setEmail(null);
    setThreadMessages([]);
    setAuthError(null);
    setLoading(true);

    async function load() {
      let token = session?.providerAccessToken;

      if (!token) {
           setAuthError("No Google access token found. Please ensure 'Store access tokens' is enabled in your Appwrite Google Provider settings, then sign out and sign in again.");
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
            isStarred: (msg.labelIds || []).includes("STARRED"),
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

    try {
      const { incrementAiUsage } = await import("@/lib/usage");
      await incrementAiUsage(user, checkAuth);
    } catch (error) {
      alert(error.message);
      return;
    }

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
    
    try {
      const { incrementAiUsage } = await import("@/lib/usage");
      await incrementAiUsage(user, checkAuth);
    } catch (error) {
      alert(error.message);
      return;
    }

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
    if (replyType === 'forward' && !forwardTo) return;
    
    setIsSending(true);
    try {
      let toField = email.senderEmail;
      if (replyType === 'replyAll') {
        const allEmails = new Set();
        if (email.senderEmail) allEmails.add(email.senderEmail);
        if (email.rawTo) {
          email.rawTo.split(',').forEach(addr => {
            const match = addr.match(/<([^>]+)>/) || addr.match(/([\w.-]+@[\w.-]+)/);
            if (match && match[1]) allEmails.add(match[1].trim());
            else allEmails.add(addr.trim());
          });
        }
        toField = Array.from(allEmails).join(', ');
      } else if (replyType === 'forward') {
        toField = forwardTo;
      }
      
      let subject = email.subject;
      if (replyType === 'forward') {
         subject = subject.toLowerCase().startsWith("fwd:") ? subject : `Fwd: ${subject}`;
      } else {
         subject = subject.toLowerCase().startsWith("re:") ? subject : `Re: ${subject}`;
      }

      await sendEmail(resolvedToken, toField, subject, replyText, replyHtml || replyText);
      router.push("/inbox");
    } catch (error) {
      console.error("Failed to send", error);
      setIsSending(false);
    }
  };

  if (loading) {
    return <EmailDetailSkeleton subject={previewSubject} />;
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

  const handleStar = async () => {
    if (!resolvedToken || !email) return;
    const { starEmail, unstarEmail } = await import("@/lib/gmail");
    if (email.isStarred) {
      setEmail({ ...email, isStarred: false });
      await unstarEmail(resolvedToken, id);
    } else {
      setEmail({ ...email, isStarred: true });
      await starEmail(resolvedToken, id);
    }
  };

  const handleUnsubscribe = async () => {
    if (!resolvedToken || !email) return;
    setIsUnsubscribing(true);
    try {
      const { trashEmail } = await import("@/lib/gmail");
      await trashEmail(resolvedToken, id); // Just trashing it as a proxy for unsubscribing, or we can just alert if real unsubsribe isn't implemented.
      
      const { inboxEmails, setInboxEmails } = useAuthStore.getState();
      if (inboxEmails) {
        setInboxEmails(inboxEmails.filter(e => e.id !== id));
      }
      router.push("/inbox");
    } catch (e) {
      console.error(e);
    } finally {
      setIsUnsubscribing(false);
      setShowUnsubscribeModal(false);
    }
  };

  const handleSnooze = () => {
    alert("Snooze functionality coming soon.");
  };

  const handleNext = () => {
    const currentIndex = inboxEmails?.findIndex(e => e.id === id);
    if (currentIndex !== -1 && currentIndex < inboxEmails.length - 1) {
      router.push(`/inbox/email/${inboxEmails[currentIndex + 1].id}`);
    }
  };

  const handlePrev = () => {
    const currentIndex = inboxEmails?.findIndex(e => e.id === id);
    if (currentIndex > 0) {
      router.push(`/inbox/email/${inboxEmails[currentIndex - 1].id}`);
    }
  };

  if (!email) {
    return (
      <div className="p-8">Email not found.</div>
    );
  }

  const currentIndex = inboxEmails?.findIndex(e => e.id === id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < inboxEmails?.length - 1;

  useEffect(() => {
    if (!showUnsubscribeModal) return;
    
    const handleModalKeys = (e) => {
      if (e.key === "Escape") {
        setShowUnsubscribeModal(false);
      } else if (e.key === "Enter" && !isUnsubscribing) {
        handleUnsubscribe();
      }
    };
    
    window.addEventListener("keydown", handleModalKeys);
    return () => window.removeEventListener("keydown", handleModalKeys);
  }, [showUnsubscribeModal, isUnsubscribing, handleUnsubscribe]);

  return (
    <div className="flex flex-col h-full bg-[#eceae6] rounded-2xl relative overflow-y-auto">
      {/* Unsubscribe Modal */}
      {showUnsubscribeModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/5 rounded-2xl backdrop-blur-[1px]">
          <div className="bg-[#e8e4db] w-[360px] rounded-2xl shadow-2xl border border-white/40 p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200"
               style={{ background: 'linear-gradient(135deg, #f5f2eb 0%, #e8e4db 100%)' }}>
            <h3 className="text-[17px] font-semibold text-[#2b323b] mb-2">Unsubscribe</h3>
            <p className="text-[14px] text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to unsubscribe from <br/>{email.senderEmail}?
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleUnsubscribe}
                disabled={isUnsubscribing}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-[#f5f2eb] hover:bg-white text-[#2b323b] text-[14px] font-medium rounded-lg transition-colors border border-white/60 shadow-sm disabled:opacity-50"
              >
                <span>{isUnsubscribing ? "Unsubscribing..." : "Unsubscribe"}</span>
                <span className="text-[12px] text-gray-400 font-normal">Enter</span>
              </button>
              <button 
                onClick={() => setShowUnsubscribeModal(false)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-[#dfdbd1] hover:bg-[#d6d2c8] text-gray-600 text-[14px] font-medium rounded-lg transition-colors border border-black/5"
              >
                <span>Cancel</span>
                <span className="text-[12px] text-gray-400 font-normal">Esc</span>
              </button>
            </div>
            
            {/* Hidden inputs to capture key events since we don't have a global listener in this scoped div easily without useEffect, but we can just use a simple focus trap or useEffect */}
          </div>
        </div>
      )}
      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-4 sticky top-0 z-10 rounded-t-2xl bg-[#eceae6] border-b border-[#dddcdc]">
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => router.back()} 
            title="Back to inbox"
            className="p-2 text-gray-500 hover:text-[#2b323b] transition rounded-md hover:bg-[#2b323b]/5 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="w-px h-6 bg-[#dddcdc] mx-1"></div>

          <button 
            onClick={handlePrev}
            disabled={!hasPrev}
            title="Previous (k)"
            className="p-2 text-gray-500 hover:text-[#2b323b] disabled:opacity-30 disabled:hover:bg-transparent transition rounded-md hover:bg-[#2b323b]/5 flex items-center justify-center"
          >
             <CaretUp size={16} weight="bold" />
          </button>
          <button 
            onClick={handleNext}
            disabled={!hasNext}
            title="Next (j)"
            className="p-2 text-gray-500 hover:text-[#2b323b] disabled:opacity-30 disabled:hover:bg-transparent transition rounded-md hover:bg-[#2b323b]/5 flex items-center justify-center"
          >
             <CaretDown size={16} weight="bold" />
          </button>
          
          <span className="ml-2 text-[13px] text-gray-500 font-medium select-none">
            {inboxEmails && inboxEmails.length > 0 
              ? `${(currentIndex + 1) || 1} / ${inboxEmails.length}`
              : "1 / 1"}
          </span>
        </div>
        
        <div className="flex items-center gap-1 pr-1">
          <button onClick={handleStar} title="Star" className={`p-2 transition rounded-md flex items-center justify-center ${email.isStarred ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-500 hover:text-[#2b323b] hover:bg-[#2b323b]/5'}`}>
            <Star size={18} weight={email.isStarred ? "fill" : "regular"} />
          </button>
          <button onClick={handleSnooze} title="Snooze" className="p-2 text-gray-500 hover:text-[#2b323b] transition rounded-md hover:bg-[#2b323b]/5 flex items-center justify-center"><Clock size={18} /></button>
          <button onClick={handleDone} title="Mark as done" className="p-2 text-gray-500 hover:text-[#2b323b] transition rounded-md hover:bg-[#2b323b]/5 flex items-center justify-center"><Check size={18} /></button>
          <button onClick={handleTrash} title="Delete" className="p-2 text-gray-500 hover:text-[#2b323b] transition rounded-md hover:bg-[#2b323b]/5 flex items-center justify-center"><Trash size={18} /></button>
          <div className="w-px h-6 bg-[#dddcdc] mx-1"></div>
          <button title="More options" className="p-2 text-gray-500 hover:text-[#2b323b] transition rounded-md hover:bg-[#2b323b]/5 flex items-center justify-center"><DotsThree size={18} weight="bold" /></button>
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
                  <button onClick={() => setShowUnsubscribeModal(true)} className="ml-2 text-[12px] text-gray-400 hover:text-gray-600 underline decoration-gray-300 hover:decoration-gray-400 underline-offset-2 transition-colors">Unsubscribe</button>
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
                srcDoc={`<base target="_blank" /><meta name="referrer" content="no-referrer" />${email.htmlBody}`}
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                referrerPolicy="no-referrer"
                loading="lazy"
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
        {!replyType ? (
          <div className="flex items-center gap-1 bg-[#eceae6] border border-[#dddcdc] rounded-[10px] p-1 w-fit mb-12 shadow-sm">
            <button onClick={() => startTransition(() => setReplyType('reply'))} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition text-gray-600">
              <ArrowBendUpLeft size={16} weight="bold" />
            </button>
            <button onClick={() => startTransition(() => setReplyType('replyAll'))} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition text-gray-600">
               <ArrowBendDoubleUpLeft size={16} weight="bold" />
            </button>
            <button onClick={() => startTransition(() => setReplyType('forward'))} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition text-gray-600">
               <ArrowBendUpRight size={16} weight="bold" />
            </button>
            <button onClick={() => {
              const ev = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
              document.dispatchEvent(ev);
            }} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition text-gray-600">
               <Command size={16} weight="bold" />
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible transition mb-12">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4">
              <div className="flex items-center gap-1 bg-[#eceae6] rounded-lg p-0.5 w-fit">
                <button onClick={() => startTransition(() => setReplyType('reply'))} className={`p-1.5 rounded-md transition ${replyType === 'reply' ? 'bg-white shadow-sm text-[#2b323b]' : 'text-gray-500 hover:text-[#2b323b]'}`}>
                  <ArrowBendUpLeft size={14} weight="bold" />
                </button>
                <button onClick={() => startTransition(() => setReplyType('replyAll'))} className={`p-1.5 rounded-md transition ${replyType === 'replyAll' ? 'bg-white shadow-sm text-[#2b323b]' : 'text-gray-500 hover:text-[#2b323b]'}`}>
                   <ArrowBendDoubleUpLeft size={14} weight="bold" />
                </button>
                <button onClick={() => startTransition(() => setReplyType('forward'))} className={`p-1.5 rounded-md transition ${replyType === 'forward' ? 'bg-white shadow-sm text-[#2b323b]' : 'text-gray-500 hover:text-[#2b323b]'}`}>
                   <ArrowBendUpRight size={14} weight="bold" />
                </button>
                <button onClick={() => {
                  const ev = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
                  document.dispatchEvent(ev);
                }} className="p-1.5 rounded-md transition text-gray-500 hover:text-[#2b323b]">
                   <Command size={14} weight="bold" />
                </button>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-[#fbfbfc] border-b border-gray-100 text-[13px] text-[#2b323b] flex items-center">
              {replyType === 'reply' && `Reply to ${email.senderName}`}
              {replyType === 'replyAll' && `Reply all to ${email.senderName}${email.rawTo ? `, ${email.rawTo}` : ''}`}
              {replyType === 'forward' && (
                <div className="flex items-center w-full gap-2">
                  <span className="text-[#2b323b] font-medium w-6">To</span>
                  <input 
                    type="text" 
                    placeholder="recipient@example.com"
                    value={forwardTo}
                    onChange={(e) => setForwardTo(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-[#2b323b] placeholder-gray-400"
                    autoFocus
                  />
                </div>
              )}
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
              <div className="flex items-center gap-3 text-gray-400">
                <button className="hover:text-[#50686c] transition flex items-center justify-center p-1 bg-[#eceae6] rounded-md"><DotsThree size={16} weight="bold" /></button>
                <button className="hover:text-[#50686c] transition"><span className="icon-paperclip"></span></button>
                <button className="hover:text-[#50686c] transition font-mono text-[14px]">{'{ }'}</button>
                <button className="hover:text-[#50686c] transition"><Clock size={16} /></button>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    startTransition(() => {
                      setReplyType(null);
                      setReplyText("");
                      setReplyHtml("");
                      setForwardTo("");
                    });
                  }}
                  className="px-2 text-[14px] font-medium text-[#2b323b] hover:text-black transition"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!replyText || isSending || (replyType === 'forward' && !forwardTo)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 transition text-[#2b323b] px-4 py-1.5 rounded-lg text-[14px] font-medium disabled:opacity-50 shadow-sm"
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
