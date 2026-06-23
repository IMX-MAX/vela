"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/lib/store";
import { fetchEmailDetails, sendEmail } from "@/lib/gmail";
import { parseEmailContent } from "@/lib/emailParser";
import { summarizeEmailAction, draftReplyAction } from "@/app/actions";
import { ArrowLeft, Sparkle, PaperPlaneRight, CaretDown } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

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
  const [isSending, setIsSending] = useState(false);
  const [resolvedToken, setResolvedToken] = useState(null);

  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiPrompt, setShowAiPrompt] = useState(false);

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
        const parsed = parseEmailContent(rawMsg);
        
        let senderName = parsed.from;
        let senderEmail = "";
        if (senderName.includes("<")) {
          const parts = senderName.split("<");
          senderName = parts[0].replace(/"/g, "").trim();
          senderEmail = parts[1].replace(">", "").trim();
        }

        setEmail({
          ...parsed,
          senderName,
          senderEmail: senderEmail || parsed.from,
          rawTo: parsed.from
        });
        
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
    setIsSummarizing(false);
  };

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
      await sendEmail(resolvedToken, email.rawTo, subject, replyText);
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
        
        {/* Email Card (Tatem Style) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          
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
              <div className="text-[14px] text-gray-600 whitespace-pre-wrap leading-relaxed">
                {summary}
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

        {/* Reply Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-black/5 focus-within:border-gray-400 transition mb-12">
          <div className="px-4 py-3 bg-[#fbfbfc] border-b border-gray-100 flex items-center gap-2 text-[13px] text-gray-600 font-medium">
            <span className="icon-reply"></span>
            Reply to {email.senderName}
          </div>
          <textarea 
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            className="w-full min-h-[150px] p-4 bg-white outline-none resize-y text-[14px]"
          />
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
