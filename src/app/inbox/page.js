"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { fetchEmails, parseEmailContent } from "@/lib/gmail";
import { format, isToday } from "date-fns";
import { Check, Trash, MagnifyingGlass, Command } from "@phosphor-icons/react";

export default function InboxPage() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmails() {
      if (!session?.providerAccessToken) return;
      try {
        const data = await fetchEmails(session.providerAccessToken, 15);
        const parsed = data.map((msg) => {
          const parsedContent = parseEmailContent(msg);
          // Determine if unread
          const isUnread = msg.labelIds && msg.labelIds.includes("UNREAD");
          // Extract just the name from "Name <email@example.com>"
          let senderName = parsedContent.from;
          if (senderName.includes("<")) {
            senderName = senderName.split("<")[0].replace(/"/g, "").trim();
          }
          
          return {
            id: msg.id,
            isUnread,
            sender: senderName,
            subject: parsedContent.subject,
            snippet: parsedContent.snippet || "",
            dateStr: parsedContent.date,
          };
        });
        setEmails(parsed);
      } catch (error) {
        console.error("Error fetching emails:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      loadEmails();
    }
  }, [session]);

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    if (isToday(date)) {
      return format(date, "h:mm a");
    }
    return format(date, "MMM d");
  };

  return (
    <div className="flex flex-col h-full bg-[#f2f2f1] rounded-2xl relative">
      {/* Top Bar inside the content area */}
      <div className="h-14 border-b border-[#e4e3e0] flex items-center px-6 sticky top-0 bg-[#f2f2f1]/90 backdrop-blur-sm z-10 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm flex items-center gap-2">
            Inbox
          </div>
          <button className="text-gray-400 hover:text-gray-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-gray-800"></div>
          </div>
        ) : (
          <div className="flex flex-col">
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => router.push(`/inbox/email/${email.id}`)}
                className={`group flex items-center px-6 py-2.5 cursor-pointer border-b border-black/5 hover:bg-[#e4e3e0]/50 transition ${
                  email.isUnread ? "bg-white" : ""
                }`}
              >
                {/* Unread dot */}
                <div className="w-4 flex-shrink-0 flex items-center justify-center">
                  {email.isUnread && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
                </div>
                
                {/* Sender */}
                <div className={`w-48 truncate pr-4 text-[13px] ${email.isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                  {email.sender}
                </div>
                
                {/* Subject and Snippet */}
                <div className="flex-1 truncate text-[13px] flex items-center">
                  <span className={`${email.isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-800"}`}>
                    {email.subject}
                  </span>
                  <span className="text-gray-500 mx-2">&mdash;</span>
                  <span className="text-gray-500 truncate">{email.snippet}</span>
                </div>
                
                {/* Hover Actions / Time */}
                <div className="flex-shrink-0 ml-4 flex items-center w-24 justify-end">
                  <div className="hidden group-hover:flex items-center gap-2 text-gray-500">
                    <button className="hover:text-gray-900"><Check size={16} /></button>
                    <button className="hover:text-gray-900"><Trash size={16} /></button>
                    <button className="hover:text-gray-900"><Command size={16} /></button>
                  </div>
                  <div className={`group-hover:hidden text-[12px] ${email.isUnread ? "font-medium text-gray-900" : "text-gray-500"}`}>
                    {formatTime(email.dateStr)}
                  </div>
                </div>
              </div>
            ))}
            {emails.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <p>No messages in Inbox</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
