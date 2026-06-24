"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { sendEmail } from "@/lib/gmail";
import { Paperclip, X, ArrowsOutSimple } from "@phosphor-icons/react";
import dynamic from "next/dynamic";

const AiEditor = dynamic(() => import("@/components/AiEditor"), { ssr: false });

export default function ComposePage() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [bodyText, setBodyText] = useState("");
  const searchParams = useSearchParams();
  const draftMessageId = searchParams.get('draft');
  const [draftId, setDraftId] = useState(null);
  
  const [isSending, setIsSending] = useState(false);
  
  React.useEffect(() => {
    async function loadDraft() {
      if (!draftMessageId || !session?.providerAccessToken) return;
      try {
        const { fetchEmailDetails, getDraftIdByMessageId } = await import("@/lib/gmail");
        const { parseEmailContent } = await import("@/lib/emailParser");
        
        const dId = await getDraftIdByMessageId(session.providerAccessToken, draftMessageId);
        setDraftId(dId);
        
        const rawMsg = await fetchEmailDetails(session.providerAccessToken, draftMessageId);
        const parsed = parseEmailContent(rawMsg);
        setTo(parsed.to || "");
        setSubject(parsed.subject || "");
        setBody(parsed.htmlBody || parsed.body || "");
        setBodyText(parsed.body || "");
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
    loadDraft();
  }, [draftMessageId, session]);

  React.useEffect(() => {
    if (!to && !subject && !bodyText && !body) return;
    
    const timeoutId = setTimeout(async () => {
      if (!session?.providerAccessToken) return;
      try {
        const { saveDraft } = await import("@/lib/gmail");
        const result = await saveDraft(session.providerAccessToken, draftId, to, subject, bodyText || body, body);
        if (!draftId && result.id) {
          setDraftId(result.id);
        }
      } catch (e) {
        console.error("Auto-save draft failed", e);
      }
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [to, subject, bodyText, body, draftId, session]);
  
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleSend = async () => {
    if (!session?.providerAccessToken || !to || !body) return;
    setIsSending(true);
    try {
      await sendEmail(session.providerAccessToken, to, subject, bodyText || body, body);
      
      if (draftId) {
        const { deleteDraft } = await import("@/lib/gmail");
        await deleteDraft(session.providerAccessToken, draftId).catch(() => {});
      }
      
      // Background Profiling
      const user = useAuthStore.getState().user;
      if (user) {
        import("@/app/actions").then(({ analyzeWritingStyleAction }) => {
          const currentStyle = user.prefs?.writingStyle || "";
          analyzeWritingStyleAction(bodyText || body, currentStyle).then(async (newStyle) => {
            if (newStyle && newStyle !== currentStyle) {
              const { account } = await import("@/lib/appwrite");
              await account.updatePrefs({ ...user.prefs, writingStyle: newStyle });
              useAuthStore.getState().checkAuth(); // Refresh user state
            }
          });
        });
      }

      router.push("/inbox");
    } catch (error) {
      console.error("Failed to send email", error);
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#eceae6] relative overflow-visible p-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200 overflow-visible flex flex-col min-h-[400px]">
        {/* Header Controls */}
        <div className="flex items-center justify-end p-2 gap-1 border-b border-gray-100">
          <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition">
            <ArrowsOutSimple size={16} />
          </button>
          <button 
            onClick={async () => {
              if ((to || subject || bodyText || body) && session?.providerAccessToken) {
                const { saveDraft } = await import("@/lib/gmail");
                await saveDraft(session.providerAccessToken, draftId, to, subject, bodyText || body, body).catch(() => {});
              }
              router.back();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Input Fields */}
        <div className="flex flex-col flex-1 p-6 space-y-4">
          <div className="flex items-center border-b border-gray-100 pb-2">
            <span className="text-[13px] font-medium text-[#2b323b] w-12">To</span>
            <input 
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1 outline-none bg-transparent text-[14px] text-gray-700 placeholder:text-gray-400"
            />
          </div>

          <div className="border-b border-gray-100 pb-2">
            <input 
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full outline-none bg-transparent text-[14px] font-medium text-gray-800 placeholder:font-normal placeholder:text-gray-400"
            />
          </div>

          <div className="flex-1 w-full min-h-[200px] overflow-visible">
            <AiEditor 
              value={body}
              onChange={(html, text) => {
                setBody(html);
                setBodyText(text);
              }}
              placeholder="Write your message..."
              borderless={true}
            />
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="px-6 pb-4 flex flex-wrap gap-2">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg text-[13px] text-gray-700">
                <Paperclip size={14} />
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="ml-1 text-gray-500 hover:text-gray-800">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 bg-[#eceae6] border-t border-gray-100 rounded-b-xl">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition"
          >
            <Paperclip size={18} />
          </button>

          <div className="flex items-center gap-3">
            <button 
              onClick={async () => {
                if (draftId && session?.providerAccessToken) {
                  const { deleteDraft } = await import("@/lib/gmail");
                  await deleteDraft(session.providerAccessToken, draftId).catch(() => {});
                }
                router.back();
              }}
              className="text-[14px] font-medium text-gray-600 hover:text-[#2b323b] transition"
            >
              Discard
            </button>
            <button 
              onClick={handleSend}
              disabled={!to || !body || isSending}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-[#2b323b] px-5 py-1.5 rounded-lg text-[14px] font-medium disabled:opacity-50 transition shadow-sm"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
