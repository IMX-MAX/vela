"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { 
  Tray, 
  Star, 
  PaperPlaneRight, 
  FileText, 
  CheckCircle, 
  WarningOctagon, 
  Trash, 
  Tag, 
  MagnifyingGlass, 
  PencilSimple,
  SignOut,
  Link as LinkIcon
} from "@phosphor-icons/react";
import { initiateComposioConnection } from "@/app/composioActions";

import AiSidebar from "./AiSidebar";

import { Suspense } from "react";

function SidebarNavigation() {
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("filter") || "inbox";

  const navItems = [
    { label: "Inbox", icon: Tray, href: "/inbox", count: 9364, active: currentFilter === "inbox" },
    { label: "Starred", icon: Star, href: "/inbox?filter=starred", active: currentFilter === "starred" },
    { label: "Sent", icon: PaperPlaneRight, href: "/inbox?filter=sent", active: currentFilter === "sent" },
    { label: "Drafts", icon: FileText, href: "/inbox?filter=drafts", active: currentFilter === "drafts" },
    { label: "Done", icon: CheckCircle, href: "/inbox?filter=done", active: currentFilter === "done" },
    { label: "Spam", icon: WarningOctagon, href: "/inbox?filter=spam", active: currentFilter === "spam" },
    { label: "Trash", icon: Trash, href: "/inbox?filter=trash", active: currentFilter === "trash" },
  ];

  return (
    <nav className="flex-1 space-y-0.5 px-3">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`flex items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium transition ${
            item.active 
              ? "bg-[#d0cfcb] text-gray-900" 
              : "text-gray-600 hover:bg-[#d0cfcb]/50 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <item.icon size={18} weight={item.active ? "fill" : "regular"} />
            <span>{item.label}</span>
          </div>
          {item.count && <span className="text-gray-500">{item.count.toLocaleString()}</span>}
        </Link>
      ))}
    </nav>
  );
}

export default function InboxLayout({ children }) {
  const router = useRouter();
  const { user, loading, checkAuth, logout } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  const handleManageConnections = async () => {
    setIsConnecting(true);
    const callbackUrl = window.location.origin + "/inbox";
    const res = await initiateComposioConnection(user.$id, callbackUrl);
    
    if (res.connected) {
      alert("You are already connected to Composio.");
      setIsConnecting(false);
    } else if (res.url) {
      window.location.href = res.url;
    } else {
      setIsConnecting(false);
      alert("Failed to connect: " + (res.error || "Unknown error"));
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f2f2f1]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#e4e3e0]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col pt-6 pb-4">
        <div className="px-5 mb-6 flex items-center justify-between text-gray-500 relative">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-[#d0cfcb]/50 px-2 py-1 rounded-md transition"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="h-6 w-6 rounded-full bg-[#d0cfcb] flex items-center justify-center text-xs font-semibold text-gray-700">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <span className="icon-cheveron-down text-xs"></span>
          </div>
          
          {isProfileOpen && (
            <div className="absolute top-10 left-5 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden text-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="font-medium text-gray-900 truncate">{user.name}</div>
                <div className="text-gray-500 text-xs truncate">{user.email}</div>
              </div>
              <Link 
                href="/inbox/settings"
                onClick={() => setIsProfileOpen(false)}
                className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
              >
                <FileText size={16} />
                Settings
              </Link>
              <button 
                onClick={handleManageConnections}
                disabled={isConnecting}
                className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
              >
                <LinkIcon size={16} />
                {isConnecting ? "Connecting..." : "Manage Connections"}
              </button>
              <button 
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 transition flex items-center gap-2"
              >
                <SignOut size={16} />
                Sign out
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Link href="/inbox/compose" className="hover:text-gray-800 transition">
              <PencilSimple size={18} weight="bold" />
            </Link>
          </div>
        </div>

        <div className="px-5 mb-4">
          <div className="relative flex items-center">
            <MagnifyingGlass size={16} className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[#d0cfcb]/30 text-[13px] text-gray-900 placeholder-gray-500 rounded-md pl-9 pr-3 py-1.5 outline-none focus:bg-[#d0cfcb]/50 transition"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  router.push(`/inbox?search=${encodeURIComponent(e.target.value.trim())}`);
                } else if (e.key === 'Enter' && !e.target.value.trim()) {
                  router.push(`/inbox`);
                }
              }}
            />
          </div>
        </div>

        <Suspense fallback={<nav className="flex-1 space-y-0.5 px-3"></nav>}>
          <SidebarNavigation />
        </Suspense>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden m-2 ml-0 rounded-2xl bg-[#fdfdfc] shadow-sm flex flex-col">
        {children}
      </main>

      {/* AI Sidebar */}
      <AiSidebar />
    </div>
  );
}
