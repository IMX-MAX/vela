"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { sendEmail } from "@/lib/gmail";
import { ArrowLeft, PaperPlaneRight } from "@phosphor-icons/react";

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
    <div className="flex flex-col h-full bg-[#fdfdfc] rounded-2xl relative overflow-y-auto">
      {/* Top Bar */}
      <div className="h-14 border-b border-[#e4e3e0] flex items-center px-4 sticky top-0 bg-[#fdfdfc]/90 backdrop-blur-sm z-10 rounded-t-2xl">
        <button 
          onClick={() => router.back()} 
          className="p-2 text-gray-500 hover:text-gray-900 transition rounded-md hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="ml-2 font-medium text-gray-900">New Message</div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-8 py-8 flex flex-col h-full">
        <div className="space-y-4 mb-6">
          <div className="border-b border-[#e4e3e0] pb-2">
            <input 
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="To"
              className="w-full outline-none bg-transparent text-[15px] font-medium text-gray-900 placeholder:font-normal placeholder:text-gray-400"
            />
          </div>
          <div className="border-b border-[#e4e3e0] pb-2">
            <input 
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full outline-none bg-transparent text-[15px] font-medium text-gray-900 placeholder:font-normal placeholder:text-gray-400"
            />
          </div>
        </div>

        <textarea 
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your email here..."
          className="w-full flex-1 outline-none bg-transparent resize-none text-[15px] text-gray-800 leading-relaxed font-sans"
        />

        <div className="pt-6 mt-auto flex justify-end">
          <button 
            onClick={handleSend}
            disabled={!to || !body || isSending}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 transition text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSending ? "Sending..." : "Send"}
            <PaperPlaneRight size={16} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}
