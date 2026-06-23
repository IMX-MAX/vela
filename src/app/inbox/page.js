"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchEmails } from "@/lib/gmail";
import { parseEmailContent } from "@/lib/emailParser";
import { useAuthStore } from "@/lib/store";
import { format, isToday } from "date-fns";
import { Check, Trash, MagnifyingGlass, Command, Link as LinkIcon, Spinner } from "@phosphor-icons/react";
import { checkComposioStatus, initiateComposioConnection, getComposioAccessToken } from "@/app/composioActions";

export default function InboxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "inbox";
  const searchQuery = searchParams.get("search");
  
  const { session, user, setInboxEmails } = useAuthStore();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [needsComposio, setNeedsComposio] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [resolvedToken, setResolvedToken] = useState(null);
  const [authError, setAuthError] = useState(null);

  const observerTarget = useRef(null);

  const fetchEmailBatch = async (token, pageToken = null) => {
    try {
      const data = await fetchEmails(token, 20, filter, searchQuery, pageToken);
      const parsed = data.messages.map((msg) => {
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
      return { parsed, next: data.nextPageToken, error: null };
    } catch (error) {
      console.error("Error fetching emails:", error);
      return { parsed: [], next: null, error: error.message || "Failed to fetch emails" };
    }
  };

  useEffect(() => {
    async function initInbox() {
      const currentInbox = useAuthStore.getState().inboxEmails;
      if (currentInbox && currentInbox.length > 0) {
        setEmails(currentInbox);
        setLoading(false); // Instant render
      } else {
        setLoading(true);
      }
      
      let token = session?.providerAccessToken;

      if (session?.provider === 'google') {
        if (!token) {
           setAuthError("No Google access token found. Please ensure 'Store access tokens' is enabled in your Appwrite Google Provider settings, then sign out and sign in again.");
           setLoading(false);
           return;
        }
      } else if (!token && user) {
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
        setResolvedToken(token);
        const { fetchGoogleProfile } = await import("@/lib/gmail");
        const [{ parsed, next, error }, profile] = await Promise.all([
          fetchEmailBatch(token),
          fetchGoogleProfile(token)
        ]);
        
        if (error) {
          setAuthError(`Gmail API Error: ${error}. Please ensure you checked all permission boxes during Google sign-in.`);
        } else {
          setEmails(parsed);
          setInboxEmails(parsed);
          setNextPageToken(next);
        }
        
        if (profile) {
          useAuthStore.getState().setGoogleProfile(profile);
        }
      }
      setLoading(false);
    }

    if (session) {
      initInbox();
    }
  }, [session, user, filter, searchQuery, setInboxEmails]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !nextPageToken || !resolvedToken) return;
    setLoadingMore(true);
    const { parsed, next } = await fetchEmailBatch(resolvedToken, nextPageToken);
    setEmails((prev) => {
      const newEmails = [...prev, ...parsed];
      setInboxEmails(newEmails);
      return newEmails;
    });
    setNextPageToken(next);
    setLoadingMore(false);
  }, [loadingMore, nextPageToken, resolvedToken, filter, searchQuery, setInboxEmails]);

  const handleDone = async (e, id) => {
    e.stopPropagation();
    setEmails(emails.filter(email => email.id !== id));
    setInboxEmails(emails.filter(email => email.id !== id));
    const { doneEmail } = await import("@/lib/gmail");
    await doneEmail(resolvedToken, id);
  };

  const handleTrash = async (e, id) => {
    e.stopPropagation();
    setEmails(emails.filter(email => email.id !== id));
    setInboxEmails(emails.filter(email => email.id !== id));
    const { trashEmail } = await import("@/lib/gmail");
    await trashEmail(resolvedToken, id);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [handleLoadMore]);

  const handleConnectComposio = async () => {
    setLoading(true);
    const callbackUrl = window.location.origin + "/inbox";
    const res = await initiateComposioConnection(user.$id, callbackUrl);
    
    if (res.connected) {
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
      <div className="flex flex-col items-center justify-center h-full bg-[#eceae6] rounded-2xl relative">
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
            className="w-full bg-[#2b323b] text-white px-4 py-3 rounded-xl font-medium hover:bg-[#50686c] transition disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Connect with Composio"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#eceae6] rounded-2xl relative">
      <div className="h-14 border-b border-[#dddcdc] flex items-center px-6 sticky top-0 bg-[#eceae6]/90 backdrop-blur-sm z-10 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm flex items-center gap-2">
            {searchQuery ? `Search: ${searchQuery}` : "Inbox"}
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
                className={`group flex items-center px-6 py-2.5 cursor-pointer border-b border-[#2b323b]/5 hover:bg-[#dddcdc]/50 transition ${
                  email.isUnread ? "bg-white" : ""
                }`}
              >
                <div className="w-4 flex-shrink-0 flex items-center justify-center">
                  {email.isUnread && <div className="h-2 w-2 rounded-full bg-[#2b323b]"></div>}
                </div>
                
                <div className={`w-48 truncate pr-4 text-[13px] ${email.isUnread ? "font-semibold text-[#2b323b]" : "font-medium text-gray-700"}`}>
                  {email.sender}
                </div>
                
                <div className="flex-1 truncate text-[13px] flex items-center">
                  <span className={`${email.isUnread ? "font-semibold text-[#2b323b]" : "font-medium text-gray-800"}`}>
                    {email.subject}
                  </span>
                  <span className="text-gray-500 mx-2">&mdash;</span>
                  <span className="text-gray-500 truncate">{email.snippet}</span>
                </div>
                
                <div className="flex-shrink-0 ml-4 flex items-center w-24 justify-end">
                  <div className="hidden group-hover:flex items-center gap-2 text-gray-500">
                    <button onClick={(e) => handleDone(e, email.id)} className="hover:text-[#2b323b]"><Check size={16} /></button>
                    <button onClick={(e) => handleTrash(e, email.id)} className="hover:text-[#2b323b]"><Trash size={16} /></button>
                  </div>
                  <div className={`group-hover:hidden text-[12px] ${email.isUnread ? "font-medium text-[#2b323b]" : "text-gray-500"}`}>
                    {formatTime(email.dateStr)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Infinite Scroll Target */}
            {nextPageToken && (
              <div ref={observerTarget} className="py-8 flex justify-center">
                {loadingMore && <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-gray-800"></div>}
              </div>
            )}
            
            {authError && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <p className="text-red-500 font-medium max-w-md text-center">{authError}</p>
                <button 
                  onClick={async () => { await useAuthStore.getState().logout(); window.location.href = "/login"; }} 
                  className="mt-6 px-5 py-2.5 bg-[#2b323b] text-white hover:bg-[#2b323b] transition rounded-lg text-sm font-medium"
                >
                  Sign out and re-login
                </button>
              </div>
            )}
            
            {!authError && emails.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <p>{searchQuery ? "No emails found" : "No messages in Inbox"}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
