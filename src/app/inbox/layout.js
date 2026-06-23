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
import dynamic from "next/dynamic";

const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });

import { Suspense } from "react";

function SidebarNavigation() {
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("filter") || "inbox";
  const inboxEmails = useAuthStore((state) => state.inboxEmails);
  const unreadCount = inboxEmails ? inboxEmails.filter((e) => e.isUnread).length : 0;

  const navItems = [
    { label: "Inbox", icon: Tray, href: "/inbox", count: unreadCount > 0 ? unreadCount : null, active: currentFilter === "inbox" },
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
  const { user, loading, checkAuth, logout, googleProfile } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
            className="flex items-center gap-2 cursor-pointer bg-[#e4e3e0] hover:bg-[#d0cfcb] px-2 py-1.5 rounded-lg transition"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            {googleProfile?.picture ? (
              <img src={googleProfile.picture} alt="Profile" className="h-6 w-6 rounded-full object-cover" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-xs font-semibold text-[#8baba4]">
                {user.name ? user.name.slice(0, 5).toLowerCase() : "usr"}
              </div>
            )}
            <span className="icon-cheveron-down text-xs text-gray-500"></span>
          </div>
          
          {isProfileOpen && (
            <div className="absolute top-12 left-5 w-56 bg-[#f7f7f6] border border-[#e4e3e0] rounded-xl shadow-lg z-50 overflow-hidden text-[15px] py-1 text-gray-800">

              <Link 
                href="/inbox/settings"
                onClick={() => setIsProfileOpen(false)}
                className="w-full text-left px-4 py-2.5 hover:bg-[#eeeae6] transition flex items-center justify-between"
              >
                Settings
                <span className="text-gray-400 text-xs">G then G</span>
              </Link>
              <button 
                onClick={() => {}}
                className="w-full text-left px-4 py-2.5 hover:bg-[#eeeae6] transition flex items-center justify-between"
              >
                Help
                <span className="text-gray-400 text-xs">?</span>
              </button>
              
              <div className="h-px bg-[#e4e3e0] my-1 mx-4"></div>
              
              <button 
                onClick={() => {}}
                className="w-full text-left px-4 py-2.5 hover:bg-[#eeeae6] transition"
              >
                Reset local data
              </button>
              <button 
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 hover:bg-[#eeeae6] transition"
              >
                Sign out
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hover:text-gray-800 transition p-1.5 rounded-md hover:bg-black/5"
            >
              <MagnifyingGlass size={18} weight="bold" />
            </button>
            <Link href="/inbox/compose" className="hover:text-gray-800 transition p-1.5 rounded-md hover:bg-black/5">
              <PencilSimple size={18} weight="bold" />
            </Link>
          </div>
        </div>

        {isSearchOpen && (
          <div className="px-5 mb-4">
            <div className="relative flex items-center">
              <MagnifyingGlass size={16} className="absolute left-3 text-gray-500" />
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                className="w-full bg-[#d0cfcb]/30 text-[13px] text-gray-900 placeholder-gray-500 rounded-md pl-9 pr-3 py-1.5 outline-none focus:bg-[#d0cfcb]/50 transition"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    router.push(`/inbox?search=${encodeURIComponent(e.target.value.trim())}`);
                    setIsSearchOpen(false);
                  } else if (e.key === 'Enter' && !e.target.value.trim()) {
                    router.push(`/inbox`);
                    setIsSearchOpen(false);
                  } else if (e.key === 'Escape') {
                    setIsSearchOpen(false);
                  }
                }}
              />
            </div>
          </div>
        )}

        <Suspense fallback={<nav className="flex-1 space-y-0.5 px-3"></nav>}>
          <SidebarNavigation />
        </Suspense>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden m-2 ml-0 rounded-2xl bg-[#fdfdfc] shadow-sm flex flex-col">
        {children}
      </main>

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette />
    </div>
  );
}
