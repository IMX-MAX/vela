"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { sendEmail } from "@/lib/gmail";
import { ArrowLeft, PaperPlaneRight, Eye, Code } from "@phosphor-icons/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ComposePage() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
      <div className="h-14 border-b border-[#e4e3e0] flex items-center justify-between px-4 sticky top-0 bg-[#fdfdfc]/90 backdrop-blur-sm z-10 rounded-t-2xl">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()} 
            className="p-2 text-gray-500 hover:text-gray-900 transition rounded-md hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="ml-2 font-medium text-gray-900">New Message</div>
        </div>
        
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setShowPreview(false)}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition ${!showPreview ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Code size={14} /> Write
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition ${showPreview ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Eye size={14} /> Preview
          </button>
        </div>
      </div>

      <div className="w-full px-8 py-8 flex flex-col flex-1 h-full max-w-4xl mx-auto">
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

        <div className="flex-1 min-h-[300px] flex overflow-hidden border border-[#e4e3e0] rounded-xl relative">
          {!showPreview ? (
            <textarea 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email in Markdown..."
              className="w-full h-full p-6 outline-none bg-white resize-none text-[15px] text-gray-800 leading-relaxed font-mono"
            />
          ) : (
            <div className="w-full h-full p-6 bg-white overflow-y-auto prose prose-sm max-w-none prose-gray">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {body || "*Nothing to preview yet...*"}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="pt-6 mt-auto flex justify-end">
          <button 
            onClick={handleSend}
            disabled={!to || !body || isSending}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black transition text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSending ? "Sending..." : "Send"}
            <PaperPlaneRight size={16} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}
