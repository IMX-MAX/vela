"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { fetchEmails, parseEmailContent } from "@/lib/gmail";
import { format, isToday } from "date-fns";
import { Check, Trash, MagnifyingGlass, Command, Link as LinkIcon } from "@phosphor-icons/react";
import { checkComposioStatus, initiateComposioConnection, getComposioAccessToken } from "@/app/composioActions";

export default function InboxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "inbox";
  const { session, user } = useAuthStore();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsComposio, setNeedsComposio] = useState(false);

  useEffect(() => {
    async function initInbox() {
      setLoading(true);
      let token = session?.providerAccessToken;

      // If no Google OAuth token, check Composio MCP
      if (!token && user) {
        const status = await checkComposioStatus(user.$id);
        if (status.connected) {
          const compData = await getComposioAccessToken(user.$id);
          if (compData.connectionId) {
            token = compData.connectionId;
          } else {
            console.warn("Composio connected but no connection ID available.");
          }
        } else {
          setNeedsComposio(true);
          setLoading(false);
          return;
        }
      }

      if (token) {
        try {
          const data = await fetchEmails(token, 15, filter);
          const parsed = data.map((msg) => {
            const parsedContent = parseEmailContent(msg);
            const isUnread = msg.labelIds && msg.labelIds.includes("UNREAD");
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
        }
      }
      setLoading(false);
    }

    if (session) {
      initInbox();
    }
  }, [session, user, filter]);

  const handleConnectComposio = async () => {
    setLoading(true);
    const callbackUrl = window.location.origin + "/inbox";
    const res = await initiateComposioConnection(user.$id, callbackUrl);
    
    if (res.connected) {
      // User is already connected
      window.location.reload();
      return;
    }

    if (res.url) {
      window.location.href = res.url;
    } else {
      setLoading(false);
      if (res.error) {
        alert(`Composio Error: ${res.error}`);
      } else {
        alert("Failed to get Composio redirect URL. Check server logs.");
      }
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    if (isToday(date)) {
      return format(date, "h:mm a");
    }
    return format(date, "MMM d");
  };

  if (needsComposio) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#f2f2f1] rounded-2xl relative">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-800">
            <LinkIcon size={32} weight="bold" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">Connect your Gmail</h2>
          <p className="text-gray-500 mb-8 text-sm">
            To use Vela's powerful AI features, you need to connect your Google account securely via Composio MCP.
          </p>
          <button 
            onClick={handleConnectComposio}
            disabled={loading}
            className="w-full bg-black text-white px-4 py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Connect with Composio"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f2f2f1] rounded-2xl relative">
      <div className="h-14 border-b border-[#e4e3e0] flex items-center px-6 sticky top-0 bg-[#f2f2f1]/90 backdrop-blur-sm z-10 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm flex items-center gap-2">
            Inbox
          </div>
        </div>
      </div>

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
                <div className="w-4 flex-shrink-0 flex items-center justify-center">
                  {email.isUnread && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
                </div>
                
                <div className={`w-48 truncate pr-4 text-[13px] ${email.isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                  {email.sender}
                </div>
                
                <div className="flex-1 truncate text-[13px] flex items-center">
                  <span className={`${email.isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-800"}`}>
                    {email.subject}
                  </span>
                  <span className="text-gray-500 mx-2">&mdash;</span>
                  <span className="text-gray-500 truncate">{email.snippet}</span>
                </div>
                
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
