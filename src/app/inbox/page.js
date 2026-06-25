"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchEmails } from "@/lib/gmail";
import { parseEmailContent } from "@/lib/emailParser";
import { useAuthStore } from "@/lib/store";
import { format, isToday } from "date-fns";
import { Check, Trash, MagnifyingGlass, Command, Link as LinkIcon, Spinner, FadersHorizontal, X, Plus, ToggleLeft, ToggleRight } from "@phosphor-icons/react";
import { EmailListSkeleton } from "@/components/Skeletons";


export default function InboxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "inbox";
  const searchQuery = searchParams.get("search");
  
  const { session, user, setInboxEmails, inboxSplits, setInboxSplits } = useAuthStore();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [needsGoogleConnect, setNeedsGoogleConnect] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [resolvedToken, setResolvedToken] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [hoveredEmailId, setHoveredEmailId] = useState(null);

  useEffect(() => {
    if (!resolvedToken || !user) return;
    
    const checkSnoozed = async () => {
      if (!user.prefs?.snoozedEmails || user.prefs.snoozedEmails.length === 0) return;
      
      const now = Date.now();
      const snoozed = user.prefs.snoozedEmails;
      const toUnsnooze = snoozed.filter(s => s.until <= now);
      
      if (toUnsnooze.length > 0) {
        const { unsnoozeEmail } = await import("@/lib/gmail");
        const { account } = await import("@/lib/appwrite");
        
        let unsnoozedIds = [];
        for (const item of toUnsnooze) {
          let tokenToUse = Array.isArray(resolvedToken) ? resolvedToken[0] : resolvedToken; 
          if (item.emailAddress && user.db?.connectedAccounts) {
            try {
              const connectedAccounts = JSON.parse(user.db.connectedAccounts);
              const acc = connectedAccounts.find(a => a.email === item.emailAddress);
              if (acc && !acc.isPaused) tokenToUse = acc.token;
            } catch(e) {}
          }
          
          try {
            await unsnoozeEmail(tokenToUse, item.id);
            unsnoozedIds.push(item.id);
          } catch(e) {
            console.error("Failed to unsnooze", item.id, e);
          }
        }
        
        if (unsnoozedIds.length > 0) {
          const remaining = snoozed.filter(s => !unsnoozedIds.includes(s.id));
          await account.updatePrefs({ ...user.prefs, snoozedEmails: remaining });
          await useAuthStore.getState().checkAuth();
        }
      }
    };
    
    checkSnoozed();
    const interval = setInterval(checkSnoozed, 60000);
    return () => clearInterval(interval);
  }, [resolvedToken, user]);
  const observerTarget = useRef(null);
  
  const [activeTab, setActiveTab] = useState("Inbox");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCreateSplitModal, setShowCreateSplitModal] = useState(false);
  
  // Custom split form state
  const [newSplit, setNewSplit] = useState({ name: "", desc: "", rules: { domain: "", sender: "", recipient: "", subject: "", custom: "" }, showInImportant: false });

  const [emptyFetches, setEmptyFetches] = useState(0);

  useEffect(() => {
    setEmptyFetches(0);
  }, [activeTab, filter, searchQuery]);

  const getAvailableTabs = useCallback(() => {
    let tabs = [];
    const importantSplit = inboxSplits.find(s => s.id === 'important');
    if (importantSplit && importantSplit.enabled) {
      tabs.push('Important', 'Other');
    } else {
      tabs.push('Inbox');
    }
    
    inboxSplits.filter(s => s.enabled && s.id !== 'important').forEach(s => {
      tabs.push(s.name);
    });
    return tabs;
  }, [inboxSplits]);

  const tabs = getAvailableTabs();
  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
    }
  }, [tabs, activeTab]);

  const filteredEmails = emails.filter(email => {
    if (activeTab === 'Inbox') return true;
    if (activeTab === 'Important') return email.labelIds.includes('IMPORTANT');
    if (activeTab === 'Other') return !email.labelIds.includes('IMPORTANT');
    
    const split = inboxSplits.find(s => s.name === activeTab);
    if (!split) return true;
    
    if (split.id === 'team') {
       const myDomain = user?.email?.split('@')[1];
       return myDomain && email.sender.toLowerCase().includes(myDomain.toLowerCase());
    }
    if (split.id === 'calendar') {
       const subj = email.subject.toLowerCase();
       return subj.includes('invitation') || subj.includes('event') || subj.includes('calendar');
    }
    
    if (split.rules) {
       if (split.rules.domain && !email.sender.toLowerCase().includes(split.rules.domain.toLowerCase())) return false;
       if (split.rules.sender && !email.sender.toLowerCase().includes(split.rules.sender.toLowerCase())) return false;
       if (split.rules.subject && !email.subject.toLowerCase().includes(split.rules.subject.toLowerCase())) return false;
       // We can extend this for recipient/custom later
    }
    
    return true;
  });

  const fetchEmailBatch = async (token, pageToken = null, isRetry = false) => {
    try {
      const data = await fetchEmails(token, 30, filter, searchQuery, pageToken);
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
          labelIds: msg.labelIds || [],
          _accountIndex: msg._accountIndex,
        };
      });
      return { parsed, next: data.nextPageToken, error: null };
    } catch (error) {
      if (!isRetry && (error.message.includes("401") || error.message.includes("Request had invalid authentication credentials") || error.message.includes("Invalid Credentials"))) {
        await useAuthStore.getState().checkAuth();
        const newToken = useAuthStore.getState().session?.providerAccessToken;
        const currentPrimary = Array.isArray(token) ? token[0] : token;
        if (newToken && newToken !== currentPrimary) {
          let additionalAccounts = [];
          try {
            additionalAccounts = JSON.parse(useAuthStore.getState().user?.db?.connectedAccounts || "[]");
          } catch(e) {}
          const validSecondaryTokens = additionalAccounts.filter(a => !a.isPaused).map(a => a.token);
          const newAllTokens = [newToken, ...validSecondaryTokens].filter(Boolean);
          setResolvedToken(newAllTokens);
          return fetchEmailBatch(newAllTokens, pageToken, true);
        }
      }
      console.error("Error fetching emails:", error);
      return { parsed: [], next: null, error: error.message || "Failed to fetch emails" };
    }
  };

  useEffect(() => {
    async function initInbox() {
      await useAuthStore.getState().loadCachedInbox(filter);
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
        setNeedsGoogleConnect(true);
        setLoading(false);
        return;
      }

      if (token) {
        let additionalAccounts = [];
        try {
          additionalAccounts = JSON.parse(useAuthStore.getState().user?.db?.connectedAccounts || "[]");
        } catch(e) {}
        let updatedAccounts = false;
        
        additionalAccounts = await Promise.all(additionalAccounts.map(async (acc) => {
          if (acc.isPaused) return acc;
          if (acc.tokenExpiry && new Date(acc.tokenExpiry) < new Date(Date.now() + 5 * 60000)) { // 5 mins buffer
            if (!acc.refreshToken) {
              updatedAccounts = true;
              return { ...acc, isPaused: true };
            }
            try {
              const res = await fetch('/api/oauth/google/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: acc.refreshToken })
              });
              if (!res.ok) throw new Error('Refresh failed');
              const data = await res.json();
              updatedAccounts = true;
              return { ...acc, token: data.access_token, tokenExpiry: data.expiry_date, isPaused: false };
            } catch (err) {
              console.error("Failed to refresh token for", acc.email, err);
              updatedAccounts = true;
              return { ...acc, isPaused: true };
            }
          }
          return acc;
        }));

        if (updatedAccounts && user) {
          try {
            const { account } = await import('@/lib/appwrite');
            const jwtResponse = await account.createJWT();
            await fetch('/api/user/update-accounts', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtResponse.jwt}`
              },
              body: JSON.stringify({ accounts: additionalAccounts })
            });
          } catch(e) { console.error("Error saving refreshed tokens", e); }
        }

        const validSecondaryTokens = additionalAccounts.filter(a => !a.isPaused).map(a => a.token);
        const allTokens = [token, ...validSecondaryTokens].filter(Boolean);
        setResolvedToken(allTokens);
        const { fetchGoogleProfile } = await import("@/lib/gmail");
        const [{ parsed, next, error }, profile] = await Promise.all([
          fetchEmailBatch(allTokens),
          fetchGoogleProfile(token)
        ]);
        
        if (error) {
          setAuthError(`Gmail API Error: ${error}. Please ensure you checked all permission boxes during Google sign-in.`);
        } else {
          setEmails(parsed);
          setInboxEmails(parsed, filter);
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
  }, [session?.providerAccessToken, user?.$id, filter, searchQuery, setInboxEmails]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !nextPageToken || !resolvedToken) return;
    setLoadingMore(true);
    const { parsed, next } = await fetchEmailBatch(resolvedToken, nextPageToken);
    setEmails((prev) => {
      const newEmails = [...prev, ...parsed];
      setInboxEmails(newEmails, filter);
      return newEmails;
    });
    setNextPageToken(next);
    setLoadingMore(false);
  }, [loadingMore, nextPageToken, resolvedToken, filter, searchQuery, setInboxEmails]);

  useEffect(() => {
    if (!loading && !loadingMore && nextPageToken && filteredEmails.length === 0 && !authError && emptyFetches < 5) {
      setEmptyFetches(prev => prev + 1);
      handleLoadMore();
    }
  }, [loading, loadingMore, nextPageToken, filteredEmails.length, authError, emptyFetches, handleLoadMore]);

  const prefetchEmailBody = useCallback(async (id) => {
    if (!resolvedToken) return;
    try {
      const { getCachedEmailBody, saveCachedEmailBody } = await import("@/lib/db");
      const cached = await getCachedEmailBody(id);
      if (cached) return;
      
      const { fetchEmailDetails } = await import("@/lib/gmail");
      const { parseEmailContent } = await import("@/lib/emailParser");
      const emailObj = emails.find(e => e.id === id) || useAuthStore.getState().inboxEmails?.find(e => e.id === id);
      const tokenToUse = emailObj && emailObj._accountIndex !== undefined && Array.isArray(resolvedToken) ? resolvedToken[emailObj._accountIndex] : (Array.isArray(resolvedToken) ? resolvedToken[0] : resolvedToken);
      const rawMsg = await fetchEmailDetails(tokenToUse, id);
      const parsed = parseEmailContent(rawMsg);
      await saveCachedEmailBody(id, parsed);
    } catch (e) {
      console.error("Prefetch error:", e);
    }
  }, [resolvedToken]);

  useEffect(() => {
    if (emails.length > 0 && resolvedToken) {
      const topEmails = emails.slice(0, 20);
      topEmails.forEach((email) => {
        prefetchEmailBody(email.id);
      });
    }
  }, [emails, resolvedToken, prefetchEmailBody]);

  const handleDone = async (e, id) => {
    e.stopPropagation();
    setEmails(emails.filter(email => email.id !== id));
    setInboxEmails(emails.filter(email => email.id !== id), filter);
    const emailObj = emails.find(email => email.id === id);
    const tokenToUse = emailObj && emailObj._accountIndex !== undefined && Array.isArray(resolvedToken) ? resolvedToken[emailObj._accountIndex] : (Array.isArray(resolvedToken) ? resolvedToken[0] : resolvedToken);
    const { doneEmail } = await import("@/lib/gmail");
    await doneEmail(tokenToUse, id);
  };

  const handleTrash = async (e, id) => {
    if (e) e.stopPropagation();
    setEmails(emails.filter(email => email.id !== id));
    setInboxEmails(emails.filter(email => email.id !== id), filter);
    const emailObj = emails.find(email => email.id === id);
    const tokenToUse = emailObj && emailObj._accountIndex !== undefined && Array.isArray(resolvedToken) ? resolvedToken[emailObj._accountIndex] : (Array.isArray(resolvedToken) ? resolvedToken[0] : resolvedToken);
    const { trashEmail } = await import("@/lib/gmail");
    await trashEmail(tokenToUse, id);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (!hoveredEmailId) return;

      if (e.key.toLowerCase() === 'e' && filter !== 'done') {
        e.preventDefault();
        handleDone(null, hoveredEmailId);
      } else if (e.key === 'Backspace' && filter !== 'trash') {
        e.preventDefault();
        handleTrash(null, hoveredEmailId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hoveredEmailId, filter, emails, resolvedToken, setInboxEmails]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0, rootMargin: '400px' }
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

  const handleConnectGoogle = () => {
    useAuthStore.getState().loginWithGoogle();
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

  if (needsGoogleConnect) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#eceae6] rounded-2xl relative">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-800">
            <LinkIcon size={32} weight="bold" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">Connect your Gmail</h2>
          <p className="text-gray-500 mb-8 text-sm">
            To use Vela's powerful AI features, you need to connect your Google account securely.
          </p>
          <button 
            onClick={handleConnectGoogle}
            disabled={loading}
            className="w-full bg-[#2b323b] text-white px-4 py-3 rounded-xl font-medium hover:bg-[#50686c] transition disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Connect Google Account"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#eceae6] rounded-2xl relative">
      <div className="h-14 border-b border-[#dddcdc] flex items-center px-6 sticky top-0 bg-[#eceae6]/90 backdrop-blur-sm z-10 rounded-t-2xl">
        <div className="flex items-center gap-3">
          {searchQuery || filter !== 'inbox' ? (
            <div className="bg-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm flex items-center gap-2 text-[#2b323b]">
              {searchQuery ? `Search: ${searchQuery}` : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {tabs.map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-[14px] transition font-medium ${activeTab === tab ? 'bg-white shadow-sm text-[#2b323b]' : 'text-gray-500 hover:text-[#2b323b]'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="relative group flex items-center ml-1">
                <button 
                  onClick={() => {
                    const plan = useAuthStore.getState().user?.prefs?.plan || 'free';
                    if (plan === 'pro') {
                      setShowSettingsModal(true);
                    } else {
                      useAuthStore.getState().setShowUpgradeModal(true);
                    }
                  }}
                  className="p-1.5 text-gray-500 hover:text-[#2b323b] hover:bg-[#dcdada] rounded-md transition"
                >
                  <FadersHorizontal size={16} weight="bold" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-max px-3 py-1.5 bg-[#fbfbfc] shadow-md rounded-md text-[13px] font-medium text-[#2b323b] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 border border-gray-100">
                  Split inbox settings
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {loading ? (
          <EmailListSkeleton rows={12} />
        ) : (
          <div className="flex flex-col">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (filter !== 'inbox') params.set('filter', filter);
                  if (searchQuery) params.set('search', searchQuery);
                  const qs = params.toString();
                  if (filter === 'drafts') {
                    router.push(`/inbox/compose?draft=${email.id}`);
                  } else {
                    router.push(`/inbox/email/${email.id}${qs ? `?${qs}` : ''}`);
                  }
                }}
                onMouseEnter={() => { setHoveredEmailId(email.id); prefetchEmailBody(email.id); }}
                onMouseLeave={() => setHoveredEmailId(null)}
                className={`group flex flex-col md:flex-row md:items-center px-4 md:px-6 py-3 md:py-2.5 cursor-pointer border-b border-[#2b323b]/5 hover:bg-[#dddcdc]/50 transition gap-0.5 md:gap-0 ${
                  email.isUnread ? "bg-white" : ""
                }`}
              >
                <div className="flex items-center justify-between md:w-auto w-full">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-4 flex-shrink-0 flex items-center justify-center">
                      {email.isUnread && <div className="h-2 w-2 rounded-full bg-[#2b323b]"></div>}
                    </div>
                    
                    <div className={`md:w-48 truncate pr-4 text-[14px] md:text-[13px] ${email.isUnread ? "font-semibold text-[#2b323b]" : "font-medium text-gray-700"}`}>
                      {email.sender}
                    </div>
                  </div>
                  <div className="md:hidden text-[12px] text-gray-500 flex-shrink-0 ml-2">
                    {formatTime(email.dateStr)}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col md:flex-row md:items-center pl-4 md:pl-0 min-w-0">
                  <div className={`truncate text-[13px] ${email.isUnread ? "font-semibold text-[#2b323b]" : "font-medium text-gray-800"}`}>
                    {email.subject}
                  </div>
                  <span className="text-gray-500 mx-2 hidden md:inline">&mdash;</span>
                  <div className="text-gray-500 truncate text-[13px] md:flex-1">
                    {email.snippet}
                  </div>
                </div>
                
                <div className="hidden md:flex flex-shrink-0 ml-4 items-center w-24 justify-end">
                  <div className="hidden group-hover:flex items-center gap-2 text-gray-500">
                    {filter !== "done" && <button onClick={(e) => handleDone(e, email.id)} className="hover:text-[#2b323b]"><Check size={16} /></button>}
                    {filter !== "trash" && <button onClick={(e) => handleTrash(e, email.id)} className="hover:text-[#2b323b]"><Trash size={16} /></button>}
                  </div>
                  <div className={`group-hover:hidden text-[12px] ${email.isUnread ? "font-medium text-[#2b323b]" : "text-gray-500"}`}>
                    {formatTime(email.dateStr)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Infinite Scroll Target */}
            {nextPageToken && filteredEmails.length > 0 && (
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
            
            {!authError && filteredEmails.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <p>{searchQuery ? "No emails found" : "No messages match this view"}</p>
                {nextPageToken && (
                  <button 
                    onClick={handleLoadMore} 
                    disabled={loadingMore} 
                    className="mt-4 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-[13px] font-medium text-[#2b323b] hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    {loadingMore ? "Searching older messages..." : "Search older messages"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setShowSettingsModal(false)}>
          <div className="bg-[#fbfbfc] rounded-2xl w-[500px] shadow-xl overflow-hidden border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
               <div className="flex items-center gap-2">
                 <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} weight="bold"/></button>
                 <h2 className="font-semibold text-[#2b323b]">Split inbox</h2>
               </div>
            </div>
            <div className="p-2 max-h-[400px] overflow-y-auto">
              {inboxSplits.map(split => (
                <div key={split.id} className="flex items-center justify-between p-4 hover:bg-[#eceae6] rounded-xl transition">
                  <div>
                    <div className="font-medium text-[#2b323b] text-[14px] mb-0.5">{split.name}</div>
                    <div className="text-[13px] text-gray-500">{split.desc?.replace(' Built by Tatem.', '')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => {
                       const newSplits = inboxSplits.map(s => s.id === split.id ? { ...s, enabled: !s.enabled } : s);
                       setInboxSplits(newSplits);
                    }}>
                      {split.enabled ? <ToggleRight size={32} weight="fill" className="text-[#3b82f6]" /> : <ToggleLeft size={32} className="text-gray-300" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-[#eceae6]">
               <button className="px-4 py-2 bg-[#dcdada] hover:bg-[#cfcdcd] rounded-lg text-[13px] font-medium text-[#2b323b] transition">
                 Watch demo
               </button>
               <button onClick={() => {
                 setShowSettingsModal(false);
                 setShowCreateSplitModal(true);
               }} className="px-4 py-2 bg-white hover:bg-gray-50 rounded-lg text-[13px] font-medium text-[#2b323b] shadow-sm border border-gray-200 transition">
                 Create new split
               </button>
            </div>
          </div>
        </div>
      )}

      {showCreateSplitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setShowCreateSplitModal(false)}>
          <div className="bg-[#eceae6] rounded-2xl w-[500px] shadow-xl overflow-hidden border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
               <div className="flex items-center gap-2">
                 <button onClick={() => setShowCreateSplitModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} weight="bold"/></button>
                 <h2 className="font-semibold text-[#2b323b]">Create new split inbox</h2>
               </div>
            </div>
            <div className="p-6 max-h-[500px] overflow-y-auto space-y-6">
               <div>
                 <label className="block text-[13px] font-medium text-[#2b323b] mb-1.5">Split inbox name</label>
                 <input type="text" value={newSplit.name} onChange={e => setNewSplit({...newSplit, name: e.target.value})} placeholder="Split inbox name" className="w-full bg-[#fbfbfc] border border-gray-200 rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#3b82f6]" />
               </div>
               <div>
                 <label className="block text-[13px] font-medium text-[#2b323b] mb-1.5">Split description</label>
                 <input type="text" value={newSplit.desc} onChange={e => setNewSplit({...newSplit, desc: e.target.value})} placeholder="Add a short description" className="w-full bg-[#fbfbfc] border border-gray-200 rounded-lg px-3 py-2 text-[14px] outline-none focus:border-[#3b82f6]" />
               </div>
               
               <div>
                 <label className="block text-[13px] font-medium text-[#2b323b] mb-3">Split rules</label>
                 <div className="space-y-3">
                   <div className="flex items-center gap-4">
                     <span className="text-[13px] font-medium text-[#2b323b] w-16">Domain</span>
                     <input type="text" value={newSplit.rules.domain} onChange={e => setNewSplit({...newSplit, rules: {...newSplit.rules, domain: e.target.value}})} placeholder="email.com" className="flex-1 bg-[#fbfbfc] border border-gray-200 rounded-lg px-3 py-1.5 text-[14px] outline-none focus:border-[#3b82f6]" />
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="text-[13px] font-medium text-[#2b323b] w-16">Sender</span>
                     <input type="text" value={newSplit.rules.sender} onChange={e => setNewSplit({...newSplit, rules: {...newSplit.rules, sender: e.target.value}})} placeholder="name@email.com" className="flex-1 bg-[#fbfbfc] border border-gray-200 rounded-lg px-3 py-1.5 text-[14px] outline-none focus:border-[#3b82f6]" />
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="text-[13px] font-medium text-[#2b323b] w-16">Recipient</span>
                     <input type="text" value={newSplit.rules.recipient} onChange={e => setNewSplit({...newSplit, rules: {...newSplit.rules, recipient: e.target.value}})} placeholder="name@email.com" className="flex-1 bg-[#fbfbfc] border border-gray-200 rounded-lg px-3 py-1.5 text-[14px] outline-none focus:border-[#3b82f6]" />
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="text-[13px] font-medium text-[#2b323b] w-16">Subject</span>
                     <input type="text" value={newSplit.rules.subject} onChange={e => setNewSplit({...newSplit, rules: {...newSplit.rules, subject: e.target.value}})} placeholder="Weekly design updates" className="flex-1 bg-[#fbfbfc] border border-gray-200 rounded-lg px-3 py-1.5 text-[14px] outline-none focus:border-[#3b82f6]" />
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="text-[13px] font-medium text-[#2b323b] w-16">Custom</span>
                     <input type="text" value={newSplit.rules.custom} onChange={e => setNewSplit({...newSplit, rules: {...newSplit.rules, custom: e.target.value}})} placeholder="has:attachment" className="flex-1 bg-[#fbfbfc] border border-gray-200 rounded-lg px-3 py-1.5 text-[14px] outline-none focus:border-[#3b82f6]" />
                   </div>
                 </div>
               </div>
               
               <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                 <span className="text-[14px] font-medium text-[#2b323b]">Show in Important/Other</span>
                 <button onClick={() => setNewSplit({...newSplit, showInImportant: !newSplit.showInImportant})}>
                   {newSplit.showInImportant ? <ToggleRight size={32} weight="fill" className="text-[#3b82f6]" /> : <ToggleLeft size={32} className="text-gray-300" />}
                 </button>
               </div>
            </div>
            <div className="p-4 border-t border-gray-200/50 flex justify-end">
               <button 
                 onClick={() => {
                   if (!newSplit.name) return;
                   const updatedSplits = [...inboxSplits, { id: 'custom_' + Date.now(), name: newSplit.name, desc: newSplit.desc, rules: newSplit.rules, enabled: true }];
                   setInboxSplits(updatedSplits);
                   setShowCreateSplitModal(false);
                   setNewSplit({ name: "", desc: "", rules: { domain: "", sender: "", recipient: "", subject: "", custom: "" }, showInImportant: false });
                 }}
                 disabled={!newSplit.name}
                 className="px-5 py-2 bg-white hover:bg-gray-50 rounded-lg text-[14px] font-medium text-[#2b323b] shadow-sm border border-gray-200 transition disabled:opacity-50"
               >
                 Create split
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
