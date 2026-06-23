"use client";

import { useState } from "react";
import { PaperPlaneRight, Trash, CircleNotch } from "@phosphor-icons/react";
import { sendEmail } from "@/lib/gmail";
import { useAuthStore } from "@/lib/store";

export default function AiComposeBox({ initialTo, initialSubject, initialBody, resolvedToken, onDiscard, onSent }) {
  const { user } = useAuthStore();
  const [to, setTo] = useState(initialTo || "");
  const [subject, setSubject] = useState(initialSubject || "");
  const [body, setBody] = useState(initialBody || "");
  
  const [status, setStatus] = useState("idle"); // "idle" | "sending" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim() || !resolvedToken) return;
    
    setStatus("sending");
    setErrorMsg("");
    
    try {
      await sendEmail(resolvedToken, to, subject, body);
      
      // Background Profiling
      if (user) {
        import("@/app/actions").then(({ analyzeWritingStyleAction }) => {
          const currentStyle = user.prefs?.writingStyle || "";
          analyzeWritingStyleAction(body, currentStyle).then(async (newStyle) => {
            if (newStyle && newStyle !== currentStyle) {
              const { account } = await import("@/lib/appwrite");
              await account.updatePrefs({ ...user.prefs, writingStyle: newStyle });
              useAuthStore.getState().checkAuth(); // Refresh user state
            }
          });
        });
      }
      
      if (onSent) {
        onSent(to);
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMsg("Failed to send email. Please try again.");
    }
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden mt-4 mb-2 flex flex-col font-[Inter] max-w-2xl w-full">
      <div className="flex flex-col p-4 space-y-3">
        <div className="flex items-center border-b border-gray-100 pb-2">
          <span className="text-[13px] font-medium text-[#2b323b] w-12">To</span>
          <input 
            type="email" 
            value={to} 
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 outline-none bg-transparent text-[14px] text-gray-700 placeholder:text-gray-400"
            placeholder="recipient@example.com"
          />
        </div>
        
        <div className="border-b border-gray-100 pb-2">
          <input 
            type="text" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="w-full outline-none bg-transparent text-[14px] font-medium text-gray-800 placeholder:font-normal placeholder:text-gray-400"
            placeholder="Subject"
          />
        </div>
        
        <textarea 
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full text-[14px] text-gray-700 outline-none resize-none min-h-[120px] bg-transparent mt-2 leading-relaxed placeholder:text-gray-400"
          placeholder="Write your message..."
        />
        
        {status === "error" && (
          <div className="text-[13px] text-red-500 font-medium mt-1">{errorMsg}</div>
        )}
      </div>
      
      <div className="flex items-center justify-between p-3 bg-[#eceae6] border-t border-gray-100 rounded-b-xl">
        <button 
          className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded transition cursor-not-allowed opacity-50"
          title="Attachments not supported in AI draft"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M209.66,122.34a8,8,0,0,1,0,11.32l-82.05,82a56,56,0,0,1-79.2-79.21L147.67,35.73a40,40,0,1,1,56.61,56.55L105,190.9A24,24,0,1,1,71,157l82.49-84.2a8,8,0,1,1,11.38,11.24L82.39,168.24a8,8,0,0,0,11.22,11.41l99.28-98.66a24,24,0,1,0-34-33.9L60.33,145.75a40,40,0,1,0,56.61,56.51l81.4-81.24A8,8,0,0,1,209.66,122.34Z"></path></svg>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={onDiscard}
            className="text-[13px] font-medium text-gray-600 hover:text-[#2b323b] transition"
            disabled={status === "sending"}
          >
            Discard
          </button>
          <button 
            onClick={handleSend}
            disabled={status === "sending" || !to.trim() || !subject.trim() || !body.trim()}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-[#2b323b] px-4 py-1.5 rounded-lg text-[13px] font-medium disabled:opacity-50 transition shadow-sm flex items-center gap-1.5"
          >
            {status === "sending" ? (
              <>
                <CircleNotch size={14} className="animate-spin" weight="bold" />
                Sending...
              </>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
