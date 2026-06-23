"use client";

import { useState } from "react";
import { PaperPlaneRight, Trash, CircleNotch } from "@phosphor-icons/react";
import { sendEmail } from "@/lib/gmail";
import { useAuthStore } from "@/lib/store";

export default function AiComposeBox({ initialTo, initialSubject, initialBody, resolvedToken, onDiscard }) {
  const { user } = useAuthStore();
  const [to, setTo] = useState(initialTo || "");
  const [subject, setSubject] = useState(initialSubject || "");
  const [body, setBody] = useState(initialBody || "");
  
  const [status, setStatus] = useState("idle"); // "idle" | "sending" | "sent" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim() || !resolvedToken) return;
    
    setStatus("sending");
    setErrorMsg("");
    
    try {
      await sendEmail(resolvedToken, to, subject, body);
      setStatus("sent");
      
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
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMsg("Failed to send email. Please try again.");
    }
  };

  if (status === "sent") {
    return (
      <div className="bg-[#c7d4ce]/20 border border-[#c7d4ce] rounded-xl p-4 text-center mt-2 mb-2">
        <p className="text-[#50686c] font-medium flex items-center justify-center gap-2">
          <PaperPlaneRight size={16} weight="fill" />
          Email sent successfully to {to}!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#dddcdc] shadow-sm rounded-xl overflow-hidden mt-2 mb-2 flex flex-col font-sans">
      <div className="px-4 py-3 bg-[#eceae6]/50 border-b border-[#dddcdc] flex justify-between items-center">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Draft Email</h4>
        <button 
          onClick={onDiscard}
          className="text-gray-400 hover:text-red-500 transition"
          title="Discard Draft"
        >
          <Trash size={16} weight="bold" />
        </button>
      </div>
      
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          <span className="text-sm font-medium text-gray-400 w-12">To:</span>
          <input 
            type="email" 
            value={to} 
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 text-sm text-gray-800 outline-none bg-transparent"
            placeholder="recipient@example.com"
          />
        </div>
        
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          <span className="text-sm font-medium text-gray-400 w-12">Subj:</span>
          <input 
            type="text" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 text-sm font-medium text-gray-800 outline-none bg-transparent"
            placeholder="Email Subject"
          />
        </div>
        
        <textarea 
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full text-sm text-gray-700 outline-none resize-none min-h-[120px] bg-transparent mt-1 leading-relaxed"
          placeholder="Write your message here..."
        />
        
        {status === "error" && (
          <div className="text-xs text-red-500 font-medium">{errorMsg}</div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-[#dddcdc] flex justify-end">
        <div className="flex gap-2">
          <button 
            onClick={onDiscard}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition rounded-lg hover:bg-gray-200"
            disabled={status === "sending"}
          >
            Discard
          </button>
          <button 
            onClick={handleSend}
            disabled={status === "sending" || !to.trim() || !subject.trim() || !body.trim()}
            className="flex items-center gap-2 bg-[#2b323b] hover:bg-[#3d4651] text-[#eceae6] px-4 py-2 rounded-lg transition shadow-sm font-medium text-sm disabled:opacity-50"
          >
            {status === "sending" ? (
              <>
                <CircleNotch size={16} className="animate-spin" weight="bold" />
                Sending...
              </>
            ) : (
              <>
                <PaperPlaneRight size={16} weight="fill" />
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
