"use client";

import Link from "next/link";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-white/[0.04] py-12 text-sm text-gray-500 bg-[#2b323b]">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 font-medium text-gray-400">
          <img src="/logo.png" alt="Vela Logo" className="h-4 w-auto rounded-sm brightness-0 invert opacity-50" />
          Vela
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-gray-300 transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-300 transition">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
