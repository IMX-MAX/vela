"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
  PencilSimple
} from "@phosphor-icons/react";

export default function InboxLayout({ children }) {
  const router = useRouter();
  const { user, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f2f2f1]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-gray-800"></div>
      </div>
    );
  }

  const navItems = [
    { label: "Inbox", icon: Tray, href: "/inbox", count: 9364, active: true },
    { label: "Starred", icon: Star, href: "/inbox?filter=starred" },
    { label: "Sent", icon: PaperPlaneRight, href: "/inbox?filter=sent" },
    { label: "Drafts", icon: FileText, href: "/inbox?filter=drafts" },
    { label: "Done", icon: CheckCircle, href: "/inbox?filter=done" },
    { label: "Spam", icon: WarningOctagon, href: "/inbox?filter=spam" },
    { label: "Trash", icon: Trash, href: "/inbox?filter=trash" },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#e4e3e0]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col pt-6 pb-4">
        <div className="px-5 mb-6 flex items-center justify-between text-gray-500">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-[#d0cfcb] flex items-center justify-center text-xs font-semibold text-gray-700">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <span className="icon-cheveron-down text-xs"></span>
          </div>
          <div className="flex items-center gap-3">
            <button className="hover:text-gray-800 transition">
              <MagnifyingGlass size={18} weight="bold" />
            </button>
            <Link href="/inbox/compose" className="hover:text-gray-800 transition">
              <PencilSimple size={18} weight="bold" />
            </Link>
          </div>
        </div>

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
              <span>{item.label}</span>
              {item.count && <span className="text-gray-500">{item.count.toLocaleString()}</span>}
            </Link>
          ))}
          
          <div className="pt-4 mt-4 px-3 flex items-center justify-between text-[13px] font-medium text-gray-600 cursor-pointer hover:text-gray-900">
            <span>Labels</span>
            <span className="icon-cheveron-right text-[10px]"></span>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden m-2 ml-0 rounded-2xl bg-[#fdfdfc] shadow-sm flex flex-col">
        {children}
      </main>
    </div>
  );
}
