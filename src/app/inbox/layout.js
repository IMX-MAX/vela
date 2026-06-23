"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  Link as LinkIcon,
  AddressBook
} from "@phosphor-icons/react";

import dynamic from "next/dynamic";

const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });

import { Suspense } from "react";

function SidebarNavigation() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentFilter = searchParams.get("filter") || "inbox";
  const inboxEmails = useAuthStore((state) => state.inboxEmails);
  const unreadCount = inboxEmails ? inboxEmails.filter((e) => e.isUnread).length : 0;

  const navItems = [
    { label: "Inbox", icon: Tray, href: "/inbox", count: unreadCount > 0 ? unreadCount : null, active: currentFilter === "inbox" && !searchParams.get("contacts") && pathname === "/inbox" },
    { label: "Starred", icon: Star, href: "/inbox?filter=starred", active: currentFilter === "starred" && pathname === "/inbox" },
    { label: "Sent", icon: PaperPlaneRight, href: "/inbox?filter=sent", active: currentFilter === "sent" && pathname === "/inbox" },
    { label: "Drafts", icon: FileText, href: "/inbox?filter=drafts", active: currentFilter === "drafts" && pathname === "/inbox" },
    { label: "Done", icon: CheckCircle, href: "/inbox?filter=done", active: currentFilter === "done" && pathname === "/inbox" },
    { label: "Spam", icon: WarningOctagon, href: "/inbox?filter=spam", active: currentFilter === "spam" && pathname === "/inbox" },
    { label: "Trash", icon: Trash, href: "/inbox?filter=trash", active: currentFilter === "trash" && pathname === "/inbox" },
    { label: "Contacts", icon: AddressBook, href: "/inbox/contacts", active: pathname.startsWith("/inbox/contacts") },
  ];

  return (
    <nav className="flex-1 space-y-0.5 px-3">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`flex items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium transition ${
            item.active 
              ? "bg-[#c7d4ce] text-[#2b323b]" 
              : "text-gray-600 hover:bg-[#c7d4ce]/50 hover:text-[#2b323b]"
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
  const { user, loading, checkAuth, logout, googleProfile, toggleCommandPalette } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      checkAuth();
    };
    initAuth();
  }, [checkAuth, router]);

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
      <div className="flex h-screen items-center justify-center bg-[#eceae6]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#dddcdc]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col pt-6 pb-4">
        <div className="px-5 mb-6 flex items-center justify-between text-gray-500 relative">
          <div 
            className="flex items-center gap-2 cursor-pointer bg-[#dddcdc] hover:bg-[#c7d4ce] px-2 py-1.5 rounded-lg transition"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            {googleProfile?.picture ? (
              <img src={googleProfile.picture} alt="Profile" className="h-6 w-6 rounded-full object-cover" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-xs font-semibold text-[#50686c]">
                {user.name ? user.name.slice(0, 5).toLowerCase() : "usr"}
              </div>
            )}
            <span className="icon-cheveron-down text-xs text-gray-500"></span>
          </div>
          
          {isProfileOpen && (
            <div className="absolute top-12 left-5 w-56 bg-[#eceae6] border border-[#dddcdc] rounded-xl shadow-lg z-50 overflow-hidden text-[15px] py-1 text-gray-800">

              <Link 
                href="/inbox/settings"
                onClick={() => setIsProfileOpen(false)}
                className="w-full text-left px-4 py-2.5 hover:bg-[#eceae6] transition flex items-center justify-between"
              >
                Settings
                <span className="text-gray-400 text-xs">G then G</span>
              </Link>
              <button 
                onClick={() => {}}
                className="w-full text-left px-4 py-2.5 hover:bg-[#eceae6] transition flex items-center justify-between"
              >
                Help
                <span className="text-gray-400 text-xs">?</span>
              </button>
              
              <div className="h-px bg-[#dddcdc] my-1 mx-4"></div>
              
              <button 
                onClick={() => {}}
                className="w-full text-left px-4 py-2.5 hover:bg-[#eceae6] transition"
              >
                Reset local data
              </button>
              <button 
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 hover:bg-[#eceae6] transition"
              >
                Sign out
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => toggleCommandPalette()}
              className="hover:text-gray-800 transition p-1.5 rounded-md hover:bg-[#2b323b]/5"
            >
              <MagnifyingGlass size={18} weight="bold" />
            </button>
            <Link href="/inbox/compose" className="hover:text-gray-800 transition p-1.5 rounded-md hover:bg-[#2b323b]/5">
              <PencilSimple size={18} weight="bold" />
            </Link>
          </div>
        </div>



        <Suspense fallback={<nav className="flex-1 space-y-0.5 px-3"></nav>}>
          <SidebarNavigation />
        </Suspense>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden m-2 ml-0 rounded-2xl bg-[#eceae6] shadow-sm flex flex-col">
        {children}
      </main>

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette />
    </div>
  );
}
