"use client";

import React, { useEffect, useState, useRef, startTransition } from "react";
import { useAuthStore } from "@/lib/store";
import { fetchEmailDetails, sendEmail } from "@/lib/gmail";
import { parseEmailContent } from "@/lib/emailParser";
import { summarizeEmailAction, draftReplyAction } from "@/app/actions";
import { ArrowLeft, Sparkle, PaperPlaneRight, CaretDown, CaretUp, Star, Clock, Check, Trash, DotsThree, ArrowBendUpLeft, ArrowBendDoubleUpLeft, ArrowBendUpRight, Command } from "@phosphor-icons/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dynamic from "next/dynamic";
import { EmailDetailSkeleton } from "@/components/Skeletons";

const AiEditor = dynamic(() => import("@/components/AiEditor"), { ssr: false });

const EmailIframe = React.memo(({ htmlBody, iframeRef }) => {
  return (
    <iframe
      ref={iframeRef}
      srcDoc={`<base target="_blank" /><meta name="referrer" content="no-referrer" />${htmlBody}`}
      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
      referrerPolicy="no-referrer"
      loading="lazy"
      className="w-full border-none min-h-[300px]"
      title="Email Content"
      style={{ overflow: 'hidden' }}
    />
  );
});

export default function EmailDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, user, inboxEmails, checkAuth } = useAuthStore();
  const iframeRef = useRef(null);
  
  const filter = searchParams.get('filter');
  const searchQ = searchParams.get('search');
  
  const getBackUrl = () => {
    let url = '/inbox';
    const params = new URLSearchParams();
    if (filter) params.set('filter', filter);
    if (searchQ) params.set('search', searchQ);
    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
  };

  const getEmailUrl = (emailId) => {
    const params = new URLSearchParams();
    if (filter) params.set('filter', filter);
    if (searchQ) params.set('search', searchQ);
    const qs = params.toString();
    return `/inbox/email/${emailId}${qs ? `?${qs}` : ''}`;
  };
  
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
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [resolvedToken, setResolvedToken] = useState(null);
  const [replyDraftId, setReplyDraftId] = useState(null);
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);

  const saveInlineDraft = async () => {
    if (!resolvedToken || !replyType || !email) return;
    if (!replyText && !replyHtml && !draft) return;
    try {
      const { saveDraft } = await import("@/lib/gmail");
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
      
      let subject = email.subject || "";
      if (replyType === 'forward') {
         subject = subject.toLowerCase().startsWith("fwd:") ? subject : `Fwd: ${subject}`;
      } else {
         subject = subject.toLowerCase().startsWith("re:") ? subject : `Re: ${subject}`;
      }

      const result = await saveDraft(
        resolvedToken, 
        replyDraftId, 
        toField, 
        subject, 
        replyText || draft, 
        replyHtml || draft, 
        attachments, 
        email.threadId, 
        email.messageId, 
        email.references
      );
      if (!replyDraftId && result.id) {
        setReplyDraftId(result.id);
      }
    } catch (e) {
      console.error("Save inline reply draft failed", e);
    }
  };

  useEffect(() => {
    if (!replyType || !email) return;
    if (!replyText && !replyHtml && !draft) return;
    const timeoutId = setTimeout(saveInlineDraft, 3000);
    return () => clearTimeout(timeoutId);
  }, [replyText, replyHtml, draft, replyDraftId, resolvedToken, replyType, email, attachments, forwardTo]);

  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiPrompt, setShowAiPrompt] = useState(false);

  const [threadMessages, setThreadMessages] = useState([]);
  const [authError, setAuthError] = useState(null);
  
  const [showDetails, setShowDetails] = useState(false);
  const [fullThreadLoaded, setFullThreadLoaded] = useState(false);

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
    setFullThreadLoaded(false);

    async function load() {
      let token = session?.providerAccessToken;

      if (!token) {
           setAuthError("No Google access token found. Please ensure 'Store access tokens' is enabled in your Appwrite Google Provider settings, then sign out and sign in again.");
           setLoading(false);
           return;
      }

      try {
        const { getCachedEmailBody } = await import("@/lib/db");
        const cachedBody = await getCachedEmailBody(id);
        
        let mainMsg;
        let tId;

        const fetchThreadBackground = async (tkn, threadIdToFetch, isRetry = false) => {
          if (!threadIdToFetch) return;
          try {
            const { fetchThreadDetails } = await import("@/lib/gmail");
            const { parseEmailContent } = await import("@/lib/emailParser");
            const threadData = await fetchThreadDetails(tkn, threadIdToFetch);
            if (threadData.error && (threadData.error.code === 401 || threadData.error.status === 'UNAUTHENTICATED')) {
              if (!isRetry) {
                await checkAuth();
                const newToken = useAuthStore.getState().session?.providerAccessToken;
                if (newToken && newToken !== tkn) {
                  return fetchThreadBackground(newToken, threadIdToFetch, true);
                }
              }
              throw new Error("401 Unauthorized");
            }
            const parsedMsgs = (threadData.messages || []).map(msg => parseEmailContent(msg));
            setThreadMessages(parsedMsgs);
            setFullThreadLoaded(true);
          } catch(e) { console.error(e); }
        };

        if (cachedBody) {
          mainMsg = cachedBody;
          if (!mainMsg.senderName) {
             mainMsg.senderName = mainMsg.from;
             mainMsg.senderEmail = mainMsg.from;
          }
          if (!mainMsg.id) {
             mainMsg.id = id;
          }
          tId = cachedBody.threadId;
          setEmail(mainMsg);
          setThreadMessages([mainMsg]);
          setLoading(false); // Instant render
          fetchThreadBackground(token, tId);
        } else {
          let rawMsg = await fetchEmailDetails(token, id);
          if (rawMsg.error && (rawMsg.error.code === 401 || rawMsg.error.status === 'UNAUTHENTICATED')) {
            await checkAuth();
            const newToken = useAuthStore.getState().session?.providerAccessToken;
            if (newToken && newToken !== token) {
              token = newToken;
              setResolvedToken(token);
              rawMsg = await fetchEmailDetails(token, id);
            }
          }
          const { parseEmailContent } = await import("@/lib/emailParser");
          mainMsg = parseEmailContent(rawMsg);
          
          tId = rawMsg.threadId;

          setEmail(mainMsg);
          setThreadMessages([mainMsg]);
          setLoading(false);
          
          const { saveCachedEmailBody } = await import("@/lib/db");
          saveCachedEmailBody(id, mainMsg);
          fetchThreadBackground(token, tId);
        }

        // Mark as read in background
        const cachedInbox = useAuthStore.getState().inboxEmails;
        const currentEmailInStore = cachedInbox?.find(e => e.id === id);
        if (currentEmailInStore && currentEmailInStore.isUnread) {
          const { markEmailAsRead } = await import("@/lib/gmail");
          markEmailAsRead(token, id).catch(console.error);
          useAuthStore.getState().setInboxEmails(
            cachedInbox.map(e => e.id === id ? { ...e, isUnread: false } : e)
          );
        }
        
        setResolvedToken(token);
      } catch (error) {
        console.error("Error fetching email:", error);
        setAuthError(`Gmail API Error: ${error.message}.`);
      } finally {
        setLoading(false);
      }
    }
    if (session) {
      load();
    }
  }, [id, session?.providerAccessToken, user?.$id]);

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
    router.push(getBackUrl());
  };

  const handleTrash = async () => {
    if (!resolvedToken) return;
    const { trashEmail } = await import("@/lib/gmail");
    await trashEmail(resolvedToken, id);
    
    const { inboxEmails, setInboxEmails } = useAuthStore.getState();
    if (inboxEmails) {
      setInboxEmails(inboxEmails.filter(e => e.id !== id));
    }
    router.push(getBackUrl());
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
      router.push(getBackUrl());
    } catch (e) {
      console.error(e);
    } finally {
      setIsUnsubscribing(false);
      setShowUnsubscribeModal(false);
    }
  };

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
  }, [showUnsubscribeModal, isUnsubscribing, handleUnsubscribe, resolvedToken, email, id, router]);


  const handleSummarize = async () => {
    if (!email) return;

    try {
      const { incrementAiUsage } = await import("@/lib/usage");
      await incrementAiUsage(user, checkAuth);
    } catch (error) {
      if (!error.message?.includes("limit reached")) alert(error.message);
      return;
    }

    setIsSummarizing(true);
    
    let context = "";
    if (user?.prefs) {
      context = `Job Title: ${user.prefs.jobName || 'Unknown'}, Company: ${user.prefs.company || 'Unknown'}`;
    }
    
    const threadContent = threadMessages && threadMessages.length > 0 
      ? threadMessages.map(m => `From: ${m.senderName} (${m.senderEmail})\nDate: ${m.date}\n\n${m.body || m.snippet}`).join("\n\n---\n\n")
      : (email.body || email.snippet);
      
    const result = await summarizeEmailAction(threadContent, context);
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
          router.push(getEmailUrl(inboxEmails[currentIndex + 1].id));
        }
      } else if (e.key === "k") {
        e.preventDefault();
        if (currentIndex > 0) {
          router.push(getEmailUrl(inboxEmails[currentIndex - 1].id));
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
      if (!error.message?.includes("limit reached")) alert(error.message);
      return;
    }

    setIsDrafting(true);
    const promptToUse = aiPrompt.trim() ? aiPrompt : "Reply professionally acknowledging receipt.";
    
    let context = "";
    if (user?.prefs) {
      context = `Job Title: ${user.prefs.jobName || 'Unknown'}, Company: ${user.prefs.company || 'Unknown'}`;
    }
    
    const result = await draftReplyAction(email.body || email.snippet, promptToUse, context);
    
    startTransition(() => {
      setReplyType('reply');
      setDraft(result);
      setReplyHtml(result);
      setReplyText(result); 
      setIsDrafting(false);
      setShowAiPrompt(false);
      setAiPrompt("");
    });

    // Scroll to bottom after state updates
    setTimeout(() => {
      const scrollContainer = document.querySelector('.overflow-y-auto');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleExpandHistory = (e) => {
    e.preventDefault();
    if (!email) return;
    
    const historyHtml = `<br><br><div class="gmail_quote"><div dir="ltr" class="gmail_attr">On ${email.date ? format(new Date(email.date), "MMM d, yyyy, h:mm a") : ""} ${email.senderName} &lt;<a href="mailto:${email.senderEmail}">${email.senderEmail}</a>&gt; wrote:<br></div><blockquote class="gmail_quote" style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex">${email.body || email.snippet}</blockquote></div>`;
    
    setReplyHtml(prev => prev + historyHtml);
    setReplyText(prev => prev + "\n\nOn ... wrote:\n" + (email.snippet || ""));
  };

  const handleAttachment = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachments(prev => [...prev, {
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          content: ev.target.result,
        }]);
      };
      reader.readAsDataURL(file);
    });
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

      await sendEmail(resolvedToken, toField, subject, replyText, replyHtml || replyText, attachments, email.threadId, email.messageId, email.references);
      
      if (replyDraftId) {
        const { deleteDraft } = await import("@/lib/gmail");
        await deleteDraft(resolvedToken, replyDraftId).catch(() => {});
        setReplyDraftId(null);
      }
      
      // Update UI seamlessly instead of routing away
      setReplyType(null);
      setReplyText("");
      setReplyHtml("");
      setDraft("");
      setAttachments([]);
      setIsSending(false);
      
      // Re-fetch the thread to show the new message
      if (email.threadId) {
        const { fetchThreadDetails } = await import("@/lib/gmail");
        const { parseEmailContent } = await import("@/lib/emailParser");
        const threadData = await fetchThreadDetails(resolvedToken, email.threadId);
        if (!threadData.error) {
          const parsedMsgs = (threadData.messages || []).map(msg => parseEmailContent(msg));
          setThreadMessages(parsedMsgs);
        }
      }
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



  const executeSnooze = async (hours, absoluteTimestamp = null) => {
    if (!resolvedToken || !email || !user) return;
    try {
      const until = absoluteTimestamp ? absoluteTimestamp : Date.now() + (hours * 60 * 60 * 1000);
      const currentSnoozed = user.prefs?.snoozedEmails || [];
      const newSnoozed = [...currentSnoozed, { id, emailAddress: email.receiverEmail || user.email, until }];
      
      const { account } = await import("@/lib/appwrite");
      await account.updatePrefs({ ...user.prefs, snoozedEmails: newSnoozed });

      const { doneEmail } = await import("@/lib/gmail");
      await doneEmail(resolvedToken, id);
      
      const { inboxEmails, setInboxEmails } = useAuthStore.getState();
      if (inboxEmails) {
        setInboxEmails(inboxEmails.filter(e => e.id !== id));
      }
      setShowSnoozeMenu(false);
      router.push(getBackUrl());
    } catch (e) {
      console.error("Snooze failed", e);
    }
  };

  const handleNext = async () => {
    await saveInlineDraft();
    const currentIndex = inboxEmails?.findIndex(e => e.id === id);
    if (currentIndex !== -1 && currentIndex < inboxEmails.length - 1) {
      router.push(getEmailUrl(inboxEmails[currentIndex + 1].id));
    }
  };

  const handlePrev = async () => {
    await saveInlineDraft();
    const currentIndex = inboxEmails?.findIndex(e => e.id === id);
    if (currentIndex > 0) {
      router.push(getEmailUrl(inboxEmails[currentIndex - 1].id));
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
            onClick={async () => {
              await saveInlineDraft();
              router.push(getBackUrl());
            }} 
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
          <div className="relative">
            <button onClick={() => setShowSnoozeMenu(!showSnoozeMenu)} title="Snooze" className={`p-2 transition rounded-md flex items-center justify-center ${showSnoozeMenu ? 'bg-[#2b323b]/10 text-[#2b323b]' : 'text-gray-500 hover:text-[#2b323b] hover:bg-[#2b323b]/5'}`}>
              <Clock size={18} />
            </button>
            {showSnoozeMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-[#fbfbfc] shadow-md rounded-md py-1 border border-gray-100 z-50">
                <button onClick={() => executeSnooze(4)} className="w-full text-left px-3 py-2 hover:bg-[#eceae6] transition text-[13px] text-gray-700">Later Today (+4h)</button>
                <button onClick={() => executeSnooze(24)} className="w-full text-left px-3 py-2 hover:bg-[#eceae6] transition text-[13px] text-gray-700">Tomorrow (+24h)</button>
                <button onClick={() => executeSnooze(24 * 7)} className="w-full text-left px-3 py-2 hover:bg-[#eceae6] transition text-[13px] text-gray-700">Next Week (+7d)</button>
                
                <div className="px-3 py-2 border-t border-gray-100 mt-1 bg-gray-50/50 rounded-b-md">
                  <div className="text-[10px] text-gray-400 font-semibold mb-1.5 uppercase tracking-wider">Custom Date & Time</div>
                  <div className="relative">
                    <input 
                      type="datetime-local" 
                      className="w-full text-[12px] p-1.5 pl-2 pr-2 border border-gray-200 rounded-md outline-none focus:border-[#2b323b] focus:ring-1 focus:ring-[#2b323b] transition-shadow mb-1 bg-white text-gray-700 shadow-sm"
                      onChange={(e) => {
                        if (e.target.value) {
                          const date = new Date(e.target.value);
                          if (!isNaN(date.getTime()) && date.getTime() > Date.now()) {
                             executeSnooze(null, date.getTime());
                          } else if (!isNaN(date.getTime()) && date.getTime() <= Date.now()) {
                             alert("Please select a future time.");
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
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
              <img 
                src={`https://unavatar.io/${email.senderEmail}?fallback=https://ui-avatars.com/api/?name=${email.senderName || 'U'}&background=random`} 
                alt="Profile" 
                className="h-9 w-9 rounded-full object-cover shrink-0 bg-white" 
              />
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
              <div className="mt-3 bg-gradient-to-r from-[#eceae6] to-[#f5f2eb] p-[1px] rounded-xl shadow-sm max-w-xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2 bg-white rounded-[11px] p-2">
                  <div className="pl-2 flex items-center justify-center">
                    <Sparkle size={18} className="text-[#2b323b] animate-pulse" weight="fill" />
                  </div>
                  <input
                    type="text"
                    placeholder="How should AI reply? (e.g. tell them I'll be attending)"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && aiPrompt.trim() && !isDrafting) {
                        e.preventDefault();
                        handleDraftReply();
                      }
                    }}
                    disabled={isDrafting}
                    className="flex-1 bg-transparent border-none outline-none text-[14px] px-1 text-[#2b323b] placeholder-gray-400 disabled:opacity-50"
                    autoFocus
                  />
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleDraftReply();
                    }}
                    disabled={!aiPrompt.trim() || isDrafting}
                    className="bg-[#2b323b] hover:bg-[#3f4854] text-white rounded-lg px-4 py-1.5 text-[13px] font-medium transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDrafting ? (
                      <span className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Drafting
                      </span>
                    ) : "Generate"}
                  </button>
                </div>
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
              <EmailIframe htmlBody={email.htmlBody} iframeRef={iframeRef} />
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
            <div className="flex-1 w-full min-h-[150px] overflow-visible flex flex-col">
              <AiEditor 
                value={replyHtml || replyText}
                onChange={(html, text) => {
                  setReplyHtml(html);
                  setReplyText(text);
                }}
                placeholder="Write your reply..."
                borderless={true}
              />
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pb-3">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-md px-2 py-1 text-[13px] text-gray-700">
                      <span className="truncate max-w-[150px]">{att.filename}</span>
                      <button 
                        onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-4 py-3 bg-[#fbfbfc] border-t border-gray-100 flex justify-between items-center rounded-b-xl">
              <div className="flex items-center gap-3 text-gray-400">
                <button type="button" onClick={handleExpandHistory} className="hover:text-[#50686c] transition flex items-center justify-center p-1 bg-[#eceae6] rounded-md"><DotsThree size={16} weight="bold" /></button>
                <label className="hover:text-[#50686c] transition flex items-center justify-center p-1 bg-[#eceae6] rounded-md cursor-pointer">
                  <input type="file" multiple className="hidden" onChange={handleAttachment} />
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M209.66,122.34a8,8,0,0,1,0,11.32l-82,82a56,56,0,0,1-79.2-79.2l83.52-83.52a38.05,38.05,0,0,1,53.8,53.8l-80.4,80.4a22.25,22.25,0,0,1-31.42-31.42l72.23-72.23a8,8,0,1,1,11.31,11.32L85.27,167a6.25,6.25,0,0,0,8.84,8.84l80.4-80.4a22.05,22.05,0,0,0-31.18-31.18l-83.52,83.52a40,40,0,1,0,56.57,56.57l82-82A8,8,0,0,1,209.66,122.34Z"></path></svg>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={async () => {
                    if (replyDraftId && resolvedToken) {
                      const { deleteDraft } = await import("@/lib/gmail");
                      await deleteDraft(resolvedToken, replyDraftId).catch(() => {});
                      setReplyDraftId(null);
                    }
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
