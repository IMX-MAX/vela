"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { sendEmail } from "@/lib/gmail";
import { Paperclip, X, ArrowsOutSimple } from "@phosphor-icons/react";

export default function ComposePage() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!session?.providerAccessToken || !to || !body) return;
    setIsSending(true);
    try {
      await sendEmail(session.providerAccessToken, to, subject, body);
      router.push("/inbox");
    } catch (error) {
      console.error("Failed to send email", error);
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#f4f3f0] relative overflow-hidden p-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
        {/* Header Controls */}
        <div className="flex items-center justify-end p-2 gap-1 border-b border-gray-100">
          <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition">
            <ArrowsOutSimple size={16} />
          </button>
          <button 
            onClick={() => router.back()}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Input Fields */}
        <div className="flex flex-col flex-1 p-6 space-y-4">
          <div className="flex items-center border-b border-gray-100 pb-2">
            <span className="text-[13px] font-medium text-gray-900 w-12">To</span>
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

          <textarea 
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message..."
            className="w-full flex-1 outline-none bg-transparent resize-none text-[14px] text-gray-700 leading-relaxed font-sans placeholder:text-gray-400 py-2"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 bg-[#fbfbfc] border-t border-gray-100">
          <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition">
            <Paperclip size={18} />
          </button>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Discard
            </button>
            <button 
              onClick={handleSend}
              disabled={!to || !body || isSending}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 px-5 py-1.5 rounded-lg text-[14px] font-medium disabled:opacity-50 transition shadow-sm"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
