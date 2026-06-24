"use client";

import Link from "next/link";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-black/[0.04] py-12 text-sm text-[#1e2a3b]/50 bg-transparent">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 font-medium text-[#1e2a3b]/60">
          <img src="/logo.png" alt="Vela Logo" className="h-4 w-auto rounded-sm opacity-60" />
          Vela
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-[#1e2a3b] transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#1e2a3b] transition">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
