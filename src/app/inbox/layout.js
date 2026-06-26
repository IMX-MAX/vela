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

import { getUsageStatus } from "@/lib/usage";
import dynamic from "next/dynamic";
import { useShortcuts, checkShortcut } from "@/lib/shortcuts";

const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });
const UpgradeModal = dynamic(() => import("@/components/UpgradeModal"), { ssr: false });
const WelcomeUpgradeModal = dynamic(() => import("@/components/WelcomeUpgradeModal"), { ssr: false });

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
  const [showWelcomeUpgradeModal, setShowWelcomeUpgradeModal] = useState(false);
  const usageStatus = user ? getUsageStatus(user) : null;
  const shortcuts = useShortcuts();

  useEffect(() => {
    if (!loading && user) {
      const intent = sessionStorage.getItem("upgradeIntent");
      if (intent === "true") {
        setShowWelcomeUpgradeModal(true);
        sessionStorage.removeItem("upgradeIntent");
      }
    }
  }, [user, loading]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      
      if (checkShortcut(e, shortcuts.compose)) {
        e.preventDefault();
        router.push('/inbox/compose');
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [router, shortcuts.compose]);

  useEffect(() => {
    const initAuth = async () => {
      checkAuth();
    };
    initAuth();
  }, [checkAuth, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  if (loading || !user) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#eceae6]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-screen overflow-hidden bg-[#eceae6] md:bg-[#dddcdc] relative">
      
      {/* Route Change Listener to close mobile menu */}
      <Suspense fallback={null}>
        <RouteChangeListener onChange={closeMobileMenu} />
      </Suspense>

      {/* Mobile Header */}
      <div className="md:hidden flex h-14 flex-shrink-0 items-center justify-between px-4 bg-[#eceae6] border-b border-[#dddcdc] z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 -ml-1.5 rounded-md hover:bg-[#dddcdc] text-[#2b323b] transition"
          >
            <List size={22} weight="bold" />
          </button>
          <span className="font-semibold text-[15px] text-[#2b323b]">Vela</span>
        </div>
        <div 
          className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-sm font-semibold text-[#50686c] shadow-sm overflow-hidden border border-[#dddcdc]"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          <img 
            src={googleProfile?.picture || `https://unavatar.io/${user?.email || ''}?fallback=https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`} 
            alt="Profile" 
            className="h-full w-full object-cover bg-white" 
          />
        </div>
      </div>

      {/* Mobile Profile Dropdown (simplified) */}
      {isProfileOpen && (
        <div className="md:hidden absolute top-14 right-4 w-48 bg-white border border-[#dddcdc] rounded-xl shadow-lg z-50 overflow-hidden text-[14px] py-1 text-gray-800">
          <Link href="/inbox/settings/profile" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2.5 hover:bg-[#eceae6]">Settings</Link>
          <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 hover:bg-[#eceae6] text-red-600">Sign out</button>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-[#2b323b]/40 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop + Mobile Slide-over) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 flex-shrink-0 flex flex-col pt-6 pb-4 bg-[#dddcdc] md:bg-transparent
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="hidden md:flex px-5 mb-16 items-center justify-between text-gray-500 relative">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => toggleCommandPalette()}
              className="hover:text-gray-800 transition p-1.5 -ml-1.5 rounded-md hover:bg-[#2b323b]/5"
            >
              <MagnifyingGlass size={18} weight="bold" />
            </button>
            <Link href="/inbox/compose" className="hover:text-gray-800 transition p-1.5 rounded-md hover:bg-[#2b323b]/5">
              <PencilSimple size={18} weight="bold" />
            </Link>
          </div>

          <div 
            className="flex items-center gap-2 cursor-pointer transition"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <img 
              src={googleProfile?.picture || `https://unavatar.io/${user?.email || ''}?fallback=https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=random`} 
              alt="Profile" 
              className="h-7 w-7 rounded-full object-cover bg-white" 
            />
          </div>
          
          {isProfileOpen && (
            <div className="absolute top-12 right-5 w-56 bg-[#eceae6] border border-[#dddcdc] rounded-xl shadow-lg z-50 overflow-hidden text-[15px] py-1 text-gray-800">
              <Link 
                href="/inbox/settings/profile"
                onClick={() => setIsProfileOpen(false)}
                className="w-full text-left px-4 py-2.5 hover:bg-[#eceae6] transition flex items-center justify-between"
              >
                Settings
                <span className="text-gray-400 text-xs">G then G</span>
              </Link>
              
              <div className="h-px bg-[#dddcdc] my-1 mx-4"></div>
              
              <button 
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 hover:bg-[#eceae6] transition text-red-600"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        <div className="hidden md:block px-5 mb-4">
           <h1 className="text-3xl text-[#2b323b] font-normal">vela</h1>
        </div>

        <div className="md:hidden px-5 mb-6 flex items-center justify-between">
           <span className="font-semibold text-lg text-[#2b323b]">Vela</span>
           <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500">
              ✕
           </button>
        </div>

        <Suspense fallback={<nav className="flex-1 space-y-0.5 px-3"></nav>}>
          <SidebarNavigation />
        </Suspense>

        {usageStatus && usageStatus.plan === "free" && (
          <div className="px-5 mt-auto pt-6 pb-2">
            <div className="bg-[#eceae6] rounded-xl p-4 border border-[#dddcdc] shadow-sm">
              <h4 className="text-[13px] font-semibold text-[#2b323b] mb-1">Free Plan</h4>
              <p className="text-[12px] text-gray-500 mb-4 leading-relaxed">Upgrade to Pro for 60x more AI actions.</p>
              <Link href="/inbox/settings/billing" className="block w-full py-2 bg-[#2b323b] text-white text-[13px] font-medium rounded-lg text-center hover:bg-[#50686c] transition">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        )}

        {usageStatus && usageStatus.plan === "pro" && (
          <div className="px-5 mt-auto pt-6 pb-2">
            <div className="bg-[#eceae6] rounded-xl p-4 border border-[#dddcdc] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[13px] font-semibold text-[#2b323b]">Pro Usage</h4>
                <span className="text-[12px] text-gray-500 font-medium">~{Math.round((usageStatus.current / usageStatus.limit) * 100)}% <span className="text-gray-400">used</span></span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden shadow-inner">
                <div className="bg-[#50686c] h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (usageStatus.current / usageStatus.limit) * 100)}%` }}></div>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Resets daily at midnight</p>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-hidden md:m-2 md:ml-0 md:rounded-2xl bg-[#eceae6] shadow-sm flex flex-col">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-gray-800"></div></div>}>
          {children}
        </Suspense>
      </main>

      {/* Command Palette (Ctrl+K / Bottom Pill) */}
      <CommandPalette />

      {/* Upgrade Modal */}
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
      
      {/* Welcome Upgrade Modal */}
      {showWelcomeUpgradeModal && <WelcomeUpgradeModal onClose={() => setShowWelcomeUpgradeModal(false)} />}
    </div>
  );
}
