"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
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
const UpgradeModal = dynamic(() => import("@/components/UpgradeModal"), { ssr: false });

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
          className={`flex items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-300 ${
            item.active 
              ? "bg-vela-accent text-white shadow-lg shadow-vela-accent/25 translate-x-1" 
              : "text-gray-400 hover:bg-white/5 hover:text-white"
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

import { List } from "@phosphor-icons/react";

function RouteChangeListener({ onChange }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    onChange();
  }, [pathname, searchParams, onChange]);
  return null;
}

export default function InboxLayout({ children }) {
  const router = useRouter();
  const { user, loading, checkAuth, logout, googleProfile, toggleCommandPalette, showUpgradeModal, setShowUpgradeModal } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  if (loading || !user) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-vela-bg">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-vela-accent/20 border-t-vela-accent glow-dot"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-screen overflow-hidden bg-vela-sidebar relative text-slate-200">
      
      {/* Route Change Listener to close mobile menu */}
      <Suspense fallback={null}>
        <RouteChangeListener onChange={closeMobileMenu} />
      </Suspense>

      {/* Mobile Header */}
      <div className="md:hidden flex h-14 flex-shrink-0 items-center justify-between px-4 bg-vela-bg border-b border-vela-border z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 -ml-1.5 rounded-md hover:bg-white/5 text-white transition"
          >
            <List size={22} weight="bold" />
          </button>
          <span className="font-semibold text-[15px] text-white">Vela</span>
        </div>
        <div 
          className="h-8 w-8 rounded-full bg-vela-sidebar flex items-center justify-center text-sm font-semibold text-white shadow-sm overflow-hidden border border-vela-border ring-2 ring-white/5"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          {googleProfile?.picture ? (
            <img src={googleProfile.picture} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            user.name ? user.name.slice(0, 5).toLowerCase() : "usr"
          )}
        </div>
      </div>

      {/* Mobile Profile Dropdown (simplified) */}
      {isProfileOpen && (
        <div className="md:hidden absolute top-14 right-4 w-48 glass-panel rounded-xl shadow-lg z-50 overflow-hidden text-[14px] py-1 text-gray-200">
          <Link href="/inbox/settings" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2.5 hover:bg-white/5 transition-colors">Settings</Link>
          <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors text-red-400">Sign out</button>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop + Mobile Slide-over) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 flex-shrink-0 flex flex-col pt-6 pb-4 bg-vela-sidebar md:bg-transparent border-r border-vela-border/50
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="hidden md:flex px-5 mb-6 items-center justify-between text-gray-500 relative">
          <div 
            className="flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded-lg transition ring-1 ring-white/5"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            {googleProfile?.picture ? (
              <img src={googleProfile.picture} alt="Profile" className="h-6 w-6 rounded-full object-cover" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-vela-sidebar flex items-center justify-center text-xs font-semibold text-white">
                {user.name ? user.name.slice(0, 5).toLowerCase() : "usr"}
              </div>
            )}
            <span className="icon-cheveron-down text-xs text-gray-500"></span>
          </div>
          
          {isProfileOpen && (
            <div className="absolute top-12 left-5 w-56 glass-panel rounded-xl shadow-2xl z-50 overflow-hidden text-[15px] py-1 text-gray-200 border border-white/10 ring-1 ring-black/50">
              <Link 
                href="/inbox/settings"
                onClick={() => setIsProfileOpen(false)}
                className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition flex items-center justify-between"
              >
                Settings
                <span className="text-gray-400 text-xs">G then G</span>
              </Link>
              <button 
                onClick={() => {}}
                className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition flex items-center justify-between"
              >
                Help
                <span className="text-gray-400 text-xs">?</span>
              </button>
              
              <div className="h-px bg-white/10 my-1 mx-4"></div>
              
              <button 
                onClick={() => {}}
                className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition"
              >
                Reset local data
              </button>
              <button 
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition text-red-400"
              >
                Sign out
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => toggleCommandPalette()}
              className="hover:text-white transition p-1.5 rounded-md hover:bg-white/10"
            >
              <MagnifyingGlass size={18} weight="bold" />
            </button>
            <Link href="/inbox/compose" className="hover:text-white transition p-1.5 rounded-md hover:bg-white/10">
              <PencilSimple size={18} weight="bold" />
            </Link>
          </div>
        </div>

        <div className="md:hidden px-5 mb-6 flex items-center justify-between">
           <span className="font-semibold text-lg text-white glow-text">Vela</span>
           <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white transition">
              ✕
           </button>
        </div>

        <Suspense fallback={<nav className="flex-1 space-y-0.5 px-3"></nav>}>
          <SidebarNavigation />
        </Suspense>
      </aside>

      <main className="flex-1 overflow-hidden md:my-3 md:mr-3 md:ml-0 md:rounded-2xl bg-vela-bg shadow-2xl ring-1 ring-white/5 flex flex-col relative z-10">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-gray-800"></div></div>}>
          {children}
        </Suspense>
      </main>

      {/* Command Palette (Ctrl+K / Bottom Pill) */}
      <CommandPalette />

      {/* Upgrade Modal */}
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
    </div>
  );
}
