"use client";

import { useEffect, useState } from "react";
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

      // If no Google OAuth token, check Composio MCP
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
          rawTo: parsed.from // we reply to the sender
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

  const handleSummarize = async () => {
    if (!email) return;
    setIsSummarizing(true);
    const result = await summarizeEmailAction(email.body);
    setSummary(result);
    setIsSummarizing(false);
  };

  const handleDraftReply = async () => {
    if (!email) return;
    setIsDrafting(true);
    const promptToUse = aiPrompt.trim() ? aiPrompt : "Reply professionally acknowledging receipt.";
    const result = await draftReplyAction(email.body, promptToUse);
    setDraft(result);
    setReplyText(result); // auto fill the textarea
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
      <div className="flex h-full items-center justify-center bg-[#fdfdfc] rounded-2xl">
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
    <div className="flex flex-col h-full bg-[#fdfdfc] rounded-2xl relative overflow-y-auto">
      {/* Top Bar */}
      <div className="h-14 border-b border-[#e4e3e0] flex items-center px-4 sticky top-0 bg-[#fdfdfc]/90 backdrop-blur-sm z-10 rounded-t-2xl">
        <button 
          onClick={() => router.back()} 
          className="p-2 text-gray-500 hover:text-gray-900 transition rounded-md hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      <div className="max-w-3xl mx-auto w-full px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">{email.subject}</h1>
        
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#e4e3e0] flex items-center justify-center text-lg font-medium text-gray-700">
              {email.senderName ? email.senderName[0].toUpperCase() : "U"}
            </div>
            <div>
              <div className="font-medium text-gray-900 flex items-center gap-2">
                {email.senderName}
                <span className="text-sm font-normal text-gray-500">{email.senderEmail}</span>
              </div>
              <div className="text-sm text-gray-500">
                to me <CaretDown size={12} className="inline" />
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {email.date ? format(new Date(email.date), "MMM d, yyyy, h:mm a") : ""}
          </div>
        </div>

        {/* AI Toolbar */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="flex items-center gap-2 text-sm font-medium bg-[#f0f0f0] hover:bg-[#e4e3e0] transition px-4 py-2 rounded-full text-gray-800 disabled:opacity-50"
            >
              <Sparkle size={16} className="text-purple-600" weight="fill" />
              {isSummarizing ? "Summarizing..." : "Summarize"}
            </button>
            
            <button 
              onClick={() => setShowAiPrompt(!showAiPrompt)}
              disabled={isDrafting}
              className="flex items-center gap-2 text-sm font-medium bg-[#f0f0f0] hover:bg-[#e4e3e0] transition px-4 py-2 rounded-full text-gray-800 disabled:opacity-50"
            >
              <Sparkle size={16} className="text-blue-600" weight="fill" />
              {isDrafting ? "Drafting..." : "Reply with AI"}
            </button>
          </div>
          
          {showAiPrompt && (
            <div className="flex items-center gap-2 mt-2 bg-white border border-[#e4e3e0] rounded-xl p-2 shadow-sm max-w-md">
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
                className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-gray-800 placeholder-gray-400"
                autoFocus
              />
              <button 
                onClick={handleDraftReply}
                disabled={!aiPrompt.trim() || isDrafting}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50"
              >
                Draft
              </button>
            </div>
          )}
        </div>

        {/* Summary Card */}
        {summary && (
          <div className="mb-8 p-5 bg-purple-50 border border-purple-100 rounded-xl">
            <div className="flex items-center gap-2 mb-3 text-purple-800 font-medium">
              <Sparkle size={16} weight="fill" />
              AI Summary
            </div>
            <div className="text-sm text-purple-900 whitespace-pre-wrap leading-relaxed">
              {summary}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="text-[15px] leading-relaxed text-gray-800 mb-12 whitespace-pre-wrap font-sans">
          {email.body}
        </div>

        {/* Reply Section */}
        <div className="border border-[#e4e3e0] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-black/5 focus-within:border-gray-400 transition mb-12">
          <div className="px-4 py-3 bg-[#fbfbfc] border-b border-[#e4e3e0] flex items-center gap-2 text-sm text-gray-600 font-medium">
            <span className="icon-reply"></span>
            Reply to {email.senderName}
          </div>
          <textarea 
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            className="w-full min-h-[150px] p-4 bg-white outline-none resize-y text-[14px]"
          />
          <div className="px-4 py-3 bg-white border-t border-[#e4e3e0] flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-400">
              <button className="hover:text-gray-600"><span className="icon-text-b"></span></button>
              <button className="hover:text-gray-600"><span className="icon-paperclip"></span></button>
            </div>
            <button 
              onClick={handleSend}
              disabled={!replyText || isSending}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 transition text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {isSending ? "Sending..." : "Send"}
              <PaperPlaneRight size={16} weight="fill" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
